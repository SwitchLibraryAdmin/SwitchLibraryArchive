#!/bin/bash

# Navigate to your project directory
cd /Users/lunt3/Documents/SwitchHack/

# 1. Run the Scraper (Nodriver/Chrome)
echo "🕸️ Scraping Community Data..."
/opt/homebrew/bin/python3.13 scrapers/gbatemp_scraper.py

# 2. Run the Intel Processor (DeepSeek)
echo "🧠 Processing with DeepSeek AI..."
/opt/homebrew/bin/python3.13 scrapers/intel_processor.py

# 3. Add to GitHub
echo "🚀 Shipping to GitHub..."
/usr/bin/git add data/monitor_data.json data/monitor_history.json
/usr/bin/git commit -m "Autonomous Intel Update: $(date)"
/usr/bin/git push origin main

echo "✅ Pipeline Complete."