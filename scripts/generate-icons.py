#!/usr/bin/env python3
"""Regenerate PWA / favicon PNGs.

- clearstack-app-icon.svg -> apple-touch-icon + manifest/favicon sizes (glassy blue bg)
- clearstack-mark.svg -> clearstack-logo.png (transparent mark for in-card UI)
"""

from __future__ import annotations

import io
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
APP_ICON_SVG = ROOT / "clearstack-app-icon.svg"
MARK_SVG = ROOT / "clearstack-mark.svg"

APP_ICON_OUTPUTS = {
    "apple-touch-icon.png": 180,
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "favicon-180x180.png": 180,
    "favicon-192x192.png": 192,
    "favicon-512x512.png": 512,
}


def render_svg(svg_path: Path, size: int) -> Image.Image:
    png_bytes = cairosvg.svg2png(
        url=str(svg_path),
        output_width=size,
        output_height=size,
    )
    return Image.open(io.BytesIO(png_bytes)).convert("RGBA")


def render_mark_logo(size: int) -> Image.Image:
    """Square transparent logo for in-card display."""
    png_bytes = cairosvg.svg2png(
        url=str(MARK_SVG),
        output_width=size,
        output_height=int(size * 2316 / 3000),
    )
    mark = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - mark.width) // 2
    y = (size - mark.height) // 2
    canvas.paste(mark, (x, y), mark)
    return canvas


def write_ico(sizes: list[int]) -> None:
    images = [render_svg(APP_ICON_SVG, size) for size in sizes]
    images[0].save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=[(img.width, img.height) for img in images],
        append_images=images[1:],
    )


def main() -> None:
    if not APP_ICON_SVG.exists():
        raise SystemExit(f"Missing source SVG: {APP_ICON_SVG}")
    if not MARK_SVG.exists():
        raise SystemExit(f"Missing source SVG: {MARK_SVG}")

    for filename, size in APP_ICON_OUTPUTS.items():
        img = render_svg(APP_ICON_SVG, size)
        img.save(ROOT / filename, format="PNG", optimize=True)
        print(f"wrote {filename} ({size}x{size})")

    logo = render_mark_logo(512)
    logo.save(ROOT / "clearstack-logo.png", format="PNG", optimize=True)
    print("wrote clearstack-logo.png (512x512, transparent)")

    write_ico([16, 32, 48])
    print("wrote favicon.ico")


if __name__ == "__main__":
    main()
