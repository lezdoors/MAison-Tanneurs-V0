#!/usr/bin/env python3
"""
Encode each Drive folder's curated Hero shot into a web-ready WebP under
/public/tanneurs/products/<slug>.webp. V0's lib/supabase.ts swaps these in
on the front for any Supabase slug present here.

Rule (per Ryan, 2026-06-05):
  The Drive folder is the source of truth. Inside each folder, the file
  starting with "Hero" is THE product hero. No hand-maintained MAP — we
  walk the Drive tree and pick the Hero file automatically.

Resolution per folder:
  1. Prefer exact match: Hero-<folder>.{png,webp,jpg,jpeg}
  2. Fall back to first file starting with "Hero" (handles leading-space
     filenames, suffixed variants like "-pdp", "-00 copy.png", etc.)

Transparency fix:
  Many Drive Heroes are PNGs with transparent backgrounds. Pillow's
  `.convert("RGB")` fills transparency with BLACK by default — that's
  what produced 5 black-cornered cards on V0. We paste the source onto
  a WHITE canvas first so flattened output always has a clean white bg.

Slug normalisation:
  Drive folders mix kebab-case ("medina-duffle-scale") and title-case
  with spaces ("Kilim Leather Duffle Bag"). We lowercase + replace runs
  of whitespace with "-". The Supabase slug list (queried below) is the
  arbiter of which generated WebPs V0 actually uses.

Supabase-slug aliases:
  A few Supabase slugs don't match any Drive folder exactly — Drive
  carries a more specific variant. Resolved via SUPABASE_ALIASES.
"""
from PIL import Image
from pathlib import Path
import re

DRIVE = Path("/Users/lezdoors/Library/CloudStorage/GoogleDrive-ryanaoufal@gmail.com/My Drive/Maison Tanneurs/usable product pics")
OUT = Path(__file__).resolve().parent.parent / "public" / "tanneurs" / "products"
OUT.mkdir(parents=True, exist_ok=True)

MAX_W = 1600
QUALITY = 86  # bumped 84 → 86; white bg compresses well

# Supabase slug → Drive folder name. Only listed when they differ.
# Supabase carries the generic slug, Drive carries the specific variant
# we're actually shooting/shipping right now.
SUPABASE_ALIASES = {
    "atlas-kilim-duffle":              "atlas-kilim-duffle-rouge",
    "medina-crossbody-tooled-walnut":  "medina-crossbody-tooled-walnut-macro",
    "medina-duffle":                   "medina-duffle-scale",  # scale > macro for hero
}

# These are folders we explicitly DON'T encode — staging, screenshots,
# duplicate variants already covered by another folder.
SKIP_FOLDERS = {
    "Bags Screen shots",
    # SEO-named long-slug duplicate of an existing product; skip to keep
    # /public/tanneurs/products/ readable.
    "Classic Leather Duffle Bag – Handcrafted Weekend Travel Essential",
}


def slugify(folder_name: str) -> str:
    """Drive folder name → V0 slug. Lowercase, kebab-case, no double-dashes."""
    s = folder_name.lower().strip()
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s


def find_hero(folder: Path) -> Path | None:
    """Inside a Drive folder, return the curated Hero file or None.

    Prefers exact `Hero-<folder>.<ext>`, falls back to any `Hero*` file.
    """
    name = folder.name
    exts = (".png", ".webp", ".jpg", ".jpeg")
    # Exact match first
    for ext in exts:
        cand = folder / f"Hero-{name}{ext}"
        if cand.exists():
            return cand
    # Loose: any file starting with "Hero" (case-insensitive, strip leading space)
    candidates = []
    for f in folder.iterdir():
        if not f.is_file():
            continue
        stem = f.name.lstrip().lower()
        if stem.startswith("hero") and f.suffix.lower() in exts:
            candidates.append(f)
    if not candidates:
        return None
    # Prefer one with "hero" alone (no extra suffix marker), then shortest filename
    candidates.sort(key=lambda f: (len(f.name), f.name))
    return candidates[0]


def whiten_background(im: Image.Image) -> Image.Image:
    """If the image corners are dark (alpha-flattened-to-black or saved-as-black),
    flood-fill from each corner replacing the connected dark region with white.
    Threshold is tight (40) so it only catches uniform-dark backgrounds, not
    legitimate dark leather/shadow pixels on the subject.
    """
    from PIL import ImageDraw
    w, h = im.size
    seeds = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]
    THRESH = 40  # max colour distance for flood
    for seed in seeds:
        pix = im.getpixel(seed)
        if pix[0] < 25 and pix[1] < 25 and pix[2] < 25:
            ImageDraw.floodfill(im, seed, (255, 255, 255), thresh=THRESH)
    return im


def encode(src: Path, dst: Path) -> tuple[int, int]:
    """Open src, flatten alpha + whiten dark backgrounds, resize ≤ MAX_W, save WebP."""
    with Image.open(src) as im:
        # If the source carries alpha, composite onto white.
        if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert("RGB")

        # Some Drive PNGs are flat RGB with BLACK backgrounds (alpha was already
        # flattened-to-black upstream). Catch those by flood-filling from any
        # dark corner.
        im = whiten_background(im)

        if im.width > MAX_W:
            ratio = MAX_W / im.width
            im = im.resize((MAX_W, int(im.height * ratio)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=QUALITY, method=6)
        return im.size


def main():
    # Build the inverse alias index: drive folder name → list of slugs that should resolve to it.
    drive_to_slugs: dict[str, list[str]] = {}
    for slug, folder in SUPABASE_ALIASES.items():
        drive_to_slugs.setdefault(folder, []).append(slug)

    folders = sorted([p for p in DRIVE.iterdir() if p.is_dir() and p.name not in SKIP_FOLDERS])
    ok = miss = skipped = 0
    print(f"Scanning {len(folders)} Drive folders\n")
    for folder in folders:
        hero = find_hero(folder)
        if hero is None:
            print(f"  ✗ MISS   {folder.name:55}  (no Hero* file)")
            miss += 1
            continue

        # The canonical output slug = the folder name slugified.
        canonical_slug = slugify(folder.name)
        # Plus any Supabase aliases that point at THIS Drive folder.
        target_slugs = [canonical_slug] + drive_to_slugs.get(folder.name, [])
        # Dedup, preserving order.
        seen = set()
        target_slugs = [s for s in target_slugs if not (s in seen or seen.add(s))]

        try:
            # Encode once, copy bytes for any aliases (same content).
            first_dst = OUT / f"{target_slugs[0]}.webp"
            w, h = encode(hero, first_dst)
            kb = first_dst.stat().st_size // 1024
            for s in target_slugs[1:]:
                alias_dst = OUT / f"{s}.webp"
                alias_dst.write_bytes(first_dst.read_bytes())
            slug_label = " + ".join(target_slugs)
            print(f"  ✓ OK     {slug_label:55}  {w}×{h}  {kb} KB   ← {hero.name}")
            ok += 1
        except Exception as e:
            print(f"  ✗ FAIL   {folder.name:55}  {e}")
            miss += 1

    print(f"\n{ok} encoded, {miss} missed/failed, {skipped} skipped")
    print(f"Outputs in {OUT}")


if __name__ == "__main__":
    main()
