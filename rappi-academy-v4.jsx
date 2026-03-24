import { useState, useEffect, useRef } from "react";

const ADMIN_CODE = "ADMIN9";
const SUPER_CODE = "SUPER9";

const EXCUSE_REASONS = [
  "Problemas de conexión",
  "Incapacidad médica",
  "Urgencia personal",
  "No tenía dispositivo disponible",
  "Conflicto de horario con cliente",
  "Otra razón",
];

const SAMPLE_QUIZZES = [
  {
    id: "q1", title: "Fundamentos de Markdown",
    questions: [
      { id: "q1_1", type: "single", text: "¿Cuál es el descuento mínimo recomendado para aparecer en la sección 'Ofertas' de Rappi?", time: 20, options: ["5%", "10%", "15%", "20%"], correct: 2 },
      { id: "q1_2", type: "truefalse", text: "Un restaurante puede tener activo un Markdown y un Ad al mismo tiempo.", time: 15, options: ["Verdadero", "Falso"], correct: 0 },
      { id: "q1_3", type: "single", text: "¿Qué métrica mide mejor el impacto de un Markdown en ventas?", time: 25, options: ["Número de órdenes", "GMV generado", "Ticket promedio", "Tasa de conversión"], correct: 3 },
      { id: "q1_4", type: "multi", text: "¿Cuáles son tipos de Markdown disponibles en Rappi? (selecciona todos)", time: 30, options: ["Por producto", "Por categoría", "Por horario", "Por zona geográfica"], correct: [0, 1, 2] },
    ],
    sessions: [
      { id: "s1", date: "2024-11-15", participants: 48, avgScore: 72, farmerResults: [
        { email: "carlos.gomez@rappi.com", totalQ: 4, answered: 4, correct: 3, incorrect: 1, noAnswer: 0 },
        { email: "maria.lopez@rappi.com", totalQ: 4, answered: 4, correct: 4, incorrect: 0, noAnswer: 0 },
        { email: "juan.perez@rappi.com", totalQ: 4, answered: 3, correct: 2, incorrect: 1, noAnswer: 1 },
        { email: "ana.torres@rappi.com", totalQ: 4, answered: 4, correct: 1, incorrect: 3, noAnswer: 0 },
      ], excusados: [{ farmerEmail: "sofia.ramirez@rappi.com", supervisorEmail: "sup@rappi.com", reason: "Incapacidad médica", timestamp: "2024-11-15 10:32" }] },
    ],
  },
  {
    id: "q2", title: "Operaciones & Calidad",
    questions: [
      { id: "q2_1", type: "single", text: "¿Cuál es el tiempo de preparación máximo recomendado para un restaurante longtail?", time: 20, options: ["15 minutos", "20 minutos", "25 minutos", "30 minutos"], correct: 1 },
      { id: "q2_2", type: "truefalse", text: "Un restaurante con más del 5% de cancelaciones pierde visibilidad en el algoritmo.", time: 15, options: ["Verdadero", "Falso"], correct: 0 },
      { id: "q2_3", type: "single", text: "¿Qué acción reduce más rápido la tasa de reclamos?", time: 20, options: ["Actualizar fotos", "Revisar catálogo de precios", "Capacitar al staff en empaque", "Activar Ads"], correct: 2 },
    ],
    sessions: [{ id: "s3", date: "2025-01-20", participants: 89, avgScore: 65, farmerResults: [], excusados: [] }],
  },
];

function genCode() { return Math.floor(100000 + Math.random() * 900000).toString(); }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pct(correct, total) { return total === 0 ? 0 : Math.round((correct / total) * 100); }

