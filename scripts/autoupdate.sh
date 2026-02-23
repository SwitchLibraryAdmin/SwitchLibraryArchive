#!/bin/bash

# Navigate to your project directory
cd /Users/lunt3/Documents/SwitchHack/

# Load environment variables (API keys, etc.)
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# 1. Run the Scraper (Nodriver/Chrome)
echo "🕸️ Scraping Community Data..."
/opt/homebrew/bin/python3.13 scrapers/gbatemp_scraper.py

# 2. Run the Intel Processor (DeepSeek)
echo "🧠 Processing with DeepSeek AI..."
/opt/homebrew/bin/python3.13 scrapers/intel_processor.py

# 3. Check if AI produced real data (articles > 0 means all 3 calls succeeded)
AI_SUCCESS=$(/opt/homebrew/bin/python3.13 -c "
import json, sys
try:
    with open('data/monitor_data.json') as f:
        d = json.load(f)
    print('1' if len(d.get('articles', [])) > 0 else '0')
except:
    print('0')
")

if [ "$AI_SUCCESS" = "0" ]; then
    echo "⚠️  DeepSeek unavailable — skipping commit. Will retry next run."
    exit 0
fi

# 4. Add to GitHub
echo "🚀 Shipping to GitHub..."
/usr/bin/git add data/monitor_data.json data/monitor_history.json
/usr/bin/git commit -m "Autonomous Intel Update: $(date)"
/usr/bin/git push origin main

echo "✅ Pipeline Complete."