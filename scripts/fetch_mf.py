#!/usr/bin/env python3
"""
TheCloseReport.com — Mutual Funds NAV Fetcher
Pulls daily NAV from AMFI India, writes JSON archive.

Usage:  python fetch_mf.py
Cron:   30 21 * * 1-5   python /path/to/scripts/fetch_mf.py
        (Mon–Fri, 9:30 PM IST — AMFI publishes ~8:30 PM IST)

Env:    AMFI_LOCAL=./mock_amfi.txt   (for local testing, skips live fetch)
"""

import os
import json
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── CONFIG ────────────────────────────────────────────────────────────────────

BASE_DIR    = Path(__file__).resolve().parent.parent
DATA_DIR    = BASE_DIR / "src" / "data" / "mutual-funds"
ARCHIVE_DIR = DATA_DIR / "archive"
LATEST_PATH = DATA_DIR / "latest.json"
AMFI_URL    = "https://www.amfiindia.com/spages/NAVAll.txt"

# Top 10 curated funds — DO NOT reorder (tier boundary is fixed at 5)
TOP_10_FUNDS = [
    # ── FREE (ranks 1–5) ─────────────────────────────────────
    {"scheme_code": "119598", "short": "SBI Bluechip",        "house": "SBI Mutual Fund",       "category": "Large Cap",  "tier": "free"},
    {"scheme_code": "118989", "short": "HDFC Mid-Cap",        "house": "HDFC Mutual Fund",       "category": "Mid Cap",    "tier": "free"},
    {"scheme_code": "122639", "short": "Parag Parikh Flexi",  "house": "PPFAS Mutual Fund",      "category": "Flexi Cap",  "tier": "free"},
    {"scheme_code": "120716", "short": "UTI Nifty 50",        "house": "UTI Mutual Fund",        "category": "Index",      "tier": "free"},
    {"scheme_code": "118778", "short": "Nippon Small Cap",    "house": "Nippon India MF",        "category": "Small Cap",  "tier": "free"},
    # ── PREMIUM (ranks 6–10) ─────────────────────────────────
    {"scheme_code": "118834", "short": "Mirae Large Cap",     "house": "Mirae Asset MF",         "category": "Large Cap",  "tier": "premium"},
    {"scheme_code": "120505", "short": "Axis Small Cap",      "house": "Axis Mutual Fund",       "category": "Small Cap",  "tier": "premium"},
    {"scheme_code": "127042", "short": "Motilal Midcap", "house": "Motilal Oswal MF", "category": "Mid Cap", "tier": "premium"},
    {"scheme_code": "120586", "short": "ICICI Bal Advantage", "house": "ICICI Prudential MF",    "category": "Hybrid",     "tier": "premium"},
    {"scheme_code": "119533", "short": "ABSL Frontline",      "house": "Aditya Birla Sun Life",  "category": "Large Cap",  "tier": "premium"},
]

# ── HELPERS ───────────────────────────────────────────────────────────────────

def today_ist() -> str:
    """Return today's date in IST as YYYY-MM-DD."""
    ist = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist).strftime("%Y-%m-%d")

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

# ── FETCH ─────────────────────────────────────────────────────────────────────

def fetch_amfi() -> str:
    """Fetch raw NAV text from AMFI India (or local file for testing)."""
    local = os.environ.get("AMFI_LOCAL", "").strip()
    if local:
        print(f"  Using local AMFI file: {local}")
        with open(local, "r", encoding="utf-8") as f:
            return f.read()
    print(f"  Fetching from {AMFI_URL} ...")
    req = urllib.request.Request(AMFI_URL, headers={"User-Agent": "TheCloseReport/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")

# ── PARSER ────────────────────────────────────────────────────────────────────
# AMFI line format: SchemeCode;ISIN1;ISIN2;SchemeName;NAV;Date

def parse_amfi(raw: str) -> tuple[dict, dict]:
    nav_map  = {}
    name_map = {}
    for line in raw.splitlines():
        parts = line.strip().split(";")
        if len(parts) < 6:
            continue
        code = parts[0].strip()
        if not code.isdigit() or len(code) != 6:
            continue
        name = parts[3].strip()
        # NAV position varies — scan all parts for valid float > 1
        nav = None
        for part in parts[4:]:
            try:
                val = float(part.strip())
                if val > 1:
                    nav = val
                    break
            except ValueError:
                continue
        if nav:
            nav_map[code]  = nav
            name_map[code] = name
    return nav_map, name_map

# ── PREVIOUS NAV ──────────────────────────────────────────────────────────────

def load_prev_navs() -> dict:
    """Load previous day's NAVs from latest.json for change calculation."""
    if not LATEST_PATH.exists():
        return {}
    try:
        with open(LATEST_PATH, "r") as f:
            data = json.load(f)
        return {f["scheme_code"]: f["nav"] for f in data.get("funds", []) if f.get("nav")}
    except Exception:
        return {}

# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print("━━━ TheCloseReport · Mutual Funds Fetch ━━━")

    raw = fetch_amfi()
    nav_map, name_map = parse_amfi(raw)
    print(f"  Parsed {len(nav_map)} scheme NAVs from AMFI.")

    prev_navs = load_prev_navs()
    today     = today_ist()

    funds = []
    for fund in TOP_10_FUNDS:
        code     = fund["scheme_code"]
        nav      = nav_map.get(code)
        name     = name_map.get(code, fund["short"])
        prev_nav = prev_navs.get(code)

        if nav and prev_nav:
            change     = round(nav - prev_nav, 4)
            change_pct = round((nav - prev_nav) / prev_nav * 100, 2)
        else:
            change     = None
            change_pct = None

        if not nav:
            print(f"  ⚠️  NAV missing for [{code}] {fund['short']} — verify scheme code")

        funds.append({
            "scheme_code": code,
            "name":        name,
            "short":       fund["short"],
            "house":       fund["house"],
            "category":    fund["category"],
            "tier":        fund["tier"],
            "nav":         nav,
            "prev_nav":    prev_nav,
            "change":      change,
            "change_pct":  change_pct,
        })

    output = {
        "date":          today,
        "generated_at":  now_iso(),
        "source":        "AMFI India · www.amfiindia.com",
        "note":          "NAV data published by AMFI. TheCloseReport publishes data only — no advice or recommendations.",
        "free_count":    5,
        "premium_count": 5,
        "funds":         funds,
    }

    # Write archive
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    archive_path = ARCHIVE_DIR / f"{today}.json"
    with open(archive_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"  ✅ Archive  → {archive_path}")

    # Write latest (overwrite)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(LATEST_PATH, "w") as f:
        json.dump(output, f, indent=2)
    print(f"  ✅ Latest   → {LATEST_PATH}")

    # Console summary
    print(f"\n── NAV Close · {today} {'─' * 36}")
    for fund in funds:
        nav_str = f"₹{fund['nav']:.4f}".rjust(14) if fund["nav"] else "           N/A".rjust(14)
        if fund["change_pct"] is not None:
            arrow   = "▲" if fund["change_pct"] >= 0 else "▼"
            chg_str = f"{arrow} {abs(fund['change_pct']):.2f}%"
        else:
            chg_str = "  —  "
        tag = "FREE   " if fund["tier"] == "free" else "PREMIUM"
        print(f"  [{tag}]  {fund['short']:<22}  {nav_str}   {chg_str}")
    print("─" * 60)
    print(f"  Done. Date: {today}\n")


if __name__ == "__main__":
    main()
