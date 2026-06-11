import json
import os
import urllib.request
from datetime import date

TODAY = date.today().isoformat()

INDICES = {
    "dow":    "^DJI",
    "sp500":  "^GSPC",
    "nasdaq": "^IXIC",
    "sensex": "^BSESN",
    "sse":    "000001.SS",
    "szse":   "399001.SZ",
    "nikkei": "^N225",
    "kospi":  "^KS11",
    "ftse":   "^FTSE",
    "dax":    "^GDAXI",
    "cac":    "^FCHI",
    "stoxx":  "^STOXX50E",
}

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
            "close":  close,
            "change": change,
            "pct":    pct,
            "open":   open_price,
            "high":   high,
            "low":    low,
        }
    except Exception as e:
        print(f"❌ Exception fetching {symbol}: {e}")
        return None

def main():
    print(f"🚀 Fetching market data for {TODAY}...")

    result = {
        "date": TODAY,
        "indices": {}
    }

    for key, symbol in INDICES.items():
        print(f"  Fetching {key} ({symbol})...")
        quote = fetch_quote(symbol)
        if quote:
            result["indices"][key] = quote
            print(f"  ✅ {key}: {quote['close']} ({quote['pct']}%)")
        else:
            print(f"  ❌ {key}: Failed to fetch")

    # Save to data file
    output_path = f"src/data/markets/{TODAY}.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n✅ Data saved to {output_path}")
    print(f"📊 Successfully fetched {len(result['indices'])}/12 indices")

if __name__ == "__main__":
    main()