function buildCSV(session, quizTitle) {
  const headers = ["#", "Correo Farmer", "% Asertividad", "Debió Responder", "Respondió", "Correctas", "Incorrectas", "No Respondió", "Estado"];
  const excEmails = (session.excusados || []).map(e => e.farmerEmail);
  const rows = [];
  let idx = 1;
  (session.farmerResults || []).forEach(f => { rows.push([idx++, f.email, pct(f.correct, f.totalQ) + "%", f.totalQ, f.answered, f.correct, f.incorrect, f.noAnswer, excEmails.includes(f.email) ? "Excusado" : "Presentó"]); });
  (session.excusados || []).filter(e => !(session.farmerResults || []).some(r => r.email === e.farmerEmail)).forEach(e => { rows.push([idx++, e.farmerEmail, "—", "—", "—", "—", "—", "—", "Excusado"]); });
  return [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
}

function openCSV(csv, title) {
  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  link.download = `${title.replace(/ /g, "_")}_resultados.csv`;
  link.click();
}

// ── SKIN / HAIR / SHIRT OPTIONS ──────────────────────────────────────────────
const SKIN_TONES = ["#FDDBB4", "#F0C28A", "#D4956A", "#A0614A", "#6B3F2E"];
const HAIR_COLORS = ["#1a0a00", "#4a2000", "#8B4513", "#D4A017", "#FF6B6B", "#4A90D9", "#E8E8E8"];
const SHIRT_COLORS = ["#FF441F", "#FF6B6B", "#4A90D9", "#50C878", "#9B59B6", "#F39C12", "#1a1a2e"];

// ── AVATAR SVG ────────────────────────────────────────────────────────────────
function Avatar({ config, size = 80 }) {
  const { skin, hair, shirt, gender, accessory } = config;
  const isFemale = gender === "female";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: "50%", display: "block" }}>
      <circle cx="50" cy="50" r="50" fill="#1a1a2e" />

      {isFemale ? (
        <>
          {/* === FEMALE AVATAR === */}
          {/* Long hair BACK layer (behind body) */}
          <path d="M29 38 Q24 60 26 82 Q32 90 38 88 Q34 72 33 52Z" fill={hair} />
          <path d="M71 38 Q76 60 74 82 Q68 90 62 88 Q66 72 67 52Z" fill={hair} />

          {/* Body / shirt - feminine cut */}
          <path d="M22 100 Q20 74 34 69 Q42 74 50 75 Q58 74 66 69 Q80 74 78 100Z" fill={shirt} />
          {/* Neckline V shape */}
          <path d="M41 69 Q50 78 59 69 L57 73 Q50 80 43 73Z" fill="rgba(255,255,255,0.12)" />

          {/* Neck */}
          <rect x="43" y="56" width="14" height="15" rx="4" fill={skin} />

          {/* Head - slightly rounder/softer */}
          <ellipse cx="50" cy="43" rx="19" ry="21" fill={skin} />

          {/* Ears (hidden behind hair mostly) */}
          <ellipse cx="31" cy="44" rx="3.5" ry="4.5" fill={skin} />
          <ellipse cx="69" cy="44" rx="3.5" ry="4.5" fill={skin} />

          {/* Hair top - smooth voluminous top */}
          <ellipse cx="50" cy="26" rx="21" ry="13" fill={hair} />
          {/* Hair sides flowing down - smooth curves */}
          <path d="M29 30 Q24 42 26 58 Q28 62 31 60 Q30 46 32 36Z" fill={hair} />
          <path d="M71 30 Q76 42 74 58 Q72 62 69 60 Q70 46 68 36Z" fill={hair} />
          {/* Hair front parting */}
          <path d="M30 26 Q50 18 70 26 Q65 22 50 20 Q35 22 30 26Z" fill={hair} />
          {/* Center part highlight */}
          <path d="M44 20 Q50 17 56 20 Q50 19 44 20Z" fill="rgba(255,255,255,0.08)" />

          {/* Eyelashes (top) */}
          <path d="M36 40 Q40 38 44 40" stroke={hair} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M56 40 Q60 38 64 40" stroke={hair} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.9" />

          {/* Eyes - larger, almond shape for female */}
          <ellipse cx="40" cy="43.5" rx="4.5" ry="3.5" fill="white" />
          <ellipse cx="60" cy="43.5" rx="4.5" ry="3.5" fill="white" />
          <circle cx="41" cy="43.5" r="2.5" fill="#1a0a00" />
          <circle cx="61" cy="43.5" r="2.5" fill="#1a0a00" />
          <circle cx="42" cy="42.5" r="0.9" fill="white" />
          <circle cx="62" cy="42.5" r="0.9" fill="white" />
          {/* Lower lash line */}
          <path d="M36.5 45.5 Q40 47 43.5 45.5" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" fill="none" />
          <path d="M56.5 45.5 Q60 47 63.5 45.5" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" fill="none" />

          {/* Eyebrows - arched and thin */}
          <path d="M36 37.5 Q40 35.5 44 37" stroke={hair} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M56 37 Q60 35.5 64 37.5" stroke={hair} strokeWidth="1.4" fill="none" strokeLinecap="round" />

          {/* Nose - delicate */}
          <path d="M48.5 48 Q50 51.5 51.5 48" stroke={skin === "#FDDBB4" ? "#c8906a" : "#7a4a30"} strokeWidth="1" fill="none" strokeLinecap="round" />
          <circle cx="47.5" cy="50.5" r="1" fill={skin === "#FDDBB4" ? "#d4956a" : "#7a4a30"} opacity="0.5" />
          <circle cx="52.5" cy="50.5" r="1" fill={skin === "#FDDBB4" ? "#d4956a" : "#7a4a30"} opacity="0.5" />

          {/* Mouth - smile with lips */}
          {/* Upper lip */}
          <path d="M43.5 55 Q46 53.5 50 54 Q54 53.5 56.5 55" stroke="#c06080" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          {/* Smile curve */}
          <path d="M43.5 55 Q50 60.5 56.5 55" stroke="#b05070" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* Lip fill */}
          <path d="M43.5 55 Q46 53.5 50 54 Q54 53.5 56.5 55 Q53 57 50 57.5 Q47 57 43.5 55Z" fill="#e08aaa" />
          {/* Bottom lip highlight */}
          <path d="M46 57 Q50 58.5 54 57" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          {/* Smile dimples */}
          <circle cx="42" cy="56.5" r="1" fill="rgba(200,80,100,0.2)" />
          <circle cx="58" cy="56.5" r="1" fill="rgba(200,80,100,0.2)" />

          {/* Cheek blush */}
          <ellipse cx="34" cy="49" rx="5" ry="3" fill="rgba(220,100,120,0.15)" />
          <ellipse cx="66" cy="49" rx="5" ry="3" fill="rgba(220,100,120,0.15)" />

          {/* Accessories */}
          {accessory === "glasses" && <>
            <ellipse cx="40" cy="43.5" rx="6.5" ry="5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />
            <ellipse cx="60" cy="43.5" rx="6.5" ry="5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />
            <line x1="46.5" y1="43.5" x2="53.5" y2="43.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />
            <line x1="27" y1="42.5" x2="33.5" y2="43.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />
            <line x1="73" y1="42.5" x2="66.5" y2="43.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />
          </>}
          {accessory === "headset" && <>
            <path d="M31 38 Q31 20 50 20 Q69 20 69 38" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="27" y="37" width="8" height="12" rx="4" fill="#2a2a3e" />
            <rect x="65" y="37" width="8" height="12" rx="4" fill="#2a2a3e" />
            <circle cx="27" cy="49" r="2.5" fill="#FF441F" />
          </>}
          {accessory === "cap" && <>
            <ellipse cx="50" cy="27" rx="22" ry="8" fill={hair} />
            <ellipse cx="50" cy="22" rx="20" ry="7" fill={hair} />
            <rect x="28" y="25" width="44" height="6" rx="0" fill={hair} />
            <rect x="64" y="24" width="15" height="5" rx="2.5" fill={hair} />
          </>}
          {accessory === "earrings" && <>
            <circle cx="27.5" cy="48" r="2.5" fill="#FFD700" />
            <circle cx="27.5" cy="52.5" r="1.8" fill="#FFD700" opacity="0.8" />
            <circle cx="72.5" cy="48" r="2.5" fill="#FFD700" />
            <circle cx="72.5" cy="52.5" r="1.8" fill="#FFD700" opacity="0.8" />
          </>}
        </>
      ) : (
        <>
          {/* === MALE AVATAR === */}
          {/* Body / shirt */}
          <path d="M18 100 Q18 70 35 66 Q50 75 65 66 Q82 70 82 100Z" fill={shirt} />
          <rect x="44" y="65" width="5" height="10" rx="1" fill="rgba(255,255,255,0.2)" />
          <rect x="51" y="65" width="5" height="10" rx="1" fill="rgba(255,255,255,0.2)" />

          {/* Neck */}
          <rect x="42" y="56" width="16" height="14" rx="3" fill={skin} />

          {/* Head */}
          <ellipse cx="50" cy="45" rx="19" ry="21" fill={skin} />

          {/* Ears */}
          <ellipse cx="31" cy="45" rx="4" ry="5" fill={skin} />
          <ellipse cx="69" cy="45" rx="4" ry="5" fill={skin} />

          {/* Hair */}
          <ellipse cx="50" cy="28" rx="20" ry="11" fill={hair} />
          <path d="M30 35 Q29 28 50 24 Q71 28 70 35 Q68 30 50 27 Q32 30 30 35Z" fill={hair} />

          {/* Eyes */}
          <ellipse cx="40" cy="44" rx="3.5" ry="3.5" fill="white" />
          <ellipse cx="60" cy="44" rx="3.5" ry="3.5" fill="white" />
          <circle cx="41" cy="44" r="2.2" fill="#1a0a00" />
          <circle cx="61" cy="44" r="2.2" fill="#1a0a00" />
          <circle cx="42" cy="43" r="0.8" fill="white" />
          <circle cx="62" cy="43" r="0.8" fill="white" />

          {/* Eyebrows - thicker/flatter */}
          <path d="M36 37.5 Q40 36.5 44 37.5" stroke={hair} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M56 37.5 Q60 36.5 64 37.5" stroke={hair} strokeWidth="2.2" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M48 48 Q50 52 52 48" stroke={skin === "#FDDBB4" ? "#c8906a" : "#7a4a30"} strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Mouth */}
          <path d="M44 56 Q50 60 56 56" stroke="#a05050" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Accessories */}
          {accessory === "glasses" && <>
            <circle cx="40" cy="44" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <circle cx="60" cy="44" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <line x1="47" y1="44" x2="53" y2="44" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <line x1="27" y1="43" x2="33" y2="44" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <line x1="73" y1="43" x2="67" y2="44" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          </>}
          {accessory === "headset" && <>
            <path d="M30 38 Q30 18 50 18 Q70 18 70 38" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="26" y="37" width="9" height="13" rx="4" fill="#2a2a3e" />
            <rect x="65" y="37" width="9" height="13" rx="4" fill="#2a2a3e" />
            <circle cx="26" cy="50" r="3" fill="#FF441F" />
          </>}
          {accessory === "cap" && <>
            <ellipse cx="50" cy="28" rx="23" ry="7" fill={hair} />
            <rect x="27" y="22" width="46" height="8" rx="4" fill={hair} />
            <rect x="27" y="28" width="46" height="5" rx="0" fill={hair} />
            <ellipse cx="50" cy="22" rx="22" ry="6" fill={hair} />
            <rect x="64" y="26" width="16" height="5" rx="2.5" fill={hair} />
          </>}
        </>
      )}
    </svg>
  );
}

