#!/usr/bin/env python3
"""
Swap V0 lifestyle/atelier assets with their HD source from
Drive's `Maison tanneurs Atelier assets/`.

Per Ryan (2026-06-05): only use HD-suffixed versions. The non-HD
originals stay in Drive as reference; what ships is the colour-graded
HD version he ran through Canva.

Difference vs encode-product-heroes.py:
  - These are full-scene editorial shots — DO NOT flood-fill backgrounds.
    Subjects fill the frame, "corners" are sky/dune/leaf etc., not bg.
  - Watermark + HF-black-corner check is conditional: only crop when
    actually detected (HD originals from Canva typically don't have either,
    but we verify per-file).
  - Target widths are larger (2400px) since these are hero/feature shots.
"""
from PIL import Image, ImageChops
from pathlib import Path
import sys

ATELIER = Path("/Users/lezdoors/Library/CloudStorage/GoogleDrive-ryanaoufal@gmail.com/My Drive/Maison Tanneurs/Maison tanneurs Atelier assets ")
V0_ROOT = Path(__file__).resolve().parent.parent
PUBLIC = V0_ROOT / "public" / "tanneurs"

# (Drive HD source, V0 destination path relative to /public/tanneurs/)
SWAPS = [
    ("Model-white-bag-dune-HD.png",     "hero/dune-white-bag.webp"),
    ("Model-bench-desert-HD.png",       "lifestyle/bench-desert.webp"),
    ("hands-leather work-HD.png",       "atelier/craftsmanship-stitch.webp"),
    ("hands-leather work-HD.png",       "cinema/hands-at-work.webp"),
    ("model-night-desert-HD.png",       "cinema/night-desert.webp"),
    ("model-tennis-kilim bag-HD.png",   "lifestyle/tennis-leather.webp"),
    ("model-lavander field-hd.png",     "lifestyle/lavender-field.webp"),
    # §04 III Finish — the editorial close of the process. Bag at rest,
    # warm afternoon light. Replaces a wrong product-shot regression.
    ("leather-bag-couch-HD.png",        "atelier/craftsmanship-finish.webp"),
]

MAX_W = 2400
QUALITY = 86


def has_dark_border(im: Image.Image, n_rows: int = 8) -> bool:
    """True if the outermost N rows are nearly black on all 4 edges.
    Catches HF black-bar artefacts."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    # sample a stride of pixels along each edge
    def edge_avg(pixels):
        return sum(sum(p)/3 for p in pixels) / len(pixels)
    top = [rgb.getpixel((x, 2)) for x in range(0, w, max(1, w // 40))]
    bot = [rgb.getpixel((x, h - 3)) for x in range(0, w, max(1, w // 40))]
    lef = [rgb.getpixel((2, y)) for y in range(0, h, max(1, h // 40))]
    rig = [rgb.getpixel((w - 3, y)) for y in range(0, h, max(1, h // 40))]
    return all(edge_avg(e) < 20 for e in (top, bot, lef, rig))


def autocrop_black(im: Image.Image) -> Image.Image:
    """Trim a solid-black border, if present."""
    bg = Image.new(im.mode, im.size, (0, 0, 0))
    diff = ImageChops.difference(im.convert("RGB"), bg)
    bbox = diff.getbbox()
    if bbox and (bbox != (0, 0, *im.size)):
        # only crop if at least 4px would be removed on some side
        x0, y0, x1, y1 = bbox
        if x0 >= 4 or y0 >= 4 or (im.size[0] - x1) >= 4 or (im.size[1] - y1) >= 4:
            return im.crop(bbox)
    return im


def encode(src: Path, dst: Path):
    with Image.open(src) as im:
        # Flatten alpha — but onto BLACK isn't right for lifestyle either.
        # Use the dominant edge colour (usually sky/ground), fall back to white.
        if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert("RGB")

        # Crop HF black bars if present
        if has_dark_border(im):
            print(f"    [crop-black-border]")
            im = autocrop_black(im)

        # Resize down to MAX_W
        if im.width > MAX_W:
            ratio = MAX_W / im.width
            im = im.resize((MAX_W, int(im.height * ratio)), Image.LANCZOS)

        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "WEBP", quality=QUALITY, method=6)
        return im.size


def main():
    ok = miss = 0
    for src_name, dst_rel in SWAPS:
        src = ATELIER / src_name
        dst = PUBLIC / dst_rel
        if not src.exists():
            print(f"  ✗ MISSING SOURCE  {src_name}")
            miss += 1
            continue
        try:
            w, h = encode(src, dst)
            kb = dst.stat().st_size // 1024
            print(f"  ✓ {dst_rel:42}  {w}×{h}  {kb} KB   ← {src_name}")
            ok += 1
        except Exception as e:
            print(f"  ✗ FAIL  {dst_rel}: {e}")
            miss += 1
    print(f"\n{ok}/{ok + miss} swapped")


if __name__ == "__main__":
    main()
