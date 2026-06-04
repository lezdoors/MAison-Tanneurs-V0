#!/usr/bin/env bash
# Crop Google/Veo watermark off the bottom-right of each video by scaling the
# image up by ~10% then re-centring — the watermark sits in the lower-right
# 8-10% of the frame so a small zoom hides it cleanly without black bars.
# Re-encodes to H.264 main profile + AAC, optimised for web playback.

set -euo pipefail

DRIVE="/Users/lezdoors/Library/CloudStorage/GoogleDrive-ryanaoufal@gmail.com/My Drive/Maison Tanneurs/Maison Tanneurs videos"
OUT="/Users/lezdoors/MAison-Tanneurs-V0/public/tanneurs/cinema"
HERO_OUT="/Users/lezdoors/MAison-Tanneurs-V0/public/tanneurs/hero"
mkdir -p "$OUT" "$HERO_OUT"

# (source-name, dest-path)
declare -a JOBS=(
  # HERO slot — Hero-bag-beach-HD is 4K and Ryan-labeled "Hero".
  # NEVER use loro-video.mp4 (previously you_generated_the_same_video_t.mp4)
  # — the bag in that frame has a visible Loro Piana logo.
  "Hero-bag-beach-HD.mp4|$HERO_OUT/hero-loop.mp4"
  "Hands at Work.mp4|$OUT/hands-at-work.mp4"
  "Berber in the dunes.mp4|$OUT/berber-dunes.mp4"
  "Model-white-bag-dune.mp4|$OUT/model-dune-walk.mp4"
  "Cinematic-medina-zigzag-tote-chocolate.mp4|$OUT/medina-zigzag.mp4"
  "model in desert.mp4|$OUT/model-desert.mp4"
  "model-tennis-leather bag.mp4|$OUT/tennis-leather.mp4"
  "medina-zigzag-tote-chocolate-vodeo-reveal.mp4|$OUT/medina-zigzag-reveal.mp4"
)

for job in "${JOBS[@]}"; do
  src_name="${job%%|*}"
  dst="${job##*|}"
  src="$DRIVE/$src_name"
  if [[ ! -f "$src" ]]; then
    echo "  MISS  $src_name"
    continue
  fi
  echo "  cropping  $src_name → $(basename "$dst")"

  # Hero loop renders at viewport widths up to 4K, so encode at 1080p +
  # higher quality. Other clips (editorial breaks, PDP loops) render at
  # smaller blocks so 720p + tighter compression is fine.
  if [[ "$dst" == *"/hero-loop.mp4" ]]; then
    SCALE="1920:1080"; PROFILE="high"; CRF="19"
  else
    SCALE="1280:720"; PROFILE="main"; CRF="22"
  fi

  /opt/homebrew/bin/ffmpeg -y -hide_banner -loglevel error \
    -i "$src" \
    -vf "crop=in_w*0.92:in_h*0.92,scale=${SCALE},format=yuv420p" \
    -c:v libx264 -profile:v "$PROFILE" -preset slow -crf "$CRF" -movflags +faststart \
    -an \
    "$dst"

  # Poster from first second — write jpg then re-encode to webp via PIL
  poster_jpg="${dst%.mp4}.jpg"
  poster="${dst%.mp4}.webp"
  /opt/homebrew/bin/ffmpeg -y -hide_banner -loglevel error \
    -ss 1 -i "$dst" -frames:v 1 -q:v 3 \
    "$poster_jpg"
  python3 -c "from PIL import Image; Image.open('$poster_jpg').convert('RGB').save('$poster', 'WEBP', quality=82, method=6)"
  rm -f "$poster_jpg"

  size=$(/usr/bin/stat -f '%z' "$dst")
  printf "    ok %.1f MB\n" "$(echo "$size/1000000" | /usr/bin/bc -l)"
done
echo "done."
