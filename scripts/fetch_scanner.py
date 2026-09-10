#!/usr/bin/env python3
"""
TheCloseReport.com — Nifty 50 Stock Scanner
Fetches previous close data for Nifty 50 stocks and generates
scanner signals — Higher Side & Lower Side.

Usage:  python fetch_scanner.py
Cron:   30 16 * * 1-5   python /path/to/scripts/fetch_scanner.py
        (Mon–Fri, 4:30 PM IST — after NSE market close at 3:30 PM)

Premium only feature — site display only, no newsletter/WhatsApp.
Pure data. No advice. No recommendations.
"""

import json
import os
import urllib.request
from datetime import datetime, timezone, timedelta

# ── CONFIG ────────────────────────────────────────────────────────────────────

IST       = timezone(timedelta(hours=5, minutes=30))
NOW       = datetime.now(IST)
TODAY     = NOW.date().isoformat()
FETCHED_AT = NOW.isoformat()

DATA_DIR  = "src/data/scanner"
LATEST    = f"{DATA_DIR}/latest.json"
ARCHIVE   = f"{DATA_DIR}/archive"

# Top 25 shown per side
TOP_N = 25

# ── NIFTY 50 SYMBOLS ─────────────────────────────────────────────────────────

NIFTY_50 = {
    "RELIANCE":   "RELIANCE.NS",
    "TCS":        "TCS.NS",
    "HDFCBANK":   "HDFCBANK.NS",
    "INFY":       "INFY.NS",
    "ICICIBANK":  "ICICIBANK.NS",
    "HINDUNILVR": "HINDUNILVR.NS",
    "ITC":        "ITC.NS",
    "SBIN":       "SBIN.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "KOTAKBANK":  "KOTAKBANK.NS",
    "LT":         "LT.NS",
    "AXISBANK":   "AXISBANK.NS",
    "ASIANPAINT": "ASIANPAINT.NS",
    "MARUTI":     "MARUTI.NS",
    "SUNPHARMA":  "SUNPHARMA.NS",
    "TITAN":      "TITAN.NS",
    "ULTRACEMCO": "ULTRACEMCO.NS",
    "WIPRO":      "WIPRO.NS",
    "NESTLEIND":  "NESTLEIND.NS",
    "POWERGRID":  "POWERGRID.NS",
    "NTPC":       "NTPC.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
    "BAJAJFINSV": "BAJAJFINSV.NS",
    "HCLTECH":    "HCLTECH.NS",
    "TECHM":      "TECHM.NS",
    "ONGC":       "ONGC.NS",
    "TATAPOWER": "TATAPOWER.NS",
    "TATASTEEL":  "TATASTEEL.NS",
    "ADANIENT":   "ADANIENT.NS",
    "ADANIPORTS": "ADANIPORTS.NS",
    "COALINDIA":  "COALINDIA.NS",
    "DIVISLAB":   "DIVISLAB.NS",
    "DRREDDY":    "DRREDDY.NS",
    "EICHERMOT":  "EICHERMOT.NS",
    "GRASIM":     "GRASIM.NS",
    "HEROMOTOCO": "HEROMOTOCO.NS",
    "HINDALCO":   "HINDALCO.NS",
    "JSWSTEEL":   "JSWSTEEL.NS",
    "M&M":        "M&M.NS",
    "INDUSINDBK": "INDUSINDBK.NS",
    "CIPLA":      "CIPLA.NS",
    "APOLLOHOSP": "APOLLOHOSP.NS",
    "BPCL":       "BPCL.NS",
    "BRITANNIA":  "BRITANNIA.NS",
    "SHRIRAMFIN": "SHRIRAMFIN.NS",
    "TATACONSUM": "TATACONSUM.NS",
    "BAJAJ-AUTO": "BAJAJ-AUTO.NS",
    "SBILIFE":    "SBILIFE.NS",
    "HDFCLIFE":   "HDFCLIFE.NS",
    "UPL":        "UPL.NS",
}

# ── FETCH ─────────────────────────────────────────────────────────────────────