// ── GLOBAL STYLES (injected once) ─────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a12; }
  .ra-root { font-family: 'DM Sans', sans-serif; background: #0a0a12; min-height: 100vh; color: #fff; }
  .ra-display { font-family: 'Nunito', sans-serif; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,68,31,.5)} 50%{box-shadow:0 0 0 12px rgba(255,68,31,0)} }
  @keyframes glow { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes timerShrink { from{width:100%} to{width:0%} }
  .fade-up { animation: fadeUp .5s ease both; }
  .fade-up-1 { animation: fadeUp .5s .1s ease both; }
  .fade-up-2 { animation: fadeUp .5s .2s ease both; }
  .fade-up-3 { animation: fadeUp .5s .3s ease both; }
  .glass { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(12px); }
  .glass-light { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); }
  .opt-btn { transition: all .2s; }
  .opt-btn:hover:not(:disabled) { transform: translateY(-2px); border-color: rgba(255,68,31,.5) !important; background: rgba(255,68,31,.1) !important; }
  .opt-btn.selected { border-color: #FF441F !important; background: rgba(255,68,31,.2) !important; }
  .opt-btn:active { transform: scale(.98); }
  .admin-card { transition: all .2s; cursor: pointer; }
  .admin-card:hover { transform: translateY(-4px); border-color: rgba(255,68,31,.4) !important; }
  .swatch { transition: transform .15s; cursor: pointer; }
  .swatch:hover { transform: scale(1.2); }
  .btn-primary { transition: all .2s; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(255,68,31,.4) !important; }
  .btn-primary:active { transform: scale(.98); }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #FF441F !important; box-shadow: 0 0 0 3px rgba(255,68,31,.15); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 4px; }
`;

function StyleInject() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

// ── BG DECORATION ─────────────────────────────────────────────────────────────
function BgOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,68,31,.12) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,144,217,.08) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: "40%", left: "50%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,68,31,.05) 0%, transparent 70%)", transform: "translate(-50%,-50%)" }} />
    </div>
  );
}

// ── LOGO ──────────────────────────────────────────────────────────────────────
function Logo({ subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
      <div style={{ width: 52, height: 52, background: "linear-gradient(135deg, #FF441F, #ff6b3d)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 8px 24px rgba(255,68,31,.4)", flexShrink: 0 }}>🍕</div>
      <div>
        <div className="ra-display" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.5px", background: "linear-gradient(90deg, #fff 60%, rgba(255,255,255,.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Rappi Academy</div>
        {subtitle && <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ── INPUT ─────────────────────────────────────────────────────────────────────
function Input({ style, ...props }) {
  return <input style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, fontSize: 15, color: "#fff", fontFamily: "inherit", ...style }} {...props} />;
}

function Select({ style, children, ...props }) {
  return <select style={{ width: "100%", padding: "13px 16px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, fontSize: 14, color: "#fff", fontFamily: "inherit", ...style }} {...props}>{children}</select>;
}

// ── GLASS CARD ────────────────────────────────────────────────────────────────
function Card({ children, style, className = "glass" }) {
  return <div className={className} style={{ borderRadius: 20, padding: 28, marginBottom: 16, ...style }}>{children}</div>;
}

// ── LABEL ─────────────────────────────────────────────────────────────────────
function Label({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{children}</div>;
}

// ── BUTTON ────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, style, variant = "primary", disabled }) {
  const base = { padding: "13px 20px", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all .2s", opacity: disabled ? .5 : 1 };
  const variants = {
    primary: { background: "linear-gradient(135deg, #FF441F, #ff6b3d)", color: "#fff", boxShadow: "0 4px 20px rgba(255,68,31,.3)", ...base },
    ghost: { background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.1)", ...base },
    blue: { background: "linear-gradient(135deg, #4A90D9, #6ab0f5)", color: "#fff", boxShadow: "0 4px 20px rgba(74,144,217,.3)", ...base },
    green: { background: "linear-gradient(135deg, #1a7340, #27ae60)", color: "#fff", boxShadow: "0 4px 16px rgba(26,115,64,.3)", ...base, padding: "10px 18px" },
    mini: { padding: "6px 14px", background: "linear-gradient(135deg, #FF441F, #ff6b3d)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  };
  return <button className={variant === "primary" || variant === "blue" ? "btn-primary" : ""} style={{ ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>{children}</button>;
}

// ── SCORE BADGE ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color = score >= 80 ? "#27ae60" : score >= 60 ? "#f39c12" : "#e74c3c";
  return (
    <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${color}`, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color }}>
      {score}%
    </div>
  );
}

// ── STATUS PILL ───────────────────────────────────────────────────────────────
function Pill({ type }) {
  const cfg = type === "Presentó" ? { bg: "rgba(39,174,96,.15)", color: "#27ae60", border: "rgba(39,174,96,.3)" } : { bg: "rgba(243,156,18,.15)", color: "#f39c12", border: "rgba(243,156,18,.3)" };
  return <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{type}</span>;
}

