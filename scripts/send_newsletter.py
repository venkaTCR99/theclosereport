import json
import os
import urllib.request
import urllib.parse
from datetime import date, timedelta

# Config
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
FROM_EMAIL = "TheCloseReport <hello@theclosereport.com>"
SITE_URL = "https://theclosereport.com"

# Get latest data file
def get_latest_data():
    data_dir = "src/data/markets"
    files = sorted([f for f in os.listdir(data_dir) if f.endswith('.json')], reverse=True)
    if not files:
        return None, None
    latest = files[0]
    date_str = latest.replace('.json', '')
    with open(f"{data_dir}/{latest}") as f:
        return json.load(f), date_str

# Format number
def fmt(n):
    return f"{n:,.2f}"

# Get subscribers from Resend
def get_subscribers():
    try:
        req = urllib.request.Request(
            "https://api.resend.com/contacts",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            }
        )
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            return [c['email'] for c in data.get('data', []) if not c.get('unsubscribed')]
    except Exception as e:
        print(f"❌ Error fetching subscribers: {e}")
        return []

# Build email HTML
def build_email(data, date_str):
    indices = data.get('indices', {})
    
    # Calculate stats
    index_list = list(indices.values())
    up = len([i for i in index_list if i.get('pct', 0) >= 0])
    down = len([i for i in index_list if i.get('pct', 0) < 0])
    
    sorted_indices = sorted(index_list, key=lambda x: x.get('pct', 0), reverse=True)
    best = sorted_indices[0] if sorted_indices else None
    worst = sorted_indices[-1] if sorted_indices else None

    # Index rows
    INDEX_NAMES = {
        "dow": "🇺🇸 Dow Jones", "sp500": "🇺🇸 S&P 500", "nasdaq": "🇺🇸 Nasdaq",
        "sensex": "🇮🇳 BSE Sensex", "nifty": "🇮🇳 Nifty 50",
        "sse": "🇨🇳 Shanghai SSE", "szse": "🇨🇳 Shenzhen",
        "nikkei": "🇯🇵 Nikkei 225", "kospi": "🇰🇷 KOSPI",
        "ftse": "🇬🇧 FTSE 100", "dax": "🇩🇪 DAX",
        "cac": "🇫🇷 CAC 40", "stoxx": "🇪🇺 Euro Stoxx 50",
    }

    rows = ""
    for key, name in INDEX_NAMES.items():
        if key in indices:
            idx = indices[key]
            pct = idx.get('pct', 0)
            change = idx.get('change', 0)
            close = idx.get('close', 0)
            color = "#10b981" if pct >= 0 else "#ef4444"
            arrow = "▲" if pct >= 0 else "▼"
            sign = "+" if pct >= 0 else ""
            rows += f"""
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px 16px; color: #f1f5f9; font-size: 13px;">{name}</td>
                <td style="padding: 10px 16px; color: #f1f5f9; font-size: 13px; text-align: right; font-weight: 600;">{fmt(close)}</td>
                <td style="padding: 10px 16px; color: {color}; font-size: 13px; text-align: right;">{sign}{fmt(change)}</td>
                <td style="padding: 10px 16px; color: {color}; font-size: 13px; text-align: right; font-weight: 700;">{arrow} {sign}{pct:.2f}%</td>
            </tr>"""

    best_text = f"{list(INDEX_NAMES.values())[list(INDEX_NAMES.keys()).index(next((k for k, v in indices.items() if v == best), 'dow'))]} +{best.get('pct', 0):.2f}%" if best else "N/A"
    worst_text = f"{list(INDEX_NAMES.values())[list(INDEX_NAMES.keys()).index(next((k for k, v in indices.items() if v == worst), 'dow'))]} {worst.get('pct', 0):.2f}%" if worst else "N/A"

    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #020817; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    
    <!-- Header -->
    <div style="text-align: center; padding: 32px 0 24px;">
      <h1 style="color: #f1f5f9; font-size: 28px; font-weight: 800; margin: 0;">
        The<span style="color: #3b82f6;">Close</span>Report
      </h1>
      <p style="color: #64748b; font-size: 13px; margin: 8px 0 0;">
        Daily Global Markets Snapshot — {date_str}
      </p>
    </div>

    <!-- Summary Bar -->
    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between;">
      <div style="text-align: center;">
        <div style="color: #10b981; font-size: 22px; font-weight: 800;">{up}</div>
        <div style="color: #64748b; font-size: 11px;">INDICES UP</div>
      </div>
      <div style="text-align: center;">
        <div style="color: #ef4444; font-size: 22px; font-weight: 800;">{down}</div>
        <div style="color: #64748b; font-size: 11px;">INDICES DOWN</div>
      </div>
      <div style="text-align: center;">
        <div style="color: #10b981; font-size: 13px; font-weight: 700;">▲ {best_text}</div>
        <div style="color: #64748b; font-size: 11px;">BEST</div>
      </div>
      <div style="text-align: center;">
        <div style="color: #ef4444; font-size: 13px; font-weight: 700;">▼ {worst_text}</div>
        <div style="color: #64748b; font-size: 11px;">WORST</div>
      </div>
    </div>

    <!-- Table -->
    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #1e293b;">
            <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-align: left; text-transform: uppercase;">Index</th>
            <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-align: right; text-transform: uppercase;">Close</th>
            <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-align: right; text-transform: uppercase;">Change</th>
            <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-align: right; text-transform: uppercase;">%</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="{SITE_URL}" style="display: inline-block; padding: 12px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
        View Full Report →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #475569; font-size: 11px; padding-top: 16px; border-top: 1px solid #1e293b;">
      <p style="margin: 0 0 4px;">© 2026 TheCloseReport.com · Daily Global Markets Snapshot</p>
      <p style="margin: 0;">Market data sourced from Yahoo Finance</p>
    </div>

  </div>
</body>
</html>"""
    return html

# Send email
def send_email(to_email, subject, html):
    try:
        payload = json.dumps({
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }).encode('utf-8')

        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            }
        )
        with urllib.request.urlopen(req) as response:
            return True
    except Exception as e:
        print(f"❌ Error sending to {to_email}: {e}")
        return False

def main():
    print("📧 Starting newsletter send...")

    data, date_str = get_latest_data()
    if not data:
        print("❌ No data found!")
        return

    print(f"📊 Using data for {date_str}")

    # Get subscribers
    subscribers = get_subscribers()
    print(f"👥 Found {len(subscribers)} subscribers")

    if not subscribers:
        print("⚠️ No subscribers found!")
        return

    # Build email
    html = build_email(data, date_str)
    subject = f"📊 TheCloseReport — {date_str} Market Close"

    # Send to all subscribers
    success = 0
    for email in subscribers:
        if send_email(email, subject, html):
            print(f"  ✅ Sent to {email}")
            success += 1
        else:
            print(f"  ❌ Failed: {email}")

    print(f"\n✅ Newsletter sent to {success}/{len(subscribers)} subscribers!")

if __name__ == "__main__":
    main()