def fetch_quote(symbol, name):
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=60d"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read())

        result = data["chart"]["result"][0]
        meta   = result["meta"]
        closes = result.get("indicators", {}).get("quote", [{}])[0].get("close", [])
        closes = [c for c in closes if c is not None]

        close      = round(meta["regularMarketPrice"], 2)
        prev_close = round(meta["chartPreviousClose"], 2)
        change     = round(close - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2)
        volume     = meta.get("regularMarketVolume", 0)
        avg_volume = meta.get("averageDailyVolume3Month", 0)
        week_52_high = round(meta.get("fiftyTwoWeekHigh", 0), 2)
        week_52_low  = round(meta.get("fiftyTwoWeekLow", 0), 2)
        pe_ratio     = round(meta.get("trailingPE", 0), 2) if meta.get("trailingPE") else None

        # Consecutive higher/lower closes
        consecutive_higher = 0
        consecutive_lower  = 0
        if len(closes) >= 2:
            for i in range(len(closes) - 1, 0, -1):
                if closes[i] > closes[i - 1]:
                    consecutive_higher += 1
                else:
                    break
        if len(closes) >= 2:
            for i in range(len(closes) - 1, 0, -1):
                if closes[i] < closes[i - 1]:
                    consecutive_lower += 1
                else:
                    break

        # Volume spike — volume > 1.5x average
        vol_spike = volume > (avg_volume * 1.5) if avg_volume else False

        # 52-week signals
        near_52w_high = close >= (week_52_high * 0.98) if week_52_high else False
        near_52w_low  = close <= (week_52_low  * 1.02) if week_52_low  else False
        is_52w_high   = close >= week_52_high if week_52_high else False
        is_52w_low    = close <= week_52_low  if week_52_low  else False

        # Build signals list
        signals = []
        if is_52w_high:                     signals.append("52W_HIGH")
        elif near_52w_high:                 signals.append("NEAR_52W_HIGH")
        if is_52w_low:                      signals.append("52W_LOW")
        elif near_52w_low:                  signals.append("NEAR_52W_LOW")
        if consecutive_higher >= 5:         signals.append(f"STREAK_{consecutive_higher}UP")
        elif consecutive_higher >= 3:       signals.append(f"STREAK_{consecutive_higher}UP")
        if consecutive_lower >= 5:          signals.append(f"STREAK_{consecutive_lower}DN")
        elif consecutive_lower >= 3:        signals.append(f"STREAK_{consecutive_lower}DN")
        if vol_spike and change_pct > 0:    signals.append("VOL_SPIKE_UP")
        if vol_spike and change_pct < 0:    signals.append("VOL_SPIKE_DN")

        return {
            "symbol":              name,
            "yahoo_symbol":        symbol,
            "close":               close,
            "prev_close":          prev_close,
            "change":              change,
            "change_pct":          change_pct,
            "volume":              volume,
            "avg_volume":          avg_volume,
            "week_52_high":        week_52_high,
            "week_52_low":         week_52_low,
            "pe_ratio":            pe_ratio,
            "consecutive_higher":  consecutive_higher,
            "consecutive_lower":   consecutive_lower,
            "vol_spike":           vol_spike,
            "near_52w_high":       near_52w_high,
            "near_52w_low":        near_52w_low,
            "is_52w_high":         is_52w_high,
            "is_52w_low":          is_52w_low,
            "signals":             signals,
        }

    except Exception as e:
        print(f"  ❌ {name} ({symbol}): {e}")
        return None

# ── SCANNER LOGIC ─────────────────────────────────────────────────────────────

def build_scanner(stocks):
    # Higher side — sorted by change_pct descending
    higher = sorted(
        [s for s in stocks if s["change_pct"] > 0],
        key=lambda x: x["change_pct"], reverse=True
    )[:TOP_N]

    # Lower side — sorted by change_pct ascending
    lower = sorted(
        [s for s in stocks if s["change_pct"] < 0],
        key=lambda x: x["change_pct"]
    )[:TOP_N]

    return higher, lower

# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print("━━━ TheCloseReport · Nifty 50 Scanner ━━━")
    print(f"  Date: {TODAY} · {NOW.strftime('%H:%M IST')}")

    stocks = []
    success = 0
    failed  = 0

    for name, symbol in NIFTY_50.items():
        print(f"  Fetching {name}...")
        quote = fetch_quote(symbol, name)
        if quote:
            stocks.append(quote)
            success += 1
            print(f"  ✅ {name}: ₹{quote['close']} ({'+' if quote['change_pct'] >= 0 else ''}{quote['change_pct']}%)")
        else:
            failed += 1

    print(f"\n  Fetched: {success} ✅  Failed: {failed} ❌")

    # Build scanner
    higher, lower = build_scanner(stocks)

    output = {
        "date":          TODAY,
        "generated_at":  FETCHED_AT,
        "source":        "Yahoo Finance · finance.yahoo.com",
        "universe":      "Nifty 50",
        "note":          "Previous close data only. TheCloseReport does not provide investment advice or recommendations.",
        "total_stocks":  len(stocks),
        "higher_count":  len([s for s in stocks if s["change_pct"] > 0]),
        "lower_count":   len([s for s in stocks if s["change_pct"] < 0]),
        "higher_side":   higher,
        "lower_side":    lower,
        "all_stocks":    stocks,
    }

    # Write archive
    os.makedirs(ARCHIVE, exist_ok=True)
    archive_path = f"{ARCHIVE}/{TODAY}.json"
    with open(archive_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n  ✅ Archive  → {archive_path}")

    # Write latest
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(LATEST, "w") as f:
        json.dump(output, f, indent=2)
    print(f"  ✅ Latest   → {LATEST}")

    # Console summary
    print(f"\n── Higher Side · Top 10 ────────────────────────")
    for i, s in enumerate(higher[:10], 1):
        sig = ", ".join(s["signals"]) if s["signals"] else "—"
        print(f"  {i:2}. {s['symbol']:<12} ₹{s['close']:>8.2f}  +{s['change_pct']:.2f}%  [{sig}]")

    print(f"\n── Lower Side · Top 10 ─────────────────────────")
    for i, s in enumerate(lower[:10], 1):
        sig = ", ".join(s["signals"]) if s["signals"] else "—"
        print(f"  {i:2}. {s['symbol']:<12} ₹{s['close']:>8.2f}  {s['change_pct']:.2f}%  [{sig}]")

    print(f"\n━━━ Done · {TODAY} ━━━")

if __name__ == "__main__":
    main()
