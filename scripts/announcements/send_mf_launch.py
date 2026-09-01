#!/usr/bin/env python3
"""
TheCloseReport.com — MF Launch Announcement
One-time script to announce Mutual Funds NAV addition to newsletter.

Usage:
    $env:RESEND_API_KEY="your_key"
    $env:NEWSLETTER_SUBSCRIBERS="email1@gmail.com,email2@gmail.com"
    python scripts/announcements/send_mf_launch.py

NOTE: Run once only! Delete or archive after sending.
"""

import json
import os
import time
import urllib.request

# ── CONFIG ────────────────────────────────────────────────────────────────────
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
FROM_EMAIL     = "TheCloseReport <hello@theclosereport.com>"
SUBJECT        = "🇮🇳 New: Mutual Fund NAVs now in your daily email!"
SITE_URL       = "https://theclosereport.com"

# ── SUBSCRIBERS ───────────────────────────────────────────────────────────────
def get_subscribers():
    subscribers_str = os.environ.get("NEWSLETTER_SUBSCRIBERS", "")
    if not subscribers_str:
        print("⚠️ No subscribers found in environment!")
        return []
    emails = [e.strip() for e in subscribers_str.split(",") if e.strip()]
    print(f"👥 Found {len(emails)} subscribers")
    return emails

# ── EMAIL HTML ────────────────────────────────────────────────────────────────
def build_html():
    return f"""<!DOCTYPE html>
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
        A quick update from us 🙏
      </p>
    </div>

    <!-- Main Card -->
    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 28px 24px; margin-bottom: 20px;">
      
      <p style="color: #f1f5f9; font-size: 16px; font-weight: 700; margin: 0 0 16px;">
        🇮🇳 Mutual Funds NAV — Now in your daily email!
      </p>

      <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
        Hey there,
      </p>

      <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
        Starting today, your daily TheCloseReport email now includes <strong style="color: #f1f5f9;">Top 5 Indian Mutual Fund NAV closes</strong> — right alongside your global markets snapshot.
      </p>

      <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
        Every evening after AMFI publishes, you'll get:
      </p>

      <!-- Feature list -->
      <div style="background: #0d1b2a; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
        <p style="color: #f1f5f9; font-size: 13px; margin: 0 0 10px;">✅ &nbsp;Top 5 MF NAV close prices — daily</p>
        <p style="color: #f1f5f9; font-size: 13px; margin: 0 0 10px;">✅ &nbsp;Day-over-day change %</p>
        <p style="color: #f1f5f9; font-size: 13px; margin: 0 0 10px;">✅ &nbsp;Covering Large Cap, Mid Cap, Small Cap, Flexi Cap & Index</p>
        <p style="color: #f1f5f9; font-size: 13px; margin: 0;">✅ &nbsp;Data sourced directly from AMFI India — official & accurate</p>
      </div>

      <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 6px;">
        As always — <strong style="color: #f1f5f9;">pure data. No advice. No noise. Just the close.</strong> 💎
      </p>

    </div>

    <!-- Premium CTA -->
    <div style="background: #0f172a; border: 1px solid #c9a84c; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-align: center;">
      <p style="color: #f0d080; font-size: 15px; font-weight: 700; margin: 0 0 8px;">
        🔒 Want the full Top 10?
      </p>
      <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 16px;">
        Upgrade to Premium and get all 10 fund NAVs daily, weekly close summary, and complete historical archive.
      </p>
      <a href="{SITE_URL}/newsletter"
         style="display: inline-block; padding: 12px 32px; background: #c9a84c; color: #0d1b2a; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px;">
        Unlock Premium →
      </a>
    </div>

    <!-- View on site -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="{SITE_URL}/mutual-funds"
         style="display: inline-block; padding: 12px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
        View MF Report on Site →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #475569; font-size: 11px; padding-top: 16px; border-top: 1px solid #1e293b;">
      <p style="margin: 0 0 4px;">© 2026 TheCloseReport.com · Daily Global Markets Snapshot</p>
      <p style="margin: 0;">Market data sourced from Yahoo Finance · MF data sourced from AMFI India</p>
      <p style="margin: 8px 0 0; color: #334155; font-size: 10px;">
        An <strong style="color: #475569;">Incredible<span style="color: #3b82f6;">Swipe</span> Studio</strong> Product
      </p>
    </div>

  </div>
</body>
</html>"""

# ── SEND ──────────────────────────────────────────────────────────────────────
def send_email(to_email, html):
    try:
        payload = json.dumps({
            "from": FROM_EMAIL,
            "to":   [to_email],
            "subject": SUBJECT,
            "html": html,
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization":  f"Bearer {RESEND_API_KEY}",
                "Content-Type":   "application/json",
                "User-Agent":     "Mozilla/5.0 (compatible; TheCloseReport/1.0)",
            }
        )
        with urllib.request.urlopen(req) as r:
            return True
    except Exception as e:
        print(f"  ❌ Error sending to {to_email}: {e}")
        return False

# ── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    print("━━━ TheCloseReport · MF Launch Announcement ━━━")

    if not RESEND_API_KEY:
        print("❌ RESEND_API_KEY not set!")
        return

    subscribers = get_subscribers()
    if not subscribers:
        print("❌ No subscribers found!")
        return

    html    = build_html()
    success = 0

    for email in subscribers:
        if send_email(email, html):
            print(f"  ✅ Sent to {email}")
            success += 1
        else:
            print(f"  ❌ Failed: {email}")
        time.sleep(1)  # 1 second between emails

    print(f"\n✅ Announcement sent to {success}/{len(subscribers)} subscribers!")
    print("NOTE: Delete or archive this script — it's a one-time send! 🎯")

if __name__ == "__main__":
    main()