#!/bin/bash

# Navigate to your project directory
cd /Users/lunt3/Documents/SwitchHack/

# 1. Run the Scraper (Nodriver/Chrome)
echo "🕸️ Scraping Community Data..."
/usr/bin/python3 scrapers/gbatemp_scraper.py

# 2. Run the Intel Processor (DeepSeek)
echo "🧠 Processing with DeepSeek AI..."
/usr/bin/python3 scrapers/intel_processor.py

# 3. Add to GitHub
echo "🚀 Shipping to GitHub..."
/usr/bin/git add monitor_data.json
/usr/bin/git commit -m "Autonomous Intel Update: $(date)"
/usr/bin/git push origin main

echo "✅ Pipeline Complete."