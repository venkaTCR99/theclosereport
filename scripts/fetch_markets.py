import requests
import json
import os
from datetime import date, datetime

# API Key from environment variable
API_KEY = os.environ.get("TWELVE_DATA_API_KEY")

# Today's date
TODAY = date.today().isoformat()

# Index symbols for Twelve Data API
INDICES = {
    "dow":    "DJI",
    "sp500":  "SPX",
    "nasdaq": "IXIC",
    "sensex": "BSE:SENSEX",
    "sse":    "SSEC",
    "szse":   "399001",
    "nikkei": "JP225",
    "kospi":  "KOSPI",
    "ftse":   "UK100",
    "dax":    "GER40",
    "cac":    "FRA40",
    "stoxx":  "EU50",
}

def fetch_quote(symbol):
    """Fetch quote data from Twelve Data API"""
    try:
        url = "https://api.twelvedata.com/quote"
        params = {
            "symbol": symbol,
            "apikey": API_KEY,
        }
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if "close" not in data:
            print(f"❌ Error fetching {symbol}: {data}")
            return None

        return {
            "close":  round(float(data["close"]), 2),
            "change": round(float(data["change"]), 2),
            "pct":    round(float(data["percent_change"]), 2),
            "open":   round(float(data["open"]), 2),
            "high":   round(float(data["high"]), 2),
            "low":    round(float(data["low"]), 2),
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