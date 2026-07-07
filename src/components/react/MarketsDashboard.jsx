import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const TRANSLATIONS = {
  en: {
    snapshot: "Day Snapshot",
    index: "Index",
    close: "Close",
    change: "Change",
    percent: "%",
    all: "All",
    executive: "Executive Summary",
    captured: "Captured",
  },
  hi: {
    snapshot: "दिन का स्नैपशॉट",
    index: "सूचकांक",
    close: "बंद",
    change: "बदलाव",
    percent: "%",
    all: "सभी",
    executive: "कारकारी सारांश",
    captured: "डेटा समय",
  },
  te: {
    snapshot: "\u0C30\u0C4B\u0C1C\u0C41 \u0C38\u0C4D\u0C28\u0C3E\u0C2A\u0C4D\u0C37\u0C3E\u0C1F\u0C4D",
    index: "\u0C38\u0C42\u0C1A\u0C40",
    close: "\u0C2E\u0C41\u0C17\u0C3F\u0C02\u0C2A\u0C41",
    change: "\u0C2E\u0C3E\u0C30\u0C4D\u0C2A\u0C41",
    percent: "%",
    all: "\u0C05\u0C28\u0C4D\u0C28\u0C40",
    executive: "\u0C38\u0C3E\u0C30\u0C3E\u0C02\u0C36\u0C02",
    captured: "\u0C38\u0C2E\u0C2F\u0C02",
  },
  ta: {
    snapshot: "நாள் சருக்கம்",
    index: "குறியடு",
    close: "இறுதி",
    change: "மாற்றம்",
    percent: "%",
    all: "அனைத்தும்",
    executive: "நிர்வாக சருக்கம்",
    captured: "தரவு நேரம்",
  },
};

