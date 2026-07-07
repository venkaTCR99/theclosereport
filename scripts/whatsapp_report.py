import json
import os
import glob
from datetime import datetime, timezone, timedelta

# IST timezone
IST = timezone(timedelta(hours=5, minutes=30))
NOW = datetime.now(IST)

# Index display names
INDEX_NAMES = {
    "dow":    ("Dow Jones",   "🇺🇸", "WALL STREET"),
    "sp500":  ("S&P 500",     "🇺🇸", "WALL STREET"),
    "nasdaq": ("Nasdaq",      "🇺🇸", "WALL STREET"),
    "sensex": ("Sensex",      "🇮🇳", "INDIA"),
    "nifty":  ("Nifty 50",    "🇮🇳", "INDIA"),
    "nikkei": ("Nikkei",      "🌏", "ASIA"),
    "kospi":  ("KOSPI",       "🌏", "ASIA"),
    "sse":    ("Shanghai",    "🌏", "ASIA"),
    "szse":   ("Shenzhen",    "🌏", "ASIA"),
    "ftse":   ("FTSE 100",    "🇪🇺", "EUROPE"),
    "dax":    ("DAX",         "🇩🇪", "EUROPE"),
    "cac":    ("CAC 40",      "🇫🇷", "EUROPE"),
    "stoxx":  ("Euro Stoxx",  "🇪🇺", "EUROPE"),
    "asx":     ("ASX 200",      "🇦🇺", "AUSTRALIA"),
    "bovespa": ("Bovespa",      "🇧🇷", "AMERICAS"),
    "idx":     ("IDX Composite","🇮🇩", "ASIA"),
    "hsi": ("Hang Seng", "🇭🇰", "ASIA"),
    "sti": ("STI",       "🇸🇬", "ASIA"),
}

REGIONS = ["WALL STREET", "INDIA", "ASIA", "AUSTRALIA", "AMERICAS", "EUROPE"]

REGION_FLAGS = {
    "WALL STREET": "🇺🇸",
    "INDIA": "🇮🇳",
    "ASIA": "🌏",
    "EUROPE": "🇪🇺",
    "AUSTRALIA": "🇦🇺",
    "AMERICAS": "🇧🇷",
}

def get_latest_data():
    data_dir = "src/data/markets"
    files = sorted([f for f in os.listdir(data_dir) if f.endswith('.json')], reverse=True)
    if not files:
        return None, None
    latest = files[0]
    date_str = latest.replace('.json', '')
    with open(f"{data_dir}/{latest}") as f:
        return json.load(f), date_str

def fmt_number(n):
    if n >= 1000:
        return f"{n:,.0f}"
    return f"{n:,.2f}"

def fmt_change(n):
    if n >= 1000:
        return f"{abs(n):,.0f}"
    return f"{abs(n):,.2f}"