// ── RESULTS TABLE ─────────────────────────────────────────────────────────────
function ResultsTable({ session }) {
  const excEmails = (session.excusados || []).map(e => e.farmerEmail);
  const allRows = [
    ...(session.farmerResults || []).map((f, i) => ({ ...f, isExc: excEmails.includes(f.email), idx: i + 1 })),
    ...(session.excusados || []).filter(e => !(session.farmerResults || []).some(r => r.email === e.farmerEmail)).map((e, i) => ({ email: e.farmerEmail, isExc: true, totalQ: "—", answered: "—", correct: "—", incorrect: "—", noAnswer: "—", idx: (session.farmerResults || []).length + i + 1 }))
  ];
  const thStyle = { padding: "10px 12px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".5px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap" };
  const tdStyle = { padding: "11px 12px", fontSize: 12, color: "rgba(255,255,255,.75)", borderBottom: "1px solid rgba(255,255,255,.04)" };
  return (
    <div style={{ overflowX: "auto", maxHeight: 380, borderRadius: 12, border: "1px solid rgba(255,255,255,.08)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead style={{ position: "sticky", top: 0, background: "#131325" }}>
          <tr>{["#", "Correo", "%", "Debió", "Respondió", "✓", "✗", "—", "Estado"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {allRows.length === 0 && <tr><td colSpan={9} style={{ ...tdStyle, textAlign: "center", color: "rgba(255,255,255,.2)", padding: 32 }}>Sin datos aún</td></tr>}
          {allRows.map((f, i) => {
            const score = typeof f.correct === "number" ? pct(f.correct, f.totalQ) : null;
            return (
              <tr key={i} style={{ background: f.isExc ? "rgba(243,156,18,.04)" : "transparent" }}>
                <td style={tdStyle}>{f.idx}</td>
                <td style={{ ...tdStyle, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.email}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: score === null ? "rgba(255,255,255,.3)" : score >= 80 ? "#27ae60" : score >= 60 ? "#f39c12" : "#e74c3c" }}>{score !== null ? score + "%" : "—"}</td>
                <td style={tdStyle}>{f.totalQ}</td>
                <td style={tdStyle}>{f.answered}</td>
                <td style={{ ...tdStyle, color: "#27ae60", fontWeight: 700 }}>{f.correct}</td>
                <td style={{ ...tdStyle, color: "#e74c3c", fontWeight: 700 }}>{f.incorrect}</td>
                <td style={{ ...tdStyle, color: "rgba(255,255,255,.3)" }}>{f.noAnswer}</td>
                <td style={tdStyle}><Pill type={f.isExc ? "Excusado" : "Presentó"} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("home");
  const [email, setEmail] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [avatar, setAvatar] = useState({ gender: "male", skin: SKIN_TONES[0], hair: HAIR_COLORS[0], shirt: SHIRT_COLORS[0], accessory: "none" });
  const [adminPwd, setAdminPwd] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [superEmail, setSuperEmail] = useState("");
  const [superCode, setSuperCode] = useState("");
  const [superEmailErr, setSuperEmailErr] = useState("");
  const [superCodeErr, setSuperCodeErr] = useState("");
  const [showSuper, setShowSuper] = useState(false);
  const [superSession, setSuperSession] = useState(null);
  const [excusaFarmerEmail, setExcusaFarmerEmail] = useState("");
  const [excusaReason, setExcusaReason] = useState(EXCUSE_REASONS[0]);
  const [excusaOther, setExcusaOther] = useState("");
  const [excusaErr, setExcusaErr] = useState("");
  const [excusaSuccess, setExcusaSuccess] = useState(false);
  const [quizzes, setQuizzes] = useState(SAMPLE_QUIZZES);
  const [session, setSession] = useState(null);
  const [farmerAnswers, setFarmerAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [newQuiz, setNewQuiz] = useState({ title: "", questions: [] });
  const [editingQ, setEditingQ] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!session || session.phase !== "question") return;
    if (session.timer <= 0) { endQuestion(); return; }
    timerRef.current = setTimeout(() => setSession(s => ({ ...s, timer: s.timer - 1 })), 1000);
    return () => clearTimeout(timerRef.current);
  }, [session?.timer, session?.phase]);

  function farmerLogin() {
    let ok = true;
    if (!email.endsWith("@rappi.com")) { setEmailErr("Usa tu correo @rappi.com"); ok = false; } else setEmailErr("");
    if (!session || session.sessionCode !== quizCode) { setCodeErr("Código inválido. Pídelo a tu trainer."); ok = false; } else setCodeErr("");
    if (ok) setView("avatar");
  }
  function adminLogin() { if (adminPwd === ADMIN_CODE) { setView("admin"); setAdminErr(""); } else setAdminErr("Código incorrecto"); }
  function superLogin() {
    let ok = true;
    if (!superEmail.endsWith("@rappi.com")) { setSuperEmailErr("Usa tu correo @rappi.com"); ok = false; } else setSuperEmailErr("");
    if (superCode !== SUPER_CODE) { setSuperCodeErr("Código incorrecto"); ok = false; } else setSuperCodeErr("");
    if (ok) setView("supervisor");
  }
  function startSession(quiz) {
    const code = genCode();
    const qs = quiz.questions.map(q => ({ ...q, _opts: shuffle(q.options.map((o, i) => ({ text: o, orig: i }))) }));
    setSession({ quiz, sessionCode: code, questions: qs, currentQ: -1, phase: "waiting", timer: 0, farmerResults: [], excusados: [] });
    setParticipants(0); setFarmerAnswers([]); setView("adminLive");
  }
  function nextQuestion() {
    const next = (session?.currentQ ?? -1) + 1;
    if (next >= session.questions.length) { endQuiz(); return; }
    const q = session.questions[next];
    setSession(s => ({ ...s, currentQ: next, phase: "question", timer: q.time }));
    setAnswered(false); setCurrentAnswer(null);
    setParticipants(p => p + Math.floor(Math.random() * 8) + 3);
  }
  function endQuestion() { clearTimeout(timerRef.current); setSession(s => ({ ...s, phase: "reveal", timer: 0 })); }
  function endQuiz() {
    clearTimeout(timerRef.current);
    const fakeResults = Array.from({ length: Math.max(participants, 1) }, (_, i) => {
      const totalQ = session.questions.length; const ans = Math.max(1, Math.floor(Math.random() * totalQ) + Math.max(0, totalQ - 2));
      const correct = Math.floor(Math.random() * (ans + 1));
      return { email: `farmer${i + 1}.demo@rappi.com`, totalQ, answered: ans, correct, incorrect: ans - correct, noAnswer: totalQ - ans };
    });
    const avg = fakeResults.length ? Math.round(fakeResults.reduce((s, f) => s + pct(f.correct, f.totalQ), 0) / fakeResults.length) : 0;
    setQuizzes(prev => prev.map(q => q.id === session.quiz.id ? { ...q, sessions: [...q.sessions, { id: genCode(), date: new Date().toISOString().slice(0, 10), participants, avgScore: avg, farmerResults: fakeResults, excusados: session.excusados || [] }] } : q));
    setSession(s => ({ ...s, phase: "finished", farmerResults: fakeResults }));
  }
  function submitAnswer(origIdx) { if (answered) return; setCurrentAnswer(origIdx); setAnswered(true); setFarmerAnswers(a => [...a, { qIdx: session.currentQ, answer: origIdx }]); }
  function submitExcusa(targetQuizId) {
    setExcusaErr("");
    if (!excusaFarmerEmail.endsWith("@rappi.com")) { setExcusaErr("Correo inválido (@rappi.com)"); return; }
    const reason = excusaReason === "Otra razón" ? excusaOther : excusaReason;
    if (!reason) { setExcusaErr("Ingresa la razón"); return; }
    const excusa = { farmerEmail: excusaFarmerEmail, supervisorEmail: superEmail, reason, timestamp: new Date().toLocaleString("es-CO") };
    setSession(s => s ? ({ ...s, excusados: [...(s.excusados || []), excusa] }) : s);
    setQuizzes(prev => prev.map(quiz => quiz.id === targetQuizId ? {
      ...quiz, sessions: quiz.sessions.map((s, si) => si === quiz.sessions.length - 1 ? { ...s, excusados: [...(s.excusados || []), excusa] } : s)
    } : quiz));
    setExcusaFarmerEmail(""); setExcusaOther(""); setExcusaReason(EXCUSE_REASONS[0]);
    setExcusaSuccess(true); setTimeout(() => setExcusaSuccess(false), 3000);
  }

  const q = session && session.currentQ >= 0 ? session.questions[session.currentQ] : null;
  const timerPct = q ? (session.timer / q.time) * 100 : 0;
  const timerColor = timerPct > 50 ? "#27ae60" : timerPct > 25 ? "#f39c12" : "#e74c3c";

  const pageStyle = { position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "40px 20px" };
  const widePageStyle = { position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "32px 20px" };

  // ── HOME ───────────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div className="ra-root">
      <StyleInject />
      <BgOrbs />
      <div style={pageStyle}>
        <div className="fade-up"><Logo subtitle="Training & Development · Farmers" /></div>

        <Card className="glass fade-up-1">
          <div className="ra-display" style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: "#fff" }}>Ingresar al Quiz</div>
          <div style={{ marginBottom: 16 }}>
            <Label>Correo corporativo</Label>
            <Input placeholder="tunombre@rappi.com" value={email} onChange={e => { setEmail(e.target.value); setEmailErr(""); }} onKeyDown={e => e.key === "Enter" && farmerLogin()} style={emailErr ? { borderColor: "#e74c3c" } : {}} />
            {emailErr && <div style={{ fontSize: 12, color: "#e74c3c", marginTop: 5, fontWeight: 600 }}>{emailErr}</div>}
          </div>
          <div style={{ marginBottom: 20 }}>
            <Label>Código del quiz</Label>
            <Input placeholder="000000" maxLength={6} value={quizCode} onChange={e => { setQuizCode(e.target.value.replace(/\D/g, "")); setCodeErr(""); }} onKeyDown={e => e.key === "Enter" && farmerLogin()} style={{ fontSize: 28, fontWeight: 800, letterSpacing: "10px", textAlign: "center", ...(codeErr ? { borderColor: "#e74c3c" } : {}) }} />
            {codeErr && <div style={{ fontSize: 12, color: "#e74c3c", marginTop: 5, fontWeight: 600 }}>{codeErr}</div>}
          </div>
          <Btn variant="primary" style={{ width: "100%" }} onClick={farmerLogin}>Entrar al Quiz →</Btn>
        </Card>

        {/* Supervisor */}
        <Card className="glass fade-up-2" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>👁</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#4A90D9" }}>Portal Supervisores</span>
            </div>
            <Btn variant="mini" style={{ background: "linear-gradient(135deg,#4A90D9,#6ab0f5)", boxShadow: "0 4px 16px rgba(74,144,217,.3)" }} onClick={() => setShowSuper(v => !v)}>{showSuper ? "Cerrar" : "Abrir"}</Btn>
          </div>
          {showSuper && (
            <div style={{ marginTop: 16, animation: "fadeIn .3s ease" }}>
              <div style={{ marginBottom: 12 }}>
                <Label>Tu correo @rappi.com</Label>
                <Input placeholder="supervisor@rappi.com" value={superEmail} onChange={e => { setSuperEmail(e.target.value); setSuperEmailErr(""); }} style={superEmailErr ? { borderColor: "#e74c3c" } : {}} />
                {superEmailErr && <div style={{ fontSize: 12, color: "#e74c3c", marginTop: 4 }}>{superEmailErr}</div>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <Label>Código de supervisor</Label>
                <Input type="password" placeholder="Código" value={superCode} onChange={e => { setSuperCode(e.target.value); setSuperCodeErr(""); }} onKeyDown={e => e.key === "Enter" && superLogin()} style={superCodeErr ? { borderColor: "#e74c3c" } : {}} />
                {superCodeErr && <div style={{ fontSize: 12, color: "#e74c3c", marginTop: 4 }}>{superCodeErr}</div>}
              </div>
              <Btn variant="blue" style={{ width: "100%" }} onClick={superLogin}>Entrar como Supervisor</Btn>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 8, textAlign: "center" }}>Código demo: <b style={{ color: "rgba(255,255,255,.4)" }}>SUPER9</b></div>
            </div>
          )}
        </Card>

        {/* Admin */}
        <Card className="glass fade-up-3" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>⚙️</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>Admin · Trainer</span>
            </div>
            <Btn variant="mini" onClick={() => setShowAdmin(v => !v)}>{showAdmin ? "Cerrar" : "Abrir"}</Btn>
          </div>
          {showAdmin && (
            <div style={{ marginTop: 16, animation: "fadeIn .3s ease" }}>
              <Input type="password" placeholder="Código admin" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && adminLogin()} style={{ marginBottom: 12 }} />
              {adminErr && <div style={{ fontSize: 12, color: "#e74c3c", marginBottom: 10 }}>{adminErr}</div>}
              <Btn variant="ghost" style={{ width: "100%" }} onClick={adminLogin}>Entrar como Admin</Btn>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 8, textAlign: "center" }}>Código demo: <b style={{ color: "rgba(255,255,255,.4)" }}>ADMIN9</b></div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  // ── AVATAR ─────────────────────────────────────────────────────────────────
  if (view === "avatar") return (
    <div className="ra-root">
      <StyleInject />
      <BgOrbs />
      <div style={pageStyle}>
        <Logo />
        <Card className="glass fade-up">
          <div className="ra-display" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "#fff" }}>Tu personaje</div>

          {/* Avatar preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 120, height: 120, borderRadius: "50%", padding: 4, background: "linear-gradient(135deg, #FF441F, #ff6b3d)", boxShadow: "0 8px 32px rgba(255,68,31,.4)" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                  <Avatar config={avatar} size={112} />
                </div>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div style={{ marginBottom: 20 }}>
            <Label>Género</Label>
            <div style={{ display: "flex", gap: 10 }}>
              {[["male", "👦 Hombre"], ["female", "👧 Mujer"]].map(([g, label]) => (
                <button key={g} onClick={() => setAvatar(a => ({ ...a, gender: g }))} style={{ flex: 1, padding: "12px", background: avatar.gender === g ? "rgba(255,68,31,.2)" : "rgba(255,255,255,.05)", border: `2px solid ${avatar.gender === g ? "#FF441F" : "rgba(255,255,255,.1)"}`, borderRadius: 12, color: avatar.gender === g ? "#FF441F" : "rgba(255,255,255,.5)", fontWeight: 700, cursor: "pointer", fontSize: 14, transition: "all .2s", fontFamily: "inherit" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Skin */}
          <div style={{ marginBottom: 16 }}>
            <Label>Tono de piel</Label>
            <div style={{ display: "flex", gap: 8 }}>
              {SKIN_TONES.map(c => <div key={c} className="swatch" onClick={() => setAvatar(a => ({ ...a, skin: c }))} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: avatar.skin === c ? "3px solid #FF441F" : "3px solid transparent", boxShadow: avatar.skin === c ? "0 0 0 2px rgba(255,68,31,.3)" : "none" }} />)}
            </div>
          </div>

          {/* Hair */}
          <div style={{ marginBottom: 16 }}>
            <Label>Color de cabello</Label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {HAIR_COLORS.map(c => <div key={c} className="swatch" onClick={() => setAvatar(a => ({ ...a, hair: c }))} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: avatar.hair === c ? "3px solid #FF441F" : "3px solid rgba(255,255,255,.15)", boxShadow: avatar.hair === c ? "0 0 0 2px rgba(255,68,31,.3)" : "none" }} />)}
            </div>
          </div>

          {/* Shirt */}
          <div style={{ marginBottom: 16 }}>
            <Label>Color de camisa</Label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SHIRT_COLORS.map(c => <div key={c} className="swatch" onClick={() => setAvatar(a => ({ ...a, shirt: c }))} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: avatar.shirt === c ? "3px solid #FF441F" : "3px solid rgba(255,255,255,.15)", boxShadow: avatar.shirt === c ? "0 0 0 2px rgba(255,68,31,.3)" : "none" }} />)}
            </div>
          </div>

          {/* Accessories */}
          <div style={{ marginBottom: 24 }}>
            <Label>Accesorio</Label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["none", "—"], ["glasses", "👓"], ["headset", "🎧"], ["cap", "🧢"], ...(avatar.gender === "female" ? [["earrings", "💛"]] : [])].map(([ac, icon]) => (
                <button key={ac} onClick={() => setAvatar(a => ({ ...a, accessory: ac }))} style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${avatar.accessory === ac ? "#FF441F" : "rgba(255,255,255,.1)"}`, background: avatar.accessory === ac ? "rgba(255,68,31,.2)" : "rgba(255,255,255,.05)", cursor: "pointer", fontSize: 20, transition: "all .2s" }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <Btn variant="primary" style={{ width: "100%" }} onClick={() => setView("waiting")}>¡Listo, entrar! →</Btn>
        </Card>
      </div>
    </div>
  );

  // ── WAITING ────────────────────────────────────────────────────────────────
  if (view === "waiting") {
    if (session?.phase === "question") { setView("quiz"); return null; }
    return (
      <div className="ra-root">
        <StyleInject />
        <BgOrbs />
        <div style={{ ...pageStyle, textAlign: "center" }}>
          <div className="fade-up" style={{ marginBottom: 24 }}>
            <div style={{ width: 120, height: 120, borderRadius: "50%", padding: 4, background: "linear-gradient(135deg, #FF441F, #ff6b3d)", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(255,68,31,.4)" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                <Avatar config={avatar} size={112} />
              </div>
            </div>
            <div className="ra-display" style={{ fontSize: 22, fontWeight: 800 }}>{email.split("@")[0]}</div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginTop: 4 }}>Código: {quizCode}</div>
          </div>
          <Card className="glass fade-up-1">
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FF441F", margin: "0 auto 16px", animation: "pulse 1.5s infinite" }} />
            <div className="ra-display" style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Esperando al trainer...</div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 14, lineHeight: 1.6 }}>Prepárate, el quiz arrancará en cualquier momento.</div>
            {session && <div style={{ marginTop: 16, display: "inline-block", padding: "8px 20px", background: "rgba(255,68,31,.15)", borderRadius: 99, color: "#FF441F", fontWeight: 700, fontSize: 14, border: "1px solid rgba(255,68,31,.3)" }}>{session.quiz.title}</div>}
          </Card>
          <Btn variant="ghost" onClick={() => setView("home")}>← Volver</Btn>
        </div>
      </div>
    );
  }

  // ── FARMER QUIZ ────────────────────────────────────────────────────────────
  if (view === "quiz") {
    if (!session || session.phase === "finished") {
      const correct = farmerAnswers.filter(fa => { const qq = session?.questions[fa.qIdx]; if (!qq) return false; return Array.isArray(qq.correct) ? qq.correct.includes(fa.answer) : fa.answer === qq.correct; }).length;
      const total = session?.questions.length || 1;
      const p = Math.round((correct / total) * 100);
      return (
        <div className="ra-root">
          <StyleInject />
          <BgOrbs />
          <div style={{ ...pageStyle, textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 8, animation: "fadeUp .5s ease" }}>{p >= 80 ? "🏆" : p >= 60 ? "💪" : "📚"}</div>
            <div className="ra-display fade-up" style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>¡Quiz terminado!</div>
            <Card className="glass fade-up-1" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 80, fontWeight: 900, background: "linear-gradient(135deg, #FF441F, #ff6b3d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>{p}%</div>
              <div style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginTop: 4 }}>{correct} de {total} preguntas correctas</div>
            </Card>
            {session?.questions.map((qq, i) => {
              const fa = farmerAnswers.find(a => a.qIdx === i);
              const ok = fa && (Array.isArray(qq.correct) ? qq.correct.includes(fa.answer) : fa.answer === qq.correct);
              return <div key={i} className="glass" style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 8, borderLeft: `3px solid ${ok ? "#27ae60" : "#e74c3c"}`, textAlign: "left" }}><div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 3 }}>P{i + 1}: {qq.text}</div><div style={{ fontSize: 12, fontWeight: 700, color: ok ? "#27ae60" : "#e74c3c" }}>{ok ? "✓ Correcto" : "✗ Incorrecto"} — {Array.isArray(qq.correct) ? qq.correct.map(c => qq.options[c]).join(", ") : qq.options[qq.correct]}</div></div>;
            })}
            <Btn variant="primary" style={{ width: "100%", marginTop: 16 }} onClick={() => { setView("home"); setSession(null); setFarmerAnswers([]); }}>Volver al inicio</Btn>
          </div>
        </div>
      );
    }
    if (!q) return null;
    if (session.phase === "reveal") {
      const fa = farmerAnswers.find(a => a.qIdx === session.currentQ);
      const ok = fa && (Array.isArray(q.correct) ? q.correct.includes(fa.answer) : fa.answer === q.correct);
      return (
        <div className="ra-root">
          <StyleInject />
          <BgOrbs />
          <div style={{ ...pageStyle, textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 12, animation: "fadeUp .4s ease" }}>{!fa ? "⏰" : ok ? "🎉" : "😅"}</div>
            <div className="ra-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{!fa ? "¡Tiempo!" : ok ? "¡Correcto!" : "¡Casi!"}</div>
            <Card className="glass" style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>Respuesta correcta:</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#27ae60" }}>{Array.isArray(q.correct) ? q.correct.map(i => q.options[i]).join(", ") : q.options[q.correct]}</div>
            </Card>
            <div style={{ color: "rgba(255,255,255,.3)", fontSize: 13, marginTop: 16 }}>Esperando la siguiente pregunta...</div>
          </div>
        </div>
      );
    }
    const OPTION_COLORS = ["#FF441F", "#4A90D9", "#27ae60", "#f39c12"];
    return (
      <div className="ra-root">
        <StyleInject />
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px", position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,68,31,.5)" }}>
                <Avatar config={avatar} size={40} />
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>{email.split("@")[0]}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {session.questions.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < session.currentQ ? "#FF441F" : i === session.currentQ ? "#fff" : "rgba(255,255,255,.2)" }} />)}
            </div>
          </div>
          {/* Timer */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`, width: `${timerPct}%`, transition: "width 1s linear, background .5s", boxShadow: `0 0 8px ${timerColor}` }} />
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 36, fontWeight: 900, color: timerColor, marginBottom: 16, fontFamily: "'Nunito',sans-serif", transition: "color .5s" }}>{session.timer}s</div>
          {/* Question card */}
          <div className="glass" style={{ borderRadius: 20, padding: "22px 24px", marginBottom: 16, borderLeft: "3px solid rgba(255,68,31,.4)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#FF441F", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
              {q.type === "truefalse" ? "Verdadero / Falso" : q.type === "multi" ? "Selección múltiple" : "Opción única"}
            </div>
            <div className="ra-display" style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.45, color: "#fff" }}>{q.text}</div>
          </div>
          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q._opts.map((opt, i) => {
              const sel = currentAnswer === opt.orig;
              return (
                <button key={i} className={`opt-btn${sel ? " selected" : ""}`} onClick={() => !answered && submitAnswer(opt.orig)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", background: sel ? `${OPTION_COLORS[opt.orig]}20` : "rgba(255,255,255,.04)", border: `2px solid ${sel ? OPTION_COLORS[opt.orig] : "rgba(255,255,255,.08)"}`, borderRadius: 14, fontSize: 15, fontWeight: 600, color: sel ? "#fff" : "rgba(255,255,255,.7)", cursor: answered ? "default" : "pointer", textAlign: "left", width: "100%", fontFamily: "inherit", opacity: answered && !sel ? .4 : 1, boxShadow: sel ? `0 4px 20px ${OPTION_COLORS[opt.orig]}30` : "none" }}>
                  <span style={{ minWidth: 32, height: 32, background: sel ? OPTION_COLORS[opt.orig] : "rgba(255,255,255,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                  {opt.text}
                </button>
              );
            })}
          </div>
          {answered && <div style={{ textAlign: "center", color: "rgba(255,255,255,.3)", fontSize: 13, marginTop: 16 }}>✓ Registrado — esperando al resto del equipo...</div>}
        </div>
      </div>
    );
  }

  // ── SUPERVISOR ─────────────────────────────────────────────────────────────
  if (view === "supervisor") {
    const allSessions = [];
    quizzes.forEach(quiz => quiz.sessions.forEach(s => allSessions.push({ ...s, quizTitle: quiz.title, quizId: quiz.id })));
    if (session && session.phase !== "finished") allSessions.unshift({ id: "live", date: "🔴 EN VIVO", quizTitle: session.quiz.title, quizId: session.quiz.id, isLive: true, farmerResults: session.farmerResults || [], excusados: session.excusados || [] });
    const target = superSession || (allSessions.length ? allSessions[0] : null);
    const excEmails = (target?.excusados || []).map(e => e.farmerEmail);
    const active = (target?.farmerResults || []).filter(r => !excEmails.includes(r.email));
    const avg = active.length ? Math.round(active.reduce((s, r) => s + pct(r.correct, r.totalQ), 0) / active.length) : 0;
    return (
      <div className="ra-root">
        <StyleInject />
        <BgOrbs />
        <div style={widePageStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, background: "linear-gradient(135deg, #4A90D9, #6ab0f5)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 24px rgba(74,144,217,.4)" }}>👁</div>
              <div>
                <div className="ra-display" style={{ fontSize: 20, fontWeight: 800 }}>Portal Supervisor</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>{superEmail}</div>
              </div>
            </div>
            <Btn variant="ghost" onClick={() => setView("home")}>Salir</Btn>
          </div>

          {/* Session selector */}
          <Card className="glass" style={{ padding: "16px 20px", marginBottom: 24 }}>
            <Label>Sesión</Label>
            <Select value={target?.id || ""} onChange={e => { const found = allSessions.find(s => s.id === e.target.value); setSuperSession(found || null); }}>
              {allSessions.map(s => <option key={s.id} value={s.id}>{s.quizTitle} · {s.date}</option>)}
              {allSessions.length === 0 && <option>No hay sesiones</option>}
            </Select>
          </Card>

          {target && (
            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
              {/* LEFT: excusa form */}
              <div>
                <div className="ra-display" style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: "rgba(255,255,255,.7)" }}>Registrar Excusado</div>
                <Card className="glass">
                  <div style={{ marginBottom: 14 }}>
                    <Label>Correo del farmer</Label>
                    <Input placeholder="farmer@rappi.com" value={excusaFarmerEmail} onChange={e => { setExcusaFarmerEmail(e.target.value); setExcusaErr(""); }} style={excusaErr ? { borderColor: "#e74c3c" } : {}} />
                  </div>
                  <div style={{ marginBottom: excusaReason === "Otra razón" ? 14 : 20 }}>
                    <Label>Razón</Label>
                    <Select value={excusaReason} onChange={e => setExcusaReason(e.target.value)}>{EXCUSE_REASONS.map(r => <option key={r}>{r}</option>)}</Select>
                  </div>
                  {excusaReason === "Otra razón" && (
                    <div style={{ marginBottom: 20 }}>
                      <Label>Especifica</Label>
                      <Input placeholder="Describe la razón..." value={excusaOther} onChange={e => setExcusaOther(e.target.value)} />
                    </div>
                  )}
                  {excusaErr && <div style={{ fontSize: 12, color: "#e74c3c", marginBottom: 10, fontWeight: 600 }}>{excusaErr}</div>}
                  {excusaSuccess && <div style={{ fontSize: 13, color: "#27ae60", marginBottom: 10, fontWeight: 700 }}>✓ Excusa registrada</div>}
                  <Btn variant="blue" style={{ width: "100%" }} onClick={() => submitExcusa(target.quizId)}>Registrar excusa</Btn>
                </Card>

                <div className="ra-display" style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, color: "rgba(255,255,255,.5)" }}>Excusados ({(target.excusados || []).length})</div>
                {(target.excusados || []).length === 0
                  ? <div style={{ color: "rgba(255,255,255,.2)", fontSize: 13, padding: "12px 0" }}>Sin excusas registradas.</div>
                  : (target.excusados || []).map((e, i) => (
                    <div key={i} className="glass" style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 8, borderLeft: "3px solid #4A90D9" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{e.farmerEmail}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{e.reason}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 2 }}>{e.timestamp}</div>
                    </div>
                  ))
                }
              </div>

              {/* RIGHT: results */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div className="ra-display" style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,.7)" }}>Resultados</div>
                  <Btn variant="green" onClick={() => openCSV(buildCSV(target, target.quizTitle), target.quizTitle)}>↓ Exportar CSV</Btn>
                </div>
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                  {[["Presentaron", active.length, "#FF441F"], ["Excusados", (target.excusados || []).length, "#4A90D9"], [`${avg}% promedio`, "excl. excusados", "#27ae60"]].map(([v, l, c], i) => (
                    <div key={i} className="glass" style={{ borderRadius: 14, padding: "14px", textAlign: "center" }}>
                      <div style={{ fontSize: i === 2 ? 18 : 24, fontWeight: 900, color: c, fontFamily: "'Nunito',sans-serif" }}>{v}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <ResultsTable session={target} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ADMIN HOME ─────────────────────────────────────────────────────────────
  if (view === "admin") return (
    <div className="ra-root">
      <StyleInject />
      <BgOrbs />
      <div style={widePageStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Logo subtitle="Panel Admin" />
          <Btn variant="ghost" onClick={() => setView("home")}>Salir</Btn>
        </div>
        {session && session.phase !== "finished" && (
          <div className="glass" style={{ borderRadius: 14, padding: "12px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "3px solid #FF441F" }}>
            <span style={{ fontSize: 14 }}>🔴 Sesión activa: <b>{session.quiz.title}</b> · Código: <b style={{ color: "#FF441F" }}>{session.sessionCode}</b></span>
            <Btn variant="mini" onClick={() => setView("adminLive")}>Ver tablero →</Btn>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[{ icon: "📋", title: "Mis Quices", sub: `${quizzes.length} quices disponibles`, action: "adminQuiz", color: "#FF441F" }, { icon: "✏️", title: "Crear Quiz", sub: "Diseña preguntas personalizadas", action: "adminCreate", color: "#4A90D9" }, { icon: "📊", title: "Historial", sub: "Resultados y reportes", action: "adminHistory", color: "#27ae60" }].map(c => (
            <div key={c.action} className="glass admin-card" onClick={() => setView(c.action)} style={{ borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
              <div className="ra-display" style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: "#fff" }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", lineHeight: 1.4 }}>{c.sub}</div>
              <div style={{ marginTop: 16, height: 3, width: 32, background: c.color, borderRadius: 99 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── ADMIN QUIZ LIST ────────────────────────────────────────────────────────
  if (view === "adminQuiz") return (
    <div className="ra-root">
      <StyleInject />
      <BgOrbs />
      <div style={widePageStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Btn variant="ghost" onClick={() => setView("admin")}>← Volver</Btn>
          <div className="ra-display" style={{ fontSize: 20, fontWeight: 800 }}>Mis Quices</div>
          <Btn variant="mini" onClick={() => setView("adminCreate")}>+ Nuevo</Btn>
        </div>
        {quizzes.map(qz => (
          <div key={qz.id} className="glass" style={{ borderRadius: 18, padding: "20px 24px", marginBottom: 14, display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div className="ra-display" style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{qz.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>{qz.questions.length} preguntas · {qz.sessions.length} sesión(es)</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              <Btn variant="primary" style={{ padding: "10px 20px" }} onClick={() => startSession(qz)}>▶ Iniciar</Btn>
              <Btn variant="ghost" style={{ padding: "8px 16px", fontSize: 12 }} onClick={() => setView("adminHistory")}>Historial</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── ADMIN CREATE ───────────────────────────────────────────────────────────
  if (view === "adminCreate") {
    function addQ(type) { setNewQuiz(nq => ({ ...nq, questions: [...nq.questions, { id: genCode(), type, text: "", time: 20, options: type === "truefalse" ? ["Verdadero", "Falso"] : ["", "", "", ""], correct: type === "multi" ? [] : 0 }] })); setEditingQ(newQuiz.questions.length); }
    function saveQuiz() { if (!newQuiz.title) return; setQuizzes(prev => [...prev, { ...newQuiz, id: genCode(), sessions: [] }]); setNewQuiz({ title: "", questions: [] }); setEditingQ(null); setView("adminQuiz"); }
    return (
      <div className="ra-root">
        <StyleInject />
        <BgOrbs />
        <div style={widePageStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Btn variant="ghost" onClick={() => setView("admin")}>← Volver</Btn>
            <div className="ra-display" style={{ fontSize: 20, fontWeight: 800 }}>Crear Quiz</div>
            <Btn variant="primary" style={{ padding: "10px 20px" }} onClick={saveQuiz} disabled={!newQuiz.title}>Guardar</Btn>
          </div>
          <Card className="glass">
            <Label>Título del quiz</Label>
            <Input placeholder="Ej: Fundamentos de Markdown" value={newQuiz.title} onChange={e => setNewQuiz(q => ({ ...q, title: e.target.value }))} />
          </Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Preguntas ({newQuiz.questions.length})</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {[["single", "Opción única"], ["multi", "Múltiple"], ["truefalse", "V / F"]].map(([t, l]) => <Btn key={t} variant="ghost" style={{ fontSize: 13 }} onClick={() => addQ(t)}>+ {l}</Btn>)}
          </div>
          {newQuiz.questions.map((qq, qi) => (
            <div key={qq.id} className="glass" style={{ borderRadius: 16, padding: "16px 20px", marginBottom: 12, borderLeft: `3px solid ${editingQ === qi ? "#FF441F" : "rgba(255,255,255,.08)"}`, cursor: "pointer" }} onClick={() => setEditingQ(editingQ === qi ? null : qi)}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700, color: qq.text ? "#fff" : "rgba(255,255,255,.2)" }}>P{qi + 1}: {qq.text || "Sin texto aún..."}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", textTransform: "uppercase" }}>{qq.type} · {qq.time}s</div>
              </div>
              {editingQ === qi && (
                <div onClick={e => e.stopPropagation()} style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 12 }}><Label>Enunciado</Label><textarea style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, fontSize: 14, color: "#fff", fontFamily: "inherit", minHeight: 60, resize: "vertical", boxSizing: "border-box" }} value={qq.text} onChange={e => setNewQuiz(p => ({ ...p, questions: p.questions.map((x, i) => i === qi ? { ...x, text: e.target.value } : x) }))} /></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}><Label>Tiempo</Label><Input type="number" style={{ width: 90 }} value={qq.time} onChange={e => setNewQuiz(p => ({ ...p, questions: p.questions.map((x, i) => i === qi ? { ...x, time: +e.target.value } : x) }))} /><span style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>seg</span></div>
                  {qq.type !== "truefalse" && qq.options.map((opt, oi) => (
                    <div key={oi} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <input type={qq.type === "multi" ? "checkbox" : "radio"} name={`c-${qi}`} checked={Array.isArray(qq.correct) ? qq.correct.includes(oi) : qq.correct === oi} onChange={() => { const c = qq.type === "multi" ? (qq.correct.includes(oi) ? qq.correct.filter(x => x !== oi) : [...qq.correct, oi]) : oi; setNewQuiz(p => ({ ...p, questions: p.questions.map((x, i) => i === qi ? { ...x, correct: c } : x) })); }} />
                      <Input style={{ flex: 1 }} placeholder={`Opción ${oi + 1}`} value={opt} onChange={e => { const opts = qq.options.map((o, i) => i === oi ? e.target.value : o); setNewQuiz(p => ({ ...p, questions: p.questions.map((x, i) => i === qi ? { ...x, options: opts } : x) })); }} />
                    </div>
                  ))}
                  {qq.type === "truefalse" && ["Verdadero", "Falso"].map((opt, oi) => <label key={oi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", color: "rgba(255,255,255,.7)" }}><input type="radio" name={`c-${qi}`} checked={qq.correct === oi} onChange={() => setNewQuiz(p => ({ ...p, questions: p.questions.map((x, i) => i === qi ? { ...x, correct: oi } : x) }))} />{opt}</label>)}
                  <button style={{ fontSize: 12, color: "#e74c3c", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 8 }} onClick={() => { setNewQuiz(p => ({ ...p, questions: p.questions.filter((_, i) => i !== qi) })); setEditingQ(null); }}>Eliminar pregunta</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── ADMIN HISTORY ──────────────────────────────────────────────────────────
  if (view === "adminHistory") return (
    <div className="ra-root">
      <StyleInject />
      <BgOrbs />
      <div style={widePageStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Btn variant="ghost" onClick={() => setView("admin")}>← Volver</Btn>
          <div className="ra-display" style={{ fontSize: 20, fontWeight: 800 }}>Historial & Reportes</div>
          <div />
        </div>
        {quizzes.map(qz => (
          <div key={qz.id} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>{qz.title}</div>
            {qz.sessions.length === 0 && <div style={{ color: "rgba(255,255,255,.2)", fontSize: 14 }}>Sin sesiones aún.</div>}
            {qz.sessions.map(s => {
              const excE = (s.excusados || []).map(e => e.farmerEmail);
              const act = (s.farmerResults || []).filter(r => !excE.includes(r.email));
              const av = act.length ? Math.round(act.reduce((acc, r) => acc + pct(r.correct, r.totalQ), 0) / act.length) : s.avgScore;
              return (
                <div key={s.id} className="glass" style={{ borderRadius: 18, padding: "20px 24px", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div className="ra-display" style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{s.date}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", display: "flex", gap: 16 }}>
                        <span>👥 {s.participants || (s.farmerResults || []).length} participantes</span>
                        <span>🔵 {(s.excusados || []).length} excusados</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <ScoreBadge score={av} />
                      <Btn variant="green" onClick={() => openCSV(buildCSV(s, qz.title), qz.title)}>↓ CSV</Btn>
                    </div>
                  </div>
                  {(s.farmerResults || []).length > 0 && <ResultsTable session={s} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // ── ADMIN LIVE ─────────────────────────────────────────────────────────────
  if (view === "adminLive") {
    if (!session) return null;
    const responded = q ? Math.floor(participants * Math.max(0, (1 - session.timer / q.time)) * 0.85) : 0;
    const OCOLS = ["#FF441F", "#4A90D9", "#27ae60", "#f39c12"];
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#060610", color: "#fff" }}>
        <StyleInject />
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", background: "rgba(0,0,0,.6)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,.06)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#FF441F,#ff6b3d)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍕</div>
            <div>
              <div className="ra-display" style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-.2px" }}>Rappi Academy <span style={{ color: "#FF441F" }}>LIVE</span></div>
              <div style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>{session.quiz.title}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "rgba(255,255,255,.6)" }}>Código: <b style={{ color: "#FF441F", letterSpacing: 2 }}>{session.sessionCode}</b></div>
            <div style={{ background: "linear-gradient(135deg,#FF441F,#ff6b3d)", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>👥 {participants}</div>
            <Btn variant="ghost" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => setView("admin")}>Salir</Btn>
          </div>
        </div>

        {/* WAITING */}
        {session.phase === "waiting" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 80, marginBottom: 24, animation: "glow 2s infinite" }}>⏳</div>
            <div className="ra-display" style={{ fontSize: 36, fontWeight: 800, marginBottom: 10 }}>Sala de espera</div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 16, marginBottom: 20 }}>Comparte este código con tus farmers</div>
            <div className="ra-display" style={{ fontSize: 64, fontWeight: 900, color: "#FF441F", letterSpacing: 12, marginBottom: 40, textShadow: "0 0 40px rgba(255,68,31,.5)" }}>{session.sessionCode}</div>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="primary" style={{ padding: "16px 48px", fontSize: 18 }} onClick={nextQuestion}>▶ Iniciar Quiz</Btn>
              <Btn variant="ghost" onClick={() => setParticipants(p => p + Math.floor(Math.random() * 5) + 2)}>+ Simular farmers</Btn>
            </div>
          </div>
        )}

        {/* QUESTION / PAUSED */}
        {(session.phase === "question" || session.phase === "paused") && q && (
          <div style={{ padding: "20px 32px", maxWidth: 860, margin: "0 auto" }}>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center" }}>
              {session.questions.map((_, i) => <div key={i} style={{ height: 4, width: i === session.currentQ ? 24 : 12, borderRadius: 99, background: i < session.currentQ ? "#FF441F" : i === session.currentQ ? "#fff" : "rgba(255,255,255,.15)", transition: "all .3s" }} />)}
            </div>
            <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.3)", marginBottom: 20 }}>Pregunta {session.currentQ + 1} de {session.questions.length}</div>

            {/* Timer + controls block */}
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
              <div className="ra-display" style={{ fontSize: 64, fontWeight: 900, minWidth: 80, color: timerColor, lineHeight: 1, textShadow: `0 0 20px ${timerColor}60`, textAlign: "center", transition: "color .5s" }}>
                {session.phase === "paused" ? "⏸" : session.timer}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`, width: `${timerPct}%`, transition: "width 1s linear, background .5s", boxShadow: `0 0 10px ${timerColor}60` }} />
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>{session.phase === "paused" ? "Pausado — respuesta oculta" : `${session.timer}s restantes`}</div>
                {/* Responses */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>Respondieron:</span>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#27ae60", borderRadius: 99, width: `${participants > 0 ? (responded / participants) * 100 : 0}%`, transition: "width .8s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", minWidth: 50 }}>{responded}/{participants}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {session.phase === "question"
                  ? <Btn variant="ghost" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => { clearTimeout(timerRef.current); setSession(s => ({ ...s, phase: "paused" })); }}>⏸ Pausar</Btn>
                  : <Btn variant="ghost" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => setSession(s => ({ ...s, phase: "question" }))}>▶ Reanudar</Btn>}
                <Btn variant="primary" style={{ padding: "9px 14px", fontSize: 13 }} onClick={endQuestion}>⏭ Revelar</Btn>
                <Btn variant="ghost" style={{ padding: "9px 14px", fontSize: 13, color: "rgba(255,255,255,.3)" }} onClick={endQuiz}>⏹ Fin</Btn>
              </div>
            </div>

            {/* Question */}
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderLeft: "4px solid rgba(255,68,31,.5)", borderRadius: 18, padding: "22px 28px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#FF441F", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>{q.type === "truefalse" ? "Verdadero / Falso" : q.type === "multi" ? "Selección múltiple" : "Opción única"}</div>
              <div className="ra-display" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.4 }}>{q.text}</div>
            </div>

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {q.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", background: `${OCOLS[i]}10`, border: `1px solid ${OCOLS[i]}25`, borderRadius: 14, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>
                  <span style={{ minWidth: 34, height: 34, background: OCOLS[i], borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: `0 4px 12px ${OCOLS[i]}40` }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVEAL */}
        {session.phase === "reveal" && q && (
          <div style={{ padding: 40, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)", marginBottom: 10 }}>Respuesta correcta:</div>
            <div className="ra-display" style={{ fontSize: 32, fontWeight: 900, color: "#27ae60", marginBottom: 32, textShadow: "0 0 30px rgba(39,174,96,.4)" }}>{Array.isArray(q.correct) ? q.correct.map(i => q.options[i]).join(", ") : q.options[q.correct]}</div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
              {q.options.map((opt, i) => {
                const isCorr = Array.isArray(q.correct) ? q.correct.includes(i) : q.correct === i;
                const p = isCorr ? Math.floor(Math.random() * 25) + 55 : Math.floor(Math.random() * 18) + 5;
                return (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ height: 100, width: 70, background: "rgba(255,255,255,.04)", borderRadius: 10, display: "flex", alignItems: "flex-end", overflow: "hidden", border: `1px solid ${OCOLS[i]}20` }}>
                      <div style={{ width: "100%", height: `${p}%`, background: isCorr ? `linear-gradient(0deg, #27ae60, #2ecc71)` : `linear-gradient(0deg, ${OCOLS[i]}40, ${OCOLS[i]}20)`, transition: "height .8s ease", boxShadow: isCorr ? "0 -4px 16px rgba(39,174,96,.4)" : "none" }} />
                    </div>
                    <div style={{ color: "rgba(255,255,255,.3)", fontSize: 11, marginTop: 6 }}>{String.fromCharCode(65 + i)}</div>
                    <div style={{ color: isCorr ? "#27ae60" : "rgba(255,255,255,.3)", fontSize: 14, fontWeight: 800 }}>{p}%</div>
                  </div>
                );
              })}
            </div>
            {session.currentQ + 1 < session.questions.length
              ? <Btn variant="primary" style={{ padding: "16px 44px", fontSize: 17 }} onClick={nextQuestion}>Siguiente pregunta →</Btn>
              : <Btn variant="primary" style={{ padding: "16px 44px", fontSize: 17, background: "linear-gradient(135deg,#1a7340,#27ae60)", boxShadow: "0 8px 24px rgba(26,115,64,.4)" }} onClick={endQuiz}>Finalizar quiz ✓</Btn>}
          </div>
        )}

        {/* FINISHED */}
        {session.phase === "finished" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>
            <div className="ra-display" style={{ fontSize: 40, fontWeight: 900, marginBottom: 32, background: "linear-gradient(90deg,#FF441F,#ff6b3d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>¡Quiz finalizado!</div>
            <div style={{ display: "flex", gap: 48, marginBottom: 40 }}>
              {[["participantes", participants, "#FF441F"], ["preguntas", session.questions.length, "#4A90D9"], ["completado", "✓", "#27ae60"]].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div className="ra-display" style={{ fontSize: 48, fontWeight: 900, color: c, textShadow: `0 0 30px ${c}60` }}>{v}</div>
                  <div style={{ color: "rgba(255,255,255,.3)", fontSize: 13, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="primary" style={{ padding: "14px 36px" }} onClick={() => { setSession(null); setView("admin"); }}>Volver al panel</Btn>
              <Btn variant="ghost" onClick={() => setView("adminHistory")}>Ver resultados</Btn>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
