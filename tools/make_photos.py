#!/usr/bin/env python3
"""Build the site portraits from the supplied branded photo.

  src  : --src (default: the attached badge image)
  out  : assets/photo-aamir.jpg  (hero, square crop around the circle)
         assets/avatar-aamir.png (round, transparent, head-and-shoulders crop)
         assets/photo-aamir.jpg is also used as the agent + voice-CV avatar.
"""
from __future__ import annotations

import argparse
import pathlib

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_SRC = "/home/ubuntu/.hermes/cache/images/img_3abc24207631.jpg"


def circle_square(im: Image.Image) -> Image.Image:
    """Crop to the largest square touching top/bottom, centred on the disc."""
    w, h = im.size
    side = h if h <= w else w
    left = (w - side) // 2
    return im.crop((left, 0, left + side, side))


def round_png(im: Image.Image, box: tuple[int, int, int, int], size: int, pad: float = 0.02) -> Image.Image:
    """Circular, transparent PNG from a region of the source image."""
    face = im.crop(box).convert("RGBA").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse(
        [int(size * 4 * pad), int(size * 4 * pad),
         int(size * 4 * (1 - pad)), int(size * 4 * (1 - pad))], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    face.putalpha(mask)
    return face


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=DEFAULT_SRC)
    a = ap.parse_args()

    src = Image.open(a.src).convert("RGB")
    w, h = src.size

    hero = circle_square(src).resize((900, 900), Image.LANCZOS)
    hero.save(ROOT / "assets" / "photo-aamir.jpg", quality=88, optimize=True, progressive=True)

    # head-and-shoulders region of the disc (upper-centre), for round avatars
    avatar = round_png(src, (int(w * .30), int(h * .02), int(w * .70), int(h * .42)), 320)
    avatar.save(ROOT / "assets" / "avatar-aamir.png", optimize=True)

    # social/poster card keeps the branded frame, 16:9 letterbox
    poster = Image.new("RGB", (1600, 900), (6, 11, 20))
    art = circle_square(src).resize((880, 880), Image.LANCZOS)
    poster.paste(art, ((1600 - 880) // 2, 10))
    poster.save(ROOT / "assets" / "portfolio-poster.jpg", quality=84, optimize=True)

    for p in ("photo-aamir.jpg", "avatar-aamir.png", "portfolio-poster.jpg"):
        f = ROOT / "assets" / p
        print(f"{p:<24} {f.stat().st_size // 1024}K")


if __name__ == "__main__":
    main()
