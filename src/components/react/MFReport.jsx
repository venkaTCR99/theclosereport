// src/components/react/MFReport.jsx
// TheCloseReport.com — Mutual Funds Daily NAV Report
// Pure data display. No advice. No recommendations.
// Fully responsive — mobile, tablet, desktop.

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  navy:      "#0D1B2A",
  navyMid:   "#1B2A3B",
  navyLight: "#243447",
  gold:      "#C9A84C",
  goldLight: "#F0D080",
  white:     "#FFFFFF",
  gray:      "#8899AA",
  green:     "#22C55E",
  greenBg:   "#052e16",
  red:       "#EF4444",
  redBg:     "#450a0a",
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmt(nav) {
  if (!nav) return "—";
  return "₹" + nav.toFixed(4);
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
      fontSize: 9, fontWeight: 700,
      padding: "2px 7px", borderRadius: 20,
      letterSpacing: "0.04em", textTransform: "uppercase",
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {category}
    </span>
  );
}

// ── CHANGE PILL ───────────────────────────────────────────────────────────────
function ChangePill({ pct }) {
  if (pct === null || pct === undefined) return (
    <span style={{ color: T.gray, fontSize: 12 }}>—</span>
  );
  const up = pct >= 0;
  return (
    <span style={{
      background: up ? T.greenBg : T.redBg,
      color: up ? T.green : T.red,
      fontWeight: 700, fontSize: 12,
      padding: "3px 8px", borderRadius: 20,
      border: `1px solid ${up ? "#166534" : "#991b1b"}`,
      display: "inline-flex", alignItems: "center",
      gap: 3, whiteSpace: "nowrap",
    }}>
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

// ── FUND ROW ──────────────────────────────────────────────────────────────────
function FundRow({ fund, rank, isLast }) {
  return (
    <div style={{
      padding: "14px 16px",
      borderBottom: isLast ? "none" : `1px solid ${T.navyLight}`,
      transition: "background 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = T.navyLight}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Top row: rank + name + badge + change pill */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: 10, marginBottom: 8,
      }}>
        {/* Rank */}
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: T.navyLight,
          border: `1px solid ${T.gold}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.gold, fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {rank}
        </div>

        {/* Name + Badge */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "center",
            gap: 6, flexWrap: "wrap",
          }}>
            <span style={{
              color: T.white, fontWeight: 700, fontSize: 14,
              fontFamily: "Georgia, serif",
            }}>
              {fund.short}
            </span>
            <CategoryBadge category={fund.category} />
          </div>
          <div style={{ color: T.gray, fontSize: 11, marginTop: 2 }}>
            {fund.house}
          </div>
        </div>

        {/* Change Pill */}
        <div style={{ flexShrink: 0 }}>
          <ChangePill pct={fund.change_pct} />
        </div>
      </div>

      {/* Bottom row: NAV + prev + change value */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 38,
      }}>
        <div style={{
          color: T.white, fontWeight: 800, fontSize: 20,
          fontFamily: "Georgia, serif", letterSpacing: "-0.02em",
        }}>
          {fmt(fund.nav)}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: T.gray, fontSize: 11 }}>
            prev: {fmt(fund.prev_nav)}
          </div>
          <div style={{ color: T.gray, fontSize: 11, marginTop: 2 }}>
            {fund.change !== null && fund.change !== undefined
              ? (fund.change >= 0 ? "+" : "") + fund.change?.toFixed(4)
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PREMIUM LOCK ──────────────────────────────────────────────────────────────
function PremiumLock() {
  return (
    <div style={{ position: "relative", borderTop: `1px solid ${T.navyLight}` }}>
      {/* Blurred preview */}
      <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none", opacity: 0.4 }}>
        {[6, 7, 8, 9, 10].map(i => (
          <div key={i} style={{
            padding: "14px 16px",
            borderBottom: i < 10 ? `1px solid ${T.navyLight}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#0a0f14", border: "1px solid #334155",
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 13, width: `${100 + (i * 20 % 80)}px`, background: T.navyLight, borderRadius: 4, marginBottom: 5 }} />
                <div style={{ height: 10, width: 80, background: T.navyLight, borderRadius: 4 }} />
              </div>
              <div style={{ height: 22, width: 60, background: T.navyLight, borderRadius: 20 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 38 }}>
              <div style={{ height: 20, width: 90, background: T.navyLight, borderRadius: 4 }} />
              <div style={{ height: 20, width: 70, background: T.navyLight, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Lock overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "rgba(13,27,42,0.75)",
        backdropFilter: "blur(2px)",
        padding: "16px",
      }}>
        <div style={{
          background: T.navyMid,
          border: `1px solid ${T.gold}`,
          borderRadius: 14, padding: "24px 20px",
          textAlign: "center", width: "100%", maxWidth: 320,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>🔒</div>
          <div style={{
            color: T.goldLight, fontWeight: 800, fontSize: 15,
            fontFamily: "Georgia, serif", marginBottom: 8,
          }}>
            Premium — Funds 6–10
          </div>
          <div style={{ color: T.gray, fontSize: 12, lineHeight: 1.6, marginBottom: 18 }}>
            Full Top 10 daily NAVs · Weekly close summary · Complete archive
          </div>
          <a href="/premium" style={{
            display: "inline-block",
            background: T.gold, color: T.navy,
            fontWeight: 800, fontSize: 13,
            padding: "10px 24px", borderRadius: 8,
            textDecoration: "none",
          }}>
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
      padding: "20px 16px 16px",
    }}>
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 18 }}>🇮🇳</span>
            <h1 style={{
              color: T.white, fontSize: 18, fontWeight: 800,
              fontFamily: "Georgia, serif", margin: 0,
            }}>
              Mutual Funds — NAV Close
            </h1>
          </div>
          <div style={{ color: T.gray, fontSize: 12 }}>
            {formatDate(date)} · Source: AMFI India
          </div>
        </div>
        <div style={{
          background: T.navyLight,
          borderRadius: 8, padding: "7px 12px",
          fontSize: 11, color: T.gray, textAlign: "right",
          lineHeight: 1.7,
        }}>
          <div style={{ color: T.goldLight, fontWeight: 700, marginBottom: 1 }}>
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
      padding: "8px 16px",
      background: T.navyLight,
      borderBottom: `1px solid ${T.navyMid}`,
      display: "flex", alignItems: "center",
      gap: 8, flexWrap: "wrap",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: color, display: "inline-block", flexShrink: 0,
      }} />
      <span style={{
        color, fontWeight: 700, fontSize: 10,
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <span style={{ color: T.gray, fontSize: 10 }}>{sub}</span>
    </div>
  );
}