const INDICES = [
  {
    id: "dow", name: "Dow Jones", country: "🇺🇸 USA", region: "USA",
    close: 50786, change: -81, pct: -0.16, prev: 50867,
    color: "#6366f1", unit: "",
    highlights: ["Intel +12.8%, Cisco +3.5% led gains", "Microsoft & Visa declines limited upside", "Less tech exposure buffered chip selloff"],
    intraday: [
      {t:"09:30",v:50600},{t:"10:00",v:50750},{t:"10:30",v:50820},
      {t:"11:00",v:50900},{t:"11:30",v:50870},{t:"12:00",v:50820},
      {t:"12:30",v:50760},{t:"13:00",v:50840},{t:"13:30",v:50780},
      {t:"14:00",v:50800},{t:"14:30",v:50750},{t:"15:00",v:50790},
      {t:"16:00",v:50786},
    ],
  },
  {
    id: "sp500", name: "S&P 500", country: "🇺🇸 USA", region: "USA",
    close: 7406, change: 22, pct: 0.30, prev: 7384,
    color: "#10b981", unit: "",
    highlights: ["Bargain hunters returned after Friday rout", "Semis led bounce — VanEck SMH ETF +5%", "Still up ~10% YTD in record territory"],
    intraday: [
      {t:"09:30",v:7310},{t:"10:00",v:7350},{t:"10:30",v:7380},
      {t:"11:00",v:7420},{t:"11:30",v:7400},{t:"12:00",v:7390},
      {t:"12:30",v:7410},{t:"13:00",v:7430},{t:"13:30",v:7415},
      {t:"14:00",v:7420},{t:"14:30",v:7400},{t:"15:00",v:7408},
      {t:"16:00",v:7406},
    ],
  },
  {
    id: "nasdaq", name: "Nasdaq", country: "🇺🇸 USA", region: "USA",
    close: 25930, change: 220, pct: 0.86, prev: 25710,
    color: "#3b82f6", unit: "",
    highlights: ["Strongest US performer — chips rebounded", "Corning surged 9%+ on Amazon fiber deal", "Recovering from worst drop since April 2025"],
    intraday: [
      {t:"09:30",v:25500},{t:"10:00",v:25650},{t:"10:30",v:25780},
      {t:"11:00",v:25850},{t:"11:30",v:25900},{t:"12:00",v:25820},
      {t:"12:30",v:25880},{t:"13:00",v:25950},{t:"13:30",v:25980},
      {t:"14:00",v:25960},{t:"14:30",v:25920},{t:"15:00",v:25940},
      {t:"16:00",v:25930},
    ],
  },
  {
    id: "sensex", name: "BSE Sensex", country: "🇮🇳 India", region: "India",
    close: 73520, change: -718, pct: -0.97, prev: 74238,
    color: "#ef4444", unit: "",
    highlights: ["Iran–Israel escalation hit risk sentiment", "IT sector fell on AI disruption fears", "Nifty 50 tested critical 23,000 support"],
    intraday: [
      {t:"09:15",v:74100},{t:"09:30",v:73950},{t:"10:00",v:73780},
      {t:"10:30",v:73850},{t:"11:00",v:73700},{t:"11:30",v:73600},
      {t:"12:00",v:73680},{t:"12:30",v:73550},{t:"13:00",v:73490},
      {t:"13:30",v:73420},{t:"14:00",v:73520},{t:"14:30",v:73380},
      {t:"15:00",v:73460},{t:"15:30",v:73520},
    ],
  },
  {
  id: "nifty", name: "Nifty 50", country: "🇮🇳 India", region: "India",
  close: 23500, change: 120, pct: 0.51, prev: 23380,
  color: "#f59e0b", unit: "",
  highlights: [
    "Broad market index — 50 large cap stocks",
    "Benchmark for Indian equity market",
    "Tracks NSE listed companies",
  ],
  intraday: [
    {t:"09:15",v:23400},{t:"10:00",v:23450},{t:"10:30",v:23480},
    {t:"11:00",v:23520},{t:"11:30",v:23500},{t:"12:00",v:23510},
    {t:"12:30",v:23490},{t:"13:00",v:23520},{t:"13:30",v:23510},
    {t:"14:00",v:23530},{t:"14:30",v:23500},{t:"15:00",v:23510},
    {t:"15:30",v:23500},
    ],
  },
  {
    id: "sse", name: "Shanghai SSE", country: "🇨 China", region: "Asia",
    close: 3959, change: -68, pct: -1.70, prev: 4027,
    color: "#ef4444", unit: "",
    highlights: ["Global tech rout spilled into mainland", "Oil surge on Middle East risk hit mood", "Domestic policy support limited losses"],
    intraday: [
      {t:"09:30",v:4020},{t:"10:00",v:4000},{t:"10:30",v:3990},
      {t:"11:00",v:3975},{t:"11:30",v:3980},{t:"13:00",v:3970},
      {t:"13:30",v:3965},{t:"14:00",v:3955},{t:"14:30",v:3960},
      {t:"15:00",v:3959},
    ],
  },
  {
    id: "szse", name: "Shenzhen", country: "🇨 China", region: "Asia",
    close: 14821, change: -493, pct: -3.22, prev: 15314,
    color: "#ef4444", unit: "",
    highlights: ["Tech-heavy weighting amplified selloff", "Sharper fall than Shanghai", "Risk aversion on geopolitical fears"],
    intraday: [
      {t:"09:30",v:15200},{t:"10:00",v:15050},{t:"10:30",v:14950},
      {t:"11:00",v:14880},{t:"11:30",v:14900},{t:"13:00",v:14840},
      {t:"13:30",v:14800},{t:"14:00",v:14820},{t:"14:30",v:14830},
      {t:"15:00",v:14821},
    ],
  },
  {
    id: "nikkei", name: "Nikkei 225", country: "🇯🇵 Japan", region: "Asia",
    close: 64025, change: -2564, pct: -3.85, prev: 66589,
    color: "#ef4444", unit: "",
    highlights: ["3rd straight session of losses", "Sumco -13.9%, Tokuyama -10.9%", "BoJ rate hike fears compound selloff"],
    intraday: [
      {t:"09:00",v:66000},{t:"09:30",v:65500},{t:"10:00",v:65000},
      {t:"10:30",v:64800},{t:"11:00",v:64600},{t:"11:30",v:64700},
      {t:"12:00",v:64400},{t:"12:30",v:64200},{t:"13:00",v:64100},
      {t:"13:30",v:64050},{t:"14:00",v:64100},{t:"14:30",v:64025},
      {t:"15:30",v:64025},
    ],
  },
  {
    id: "kospi", name: "KOSPI", country: "🇰🇷 S. Korea", region: "Asia",
    close: 7780, change: -381, pct: -4.66, prev: 8161,
    color: "#ef4444", unit: "",
    highlights: ["Circuit breaker triggered — halted 20min", "Samsung -10.2%, SK Hynix -7.3%", "Worst performing major index on the day"],
    intraday: [
      {t:"09:00",v:8100},{t:"09:30",v:7980},{t:"10:00",v:7850},
      {t:"10:30",v:7750},{t:"11:00",v:7720},{t:"11:30",v:7760},
      {t:"12:00",v:7800},{t:"12:30",v:7770},{t:"13:00",v:7750},
      {t:"13:30",v:7780},{t:"14:00",v:7790},{t:"14:30",v:7780},
      {t:"15:30",v:7780},
    ],
  },
  {
    id: "ftse", name: "FTSE 100", country: "🇬🇧 London", region: "Europe",
    close: 10372, change: 3, pct: 0.04, prev: 10369,
    color: "#8b5cf6", unit: "",
    highlights: ["Energy stocks cushioned the fall", "Flat close amid global risk-off", "UK EV sales +34.2% YoY positive backdrop"],
    intraday: [
      {t:"08:00",v:10340},{t:"08:30",v:10360},{t:"09:00",v:10380},
      {t:"09:30",v:10370},{t:"10:00",v:10390},{t:"10:30",v:10360},
      {t:"11:00",v:10350},{t:"11:30",v:10370},{t:"12:00",v:10380},
      {t:"12:30",v:10365},{t:"13:00",v:10375},{t:"16:30",v:10372},
    ],
  },
  {
    id: "dax", name: "DAX", country: "🇩🇪 Germany", region: "Europe",
    close: 24759, change: -188, pct: -0.75, prev: 24947,
    color: "#f59e0b", unit: "",
    highlights: ["Export industrials bore the brunt", "New US tariff threat of 10–12.5%", "Eurozone Q1 GDP contracted 0.2%"],
    intraday: [
      {t:"09:00",v:24900},{t:"09:30",v:24860},{t:"10:00",v:24820},
      {t:"10:30",v:24800},{t:"11:00",v:24780},{t:"11:30",v:24820},
      {t:"12:00",v:24790},{t:"12:30",v:24760},{t:"13:00",v:24750},
      {t:"13:30",v:24780},{t:"14:00",v:24770},{t:"17:30",v:24759},
    ],
  },
  {
    id: "cac", name: "CAC 40", country: "🇫🇷 France", region: "Europe",
    close: 8218, change: -26, pct: -0.32, prev: 8244,
    color: "#f59e0b", unit: "",
    highlights: ["Luxury goods softened the blow", "Held up better than DAX peers", "Geopolitical uncertainty capped gains"],
    intraday: [
      {t:"09:00",v:8230},{t:"09:30",v:8240},{t:"10:00",v:8225},
      {t:"10:30",v:8235},{t:"11:00",v:8220},{t:"11:30",v:8230},
      {t:"12:00",v:8215},{t:"12:30",v:8210},{t:"13:00",v:8220},
      {t:"13:30",v:8215},{t:"14:00",v:8218},{t:"17:30",v:8218},
    ],
  },
  {
    id: "stoxx", name: "Euro Stoxx 50", country: "🇪🇺 Europe", region: "Europe",
    close: 6062, change: -41, pct: -0.68, prev: 6103,
    color: "#f59e0b", unit: "",
    highlights: ["Pan-European blue-chips under pressure", "STOXX 600 declined 0.53% on the week", "Eurozone retail sales fell 0.4% in April"],
    intraday: [
      {t:"09:00",v:6095},{t:"09:30",v:6080},{t:"10:00",v:6070},
      {t:"10:30",v:6060},{t:"11:00",v:6055},{t:"11:30",v:6065},
      {t:"12:00",v:6058},{t:"12:30",v:6050},{t:"13:00",v:6062},
      {t:"13:30",v:6060},{t:"14:00",v:6062},{t:"17:30",v:6062},
    ],
  },
  {
    id: "asx",
    name: "ASX 200",
    country: "🇦🇺 Australia",
    region: "Australia",
    close: 8200,
    change: 45,
    pct: 0.55,
    prev: 8155,
    color: "#f59e0b",
    unit: "",
    highlights: [
      "Australian benchmark index",
      "Top 200 ASX listed companies",
      "Mining & banking heavy index",
    ],
    intraday: [
      {t:"10:00",v:8155},{t:"10:30",v:8170},{t:"11:00",v:8180},
      {t:"11:30",v:8190},{t:"12:00",v:8185},{t:"12:30",v:8195},
      {t:"13:00",v:8200},{t:"13:30",v:8195},{t:"14:00",v:8200},
      {t:"14:30",v:8205},{t:"15:00",v:8200},{t:"15:30",v:8200},
    ],
  },
  {
    id: "bovespa",
    name: "Bovespa",
    country: "🇧🇷 Brazil",
    region: "Americas",
    close: 128500,
    change: 850,
    pct: 0.67,
    prev: 127650,
    color: "#10b981",
    unit: "",
    highlights: [
    "Brazil's main stock exchange",
    "Largest in Latin America",
    "Commodities & banking focused",
  ],
    intraday: [
      {t:"10:00",v:127650},{t:"10:30",v:127800},{t:"11:00",v:128000},
      {t:"11:30",v:128200},{t:"12:00",v:128100},{t:"12:30",v:128300},
      {t:"13:00",v:128400},{t:"13:30",v:128350},{t:"14:00",v:128450},
      {t:"14:30",v:128500},{t:"15:00",v:128500},{t:"15:30",v:128500},
    ],
  },
  {
     id: "idx",
    name: "IDX Composite",
    country: "🇮🇩 Indonesia",
    region: "Asia",
    close: 7200,
    change: -35,
    pct: -0.48,
    prev: 7235,
    color: "#ef4444",
    unit: "",
    highlights: [
    "Indonesia Stock Exchange index",
    "Southeast Asia's largest market",
    "Banking & commodity stocks",
    ],
    intraday: [
    {t:"09:30",v:7235},{t:"10:00",v:7220},{t:"10:30",v:7210},
    {t:"11:00",v:7215},{t:"11:30",v:7205},{t:"12:00",v:7210},
    {t:"13:00",v:7205},{t:"13:30",v:7200},{t:"14:00",v:7200},
    {t:"14:30",v:7195},{t:"15:00",v:7200},{t:"15:30",v:7200},
    ],
  },
  {
    id: "hsi",
    name: "Hang Seng",
    country: "🇭🇰 Hong Kong",
    region: "Asia",
    close: 21500,
    change: 150,
    pct: 0.70,
    prev: 21350,
    color: "#3b82f6",
    unit: "",
    highlights: [
      "Hong Kong's benchmark index",
      "Gateway to Chinese markets",
      "Finance & tech heavy",
    ],
    intraday: [
    {t:"09:30",v:21350},{t:"10:00",v:21400},{t:"10:30",v:21450},
    {t:"11:00",v:21480},{t:"11:30",v:21460},{t:"12:00",v:21500},
    {t:"13:00",v:21490},{t:"13:30",v:21500},{t:"14:00",v:21510},
    {t:"14:30",v:21500},{t:"15:00",v:21500},{t:"15:30",v:21500},
  ],
  },
{
    id: "sti",
    name: "STI",
    country: "🇸🇬 Singapore",
    region: "Asia",
    close: 3800,
    change: 25,
    pct: 0.66,
    prev: 3775,
    color: "#f59e0b",
    unit: "",
    highlights: [
    "Singapore's benchmark index",
    "Southeast Asia financial hub",
    "Banking & real estate focused",
  ],
  intraday: [
    {t:"09:00",v:3775},{t:"09:30",v:3780},{t:"10:00",v:3785},
    {t:"10:30",v:3790},{t:"11:00",v:3795},{t:"11:30",v:3790},
    {t:"12:00",v:3795},{t:"13:00",v:3798},{t:"13:30",v:3800},
    {t:"14:00",v:3800},{t:"14:30",v:3800},{t:"15:00",v:3800},
  ],
  },
];

