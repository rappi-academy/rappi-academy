import { useState, useEffect, useRef } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, updateDoc, deleteDoc, addDoc, serverTimestamp, increment, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyALN-hOLTxiLJRE_SAHK-MUSiZEx8tmCWQ",
  authDomain: "bd-academy-2de02.firebaseapp.com",
  projectId: "bd-academy-2de02",
  storageBucket: "bd-academy-2de02.firebasestorage.app",
  messagingSenderId: "284426407751",
  appId: "1:284426407751:web:a53374fabe001bdb43c662"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_CODE = "ADMIN9";
const SUPER_CODE = "SUPER9";

const EXCUSE_REASONS = [
  "Problemas de conexión", "Incapacidad médica", "Urgencia personal",
  "No tenía dispositivo disponible", "Conflicto de horario con cliente", "Otra razón",
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

const SKIN_TONES = ["#FDDBB4", "#F0C28A", "#D4956A", "#A0614A", "#6B3F2E"];
const HAIR_COLORS = ["#1a0a00", "#4a2000", "#8B4513", "#D4A017", "#FF6B6B", "#4A90D9", "#E8E8E8"];
const SHIRT_COLORS = ["#FF441F", "#FF6B6B", "#4A90D9", "#50C878", "#9B59B6", "#F39C12", "#1a1a2e"];

function Avatar({ config, size = 80 }) {
  const { skin, hair, shirt, gender, accessory } = config;
  const isFemale = gender === "female";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: "50%", display: "block" }}>
      <circle cx="50" cy="50" r="50" fill="#1a1a2e" />
      {isFemale ? (
        <>
          <path d="M29 38 Q24 60 26 82 Q32 90 38 88 Q34 72 33 52Z" fill={hair} />
          <path d="M71 38 Q76 60 74 82 Q68 90 62 88 Q66 72 67 52Z" fill={hair} />
          <path d="M22 100 Q20 74 34 69 Q42 74 50 75 Q58 74 66 69 Q80 74 78 100Z" fill={shirt} />
          <path d="M41 69 Q50 78 59 69 L57 73 Q50 80 43 73Z" fill="rgba(255,255,255,0.12)" />
          <rect x="43" y="56" width="14" height="15" rx="4" fill={skin} />
          <ellipse cx="50" cy="43" rx="19" ry="21" fill={skin} />
          <ellipse cx="31" cy="44" rx="3.5" ry="4.5" fill={skin} />
          <ellipse cx="69" cy="44" rx="3.5" ry="4.5" fill={skin} />
          <ellipse cx="50" cy="26" rx="21" ry="13" fill={hair} />
          <path d="M29 30 Q24 42 26 58 Q28 62 31 60 Q30 46 32 36Z" fill={hair} />
          <path d="M71 30 Q76 42 74 58 Q72 62 69 60 Q70 46 68 36Z" fill={hair} />
          <path d="M30 26 Q50 18 70 26 Q65 22 50 20 Q35 22 30 26Z" fill={hair} />
          <ellipse cx="40" cy="43.5" rx="4.5" ry="3.5" fill="white" />
          <ellipse cx="60" cy="43.5" rx="4.5" ry="3.5" fill="white" />
          <circle cx="41" cy="43.5" r="2.5" fill="#1a0a00" />
          <circle cx="61" cy="43.5" r="2.5" fill="#1a0a00" />
          <circle cx="42" cy="42.5" r="0.9" fill="white" />
          <circle cx="62" cy="42.5" r="0.9" fill="white" />
          <path d="M36 37.5 Q40 35.5 44 37" stroke={hair} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M56 37 Q60 35.5 64 37.5" stroke={hair} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M48.5 48 Q50 51.5 51.5 48" stroke={skin === "#FDDBB4" ? "#c8906a" : "#7a4a30"} strokeWidth="1" fill="none" strokeLinecap="round" />
          <circle cx="47.5" cy="50.5" r="1" fill={skin === "#FDDBB4" ? "#d4956a" : "#7a4a30"} opacity="0.5" />
          <circle cx="52.5" cy="50.5" r="1" fill={skin === "#FDDBB4" ? "#d4956a" : "#7a4a30"} opacity="0.5" />
          <path d="M43.5 55 Q46 53.5 50 54 Q54 53.5 56.5 55" stroke="#c06080" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M43.5 55 Q50 60.5 56.5 55" stroke="#b05070" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M43.5 55 Q46 53.5 50 54 Q54 53.5 56.5 55 Q53 57 50 57.5 Q47 57 43.5 55Z" fill="#e08aaa" />
          <ellipse cx="34" cy="49" rx="5" ry="3" fill="rgba(220,100,120,0.15)" />
          <ellipse cx="66" cy="49" rx="5" ry="3" fill="rgba(220,100,120,0.15)" />
          {accessory === "glasses" && <><ellipse cx="40" cy="43.5" rx="6.5" ry="5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" /><ellipse cx="60" cy="43.5" rx="6.5" ry="5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" /><line x1="46.5" y1="43.5" x2="53.5" y2="43.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" /></>}
          {accessory === "headset" && <><path d="M31 38 Q31 20 50 20 Q69 20 69 38" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" /><rect x="27" y="37" width="8" height="12" rx="4" fill="#2a2a3e" /><rect x="65" y="37" width="8" height="12" rx="4" fill="#2a2a3e" /></>}
          {accessory === "cap" && <><ellipse cx="50" cy="27" rx="22" ry="8" fill={hair} /><ellipse cx="50" cy="22" rx="20" ry="7" fill={hair} /><rect x="64" y="24" width="15" height="5" rx="2.5" fill={hair} /></>}
          {accessory === "earrings" && <><circle cx="27.5" cy="48" r="2.5" fill="#FFD700" /><circle cx="27.5" cy="52.5" r="1.8" fill="#FFD700" opacity="0.8" /><circle cx="72.5" cy="48" r="2.5" fill="#FFD700" /><circle cx="72.5" cy="52.5" r="1.8" fill="#FFD700" opacity="0.8" /></>}
        </>
      ) : (
        <>
          <path d="M18 100 Q18 70 35 66 Q50 75 65 66 Q82 70 82 100Z" fill={shirt} />
          <rect x="44" y="65" width="5" height="10" rx="1" fill="rgba(255,255,255,0.2)" />
          <rect x="51" y="65" width="5" height="10" rx="1" fill="rgba(255,255,255,0.2)" />
          <rect x="42" y="56" width="16" height="14" rx="3" fill={skin} />
          <ellipse cx="50" cy="45" rx="19" ry="21" fill={skin} />
          <ellipse cx="31" cy="45" rx="4" ry="5" fill={skin} />
          <ellipse cx="69" cy="45" rx="4" ry="5" fill={skin} />
          <ellipse cx="50" cy="28" rx="20" ry="11" fill={hair} />
          <path d="M30 35 Q29 28 50 24 Q71 28 70 35 Q68 30 50 27 Q32 30 30 35Z" fill={hair} />
          <ellipse cx="40" cy="44" rx="3.5" ry="3.5" fill="white" />
          <ellipse cx="60" cy="44" rx="3.5" ry="3.5" fill="white" />
          <circle cx="41" cy="44" r="2.2" fill="#1a0a00" />
          <circle cx="61" cy="44" r="2.2" fill="#1a0a00" />
          <circle cx="42" cy="43" r="0.8" fill="white" />
          <circle cx="62" cy="43" r="0.8" fill="white" />
          <path d="M36 37.5 Q40 36.5 44 37.5" stroke={hair} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M56 37.5 Q60 36.5 64 37.5" stroke={hair} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M48 48 Q50 52 52 48" stroke={skin === "#FDDBB4" ? "#c8906a" : "#7a4a30"} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M44 56 Q50 60 56 56" stroke="#a05050" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {accessory === "glasses" && <><circle cx="40" cy="44" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" /><circle cx="60" cy="44" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" /><line x1="47" y1="44" x2="53" y2="44" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" /></>}
          {accessory === "headset" && <><path d="M30 38 Q30 18 50 18 Q70 18 70 38" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" /><rect x="26" y="37" width="9" height="13" rx="4" fill="#2a2a3e" /><rect x="65" y="37" width="9" height="13" rx="4" fill="#2a2a3e" /><circle cx="26" cy="50" r="3" fill="#FF441F" /></>}
          {accessory === "cap" && <><ellipse cx="50" cy="28" rx="23" ry="7" fill={hair} /><rect x="27" y="22" width="46" height="8" rx="4" fill={hair} /><rect x="64" y="26" width="16" height="5" rx="2.5" fill={hair} /></>}
        </>
      )}
    </svg>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a12; }
  .ra-root { font-family: 'DM Sans', sans-serif; background: #0a0a12; min-height: 100vh; color: #fff; }
  .ra-display { font-family: 'Nunito', sans-serif; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,68,31,.5)} 50%{box-shadow:0 0 0 12px rgba(255,68,31,0)} }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp .5s ease both; }
  .fade-up-1 { animation: fadeUp .5s .1s ease both; }
  .fade-up-2 { animation: fadeUp .5s .2s ease both; }
  .fade-up-3 { animation: fadeUp .5s .3s ease both; }
  .glass { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(12px); }
  .opt-btn { transition: all .2s; }
  .opt-btn:hover:not(:disabled) { transform: translateY(-2px); border-color: rgba(255,68,31,.5) !important; background: rgba(255,68,31,.1) !important; }
  .opt-btn.selected { border-color: #FF441F !important; background: rgba(255,68,31,.2) !important; }
  .admin-card { transition: all .2s; cursor: pointer; }
  .admin-card:hover { transform: translateY(-4px); border-color: rgba(255,68,31,.4) !important; }
  .swatch { transition: transform .15s; cursor: pointer; }
  .swatch:hover { transform: scale(1.2); }
  .btn-primary { transition: all .2s; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(255,68,31,.4) !important; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #FF441F !important; box-shadow: 0 0 0 3px rgba(255,68,31,.15); }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 4px; }
  .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,.1); border-top-color: #FF441F; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
`;

function StyleInject() {
  useEffect(() => { const el = document.createElement("style"); el.textContent = CSS; document.head.appendChild(el); return () => document.head.removeChild(el); }, []);
  return null;
}

function BgOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,68,31,.12) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,144,217,.08) 0%, transparent 70%)" }} />
    </div>
  );
}

function Logo({ subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
      <div style={{ width: 52, height: 52, background: "linear-gradient(135deg, #FF441F, #ff6b3d)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 8px 24px rgba(255,68,31,.4)", flexShrink: 0 }}>🎓</div>
      <div>
        <div className="ra-display" style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-.5px", background: "linear-gradient(90deg, #fff 60%, rgba(255,255,255,.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>BD Academy</div>
        {subtitle && <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function Input({ style, ...props }) { return <input style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, fontSize: 15, color: "#fff", fontFamily: "inherit", ...style }} {...props} />; }
function Select({ style, children, ...props }) { return <select style={{ width: "100%", padding: "13px 16px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, fontSize: 14, color: "#fff", fontFamily: "inherit", ...style }} {...props}>{children}</select>; }
function Card({ children, style, className = "glass" }) { return <div className={className} style={{ borderRadius: 20, padding: 28, marginBottom: 16, ...style }}>{children}</div>; }
function Label({ children }) { return <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{children}</div>; }
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

function Pill({ type }) {
  const cfg = type === "Presentó" ? { bg: "rgba(39,174,96,.15)", color: "#27ae60", border: "rgba(39,174,96,.3)" } : { bg: "rgba(243,156,18,.15)", color: "#f39c12", border: "rgba(243,156,18,.3)" };
  return <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{type}</span>;
}

function ResultsTable({ session }) {
  const excEmails = (session.excusados || []).map(e => e.farmerEmail);
  const allRows = [...(session.farmerResults || []).map((f, i) => ({ ...f, isExc: excEmails.includes(f.email), idx: i + 1 })), ...(session.excusados || []).filter(e => !(session.farmerResults || []).some(r => r.email === e.farmerEmail)).map((e, i) => ({ email: e.farmerEmail, isExc: true, totalQ: "—", answered: "—", correct: "—", incorrect: "—", noAnswer: "—", idx: (session.farmerResults || []).length + i + 1 }))];
  const th = { padding: "10px 12px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".5px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap" };
  const td = { padding: "11px 12px", fontSize: 12, color: "rgba(255,255,255,.75)", borderBottom: "1px solid rgba(255,255,255,.04)" };
  return (
    <div style={{ overflowX: "auto", maxHeight: 380, borderRadius: 12, border: "1px solid rgba(255,255,255,.08)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ position: "sticky", top: 0, background: "#131325" }}>
          <tr>{["#", "Correo", "%", "Debió", "Respondió", "✓", "✗", "—", "Estado"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {allRows.length === 0 && <tr><td colSpan={9} style={{ ...td, textAlign: "center", color: "rgba(255,255,255,.2)", padding: 32 }}>Sin datos aún</td></tr>}
          {allRows.map((f, i) => {
            const score = typeof f.correct === "number" ? pct(f.correct, f.totalQ) : null;
            return (
              <tr key={i} style={{ background: f.isExc ? "rgba(243,156,18,.04)" : "transparent" }}>
                <td style={td}>{f.idx}</td>
                <td style={{ ...td, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.email}</td>
                <td style={{ ...td, fontWeight: 700, color: score === null ? "rgba(255,255,255,.3)" : score >= 80 ? "#27ae60" : score >= 60 ? "#f39c12" : "#e74c3c" }}>{score !== null ? score + "%" : "—"}</td>
                <td style={td}>{f.totalQ}</td><td style={td}>{f.answered}</td>
                <td style={{ ...td, color: "#27ae60", fontWeight: 700 }}>{f.correct}</td>
                <td style={{ ...td, color: "#e74c3c", fontWeight: 700 }}>{f.incorrect}</td>
                <td style={{ ...td, color: "rgba(255,255,255,.3)" }}>{f.noAnswer}</td>
                <td style={td}><Pill type={f.isExc ? "Excusado" : "Presentó"} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem("bda_email") || "");
  const [quizCode, setQuizCode] = useState(() => localStorage.getItem("bda_code") || "");
  const [emailErr, setEmailErr] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [avatar, setAvatar] = useState(() => { try { return JSON.parse(localStorage.getItem("bda_avatar")) || { gender: "male", skin: SKIN_TONES[0], hair: HAIR_COLORS[0], shirt: SHIRT_COLORS[0], accessory: "none" }; } catch { return { gender: "male", skin: SKIN_TONES[0], hair: HAIR_COLORS[0], shirt: SHIRT_COLORS[0], accessory: "none" }; } });
  const [adminPwd, setAdminPwd] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [superEmail, setSuperEmail] = useState("");
  const [superCode, setSuperCode] = useState("");
  const [superEmailErr, setSuperEmailErr] = useState("");
  const [superCodeErr, setSuperCodeErr] = useState("");
  const [showSuper, setShowSuper] = useState(false);
  const [superSession, setSuperSession] = useState(null); // stores session ID string
  const [excusaFarmerEmail, setExcusaFarmerEmail] = useState("");
  const [excusaReason, setExcusaReason] = useState(EXCUSE_REASONS[0]);
  const [excusaOther, setExcusaOther] = useState("");
  const [excusaErr, setExcusaErr] = useState("");
  const [excusaSuccess, setExcusaSuccess] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [session, setSession] = useState(null);
  const [liveSession, setLiveSession] = useState(null);
  const [farmerAnswers, setFarmerAnswers] = useState(() => { try { return JSON.parse(localStorage.getItem("bda_answers")) || []; } catch { return []; } });
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [answeredQIdx, setAnsweredQIdx] = useState(-1); // tracks which question was answered
  // derived: farmer has answered the CURRENT question
  const answered = answeredQIdx === (liveSession?.currentQ ?? -99);
  const [participants, setParticipants] = useState(0);
  const [newQuiz, setNewQuiz] = useState({ title: "", questions: [] });
  const [editingQ, setEditingQ] = useState(null);
  const [revealDistribution, setRevealDistribution] = useState({});
  const timerRef = useRef(null);
  const sessionUnsubRef = useRef(null);
  const endQuestionRef = useRef(null);

  // ── Persist farmer state to localStorage ─────────────────────────────────
  useEffect(() => { if (email) localStorage.setItem("bda_email", email); }, [email]);
  useEffect(() => { if (quizCode) localStorage.setItem("bda_code", quizCode); }, [quizCode]);
  useEffect(() => { localStorage.setItem("bda_avatar", JSON.stringify(avatar)); }, [avatar]);
  useEffect(() => { localStorage.setItem("bda_answers", JSON.stringify(farmerAnswers)); }, [farmerAnswers]);
  useEffect(() => { if (["waiting","quiz"].includes(view)) localStorage.setItem("bda_view", view); if (view === "home") { localStorage.removeItem("bda_view"); localStorage.removeItem("bda_answers"); } }, [view]);

  // ── Restore farmer session on page reload ─────────────────────────────────
  useEffect(() => {
    const savedEmail = localStorage.getItem("bda_email");
    const savedCode = localStorage.getItem("bda_code");
    const savedView = localStorage.getItem("bda_view");
    if (savedEmail && savedCode && (savedView === "waiting" || savedView === "quiz")) {
      setView("waiting"); // will pick up live session via listener
    }
  }, []);

  // ── Load quizzes from Firestore ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "quizzes"), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuizzes(data);
    });
    return () => unsub();
  }, []);

  // ── Listen to live session (farmer side) ──────────────────────────────────
  useEffect(() => {
    if (!quizCode || view !== "waiting") return;
    let retryCount = 0;
    let unsub = null;
    const subscribe = () => {
      unsub = onSnapshot(
        collection(db, "sessions"),
        (snap) => {
          retryCount = 0;
          const found = snap.docs.find(d => d.data().sessionCode === quizCode);
          if (found) {
            const data = { id: found.id, ...found.data() };
            if (!liveSession || liveSession.id !== found.id) {
              setFarmerAnswers([]);
              setAnsweredQIdx(-1);
              localStorage.removeItem("bda_answers");
            }
            setLiveSession(data);
            registerFarmerInSession(found.id);
            if (data.phase === "question") setView("quiz");
            if (data.phase === "finished") setView("quiz");
          }
        },
        (error) => {
          console.error("Waiting listener error:", error);
          if (retryCount < 5) { retryCount++; setTimeout(subscribe, 2000 * retryCount); }
        }
      );
    };
    subscribe();
    return () => { if (unsub) unsub(); };
  }, [quizCode, view]);

  // ── Admin: listen to own session for real participant count + auto-end ────
  const autoEndFiredRef = useRef(false);
  useEffect(() => { autoEndFiredRef.current = false; }, [session?.currentQ]);
  useEffect(() => {
    if (!session?.id || view !== "adminLive") return;
    const unsub = onSnapshot(doc(db, "sessions", session.id), snap => {
      if (snap.exists()) {
        const data = snap.data();
        // Use atomic participantCount for display (accurate at scale)
        const count = data.participantCount || (data.registeredFarmers || []).length;
        setParticipants(count);
        // Auto-end when all farmers answered — use participantCount as threshold
        if (data.phase === "question" && count > 0 && !autoEndFiredRef.current) {
          const answers = data.answers || {};
          const currentQ = data.currentQ;
          const answeredCount = Object.values(answers).filter(arr => arr.some(a => a.qIdx === currentQ)).length;
          if (answeredCount >= count) {
            autoEndFiredRef.current = true;
            clearTimeout(timerRef.current);
            endQuestionRef.current?.();
          }
        }
      }
    });
    return () => unsub();
  }, [session?.id, view]);
  useEffect(() => {
    if (!liveSession?.id || view !== "quiz") return;
    if (sessionUnsubRef.current) sessionUnsubRef.current();
    // Restore answered state from Firestore on rejoin
    const restoreAnswers = async () => {
      try {
        const snap = await getDoc(doc(db, "sessions", liveSession.id));
        if (snap.exists()) {
          const key = email.replace(/\./g, "_").replace(/@/g, "_at_");
          const existingAnswers = snap.data().answers?.[key] || [];
          if (existingAnswers.length > 0) {
            setFarmerAnswers(existingAnswers);
            // Mark current question as answered if already done
            const currentQ = snap.data().currentQ ?? -1;
            if (existingAnswers.some(a => a.qIdx === currentQ)) {
              setAnsweredQIdx(currentQ);
            }
          }
        }
      } catch(e) { console.error("Error restoring answers:", e); }
    };
    restoreAnswers();
    let retryCount = 0;
    const subscribe = () => {
      sessionUnsubRef.current = onSnapshot(
        doc(db, "sessions", liveSession.id),
        (snap) => {
          if (snap.exists()) {
            retryCount = 0;
            const data = { id: snap.id, ...snap.data() };
            setLiveSession(data);
            if (data.phase === "finished") setView("quiz");
          }
        },
        (error) => {
          console.error("Listener error:", error);
          if (retryCount < 5) {
            retryCount++;
            setTimeout(subscribe, 2000 * retryCount);
          }
        }
      );
    };
    };
    subscribe();
    return () => { if (sessionUnsubRef.current) sessionUnsubRef.current(); };
  }, [liveSession?.id, view]);

  // ── Admin timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || session.phase !== "question") return;
    if (session.timer <= 0) { endQuestion(); return; }
    timerRef.current = setTimeout(() => {
      const newTimer = session.timer - 1;
      setSession(s => ({ ...s, timer: newTimer }));
      if (session.id) updateDoc(doc(db, "sessions", session.id), { timer: newTimer });
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [session?.timer, session?.phase]);

  function farmerLogin() {
    let ok = true;
    if (!email.endsWith("@rappi.com")) { setEmailErr("Usa tu correo @rappi.com"); ok = false; } else setEmailErr("");
    if (!quizCode || quizCode.length !== 6) { setCodeErr("Código de 6 dígitos requerido"); ok = false; } else setCodeErr("");
    if (ok) setView("avatar");
  }

  // Register farmer in Firestore when they enter the lobby
  async function registerFarmerInSession(sessionId) {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      const snap = await getDoc(sessionRef);
      if (!snap.exists()) return;
      const data = snap.data();
      const registered = data.registeredFarmers || [];
      if (!registered.includes(email)) {
        // Use batch: add to array AND increment counter atomically
        const batch = writeBatch(db);
        batch.update(sessionRef, {
          registeredFarmers: [...registered, email],
          participantCount: increment(1)
        });
        await batch.commit();
      }
    } catch(e) { console.error("Error registering farmer:", e); }
  }

  function adminLogin() { if (adminPwd === ADMIN_CODE) { setView("admin"); setAdminErr(""); } else setAdminErr("Código incorrecto"); }
  function superLogin() {
    let ok = true;
    if (!superEmail.endsWith("@rappi.com")) { setSuperEmailErr("Usa tu correo @rappi.com"); ok = false; } else setSuperEmailErr("");
    if (superCode !== SUPER_CODE) { setSuperCodeErr("Código incorrecto"); ok = false; } else setSuperCodeErr("");
    if (ok) setView("supervisor");
  }

  async function saveQuizToFirestore(quizData) {
    setLoading(true);
    try {
      if (quizData._editId) {
        const { _editId, ...data } = quizData;
        await setDoc(doc(db, "quizzes", _editId), data);
      } else {
        await addDoc(collection(db, "quizzes"), { ...quizData, sessions: [], createdAt: serverTimestamp() });
      }
      setNewQuiz({ title: "", questions: [] }); setEditingQ(null); setView("adminQuiz");
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function deleteQuiz(id) {
    if (window.confirm("¿Eliminar este quiz? Esta acción no se puede deshacer.")) {
      await deleteDoc(doc(db, "quizzes", id));
    }
  }

  async function startSession(quiz) {
    setLoading(true);
    const code = genCode();
    const qs = quiz.questions.map(q => ({ ...q, _opts: shuffle(q.options.map((o, i) => ({ text: o, orig: i }))) }));
    const sessionData = { quizId: quiz.id, quizTitle: quiz.title, sessionCode: code, questions: qs, currentQ: -1, phase: "waiting", timer: 0, registeredFarmers: [], participantCount: 0, answers: {}, excusados: [], createdAt: serverTimestamp() };
    const ref = await addDoc(collection(db, "sessions"), sessionData);
    setSession({ ...sessionData, id: ref.id });
    setParticipants(0); setFarmerAnswers([]);
    setLoading(false);
    setView("adminLive");
  }

  async function nextQuestion() {
    const next = (session?.currentQ ?? -1) + 1;
    const qs = session.questions;
    if (next >= qs.length) { endQuiz(); return; }
    const q = qs[next];
    const updates = { currentQ: next, phase: "question", timer: q.time };
    setSession(s => ({ ...s, ...updates }));
    await updateDoc(doc(db, "sessions", session.id), updates);
    setCurrentAnswer(null);
    setRevealDistribution({});
  }

  // Keep endQuestionRef in sync so the auto-end listener can call it
  useEffect(() => { endQuestionRef.current = endQuestion; });

  async function endQuestion() {
    clearTimeout(timerRef.current);
    // Delay to ensure all farmer answers have been written to Firestore
    await new Promise(r => setTimeout(r, 2500));
    // Read session state fresh from Firestore (avoids stale closure)
    const sessionId = session?.id;
    if (!sessionId) return;
    const snap = await getDoc(doc(db, "sessions", sessionId));
    if (!snap.exists()) return;
    const data = snap.data();
    const rawAnswers = data.answers || {};
    const registered = data.registeredFarmers || [];
    // Use atomic participantCount for accuracy at scale
    const totalParticipants = data.participantCount || registered.length;
    const currentQ = data.currentQ;
    const questions = data.questions || [];
    const activeQuestion = questions[currentQ];
    if (!activeQuestion) return;
    // Calculate distribution
    const dist = {};
    activeQuestion.options.forEach((_, i) => { dist[i] = 0; });
    let totalAnswered = 0;
    Object.values(rawAnswers).forEach(arr => {
      if (!Array.isArray(arr)) return;
      const ans = arr.find(a => a.qIdx === currentQ);
      if (ans !== undefined) { dist[ans.answer] = (dist[ans.answer] || 0) + 1; totalAnswered++; }
    });
    const pctDist = {};
    activeQuestion.options.forEach((_, i) => { pctDist[i] = dist[i]; });
    pctDist._total = totalParticipants;
    pctDist._answered = totalAnswered;
    setRevealDistribution(pctDist);
    setParticipants(totalParticipants);
    const updates = { phase: "reveal", timer: 0 };
    setSession(s => ({ ...s, ...updates }));
    await updateDoc(doc(db, "sessions", sessionId), updates);
  }

  async function endQuiz() {
    clearTimeout(timerRef.current);
    const sessionRef = doc(db, "sessions", session.id);
    const snap = await getDoc(sessionRef);
    const sessionData = snap.exists() ? snap.data() : {};
    const registeredFarmers = sessionData.registeredFarmers || [];
    const rawAnswers = sessionData.answers || {};
    const totalQ = session.questions.length;
    const excusados = sessionData.excusados || [];
    const excusadoEmails = excusados.map(e => e.farmerEmail);
    const totalParticipants = sessionData.participantCount || registeredFarmers.length;

    // Build real results per farmer — deduplicate answers per question
    const farmerResults = registeredFarmers.map(farmerEmail => {
      const key = farmerEmail.replace(/\./g, "_").replace(/@/g, "_at_");
      const rawList = rawAnswers[key] || [];
      // Keep only last answer per question index
      const deduped = Object.values(rawList.reduce((acc, a) => { acc[a.qIdx] = a; return acc; }, {}));
      let correct = 0; let incorrect = 0;
      deduped.forEach(({ qIdx, answer }) => {
        const q = session.questions[qIdx];
        if (!q) return;
        const isCorrect = Array.isArray(q.correct) ? q.correct.includes(answer) : q.correct === answer;
        if (isCorrect) correct++; else incorrect++;
      });
      const answered = deduped.length;
      const noAnswer = totalQ - answered;
      return { email: farmerEmail, totalQ, answered, correct, incorrect, noAnswer };
    });

    const activeFarmers = farmerResults.filter(f => !excusadoEmails.includes(f.email));
    const avg = activeFarmers.length ? Math.round(activeFarmers.reduce((s, f) => s + pct(f.correct, f.totalQ), 0) / activeFarmers.length) : 0;

    const newSessionRecord = {
      id: genCode(),
      date: new Date().toISOString().slice(0, 10),
      participants: totalParticipants,
      avgScore: avg,
      farmerResults,
      excusados,
    };

    const updates = { phase: "finished", farmerResults };
    setSession(s => ({ ...s, ...updates }));
    await updateDoc(sessionRef, updates);

    const quizRef = doc(db, "quizzes", session.quizId);
    const quizSnap = await getDoc(quizRef);
    if (quizSnap.exists()) {
      const existing = quizSnap.data().sessions || [];
      await updateDoc(quizRef, { sessions: [...existing, newSessionRecord] });
    }
    setParticipants(registeredFarmers.length);
  }

  async function submitAnswer(origIdx) {
    if (answered) return;
    const qIdx = liveSession?.currentQ ?? 0;
    // Check Firestore first — prevent double answer after page refresh
    if (liveSession?.id) {
      try {
        const sessionRef = doc(db, "sessions", liveSession.id);
        const snap = await getDoc(sessionRef);
        if (snap.exists()) {
          const key = email.replace(/\./g, "_").replace(/@/g, "_at_");
          const existingAnswers = snap.data().answers?.[key] || [];
          // If already answered this question, mark as answered and block
          const alreadyAnswered = existingAnswers.some(a => a.qIdx === qIdx);
          if (alreadyAnswered) {
            setAnsweredQIdx(qIdx); // mark UI as answered
            return;
          }
          // Save new answer
          const updated = [...existingAnswers, { qIdx, answer: origIdx }];
          await updateDoc(sessionRef, { [`answers.${key}`]: updated });
        }
      } catch(e) { console.error("Error saving answer:", e); }
    }
    setCurrentAnswer(origIdx);
    setAnsweredQIdx(qIdx);
    setFarmerAnswers(a => [...a, { qIdx, answer: origIdx }]);
  }
      } catch(e) { console.error("Error saving answer:", e); }
    }
  }

  async function submitExcusa(target) {
    setExcusaErr("");
    if (!excusaFarmerEmail.endsWith("@rappi.com")) { setExcusaErr("Correo inválido (@rappi.com)"); return; }
    const reason = excusaReason === "Otra razón" ? excusaOther : excusaReason;
    if (!reason) { setExcusaErr("Ingresa la razón"); return; }
    const excusa = { farmerEmail: excusaFarmerEmail, supervisorEmail: superEmail, reason, timestamp: new Date().toLocaleString("es-CO") };
    try {
      if (target?.isLive && session?.id) {
        // Save to active live session in Firestore
        await updateDoc(doc(db, "sessions", session.id), { excusados: [...(session.excusados || []), excusa] });
      } else if (target?.quizId && target?.id) {
        // Save to historical session inside quizzes collection
        const quizRef = doc(db, "quizzes", target.quizId);
        const quizSnap = await getDoc(quizRef);
        if (quizSnap.exists()) {
          const sessions = quizSnap.data().sessions || [];
          const updated = sessions.map(s => s.id === target.id
            ? { ...s, excusados: [...(s.excusados || []), excusa] }
            : s
          );
          await updateDoc(quizRef, { sessions: updated });
        }
      }
      setExcusaFarmerEmail(""); setExcusaOther(""); setExcusaReason(EXCUSE_REASONS[0]);
      setExcusaSuccess(true); setTimeout(() => setExcusaSuccess(false), 3000);
    } catch(e) { console.error("Error registrando excusa:", e); setExcusaErr("Error al guardar, intenta de nuevo."); }
  }

  const activeQ = session && session.currentQ >= 0 ? session.questions[session.currentQ] : null;
  const liveQ = liveSession && liveSession.currentQ >= 0 ? liveSession.questions?.[liveSession.currentQ] : null;
  const timerPct = activeQ ? (session.timer / activeQ.time) * 100 : 0;
  const timerColor = timerPct > 50 ? "#27ae60" : timerPct > 25 ? "#f39c12" : "#e74c3c";
  const pageStyle = { position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "40px 20px" };
  const widePageStyle = { position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "32px 20px" };

  if (loading) return (
    <div className="ra-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <StyleInject /><div><div className="spinner" /><div style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,.4)", fontSize: 14 }}>Cargando...</div></div>
    </div>
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div className="ra-root"><StyleInject /><BgOrbs />
      <div style={pageStyle}>
        <div className="fade-up"><Logo subtitle="Business Development · Farmers" /></div>
        <Card className="glass fade-up-1">
          <div className="ra-display" style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Ingresar al Quiz</div>
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
        <Card className="glass fade-up-2" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4A90D9" }}>👁 Portal Supervisores</span>
            <Btn variant="mini" style={{ background: "linear-gradient(135deg,#4A90D9,#6ab0f5)", boxShadow: "0 4px 16px rgba(74,144,217,.3)" }} onClick={() => setShowSuper(v => !v)}>{showSuper ? "Cerrar" : "Abrir"}</Btn>
          </div>
          {showSuper && <div style={{ marginTop: 16, animation: "fadeIn .3s ease" }}>
            <div style={{ marginBottom: 12 }}><Label>Tu correo @rappi.com</Label><Input placeholder="supervisor@rappi.com" value={superEmail} onChange={e => { setSuperEmail(e.target.value); setSuperEmailErr(""); }} style={superEmailErr ? { borderColor: "#e74c3c" } : {}} />{superEmailErr && <div style={{ fontSize: 12, color: "#e74c3c", marginTop: 4 }}>{superEmailErr}</div>}</div>
            <div style={{ marginBottom: 16 }}><Label>Código de supervisor</Label><Input type="password" placeholder="Código" value={superCode} onChange={e => { setSuperCode(e.target.value); setSuperCodeErr(""); }} onKeyDown={e => e.key === "Enter" && superLogin()} style={superCodeErr ? { borderColor: "#e74c3c" } : {}} />{superCodeErr && <div style={{ fontSize: 12, color: "#e74c3c", marginTop: 4 }}>{superCodeErr}</div>}</div>
            <Btn variant="blue" style={{ width: "100%" }} onClick={superLogin}>Entrar como Supervisor</Btn>
          </div>}
        </Card>
        <Card className="glass fade-up-3" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>⚙️ Admin · Trainer</span>
            <Btn variant="mini" onClick={() => setShowAdmin(v => !v)}>{showAdmin ? "Cerrar" : "Abrir"}</Btn>
          </div>
          {showAdmin && <div style={{ marginTop: 16, animation: "fadeIn .3s ease" }}>
            <Input type="password" placeholder="Código admin" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && adminLogin()} style={{ marginBottom: 12 }} />
            {adminErr && <div style={{ fontSize: 12, color: "#e74c3c", marginBottom: 10 }}>{adminErr}</div>}
            <Btn variant="ghost" style={{ width: "100%" }} onClick={adminLogin}>Entrar como Admin</Btn>
          </div>}
        </Card>
      </div>
    </div>
  );

  // ── AVATAR ────────────────────────────────────────────────────────────────
  if (view === "avatar") return (
    <div className="ra-root"><StyleInject /><BgOrbs />
      <div style={pageStyle}>
        <Logo />
        <Card className="glass fade-up">
          <div className="ra-display" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Tu personaje</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ width: 120, height: 120, borderRadius: "50%", padding: 4, background: "linear-gradient(135deg, #FF441F, #ff6b3d)", boxShadow: "0 8px 32px rgba(255,68,31,.4)" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}><Avatar config={avatar} size={112} /></div>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <Label>Género</Label>
            <div style={{ display: "flex", gap: 10 }}>
              {[["male", "👦 Hombre"], ["female", "👧 Mujer"]].map(([g, label]) => (
                <button key={g} onClick={() => setAvatar(a => ({ ...a, gender: g }))} style={{ flex: 1, padding: "12px", background: avatar.gender === g ? "rgba(255,68,31,.2)" : "rgba(255,255,255,.05)", border: `2px solid ${avatar.gender === g ? "#FF441F" : "rgba(255,255,255,.1)"}`, borderRadius: 12, color: avatar.gender === g ? "#FF441F" : "rgba(255,255,255,.5)", fontWeight: 700, cursor: "pointer", fontSize: 14, transition: "all .2s", fontFamily: "inherit" }}>{label}</button>
              ))}
            </div>
          </div>
          {[{ label: "Tono de piel", items: SKIN_TONES, key: "skin" }, { label: "Cabello", items: HAIR_COLORS, key: "hair" }, { label: "Camisa", items: SHIRT_COLORS, key: "shirt" }].map(({ label, items, key }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <Label>{label}</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {items.map(c => <div key={c} className="swatch" onClick={() => setAvatar(a => ({ ...a, [key]: c }))} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: avatar[key] === c ? "3px solid #FF441F" : "3px solid rgba(255,255,255,.15)", boxShadow: avatar[key] === c ? "0 0 0 2px rgba(255,68,31,.3)" : "none" }} />)}
              </div>
            </div>
          ))}
          <div style={{ marginBottom: 24 }}>
            <Label>Accesorio</Label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["none", "—"], ["glasses", "👓"], ["headset", "🎧"], ["cap", "🧢"], ...(avatar.gender === "female" ? [["earrings", "💛"]] : [])].map(([ac, icon]) => (
                <button key={ac} onClick={() => setAvatar(a => ({ ...a, accessory: ac }))} style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${avatar.accessory === ac ? "#FF441F" : "rgba(255,255,255,.1)"}`, background: avatar.accessory === ac ? "rgba(255,68,31,.2)" : "rgba(255,255,255,.05)", cursor: "pointer", fontSize: 20, transition: "all .2s" }}>{icon}</button>
              ))}
            </div>
          </div>
          <Btn variant="primary" style={{ width: "100%" }} onClick={() => setView("waiting")}>¡Listo, entrar! →</Btn>
        </Card>
      </div>
    </div>
  );

  // ── WAITING ───────────────────────────────────────────────────────────────
  if (view === "waiting") return (
    <div className="ra-root"><StyleInject /><BgOrbs />
      <div style={{ ...pageStyle, textAlign: "center" }}>
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", padding: 4, background: "linear-gradient(135deg, #FF441F, #ff6b3d)", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(255,68,31,.4)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}><Avatar config={avatar} size={112} /></div>
          </div>
          <div className="ra-display" style={{ fontSize: 22, fontWeight: 800 }}>{email.split("@")[0]}</div>
          <div style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginTop: 4 }}>Código: {quizCode}</div>
        </div>
        <Card className="glass fade-up-1">
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FF441F", margin: "0 auto 16px", animation: "pulse 1.5s infinite" }} />
          <div className="ra-display" style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Esperando al trainer...</div>
          <div style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>El quiz arrancará en cualquier momento.</div>
          {liveSession && <div style={{ marginTop: 16, display: "inline-block", padding: "8px 20px", background: "rgba(255,68,31,.15)", borderRadius: 99, color: "#FF441F", fontWeight: 700, fontSize: 14, border: "1px solid rgba(255,68,31,.3)" }}>{liveSession.quizTitle}</div>}
        </Card>
        <Btn variant="ghost" onClick={() => setView("home")}>← Volver</Btn>
      </div>
    </div>
  );

  // ── FARMER QUIZ ───────────────────────────────────────────────────────────
  if (view === "quiz") {
    const qs = liveSession || {};
    if (!qs || qs.phase === "finished") {
      // Deduplicate: keep only the last answer per question index
      const dedupedAnswers = Object.values(
        farmerAnswers.reduce((acc, fa) => { acc[fa.qIdx] = fa; return acc; }, {})
      );
      const correct = dedupedAnswers.filter(fa => { const qq = qs?.questions?.[fa.qIdx]; if (!qq) return false; return Array.isArray(qq.correct) ? qq.correct.includes(fa.answer) : fa.answer === qq.correct; }).length;
      const total = qs?.questions?.length || 1;
      const p = Math.min(100, Math.round((correct / total) * 100));
      return (
        <div className="ra-root"><StyleInject /><BgOrbs />
          <div style={{ ...pageStyle, textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 8 }}>{p >= 80 ? "🏆" : p >= 60 ? "💪" : "📚"}</div>
            <div className="ra-display fade-up" style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>¡Quiz terminado!</div>
            <Card className="glass fade-up-1" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 80, fontWeight: 900, background: "linear-gradient(135deg, #FF441F, #ff6b3d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>{p}%</div>
              <div style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginTop: 4 }}>{correct} de {total} preguntas correctas</div>
            </Card>
            {qs?.questions?.map((qq, i) => { const fa = dedupedAnswers.find(a => a.qIdx === i); const ok = fa && (Array.isArray(qq.correct) ? qq.correct.includes(fa.answer) : fa.answer === qq.correct); return <div key={i} className="glass" style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 8, borderLeft: `3px solid ${ok ? "#27ae60" : "#e74c3c"}`, textAlign: "left" }}><div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 3 }}>P{i + 1}: {qq.text}</div><div style={{ fontSize: 12, fontWeight: 700, color: ok ? "#27ae60" : "#e74c3c" }}>{ok ? "✓ Correcto" : "✗ Incorrecto"}</div></div>; })}
            <Btn variant="primary" style={{ width: "100%", marginTop: 16 }} onClick={() => { setView("home"); setLiveSession(null); setFarmerAnswers([]); }}>Volver al inicio</Btn>
          </div>
        </div>
      );
    }
    if (!liveQ) return <div className="ra-root"><StyleInject /><div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div className="spinner" /></div></div>;
    if (qs.phase === "reveal") {
      const fa = farmerAnswers.find(a => a.qIdx === qs.currentQ);
      const ok = fa && (Array.isArray(liveQ.correct) ? liveQ.correct.includes(fa.answer) : fa.answer === liveQ.correct);
      return (
        <div className="ra-root"><StyleInject /><BgOrbs />
          <div style={{ ...pageStyle, textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>{!fa ? "⏰" : ok ? "🎉" : "😅"}</div>
            <div className="ra-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{!fa ? "¡Tiempo!" : ok ? "¡Correcto!" : "¡Casi!"}</div>
            <Card className="glass" style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>Respuesta correcta:</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#27ae60" }}>{Array.isArray(liveQ.correct) ? liveQ.correct.map(i => liveQ.options[i]).join(", ") : liveQ.options[liveQ.correct]}</div>
            </Card>
            <div style={{ color: "rgba(255,255,255,.3)", fontSize: 13, marginTop: 16 }}>Esperando la siguiente pregunta...</div>
          </div>
        </div>
      );
    }
    const OCOLS = ["#FF441F", "#4A90D9", "#27ae60", "#f39c12"];
    const liveTimerPct = liveQ ? (qs.timer / liveQ.time) * 100 : 0;
    const liveTimerColor = liveTimerPct > 50 ? "#27ae60" : liveTimerPct > 25 ? "#f39c12" : "#e74c3c";
    return (
      <div className="ra-root"><StyleInject />
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,68,31,.5)" }}><Avatar config={avatar} size={40} /></div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>{email.split("@")[0]}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {qs.questions?.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < qs.currentQ ? "#FF441F" : i === qs.currentQ ? "#fff" : "rgba(255,255,255,.2)" }} />)}
            </div>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${liveTimerColor}, ${liveTimerColor}88)`, width: `${liveTimerPct}%`, transition: "width 1s linear, background .5s" }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 36, fontWeight: 900, color: liveTimerColor, marginBottom: 16, fontFamily: "'Nunito',sans-serif" }}>{qs.timer}s</div>
          <div className="glass" style={{ borderRadius: 20, padding: "22px 24px", marginBottom: 16, borderLeft: "3px solid rgba(255,68,31,.4)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#FF441F", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>{liveQ.type === "truefalse" ? "Verdadero / Falso" : liveQ.type === "multi" ? "Selección múltiple" : "Opción única"}</div>
            <div className="ra-display" style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.45 }}>{liveQ.text}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {liveQ._opts?.map((opt, i) => {
              return (
                <button key={i} className="opt-btn"
                  onClick={() => !answered && submitAnswer(opt.orig)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", background: "rgba(255,255,255,.04)", border: "2px solid rgba(255,255,255,.08)", borderRadius: 14, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,.7)", cursor: answered ? "default" : "pointer", textAlign: "left", width: "100%", fontFamily: "inherit", opacity: answered ? 0.5 : 1 }}>
                  <span style={{ minWidth: 32, height: 32, background: "rgba(255,255,255,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                  {opt.text}
                </button>
              );
            })}
          </div>
          {answered && <div style={{ textAlign: "center", color: "#27ae60", fontSize: 14, fontWeight: 700, marginTop: 16 }}>✓ Respuesta registrada — esperando al resto...</div>}
        </div>
      </div>
    );
  }

  // ── SUPERVISOR ────────────────────────────────────────────────────────────
  if (view === "supervisor") {
    // Build allSessions fresh from Firestore-backed quizzes (live via onSnapshot)
    const allSessions = [];
    quizzes.forEach(quiz => (quiz.sessions || []).forEach(s => allSessions.push({ ...s, quizTitle: quiz.title, quizId: quiz.id })));
    if (session && session.phase !== "finished") {
      allSessions.unshift({ id: "live", date: "🔴 EN VIVO", quizTitle: session.quizTitle, quizId: session.quizId, isLive: true, farmerResults: session.farmerResults || [], excusados: session.excusados || [] });
    }
    // Find target by ID so it always reflects latest Firestore data
    const targetId = superSession;
    const target = allSessions.find(s => s.id === targetId) || (allSessions.length ? allSessions[0] : null);
    const excEmails = (target?.excusados || []).map(e => e.farmerEmail);
    const active = (target?.farmerResults || []).filter(r => !excEmails.includes(r.email));
    const avg = active.length ? Math.round(active.reduce((s, r) => s + pct(r.correct, r.totalQ), 0) / active.length) : 0;
    return (
      <div className="ra-root"><StyleInject /><BgOrbs />
        <div style={widePageStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, background: "linear-gradient(135deg, #4A90D9, #6ab0f5)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 24px rgba(74,144,217,.4)" }}>👁</div>
              <div><div className="ra-display" style={{ fontSize: 20, fontWeight: 800 }}>Portal Supervisor</div><div style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>{superEmail}</div></div>
            </div>
            <Btn variant="ghost" onClick={() => setView("home")}>Salir</Btn>
          </div>

          {/* Empty state */}
          {allSessions.length === 0 && (
            <Card className="glass" style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
              <div className="ra-display" style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>No hay sesiones disponibles aún</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", lineHeight: 1.7 }}>
                Las sesiones aparecen aquí cuando el trainer inicia un quiz.<br/>
                Puedes registrar excusados durante o después de cualquier sesión.
              </div>
            </Card>
          )}

          {allSessions.length > 0 && (
            <>
              <Card className="glass" style={{ padding: "16px 20px", marginBottom: 24 }}>
                <Label>Selecciona la sesión</Label>
                <Select value={target?.id || ""} onChange={e => setSuperSession(e.target.value)}>
                  {allSessions.map(s => <option key={s.id} value={s.id}>{s.isLive ? "🔴 EN VIVO — " : ""}{s.quizTitle} · {s.date}</option>)}
                </Select>
              </Card>
              {target && (
                <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
                  <div>
                    <div className="ra-display" style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: "rgba(255,255,255,.7)" }}>Registrar Excusado</div>
                    <Card className="glass">
                      <div style={{ marginBottom: 14 }}><Label>Correo del farmer</Label><Input placeholder="farmer@rappi.com" value={excusaFarmerEmail} onChange={e => { setExcusaFarmerEmail(e.target.value); setExcusaErr(""); }} style={excusaErr ? { borderColor: "#e74c3c" } : {}} /></div>
                      <div style={{ marginBottom: excusaReason === "Otra razón" ? 14 : 20 }}><Label>Razón</Label><Select value={excusaReason} onChange={e => setExcusaReason(e.target.value)}>{EXCUSE_REASONS.map(r => <option key={r}>{r}</option>)}</Select></div>
                      {excusaReason === "Otra razón" && <div style={{ marginBottom: 20 }}><Label>Especifica</Label><Input placeholder="Describe la razón..." value={excusaOther} onChange={e => setExcusaOther(e.target.value)} /></div>}
                      {excusaErr && <div style={{ fontSize: 12, color: "#e74c3c", marginBottom: 10, fontWeight: 600 }}>{excusaErr}</div>}
                      {excusaSuccess && <div style={{ fontSize: 13, color: "#27ae60", marginBottom: 10, fontWeight: 700 }}>✓ Excusa registrada</div>}
                      <Btn variant="blue" style={{ width: "100%" }} onClick={() => submitExcusa(target)}>Registrar excusa</Btn>
                    </Card>
                    <div className="ra-display" style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, color: "rgba(255,255,255,.5)" }}>Excusados en esta sesión ({(target.excusados || []).length})</div>
                    {(target.excusados || []).length === 0
                      ? <div style={{ color: "rgba(255,255,255,.2)", fontSize: 13 }}>Sin excusas registradas aún.</div>
                      : (target.excusados || []).map((e, i) => (
                        <div key={i} className="glass" style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 8, borderLeft: "3px solid #4A90D9" }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{e.farmerEmail}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 3 }}>{e.reason}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 3, display: "flex", gap: 8 }}>
                            <span>👤 {e.supervisorEmail}</span>
                            <span>· {e.timestamp}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div>
                        <div className="ra-display" style={{ fontSize: 15, fontWeight: 800 }}>{target.quizTitle}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{target.date}</div>
                      </div>
                      <Btn variant="green" onClick={() => openCSV(buildCSV(target, target.quizTitle), target.quizTitle)}>↓ CSV</Btn>
                    </div>
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
            </>
          )}
        </div>
      </div>
    );
  }

  // ── ADMIN HOME ────────────────────────────────────────────────────────────
  if (view === "admin") return (
    <div className="ra-root"><StyleInject /><BgOrbs />
      <div style={widePageStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Logo subtitle="Panel Admin" />
          <Btn variant="ghost" onClick={() => setView("home")}>Salir</Btn>
        </div>
        {session && session.phase !== "finished" && (
          <div className="glass" style={{ borderRadius: 14, padding: "12px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "3px solid #FF441F" }}>
            <span style={{ fontSize: 14 }}>🔴 Sesión activa: <b>{session.quizTitle}</b> · Código: <b style={{ color: "#FF441F" }}>{session.sessionCode}</b></span>
            <Btn variant="mini" onClick={() => setView("adminLive")}>Ver tablero →</Btn>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[{ icon: "📋", title: "Mis Quices", sub: `${quizzes.length} quices`, action: "adminQuiz", color: "#FF441F" }, { icon: "✏️", title: "Crear Quiz", sub: "Diseña preguntas personalizadas", action: "adminCreate", color: "#4A90D9" }, { icon: "📊", title: "Historial", sub: "Resultados y reportes", action: "adminHistory", color: "#27ae60" }].map(c => (
            <div key={c.action} className="glass admin-card" onClick={() => setView(c.action)} style={{ borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
              <div className="ra-display" style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>{c.sub}</div>
              <div style={{ marginTop: 16, height: 3, width: 32, background: c.color, borderRadius: 99 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── ADMIN QUIZ LIST ───────────────────────────────────────────────────────
  if (view === "adminQuiz") return (
    <div className="ra-root"><StyleInject /><BgOrbs />
      <div style={widePageStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Btn variant="ghost" onClick={() => setView("admin")}>← Volver</Btn>
          <div className="ra-display" style={{ fontSize: 20, fontWeight: 800 }}>Mis Quices</div>
          <Btn variant="mini" onClick={() => { setNewQuiz({ title: "", questions: [] }); setEditingQ(null); setView("adminCreate"); }}>+ Nuevo</Btn>
        </div>
        {quizzes.length === 0 && <div className="glass" style={{ borderRadius: 18, padding: 40, textAlign: "center", color: "rgba(255,255,255,.3)" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><div>No tienes quices aún. ¡Crea el primero!</div></div>}
        {quizzes.map(qz => (
          <div key={qz.id} className="glass" style={{ borderRadius: 18, padding: "20px 24px", marginBottom: 14, display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div className="ra-display" style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{qz.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>{qz.questions?.length || 0} preguntas · {(qz.sessions || []).length} sesión(es)</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Btn variant="primary" style={{ padding: "10px 18px", fontSize: 13 }} onClick={() => startSession(qz)}>▶ Iniciar</Btn>
              <Btn variant="ghost" style={{ padding: "9px 16px", fontSize: 13 }} onClick={() => { setNewQuiz({ ...qz, _editId: qz.id }); setEditingQ(null); setView("adminCreate"); }}>✏️ Editar</Btn>
              <Btn variant="ghost" style={{ padding: "9px 16px", fontSize: 12 }} onClick={() => setView("adminHistory")}>📊</Btn>
              <button onClick={() => deleteQuiz(qz.id)} style={{ padding: "9px 14px", background: "rgba(231,76,60,.12)", border: "1px solid rgba(231,76,60,.3)", borderRadius: 10, color: "#e74c3c", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── ADMIN CREATE/EDIT ─────────────────────────────────────────────────────
  if (view === "adminCreate") {
    const isEditing = !!newQuiz._editId;
    function addQ(type) { setNewQuiz(nq => ({ ...nq, questions: [...(nq.questions || []), { id: genCode(), type, text: "", time: 20, options: type === "truefalse" ? ["Verdadero", "Falso"] : ["", "", "", ""], correct: type === "multi" ? [] : 0 }] })); setEditingQ((newQuiz.questions || []).length); }
    return (
      <div className="ra-root"><StyleInject /><BgOrbs />
        <div style={widePageStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Btn variant="ghost" onClick={() => setView("adminQuiz")}>← Volver</Btn>
            <div className="ra-display" style={{ fontSize: 20, fontWeight: 800 }}>{isEditing ? "✏️ Editar Quiz" : "Crear Quiz"}</div>
            <Btn variant="primary" style={{ padding: "10px 20px" }} onClick={() => saveQuizToFirestore(newQuiz)} disabled={!newQuiz.title || loading}>{loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar"}</Btn>
          </div>
          <Card className="glass"><Label>Título del quiz</Label><Input placeholder="Ej: Fundamentos de Markdown" value={newQuiz.title || ""} onChange={e => setNewQuiz(q => ({ ...q, title: e.target.value }))} /></Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Preguntas ({(newQuiz.questions || []).length})</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {[["single", "Opción única"], ["multi", "Múltiple"], ["truefalse", "V / F"]].map(([t, l]) => <Btn key={t} variant="ghost" style={{ fontSize: 13 }} onClick={() => addQ(t)}>+ {l}</Btn>)}
          </div>
          {(newQuiz.questions || []).map((qq, qi) => (
            <div key={qq.id} className="glass" style={{ borderRadius: 16, padding: "16px 20px", marginBottom: 12, borderLeft: `3px solid ${editingQ === qi ? "#FF441F" : "rgba(255,255,255,.08)"}`, cursor: "pointer" }} onClick={() => setEditingQ(editingQ === qi ? null : qi)}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700, color: qq.text ? "#fff" : "rgba(255,255,255,.2)" }}>P{qi + 1}: {qq.text || "Sin texto aún..."}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", textTransform: "uppercase" }}>{qq.type} · {qq.time}s</div>
                </div>
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

  // ── ADMIN HISTORY ─────────────────────────────────────────────────────────
  if (view === "adminHistory") return (
    <div className="ra-root"><StyleInject /><BgOrbs />
      <div style={widePageStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Btn variant="ghost" onClick={() => setView("admin")}>← Volver</Btn>
          <div className="ra-display" style={{ fontSize: 20, fontWeight: 800 }}>Historial & Reportes</div>
          <div />
        </div>
        {quizzes.map(qz => (
          <div key={qz.id} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>{qz.title}</div>
            {(qz.sessions || []).length === 0 && <div style={{ color: "rgba(255,255,255,.2)", fontSize: 14 }}>Sin sesiones aún.</div>}
            {(qz.sessions || []).map(s => {
              const excE = (s.excusados || []).map(e => e.farmerEmail);
              const act = (s.farmerResults || []).filter(r => !excE.includes(r.email));
              const av = act.length ? Math.round(act.reduce((acc, r) => acc + pct(r.correct, r.totalQ), 0) / act.length) : s.avgScore;
              return (
                <div key={s.id} className="glass" style={{ borderRadius: 18, padding: "20px 24px", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      {/* Quiz title prominent */}
                      <div className="ra-display" style={{ fontWeight: 900, fontSize: 17, marginBottom: 2, color: "#fff" }}>{qz.title}</div>
                      <div className="ra-display" style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: "rgba(255,255,255,.5)" }}>{s.date}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", display: "flex", gap: 16 }}>
                        <span>👥 {s.participants || (s.farmerResults || []).length} participantes</span>
                        <span>🔵 {(s.excusados || []).length} excusados</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${av >= 80 ? "#27ae60" : av >= 60 ? "#f39c12" : "#e74c3c"}`, background: `${av >= 80 ? "#27ae60" : av >= 60 ? "#f39c12" : "#e74c3c"}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: av >= 80 ? "#27ae60" : av >= 60 ? "#f39c12" : "#e74c3c" }}>{av}%</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 3 }}>asertividad</div>
                      </div>
                      <Btn variant="green" onClick={() => openCSV(buildCSV(s, qz.title), qz.title)}>↓ CSV</Btn>
                      <button onClick={async () => {
                        if (window.confirm("¿Eliminar esta sesión del historial?")) {
                          const quizRef = doc(db, "quizzes", qz.id);
                          const updated = (qz.sessions || []).filter(x => x.id !== s.id);
                          await updateDoc(quizRef, { sessions: updated });
                        }
                      }} style={{ padding: "9px 12px", background: "rgba(231,76,60,.12)", border: "1px solid rgba(231,76,60,.3)", borderRadius: 10, color: "#e74c3c", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>🗑️</button>
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

  // ── ADMIN LIVE ────────────────────────────────────────────────────────────
  if (view === "adminLive") {
    if (!session) return null;
    const responded = activeQ ? Math.floor(participants * Math.max(0, (1 - session.timer / activeQ.time)) * 0.85) : 0;
    const OCOLS = ["#FF441F", "#4A90D9", "#27ae60", "#f39c12"];
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#060610", color: "#fff" }}>
        <StyleInject />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", background: "rgba(0,0,0,.6)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,.06)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#FF441F,#ff6b3d)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎓</div>
            <div><div className="ra-display" style={{ fontWeight: 900, fontSize: 14 }}>BD Academy <span style={{ color: "#FF441F" }}>LIVE</span></div><div style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>{session.quizTitle}</div></div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "rgba(255,255,255,.6)" }}>Código: <b style={{ color: "#FF441F", letterSpacing: 2 }}>{session.sessionCode}</b></div>
            <div style={{ background: "linear-gradient(135deg,#FF441F,#ff6b3d)", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>👥 {participants}</div>
            <Btn variant="ghost" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => setView("admin")}>Salir</Btn>
          </div>
        </div>

        {session.phase === "waiting" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>⏳</div>
            <div className="ra-display" style={{ fontSize: 36, fontWeight: 900, marginBottom: 10 }}>Sala de espera</div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 16, marginBottom: 20 }}>Comparte este código con tus farmers</div>
            <div className="ra-display" style={{ fontSize: 64, fontWeight: 900, color: "#FF441F", letterSpacing: 12, marginBottom: 40, textShadow: "0 0 40px rgba(255,68,31,.5)" }}>{session.sessionCode}</div>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="primary" style={{ padding: "16px 48px", fontSize: 18 }} onClick={nextQuestion}>▶ Iniciar Quiz</Btn>
            </div>
          </div>
        )}

        {(session.phase === "question" || session.phase === "paused") && activeQ && (
          <div style={{ padding: "20px 32px", maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center" }}>
              {session.questions.map((_, i) => <div key={i} style={{ height: 4, width: i === session.currentQ ? 24 : 12, borderRadius: 99, background: i < session.currentQ ? "#FF441F" : i === session.currentQ ? "#fff" : "rgba(255,255,255,.15)", transition: "all .3s" }} />)}
            </div>
            <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.3)", marginBottom: 20 }}>Pregunta {session.currentQ + 1} de {session.questions.length}</div>
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
              <div className="ra-display" style={{ fontSize: 64, fontWeight: 900, minWidth: 80, color: timerColor, lineHeight: 1, textAlign: "center", transition: "color .5s" }}>{session.phase === "paused" ? "⏸" : session.timer}</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`, width: `${timerPct}%`, transition: "width 1s linear, background .5s" }} />
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>{session.phase === "paused" ? "Pausado — respuesta oculta" : `${session.timer}s restantes`}</div>
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
                  ? <Btn variant="ghost" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => { clearTimeout(timerRef.current); setSession(s => ({ ...s, phase: "paused" })); if (session.id) updateDoc(doc(db, "sessions", session.id), { phase: "paused" }); }}>⏸ Pausar</Btn>
                  : <Btn variant="ghost" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => { setSession(s => ({ ...s, phase: "question" })); if (session.id) updateDoc(doc(db, "sessions", session.id), { phase: "question" }); }}>▶ Reanudar</Btn>}
                <Btn variant="primary" style={{ padding: "9px 14px", fontSize: 13 }} onClick={endQuestion}>⏭ Revelar</Btn>
                <Btn variant="ghost" style={{ padding: "9px 14px", fontSize: 13, color: "rgba(255,255,255,.3)" }} onClick={endQuiz}>⏹ Fin</Btn>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderLeft: "4px solid rgba(255,68,31,.5)", borderRadius: 18, padding: "22px 28px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#FF441F", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>{activeQ.type === "truefalse" ? "Verdadero / Falso" : activeQ.type === "multi" ? "Selección múltiple" : "Opción única"}</div>
              <div className="ra-display" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.4 }}>{activeQ.text}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {activeQ.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", background: `${OCOLS[i]}10`, border: `1px solid ${OCOLS[i]}25`, borderRadius: 14, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>
                  <span style={{ minWidth: 34, height: 34, background: OCOLS[i], borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: `0 4px 12px ${OCOLS[i]}40` }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        )}

        {session.phase === "reveal" && activeQ && (() => {
          const OCOLS = ["#FF441F", "#4A90D9", "#27ae60", "#f39c12"];
          const total = revealDistribution._total ?? participants ?? 1;
          const answered = revealDistribution._answered ?? 0;
          const noAnswer = Math.max(0, total - answered);
          // Count correct answers
          const corrKeys = Array.isArray(activeQ.correct) ? activeQ.correct : [activeQ.correct];
          const correctCount = corrKeys.reduce((sum, k) => sum + (revealDistribution[k] ?? 0), 0);
          const incorrectCount = Math.max(0, answered - correctCount);
          const asertividad = total > 0 ? Math.round((correctCount / total) * 100) : 0;
          const circleColor = asertividad >= 80 ? "#27ae60" : asertividad >= 60 ? "#f39c12" : "#e74c3c";
          return (
            <div style={{ padding: "24px 32px", maxWidth: 800, margin: "0 auto" }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 6 }}>Respuesta correcta:</div>
                <div className="ra-display" style={{ fontSize: 26, fontWeight: 900, color: "#27ae60", textShadow: "0 0 30px rgba(39,174,96,.4)" }}>
                  {Array.isArray(activeQ.correct) ? activeQ.correct.map(i => activeQ.options[i]).join(", ") : activeQ.options[activeQ.correct]}
                </div>
              </div>

              {/* Options grid - Kahoot style */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {activeQ.options.map((opt, i) => {
                  const isCorr = Array.isArray(activeQ.correct) ? activeQ.correct.includes(i) : activeQ.correct === i;
                  const count = revealDistribution[i] ?? 0;
                  const pct = answered > 0 ? Math.round((count / answered) * 100) : 0;
                  return (
                    <div key={i} style={{ borderRadius: 14, padding: "14px 18px", background: isCorr ? "rgba(39,174,96,.2)" : "rgba(255,255,255,.05)", border: `2px solid ${isCorr ? "#27ae60" : "rgba(255,255,255,.1)"}`, position: "relative", overflow: "hidden" }}>
                      {/* Fill bar */}
                      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: isCorr ? "rgba(39,174,96,.15)" : `${OCOLS[i]}15`, transition: "width 1s ease", borderRadius: 12 }} />
                      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ minWidth: 30, height: 30, background: isCorr ? "#27ae60" : OCOLS[i], borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: isCorr ? "#fff" : "rgba(255,255,255,.7)" }}>{opt}</span>
                        <span style={{ fontSize: 16, fontWeight: 900, color: isCorr ? "#27ae60" : "rgba(255,255,255,.4)", minWidth: 40, textAlign: "right" }}>{count}</span>
                        {isCorr && <span style={{ fontSize: 18 }}>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary row */}
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {/* Asertividad circle */}
                <svg width="90" height="90" viewBox="0 0 90 90" style={{ flexShrink: 0 }}>
                  <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                  <circle cx="45" cy="45" r="36" fill="none" stroke={circleColor} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - asertividad / 100)}`}
                    strokeLinecap="round" transform="rotate(-90 45 45)"
                    style={{ transition: "stroke-dashoffset 1s ease" }} />
                  <text x="45" y="40" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="900" fontFamily="Nunito,sans-serif">{asertividad}%</text>
                  <text x="45" y="55" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="9" fontFamily="DM Sans,sans-serif">asertividad</text>
                </svg>
                {/* Bars */}
                <div style={{ flex: 1 }}>
                  {[
                    { label: "✓ Correctas", count: correctCount, color: "#27ae60" },
                    { label: "✗ Incorrectas", count: incorrectCount, color: "#e74c3c" },
                    { label: "— No respondió", count: noAnswer, color: "rgba(255,255,255,.3)" },
                  ].map(({ label, count: c, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color, fontWeight: 700, minWidth: 120 }}>{label}</div>
                      <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,.06)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${total > 0 ? (c / total) * 100 : 0}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
                      </div>
                      <div style={{ fontSize: 12, color, fontWeight: 700, minWidth: 30, textAlign: "right" }}>{c}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 24 }}>
                {session.currentQ + 1 < session.questions.length
                  ? <Btn variant="primary" style={{ padding: "14px 40px", fontSize: 16 }} onClick={nextQuestion}>Siguiente pregunta →</Btn>
                  : <Btn variant="primary" style={{ padding: "14px 40px", fontSize: 16, background: "linear-gradient(135deg,#1a7340,#27ae60)", boxShadow: "0 8px 24px rgba(26,115,64,.4)" }} onClick={endQuiz}>Finalizar quiz ✓</Btn>}
              </div>
            </div>
          );
        })()}

        {session.phase === "finished" && (() => {
          const results = session.farmerResults || [];
          const excEmails = (session.excusados || []).map(e => e.farmerEmail);
          const active = results.filter(r => !excEmails.includes(r.email));
          const avgAsert = active.length ? Math.round(active.reduce((s, r) => s + pct(r.correct, r.totalQ), 0) / active.length) : 0;
          const asertColor = avgAsert >= 80 ? "#27ae60" : avgAsert >= 60 ? "#f39c12" : "#e74c3c";
          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>
              <div className="ra-display" style={{ fontSize: 40, fontWeight: 900, marginBottom: 32, background: "linear-gradient(90deg,#FF441F,#ff6b3d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>¡Quiz finalizado!</div>
              <div style={{ display: "flex", gap: 40, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
                {[["participantes", participants, "#FF441F"], ["preguntas", session.questions.length, "#4A90D9"], ["guardado ✓", "Firebase", "#27ae60"]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div className="ra-display" style={{ fontSize: 40, fontWeight: 900, color: c }}>{v}</div>
                    <div style={{ color: "rgba(255,255,255,.3)", fontSize: 13, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Asertividad promedio */}
              <div className="glass" style={{ borderRadius: 20, padding: "20px 48px", marginBottom: 32, display: "flex", alignItems: "center", gap: 20 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke={asertColor} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - avgAsert / 100)}`}
                    strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <text x="40" y="36" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="900" fontFamily="Nunito,sans-serif">{avgAsert}%</text>
                  <text x="40" y="50" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="8" fontFamily="DM Sans,sans-serif">asertividad</text>
                </svg>
                <div style={{ textAlign: "left" }}>
                  <div className="ra-display" style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,.7)", marginBottom: 4 }}>Promedio del grupo</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>{active.length} participantes activos</div>
                  {excEmails.length > 0 && <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)", marginTop: 2 }}>{excEmails.length} excusado(s) no incluidos</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Btn variant="primary" style={{ padding: "14px 36px" }} onClick={() => { setSession(null); setView("admin"); }}>Volver al panel</Btn>
                <Btn variant="ghost" onClick={() => setView("adminHistory")}>Ver resultados</Btn>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  return null;
}
