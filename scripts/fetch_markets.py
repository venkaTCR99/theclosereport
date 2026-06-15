import json
import os
import urllib.request
from datetime import datetime, timezone, timedelta

# IST timezone
IST = timezone(timedelta(hours=5, minutes=30))
NOW = datetime.now(IST)
TODAY = NOW.date().isoformat()
FETCHED_AT = NOW.isoformat()

# Define indices with market close times
ASIA_INDICES = {
    "sensex": {"symbol": "^BSESN",   "region": "india"},
    "sse":    {"symbol": "000001.SS", "region": "asia"},
    "szse":   {"symbol": "399001.SZ", "region": "asia"},
    "nikkei": {"symbol": "^N225",     "region": "asia"},
    "kospi":  {"symbol": "^KS11",     "region": "asia"},
}

USEU_INDICES = {
    "dow":    {"symbol": "^DJI",      "region": "usa"},
    "sp500":  {"symbol": "^GSPC",     "region": "usa"},
    "nasdaq": {"symbol": "^IXIC",     "region": "usa"},
    "ftse":   {"symbol": "^FTSE",     "region": "europe"},
    "dax":    {"symbol": "^GDAXI",    "region": "europe"},
    "cac":    {"symbol": "^FCHI",     "region": "europe"},
    "stoxx":  {"symbol": "^STOXX50E", "region": "europe"},
}

# Determine which indices to fetch based on IST time
IST_HOUR = NOW.hour
IST_MINUTE = NOW.minute
print(f"🕐 Current IST time: {NOW.strftime('%Y-%m-%d %H:%M:%S %Z')}")
print(f"🕐 IST Hour: {IST_HOUR}")

# After 4PM IST and before 10PM IST → fetch Asia/India only
# After 10PM IST or before 6AM IST → fetch US/EU only
if 16 <= IST_HOUR < 22:
    print(f"⏰ {IST_HOUR}:{IST_MINUTE} IST — Fetching Asian & Indian markets")
    INDICES = ASIA_INDICES
elif IST_HOUR >= 22 or IST_HOUR < 6:
    print(f"⏰ {IST_HOUR}:{IST_MINUTE} IST — Fetching US & European markets")
    INDICES = USEU_INDICES
else:
    print(f"⏰ {IST_HOUR}:{IST_MINUTE} IST — Fetching all markets")
    INDICES = {**ASIA_INDICES, **USEU_INDICES}

def fetch_quote(symbol):
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read())

        result = data["chart"]["result"][0]
        meta = result["meta"]

        close = round(meta["regularMarketPrice"], 2)
        prev_close = round(meta["chartPreviousClose"], 2)
        change = round(close - prev_close, 2)
        pct = round((change / prev_close) * 100, 2)
        open_price = round(meta.get("regularMarketOpen", close), 2)
        high = round(meta.get("regularMarketDayHigh", close), 2)
        low = round(meta.get("regularMarketDayLow", close), 2)

        return {
            "close":     close,
            "change":    change,
            "pct":       pct,
            "open":      open_price,
            "high":      high,
            "low":       low,
            "fetchedAt": FETCHED_AT,
        }
    except Exception as e:
        print(f"❌ Exception fetching {symbol}: {e}")
        return None

def main():
    print(f"🚀 Fetching market data for {TODAY} at {FETCHED_AT}...")

    # Load existing data if file exists
    output_path = f"src/data/markets/{TODAY}.json"
    existing = {}
    if os.path.exists(output_path):
        with open(output_path, "r") as f:
            existing_data = json.load(f)
            existing = existing_data.get("indices", {})
        print(f"📂 Loaded existing data for {TODAY}")

    result = {
        "date": TODAY,
        "indices": existing  # start with existing data
    }

    for key, info in INDICES.items():
        symbol = info["symbol"]
        region = info["region"]
        print(f"  Fetching {key} ({symbol})...")
        quote = fetch_quote(symbol)
        if quote:
            quote["region"] = region
            result["indices"][key] = quote
            print(f"  ✅ {key}: {quote['close']} ({quote['pct']}%) @ {FETCHED_AT}")
        else:
            print(f"  ❌ {key}: Failed to fetch")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n✅ Data saved to {output_path}")
    print(f"📊 Total indices: {len(result['indices'])}/12")

if __name__ == "__main__":
    main()