const REGIONS = ["All", "USA", "India", "Asia", "Australia", "Americas", "Europe"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 6, padding: "6px 10px" }}>
        <p style={{ color: "#94a3b8", fontSize: 11, margin: 0 }}>{label}</p>
        <p style={{ color: "#f8fafc", fontSize: 13, fontWeight: 700, margin: 0 }}>
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const IndexCard = ({ idx, date }) => {
  const isUp = idx.pct >= 0;
  const color = isUp ? "#10b981" : "#ef4444";
  const minV = Math.min(...idx.intraday.map(d => d.v));
  const maxV = Math.max(...idx.intraday.map(d => d.v));
  const pad = (maxV - minV) * 0.15 || 50;
  const openVal = idx.intraday[0].v;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "18px 20px",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <div style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
            {idx.country}
          </div>
          <div style={{ color: "var(--text)", fontSize: 17, fontWeight: 700 }}>
            {idx.name}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 800 }}>
            {idx.close.toLocaleString()}
          </div>
          <div style={{ color, fontSize: 13, fontWeight: 600 }}>
            {isUp ? "▲" : "▼"} {Math.abs(idx.change).toLocaleString()} ({isUp ? "+" : ""}{idx.pct.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div style={{ height: 80, margin: "10px 0 8px 0" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={idx.intraday} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <YAxis domain={[minV - pad, maxV + pad]} hide />
            <XAxis dataKey="t" hide />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={openVal} stroke="#334155" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="v" stroke={idx.color} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

     <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginBottom: 10 }}>
        <span>{idx.intraday[0].t}</span>
        <span style={{ color: "var(--accent)", fontSize: 10 }}>
          {idx.fetchedAt 
             ? `Captured: ${new Date(idx.fetchedAt).toLocaleString('en-IN', { 
                 timeZone: 'Asia/Kolkata',
                   month: 'short',
                   day: 'numeric',
                   hour: '2-digit',
                   minute: '2-digit',
              })} IST`
            : date || "Today"
          }
        </span>
        <span>{idx.intraday[idx.intraday.length - 1].t}</span>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        {[
          `${idx.pct >= 0 ? "Gained" : "Declined"} ${Math.abs(idx.pct)}% on the day`,
          `Closed at ${idx.close.toLocaleString()} — ${idx.pct >= 0 ? "above" : "below"} previous session`,
          `${Math.abs(idx.pct) > 2 ? "High volatility session" : Math.abs(idx.pct) > 1 ? "Moderate movement" : "Relatively stable session"}`,
        ].map((h, i) => (
          <div key={i} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
          <span style={{ color: idx.color, fontSize: 10, marginTop: 3, flexShrink: 0 }}>◆</span>
          <span style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.4 }}>{h}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MarketsDashboard({ data, date }) {
  const realData = data ? JSON.parse(data) : null;
  const [region, setRegion] = useState("All");
  const [lang, setLang] = useState(
    typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'en') : 'en'
  );

  // Listen for language changes
  if (typeof window !== 'undefined') {
    window.addEventListener('langchange', (e) => {
      setLang(e.detail);
    });
  }

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const mergedIndices = INDICES.map(idx => {
  if (realData && realData[idx.id]) {
    const real = realData[idx.id];
    return {
      ...idx,
      close: real.close,
      change: real.change,
      pct: real.pct,
      prev: real.close - real.change,
      fetchedAt: real.fetchedAt,
      region: real.region || idx.region,
    };
  }
  return idx;
});
  const filtered = region === "All" ? mergedIndices : mergedIndices.filter(i => i.region?.toLowerCase() === region.toLowerCase());

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 40px" }}>

      {/* Snapshot Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
            {t.snapshot} — {date}
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[t.index, t.close, t.change, t.percent].map(h => (
                <th key={h} style={{ padding: "8px 6px", textAlign: h === "Index" ? "left" : "right", fontSize: 10, whiteSpace: "nowrap", fontFamily: "'Noto Sans Telugu', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans', sans-serif", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mergedIndices.map((idx, i) => (
              <tr key={idx.id} style={{ borderBottom: i < INDICES.length - 1 ? "1px solid var(--border)" : "none" }}>
                <td style={{ padding: "9px 6px", fontSize: 13, fontFamily: "'Noto Sans Telugu', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans', sans-serif", color: "var(--text)" }}>
                  {idx.country.split(" ")[0]} {idx.name}
                </td>
                <td style={{ padding: "9px 6px", textAlign: "right", fontSize: 13, fontFamily: "'Noto Sans Telugu', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans', sans-serif", color: "var(--text)", fontWeight: 600 }}>
                  {idx.close.toLocaleString()}
                </td>
                <td style={{ padding: "9px 6px", textAlign: "right", fontSize: 13, fontFamily: "'Noto Sans Telugu', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans', sans-serif", color: idx.pct >= 0 ? "#10b981" : "#ef4444" }}>
                  {idx.pct >= 0 ? "+" : ""}{idx.change.toLocaleString()}
                </td>
                <td style={{ padding: "9px 6px", textAlign: "right", fontSize: 13, fontFamily: "'Noto Sans Telugu', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans', sans-serif", fontWeight: 700, color: idx.pct >= 0 ? "#10b981" : "#ef4444" }}>
                  {idx.pct >= 0 ? "+" : ""}{idx.pct.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Region Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {REGIONS.map(r => (
          <button key={r} onClick={() => setRegion(r)} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: "1px solid",
            borderColor: region === r ? "var(--accent)" : "var(--border)",
            background: region === r ? "var(--accent)" : "var(--surface)",
            color: region === r ? "#fff" : "var(--muted)",
            transition: "all 0.15s",
          }}>
            {r === "All" ? t.all : r}
          </button>
        ))}
      </div>

      {/* Index Cards */}
      {filtered.map(idx => <IndexCard key={idx.id} idx={idx} date={date} />)}

      {/* Summary */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "20px 24px", marginTop: 8,
      }}>
        <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
            ◆ {t.executive}
        </div>
  <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
  {(() => {
  const today = date;
  const up = mergedIndices.filter(i => i.pct >= 0).length;
  const down = mergedIndices.filter(i => i.pct < 0).length;
  const best = [...mergedIndices].sort((a, b) => b.pct - a.pct)[0];
  const worst = [...mergedIndices].sort((a, b) => a.pct - b.pct)[0];

  const asiaIndices = mergedIndices.filter(i => i.region === 'asia' || i.region === 'india');
  const usaIndices = mergedIndices.filter(i => i.region === 'usa');
  const euIndices = mergedIndices.filter(i => i.region === 'europe');

  const asiaUpdated = asiaIndices.some(i => i.fetchedAt);
  const usaUpdated = usaIndices.some(i => i.fetchedAt);
  const euUpdated = euIndices.some(i => i.fetchedAt);
  const allUpdated = asiaUpdated && usaUpdated && euUpdated;

    if (allUpdated) {
      return `Global markets closed mixed on ${date}. ${up} of ${mergedIndices.length} indices finished in positive territory while ${down} declined. Best performer was ${best.name} (${best.pct > 0 ? "+" : ""}${best.pct}%) and the biggest decliner was ${worst.name} (${worst.pct}%).`;
    } else if (asiaUpdated && !usaUpdated && !euUpdated) {
      const asiaUp = asiaIndices.filter(i => i.pct >= 0).length;
      const asiaDown = asiaIndices.filter(i => i.pct < 0).length;
      return `Asian & Indian markets closed on ${date}. ${asiaUp} indices gained while ${asiaDown} declined. European and US markets data will update after their close.`;
    } else if (asiaUpdated && euUpdated && !usaUpdated) {
      return `Asian, Indian & European markets closed on ${date}. ${up} of 12 indices in positive territory so far. US markets data will update after close.`;
    } else {
      return `Market data for ${date} is being collected. Check back after 4PM IST for Asian markets and 12:30AM IST for US & European closing data.`;
    }
  })()}
</p>
      </div>
    </div>
  );
}