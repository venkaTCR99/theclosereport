import json
import os
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
}

REGIONS = ["WALL STREET", "INDIA", "ASIA", "EUROPE"]

REGION_FLAGS = {
    "WALL STREET": "🇺🇸",
    "INDIA": "🇮🇳",
    "ASIA": "🌏",
    "EUROPE": "🇪🇺",
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

if __name__ == "__main__":
    generate_report()