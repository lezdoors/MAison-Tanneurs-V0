#!/usr/bin/env python3
"""
Encode each Maison Tanneurs product's curated Hero shot (Drive's
`usable product pics/<slug>/Hero-*.png`) to webp and drop into
/public/tanneurs/products/. These overlay the flat Supabase pdp-white
images on grids + PDPs.

Slug → Drive file resolution is explicit (per `ls` results from 2026-06-03)
because some folders have spaces, suffixed variants (-scale, -macro), and
title-cased duplicates.
"""
from PIL import Image
from pathlib import Path

DRIVE = Path("/Users/lezdoors/Library/CloudStorage/GoogleDrive-ryanaoufal@gmail.com/My Drive/Maison Tanneurs/usable product pics")
OUT = Path("/Users/lezdoors/MAison-Tanneurs-V0/public/tanneurs/products")
OUT.mkdir(parents=True, exist_ok=True)

# slug (AT canonical) → drive subfolder, filename
MAP = {
  "atlas-briefcase-vintage":           ("atlas-briefcase-vintage", "Hero-atlas-briefcase-vintage.png"),
  "atlas-field-briefcase":             ("atlas-field-briefcase", "Hero-atlas-field-briefcase-pdp-04.webp"),
  "atlas-kilim-duffle":                ("Kilim Leather Duffle Bag", "Hero-Kilim Leather Duffle Bag.png"),
  "atlas-kilim-rucksack":              ("atlas-kilim-rucksack", "Hero- atlas-kilim-rucksack-pdp.png"),
  "atlas-messenger-laptop":            ("atlas-messenger-laptop", "Hero-atlas-messenger-laptop.png"),
  "atlas-weekender-cognac":            ("atlas-weekender-cognac", "Hero- atlas-weekender-cognac.png"),
  "classic-cognac-satchel":            ("classic-cognac-satchel", "Hero-classic-cognac-satchel-00.png"),
  "cognac-brogue-backpack":            ("cognac-brogue-backpack", "Hero-cognac-brogue-backpack-pdp-06 copy.png"),
  "expedition-rolltop-cognac":         ("expedition-rolltop-cognac", "Hero- expedition-rolltop-cognac.png"),
  "expedition-rolltop-noir":           ("expedition-rolltop-noir", "Hero-expedition-rolltop-noir.png"),
  "explorer-rolltop-cognac":           ("explorer-rolltop-cognac", "Hero-explorer-rolltop-cognac -1.png"),
  "heritage-rucksack":                 ("heritage-rucksack", "Hero-heritage-rucksack hero.png"),
  "marrakech-tote-cognac":             ("marrakech-tote-cognac", "Hero-marrakech-tote-cognac.png"),
  "medina-cargo-rucksack-cognac":      ("medina-cargo-rucksack-cognac", "Hero-medina-cargo-rucksack-cognac.png"),
  "medina-crossbody-clasp-teal":       ("medina-crossbody-clasp-teal", "Hero-medina-crossbody-clasp-teal.png"),
  "medina-crossbody-cognac":           ("medina-crossbody-cognac", "Hero-medina-crossbody-cognac-pdp-white.png"),
  "medina-crossbody-envelope":         ("medina-crossbody-envelope", "Hero-medina-crossbody-envelope -1.png"),
  "medina-crossbody-tooled-walnut":    ("medina-crossbody-tooled-walnut-macro", "Hero- medina-crossbody-tooled-walnut-macro.png"),
  "medina-duffle":                     ("medina-duffle-scale", "Hero-medina-duffle-scale.png"),
  "medina-market-tote-cognac":         ("medina-market-tote-cognac", "Hero-medina-market-tote-cognac.png"),
  "medina-rucksack-drawstring":        ("medina-rucksack-drawstring", "Hero- medina-rucksack-drawstring.png"),
  "medina-rucksack-flap-chocolate":    ("medina-rucksack-flap-chocolate", "Hero-medina-rucksack-flap-chocolate.png"),
  "medina-saddlebag-tooled-cognac":    ("medina-saddlebag-tooled-cognac", "Hero-medina-saddlebag-tooled-cognac.png"),
  "medina-zigzag-tote-chocolate":      ("medina-zigzag-tote-chocolate", "Hero-medina-zigzag-tote-chocolate.png"),
  "oasis-weekender-oxblood":           ("oasis-weekender-oxblood", "Hero- Oasis Weekender · Oxblood.png"),
  "vintage-buckle-backpack":           ("vintage-buckle-backpack", "Hero-vintage-buckle-backpack.png"),
  "vintage-satchel-light-brown":       ("vintage-satchel-light-brown", "Hero- vintage-satchel-light-brown-pdp.png"),
  "woven-leather-backpack":            ("woven-leather-backpack", "Hero- woven-leather-backpack-pdp.png"),
}

MAX_W = 1600
QUALITY = 84

ok = miss = 0
for slug, (folder, fname) in MAP.items():
    src = DRIVE / folder / fname
    dst = OUT / f"{slug}.webp"
    if not src.exists():
        # Try fallback: any file matching "Hero" in the folder
        alts = sorted((DRIVE / folder).glob("Hero*")) if (DRIVE / folder).exists() else []
        if alts:
            src = alts[0]
        else:
            print(f"  MISS  {slug:42}  ← {folder}/{fname}")
            miss += 1
            continue
    with Image.open(src) as im:
        im = im.convert("RGB")
        if im.width > MAX_W:
            ratio = MAX_W / im.width
            im = im.resize((MAX_W, int(im.height * ratio)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=QUALITY, method=6)
    kb = dst.stat().st_size // 1024
    print(f"  OK    {slug:42}  {im.width}×{im.height}  {kb} KB")
    ok += 1

print(f"\n{ok} encoded, {miss} missing")
