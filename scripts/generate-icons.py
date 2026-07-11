#!/usr/bin/env python3
"""Regenerate PWA / favicon PNGs from clearstack-app-icon.svg."""

from __future__ import annotations

import io
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "clearstack-app-icon.svg"

OUTPUTS = {
    "clearstack-logo.png": 512,
    "apple-touch-icon.png": 180,
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "favicon-180x180.png": 180,
    "favicon-192x192.png": 192,
    "favicon-512x512.png": 512,
}


def render_png(size: int) -> Image.Image:
    png_bytes = cairosvg.svg2png(
        url=str(SVG),
        output_width=size,
        output_height=size,
    )
    return Image.open(io.BytesIO(png_bytes)).convert("RGBA")


def write_ico(sizes: list[int]) -> None:
    images = [render_png(size) for size in sizes]
    images[0].save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=[(img.width, img.height) for img in images],
        append_images=images[1:],
    )


def main() -> None:
    if not SVG.exists():
        raise SystemExit(f"Missing source SVG: {SVG}")

    for filename, size in OUTPUTS.items():
        img = render_png(size)
        img.save(ROOT / filename, format="PNG", optimize=True)
        print(f"wrote {filename} ({size}x{size})")

    write_ico([16, 32, 48])
    print("wrote favicon.ico")


if __name__ == "__main__":
    main()