def generate_report():
    data, date_str = get_latest_data()
    if not data:
        print("❌ No data found!")
        return

    indices = data.get('indices', {})

    # Format date
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    formatted_date = date_obj.strftime("%A, %B %d, %Y")

    # Get best and worst
    all_indices = [(k, v) for k, v in indices.items() if k in INDEX_NAMES]
    sorted_indices = sorted(all_indices, key=lambda x: x[1].get('pct', 0), reverse=True)
    best_key, best = sorted_indices[0]
    worst_key, worst = sorted_indices[-1]
    best_name = INDEX_NAMES[best_key][0]
    worst_name = INDEX_NAMES[worst_key][0]

    # Build message
    msg = []
    msg.append("📊 *THE CLOSE REPORT*")
    msg.append("━━━━━━━━━━━━━━━━━━━")
    msg.append(f"📅 {formatted_date}")
    msg.append("")

    for region in REGIONS:
        flag = REGION_FLAGS[region]
        region_indices = [(k, v) for k, v in indices.items() 
                         if k in INDEX_NAMES and INDEX_NAMES[k][2] == region]
        
        if not region_indices:
            continue

        msg.append(f"{flag} *{region}*")
        msg.append("╔═══════════════════╗")
        
        for key, idx in region_indices:
            name = INDEX_NAMES[key][0]
            pct = idx.get('pct', 0)
            close = idx.get('close', 0)
            change = idx.get('change', 0)
            
            emoji = "🟢" if pct >= 0 else "🔴"
            arrow = "▲" if pct >= 0 else "▼"
            sign = "+" if pct >= 0 else ""
            
            # Pad name for alignment
            name_padded = name.ljust(12)
            
            msg.append(f"  {name_padded} {emoji} {sign}{pct:.2f}%")
            msg.append(f"  {fmt_number(close)}  {arrow} {fmt_change(change)} pts")
            msg.append("")

        msg.append("╚═══════════════════╝")
        msg.append("")

    # Summary
    best_sign = "+" if best.get('pct', 0) >= 0 else ""
    worst_sign = "+" if worst.get('pct', 0) >= 0 else ""

    msg.append("━━━━━━━━━━━━━━━━━━━")
    msg.append(f"🏆 *Best:*  {best_name} {best_sign}{best.get('pct', 0):.2f}%")
    msg.append(f"📉 *Worst:* {worst_name} {worst_sign}{worst.get('pct', 0):.2f}%")
    msg.append("━━━━━━━━━━━━━━━━━━━")
    msg.append("")
    msg.append("🚀 *More features coming soon!*")
    msg.append("         *TheCloseReport* 📊")

    report = "\n".join(msg)
    print(report)

    # Save to file
    with open("whatsapp_report.txt", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("\n\n✅ Report saved to whatsapp_report.txt")

    
    # Get last 5 trading day files
def generate_weekly_report():
    data_dir = "src/data/markets"
    files = sorted(glob.glob(f"{data_dir}/*.json"), reverse=True)[:5]
    
    if len(files) < 2:
        print("❌ Not enough data for weekly report!")
        return

    # Get latest and oldest data
    with open(files[0]) as f:
        latest = json.load(f)
    with open(files[-1]) as f:
        oldest = json.load(f)

    latest_date = latest.get('date', '')
    oldest_date = oldest.get('date', '')

    # Calculate weekly change per index
    weekly = {}
    for key in latest['indices']:
        if key in oldest['indices']:
            close_now = latest['indices'][key].get('close', 0)
            close_then = oldest['indices'][key].get('close', 0)
            if close_then != 0:
                weekly_pct = round(((close_now - close_then) / close_then) * 100, 2)
                weekly[key] = {
                    'name': INDEX_NAMES.get(key, (key,))[0],
                    'pct': weekly_pct,
                    'close': close_now,
                }

    # Sort gainers and losers
    sorted_weekly = sorted(weekly.items(), key=lambda x: x[1]['pct'], reverse=True)
    gainers = sorted_weekly[:3]
    losers = sorted_weekly[-3:][::-1]

    # Count up and down
    up = len([v for v in weekly.values() if v['pct'] >= 0])
    down = len([v for v in weekly.values() if v['pct'] < 0])

    # Build message
    msg = []
    msg.append("📊 *WEEKLY CLOSE REPORT*")
    msg.append("━━━━━━━━━━━━━━━━━━━")
    msg.append(f"📅 Week: {oldest_date} → {latest_date}")
    msg.append("")
    msg.append(f"🌍 *{len(weekly)} indices tracked*")
    msg.append(f"🟢 {up} gained  |  🔴 {down} declined")
    msg.append("")

    msg.append("🏆 *TOP PERFORMERS*")
    msg.append("╔═══════════════════╗")
    for i, (key, data) in enumerate(gainers, 1):
        sign = "+" if data['pct'] >= 0 else ""
        msg.append(f"  {i}. {data['name']:<14} {sign}{data['pct']:.2f}%")
    msg.append("╚═══════════════════╝")
    msg.append("")

    msg.append("📉 *BIGGEST DECLINERS*")
    msg.append("╔═══════════════════╗")
    for i, (key, data) in enumerate(losers, 1):
        msg.append(f"  {i}. {data['name']:<14} {data['pct']:.2f}%")
    msg.append("╚═══════════════════╝")
    msg.append("")

    msg.append("━━━━━━━━━━━━━━━━━━━")
    msg.append("📌 *Factual observations:*")
    
    # Auto observations
    best = gainers[0][1]
    worst = losers[0][1]
    msg.append(f"◆ {best['name']} led gains at {'+' if best['pct']>=0 else ''}{best['pct']:.2f}%")
    msg.append(f"◆ {worst['name']} biggest decline at {worst['pct']:.2f}%")
    msg.append(f"◆ {up} of {len(weekly)} indices closed positive for the week")
    msg.append("")
    msg.append("━━━━━━━━━━━━━━━━━━━")
    msg.append("_For informational purposes only._")
    msg.append("_Not financial advice._")
    msg.append("")
    msg.append("🚀 *More features coming soon!*")
    msg.append("      *TheCloseReport* 📊")

    report = "\n".join(msg)
    print(report)

    # Save to file
    with open("whatsapp_weekly_report.txt", "w", encoding="utf-8") as f:
        f.write(report)

    print("\n✅ Weekly report saved to whatsapp_weekly_report.txt")

if __name__ == "__main__":
    from datetime import datetime
    day = datetime.now().weekday()  # 6 = Sunday
    
    generate_report()  # Daily always
    
    if day == 6:  # Sunday only
        print("\n📅 Sunday — generating weekly report...")
        generate_weekly_report()