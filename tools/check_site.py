#!/usr/bin/env python3
"""Static-site integrity checks for this portfolio (Python standard library only).

The site is plain HTML/CSS/JS served from GitHub Pages, so there is no build step
to catch broken references. This script is that catch: it parses every HTML page,
resolves each local `href` / `src` / `poster` reference against the working tree,
and fails when a page points at a file that does not exist, is missing required
metadata, or still contains draft markers.

Usage:
    python3 tools/check_site.py            # check the repository root
    python3 tools/check_site.py --root DIR # check another directory
Exit code 0 = all checks passed, 1 = at least one finding.
"""

from __future__ import annotations

import argparse
import pathlib
import re
import sys
from html.parser import HTMLParser

# Attributes that can point at a local file.
REF_ATTRS = ("href", "src", "poster")

# Schemes and prefixes that are not local files.
EXTERNAL_PREFIXES = ("//", "mailto:", "tel:", "data:", "javascript:", "sms:")
SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.\-]*:")

# Draft markers that must never ship. Scanned in text nodes only, so real HTML
# attributes such as <input placeholder="Type a question"> are not false positives.
PLACEHOLDER_RE = re.compile(
    r"(lorem ipsum|\[insert|\[todo|tbd\b|to be decided|fixme|placeholder text)",
    re.IGNORECASE,
)

# Pages that must carry a viewport meta tag (print-only sources are exempt).
PRINT_ONLY = {"cv.html"}


class PageParser(HTMLParser):
    """Collect local references, text nodes and required metadata from one page."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[tuple[str, str]] = []  # (attribute, value)
        self.text: list[str] = []
        self.lang: str | None = None
        self.title: str | None = None
        self.has_viewport = False
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {k.lower(): (v or "") for k, v in attrs}
        if tag == "html":
            self.lang = attr_map.get("lang", "").strip() or None
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            if attr_map.get("name", "").lower() == "viewport":
                self.has_viewport = True

        for attr in REF_ATTRS:
            value = attr_map.get(attr, "").strip()
            if value:
                self.refs.append((attr, value))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title = (self.title or "") + data.strip()
        stripped = data.strip()
        if stripped:
            self.text.append(stripped)


def is_local_reference(value: str) -> bool:
    """True when a reference should resolve to a file in this repository."""
    if not value or value.startswith("#"):
        return False
    if value.startswith(EXTERNAL_PREFIXES):
        return False
    if SCHEME_RE.match(value):
        return False
    return True


def normalise(value: str) -> str:
    """Drop the query string and fragment; percent-decode the simple cases."""
    path = value.split("#", 1)[0].split("?", 1)[0]
    return path.replace("%20", " ")


def check_page(path: pathlib.Path, root: pathlib.Path) -> list[str]:
    """Return a list of findings for one HTML file (empty list = clean)."""
    findings: list[str] = []
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))

    rel = path.relative_to(root)

    if not parser.lang:
        findings.append(f"{rel}: <html> is missing a lang attribute")
    if not (parser.title or "").strip():
        findings.append(f"{rel}: <title> is missing or empty")
    if path.name not in PRINT_ONLY and not parser.has_viewport:
        findings.append(f"{rel}: viewport meta tag is missing")

    checked = 0
    for attr, value in parser.refs:
        if not is_local_reference(value):
            continue
        target = (path.parent / normalise(value)).resolve()
        checked += 1
        if not target.exists():
            findings.append(f"{rel}: {attr}=\"{value}\" points at a missing file")

    for chunk in parser.text:
        match = PLACEHOLDER_RE.search(chunk)
        if match:
            findings.append(
                f"{rel}: draft marker {match.group(0)!r} found in visible copy"
            )

    if checked == 0 and path.name not in PRINT_ONLY:
        findings.append(f"{rel}: no local references found (is this page complete?)")

    return findings


def iter_pages(root: pathlib.Path) -> list[pathlib.Path]:
    """Every HTML page in the repository, excluding hidden and vendor folders."""
    return sorted(
        p
        for p in root.rglob("*.html")
        if not any(part.startswith(".") or part == "node_modules" for part in p.parts)
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        default=str(pathlib.Path(__file__).resolve().parent.parent),
        help="repository root to check (default: parent of tools/)",
    )
    args = parser.parse_args(argv)
    root = pathlib.Path(args.root).resolve()

    pages = iter_pages(root)
    if not pages:
        print(f"FAIL: no HTML pages found under {root}")
        return 1

    findings: list[str] = []
    for page in pages:
        findings.extend(check_page(page, root))

    print(f"Checked {len(pages)} page(s): {', '.join(p.name for p in pages)}")
    if findings:
        print(f"FAIL: {len(findings)} finding(s)")
        for finding in findings:
            print(f"  - {finding}")
        return 1

    print("PASS: all local references resolve and required metadata is present")
    return 0


if __name__ == "__main__":
    sys.exit(main())
