#!/usr/bin/env python3
"""
Encode curated Maison Tanneurs Drive assets to WebP and drop into public/tanneurs/.
Reads from Drive, writes to repo. Idempotent — re-running overwrites.

Asset slots picked from the audit:
  hero/      — 4-beat homepage carousel
  cinema/    — editorial-break video posters (videos copied as-is)
  atelier/   — Craftsmanship Cut/Stitch/Finish
  materials/ — Leather / Brass / Thread macros
  lifestyle/ — single editorial moments for ObjectOfTheEdition + heritage strip
"""
from PIL import Image
import shutil
import subprocess
from pathlib import Path

DRIVE = Path("/Users/lezdoors/Library/CloudStorage/GoogleDrive-ryanaoufal@gmail.com/My Drive/Maison Tanneurs")
REPO = Path("/Users/lezdoors/maison-tanneurs-rocco/public/tanneurs")

# (drive_relpath, target_path, max_w, quality)
ASSETS = [
    # ─── HERO carousel (4 stills) ──────────────────────────────────────
    ("Bright hero images/Hero-bag-rocks.png",            "hero/hero-bag-rocks.webp",      2400, 82),
    ("Bright hero images/Hero-Model-white-ryad.png",     "hero/hero-white-ryad.webp",     2400, 82),
    ("Bright hero images/Hero-model-train.png",          "hero/hero-train.webp",          2400, 82),
    ("Bright hero images/Hero-blonde -model-sunset.png", "hero/hero-blonde-sunset.webp",  2400, 82),

    # ─── LIFESTYLE / object-of-the-edition + heritage strip ────────────
    ("Bright hero images/Hero-model-teal-ryad.png",      "lifestyle/teal-ryad.webp",      2200, 82),
    ("Bright hero images/Hero-Model-olive tress.png",    "lifestyle/olive-trees.webp",    2200, 82),
    ("Maison tanneurs Atelier assets /Bag in courtyard.png",  "lifestyle/bag-courtyard.webp",  2200, 82),

    # ─── ATELIER Craftsmanship (Cut / Stitch / Finish) ─────────────────
    ("Maison tanneurs Atelier assets /atelier-leather-table.png",  "atelier/cut-leather-table.webp", 1800, 82),
    ("Maison tanneurs Atelier assets /hands-leather work-HD.png",  "atelier/stitch-hands.webp",      1800, 82),
    ("Maison tanneurs Atelier assets /Leather-atelier.png",        "atelier/finish-atelier.webp",    1800, 82),

    # ─── MATERIALS (Leather / Brass-via-bag / Thread) ──────────────────
    ("Maison tanneurs Atelier assets /leather-bag-couch.png",      "materials/full-grain.webp",      1600, 82),
    ("Maison tanneurs Atelier assets /BLK&white atelier HD.png",   "materials/solid-brass.webp",     1600, 82),
    ("Maison tanneurs Atelier assets /hands-leather work.png",     "materials/waxed-linen.webp",     1600, 82),

    # ─── HERITAGE wide / editorial-break stills ────────────────────────
    ("Maison tanneurs Atelier assets /Boutique Wide.png",          "atelier/boutique-wide.webp",     2400, 82),
    ("Maison tanneurs Atelier assets /Model-bench-desert-HD.png",  "cinema/model-bench-desert.webp", 2400, 82),
    ("Maison tanneurs Atelier assets /Berber-dunes-bag.jpeg",      "cinema/berber-dunes-poster.webp", 2400, 82),
]

# Videos copied as-is + we encode a poster from the first frame using ffmpeg if available
VIDEOS = [
    ("Maison Tanneurs videos/Hands at Work.mp4",                       "cinema/hands-at-work.mp4"),
    ("Maison Tanneurs videos/Berber in the dunes.mp4",                 "cinema/berber-dunes.mp4"),
    ("Maison Tanneurs videos/Model-white-bag-dune.mp4",                "cinema/model-dune-walk.mp4"),
    ("Maison Tanneurs videos/Cinematic-medina-zigzag-tote-chocolate.mp4", "cinema/medina-zigzag.mp4"),
]

REPO.mkdir(parents=True, exist_ok=True)


def encode(src: Path, dst: Path, max_w: int, q: int):
    if not src.exists():
        print(f"  MISS  {src.name}")
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as im:
        im = im.convert("RGB")
        if im.width > max_w:
            ratio = max_w / im.width
            im = im.resize((max_w, int(im.height * ratio)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=q, method=6)
    size_kb = dst.stat().st_size // 1024
    print(f"  OK    {dst.relative_to(REPO)}  ({im.width}×{im.height}, {size_kb} KB)")
    return True


def copy_video(src: Path, dst: Path):
    if not src.exists():
        print(f"  MISS  {src.name}")
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    size_mb = dst.stat().st_size / 1_000_000
    print(f"  OK    {dst.relative_to(REPO)}  ({size_mb:.1f} MB)")
    return True


def main():
    print("=== STILLS ===")
    ok = miss = 0
    for rel, target, mw, q in ASSETS:
        if encode(DRIVE / rel, REPO / target, mw, q):
            ok += 1
        else:
            miss += 1
    print(f"\nStills: {ok} encoded, {miss} missing\n")

    print("=== VIDEOS ===")
    vok = vmiss = 0
    for rel, target in VIDEOS:
        if copy_video(DRIVE / rel, REPO / target):
            vok += 1
        else:
            vmiss += 1
    print(f"\nVideos: {vok} copied, {vmiss} missing")

    # Auto-generate posters for any video that has no matching .webp poster yet
    print("\n=== VIDEO POSTERS (via ffmpeg if available) ===")
    has_ffmpeg = shutil.which("ffmpeg") is not None
    if not has_ffmpeg:
        print("  ffmpeg not on PATH — skipping; videos will use first-frame fallback in markup")
        return
    for _, target in VIDEOS:
        video = REPO / target
        if not video.exists():
            continue
        poster = video.with_suffix(".webp")
        if poster.exists():
            continue
        # Pull frame at 1s into a tmp jpg, then encode to WebP via PIL
        tmp = REPO / "_tmp_poster.jpg"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-ss", "1", "-i", str(video), "-frames:v", "1", str(tmp)],
            check=False,
        )
        if tmp.exists():
            with Image.open(tmp) as im:
                im.convert("RGB").save(poster, "WEBP", quality=82, method=6)
            tmp.unlink()
            print(f"  OK    {poster.relative_to(REPO)}")


if __name__ == "__main__":
    main()
