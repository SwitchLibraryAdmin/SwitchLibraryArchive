#!/bin/bash

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT" || exit 1

if [ -f "$REPO_ROOT/.env" ]; then
    export $(grep -v '^#' "$REPO_ROOT/.env" | xargs)
fi

echo "========================================"
echo "Starting Sync: $(date)"

echo "🕸️ Scraping Community Data..."
python3.13 tools/scrapers/scraper_main.py

echo "🧠 Processing with DeepSeek AI..."
python3.13 tools/scrapers/intel_processor.py

AI_SUCCESS=$(python3.13 -c "
import json, sys
try:
    with open('site/data/monitor_data.json') as f:
        d = json.load(f)
    print('1' if len(d.get('articles', [])) > 0 else '0')
except:
    print('0')
")

if [ "$AI_SUCCESS" = "0" ]; then
    echo "⚠️  DeepSeek unavailable — skipping commit. Will retry next run."
    exit 0
fi

echo "🚀 Shipping to GitHub..."
git add site/data/monitor_data.json site/data/monitor_history.json
git commit -m "Autonomous Intel Update: $(date)"
git push origin main

echo "✅ Pipeline Complete: $(date)"
echo "========================================"
