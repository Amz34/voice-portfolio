#!/usr/bin/env python3
"""Render every spoken asset for the voice portfolio from assets/voice/kb.js.

  python3 tools/gen_voice.py            # generate what's missing
  python3 tools/gen_voice.py --force    # re-render everything
  python3 tools/gen_voice.py --check    # verify manifest only (no synth)

Voices: en-IN-PrabhatNeural  (South-Asian male, English)
        ar-SA-HamedNeural    (Saudi male, Arabic)
"""
from __future__ import annotations

import argparse
import json
import pathlib
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICE_DIR = ROOT / "assets" / "voice"
KB = ROOT / "assets" / "voice" / "kb.js"
EDGE = "edge-tts"


def load_kb() -> dict:
    raw = KB.read_text(encoding="utf-8")
    return json.loads(raw[raw.index("{"): raw.rindex(";")])


def job_list(kb: dict) -> list[dict]:
    en, ar = kb["voices"]["en"], kb["voices"]["ar"]
    rc_en, rc_ar = kb["voices"].get("rate_en", "+0%"), kb["voices"].get("rate_ar", "+0%")
    jobs = []
    for it in kb["items"]:
        jobs.append(dict(out=VOICE_DIR / f"{it['id']}.mp3", voice=en, rate=rc_en, text=it["a"]))
        jobs.append(dict(out=VOICE_DIR / f"{it['id']}-ar.mp3", voice=ar, rate=rc_ar, text=it["aa"]))
    fb = kb["fallback"]
    jobs.append(dict(out=VOICE_DIR / "fallback.mp3", voice=en, rate=rc_en, text=fb["a"]))
    jobs.append(dict(out=VOICE_DIR / "fallback-ar.mp3", voice=ar, rate=rc_ar, text=fb["aa"]))
    jobs.append(dict(out=ROOT / "assets" / "voice-cv.mp3", voice=en, rate=rc_en, text=kb["cv"]["en"]))
    jobs.append(dict(out=ROOT / "assets" / "voice-cv-ar.mp3", voice=ar, rate=rc_ar, text=kb["cv"]["ar"]))
    return jobs


def render(job: dict, force: bool) -> tuple[str, str]:
    out: pathlib.Path = job["out"]
    if out.exists() and not force and out.stat().st_size > 800:
        return out.name, "skip"
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".tmp.mp3")
    cmd = [EDGE, "--voice", job["voice"], f"--rate={job['rate']}",
           "--text", job["text"], "--write-media", str(tmp)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if r.returncode or not tmp.exists() or tmp.stat().st_size < 800:
        return out.name, f"FAIL {r.stderr.strip()[:120]}"
    tmp.replace(out)
    return out.name, f"ok {out.stat().st_size // 1024}K"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--workers", type=int, default=4)
    a = ap.parse_args()

    kb = load_kb()
    jobs = job_list(kb)
    missing = [j["out"] for j in jobs if not j["out"].exists()]
    if a.check:
        print(f"{len(jobs)} assets · {len(jobs) - len(missing)} present · {len(missing)} missing")
        for m in missing:
            print("  missing:", m.relative_to(ROOT))
        return 1 if missing else 0

    done = fails = 0
    with ThreadPoolExecutor(max_workers=a.workers) as pool:
        for name, status in pool.map(lambda j: render(j, a.force), jobs):
            if status.startswith("FAIL"):
                fails += 1
                print(f"  {name:<22} {status}")
            else:
                done += 1
    total = sum(j["out"].stat().st_size for j in jobs if j["out"].exists())
    print(f"{done}/{len(jobs)} rendered ({fails} failed) · {total / 1024:.0f} KB total")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
