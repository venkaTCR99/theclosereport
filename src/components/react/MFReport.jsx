// src/components/MFReport.jsx
// TheCloseReport.com — Mutual Funds Daily NAV Report
// Pure data display. No advice. No recommendations.

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  navy:      "#0D1B2A",
  navyMid:   "#1B2A3B",
  navyLight: "#243447",
  gold:      "#C9A84C",
  goldLight: "#F0D080",
  white:     "#FFFFFF",
  gray:      "#8899AA",
  grayLight: "#F0F4F8",
  green:     "#22C55E",
  greenBg:   "#052e16",
  red:       "#EF4444",
  redBg:     "#450a0a",
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(nav) {
  if (!nav) return "—";
  return "₹" + nav.toFixed(4);
}
function fmtPct(pct) {
  if (pct === null || pct === undefined) return "—";
  return (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric",
    month: "long", day: "numeric",
  });
}

// ── CATEGORY BADGE ────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  "Large Cap":  { bg: "#1e3a5f", text: "#93c5fd" },
  "Mid Cap":    { bg: "#3b1f5e", text: "#c4b5fd" },
  "Small Cap":  { bg: "#4a1942", text: "#f0abfc" },
  "Flexi Cap":  { bg: "#1a3a2e", text: "#6ee7b7" },
  "Index":      { bg: "#1a2e3b", text: "#7dd3fc" },
  "Hybrid":     { bg: "#3b2a12", text: "#fcd34d" },
};

function CategoryBadge({ category }) {
  const c = CATEGORY_COLORS[category] || { bg: "#1f2937", text: "#9ca3af" };
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 20,
      letterSpacing: "0.05em", textTransform: "uppercase",
    }}>
      {category}
    </span>
  );
}

