#!/usr/bin/env python3
"""
TheCloseReport.com — Mutual Funds Weekly Aggregator (PREMIUM)
Reads Mon–Fri daily archive JSONs → writes one weekly summary JSON.

Usage:  python weekly_mf.py
Cron:   0 22 * * 5   python /path/to/scripts/weekly_mf.py
        (Fridays, 10:00 PM IST — after fetch_mf.py completes)
"""

import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── CONFIG ────────────────────────────────────────────────────────────────────

BASE_DIR    = Path(__file__).resolve().parent.parent
ARCHIVE_DIR = BASE_DIR / "src" / "data" / "mutual-funds" / "archive"
WEEKLY_DIR  = BASE_DIR / "src" / "data" / "mutual-funds" / "weekly"

# ── DATE HELPERS ──────────────────────────────────────────────────────────────

def today_ist() -> str:
    ist = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist).strftime("%Y-%m-%d")

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def get_week_bounds(date_str: str) -> tuple[str, str]:
    """Return (monday, friday) for the week containing date_str."""
    d   = datetime.strptime(date_str, "%Y-%m-%d")
    mon = d - timedelta(days=d.weekday())           # weekday(): Mon=0, Fri=4
    fri = mon + timedelta(days=4)
    return mon.strftime("%Y-%m-%d"), fri.strftime("%Y-%m-%d")

def week_dates(monday: str) -> list[str]:
    """Return [Mon, Tue, Wed, Thu, Fri] date strings."""
    base = datetime.strptime(monday, "%Y-%m-%d")
    return [(base + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(5)]

# ── LOADER ────────────────────────────────────────────────────────────────────

def load_day(date_str: str) -> dict | None:
    path = ARCHIVE_DIR / f"{date_str}.json"
    if not path.exists():
        return None
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return None

# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print("━━━ TheCloseReport · Weekly MF Aggregator ━━━")

    today          = today_ist()
    monday, friday = get_week_bounds(today)
    dates          = week_dates(monday)

    print(f"  Week: {monday} → {friday}")

    # Load available daily files
    daily = {}
    for date in dates:
        day = load_day(date)
        if day:
            daily[date] = day
            print(f"  ✅ Loaded   {date}")
        else:
            print(f"  ⚠️  Missing  {date}  (holiday or not yet published)")

    if not daily:
        print("❌ No daily data found for this week. Exiting.")
        raise SystemExit(1)

    avail_dates = sorted(daily.keys())
    all_funds   = daily[avail_dates[0]]["funds"]

    # Build per-fund weekly summary
    weekly_funds = []
    for fund in all_funds:
        code = fund["scheme_code"]

        # Collect daily NAVs that exist
        daily_navs = []
        for date in avail_dates:
            match = next((f for f in daily[date]["funds"] if f["scheme_code"] == code), None)
            if match and match.get("nav"):
                daily_navs.append({"date": date, "nav": match["nav"]})

        nav_open  = daily_navs[0]["nav"]  if daily_navs else None
        nav_close = daily_navs[-1]["nav"] if daily_navs else None
        nav_high  = max(x["nav"] for x in daily_navs) if daily_navs else None
        nav_low   = min(x["nav"] for x in daily_navs) if daily_navs else None

        if nav_open and nav_close:
            week_change     = round(nav_close - nav_open, 4)
            week_change_pct = round((nav_close - nav_open) / nav_open * 100, 2)
        else:
            week_change     = None
            week_change_pct = None

        weekly_funds.append({
            "scheme_code":     code,
            "name":            fund.get("name", fund.get("short")),
            "short":           fund["short"],
            "house":           fund["house"],
            "category":        fund["category"],
            "tier":            fund["tier"],
            "week_open":       nav_open,
            "week_close":      nav_close,
            "week_high":       round(nav_high, 4) if nav_high else None,
            "week_low":        round(nav_low,  4) if nav_low  else None,
            "week_change":     week_change,
            "week_change_pct": week_change_pct,
            "trading_days":    len(daily_navs),
            "daily_navs":      daily_navs,
        })

    output = {
        "week_start":             monday,
        "week_end":               friday,
        "generated_at":           now_iso(),
        "source":                 "AMFI India · www.amfiindia.com",
        "note":                   "Weekly NAV summary. TheCloseReport publishes data only — no advice or recommendations.",
        "trading_days_available": len(avail_dates),
        "tier_split":             {"free": 5, "premium": 5},
        "funds":                  weekly_funds,
    }

    WEEKLY_DIR.mkdir(parents=True, exist_ok=True)
    out_path = WEEKLY_DIR / f"week-{friday}.json"
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n  ✅ Weekly summary → {out_path}")

    # Console summary
    print(f"\n── Weekly Close · {monday} → {friday} {'─' * 24}")
    for fund in weekly_funds:
        close_str = f"₹{fund['week_close']:.4f}".rjust(14) if fund["week_close"] else "           N/A".rjust(14)
        if fund["week_change_pct"] is not None:
            arrow   = "▲" if fund["week_change_pct"] >= 0 else "▼"
            chg_str = f"{arrow} {abs(fund['week_change_pct']):.2f}% (week)"
        else:
            chg_str = "  —  "
        tag = "FREE   " if fund["tier"] == "free" else "PREMIUM"
        print(f"  [{tag}]  {fund['short']:<22}  {close_str}   {chg_str}")
    print("─" * 62)
    print(f"  Done. Week ending: {friday}\n")


if __name__ == "__main__":
    main()
