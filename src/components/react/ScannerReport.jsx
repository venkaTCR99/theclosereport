// src/components/react/ScannerReport.jsx
// TheCloseReport.com — Nifty 50 Stock Scanner
// Premium only feature. Pure data. No advice. No recommendations.

import { useState } from "react";

// ── SIGNAL CONFIG ─────────────────────────────────────────────────────────────
const SIGNAL_LABELS = {
  "52W_HIGH":      { label: "52W High",    emoji: "🏆", color: "#f59e0b" },
  "NEAR_52W_HIGH": { label: "Near High",   emoji: "📈", color: "#10b981" },
  "52W_LOW":       { label: "52W Low",     emoji: "⚠️",  color: "#ef4444" },
  "NEAR_52W_LOW":  { label: "Near Low",    emoji: "📉", color: "#f97316" },
  "VOL_SPIKE_UP":  { label: "Vol Spike",   emoji: "⚡", color: "#10b981" },
  "VOL_SPIKE_DN":  { label: "Vol Spike",   emoji: "⚡", color: "#ef4444" },
};

// Streak signals — dynamic
function getSignalConfig(sig) {
  if (SIGNAL_LABELS[sig]) return SIGNAL_LABELS[sig];
  if (sig.includes("UP")) {
    const days = sig.replace("STREAK_", "").replace("UP", "");
    return { label: `${days}D Streak`, emoji: "🔥", color: "#10b981" };
  }
  if (sig.includes("DN")) {
    const days = sig.replace("STREAK_", "").replace("DN", "");
    return { label: `${days}D Drop`, emoji: "❄️", color: "#ef4444" };
  }
  return { label: sig, emoji: "📊", color: "#8899aa" };
}

