export const prerender = false;

// Simple rate limiting
const rateLimitMap = new Map<string, number>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip) || 0;
  
  if (now - lastRequest < 60000) { // 1 minute
    return true;
  }
  
  rateLimitMap.set(ip, now);
  return false;
}

import type { APIRoute } from 'astro';
import { promise } from 'astro:schema';

export const POST: APIRoute = async ({ request }) => {
  try {
    const text = await request.text();

    // Rate limit check
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
    
    if (!text) {
      return new Response(JSON.stringify({ error: 'Empty request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = JSON.parse(text);
    const { email } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    console.log('API Key:', RESEND_API_KEY ? 'Found' : 'NOT FOUND');

    // Add contact to Resend audience
    const audienceResponse = await fetch('https://api.resend.com/audiences', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const audienceData = await audienceResponse.json();
    const audienceId = audienceData?.data?.[0]?.id;

    if (audienceId) {
      await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            unsubscribed: false,
        }),
      });
      console.log('✅ Contact added to audience');
    }
    //Wait 1 second to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Send welcome email
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TheCloseReport <hello@theclosereport.com>',
        to: email,
        subject: '📊 Welcome to TheCloseReport!',
        html: `
          <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #020817; color: #f1f5f9;">
            <h1 style="font-size: 28px; font-weight: 800;">
              Welcome to The<span style="color: #3b82f6;">Close</span>Report! 📊
            </h1>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
              You're now subscribed to the daily global markets newsletter.
            </p>
            <ul style="color: #94a3b8; font-size: 14px; line-height: 2;">
              <li>📊 All 12 global indices — closing prices</li>
              <li>🟢 Top gainers & biggest decliners</li>
              <li>📝 Executive market summary</li>
              <li>🌍 Asia, Europe & US markets covered</li>
            </ul>
            <a href="https://theclosereport.com" 
               style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 700;">
              Visit TheCloseReport.com →
            </a>
            <p style="color: #475569; font-size: 12px; margin-top: 32px;">
              © 2026 TheCloseReport.com · Unsubscribe anytime
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const err = await emailResponse.json();
      throw new Error(err.message || 'Failed to send email');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};