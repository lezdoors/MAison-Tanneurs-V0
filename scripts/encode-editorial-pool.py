#!/usr/bin/env python3
"""
Encode the FULL editorial pool — every distinct atelier/lifestyle shot
that might be used somewhere on the site. Once the pool is in /public,
we map each site slot to a UNIQUE file in the manifest below — no slot
shares a file. Includes the never-before-used HF AI-gen shots so we
have material macros for the Materials section without re-using the
brass-awl stitch shot.
"""
from PIL import Image
import shutil
from pathlib import Path

DRIVE = Path("/Users/lezdoors/Library/CloudStorage/GoogleDrive-ryanaoufal@gmail.com/My Drive/Maison Tanneurs/Maison tanneurs Atelier assets ")
USABLE = Path("/Users/lezdoors/Library/CloudStorage/GoogleDrive-ryanaoufal@gmail.com/My Drive/Maison Tanneurs/usable product pics")
REPO = Path("/Users/lezdoors/MAison-Tanneurs-V0/public/tanneurs")

# (source_relpath_or_abs, target, max_w, quality, category)
# Each entry maps to ONE unique slot on the site (see SITE_MAP comment below).
ASSETS = [
    # ─── HERO carousel (3 beats) — already cropped in dune-video.mp4 above ─
    (DRIVE / "Model-white-bag-dune-HD.png", "hero/dune-white-bag.webp",     2400, 82),
    (DRIVE / "Berber-dunes-bag.jpeg",       "hero/berber-dunes-bag.webp",   2400, 82),

    # ─── LIFESTYLE TRIPTYCH (3 distinct settings — tennis · field · dunes) ──
    (DRIVE / "model-tennis-leather bag.png", "lifestyle/tennis-leather.webp",   2200, 82),
    (DRIVE / "Hero-Model-olive tress.png",   "lifestyle/olive-trees.webp",      2200, 82),
    (DRIVE / "Model-bench-desert-HD.png",    "lifestyle/bench-desert.webp",     2200, 82),

    # ─── HERITAGE STRIP (lavender field, full-bleed) ─────────────────────
    (DRIVE / "model-lavander field- 00.png", "lifestyle/lavender-field.webp",   2400, 80),

    # ─── /atelier page chapters — each chapter gets a DISTINCT shot ──────
    (DRIVE / "Hero-model-teal-ryad.png",     "lifestyle/teal-ryad.webp",        2400, 82),
    (DRIVE / "Boutique Wide.png",            "atelier/boutique-wide.webp",      2400, 82),
    (DRIVE / "leather-table-atelier.png",    "atelier/leather-workbench.webp",  1800, 82),
    (DRIVE / "Ateler scene.png",             "atelier/wide-scene.webp",         2400, 82),
    (DRIVE / "Bag in courtyard.png",         "atelier/bag-courtyard.webp",      2400, 82),
    (DRIVE / "Hero-Model-white-ryad.png",    "lifestyle/white-ryad.webp",       2400, 82),

    # ─── CRAFTSMANSHIP (Cut / Stitch / Finish — 3 distinct atelier shots) ──
    (DRIVE / "atelier-leather-table.png",    "atelier/craftsmanship-cut.webp",  1800, 82),
    (DRIVE / "hands-leather work-HD.png",    "atelier/craftsmanship-stitch.webp", 1800, 82),
    (DRIVE / "Leather-bag-hero.png",         "atelier/craftsmanship-finish.webp", 1800, 82),

    # ─── MATERIALS (Leather / Brass / Thread — UNIQUE, NOT a re-use) ────
    # Leather: in-context bag-on-couch — shows the material living
    (DRIVE / "leather-bag-couch.png",        "materials/full-grain.webp",       1600, 82),
    # Brass: B&W macro shot of hands-on-bag → focuses on hardware/material register
    (DRIVE / "BLK&white atelier HD.png",     "materials/solid-brass.webp",      1600, 82),
    # Thread: tooled walnut macro from PRODUCT shots — shows stitching detail
    # WITHOUT re-using the brass-awl scene that lives in Craftsmanship/Stitch
    (USABLE / "medina-crossbody-tooled-walnut-macro/medina-crossbody-tooled-walnut-macro-pdp-04.png",
        "materials/waxed-linen.webp", 1600, 82),

    # ─── EDITORIAL BREAK posters (videos handled by crop-video-watermarks.sh) ─
    # Different from any hero/lifestyle/atelier shot above
    (DRIVE / "caravan-bags.png",             "cinema/caravan-poster.webp",      2400, 82),
    (DRIVE / "model-night-desert-HD.png",    "cinema/night-desert.webp",        2400, 82),
    (DRIVE / "Morning-store-opening.png",    "cinema/morning-store.webp",       2400, 82),

    # ─── EXTRA POOL (kept available — not currently slot-bound) ──────────
    # If a future section needs a fresh shot, pull from these unused.
    (DRIVE / "Hero-bag-rocks-HD (6048x2592).png", "lifestyle/bag-on-rocks.webp", 2400, 82),
    (DRIVE / "Model-rooftop- table-HD.png",  "lifestyle/rooftop-table.webp",    2200, 82),
    (DRIVE / "Hero-model-train.png",         "lifestyle/train.webp",            2200, 82),
    (DRIVE / "Model-bag-dunes.png",          "lifestyle/bag-dunes.webp",        2200, 82),
    (DRIVE / "Hero-model-forest.png",        "lifestyle/forest.webp",           2200, 82),
]

REPO.mkdir(parents=True, exist_ok=True)


def encode(src: Path, rel_dst: str, max_w: int, q: int):
    dst = REPO / rel_dst
    if not src.exists():
        print(f"  MISS  {src.name}  →  {rel_dst}")
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as im:
        im = im.convert("RGB")
        if im.width > max_w:
            ratio = max_w / im.width
            im = im.resize((max_w, int(im.height * ratio)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=q, method=6)
    kb = dst.stat().st_size // 1024
    print(f"  OK    {rel_dst:42}  {im.width}×{im.height}  {kb} KB")
    return True


ok = miss = 0
for src, rel, mw, q in ASSETS:
    if encode(src, rel, mw, q):
        ok += 1
    else:
        miss += 1

print(f"\n{ok} encoded, {miss} missing")
