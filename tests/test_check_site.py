"""Tests for tools/check_site.py (Python standard library only)."""

from __future__ import annotations

import pathlib
import tempfile
import unittest

from tools import check_site

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

GOOD_PAGE = """<!doctype html>
<html lang="en">
<head>
  <title>Example</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body><a href="page.css">style</a></body>
</html>
"""


class ReferenceTests(unittest.TestCase):
    def test_external_references_are_skipped(self) -> None:
        for value in (
            "https://example.com/a.css",
            "//cdn.example.com/a.js",
            "mailto:someone@example.com",
            "tel:+10000000000",
            "data:image/png;base64,AAAA",
            "#section",
            "",
        ):
            self.assertFalse(check_site.is_local_reference(value), value)

    def test_local_references_are_kept(self) -> None:
        for value in ("app.js", "assets/voice-cv.mp3", "../index.html"):
            self.assertTrue(check_site.is_local_reference(value), value)

    def test_query_and_fragment_are_stripped(self) -> None:
        self.assertEqual(check_site.normalise("styles.css?v=2#top"), "styles.css")


class PageTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.root = pathlib.Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def write(self, name: str, content: str) -> pathlib.Path:
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def test_clean_page_has_no_findings(self) -> None:
        self.write("page.css", "body{}")
        page = self.write("index.html", GOOD_PAGE)
        self.assertEqual(check_site.check_page(page, self.root), [])

    def test_missing_local_asset_is_reported(self) -> None:
        page = self.write("index.html", GOOD_PAGE)  # page.css is never created
        findings = check_site.check_page(page, self.root)
        self.assertTrue(any("missing file" in f for f in findings), findings)

    def test_missing_lang_and_title_are_reported(self) -> None:
        page = self.write(
            "index.html",
            '<html><head><meta name="viewport" content="width=device-width"></head>'
            '<body><a href="x.css">x</a></body></html>',
        )
        self.write("x.css", "")
        findings = check_site.check_page(page, self.root)
        self.assertTrue(any("lang attribute" in f for f in findings), findings)
        self.assertTrue(any("<title>" in f for f in findings), findings)

    def test_missing_viewport_is_reported_for_pages(self) -> None:
        page = self.write(
            "index.html",
            '<html lang="en"><head><title>T</title></head>'
            '<body><a href="x.css">x</a></body></html>',
        )
        self.write("x.css", "")
        findings = check_site.check_page(page, self.root)
        self.assertTrue(any("viewport" in f for f in findings), findings)

    def test_placeholder_in_copy_is_reported(self) -> None:
        page = self.write("index.html", GOOD_PAGE.replace("style", "Lorem ipsum"))
        self.write("page.css", "")
        findings = check_site.check_page(page, self.root)
        self.assertTrue(any("draft marker" in f for f in findings), findings)

    def test_html_input_placeholder_attribute_is_not_a_finding(self) -> None:
        page = self.write(
            "index.html",
            GOOD_PAGE.replace(
                "<body>", '<body><input id="q" placeholder="Type a question">'
            ),
        )
        self.write("page.css", "")
        self.assertEqual(check_site.check_page(page, self.root), [])

    def test_iter_pages_skips_hidden_directories(self) -> None:
        self.write("index.html", GOOD_PAGE)
        self.write(".cache/old.html", GOOD_PAGE)
        names = [p.name for p in check_site.iter_pages(self.root)]
        self.assertEqual(names, ["index.html"])


class RepositoryTests(unittest.TestCase):
    def test_live_repository_passes(self) -> None:
        self.assertEqual(check_site.main(["--root", str(REPO_ROOT)]), 0)


if __name__ == "__main__":
    unittest.main()
