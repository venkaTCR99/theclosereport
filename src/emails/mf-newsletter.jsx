// emails/mf-newsletter.jsx
// TheCloseReport — Daily MF NAV Newsletter (Free Top 5)
// Send via Resend: resend.send({ react: <MFNewsletter data={data} /> })
// Works with @react-email/components — same pattern as your markets email

import {
  Html, Head, Body, Container, Section,
  Row, Column, Text, Link, Hr, Preview,
} from "@react-email/components";

// ── STYLES ────────────────────────────────────────────────────────────────────
const s = {
  body:       { background: "#0D1B2A", margin: 0, padding: 0, fontFamily: "'Inter', Arial, sans-serif" },
  container:  { maxWidth: 560, margin: "0 auto", padding: "32px 16px" },
  card:       { background: "#1B2A3B", borderRadius: 12, overflow: "hidden", border: "1px solid #243447" },
  header:     { background: "#0D1B2A", padding: "24px 28px 20px", borderBottom: "1px solid #243447" },
  title:      { color: "#FFFFFF", fontSize: 20, fontWeight: 800, margin: "0 0 4px", fontFamily: "Georgia, serif" },
  date:       { color: "#8899AA", fontSize: 12, margin: 0 },
  sectionLbl: { background: "#243447", padding: "8px 28px" },
  sectionTxt: { color: "#C9A84C", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 },
  row:        { padding: "14px 28px", borderBottom: "1px solid #243447" },
  rank:       { color: "#C9A84C", fontSize: 13, fontWeight: 700, width: 24 },
  fundName:   { color: "#FFFFFF", fontSize: 14, fontWeight: 700, margin: "0 0 2px", fontFamily: "Georgia, serif" },
  fundHouse:  { color: "#8899AA", fontSize: 11, margin: 0 },
  nav:        { color: "#FFFFFF", fontSize: 16, fontWeight: 800, textAlign: "right", fontFamily: "Georgia, serif" },
  upPct:      { color: "#22C55E", fontSize: 12, fontWeight: 700, textAlign: "right", margin: "2px 0 0" },
  dnPct:      { color: "#EF4444", fontSize: 12, fontWeight: 700, textAlign: "right", margin: "2px 0 0" },
  footer:     { padding: "16px 28px" },
  footerTxt:  { color: "#8899AA", fontSize: 11, margin: "0 0 4px" },
  premiumBox: { background: "#0D1B2A", border: "1px solid #C9A84C", borderRadius: 10, padding: "20px 24px", margin: "20px 0 0" },
  premiumH:   { color: "#F0D080", fontSize: 15, fontWeight: 800, margin: "0 0 6px", fontFamily: "Georgia, serif" },
  premiumP:   { color: "#8899AA", fontSize: 12, margin: "0 0 16px", lineHeight: 1.6 },
  btn:        { background: "#C9A84C", color: "#0D1B2A", fontWeight: 800, fontSize: 13, padding: "10px 24px", borderRadius: 7, textDecoration: "none", display: "inline-block" },
};

function fmt(nav) {
  if (!nav) return "—";
  return "₹" + nav.toFixed(4);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function MFNewsletter({ data }) {
  const freeFunds = (data?.funds || []).filter(f => f.tier === "free");

  return (
    <Html lang="en">
      <Head />
      <Preview>
        MF NAV Close · {data?.date} · Top 5 Indian Mutual Funds
      </Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          {/* Main card */}
          <div style={s.card}>

            {/* Header */}
            <div style={s.header}>
              <p style={s.title}>🇮🇳 Mutual Funds — NAV Close</p>
              <p style={s.date}>{formatDate(data?.date)} · Source: AMFI India</p>
            </div>

            {/* Section label */}
            <div style={s.sectionLbl}>
              <p style={s.sectionTxt}>Top 5 · Free Daily Close</p>
            </div>

            {/* Fund rows */}
            {freeFunds.map((fund, i) => {
              const up = (fund.change_pct ?? 0) >= 0;
              return (
                <Row key={fund.scheme_code} style={{
                  ...s.row,
                  borderBottom: i === freeFunds.length - 1 ? "none" : "1px solid #243447",
                }}>
                  <Column style={{ width: 24, verticalAlign: "middle" }}>
                    <p style={s.rank}>{i + 1}</p>
                  </Column>
                  <Column style={{ verticalAlign: "middle", paddingLeft: 12 }}>
                    <p style={s.fundName}>{fund.short}</p>
                    <p style={s.fundHouse}>{fund.house} · {fund.category}</p>
                  </Column>
                  <Column style={{ width: 100, verticalAlign: "middle", textAlign: "right" }}>
                    <p style={s.nav}>{fmt(fund.nav)}</p>
                    <p style={up ? s.upPct : s.dnPct}>
                      {up ? "▲" : "▼"} {Math.abs(fund.change_pct ?? 0).toFixed(2)}%
                    </p>
                  </Column>
                </Row>
              );
            })}

            {/* Footer */}
            <div style={{ ...s.footer, borderTop: "1px solid #243447" }}>
              <p style={s.footerTxt}>Data: AMFI India · www.amfiindia.com</p>
              <p style={s.footerTxt}>TheCloseReport publishes NAV data only. Not investment advice.</p>
            </div>
          </div>

          {/* Premium CTA */}
          <div style={s.premiumBox}>
            <p style={s.premiumH}>🔒 Unlock Funds 6–10 + Weekly Summary</p>
            <p style={s.premiumP}>
              Premium subscribers get all 10 NAVs daily, weekly close summary
              (Mon–Fri), and full archive access.
            </p>
            <a href="https://www.theclosereport.com/premium" style={s.btn}>
              Unlock Premium →
            </a>
          </div>

          {/* Unsubscribe */}
          <Text style={{ color: "#4a5568", fontSize: 11, textAlign: "center", marginTop: 24 }}>
            You're receiving this because you subscribed at{" "}
            <Link href="https://www.theclosereport.com" style={{ color: "#C9A84C" }}>
              TheCloseReport.com
            </Link>
            {" · "}
            <Link href="{{{UNSUBSCRIBE_URL}}}" style={{ color: "#4a5568" }}>
              Unsubscribe
            </Link>
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