// ── SIGNAL BADGE ──────────────────────────────────────────────────────────────
function SignalBadge({ signal }) {
  const cfg = getSignalConfig(signal);
  return (
    <span style={{
      background: cfg.color + "22",
      color: cfg.color,
      border: `1px solid ${cfg.color}44`,
      fontSize: 10, fontWeight: 700,
      padding: "2px 7px", borderRadius: 20,
      whiteSpace: "nowrap",
      display: "inline-flex", alignItems: "center", gap: 3,
    }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

// ── STOCK ROW ─────────────────────────────────────────────────────────────────
function StockRow({ stock, rank, isLast, side }) {
  const up = stock.change_pct >= 0;
  const color = up ? "#10b981" : "#ef4444";

  return (
    <div style={{
      padding: "12px 16px",
      borderBottom: isLast ? "none" : "1px solid var(--border)",
      transition: "background 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Top row */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: 10, marginBottom: 6,
      }}>
        {/* Rank */}
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "var(--surface)",
          border: `1px solid ${color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color, fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {rank}
        </div>

        {/* Name */}
        <div style={{ flex: 1 }}>
          <span style={{
            color: "var(--text)", fontWeight: 700, fontSize: 14,
            fontFamily: "Georgia, serif",
          }}>
            {stock.symbol}
          </span>
        </div>

        {/* Change pill */}
        <span style={{
          background: up ? "#052e16" : "#450a0a",
          color: color,
          border: `1px solid ${up ? "#166534" : "#991b1b"}`,
          fontWeight: 700, fontSize: 12,
          padding: "3px 8px", borderRadius: 20,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          {up ? "▲" : "▼"} {Math.abs(stock.change_pct).toFixed(2)}%
        </span>
      </div>

      {/* Bottom row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 36,
      }}>
        {/* Close + prev */}
        <div>
          <span style={{
            color: "var(--text)", fontWeight: 800, fontSize: 16,
            fontFamily: "Georgia, serif",
          }}>
            ₹{stock.close.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ color: "var(--muted)", fontSize: 11, marginLeft: 8 }}>
            prev: ₹{stock.prev_close.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Signals */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {stock.signals.length > 0
            ? stock.signals.slice(0, 2).map(sig => <SignalBadge key={sig} signal={sig} />)
            : <span style={{ color: "var(--muted)", fontSize: 11 }}>—</span>
          }
        </div>
      </div>

      {/* 52W bar */}
      {stock.week_52_high && stock.week_52_low && (
        <div style={{ paddingLeft: 36, marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: "var(--muted)", fontSize: 10 }}>
              52W Low: ₹{stock.week_52_low.toLocaleString("en-IN")}
            </span>
            <span style={{ color: "var(--muted)", fontSize: 10 }}>
              52W High: ₹{stock.week_52_high.toLocaleString("en-IN")}
            </span>
          </div>
          <div style={{
            height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, ((stock.close - stock.week_52_low) / (stock.week_52_high - stock.week_52_low)) * 100))}%`,
              background: up ? "#10b981" : "#ef4444",
              borderRadius: 2,
              transition: "width 0.3s",
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── FILTER PILLS ──────────────────────────────────────────────────────────────
const FILTERS = [
  { id: "all",      label: "All" },
  { id: "52w_high", label: "🏆 52W High" },
  { id: "streak",   label: "🔥 Streak" },
  { id: "volume",   label: "⚡ Volume" },
  { id: "52w_low",  label: "⚠️ 52W Low" },
];

function applyFilter(stocks, filter, side) {
  switch (filter) {
    case "52w_high":
      return stocks.filter(s => s.signals.some(sig => sig.includes("52W_HIGH")));
    case "52w_low":
      return stocks.filter(s => s.signals.some(sig => sig.includes("52W_LOW")));
    case "streak":
      return stocks.filter(s => s.signals.some(sig => sig.includes("STREAK")));
    case "volume":
      return stocks.filter(s => s.signals.some(sig => sig.includes("VOL_SPIKE")));
    default:
      return stocks;
  }
}

// ── PREMIUM LOCK ──────────────────────────────────────────────────────────────
function PremiumLock() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid #c9a84c",
        borderRadius: 16, padding: "40px 32px",
        textAlign: "center", maxWidth: 380,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔍🔒</div>
        <div style={{
          color: "#f0d080", fontWeight: 800, fontSize: 20,
          fontFamily: "Georgia, serif", marginBottom: 10,
        }}>
          Premium Feature
        </div>
        <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Nifty 50 Scanner is available to Premium subscribers.
            Get Top 25 Higher & Lower side stocks with signals — updated daily after NSE close.
        </div>
          <a href="/premium" style={{display: "inline-block",
              background: "#c9a84c", color: "#0d1b2a",
              fontWeight: 800, fontSize: 14,
              padding: "12px 32px", borderRadius: 8,
              textDecoration: "none",}}>
          View Plans →
        </a>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ScannerReport({ data, isPremium = false }) {

  const [tab,    setTab]    = useState("higher");
  const [filter, setFilter] = useState("all");

  // Show lock for non-premium
  if (!isPremium) return <PremiumLock />;

  if (!data) {
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--muted)", fontSize: 15, textAlign: "center", padding: 24,
      }}>
        No scanner data available. Check back after 4:30 PM IST on weekdays.
      </div>
    );
  }

  const higherStocks = applyFilter(data.higher_side || [], filter, "higher");
  const lowerStocks  = applyFilter(data.lower_side  || [], filter, "lower");
  const activeStocks = tab === "higher" ? higherStocks : lowerStocks;

  return (
    <div style={{
      fontFamily: "'Inter', 'Calibri', system-ui, sans-serif",
      padding: "20px 12px",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px 14px 0 0",
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", flexWrap: "wrap", gap: 10,
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 18 }}>🔍</span>
                <h1 style={{
                  color: "var(--text)", fontSize: 18, fontWeight: 800,
                  fontFamily: "Georgia, serif", margin: 0,
                }}>
                  Nifty 50 Scanner
                </h1>
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                {data.date} · NSE Previous Close · {data.universe}
              </div>
            </div>
            <div style={{
              background: "var(--border)",
              borderRadius: 8, padding: "7px 12px",
              fontSize: 11, color: "var(--muted)", textAlign: "right",
              lineHeight: 1.7,
            }}>
              <div style={{ color: "#f0d080", fontWeight: 700, marginBottom: 1 }}>
                🔒 Premium
              </div>
              Updated after NSE close
            </div>
          </div>

          {/* Summary bar */}
          <div style={{
            display: "flex", gap: 16, marginTop: 14,
            flexWrap: "wrap",
          }}>
            <div style={{
              background: "#052e1644", border: "1px solid #16653444",
              borderRadius: 8, padding: "8px 16px", textAlign: "center",
            }}>
              <div style={{ color: "#10b981", fontSize: 20, fontWeight: 800 }}>
                {data.higher_count}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Higher
              </div>
            </div>
            <div style={{
              background: "#450a0a44", border: "1px solid #991b1b44",
              borderRadius: 8, padding: "8px 16px", textAlign: "center",
            }}>
              <div style={{ color: "#ef4444", fontSize: 20, fontWeight: 800 }}>
                {data.lower_count}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Lower
              </div>
            </div>
            <div style={{
              background: "var(--border)",
              borderRadius: 8, padding: "8px 16px", textAlign: "center",
            }}>
              <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 800 }}>
                {data.total_stocks}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          borderRight: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}>
          {[
            { id: "higher", label: "📈 Higher Side", color: "#10b981" },
            { id: "lower",  label: "📉 Lower Side",  color: "#ef4444" },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setFilter("all"); }} style={{
              flex: 1, padding: "12px 16px",
              background: tab === t.id ? "var(--border)" : "transparent",
              border: "none", cursor: "pointer",
              color: tab === t.id ? t.color : "var(--muted)",
              fontWeight: tab === t.id ? 800 : 600,
              fontSize: 13, borderBottom: tab === t.id ? `2px solid ${t.color}` : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap",
          padding: "12px 16px",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          borderRight: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: "5px 12px", borderRadius: 20,
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              border: "1px solid",
              borderColor: filter === f.id ? "var(--accent)" : "var(--border)",
              background: filter === f.id ? "var(--accent)" : "transparent",
              color: filter === f.id ? "#fff" : "var(--muted)",
              transition: "all 0.15s",
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Stock list */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: "none",
          borderRadius: "0 0 14px 14px",
          overflow: "hidden",
        }}>
          {activeStocks.length > 0 ? (
            activeStocks.map((stock, i) => (
              <StockRow
                key={stock.symbol}
                stock={stock}
                rank={i + 1}
                isLast={i === activeStocks.length - 1}
                side={tab}
              />
            ))
          ) : (
            <div style={{
              padding: "40px 24px", textAlign: "center",
              color: "var(--muted)", fontSize: 14,
            }}>
              No stocks match this filter today.
            </div>
          )}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: 12, padding: "12px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 8,
        }}>
          <div style={{ color: "var(--muted)", fontSize: 10 }}>
            Data: Yahoo Finance · NSE previous close
          </div>
          <div style={{ color: "var(--muted)", fontSize: 10 }}>
            TheCloseReport publishes data only. Not investment advice.
          </div>
        </div>

      </div>
    </div>
  );
}
