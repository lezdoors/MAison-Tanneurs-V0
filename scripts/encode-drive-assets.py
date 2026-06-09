#!/usr/bin/env python3
"""
Encode curated Maison Tanneurs Drive assets to WebP and drop into public/tanneurs/.
Reads from Drive, writes to repo. Idempotent — re-running overwrites.

Asset slots:
  hero/      — homepage carousel (user-mandated: dune still + Berber still + video)
  cinema/    — editorial-break video posters (videos copied as-is)
  atelier/   — Craftsmanship Cut/Stitch/Finish (workshop pics)
  materials/ — Leather / Brass / Thread macros
  lifestyle/ — model + tennis + field mix per Ryan's direction
"""
from PIL import Image
import shutil
import subprocess
from pathlib import Path

DRIVE = Path("/Users/lezdoors/Library/CloudStorage/GoogleDrive-ryanaoufal@gmail.com/My Drive/Maison Tanneurs")
REPO = Path("/Users/lezdoors/MAison-Tanneurs-V0/public/tanneurs")

# (drive_relpath, target_path, max_w, quality)
ASSETS = [
    # ─── HERO carousel (user-mandated 3 beats) ─────────────────────────
    ("Maison tanneurs Atelier assets /Model-white-bag-dune-HD.png",   "hero/dune-white-bag.webp",   2400, 82),
    ("Maison tanneurs Atelier assets /Berber-dunes-bag.jpeg",         "hero/berber-dunes-bag.webp", 2400, 82),

    # ─── LIFESTYLE — model + tennis + field mix (Ryan's direction) ─────
    ("Maison tanneurs Atelier assets /model-tennis-leather bag.png",  "lifestyle/tennis-leather.webp",     2400, 82),
    ("Maison tanneurs Atelier assets /Model-tennis court-kilim.png",  "lifestyle/tennis-kilim.webp",       2400, 82),
    ("Maison tanneurs Atelier assets /Hero-Model-olive tress.png",    "lifestyle/olive-trees.webp",        2400, 82),
    ("Maison tanneurs Atelier assets /Hero-Model-field.png",          "lifestyle/field.webp",              2400, 82),
    ("Maison tanneurs Atelier assets /model-lavander field- 00.png",  "lifestyle/lavender-field.webp",     2400, 82),
    ("Maison tanneurs Atelier assets /Model-field- horse.png",        "lifestyle/field-horse.webp",        2400, 82),
    ("Maison tanneurs Atelier assets /model-white suit-kilim bag-HD.png", "lifestyle/white-suit-kilim.webp", 2400, 82),
    ("Maison tanneurs Atelier assets /Model-bench-desert-HD.png",     "lifestyle/bench-desert.webp",       2400, 82),
    # Removed from approved pool: model face reads wrong in review.
    ("Maison tanneurs Atelier assets /Hero-Model-white-ryad.png",     "lifestyle/white-ryad.webp",         2400, 82),

    # ─── ATELIER (workshop, hands, materials in context) ───────────────
    ("Maison tanneurs Atelier assets /atelier-leather-table.png",     "atelier/cut-leather-table.webp", 1800, 82),
    ("Maison tanneurs Atelier assets /hands-leather work-HD.png",     "atelier/stitch-hands.webp",      1800, 82),
    ("Maison tanneurs Atelier assets /Leather-atelier.png",           "atelier/finish-atelier.webp",    1800, 82),
    ("Maison tanneurs Atelier assets /Ateler scene.png",              "atelier/wide-scene.webp",        2200, 82),
    ("Maison tanneurs Atelier assets /BLK&white atelier HD.png",      "atelier/bw-atelier.webp",        2200, 82),
    ("Maison tanneurs Atelier assets /Boutique Wide.png",             "atelier/boutique-wide.webp",     2400, 82),
    ("Maison tanneurs Atelier assets /leather-table-atelier.png",     "atelier/leather-table-2.webp",   1800, 82),

    # ─── MATERIALS (Leather / Brass-via-hardware / Thread) ─────────────
    ("Maison tanneurs Atelier assets /leather-bag-couch.png",         "materials/full-grain.webp",      1600, 82),
    ("Maison tanneurs Atelier assets /BLK&white atelier HD.png",      "materials/solid-brass.webp",     1600, 82),
    ("Maison tanneurs Atelier assets /hands-leather work.png",        "materials/waxed-linen.webp",     1600, 82),

    # ─── EDITORIAL BREAK posters / heritage atmosphere ─────────────────
    ("Maison tanneurs Atelier assets /caravan-bags.png",              "cinema/caravan-poster.webp",     2400, 82),
    ("Maison tanneurs Atelier assets /model-night-desert-HD.png",     "cinema/night-desert.webp",       2400, 82),
    ("Maison tanneurs Atelier assets /Morning-store-opening.png",     "cinema/morning-store.webp",      2400, 82),
]

# Videos — user-mandated hero video + atelier process + supplementary loops
VIDEOS = [
    # USER-MANDATED HERO VIDEO
    ("Maison Tanneurs videos/you_generated_the_same_video_t.mp4",     "hero/dune-video.mp4"),
    # Atelier process opener
    ("Maison Tanneurs videos/Hands at Work.mp4",                       "cinema/hands-at-work.mp4"),
    # Reserve lifestyle clips
    ("Maison Tanneurs videos/Berber in the dunes.mp4",                 "cinema/berber-dunes.mp4"),
    ("Maison Tanneurs videos/Model-white-bag-dune.mp4",                "cinema/model-dune-walk.mp4"),
    ("Maison Tanneurs videos/Cinematic-medina-zigzag-tote-chocolate.mp4", "cinema/medina-zigzag.mp4"),
    ("Maison Tanneurs videos/model in desert.mp4",                     "cinema/model-desert.mp4"),
    ("Maison Tanneurs videos/model-tennis-leather bag.mp4",            "cinema/tennis-leather.mp4"),
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


def generate_poster(video: Path, ts: str = "1") -> bool:
    poster = video.with_suffix(".webp")
    if poster.exists():
        return True
    if shutil.which("ffmpeg") is None:
        return False
    tmp = video.parent / "_tmp_poster.jpg"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-ss", ts, "-i", str(video), "-frames:v", "1", str(tmp)],
        check=False,
    )
    if tmp.exists():
        with Image.open(tmp) as im:
            im.convert("RGB").save(poster, "WEBP", quality=82, method=6)
        tmp.unlink()
        print(f"  poster {poster.relative_to(REPO)}")
        return True
    return False


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
            generate_poster(REPO / target)
        else:
            vmiss += 1
    print(f"\nVideos: {vok} copied, {vmiss} missing")


if __name__ == "__main__":
    main()