// ── CHANGE PILL ───────────────────────────────────────────────────────────────
function ChangePill({ pct }) {
  if (pct === null || pct === undefined) return <span style={{ color: T.gray }}>—</span>;
  const up = pct >= 0;
  return (
    <span style={{
      background: up ? T.greenBg : T.redBg,
      color: up ? T.green : T.red,
      fontWeight: 700, fontSize: 13,
      padding: "3px 10px", borderRadius: 20,
      border: `1px solid ${up ? "#166534" : "#991b1b"}`,
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

// ── FUND ROW ──────────────────────────────────────────────────────────────────
function FundRow({ fund, rank, isLast }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "36px 1fr auto auto",
      alignItems: "center",
      gap: 16,
      padding: "18px 24px",
      borderBottom: isLast ? "none" : `1px solid ${T.navyLight}`,
      transition: "background 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = T.navyLight}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Rank */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: rank <= 5 ? T.navyLight : "#0a0f14",
        border: `1px solid ${rank <= 5 ? T.gold : "#334155"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: rank <= 5 ? T.gold : T.gray,
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>
        {rank}
      </div>

      {/* Fund Info */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{
            color: T.white, fontWeight: 700, fontSize: 15,
            fontFamily: "Georgia, serif",
          }}>
            {fund.short}
          </span>
          <CategoryBadge category={fund.category} />
        </div>
        <div style={{ color: T.gray, fontSize: 12 }}>{fund.house}</div>
      </div>

      {/* NAV */}
      <div style={{ textAlign: "right" }}>
        <div style={{
          color: T.white, fontWeight: 800, fontSize: 18,
          fontFamily: "Georgia, serif", letterSpacing: "-0.02em",
        }}>
          {fmt(fund.nav)}
        </div>
        <div style={{ color: T.gray, fontSize: 11, marginTop: 2 }}>
          prev: {fmt(fund.prev_nav)}
        </div>
      </div>

      {/* Change */}
      <div style={{ textAlign: "right", minWidth: 80 }}>
        <ChangePill pct={fund.change_pct} />
        <div style={{ color: T.gray, fontSize: 11, marginTop: 4 }}>
          {fund.change !== null ? (fund.change >= 0 ? "+" : "") + fund.change?.toFixed(4) : "—"}
        </div>
      </div>
    </div>
  );
}

// ── PREMIUM LOCK ──────────────────────────────────────────────────────────────
function PremiumLock() {
  return (
    <div style={{
      position: "relative",
      borderTop: `1px solid ${T.navyLight}`,
    }}>
      {/* Blurred rows preview */}
      <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none", opacity: 0.5 }}>
        {[6, 7, 8, 9, 10].map(i => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr auto auto",
            gap: 16, padding: "18px 24px",
            borderBottom: i < 10 ? `1px solid ${T.navyLight}` : "none",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#0a0f14", border: `1px solid #334155`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.gray, fontSize: 12, fontWeight: 700,
            }}>{i}</div>
            <div>
              <div style={{
                height: 14, width: `${120 + (i * 17 % 60)}px`,
                background: T.navyLight, borderRadius: 4, marginBottom: 6,
              }} />
              <div style={{
                height: 10, width: 90,
                background: T.navyLight, borderRadius: 4,
              }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                height: 18, width: 80,
                background: T.navyLight, borderRadius: 4, marginBottom: 4,
              }} />
              <div style={{ height: 10, width: 60, background: T.navyLight, borderRadius: 4 }} />
            </div>
            <div style={{ minWidth: 80, textAlign: "right" }}>
              <div style={{ height: 24, width: 70, background: T.navyLight, borderRadius: 20 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Lock overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "rgba(13,27,42,0.7)",
        backdropFilter: "blur(2px)",
      }}>
        <div style={{
          background: T.navyMid,
          border: `1px solid ${T.gold}`,
          borderRadius: 16, padding: "28px 36px",
          textAlign: "center", maxWidth: 340,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <div style={{
            color: T.goldLight, fontWeight: 800, fontSize: 16,
            fontFamily: "Georgia, serif", marginBottom: 8,
          }}>
            Premium — Funds 6–10
          </div>
          <div style={{ color: T.gray, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            Full Top 10 daily NAVs · Weekly close summary · Complete archive
          </div>
          <a
            href="/newsletter"
            style={{
              display: "inline-block",
              background: T.gold, color: T.navy,
              fontWeight: 800, fontSize: 14,
              padding: "10px 28px", borderRadius: 8,
              textDecoration: "none", letterSpacing: "0.02em",
            }}
          >
            Unlock Premium →
          </a>
        </div>
      </div>
    </div>
  );
}

// ── HEADER ────────────────────────────────────────────────────────────────────
function Header({ date }) {
  return (
    <div style={{
      borderBottom: `1px solid ${T.navyLight}`,
      padding: "24px 24px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>🇮🇳</span>
            <h1 style={{
              color: T.white, fontSize: 22, fontWeight: 800,
              fontFamily: "Georgia, serif", margin: 0,
            }}>
              Mutual Funds — NAV Close
            </h1>
          </div>
          <div style={{ color: T.gray, fontSize: 13 }}>
            {formatDate(date)} · Source: AMFI India
          </div>
        </div>
        <div style={{
          background: T.navyLight,
          border: `1px solid ${T.navyLight}`,
          borderRadius: 8, padding: "8px 16px",
          fontSize: 11, color: T.gray, textAlign: "right",
          lineHeight: 1.7,
        }}>
          <div style={{ color: T.goldLight, fontWeight: 700, marginBottom: 2 }}>
            NAV as of market close
          </div>
          Published by AMFI · Updated nightly
        </div>
      </div>
    </div>
  );
}

// ── SECTION LABEL ─────────────────────────────────────────────────────────────
function SectionLabel({ label, color, sub }) {
  return (
    <div style={{
      padding: "10px 24px",
      background: T.navyLight,
      borderBottom: `1px solid ${T.navyMid}`,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: color, display: "inline-block", flexShrink: 0,
      }} />
      <span style={{ color, fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ color: T.gray, fontSize: 11 }}>{sub}</span>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <div style={{
      padding: "16px 24px",
      borderTop: `1px solid ${T.navyLight}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 8,
    }}>
      <div style={{ color: T.gray, fontSize: 11 }}>
        Data sourced from AMFI India · www.amfiindia.com
      </div>
      <div style={{ color: T.gray, fontSize: 11 }}>
        TheCloseReport publishes NAV data only. Not investment advice.
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MFReport({ data }) {
  if (!data) {
    return (
      <div style={{
        background: T.navy, minHeight: "60vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: T.gray, fontSize: 15,
      }}>
        No data available. Check back after market close.
      </div>
    );
  }

  const freeFunds    = data.funds.filter(f => f.tier === "free");
  const premiumFunds = data.funds.filter(f => f.tier === "premium");

  return (
    <div style={{
      background: T.navy, minHeight: "100vh",
      fontFamily: "'Inter', 'Calibri', system-ui, sans-serif",
      padding: "32px 16px",
    }}>
      <div style={{
        maxWidth: 780, margin: "0 auto",
        background: T.navyMid,
        border: `1px solid ${T.navyLight}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <Header date={data.date} />

        {/* Free Section */}
        <SectionLabel
          label="Top 5 — Free"
          color={T.gold}
          sub="Daily NAV close · Available to all subscribers"
        />
        {freeFunds.map((fund, i) => (
          <FundRow
            key={fund.scheme_code}
            fund={fund}
            rank={i + 1}
            isLast={i === freeFunds.length - 1}
          />
        ))}

        {/* Premium Section */}
        <SectionLabel
          label="Funds 6–10 — Premium"
          color="#a78bfa"
          sub="Unlock for full Top 10 · Weekly summary · Archive"
        />
        <PremiumLock />

        {/* Footer */}
        <Footer />
      </div>

      {/* Newsletter CTA */}
      <div style={{
        maxWidth: 780, margin: "24px auto 0",
        background: T.navyMid,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "20px 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ color: T.goldLight, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            📧 Get Top 5 NAVs in your inbox — free, daily
          </div>
          <div style={{ color: T.gray, fontSize: 13 }}>
            Delivered every evening after AMFI publishes. No noise. Just the close.
          </div>
        </div>
        <a href="/newsletter" style={{
          background: T.gold, color: T.navy,
          fontWeight: 800, fontSize: 13,
          padding: "10px 24px", borderRadius: 8,
          textDecoration: "none", whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          Subscribe Free →
        </a>
      </div>
    </div>
  );
}