// ── COMPONENT FOOTER ──────────────────────────────────────────────────────────
function Footer() {
  return (
    <div style={{
      padding: "12px 16px",
      borderTop: `1px solid ${T.navyLight}`,
    }}>
      <div style={{ color: T.gray, fontSize: 10, marginBottom: 3 }}>
        Data sourced from AMFI India · www.amfiindia.com
      </div>
      <div style={{ color: T.gray, fontSize: 10 }}>
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
        color: T.gray, fontSize: 15, padding: 24, textAlign: "center",
      }}>
        No data available. Check back after market close.
      </div>
    );
  }

  const freeFunds = data.funds.filter(f => f.tier === "free");

  return (
    <div style={{
      background: T.navy, minHeight: "100vh",
      fontFamily: "'Inter', 'Calibri', system-ui, sans-serif",
      padding: "20px 12px",
    }}>
      {/* Main card */}
      <div style={{
        maxWidth: 680, margin: "0 auto",
        background: T.navyMid,
        border: `1px solid ${T.navyLight}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        <Header date={data.date} />

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

        <SectionLabel
          label="Funds 6–10 — Premium"
          color="#a78bfa"
          sub="Unlock for full Top 10 · Weekly summary · Archive"
        />
        <PremiumLock />

        <Footer />
      </div>

      {/* Newsletter CTA */}
      <div style={{
        maxWidth: 680, margin: "16px auto 0",
        background: T.navyMid,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "16px",
      }}>
        <div style={{
          color: T.goldLight, fontWeight: 700,
          fontSize: 14, marginBottom: 6,
        }}>
          📧 Get Top 5 NAVs in your inbox — free, daily
        </div>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ color: T.gray, fontSize: 12, flex: 1 }}>
            Delivered every evening after AMFI publishes. No noise. Just the close.
          </div>
          <a href="/newsletter" style={{
            background: T.gold, color: T.navy,
            fontWeight: 800, fontSize: 13,
            padding: "10px 20px", borderRadius: 8,
            textDecoration: "none", whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            Subscribe Free →
          </a>
        </div>
      </div>
    </div>
  );
}
