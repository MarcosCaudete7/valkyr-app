#!/bin/bash
OUT_DIR="/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/assets/exercises/base"
mkdir -p "$OUT_DIR"

declare -A gifs=(
    ["bench_press"]="https://upload.wikimedia.org/wikipedia/commons/f/fa/Bench-press.gif"
    ["squat"]="https://upload.wikimedia.org/wikipedia/commons/8/82/Squats.gif"
    ["pushup"]="https://upload.wikimedia.org/wikipedia/commons/8/89/Pushup.gif"
    ["pullup"]="https://upload.wikimedia.org/wikipedia/commons/f/fb/Pull-up.gif"
    ["deadlift"]="https://upload.wikimedia.org/wikipedia/commons/c/c3/Deadlift.gif"
    ["biceps_curl"]="https://upload.wikimedia.org/wikipedia/commons/e/e3/Biceps_curl.gif"
    ["plank"]="https://upload.wikimedia.org/wikipedia/commons/3/30/Plank.gif"
    ["lunges"]="https://upload.wikimedia.org/wikipedia/commons/e/eb/Lunges.gif"
    ["lateral_raises"]="https://upload.wikimedia.org/wikipedia/commons/b/b3/Lateral_raise.gif"
    ["shoulder_press"]="https://upload.wikimedia.org/wikipedia/commons/7/75/Shoulder_Press.gif"
    ["crunch"]="https://upload.wikimedia.org/wikipedia/commons/f/f6/Crunch.gif"
    ["default"]="https://upload.wikimedia.org/wikipedia/commons/8/89/Pushup.gif"
)

for key in "${!gifs[@]}"; do
    url="${gifs[$key]}"
    echo "Downloading $key from $url..."
    wget -q -O "$OUT_DIR/$key.gif" -U "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "$url"
done
echo "Base GIFs downloaded successfully."
