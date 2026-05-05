import React, { useState, useRef, useEffect } from "react";
import { GRADES, SUBJECTS, getCurriculumTopic, GRADE_TOPICS } from "./constants.js";
import UsageCounter from "./UsageCounter";
import ChatHistory from "./ChatHistory";
import { ThemeToggle } from "./components/ThemeToggle";

// ─── Inline styles / design tokens ───────────────────────────────────────────
const FONT = "'Nunito', sans-serif";
const BLUE = "#399aff";
const DARK = "#ffffff";
const BORDER = "#399aff";
// Backend API - use localhost for dev, current origin for production (Render)
const API = window.location.hostname === 'localhost'
  ? 'http://localhost:5001'
  : window.location.origin;

const ALL_SUBJECTS = Object.entries(SUBJECTS).map(([id, sub]) => ({ id, ...sub }));

function ageToGrade(age) {
  const n = parseInt(age);
  if (isNaN(n)) return "Grade 6";
  if (n <= 6)  return "Grade 1";
  if (n === 7)  return "Grade 2";
  if (n === 8)  return "Grade 3";
  if (n === 9)  return "Grade 4";
  if (n === 10) return "Grade 5";
  if (n === 11) return "Grade 6";
  if (n === 12) return "Grade 7";
  if (n === 13) return "Grade 8";
  if (n === 14) return "Grade 9";
  if (n === 15) return "Grade 10";
  if (n === 16) return "Grade 11";
  return "Grade 12";
}

// ─── Floating orb background ──────────────────────────────────────────────────
function Orbs() {
  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      <div style={{ position:"absolute", width:520, height:520, borderRadius:"50%", background:"radial-gradient(circle,rgba(57,154,255,0.18) 0%,transparent 70%)", top:-120, left:-100, animation:"orbFloat 12s ease-in-out infinite" }}/>
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(100,200,255,0.12) 0%,transparent 70%)", bottom:-80, right:-80, animation:"orbFloat 16s ease-in-out infinite reverse" }}/>
      <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(57,154,255,0.10) 0%,transparent 70%)", top:"40%", right:"20%", animation:"orbFloat 10s ease-in-out infinite 2s" }}/>
      <style>{`
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.05)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        .subject-card:hover { transform:translateY(-4px) scale(1.02) !important; box-shadow:0 12px 40px rgba(57,154,255,0.2) !important; border-color:var(--blue) !important; background:var(--bg-primary) !important; }
        .send-btn:hover:not(:disabled) { transform:scale(1.07); }
        .chip-btn:hover { background:var(--bg-tertiary) !important; border-color:var(--blue) !important; }
        pre { background:var(--bg-secondary); border-radius:10px; padding:14px; overflow-x:auto; margin:8px 0; color:var(--text-primary); }
        pre code { color:var(--blue); font-family:'JetBrains Mono',monospace; font-size:13px; }
        code { background:rgba(57,154,255,0.12); padding:2px 6px; border-radius:5px; font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--blue); }
        :root.dark-mode code { background:rgba(6,182,212,0.2); }
      `}</style>
    </div>
  );
}

// ─── Message formatter ────────────────────────────────────────────────────────
function formatMessage(text) {
  const blocks = [];
  let result = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, _lang, code) => {
    const escaped = code.trim().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const idx = blocks.length;
    blocks.push(`<pre><code>${escaped}</code></pre>`);
    return `%%B${idx}%%`;
  });
  result = result
    .replace(/`([^`]+)`/g, (_, c) => `<code>${c.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
  blocks.forEach((b, i) => { result = result.replace(`%%B${i}%%`, b); });
  return result;
}
// ─── ChatDiagram — full, beautiful topic diagrams in chat ────────────────────
function ChatDiagram({ topic, subject }) {
  const tl = (topic  || "").toLowerCase();
  const sl = (subject|| "").toLowerCase();
  const diagType = getDiagramType(tl, sl);

  // ── helpers ──────────────────────────────────────────────────────────────
  const Card = ({x,y,w,h,col,children}) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10"
        fill={col+"18"} stroke={col} strokeWidth="1.8"/>
      {children}
    </g>
  );
  const T = ({x,y,size,col,bold,anchor,children}) => (
    <text x={x} y={y} fontSize={size||12} fill={col||"rgba(255,255,255,0.85)"}
      fontWeight={bold?"700":"400"} fontFamily="Nunito,sans-serif"
      textAnchor={anchor||"middle"}>{children}</text>
  );
  const Line = ({x1,y1,x2,y2,col,dash}) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={col||"rgba(255,255,255,0.2)"} strokeWidth="1.5"
      strokeDasharray={dash||"0"}/>
  );

  // ─── NOUN ─────────────────────────────────────────────────────────────────
  if (diagType === "noun") return (
    <svg viewBox="0 0 520 310" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="310" rx="14" fill="#0a1828"/>
      {/* Title */}
      <T x="260" y="30" size="15" col="#93c5fd" bold anchor="middle">Types of Nouns</T>
      {/* Centre bubble */}
      <ellipse cx="260" cy="155" rx="52" ry="30" fill="rgba(57,154,255,0.2)" stroke="#399aff" strokeWidth="2"/>
      <T x="260" y="151" size="13" col="#93c5fd" bold anchor="middle">NOUN</T>
      <T x="260" y="166" size="10" col="rgba(255,255,255,0.45)" anchor="middle">person·place·thing·idea</T>
      {/* Four branches */}
      {[
        {label:"Person",eg:"Teacher, Doctor, Mother",col:"#e74c7a", x:75,  y:90},
        {label:"Place", eg:"School, India, Park",    col:"#27ae60",x:445, y:90},
        {label:"Thing", eg:"Book, Phone, Car",       col:"#f39c12",x:75,  y:220},
        {label:"Idea",  eg:"Love, Freedom, Peace",   col:"#9b59b6",x:445, y:220},
      ].map(({label,eg,col,x,y})=>(
        <g key={label}>
          <Line x1={x>200?208:312} y1={y<155?140:170} x2={x>200?x-62:x+62} y2={y} col={col} dash="4,3"/>
          <rect x={x-60} y={y-32} width="120" height="64" rx="10" fill={col+"20"} stroke={col} strokeWidth="1.8"/>
          <T x={x} y={y-12} size="12" col={col} bold anchor="middle">{label}</T>
          <T x={x} y={y+5}  size="9.5" col="rgba(255,255,255,0.65)" anchor="middle">{eg.split(",")[0]}</T>
          <T x={x} y={y+19} size="9.5" col="rgba(255,255,255,0.5)"  anchor="middle">{eg.split(",")[1]?.trim()}</T>
        </g>
      ))}
      {/* Bottom rule */}
      <rect x="40" y="268" width="440" height="30" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <T x="260" y="287" size="10.5" col="rgba(255,255,255,0.45)" anchor="middle">Singular → add -s → Plural &nbsp;|&nbsp; cat → cats &nbsp;|&nbsp; child → children</T>
    </svg>
  );

  // ─── VERB ─────────────────────────────────────────────────────────────────
  if (diagType === "verb") return (
    <svg viewBox="0 0 520 290" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="290" rx="14" fill="#0a1828"/>
      <T x="260" y="28" size="15" col="#93c5fd" bold anchor="middle">Verbs &amp; Tenses</T>
      {/* Timeline */}
      <Line x1="50" y1="120" x2="470" y2="120" col="rgba(255,255,255,0.2)"/>
      <polygon points="470,115 484,120 470,125" fill="rgba(255,255,255,0.3)"/>
      {[
        {l:"PAST",    e:'"walked"',    note:"Already happened", col:"#fca5a5", x:110},
        {l:"PRESENT", e:'"walk"',      note:"Happening now",    col:"#86efac", x:260},
        {l:"FUTURE",  e:'"will walk"', note:"Will happen",      col:"#93c5fd", x:410},
      ].map(({l,e,note,col,x})=>(
        <g key={l}>
          <circle cx={x} cy="120" r="10" fill={col}/>
          <T x={x} y="98"  size="10" col={col} bold anchor="middle">{l}</T>
          <T x={x} y="147" size="12" col="white" anchor="middle">{e}</T>
          <T x={x} y="163" size="9.5" col="rgba(255,255,255,0.45)" anchor="middle">{note}</T>
        </g>
      ))}
      {/* Action vs Linking */}
      <rect x="40"  y="185" width="200" height="80" rx="10" fill="rgba(86,239,172,0.1)" stroke="#86efac" strokeWidth="1.5"/>
      <rect x="280" y="185" width="200" height="80" rx="10" fill="rgba(147,197,253,0.1)" stroke="#93c5fd" strokeWidth="1.5"/>
      <T x="140" y="204" size="11" col="#86efac" bold anchor="middle">Action Verbs</T>
      <T x="140" y="220" size="10" col="rgba(255,255,255,0.65)" anchor="middle">Run, Jump, Think</T>
      <T x="140" y="236" size="10" col="rgba(255,255,255,0.5)"  anchor="middle">Show physical/mental action</T>
      <T x="380" y="204" size="11" col="#93c5fd" bold anchor="middle">Linking Verbs</T>
      <T x="380" y="220" size="10" col="rgba(255,255,255,0.65)" anchor="middle">Is, Am, Are, Was, Were</T>
      <T x="380" y="236" size="10" col="rgba(255,255,255,0.5)"  anchor="middle">Connect subject to description</T>
    </svg>
  );

  // ─── ADJECTIVE ────────────────────────────────────────────────────────────
  if (diagType === "adjective") return (
    <svg viewBox="0 0 520 300" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="300" rx="14" fill="#0a1828"/>
      <T x="260" y="28" size="15" col="#f39c12" bold anchor="middle">Adjectives — Describing Words</T>
      {/* What questions */}
      {[
        {q:"What kind?",  eg:'"beautiful flower"',  col:"#e74c7a", x:100, y:80},
        {q:"Which one?",  eg:'"that red car"',       col:"#27ae60", x:260, y:80},
        {q:"How many?",   eg:'"three students"',     col:"#9b59b6", x:420, y:80},
      ].map(({q,eg,col,x,y})=>(
        <g key={q}>
          <rect x={x-75} y={y-26} width="150" height="55" rx="10" fill={col+"1a"} stroke={col} strokeWidth="1.8"/>
          <T x={x} y={y-8}  size="11" col={col} bold anchor="middle">{q}</T>
          <T x={x} y={y+12} size="10" col="rgba(255,255,255,0.65)" anchor="middle">{eg}</T>
        </g>
      ))}
      {/* Example sentence */}
      <rect x="40" y="130" width="440" height="48" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <T x="260" y="149" size="11" col="rgba(255,255,255,0.5)" anchor="middle">Example sentence:</T>
      <T x="260" y="168" size="11.5" col="white" anchor="middle">"The tall, clever girl solved the hard problem."</T>
      {/* Degree table */}
      {[["Positive","tall","smart","cold"],["Comparative","taller","smarter","colder"],["Superlative","tallest","smartest","coldest"]].map(([deg,...words],ri)=>(
        <g key={deg}>
          <rect x="40" y={196+ri*30} width="440" height="28" rx="5" fill={ri%2===0?"rgba(255,255,255,0.03)":"transparent"}/>
          <T x="130" y={196+ri*30+18} size="10" col={["#f39c12","#86efac","#93c5fd"][ri]} bold anchor="middle">{deg}</T>
          {words.map((w,wi)=><T key={w} x={250+wi*80} y={196+ri*30+18} size="10" col="rgba(255,255,255,0.7)" anchor="middle">{w}</T>)}
        </g>
      ))}
      <Line x1="40" y1="196" x2="480" y2="196" col="rgba(255,255,255,0.1)"/>
    </svg>
  );

  // ─── ALGEBRA / EQUATION ───────────────────────────────────────────────────
  if (diagType === "algebra") return (
    <svg viewBox="0 0 520 320" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="320" rx="14" fill="#080f1e"/>
      <T x="260" y="28" size="15" col="#93c5fd" bold anchor="middle">Solving Algebra Equations</T>
      {/* Balance scale visual */}
      <line x1="200" y1="105" x2="320" y2="105" stroke="#FFD700" strokeWidth="3"/>
      <line x1="260" y1="105" x2="260" y2="130" stroke="#FFD700" strokeWidth="3"/>
      <polygon points="250,130 260,118 270,130" fill="#FFD700"/>
      <rect x="152" y="85" width="46" height="20" rx="6" fill="rgba(57,154,255,0.3)" stroke="#399aff" strokeWidth="1.5"/>
      <T x="175" y="99" size="11" col="#93c5fd" bold anchor="middle">2x+4</T>
      <rect x="322" y="85" width="46" height="20" rx="6" fill="rgba(134,239,172,0.3)" stroke="#86efac" strokeWidth="1.5"/>
      <T x="345" y="99" size="11" col="#86efac" bold anchor="middle">14</T>
      <T x="260" y="148" size="10" col="rgba(255,255,255,0.35)" anchor="middle">Both sides must stay equal</T>
      {/* Steps */}
      {[
        {step:"Start:  2x + 4 = 14",          col:"rgba(255,255,255,0.9)", y:178},
        {step:"Step 1: Subtract 4 from both sides", col:"rgba(255,255,255,0.4)", y:200},
        {step:"→  2x = 10",                   col:"#93c5fd",               y:220},
        {step:"Step 2: Divide both sides by 2", col:"rgba(255,255,255,0.4)", y:242},
        {step:"→  x = 5",                     col:"#86efac",               y:262},
        {step:"Check: 2(5) + 4 = 14  ✓",      col:"#FFD700",               y:286},
      ].map(({step,col,y})=>(
        <text key={y} x="60" y={y} fontSize="13" fill={col}
          fontFamily="monospace" fontWeight="600">{step}</text>
      ))}
      <Line x1="40" y1="170" x2="480" y2="170" col="rgba(255,255,255,0.08)"/>
    </svg>
  );

  // ─── FRACTIONS ────────────────────────────────────────────────────────────
  if (diagType === "fraction") return (
    <svg viewBox="0 0 520 300" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="300" rx="14" fill="#0a1828"/>
      <T x="260" y="28" size="15" col="#93c5fd" bold anchor="middle">Understanding Fractions</T>
      {/* Pie charts */}
      {[[1,4,"¼","One quarter",100],[2,4,"²⁄₄","Half (= ½)",260],[3,4,"¾","Three quarters",420]].map(([num,den,frac,label,cx])=>{
        const cy=130, r=58;
        const slices = Array.from({length:den}).map((_,i)=>{
          const a1=i/den*Math.PI*2-Math.PI/2, a2=(i+1)/den*Math.PI*2-Math.PI/2;
          const lf = a2-a1>Math.PI?1:0;
          return <path key={msgI}
            d={`M${cx},${cy} L${cx+r*Math.cos(a1)},${cy+r*Math.sin(a1)} A${r},${r} 0 ${lf} 1 ${cx+r*Math.cos(a2)},${cy+r*Math.sin(a2)} Z`}
            fill={i<num?"rgba(57,154,255,0.75)":"rgba(255,255,255,0.07)"}
            stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>;
        });
        return <g key={frac}>{slices}
          <T x={cx} y={cy+80} size="18" col="#93c5fd" bold anchor="middle">{frac}</T>
          <T x={cx} y={cy+100} size="10" col="rgba(255,255,255,0.5)" anchor="middle">{label}</T>
        </g>;
      })}
      {/* Labels */}
      <T x="100" y="218" size="11" col="#93c5fd" bold anchor="middle">Numerator = 1</T>
      <T x="100" y="232" size="10" col="rgba(255,255,255,0.45)" anchor="middle">parts we have</T>
      <T x="420" y="218" size="11" col="#86efac" bold anchor="middle">Denominator = 4</T>
      <T x="420" y="232" size="10" col="rgba(255,255,255,0.45)" anchor="middle">total equal parts</T>
      {/* Rule */}
      <rect x="40" y="258" width="440" height="30" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <T x="260" y="277" size="10.5" col="rgba(255,255,255,0.4)" anchor="middle">To add fractions: same denominator → add numerators only</T>
    </svg>
  );

  // ─── PHOTOSYNTHESIS ───────────────────────────────────────────────────────
  if (diagType === "photosynthesis") return (
    <svg viewBox="0 0 520 310" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="310" rx="14" fill="#061410"/>
      <T x="260" y="28" size="15" col="#86efac" bold anchor="middle">Photosynthesis</T>
      {/* Inputs */}
      {[
        {label:"☀️ Sunlight",  sub:"energy",  col:"#FFD700", y:75},
        {label:"💧 Water (H₂O)",sub:"from roots",col:"#3498db",y:130},
        {label:"🌬️ CO₂",       sub:"from air",  col:"#86efac",y:185},
      ].map(({label,sub,col,y})=>(
        <g key={label}>
          <rect x="18" y={y-22} width="150" height="44" rx="9" fill={col+"18"} stroke={col} strokeWidth="1.5"/>
          <T x="93" y={y-4}  size="11.5" col={col}                      bold anchor="middle">{label}</T>
          <T x="93" y={y+13} size="9.5"  col="rgba(255,255,255,0.45)"       anchor="middle">{sub}</T>
          <Line x1="168" y1={y} x2="215" y2="130" col={col} dash="5,3"/>
        </g>
      ))}
      {/* Leaf */}
      <ellipse cx="270" cy="130" rx="58" ry="42" fill="#0f3d18" stroke="#27ae60" strokeWidth="2.5"/>
      <T x="270" y="123" size="12" col="#86efac" bold anchor="middle">🌿 Leaf</T>
      <T x="270" y="139" size="9.5" col="rgba(134,239,172,0.7)" anchor="middle">Chloroplast</T>
      {/* Outputs */}
      {[
        {label:"🍬 Glucose",  sub:"food/energy", col:"#fde68a", y:75},
        {label:"🌬️ Oxygen (O₂)",sub:"released",   col:"#93c5fd", y:185},
      ].map(({label,sub,col,y})=>(
        <g key={label}>
          <Line x1="328" y1="130" x2="348" y2={y} col={col} dash="5,3"/>
          <rect x="348" y={y-22} width="155" height="44" rx="9" fill={col+"18"} stroke={col} strokeWidth="1.5"/>
          <T x="425" y={y-4}  size="11.5" col={col}                      bold anchor="middle">{label}</T>
          <T x="425" y={y+13} size="9.5"  col="rgba(255,255,255,0.45)"       anchor="middle">{sub}</T>
        </g>
      ))}
      {/* Formula bar */}
      <rect x="18" y="245" width="484" height="50" rx="10" fill="rgba(39,174,96,0.1)" stroke="#27ae60" strokeWidth="1.5"/>
      <T x="260" y="264" size="10" col="rgba(255,255,255,0.4)"  anchor="middle">Equation:</T>
      <text x="260" y="284" fontSize="13" fill="#86efac" fontFamily="monospace" fontWeight="700" textAnchor="middle">6CO₂ + 6H₂O + Light  →  C₆H₁₂O₆ + 6O₂</text>
    </svg>
  );

  // ─── CELL ──────────────────────────────────────────────────────────────────
  if (diagType === "cell") return (
    <svg viewBox="0 0 520 310" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="310" rx="14" fill="#060f14"/>
      <T x="260" y="28" size="15" col="#27ae60" bold anchor="middle">Animal Cell — Labelled Diagram</T>
      {/* Cell body */}
      <ellipse cx="200" cy="160" rx="148" ry="108" fill="rgba(39,174,96,0.07)" stroke="#27ae60" strokeWidth="2.5"/>
      {/* Nucleus */}
      <ellipse cx="200" cy="150" rx="45" ry="35" fill="rgba(231,76,60,0.2)" stroke="#e74c3c" strokeWidth="2"/>
      <T x="200" y="146" size="10" col="#e74c3c" bold anchor="middle">Nucleus</T>
      <T x="200" y="160" size="9" col="rgba(255,255,255,0.45)" anchor="middle">(DNA)</T>
      {/* Organelles */}
      {[
        {name:"Cell\nMembrane",  col:"#27ae60",  x:350, y:58,   lx:200, ly:58},
        {name:"Mitochondria",    col:"#FFA500",  x:390, y:115,  lx:280, ly:148},
        {name:"Ribosome",        col:"#9b59b6",  x:390, y:175,  lx:248, ly:168},
        {name:"Cytoplasm",       col:"#3498db",  x:350, y:240,  lx:200, ly:225},
        {name:"Vacuole",         col:"#1abc9c",  x:60,  y:58,   lx:155, ly:105},
        {name:"Cell Membrane",   col:"#27ae60",  x:60,  y:240,  lx:72,  ly:220},
      ].slice(0,5).map(({name,col,x,y,lx,ly})=>(
        <g key={name}>
          <line x1={x<260?x+55:x-55} y1={y} x2={lx} y2={ly} stroke={col} strokeWidth="1" strokeDasharray="4,3" opacity="0.6"/>
          <circle cx={lx} cy={ly} r="4" fill={col}/>
          <rect x={x<260?x-55:x-55} y={y-14} width="110" height="28" rx="7" fill={col+"18"} stroke={col} strokeWidth="1.4"/>
          <T x={x} y={y+4} size="10" col={col} bold anchor="middle">{name}</T>
        </g>
      ))}
      {/* Plant vs Animal */}
      <rect x="280" y="220" width="225" height="72" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <T x="392" y="238" size="10.5" col="#86efac" bold anchor="middle">Plant Cell also has:</T>
      <T x="392" y="254" size="9.5" col="rgba(255,255,255,0.55)" anchor="middle">✦ Cell wall &nbsp; ✦ Chloroplasts</T>
      <T x="392" y="270" size="9.5" col="rgba(255,255,255,0.55)" anchor="middle">✦ Large central vacuole</T>
    </svg>
  );

  // ─── COLD WAR ─────────────────────────────────────────────────────────────
  if (diagType === "coldwar") return (
    <svg viewBox="0 0 520 330" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="330" rx="14" fill="#100808"/>
      <T x="260" y="26" size="15" col="#FFD700" bold anchor="middle">The Cold War  1947 – 1991</T>
      {/* Two sides */}
      <rect x="10" y="38" width="218" height="155" rx="10" fill="rgba(0,50,200,0.2)" stroke="#3a7de8" strokeWidth="1.8"/>
      <rect x="292" y="38" width="218" height="155" rx="10" fill="rgba(200,0,0,0.2)"   stroke="#e74c3c" strokeWidth="1.8"/>
      {/* VS badge */}
      <circle cx="260" cy="115" r="24" fill="#1a0a00" stroke="#FFD700" strokeWidth="2"/>
      <T x="260" y="121" size="14" col="#FFD700" bold anchor="middle">VS</T>
      {/* USA */}
      <T x="119" y="62"  size="13" col="#93c5fd" bold anchor="middle">🇺🇸  USA</T>
      {["Capitalism","Democracy","NATO","Marshall Plan"].map((item,i)=>(
        <g key={item}>
          <circle cx="32" cy={85+i*22} r="3" fill="#3a7de8"/>
          <T x="42" y={89+i*22} size="10" col="rgba(255,255,255,0.72)" anchor="start">{item}</T>
        </g>
      ))}
      {/* USSR */}
      <T x="401" y="62"  size="13" col="#fca5a5" bold anchor="middle">🇷🇺  USSR</T>
      {["Communism","Single-Party Rule","Warsaw Pact","5-Year Plans"].map((item,i)=>(
        <g key={item}>
          <circle cx="302" cy={85+i*22} r="3" fill="#e74c3c"/>
          <T x="312" y={89+i*22} size="10" col="rgba(255,255,255,0.72)" anchor="start">{item}</T>
        </g>
      ))}
      {/* Timeline */}
      <Line x1="20" y1="210" x2="500" y2="210" col="rgba(255,215,0,0.35)"/>
      {[
        {yr:"1947",ev:"Cold War\nbegins",    x:45},
        {yr:"1957",ev:"Sputnik\nlaunched",   x:155},
        {yr:"1962",ev:"Cuban Missile\nCrisis",x:265},
        {yr:"1969",ev:"Moon\nLanding",       x:375},
        {yr:"1991",ev:"USSR\ncollapses",     x:480},
      ].map(({yr,ev,x})=>(
        <g key={yr}>
          <circle cx={x} cy="210" r="6" fill="#FFD700"/>
          <T x={x} y="200" size="9" col="#FFD700" bold anchor="middle">{yr}</T>
          {ev.split("\n").map((line,i)=>(
            <T key={i} x={x} y={228+i*13} size="8.5" col="rgba(255,255,255,0.55)" anchor="middle">{line}</T>
          ))}
        </g>
      ))}
      {/* Outcome box */}
      <rect x="20" y="268" width="480" height="48" rx="9" fill="rgba(255,215,0,0.07)" stroke="rgba(255,215,0,0.25)" strokeWidth="1"/>
      <T x="260" y="286" size="10.5" col="#FFD700" bold anchor="middle">Outcome: USSR dissolved 1991 → USA became sole superpower</T>
      <T x="260" y="304" size="10" col="rgba(255,255,255,0.4)" anchor="middle">Cold War shaped modern world: internet, GPS, space tech all emerged from this era</T>
    </svg>
  );

  // ─── WATER CYCLE ──────────────────────────────────────────────────────────
  if (diagType === "watercycle") return (
    <svg viewBox="0 0 520 300" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="300" rx="14" fill="#060c18"/>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1830"/><stop offset="100%" stopColor="#1a3a6e"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="520" height="200" rx="14" fill="url(#sky)"/>
      <rect x="0" y="200" width="520" height="100" rx="0" fill="#1a3a1a"/>
      <T x="260" y="24" size="15" col="#93c5fd" bold anchor="middle">The Water Cycle</T>
      {/* Sun */}
      <circle cx="450" cy="60" r="32" fill="rgba(255,220,50,0.25)"/>
      <circle cx="450" cy="60" r="22" fill="#FFD700"/>
      <T x="450" y="99" size="9.5" col="#FFD700" anchor="middle">Sun (Heat)</T>
      {/* Cloud */}
      <ellipse cx="180" cy="70" rx="55" ry="28" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
      <ellipse cx="155" cy="78" rx="32" ry="20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      <ellipse cx="208" cy="78" rx="35" ry="20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      <T x="180" y="58" size="10" col="white" bold anchor="middle">☁️ Clouds</T>
      {/* Rain */}
      {[165,178,191,204].map(x=><line key={x} x1={x} y1="98" x2={x-5} y2="115" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"/>)}
      <T x="145" y="130" size="9.5" col="#93c5fd" anchor="middle">Precipitation</T>
      {/* Ground & ocean */}
      <rect x="0" y="200" width="520" height="30" rx="0" fill="#1a4a1a" opacity="0.6"/>
      <T x="100" y="220" size="10" col="#86efac" anchor="middle">🌊 Ocean / River</T>
      {/* Arrows */}
      <path d="M 140 195 Q 80 170 60 135 Q 45 110 80 85" fill="none" stroke="#3498db" strokeWidth="2" strokeDasharray="6,3"/>
      <T x="40" y="145" size="9" col="#3498db" anchor="middle">Runoff</T>
      <path d="M 360 195 Q 380 150 360 100 Q 350 70 300 62" fill="none" stroke="#FFD700" strokeWidth="2" strokeDasharray="6,3"/>
      <T x="400" y="148" size="9" col="#FFD700" anchor="middle">Evaporation</T>
      <path d="M 300 62 Q 240 55 210 62" fill="none" stroke="#86efac" strokeWidth="2" strokeDasharray="6,3"/>
      <T x="260" y="48" size="9" col="#86efac" anchor="middle">Condensation</T>
      {/* Steps */}
      {["1. Evaporation — water heats up, turns to vapour",
        "2. Condensation — vapour cools, forms clouds",
        "3. Precipitation — water falls as rain or snow",
        "4. Collection — water flows into rivers and oceans"].map((s,i)=>(
        <T key={i} x="30" y={228+i*16} size="9.5" col="rgba(255,255,255,0.6)" anchor="start">{s}</T>
      ))}
    </svg>
  );

  // ─── CS: Variables & Data ────────────────────────────────────────────────
  if (diagType === "variables") return (
    <svg viewBox="0 0 520 310" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="310" rx="14" fill="#050a12"/>
      <T x="260" y="28" size="15" col="#86efac" bold anchor="middle">Variables &amp; Data Types</T>
      {[
        {name:"String",  eg:'"Hello World"',  col:"#86efac", x:90,  y:90},
        {name:"Integer", eg:"42, -7, 100",    col:"#93c5fd", x:260, y:90},
        {name:"Float",   eg:"3.14, 2.5",      col:"#fde68a", x:430, y:90},
        {name:"Boolean", eg:"True / False",   col:"#fca5a5", x:90,  y:195},
        {name:"List",    eg:'[1, 2, 3]',      col:"#c4b5fd", x:260, y:195},
        {name:"String",  eg:'"name = value"', col:"#6ee7b7", x:430, y:195},
      ].slice(0,5).map(({name,eg,col,x,y})=>(
        <g key={name+x}>
          <rect x={x-70} y={y-30} width="140" height="55" rx="10" fill={col+"1a"} stroke={col} strokeWidth="1.8"/>
          <T x={x} y={y-10} size="12" col={col} bold anchor="middle">{name}</T>
          <T x={x} y={y+12} size="10" col="rgba(255,255,255,0.6)" anchor="middle">{eg}</T>
        </g>
      ))}
      <rect x="120" y="155" width="280" height="55" rx="10" fill="rgba(134,239,172,0.1)" stroke="#86efac" strokeWidth="1.5"/>
      <T x="260" y="177" size="11" col="#86efac" bold anchor="middle">variable_name = value</T>
      <T x="260" y="196" size="10" col="rgba(255,255,255,0.5)" anchor="middle">favorite_color = "blue"  |  score = 0</T>
      <T x="260" y="280" size="10" col="rgba(255,255,255,0.3)" anchor="middle">Variables store data that can change during a program</T>
    </svg>
  );

  // ─── CS: Loops ─────────────────────────────────────────────────────────────
  if (diagType === "loops") return (
    <svg viewBox="0 0 520 290" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="290" rx="14" fill="#050a12"/>
      <T x="260" y="28" size="15" col="#93c5fd" bold anchor="middle">Loops in Programming</T>
      <rect x="20" y="40" width="230" height="130" rx="10" fill="rgba(147,197,253,0.08)" stroke="#93c5fd" strokeWidth="1.5"/>
      <T x="135" y="62" size="12" col="#93c5fd" bold anchor="middle">FOR Loop</T>
      <T x="135" y="82" size="10" col="rgba(255,255,255,0.7)" anchor="middle">Runs fixed number of times</T>
      <text x="30" y="105" fontSize="11" fill="#86efac" fontFamily="monospace">for i in range(5):</text>
      <text x="30" y="122" fontSize="11" fill="#fde68a" fontFamily="monospace">    print(i)</text>
      <T x="135" y="158" size="9.5" col="rgba(255,255,255,0.4)" anchor="middle">Output: 0, 1, 2, 3, 4</T>
      <rect x="270" y="40" width="230" height="130" rx="10" fill="rgba(134,239,172,0.08)" stroke="#86efac" strokeWidth="1.5"/>
      <T x="385" y="62" size="12" col="#86efac" bold anchor="middle">WHILE Loop</T>
      <T x="385" y="82" size="10" col="rgba(255,255,255,0.7)" anchor="middle">Runs until condition is false</T>
      <text x="280" y="105" fontSize="11" fill="#86efac" fontFamily="monospace">while score &lt; 100:</text>
      <text x="280" y="122" fontSize="11" fill="#fde68a" fontFamily="monospace">    score += 10</text>
      <T x="385" y="158" size="9.5" col="rgba(255,255,255,0.4)" anchor="middle">Stops when score = 100</T>
      <rect x="60" y="195" width="400" height="40" rx="9" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <T x="260" y="220" size="10.5" col="rgba(255,255,255,0.5)" anchor="middle">Loops repeat code automatically — saving time and reducing errors</T>
      <T x="260" y="268" size="10" col="rgba(255,255,255,0.25)" anchor="middle">Key rule: Always ensure loops have a termination condition!</T>
    </svg>
  );

  // ─── CS: Functions ─────────────────────────────────────────────────────────
  if (diagType === "functions") return (
    <svg viewBox="0 0 520 290" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="290" rx="14" fill="#050a12"/>
      <T x="260" y="28" size="15" col="#c4b5fd" bold anchor="middle">Functions — Reusable Code Blocks</T>
      <rect x="130" y="45" width="260" height="90" rx="10" fill="rgba(196,181,253,0.1)" stroke="#c4b5fd" strokeWidth="1.8"/>
      <text x="145" y="68" fontSize="12" fill="#86efac" fontFamily="monospace" fontWeight="bold">def greet(name):</text>
      <text x="145" y="88" fontSize="12" fill="#fde68a" fontFamily="monospace">    message = "Hello " + name</text>
      <text x="145" y="108" fontSize="12" fill="#93c5fd" fontFamily="monospace">    return message</text>
      {[["Input (Parameter)","name = 'Ali'","#fde68a",80,175],["Function Body","Process the data","#c4b5fd",260,175],["Output (Return)","'Hello Ali'","#86efac",440,175]].map(([l,e,c,x,y])=>(
        <g key={l}>
          <rect x={x-80} y={y-25} width="160" height="50" rx="9" fill={c+"1a"} stroke={c} strokeWidth="1.5"/>
          <T x={x} y={y-6} size="10" col={c} bold anchor="middle">{l}</T>
          <T x={x} y={y+13} size="9.5" col="rgba(255,255,255,0.6)" anchor="middle">{e}</T>
        </g>
      ))}
      <line x1="160" y1="175" x2="180" y2="175" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <line x1="340" y1="175" x2="360" y2="175" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <T x="260" y="255" size="10" col="rgba(255,255,255,0.3)" anchor="middle">Write once, use anywhere — makes code organised and reusable</T>
    </svg>
  );

  // ─── History: World Wars ───────────────────────────────────────────────────
  if (diagType === "worldwar") return (
    <svg viewBox="0 0 520 300" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="300" rx="14" fill="#1a0808"/>
      <T x="260" y="26" size="15" col="#FFD700" bold anchor="middle">World Wars — Key Facts</T>
      {[
        {label:"World War I", dates:"1914–1918", cause:"Assassination of Archduke Franz Ferdinand", allies:"Allied Powers vs Central Powers", end:"Treaty of Versailles 1919", col:"#93c5fd", x:130},
        {label:"World War II", dates:"1939–1945", cause:"Nazi Germany invaded Poland", allies:"Allied Powers vs Axis Powers", end:"Germany & Japan surrendered 1945", col:"#fca5a5", x:390},
      ].map(({label,dates,cause,allies,end,col,x})=>(
        <g key={label}>
          <rect x={x-120} y="38" width="240" height="220" rx="10" fill={col+"12"} stroke={col} strokeWidth="1.8"/>
          <T x={x} y="60" size="13" col={col} bold anchor="middle">{label}</T>
          <T x={x} y="82" size="11" col="rgba(255,255,255,0.8)" anchor="middle">{dates}</T>
          <line x1={x-100} y1="92" x2={x+100} y2="92" stroke={col+"50"} strokeWidth="1"/>
          <T x={x} y="108" size="9" col="rgba(255,255,255,0.45)" anchor="middle">Cause:</T>
          <T x={x} y="124" size="9.5" col="rgba(255,255,255,0.75)" anchor="middle">{cause.slice(0,30)}</T>
          <T x={x} y="140" size="9.5" col="rgba(255,255,255,0.75)" anchor="middle">{cause.slice(30)}</T>
          <T x={x} y="162" size="9" col="rgba(255,255,255,0.45)" anchor="middle">Sides:</T>
          <T x={x} y="178" size="9.5" col="rgba(255,255,255,0.75)" anchor="middle">{allies}</T>
          <T x={x} y="200" size="9" col="rgba(255,255,255,0.45)" anchor="middle">End:</T>
          <T x={x} y="218" size="9.5" col="rgba(255,255,255,0.75)" anchor="middle">{end}</T>
        </g>
      ))}
      <T x="260" y="278" size="10" col="rgba(255,255,255,0.25)" anchor="middle">Combined death toll: over 85 million people</T>
    </svg>
  );

  // ─── GEOMETRY ────────────────────────────────────────────────────────────
  if (diagType === "geometry") return (
    <svg viewBox="0 0 520 310" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <defs><style>{`@keyframes geoSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></defs>
      <rect width="520" height="310" rx="14" fill="#07111e"/>
      <T x="260" y="24" size="14" col="#f39c12" bold anchor="middle">Geometry — Shapes & Properties</T>
      {[
        {shape:"triangle",  col:"#e74c7a", x:80,  y:130, label:"Triangle",  facts:["3 sides","3 angles","Sum=180°"]},
        {shape:"square",    col:"#f39c12", x:200, y:130, label:"Square",    facts:["4 equal sides","4×90°","Area=s²"]},
        {shape:"circle",    col:"#3498db", x:320, y:130, label:"Circle",    facts:["Radius r","C=2πr","A=πr²"]},
        {shape:"hexagon",   col:"#27ae60", x:440, y:130, label:"Hexagon",   facts:["6 sides","6×120°","Regular"]},
      ].map(({shape,col,x,y,label,facts})=>(
        <g key={label}>
          {shape==="triangle"  && <polygon points={`${x},${y-40} ${x-38},${y+28} ${x+38},${y+28}`} fill={col+"20"} stroke={col} strokeWidth="2"/>}
          {shape==="square"    && <rect x={x-32} y={y-32} width="64" height="64" fill={col+"20"} stroke={col} strokeWidth="2"/>}
          {shape==="circle"    && <circle cx={x} cy={y} r="36" fill={col+"20"} stroke={col} strokeWidth="2"/>}
          {shape==="hexagon"   && <polygon points={[0,1,2,3,4,5].map(i=>`${x+36*Math.cos(i*Math.PI/3-Math.PI/6)},${y+36*Math.sin(i*Math.PI/3-Math.PI/6)}`).join(" ")} fill={col+"20"} stroke={col} strokeWidth="2"/>}
          <T x={x} y={y+52} size="11" col={col} bold anchor="middle">{label}</T>
          {facts.map((f,fi)=><T key={fi} x={x} y={y+67+fi*14} size="9" col="rgba(255,255,255,0.55)" anchor="middle">{f}</T>)}
        </g>
      ))}
      <rect x="20" y="265" width="480" height="28" rx="8" fill="rgba(243,156,18,0.08)" stroke="rgba(243,156,18,0.2)" strokeWidth="1"/>
      <T x="260" y="282" size="10" col="rgba(243,156,18,0.7)" anchor="middle">Perimeter = sum of all sides · Area = space inside shape</T>
    </svg>
  );

  // ─── STATISTICS ───────────────────────────────────────────────────────────
  if (diagType === "statistics") return (
    <svg viewBox="0 0 520 300" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="300" rx="14" fill="#07111e"/>
      <T x="260" y="24" size="14" col="#3498db" bold anchor="middle">Statistics — Mean, Median, Mode</T>
      {/* Bar chart */}
      {[["Mon",45,"#e74c7a"],["Tue",72,"#f39c12"],["Wed",58,"#27ae60"],["Thu",89,"#3498db"],["Fri",63,"#9b59b6"]].map(([d,v,c],i)=>(
        <g key={d}>
          <rect x={60+i*82} y={220-(v*1.4)} width="48" height={v*1.4} rx="6" fill={c+"30"} stroke={c} strokeWidth="1.5"/>
          <T x={84+i*82} y={215-(v*1.4)} size="10" col={c} bold anchor="middle">{v}</T>
          <T x={84+i*82} y="238" size="10" col="rgba(255,255,255,0.5)" anchor="middle">{d}</T>
        </g>
      ))}
      <line x1="48" y1="220" x2="472" y2="220" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      {/* Stats */}
      {[["Mean","(45+72+58+89+63)÷5 = 65.4","#f39c12"],["Median","Order: 45,58,63,72,89 → 63","#27ae60"],["Mode","No repeats → No mode","#e74c7a"]].map(([l,v,c],i)=>(
        <g key={l}>
          <rect x={20+i*165} y="250" width="158" height="38" rx="8" fill={c+"15"} stroke={c} strokeWidth="1.2"/>
          <T x={99+i*165} y="264" size="10" col={c} bold anchor="middle">{l}</T>
          <T x={99+i*165} y="280" size="8.5" col="rgba(255,255,255,0.55)" anchor="middle">{v}</T>
        </g>
      ))}
    </svg>
  );

  // ─── ATOM ──────────────────────────────────────────────────────────────────
  if (diagType === "atom") return (
    <svg viewBox="0 0 520 310" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <defs><style>{`
        @keyframes orbit1{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes orbit2{from{transform:rotate(120deg)}to{transform:rotate(480deg)}}
        @keyframes orbit3{from{transform:rotate(240deg)}to{transform:rotate(600deg)}}
      `}</style></defs>
      <rect width="520" height="310" rx="14" fill="#040c18"/>
      <T x="260" y="24" size="14" col="#27ae60" bold anchor="middle">Atom — Structure</T>
      {/* Nucleus */}
      <circle cx="260" cy="160" r="28" fill="rgba(231,76,60,0.3)" stroke="#e74c3c" strokeWidth="2.5"/>
      <T x="260" y="156" size="10" col="#fca5a5" bold anchor="middle">Nucleus</T>
      <T x="260" y="170" size="8.5" col="rgba(255,255,255,0.45)" anchor="middle">p⁺ n⁰</T>
      {/* Orbits */}
      {[{rx:90,ry:36,rot:0,col:"#3498db"},{rx:90,ry:36,rot:60,col:"#f39c12"},{rx:90,ry:36,rot:120,col:"#27ae60"}].map(({rx:orx,ry:ory,rot,col},oi)=>(
        <g key={oi} style={{transformOrigin:"260px 160px",transform:`rotate(${rot}deg)`}}>
          <ellipse cx="260" cy="160" rx={orx} ry={ory} fill="none" stroke={col} strokeWidth="1.2" opacity="0.5"/>
          <circle cx={260+orx} cy="160" r="7" fill={col} style={{transformOrigin:`${260+orx}px 160px`,animation:`orbit${oi+1} ${2+oi*0.6}s linear infinite`}}>
          </circle>
        </g>
      ))}
      {/* Labels */}
      {[["Proton +","Positively charged","#fca5a5",60,260],["Neutron 0","No charge","rgba(255,255,255,0.7)",60,285],["Electron −","Negatively charged","#93c5fd",370,260]].map(([l,d,c,x,y])=>(
        <g key={l}>
          <T x={x} y={y} size="10.5" col={c} bold anchor="start">{l}</T>
          <T x={x} y={y+14} size="9" col="rgba(255,255,255,0.4)" anchor="start">{d}</T>
        </g>
      ))}
    </svg>
  );

  // ─── FORCE / NEWTON ───────────────────────────────────────────────────────
  if (diagType === "force") return (
    <svg viewBox="0 0 520 300" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="300" rx="14" fill="#06100c"/>
      <T x="260" y="24" size="14" col="#27ae60" bold anchor="middle">Newton's Laws of Motion</T>
      {[
        {n:"1st Law",title:"Inertia",desc:"Object stays at rest or\nin motion unless forced",col:"#3498db",x:86,y:100},
        {n:"2nd Law",title:"F = m × a",desc:"Force = Mass × Acceleration\nMore mass = more force",col:"#f39c12",x:260,y:100},
        {n:"3rd Law",title:"Action–Reaction",desc:"Every action has an equal\nand opposite reaction",col:"#e74c7a",x:434,y:100},
      ].map(({n,title,desc,col,x,y})=>(
        <g key={n}>
          <rect x={x-80} y={y-36} width="160" height="140" rx="12" fill={col+"18"} stroke={col} strokeWidth="1.8"/>
          <T x={x} y={y-16} size="10" col={col+"cc"} anchor="middle">{n}</T>
          <T x={x} y={y+8}  size="13" col={col} bold anchor="middle">{title}</T>
          <line x1={x-60} y1={y+18} x2={x+60} y2={y+18} stroke={col} strokeWidth="0.8" opacity="0.4"/>
          {desc.split("\n").map((d,di)=><T key={di} x={x} y={y+34+di*16} size="9.5" col="rgba(255,255,255,0.6)" anchor="middle">{d}</T>)}
        </g>
      ))}
      <rect x="20" y="258" width="480" height="28" rx="8" fill="rgba(39,174,96,0.08)" stroke="rgba(39,174,96,0.2)" strokeWidth="1"/>
      <T x="260" y="276" size="10" col="rgba(39,174,96,0.7)" anchor="middle">SI unit of force: Newton (N) · W = mg · Friction opposes motion</T>
    </svg>
  );

  // ─── ALGORITHM / SORTING ──────────────────────────────────────────────────
  if (diagType === "algorithm") return (
    <svg viewBox="0 0 520 310" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="310" rx="14" fill="#07111e"/>
      <T x="260" y="22" size="14" col="#399aff" bold anchor="middle">Algorithm — Bubble Sort</T>
      {/* Array steps */}
      {[
        {label:"Start",   arr:[5,3,8,1,4], swaps:[]},
        {label:"Pass 1",  arr:[3,5,1,4,8], swaps:[0,1]},
        {label:"Pass 2",  arr:[3,1,4,5,8], swaps:[1,2]},
        {label:"Sorted!", arr:[1,3,4,5,8], swaps:[]},
      ].map(({label,arr,swaps},ri)=>(
        <g key={label}>
          <T x="52" y={58+ri*54} size="10" col="rgba(255,255,255,0.4)" anchor="end">{label}</T>
          {arr.map((v,ci)=>{
            const col = ri===3?"#27ae60": swaps.includes(ci)?"#f39c12":"#3498db";
            return (
              <g key={ci}>
                <rect x={70+ci*82} y={40+ri*54} width="60" height="32" rx="7" fill={col+"25"} stroke={col} strokeWidth="1.6"/>
                <T x={100+ci*82} y={60+ri*54} size="13" col={col} bold anchor="middle">{v}</T>
              </g>
            );
          })}
          {ri < 3 && <line x1="60" y1={73+ri*54} x2="460" y2={73+ri*54} stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>}
        </g>
      ))}
      {/* Legend */}
      {[["#3498db","Unsorted"],["#f39c12","Being swapped"],["#27ae60","Sorted"]].map(([c,l],i)=>(
        <g key={l}>
          <rect x={30+i*155} y="268" width="12" height="12" rx="3" fill={c}/>
          <T x={48+i*155} y="279" size="10" col="rgba(255,255,255,0.55)" anchor="start">{l}</T>
        </g>
      ))}
    </svg>
  );

  // ─── NEURAL NETWORK / AI ──────────────────────────────────────────────────
  if (diagType === "neural") return (
    <svg viewBox="0 0 520 310" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="310" rx="14" fill="#0a0618"/>
      <T x="260" y="24" size="14" col="#9b59b6" bold anchor="middle">Neural Network — How AI Learns</T>
      {/* Layers */}
      {[
        {label:"Input",  nodes:[{y:80},{y:140},{y:200},{y:260}], x:80,  col:"#3498db"},
        {label:"Hidden", nodes:[{y:95},{y:155},{y:215}],         x:220, col:"#9b59b6"},
        {label:"Hidden", nodes:[{y:95},{y:155},{y:215}],         x:340, col:"#9b59b6"},
        {label:"Output", nodes:[{y:120},{y:190}],                x:460, col:"#27ae60"},
      ].map(({label,nodes,x,col},li,layers)=>(
        <g key={li}>
          <T x={x} y="52" size="10" col={col+"cc"} anchor="middle">{label}</T>
          {nodes.map((n,ni)=>(
            <g key={ni}>
              {/* Connections to next layer */}
              {li < layers.length-1 && layers[li+1].nodes.map((n2,n2i)=>(
                <line key={n2i} x1={x+14} y1={n.y} x2={layers[li+1].x-14} y2={n2.y}
                  stroke={col} strokeWidth="0.8" opacity="0.25"/>
              ))}
              <circle cx={x} cy={n.y} r="14" fill={col+"30"} stroke={col} strokeWidth="2"/>
            </g>
          ))}
        </g>
      ))}
      {/* Labels */}
      <T x="80"  y="286" size="9" col="rgba(52,152,219,0.7)"  anchor="middle">Pixels/Data</T>
      <T x="460" y="286" size="9" col="rgba(39,174,96,0.7)"   anchor="middle">Cat/Dog</T>
      <T x="260" y="290" size="9" col="rgba(255,255,255,0.3)" anchor="middle">Weights adjust during training</T>
    </svg>
  );

  // ─── WEB TECH HTML/CSS ────────────────────────────────────────────────────
  if (diagType === "webtech") return (
    <svg viewBox="0 0 520 300" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <rect width="520" height="300" rx="14" fill="#060e1a"/>
      <T x="260" y="24" size="14" col="#1abc9c" bold anchor="middle">Web Technologies — HTML, CSS, JS</T>
      {[
        {lang:"HTML",col:"#e34c26",x:120,desc:"Structure",eg:"<h1>Hello</h1>",icon:"🏗"},
        {lang:"CSS", col:"#264de4",x:260,desc:"Styling",  eg:"color: blue;",  icon:"🎨"},
        {lang:"JS",  col:"#f7df1e",x:400,desc:"Behaviour",eg:"alert('Hi!')", icon:"⚡"},
      ].map(({lang,col,x,desc,eg,icon})=>(
        <g key={lang}>
          <rect x={x-85} y="40" width="170" height="220" rx="12" fill={col+"15"} stroke={col} strokeWidth="2"/>
          <T x={x} y="65" size="20" col={col} bold anchor="middle">{icon}</T>
          <T x={x} y="95" size="16" col={col} bold anchor="middle">{lang}</T>
          <T x={x} y="115" size="10" col="rgba(255,255,255,0.5)" anchor="middle">{desc}</T>
          <line x1={x-65} y1="124" x2={x+65} y2="124" stroke={col} strokeWidth="0.8" opacity="0.4"/>
          <rect x={x-62} y="132" width="124" height="30" rx="6" fill="rgba(0,0,0,0.4)"/>
          <text x={x} y="152" fontSize="11" fill={col} fontFamily="JetBrains Mono,monospace" textAnchor="middle">{eg}</text>
          {lang==="HTML" && ["Headings","Paragraphs","Links","Images"].map((f,i)=><T key={f} x={x} y={175+i*16} size="9.5" col="rgba(255,255,255,0.55)" anchor="middle">{f}</T>)}
          {lang==="CSS"  && ["Colors","Fonts","Spacing","Flexbox"].map((f,i)=><T key={f} x={x} y={175+i*16} size="9.5" col="rgba(255,255,255,0.55)" anchor="middle">{f}</T>)}
          {lang==="JS"   && ["Variables","Functions","Events","DOM"].map((f,i)=><T key={f} x={x} y={175+i*16} size="9.5" col="rgba(255,255,255,0.55)" anchor="middle">{f}</T>)}
        </g>
      ))}
    </svg>
  );

  // ─── DEFAULT: Rich animated concept map unique to each topic ─────────────
  const branches = [
    { label:"Definition",   icon:"📖", col:"#e74c7a" },
    { label:"Examples",     icon:"💡", col:"#f39c12" },
    { label:"Key Facts",    icon:"🔑", col:"#27ae60" },
    { label:"How It Works", icon:"⚙️",  col:"#3498db" },
    { label:"Real Life",    icon:"🌍", col:"#9b59b6" },
    { label:"Practice",     icon:"✏️",  col:"#1abc9c" },
  ];
  // Pick accent colour by subject
  const accentCol =
    sl.includes("math")    ? "#f39c12" :
    sl.includes("science") ? "#27ae60" :
    sl.includes("english") ? "#e74c7a" :
    sl.includes("history") ? "#FFD700" :
    sl.includes("cs") || sl.includes("computer") || sl.includes("block") ? "#399aff" :
    sl.includes("ai")      ? "#9b59b6" :
    sl.includes("web")     ? "#1abc9c" : "#399aff";

  // Shorten topic label for centre
  const shortTopic = (topic||"Topic").length > 14
    ? (topic||"Topic").slice(0,13)+"…"
    : (topic||"Topic");

  return (
    <svg viewBox="0 0 520 320" style={{width:"100%",borderRadius:14,margin:"12px 0",display:"block"}}>
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%"   stopColor="#0d1f3c"/>
          <stop offset="100%" stopColor="#060c18"/>
        </radialGradient>
        <radialGradient id="centreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={accentCol} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={accentCol} stopOpacity="0"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Pulse animation */}
        <style>{`
          @keyframes diaPulse  { 0%,100%{opacity:0.6;r:68} 50%{opacity:1;r:74} }
          @keyframes diaFadeIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
          @keyframes diaDash   { to{stroke-dashoffset:-20} }
          .dia-branch { animation: diaFadeIn 0.5s ease both; }
          .dia-line   { animation: diaDash 2s linear infinite; }
        `}</style>
      </defs>

      {/* Background */}
      <rect width="520" height="320" rx="14" fill="url(#bgGrad)"/>

      {/* Subtle grid */}
      {Array.from({length:9}).map((_,i)=>(
        <line key={"g"+i} x1={i*65} y1="0" x2={i*65} y2="320" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
      ))}
      {Array.from({length:6}).map((_,i)=>(
        <line key={"h"+i} x1="0" y1={i*64} x2="520" y2={i*64} stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
      ))}

      {/* Glow behind centre */}
      <circle cx="260" cy="162" r="80" fill="url(#centreGlow)"/>

      {/* Title */}
      <T x="260" y="22" size="13.5" col={accentCol} bold anchor="middle">{topic} — Concept Map</T>
      <line x1="80" y1="30" x2="440" y2="30" stroke={accentCol} strokeWidth="0.6" opacity="0.3"/>

      {/* Branches */}
      {branches.map(({label,icon,col},i)=>{
        const a = (i/6)*Math.PI*2 - Math.PI/2;
        const r = 112;
        const bx = 260 + Math.cos(a)*r;
        const by = 162 + Math.sin(a)*r;
        const delay = i * 0.08;
        return (
          <g key={label} className="dia-branch" style={{animationDelay:`${delay}s`,transformOrigin:`${bx}px ${by}px`}}>
            {/* Connector line */}
            <line
              className="dia-line"
              x1="260" y1="162" x2={bx} y2={by}
              stroke={col} strokeWidth="1.6"
              strokeDasharray="6,4" opacity="0.55"
            />
            {/* Branch bubble */}
            <ellipse cx={bx} cy={by} rx="50" ry="26"
              fill={col+"22"} stroke={col} strokeWidth="1.8"
              filter="url(#glow)"/>
            {/* Icon */}
            <text x={bx-26} y={by+5} fontSize="13" textAnchor="middle"
              fontFamily="Segoe UI Emoji,sans-serif">{icon}</text>
            {/* Label */}
            <T x={bx+8} y={by+5} size="10" col={col} bold anchor="middle">{label}</T>
          </g>
        );
      })}

      {/* Centre node */}
      <circle cx="260" cy="162" r="46" fill={accentCol+"28"} stroke={accentCol} strokeWidth="2.2" filter="url(#glow)"/>
      <circle cx="260" cy="162" r="40" fill={accentCol+"15"} stroke={accentCol+"60"} strokeWidth="1"/>
      <T x="260" y="157" size="12.5" col={accentCol} bold anchor="middle">{shortTopic}</T>
      <T x="260" y="173" size="9"    col="rgba(255,255,255,0.35)" anchor="middle">{(subject||"").slice(0,16)}</T>

      {/* Corner subject badge */}
      <rect x="10" y="298" width="500" height="16" rx="6" fill={accentCol+"0f"} stroke={accentCol+"22"} strokeWidth="1"/>
      <T x="260" y="310" size="9" col={accentCol+"90"} anchor="middle">
        {"Click any branch to explore · " + (topic||"")}
      </T>
    </svg>
  );
}

// Show diagram only on substantive bot answers about the lesson topic
function shouldShowDiagram(text, topic, subject) {
  if (!text || !topic || text.length < 150) return false;
  const tl  = (text    || "").toLowerCase();
  const kl  = (topic   || "").toLowerCase();
  const sl  = (subject || "").toLowerCase();

  // Topic must be mentioned in the response
  const topicMentioned = kl.split(" ").some(w => w.length > 3 && tl.includes(w));
  if (!topicMentioned) return false;

  // Must contain explanation keywords
  const hasExplanation = tl.includes("is a ") || tl.includes("means ") ||
    tl.includes("example") || tl.includes("type") || tl.includes("defined");
  if (!hasExplanation) return false;

  // Subject-topic match — only show diagram if subject aligns with diagram type
  // This prevents CS topics from showing maths diagrams etc.
  const diagType = getDiagramType(kl, sl);
  return diagType !== null;
}

// Determine which diagram to show based on BOTH topic and subject
function getDiagramType(topicLower, subjectLower) {
  const t = topicLower, s = subjectLower;

  // English diagrams — only for english subject
  if (s.includes("english") || s.includes("language")) {
    if (t.includes("noun"))                       return "noun";
    if (t.includes("verb") || t.includes("tense"))return "verb";
    if (t.includes("adjective"))                  return "adjective";
    if (t.includes("pronoun") || t.includes("grammar")) return "grammar";
    return "default";
  }

  // Mathematics diagrams — only for maths subject
  if (s.includes("math")) {
    if (t.includes("algebra") || t.includes("equation") || t.includes("variable")) return "algebra";
    if (t.includes("fraction"))                   return "fraction";
    if (t.includes("geometry") || t.includes("shape")) return "geometry";
    if (t.includes("probability") || t.includes("statistic")) return "statistics";
    return "default";
  }

  // Science diagrams — only for science subject
  if (s.includes("science") || s.includes("biology") || s.includes("chemistry") || s.includes("physics")) {
    if (t.includes("photo") || t.includes("plant") || t.includes("chloro")) return "photosynthesis";
    if (t.includes("cell"))                       return "cell";
    if (t.includes("water cycle") || t.includes("evaporation")) return "watercycle";
    if (t.includes("atom") || t.includes("element")) return "atom";
    if (t.includes("force") || t.includes("motion") || t.includes("newton")) return "force";
    return "default";
  }

  // History diagrams — only for history
  if (s.includes("history") || s.includes("social")) {
    if (t.includes("cold war"))                   return "coldwar";
    if (t.includes("world war") || t.includes("ww2") || t.includes("ww1")) return "worldwar";
    if (t.includes("independence") || t.includes("freedom")) return "independence";
    return "default";
  }

  // CS / AI / Web / Coding — only for cs topics
  if (s.includes("computer") || s.includes("coding") || s.includes("programming") ||
      s.includes("ai") || s.includes("web") || s.includes("block")) {
    if (t.includes("loop"))                       return "loops";
    if (t.includes("variable") || t.includes("data type")) return "variables";
    if (t.includes("function") || t.includes("method")) return "functions";
    if (t.includes("algorithm") || t.includes("sorting")) return "algorithm";
    if (t.includes("network") || t.includes("internet")) return "network";
    if (t.includes("html") || t.includes("css"))  return "webtech";
    if (t.includes("neural") || t.includes("machine learning")) return "neural";
    return "default";
  }

  // Generic topics — show default mindmap
  return "default";
}

// ─── Custom Grade Dropdown ───────────────────────────────────────────────────
function GradeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 12,
          border: `1.5px solid ${open ? BLUE : BORDER}`,
          background: open ? "var(--blue-xlight)" : "var(--bg-secondary)",
          color: "var(--text-primary)", fontFamily: FONT, fontSize: 14,
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "all 0.15s", outline: "none", boxSizing: "border-box",
        }}
      >
        <span style={{ fontWeight: 600, color:"var(--text-primary)" }}>{value || "Select Grade"}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#399aff" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0, color: "var(--text-primary)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 999,
          background: "var(--bg-secondary)", border: `1.5px solid ${BORDER}`,
          borderRadius: 14, boxShadow: "0 8px 32px rgba(57,154,255,0.18)",
          maxHeight: 300, overflowY: "auto", animation: "fadeIn 0.12s ease",
        }}>
          {GRADES.map(g => (
            <button key={g} type="button"
              onClick={() => { onChange(g); setOpen(false); }}
              style={{
                display: "block", width: "100%", padding: "11px 16px",
                border: "none", borderLeft: `3px solid ${value === g ? BLUE : "transparent"}`,
                background: value === g ? "rgba(57,154,255,0.1)" : "transparent",
                color: value === g ? BLUE : "var(--text-secondary)",
                fontFamily: FONT, fontSize: 13, fontWeight: value === g ? 700 : 500,
                cursor: "pointer", textAlign: "left", transition: "background 0.1s",
              }}
            >
              {g}{value === g && <span style={{ float:"right", color: BLUE }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ onStart }) {
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("Grade 6");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const customInputRef = useRef(null);
  const suggestedGrade = age ? ageToGrade(age) : null;

  // Style definitions
  const lbl = { display:"block", fontSize:"13px", fontWeight:"600", color:BLUE, marginBottom:"8px" };
  const inp = { width:"100%", padding:"10px 12px", fontSize:"14px", border:`1.5px solid ${BORDER}`, borderRadius:"10px", fontFamily:FONT, outline:"none", transition:"all 0.2s", background:"var(--bg-secondary)", color:"var(--text-primary)" };

  const filteredSubjects = ALL_SUBJECTS.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSubjectData = ALL_SUBJECTS.find(s => s.id === subject);

  const canStart = !!(subject || customSubject.trim());

  const handleStart = () => {
    if (!canStart) return;
    const finalGrade = age ? ageToGrade(age) : grade;
    const isCustom = !subject || subject === "custom";
    const subjectId = isCustom ? "custom" : subject;
    const subjectLabel = isCustom
      ? (customSubject.trim() || "Custom Subject")
      : selectedSubjectData?.label;
    const topic = isCustom
      ? (customSubject.trim() || "Custom Topic")
      : getCurriculumTopic(subjectId, finalGrade);

    onStart({ grade: finalGrade, subject: subjectId, subjectLabel, topic, level: "some", age });
  };

  return (
    <div style={{ height:"100vh", background:"var(--bg-primary)", fontFamily:FONT, position:"relative", overflowX:"hidden", overflowY:"auto" }}>
      <Orbs />

      {/* Theme Toggle - Fixed Top Right */}
      <div style={{ position:"fixed", top:16, right:16, zIndex:1000 }}>
        <ThemeToggle />
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:680, margin:"0 auto", padding:"40px 20px 60px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:44, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(57,154,255,0.1)", border:"1px solid rgba(57,154,255,0.25)", borderRadius:40, padding:"6px 18px", marginBottom:20 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:BLUE, animation:"bounce 1.5s ease-in-out infinite" }}/>
            <span style={{ color:BLUE, fontSize:11, fontWeight:800, letterSpacing:"1.5px" }}>AI-POWERED LEARNING</span>
          </div>
          <h1 style={{ color:"var(--text-primary)", fontSize:"clamp(32px,6vw,52px)", fontWeight:900, letterSpacing:"-2px", lineHeight:1.1, margin:"0 0 12px" }}>
            Your Personal<br/><span style={{ color:BLUE }}>AI Tutor</span>
          </h1>
          <p style={{ color:"var(--text-secondary)", fontSize:15, fontWeight:500, margin:0 }}>
            Any subject · Any grade · Learn at your own pace
          </p>
        </div>

        {/* Card */}
        <div style={{ background:"var(--bg-secondary)", backdropFilter:"blur(20px)", border:`1.5px solid ${BORDER}`, borderRadius:28, padding:"32px 28px", boxShadow:"0 24px 80px rgba(57,154,255,0.12)", animation:"fadeUp 0.7s ease 0.1s both" }}>

          {/* Row 1: Age + Grade */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
            <div>
              <label style={lbl}>Your Age</label>
              <input
                type="number" min={5} max={20}
                value={age}
                onChange={e => { setAge(e.target.value); if(e.target.value) setGrade(ageToGrade(e.target.value)); }}
                placeholder="e.g. 13"
                style={inp}
              />
              {suggestedGrade && (
                <div style={{ fontSize:11, color:BLUE, fontWeight:700, marginTop:5 }}>
                  Suggested: {suggestedGrade}
                </div>
              )}
            </div>
            <div>
              <label style={lbl}>Grade / Year</label>
              <GradeDropdown value={grade} onChange={setGrade} />
            </div>
          </div>

          {/* Row 2: Subject search */}
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Search or Choose a Subject</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search subjects... or type your own below"
                style={{ ...inp, paddingLeft:42 }}
              />
            </div>
          </div>

          {/* Subject grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10, marginBottom:16 }}>
            {filteredSubjects.map(s => (
              <button
                key={s.id}
                className="subject-card"
                onClick={() => {
                  console.log("Subject clicked:", s.id);
                  if (s.id === "custom") {
                    setSearchQuery("");
                    setSubject("");
                    setCustomSubject("");
                    setTimeout(() => customInputRef.current?.focus(), 100);
                  } else {
                    setSubject(s.id);
                  }
                }}
                style={{
                  padding:"14px 12px",
                  borderRadius:16,
                  cursor:"pointer",
                  border: `1.5px solid ${BORDER}`,
                  background: subject === s.id ? "var(--blue-xlight)" : "var(--bg-secondary)",
                  transition:"all 0.2s ease",
                  textAlign:"center",
                  fontSize: "inherit",
                  fontFamily: "inherit"
                }}
              >
                <div style={{ fontSize:22, marginBottom:6 }}>{s.icon || "📚"}</div>
                <div style={{ color: "var(--text-primary)", fontWeight:700, fontSize:12.5, lineHeight:1.3 }}>{s.label}</div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:BORDER }}/>
            <span style={{ color:"var(--text-secondary)", fontSize:12, fontWeight:600 }}>OR TYPE YOUR OWN</span>
            <div style={{ flex:1, height:1, background:BORDER }}/>
          </div>

          {/* Custom subject input with auto-load */}
          <div style={{ marginBottom:24, display:"flex", gap:8 }}>
            <input
              ref={customInputRef}
              value={customSubject}
              onChange={e => { setCustomSubject(e.target.value); if(e.target.value) setSubject(""); }}
              onKeyDown={e => {
                if (e.key === "Enter" && customSubject.trim()) {
                  const finalGrade = age ? ageToGrade(age) : grade;
                  onStart({ grade: finalGrade, subject: "custom", subjectLabel: customSubject.trim(), topic: customSubject.trim(), level: "some", age });
                }
              }}
              placeholder="e.g. Economics, Philosophy, Guitar Theory, Cooking..."
              style={{ ...inp, flex:1 }}
            />
            {customSubject.trim() && (
              <button
                onClick={() => {
                  const finalGrade = age ? ageToGrade(age) : grade;
                  onStart({ grade: finalGrade, subject: "custom", subjectLabel: customSubject.trim(), topic: customSubject.trim(), level: "some", age });
                }}
                style={{
                  padding:"10px 16px", borderRadius:10, border:"none",
                  background:BLUE, color:"var(--text-primary)", fontWeight:600, cursor:"pointer",
                  transition:"all 0.2s"
                }}
              >
                Go
              </button>
            )}
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            style={{
              width:"100%", padding:"15px", borderRadius:16, border:"none",
              background: canStart ? `linear-gradient(135deg,#1a7de8,${BLUE})` : "rgba(255,255,255,0.08)",
              color: canStart ? "white" : "rgba(255,255,255,0.3)",
              fontFamily:FONT, fontWeight:900, fontSize:16,
              cursor: canStart ? "pointer" : "not-allowed",
              boxShadow: canStart ? "0 8px 28px rgba(57,154,255,0.4)" : "none",
              transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            }}
          >
            Start Learning
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        </div>

        {/* Footer */}
        <p style={{ textAlign:"center", color:"var(--text-secondary)", fontSize:11, fontWeight:600, marginTop:24, position:"relative", zIndex:1 }}>
          Free · Any subject · Any school board worldwide
        </p>
      </div>
    </div>
  );
}

// ─── Indian languages supported by Bhashini ──────────────────────────────────
const BHASHINI_LANGS = [
  { code:"en-IN",  label:"English",   native:"English"  },
  { code:"hi-IN",  label:"Hindi",     native:"हिन्दी"    },
  { code:"bn-IN",  label:"Bengali",   native:"বাংলা"     },
  { code:"te-IN",  label:"Telugu",    native:"తెలుగు"    },
  { code:"mr-IN",  label:"Marathi",   native:"मराठी"     },
  { code:"ta-IN",  label:"Tamil",     native:"தமிழ்"     },
  { code:"gu-IN",  label:"Gujarati",  native:"ગુજરાતી"   },
  { code:"kn-IN",  label:"Kannada",   native:"ಕನ್ನಡ"     },
  { code:"ml-IN",  label:"Malayalam", native:"മലയാളം"    },
  { code:"pa-IN",  label:"Punjabi",   native:"ਪੰਜਾਬੀ"   },
  { code:"or-IN",  label:"Odia",      native:"ଓଡ଼ିଆ"    },
  { code:"ur-IN",  label:"Urdu",      native:"اردو"      },
];

// ─── Voice TTS — uses browser Web Speech API with best matching voice ────────
// No external API needed. Works in Chrome/Edge which have Indian language voices.
// To get Hindi/Tamil/etc voices: Windows Settings → Time & Language → Speech → Add voices

let _voices = [];
// Load voices — Chrome loads them async
if (typeof window !== "undefined" && window.speechSynthesis) {
  _voices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    _voices = window.speechSynthesis.getVoices();
  };
}

function speakBhashini(text, langCode, onEnd) {
  window.speechSynthesis.cancel();
  const clean = text.replace(/<[^>]+>/g, "").replace(/[*`#_]/g, "").trim();
  if (!clean) return;

  const voices = _voices.length ? _voices : window.speechSynthesis.getVoices();
  const langPrefix = langCode.split("-")[0]; // e.g. "hi" from "hi-IN"

  // Priority: exact match (hi-IN) → prefix match (hi) → any Indian → English fallback
  const voice =
    voices.find(v => v.lang === langCode) ||
    voices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) ||
    voices.find(v => ["hi","bn","te","mr","ta","gu","kn","ml","pa","ur","or"].includes(v.lang.split("-")[0])) ||
    null;

  const utt = new SpeechSynthesisUtterance(clean);
  if (voice) utt.voice = voice;
  utt.lang  = voice?.lang || langCode;
  utt.rate  = langCode === "en-IN" ? 0.95 : 0.88;
  utt.pitch = 1.0;
  utt.volume = 1.0;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}

// ─── Continuous Educational Video Engine v4 ────────────────────────────────
// Beautiful female cartoon teacher on left + topic diagram on right
// Teacher mouth moves with speech, gestures change per segment
// Diagrams match chat diagrams exactly (nouns, verbs, algebra, cell, etc.)

const SPEED_OPTIONS = [
  { label:"x0.5",  value:0.5  },
  { label:"x0.75", value:0.75 },
  { label:"x1.0",  value:1.0  },
  { label:"x1.25", value:1.25 },
  { label:"x1.5",  value:1.5  },
  { label:"x2.0",  value:2.0  },
];

// ─── Background music ─────────────────────────────────────────────────────────
let _audioCtx = null, _musicInterval = null, _musicGain = null;
function startMusic(vol) {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    stopMusic();
    _musicGain = _audioCtx.createGain();
    _musicGain.gain.value = vol || 0.055;
    _musicGain.connect(_audioCtx.destination);
    const notes = [261.63,293.66,329.63,392.00,440.00,392.00,349.23,329.63];
    let startT = _audioCtx.currentTime + 0.3;
    function schedule() {
      notes.forEach((freq,i) => {
        try {
          const osc = _audioCtx.createOscillator(), g = _audioCtx.createGain();
          osc.connect(g); g.connect(_musicGain);
          osc.type = "sine"; osc.frequency.value = freq;
          g.gain.setValueAtTime(0, startT+i*0.55);
          g.gain.linearRampToValueAtTime(0.25, startT+i*0.55+0.06);
          g.gain.exponentialRampToValueAtTime(0.001, startT+i*0.55+0.52);
          osc.start(startT+i*0.55); osc.stop(startT+i*0.55+0.53);
        } catch(e) {}
      });
      startT += notes.length*0.55 + 1.2;
    }
    schedule();
    _musicInterval = setInterval(schedule, (notes.length*0.55+1.2)*1000);
  } catch(e) {}
}
function stopMusic() {
  if (_musicInterval) { clearInterval(_musicInterval); _musicInterval = null; }
  if (_musicGain) { try { _musicGain.disconnect(); } catch(e) {} _musicGain = null; }
}

// ─── Female voice ─────────────────────────────────────────────────────────────
let _voice = null, _voiceOK = false;
function loadVoice() {
  const all = window.speechSynthesis.getVoices();
  if (!all.length) return;
  _voice = all.find(v => /zira|hazel|karen|victoria|samantha|moira|tessa|aria|natasha/i.test(v.name))
         || all.find(v => v.lang==="en-GB")
         || all.find(v => v.lang==="en-AU")
         || all.find(v => v.lang.startsWith("en"))
         || all[0];
  _voiceOK = true;
}
if (typeof window !== "undefined") {
  window.speechSynthesis.onvoiceschanged = loadVoice; loadVoice();
}
function speak(text, rate, langCode) {
  window.speechSynthesis.cancel();
  if (!text) return;
  const clean = text.replace(/<[^>]+>/g,"").replace(/[*#_`]/g,"").trim();
  if (!clean) return;
  const all = window.speechSynthesis.getVoices();
  const targetLang = langCode || "en-IN";

  // Find best voice for the language
  let voice = null;
  if (all.length > 0) {
    // Exact lang match first (e.g. hi-IN)
    voice = all.find(v => v.lang === targetLang);
    // Partial match (e.g. hi)
    if (!voice) voice = all.find(v => v.lang.startsWith(targetLang.split("-")[0]));
    // For English fallback: prefer female-sounding voices
    if (!voice && targetLang.startsWith("en")) {
      voice = all.find(v => /zira|hazel|karen|victoria|samantha|moira|tessa|aria|natasha/i.test(v.name))
           || all.find(v => v.lang === "en-GB")
           || all.find(v => v.lang.startsWith("en"));
    }
    if (!voice) voice = all[0];
  }

  const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean];
  let i = 0;
  function next() {
    if (i >= sentences.length) return;
    const s = sentences[i].trim(); if (!s){i++;next();return;}
    const u = new SpeechSynthesisUtterance(s);
    if (voice) u.voice = voice;
    u.lang  = voice?.lang || targetLang;
    u.rate  = Math.max(0.5, Math.min(2.0, (rate||1) * 0.88));
    u.pitch = 1.05; u.volume = 1.0;
    u.onend = ()=>{i++;next();}; u.onerror=()=>{i++;next();};
    window.speechSynthesis.speak(u);
  }
  next();
}

// ─── Parse sections from content ───────────────────────────────────────────────────
const parseSections = (content) => {
  if (!content) return null;

  const sections = {};

  // Try to find DEFINITION section
  const defMatch = content.match(/DEFINITION:\s*([\s\S]*?)(?=KEY CONCEPTS:|KEY IDEAS:|KEY POINTS:|REAL-WORLD EXAMPLE:|EXAMPLE:|SUMMARY:|REMEMBER THIS:|$)/i);
  if (defMatch && defMatch[1]) sections.definition = defMatch[1].trim();

  // Try to find KEY CONCEPTS/IDEAS/POINTS section
  const keyMatch = content.match(/(?:KEY CONCEPTS:|KEY IDEAS:|KEY POINTS:)\s*([\s\S]*?)(?=REAL-WORLD EXAMPLE:|EXAMPLE:|SUMMARY:|REMEMBER THIS:|$)/i);
  if (keyMatch && keyMatch[1]) sections.keyPoints = keyMatch[1].trim();

  // Try to find REAL-WORLD EXAMPLE section
  const exampleMatch = content.match(/(?:REAL-WORLD EXAMPLE:|EXAMPLE:)\s*([\s\S]*?)(?=SUMMARY:|REMEMBER THIS:|$)/i);
  if (exampleMatch && exampleMatch[1]) sections.example = exampleMatch[1].trim();

  // Try to find SUMMARY/REMEMBER section
  const summaryMatch = content.match(/(?:SUMMARY:|REMEMBER THIS:)\s*([\s\S]*?)$/i);
  if (summaryMatch && summaryMatch[1]) sections.summary = summaryMatch[1].trim();

  // Return sections only if we found at least one section
  return Object.keys(sections).length > 0 ? sections : null;
};

// ─── Lesson scripts ───────────────────────────────────────────────────────────
const VSCRIPTS = {
  "english|noun": [
    {dur:12,diag:"noun",   text:"Hello! Welcome to English class. Today we are learning all about nouns. A noun is a word that names a person, a place, a thing, or an idea. That is the golden rule — person, place, thing, or idea!"},
    {dur:14,diag:"noun",   text:"Let us look at person nouns first. Teacher, doctor, mother, friend, student — all person nouns! Your own name is also a noun. It is called a proper noun because it names one specific person, and we write it with a capital letter."},
    {dur:14,diag:"noun",   text:"Now place nouns! School, park, India, London, garden, market, ocean — all place nouns. When a place has a specific name like India or London, we call it a proper noun and always capitalise it."},
    {dur:14,diag:"noun",   text:"Thing nouns name objects you can touch and see. Book, chair, apple, car, phone, tree. Most thing nouns are countable. One book, two books. One chair, five chairs. We call these countable nouns!"},
    {dur:13,diag:"noun",   text:"Some nouns name things you cannot touch — these are abstract nouns. Love, happiness, freedom, courage, knowledge. You cannot hold happiness in your hand, but it is still a noun because it names an idea or feeling."},
    {dur:14,diag:"noun",   text:"Let us practise! In the sentence — The girl read a book in the park — we have three nouns. Girl is a person noun, book is a thing noun, and park is a place noun. Did you find all three? Excellent work!"},
    {dur:14,diag:"noun",   text:"One more important thing — nouns can be singular, meaning one, or plural, meaning more than one. We usually add the letter S to make a noun plural. One cat becomes two cats. One flower becomes many flowers!"},
    {dur:11,diag:"noun",   text:"Fantastic work today! You now know that nouns name people, places, things, and ideas. You understand proper nouns, countable nouns, abstract nouns, and singular and plural nouns. You are a noun expert! Well done!"},
  ],
  "english|verb": [
    {dur:11,diag:"verb",   text:"Hello! Today we discover verbs — the action words of English. Without verbs we cannot make any sentence at all. Every sentence needs a verb. Let us find out why they are so important!"},
    {dur:13,diag:"verb",   text:"A verb is a word that shows an action or a state of being. Run, jump, think, sleep, love, sing — all verbs! They tell us what someone or something does or is. If it shows action, it is a verb!"},
    {dur:14,diag:"verb",   text:"Action verbs show physical or mental actions. Running, swimming, reading, thinking, dreaming, laughing. Right now you are listening and learning — both are action verbs! Can you think of five more action verbs?"},
    {dur:14,diag:"verb",   text:"Linking verbs are different. They connect the subject to a description. Is, am, are, was, were are the most common linking verbs. The sky is blue — here the word is connects sky to blue. That is a linking verb!"},
    {dur:15,diag:"verb",   text:"Verbs also show us WHEN something happens — this is called tense! Past tense means it already happened. I walked. Present tense means it is happening now. I walk. Future tense means it will happen. I will walk!"},
    {dur:13,diag:"verb",   text:"Let us practise. The children played in the garden yesterday. The verb is played — past tense. Change it to today and we say the children play — present tense! Tomorrow they will play — future tense! All the same verb!"},
    {dur:12,diag:"verb",   text:"Brilliant learning today! Verbs show actions and states of being. There are action verbs and linking verbs. Verbs change tense to show past, present, and future. Without verbs we cannot communicate. They are the engine of every sentence!"},
  ],
  "english|adjective": [
    {dur:11,diag:"adj",    text:"Hello! Today we discover adjectives — the describing words that make language colourful and vivid. Without adjectives everything would be so boring! Let us see how they transform our sentences completely."},
    {dur:13,diag:"adj",    text:"An adjective is a word that describes or modifies a noun. It tells us more about a person, place, or thing. Big, small, beautiful, scary, happy, old, red — all adjectives! They answer questions about nouns."},
    {dur:14,diag:"adj",    text:"Adjectives answer three questions about nouns. What kind? A beautiful flower. Which one? That red car. How many? Three clever students. Every time you answer one of those questions about a noun, you are using an adjective!"},
    {dur:14,diag:"adj",    text:"Adjectives also have degrees. Positive — tall. Comparative — taller, used when comparing two things. Superlative — tallest, used when comparing three or more things. Reena is tall. Meena is taller. But Seema is the tallest of all!"},
    {dur:13,diag:"adj",    text:"Good writers use powerful adjectives to paint pictures with words. Instead of saying a dog, say a fluffy golden dog. Instead of a house, say a crumbling ancient house. Adjectives bring your writing completely to life!"},
    {dur:12,diag:"adj",    text:"Fantastic work today! Adjectives describe nouns and make our language rich and interesting. They answer what kind, which one, and how many. They come in degrees — positive, comparative, and superlative. Start noticing adjectives everywhere!"},
  ],
  "mathematics|algebra": [
    {dur:12,diag:"algebra", text:"Hello future mathematicians! Today we explore algebra — one of the most powerful tools in all of mathematics. It might sound scary, but by the end of this lesson you will think algebra is actually amazing!"},
    {dur:14,diag:"algebra", text:"Algebra uses letters like x and y to represent unknown numbers. Instead of saying some unknown number plus three equals seven, we write x plus three equals seven. That letter x is called a variable — it varies!"},
    {dur:14,diag:"algebra", text:"Think of a variable as a mystery box hiding a number. Your job as an algebra detective is to find what is inside! When we solve x plus three equals seven, we find x equals four. Four was hiding in that mystery box!"},
    {dur:15,diag:"algebra", text:"The most important rule in algebra is the balance rule. An equation is like a balance scale — both sides must be equal. Whatever you do to one side, you MUST do to the other side too. This keeps everything perfectly balanced!"},
    {dur:17,diag:"algebra", text:"Let us solve together step by step. Two x plus four equals fourteen. Step one — subtract four from both sides. Two x equals ten. Step two — divide both sides by two. x equals five! Check it — two times five plus four equals fourteen. Correct!"},
    {dur:14,diag:"algebra", text:"Algebra is everywhere in real life! If one cinema ticket costs three hundred rupees and you have nine hundred rupees, you write three hundred times x equals nine hundred. Solve it and find x equals three tickets. That is real algebra!"},
    {dur:12,diag:"algebra", text:"Wonderful work! You have learned that algebra uses variables for unknown numbers, equations are balance scales, and we solve step by step. Algebra is the gateway to all advanced mathematics. You have made a brilliant start today!"},
  ],
  "mathematics|fractions": [
    {dur:11,diag:"fraction", text:"Hello! Today we learn about fractions — one of the most useful concepts in all of mathematics. If you have ever shared a pizza or cut a cake, you have already used fractions in real life!"},
    {dur:13,diag:"fraction", text:"A fraction has two parts. The top number is the numerator — it tells us how many parts we have. The bottom number is the denominator — it tells us how many equal parts the whole is divided into. Simple!"},
    {dur:14,diag:"fraction", text:"Imagine a pizza cut into four equal slices. If you eat one slice, you have eaten one quarter — written as one over four. If you eat three slices, you have eaten three quarters — written as three over four. Delicious fractions!"},
    {dur:14,diag:"fraction", text:"There are different types of fractions. A proper fraction has a smaller numerator like one third. An improper fraction has a larger numerator like five thirds. A mixed number combines both, like one and two thirds. Each one has its own use!"},
    {dur:14,diag:"fraction", text:"To add fractions with the same denominator, just add the numerators. One fifth plus two fifths equals three fifths. If denominators are different, find a common denominator first. It is like finding a common language between the fractions!"},
    {dur:12,diag:"fraction", text:"Excellent work! You now know that fractions describe parts of a whole, what numerator and denominator mean, different types of fractions, and how to add them. Fractions are used every day in cooking, shopping, measurement, and science!"},
  ],
  "science|photosynthesis": [
    {dur:12,diag:"photo",  text:"Welcome to science class! Today we discover photosynthesis — the incredible process by which plants make their own food using sunlight. Plants have a magical kitchen inside every single leaf. Let us explore how it works!"},
    {dur:14,diag:"photo",  text:"Photosynthesis is where green plants use sunlight, water, and carbon dioxide to produce food as glucose sugar and release oxygen. The word photosynthesis comes from Greek — photo means light, synthesis means putting together."},
    {dur:14,diag:"photo",  text:"Plants need three ingredients for photosynthesis. Sunlight for energy — from the Sun. Water — absorbed through roots from soil. Carbon dioxide — breathed in through tiny holes in leaves called stomata. Three ingredients, one amazing reaction!"},
    {dur:15,diag:"photo",  text:"The magic happens in chloroplasts inside leaf cells. Chloroplasts contain chlorophyll, the green pigment that captures sunlight energy. Chlorophyll is what makes plants green! It uses that captured energy to power the whole reaction."},
    {dur:15,diag:"photo",  text:"The plant produces two things. First, glucose sugar that gives it energy to grow and reproduce. Second — and this is most important for us — it releases oxygen! Every single breath of fresh air you take exists because plants are photosynthesising right now!"},
    {dur:13,diag:"photo",  text:"The chemical formula is six carbon dioxide plus six water plus light energy produces one glucose plus six oxygen. That is the chemistry of life happening in every green leaf on every sunny day all around the beautiful world!"},
    {dur:12,diag:"photo",  text:"Magnificent work! Photosynthesis uses sunlight, water, and carbon dioxide to produce glucose and oxygen. It happens in chloroplasts using chlorophyll. Without photosynthesis there would be no food, no oxygen, no life. Plants truly are our superheroes!"},
  ],
  "science|cell": [
    {dur:11,diag:"cell",   text:"Hello scientists! Today we explore the cell — the basic building block of all life on Earth. From the tiniest bacterium to the largest blue whale, every living thing is made of cells. Let us look inside one!"},
    {dur:14,diag:"cell",   text:"A cell is the smallest unit of life that can carry out all basic living functions. Your body alone contains about thirty seven trillion cells, all working together right now as you watch this lesson!"},
    {dur:14,diag:"cell",   text:"An animal cell has four main parts. The nucleus is the control centre — it holds the DNA blueprint for everything. The cell membrane is the protective boundary. The cytoplasm is the jelly-like fluid inside. And mitochondria produce all the energy!"},
    {dur:14,diag:"cell",   text:"Plant cells and animal cells are similar but have important differences. Plant cells have a rigid cell wall outside the membrane for extra support. They also have chloroplasts for photosynthesis, and a large central vacuole for water storage."},
    {dur:13,diag:"cell",   text:"Different cells have different jobs. Red blood cells carry oxygen through your body. Nerve cells send electrical signals at lightning speed. Muscle cells contract and relax to make you move. Every function is performed by specialised cells!"},
    {dur:12,diag:"cell",   text:"Brilliant work! Cells are the building blocks of all life. They have a nucleus, membrane, cytoplasm, and mitochondria. Plant cells have extra features like cell walls and chloroplasts. You now understand the foundation of all biology!"},
  ],
  "history|cold war": [
    {dur:13,diag:"coldwar", text:"Welcome to history! Today we explore the Cold War — one of the most dramatic periods of the twentieth century. It was a time of tension, rivalry, the Space Race, and real fear of nuclear war. Let us explore this fascinating chapter together!"},
    {dur:15,diag:"coldwar", text:"After World War Two ended in 1945, the world had two superpowers. The United States believed in capitalism and democracy. The Soviet Union believed in communism and state control. These very different systems created massive tension and rivalry between them."},
    {dur:14,diag:"coldwar", text:"It was called the Cold War because the two sides never directly fought each other with weapons. Instead they competed through technology, economics, propaganda, and by supporting opposite sides in conflicts happening in other countries around the world."},
    {dur:15,diag:"coldwar", text:"The Space Race was an exciting competition! In 1957 the Soviets launched Sputnik, the very first satellite in space. America was shocked! Then in 1969, Neil Armstrong became the first human to walk on the Moon. The whole world watched in absolute amazement!"},
    {dur:15,diag:"coldwar", text:"The Cuban Missile Crisis of 1962 was the scariest moment. Soviet nuclear missiles were placed in Cuba, just ninety miles from America. For thirteen terrifying days, the world feared nuclear war. Thankfully, diplomacy won and the missiles were removed!"},
    {dur:14,diag:"coldwar", text:"The Cold War ended in 1991 when the Soviet Union collapsed. The Berlin Wall, symbol of Cold War division, had already fallen in 1989. The internet, GPS, and space technology we use every day today were all developed during the Cold War era!"},
  ],
};

function getVScript(subject, topic) {
  const sl = subject.toLowerCase(), tl = topic.toLowerCase();
  for (const key of Object.keys(VSCRIPTS)) {
    const [s,t] = key.split("|");
    if (sl.includes(s) && tl.includes(t)) return VSCRIPTS[key];
    if (sl.includes(s) && t.split(" ").some(w=>tl.includes(w))) return VSCRIPTS[key];
  }
  return buildGenericVScript(subject, topic);
}
function buildGenericVScript(subject, topic) {
  return [
    {dur:12,diag:"default", text:`Hello and welcome! Today we are going to learn all about ${topic} in ${subject}. I am so excited to share this lesson with you. By the end you will have a solid understanding of this important topic. Let us begin!`},
    {dur:14,diag:"default", text:`So what exactly is ${topic}? It is a fundamental concept in ${subject} that is essential to understand. When we study ${topic} we are building a strong foundation for more advanced topics you will explore as you progress through school.`},
    {dur:14,diag:"default", text:`Let me explain how ${topic} works. There are several key ideas to understand. First, we identify the main components. Then we understand how those components interact with each other. Finally, we see the result of those interactions.`},
    {dur:14,diag:"default", text:`Here is the exciting part! ${topic} appears in everyday life all around us. Once you know what to look for, you will spot examples of ${topic} in your home, your school, your neighbourhood, and in everything you do each day.`},
    {dur:14,diag:"default", text:`Let us practise together. The best way to truly understand ${topic} is through examples and practice. Making mistakes is completely fine — every mistake is a learning opportunity. The more you practise, the more confident you will become!`},
    {dur:12,diag:"default", text:`Wonderful work today! You have learned what ${topic} is, how it works, and where it appears in real life. You have also practised working with it yourself. Keep reviewing and you will master ${topic} completely. See you next lesson!`},
  ];
}

// ─── Canvas Drawing Utilities ─────────────────────────────────────────────────

// ── Background ──────────────────────────────────────────────────────────────
function drawVideoBg(ctx, w, h) {
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,"#0a1628"); g.addColorStop(1,"#050e1e");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  // Subtle grid
  ctx.strokeStyle="rgba(57,154,255,0.04)"; ctx.lineWidth=1;
  for(let x=0;x<w;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  // Divider line
  ctx.strokeStyle="rgba(57,154,255,0.15)"; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(w*0.30,30); ctx.lineTo(w*0.30,h-30); ctx.stroke();
}

// roundRect polyfill for older browsers
function safeRoundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const rad = Math.min(r, w/2, h/2);
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }
}


function drawSpeechBubble(ctx, x, y, text, t, maxW) {
  if (!text) return;
  const bW = Math.min(maxW||200, 220);
  const floatY = y + Math.sin(t*0.9)*4;
  ctx.font = `bold 11px Nunito,sans-serif`;
  // word wrap
  const words = text.split(" "); let lines=[], line="";
  words.forEach(w=>{
    const test = line?line+" "+w:w;
    if(ctx.measureText(test).width>bW-20&&line){lines.push(line);line=w;}else line=test;
  });
  if(line) lines.push(line);
  lines = lines.slice(0,3);
  const bH = lines.length*16+18;
  ctx.fillStyle="rgba(255,255,255,0.97)"; ctx.strokeStyle="#e74c7a"; ctx.lineWidth=2;
  ctx.beginPath(); safeRoundRect(ctx, x-bW/2, floatY-bH-10, bW, bH, 10); ctx.fill(); ctx.stroke();
  // tail
  ctx.fillStyle="rgba(255,255,255,0.97)";
  ctx.beginPath(); ctx.moveTo(x-10,floatY-10); ctx.lineTo(x+10,floatY-10); ctx.lineTo(x,floatY+5);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle="#e74c7a";
  ctx.beginPath(); ctx.moveTo(x-10,floatY-10); ctx.lineTo(x,floatY+5); ctx.lineTo(x+10,floatY-10); ctx.stroke();
  ctx.fillStyle="#0d1b2e"; ctx.font="bold 11px Nunito,sans-serif"; ctx.textAlign="center";
  lines.forEach((ln,i)=>ctx.fillText(ln, x, floatY-bH-10+18+i*16));
}

// ── Topic diagrams on canvas ──────────────────────────────────────────────────
function drawDiagram(ctx, x, y, w, h, diagKey, t) {
  // Each diagram fits in the right panel (x,y,w,h)
  const pad = 16;
  const iw = w - pad*2, ih = h - pad*2;
  const cx = x + pad, cy = y + pad;

  // Panel background
  ctx.fillStyle="rgba(13,31,53,0.85)";
  ctx.strokeStyle="rgba(57,154,255,0.2)"; ctx.lineWidth=1.5;
  ctx.beginPath(); safeRoundRect(ctx, x, y, w, h, 14); ctx.fill(); ctx.stroke();

  const T = (tx,ty,txt,sz,col,bold,anchor)=>{
    ctx.font=`${bold?"bold ":""}${sz||11}px Nunito,sans-serif`;
    ctx.fillStyle=col||"rgba(255,255,255,0.85)"; ctx.textAlign=anchor||"center";
    ctx.fillText(txt, tx, ty);
  };

  if (diagKey==="noun") {
    T(cx+iw/2, cy+20, "Types of Nouns", 14,"#93c5fd",true);
    // Centre
    ctx.fillStyle="rgba(57,154,255,0.2)"; ctx.strokeStyle="#399aff"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(cx+iw/2, cy+ih/2, 50, 26, 0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    T(cx+iw/2, cy+ih/2-4, "NOUN",12,"#93c5fd",true);
    T(cx+iw/2, cy+ih/2+11,"person·place·thing·idea",8,"rgba(255,255,255,0.4)");
    // Four branches
    const branches = [{l:"Person",e:"Teacher",c:"#e74c7a"},{l:"Place",e:"School",c:"#27ae60"},{l:"Thing",e:"Book",c:"#f39c12"},{l:"Idea",e:"Freedom",c:"#9b59b6"}];
    const bPos = [[cx+iw*0.12,cy+ih*0.28],[cx+iw*0.88,cy+ih*0.28],[cx+iw*0.12,cy+ih*0.72],[cx+iw*0.88,cy+ih*0.72]];
    branches.forEach(({l,e,c},i)=>{
      const [bx,by]=bPos[i];
      ctx.strokeStyle=c; ctx.lineWidth=1; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(cx+iw/2,cy+ih/2); ctx.lineTo(bx,by); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=c+"22"; ctx.strokeStyle=c; ctx.lineWidth=1.5;
      ctx.beginPath(); safeRoundRect(ctx, bx-44,by-22,88,44,8); ctx.fill(); ctx.stroke();
      T(bx,by-6,l,11,c,true); T(bx,by+10,e,9,"rgba(255,255,255,0.6)");
    });
    // Bottom rule
    T(cx+iw/2, cy+ih-8,"Singular + s = Plural  (cat→cats)",9,"rgba(255,255,255,0.35)");

  } else if (diagKey==="verb") {
    T(cx+iw/2, cy+20,"Verb Tenses",14,"#93c5fd",true);
    const ly = cy+ih*0.42;
    ctx.strokeStyle="rgba(255,255,255,0.2)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx+10,ly); ctx.lineTo(cx+iw-10,ly); ctx.stroke();
    [{l:"PAST",e:"walked",c:"#fca5a5",x:cx+iw*0.18},{l:"NOW",e:"walk",c:"#86efac",x:cx+iw*0.5},{l:"FUTURE",e:"will walk",c:"#93c5fd",x:cx+iw*0.82}].forEach(({l,e,c,x})=>{
      ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,ly,8,0,Math.PI*2); ctx.fill();
      T(x,ly-18,l,9,c,true); T(x,ly+24,`"${e}"`,10,"rgba(255,255,255,0.75)");
    });
    ctx.fillStyle="rgba(134,239,172,0.12)"; ctx.strokeStyle="#86efac"; ctx.lineWidth=1.2;
    ctx.beginPath(); safeRoundRect(ctx, cx,cy+ih*0.62,iw*0.46,ih*0.3,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle="rgba(147,197,253,0.12)"; ctx.strokeStyle="#93c5fd";
    ctx.beginPath(); safeRoundRect(ctx, cx+iw*0.54,cy+ih*0.62,iw*0.46,ih*0.3,8); ctx.fill(); ctx.stroke();
    T(cx+iw*0.23,cy+ih*0.68,"Action Verbs",10,"#86efac",true);
    T(cx+iw*0.23,cy+ih*0.78,"Run, Think, Swim",9,"rgba(255,255,255,0.6)");
    T(cx+iw*0.77,cy+ih*0.68,"Linking Verbs",10,"#93c5fd",true);
    T(cx+iw*0.77,cy+ih*0.78,"Is, Am, Are, Was",9,"rgba(255,255,255,0.6)");

  } else if (diagKey==="adj") {
    T(cx+iw/2, cy+20,"Adjectives — Describing Words",13,"#f39c12",true);
    [{q:"What kind?",e:"beautiful flower",c:"#e74c7a",x:cx+iw*0.2},{q:"Which one?",e:"that red car",c:"#27ae60",x:cx+iw*0.5},{q:"How many?",e:"three students",c:"#9b59b6",x:cx+iw*0.8}].forEach(({q,e,c,x})=>{
      ctx.fillStyle=c+"1a"; ctx.strokeStyle=c; ctx.lineWidth=1.5;
      ctx.beginPath(); safeRoundRect(ctx, x-52,cy+32,104,50,8); ctx.fill(); ctx.stroke();
      T(x,cy+52,q,10,c,true); T(x,cy+68,`"${e}"`,9,"rgba(255,255,255,0.6)");
    });
    T(cx+iw/2,cy+ih*0.56,'"The tall clever girl solved the hard problem."',10,"white");
    [["Positive","tall","smart"],["Comparative","taller","smarter"],["Superlative","tallest","smartest"]].forEach(([d,...ws],ri)=>{
      ctx.fillStyle=ri%2===0?"rgba(255,255,255,0.03)":"transparent";
      ctx.fillRect(cx,cy+ih*0.64+ri*26,iw,24);
      T(cx+iw*0.22,cy+ih*0.64+ri*26+16,d,9,["#f39c12","#86efac","#93c5fd"][ri],true);
      ws.forEach((w,wi)=>T(cx+iw*(0.52+wi*0.22),cy+ih*0.64+ri*26+16,w,9,"rgba(255,255,255,0.7)"));
    });

  } else if (diagKey==="algebra") {
    T(cx+iw/2,cy+20,"Solving Equations",14,"#93c5fd",true);
    // Balance scale
    const bx=cx+iw/2, bsy=cy+70;
    ctx.strokeStyle="#FFD700"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bx-70,bsy-15); ctx.lineTo(bx+70,bsy-15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx,bsy-15); ctx.lineTo(bx,bsy); ctx.stroke();
    ctx.fillStyle="#FFD700"; ctx.beginPath(); ctx.moveTo(bx-8,bsy); ctx.lineTo(bx+8,bsy); ctx.lineTo(bx,bsy+10); ctx.fill();
    ctx.fillStyle="rgba(57,154,255,0.3)"; ctx.strokeStyle="#399aff"; ctx.lineWidth=1.5;
    ctx.beginPath(); safeRoundRect(ctx, bx-95,bsy-38,70,24,6); ctx.fill(); ctx.stroke();
    T(bx-60,bsy-22,"2x + 4",11,"#93c5fd",true);
    ctx.fillStyle="rgba(134,239,172,0.3)"; ctx.strokeStyle="#86efac";
    ctx.beginPath(); safeRoundRect(ctx, bx+25,bsy-38,70,24,6); ctx.fill(); ctx.stroke();
    T(bx+60,bsy-22,"14",12,"#86efac",true);
    // Steps
    const steps=[["2x + 4 = 14","rgba(255,255,255,0.9)"],["– 4 both sides","rgba(255,255,255,0.35)"],["2x = 10","#93c5fd"],["÷ 2 both sides","rgba(255,255,255,0.35)"],["x = 5  ✓","#86efac"],["Check: 2(5)+4=14 ✓","#FFD700"]];
    steps.forEach(([s,c],i)=>{
      ctx.font=`bold 12px monospace`; ctx.fillStyle=c; ctx.textAlign="left";
      ctx.fillText(s, cx+10, cy+ih*0.52+i*22);
    });

  } else if (diagKey==="fraction") {
    T(cx+iw/2,cy+18,"Understanding Fractions",14,"#93c5fd",true);
    [[1,4,"¼"],[2,4,"²⁄₄"],[3,4,"¾"]].forEach(([num,den,frac],fi)=>{
      const pcx=cx+iw*(0.16+fi*0.34), pcy=cy+ih*0.46, r=Math.min(iw*0.12,32);
      Array.from({length:den}).forEach((_,i)=>{
        const a1=i/den*Math.PI*2-Math.PI/2, a2=(i+1)/den*Math.PI*2-Math.PI/2;
        const lf=a2-a1>Math.PI?1:0;
        ctx.fillStyle=i<num?"rgba(57,154,255,0.75)":"rgba(255,255,255,0.07)";
        ctx.strokeStyle="rgba(255,255,255,0.25)"; ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.moveTo(pcx,pcy);
        ctx.lineTo(pcx+r*Math.cos(a1),pcy+r*Math.sin(a1));
        ctx.arc(pcx,pcy,r,a1,a2);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      T(pcx,pcy+r+18,frac,16,"#93c5fd",true);
    });
    T(cx+iw/2,cy+ih-12,"Numerator (top) ÷ Denominator (bottom)",9,"rgba(255,255,255,0.35)");

  } else if (diagKey==="photo") {
    T(cx+iw/2,cy+18,"Photosynthesis",14,"#86efac",true);
    // Inputs
    [{l:"☀️ Light",c:"#FFD700",y:cy+ih*0.3},{l:"💧 Water",c:"#3498db",y:cy+ih*0.5},{l:"🌬️ CO₂",c:"#86efac",y:cy+ih*0.7}].forEach(({l,c,y})=>{
      ctx.fillStyle=c+"1a"; ctx.strokeStyle=c; ctx.lineWidth=1.5;
      ctx.beginPath(); safeRoundRect(ctx, cx+4,y-14,iw*0.28,28,7); ctx.fill(); ctx.stroke();
      T(cx+4+iw*0.14,y+5,l,10,c,true);
      ctx.strokeStyle=c; ctx.lineWidth=1; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(cx+iw*0.32,y); ctx.lineTo(cx+iw*0.44,cy+ih*0.5); ctx.stroke();
      ctx.setLineDash([]);
    });
    // Leaf
    ctx.fillStyle="#0f3d18"; ctx.strokeStyle="#27ae60"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(cx+iw*0.54,cy+ih*0.5,iw*0.1,ih*0.22,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    T(cx+iw*0.54,cy+ih*0.46,"🌿",14,"white",true);
    T(cx+iw*0.54,cy+ih*0.58,"Leaf",9,"#86efac",true);
    // Outputs
    [{l:"🍬 Glucose",c:"#fde68a",y:cy+ih*0.35},{l:"🌬️ O₂",c:"#93c5fd",y:cy+ih*0.65}].forEach(({l,c,y})=>{
      ctx.strokeStyle=c; ctx.lineWidth=1; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(cx+iw*0.64,cy+ih*0.5); ctx.lineTo(cx+iw*0.68,y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=c+"1a"; ctx.strokeStyle=c; ctx.lineWidth=1.5;
      ctx.beginPath(); safeRoundRect(ctx, cx+iw*0.68,y-14,iw*0.28,28,7); ctx.fill(); ctx.stroke();
      T(cx+iw*0.82,y+5,l,10,c,true);
    });
    ctx.font="bold 9px monospace"; ctx.fillStyle="#86efac"; ctx.textAlign="center";
    ctx.fillText("6CO₂+6H₂O+Light→Glucose+6O₂", cx+iw/2, cy+ih-6);

  } else if (diagKey==="cell") {
    T(cx+iw/2,cy+18,"Animal Cell",14,"#27ae60",true);
    const lcx=cx+iw*0.38, lcy=cy+ih*0.5;
    ctx.fillStyle="rgba(39,174,96,0.07)"; ctx.strokeStyle="#27ae60"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(lcx,lcy,iw*0.32,ih*0.35,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle="rgba(231,76,60,0.22)"; ctx.strokeStyle="#e74c3c"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(lcx,lcy,iw*0.12,ih*0.14,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    T(lcx,lcy+4,"Nucleus",9,"#e74c3c",true);
    [{n:"Cell Membrane",c:"#27ae60",lx:lcx+iw*0.32,ly:lcy},{n:"Mitochondria",c:"#FFA500",lx:lcx-iw*0.2,ly:lcy-ih*0.2},{n:"Cytoplasm",c:"#3498db",lx:lcx,ly:lcy+ih*0.28}].forEach(({n,c,lx,ly})=>{
      const tx=cx+iw*0.75, ty=lx<lcx+iw*0.3?(lcy-ih*0.12):(ly<lcy?cy+ih*0.3:cy+ih*0.72);
      ctx.strokeStyle=c; ctx.lineWidth=1; ctx.setLineDash([3,2]);
      ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(tx,ty); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=c; ctx.beginPath(); ctx.arc(lx,ly,4,0,Math.PI*2); ctx.fill();
      T(tx+4,ty+4,n,9,c,false,"left");
    });

  } else if (diagKey==="coldwar") {
    T(cx+iw/2,cy+18,"The Cold War  1947–1991",13,"#FFD700",true);
    ctx.fillStyle="rgba(0,50,200,0.18)"; ctx.strokeStyle="#3a7de8"; ctx.lineWidth=1.5;
    ctx.beginPath(); safeRoundRect(ctx, cx,cy+30,iw*0.44,ih*0.45,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle="rgba(200,0,0,0.18)"; ctx.strokeStyle="#e74c3c";
    ctx.beginPath(); safeRoundRect(ctx, cx+iw*0.56,cy+30,iw*0.44,ih*0.45,8); ctx.fill(); ctx.stroke();
    T(cx+iw*0.22,cy+50,"🇺🇸 USA",12,"#93c5fd",true);
    T(cx+iw*0.78,cy+50,"🇷🇺 USSR",12,"#fca5a5",true);
    ["Capitalism","Democracy","NATO"].forEach((s,i)=>{ctx.fillStyle="rgba(57,154,255,0.6)"; ctx.beginPath(); ctx.arc(cx+8,cy+68+i*18,3,0,Math.PI*2); ctx.fill(); T(cx+14,cy+72+i*18,s,9,"rgba(255,255,255,0.7)",false,"left");});
    ["Communism","State Control","Warsaw Pact"].forEach((s,i)=>{ctx.fillStyle="rgba(231,76,60,0.6)"; ctx.beginPath(); ctx.arc(cx+iw*0.56+8,cy+68+i*18,3,0,Math.PI*2); ctx.fill(); T(cx+iw*0.56+14,cy+72+i*18,s,9,"rgba(255,255,255,0.7)",false,"left");});
    // VS badge
    ctx.fillStyle="#1a0a00"; ctx.strokeStyle="#FFD700"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(cx+iw/2,cy+ih*0.28,18,0,Math.PI*2); ctx.fill(); ctx.stroke();
    T(cx+iw/2,cy+ih*0.28+5,"VS",11,"#FFD700",true);
    // Timeline
    const tly=cy+ih*0.82;
    ctx.strokeStyle="rgba(255,215,0,0.3)"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(cx+5,tly); ctx.lineTo(cx+iw-5,tly); ctx.stroke();
    [{yr:"1947",ev:"Begins",x:cx+iw*0.1},{yr:"1957",ev:"Sputnik",x:cx+iw*0.3},{yr:"1969",ev:"Moon",x:cx+iw*0.55},{yr:"1991",ev:"USSR falls",x:cx+iw*0.82}].forEach(({yr,ev,x})=>{
      ctx.fillStyle="#FFD700"; ctx.beginPath(); ctx.arc(x,tly,5,0,Math.PI*2); ctx.fill();
      T(x,tly-12,yr,8,"#FFD700",true); T(x,tly+16,ev,8,"rgba(255,255,255,0.5)");
    });

  } else {
    // Default: animated mind map — topic word-wrapped in centre
    const pulse = 0.8 + Math.sin(t*1.2)*0.15;
    // Centre bubble — larger to fit topic name
    ctx.fillStyle=`rgba(57,154,255,${0.15*pulse})`; ctx.strokeStyle=`rgba(57,154,255,${0.5*pulse})`; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(cx+iw/2, cy+ih/2, 64, 30, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Topic name word-wrapped in centre
    ctx.font="bold 10px Nunito,sans-serif"; ctx.fillStyle="#93c5fd"; ctx.textAlign="center";
    const topicWords = (diagKey||"Topic").replace(/[_|]/g," ").split(" ");
    const topicLines = []; let tLine="";
    topicWords.forEach(w=>{ const test=tLine?tLine+" "+w:w;
      if(ctx.measureText(test).width>118&&tLine){topicLines.push(tLine);tLine=w;}else tLine=test;});
    if(tLine) topicLines.push(tLine);
    topicLines.slice(0,2).forEach((ln,i)=>ctx.fillText(ln, cx+iw/2, cy+ih/2-4+(i*14)));
    // Six branches — pushed further out so they don't overlap
    ["Definition","Examples","Key Facts","How It Works","Real Life","Quiz"].forEach((l,i)=>{
      const a=i/6*Math.PI*2-Math.PI/2;
      const r=Math.min(iw*0.42, ih*0.42);
      const bx=cx+iw/2+Math.cos(a)*r, by=cy+ih/2+Math.sin(a)*r;
      const c=["#e74c7a","#27ae60","#f39c12","#3498db","#9b59b6","#1abc9c"][i];
      ctx.strokeStyle=c+"80"; ctx.lineWidth=1.2; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(cx+iw/2,cy+ih/2); ctx.lineTo(bx,by); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle=c+"22"; ctx.strokeStyle=c; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.ellipse(bx,by,46,21,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.font="bold 9px Nunito,sans-serif"; ctx.fillStyle=c; ctx.textAlign="center";
      ctx.fillText(l, bx, by+4);
    });
  }
}

// Subtitle bar
function drawSubtitleV(ctx, w, h, text, prog) {
  if (!text) return;
  const bh=62;
  ctx.fillStyle="rgba(5,10,20,0.93)"; ctx.fillRect(0,h-bh,w,bh);
  ctx.fillStyle="#e74c7a"; ctx.fillRect(0,h-bh,w*prog,3);
  ctx.font=`bold ${Math.min(w*0.027,13)}px Nunito,sans-serif`;
  ctx.fillStyle="white"; ctx.textAlign="center";
  const maxW=w-60; let lines=[], line="";
  text.split(" ").forEach(word=>{
    const test=line?line+" "+word:word;
    if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=word;}else line=test;
  });
  if(line) lines.push(line);
  lines.slice(0,2).forEach((ln,i)=>ctx.fillText(ln,w/2,h-bh+20+i*22));
}



// ─── Language Narration Panel ─────────────────────────────────────────────────
// Generates a topic explanation via Claude API, shows scrolling subtitles,
// and reads it aloud using Bhashini (Web Speech API) in the chosen language.
// ─── YouTube VideoPlayer ──────────────────────────────────────────────────────
// Searches YouTube for real educational videos matching the topic + grade,
// then lets the student browse a playlist and watch them embedded.
function VideoPlayer({ profile }) {
  const [phase,      setPhase]      = useState("loading");
  const [videos,     setVideos]     = useState([]);
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [query,      setQuery]      = useState("");
  const [searching,  setSearching]  = useState(false);
  const [filterAge,  setFilterAge]  = useState("all");

  // Build initial search query from profile
  const buildQuery = (topic, grade, subject) => {
    const gradeNum = grade.replace("Grade ","");
    const ageHint  = parseInt(gradeNum) + 5;
    return `${topic} ${subject} lesson for grade ${gradeNum} students age ${ageHint}`;
  };

  // Fetch videos from backend (YouTube Data API)
  const fetchVideos = async (q) => {
    setPhase("loading"); setSearching(true);
    try {
      const res = await fetch(`${API}/api/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, grade: profile.grade, subject: profile.subject }),
      });
      if (!res.ok) throw new Error("YouTube API error");
      const data = await res.json();
      if (!data.videos || data.videos.length === 0) throw new Error("No videos found");
      setVideos(data.videos);
      setActiveIdx(0);
      setPhase("results");
    } catch (err) {
      // No API key or network error — show helpful redirect state
      setVideos([]);
      setPhase("no-api");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const q = buildQuery(profile.topic, profile.grade, profile.subjectLabel);
    setQuery(q);
    fetchVideos(q);
  }, [profile]);

  // Filtered video list
  const filteredVideos = videos.filter(v => {
    if (filterAge === "all") return true;
    const [m, s] = (v.duration || "0:00").split(":").map(Number);
    const secs = m * 60 + (s || 0);
    if (filterAge === "short") return secs < 480;   // < 8 min
    if (filterAge === "long")  return secs >= 480;  // ≥ 8 min
    return true;
  });

  const activeVideo = filteredVideos[activeIdx] || videos[0];

  // ── Styles ────────────────────────────────────────────────────────────────
  const pill = (active) => ({
    padding: "5px 14px", borderRadius: 20, border: "1.5px solid",
    borderColor: active ? BLUE : "rgba(255,255,255,0.15)",
    background: active ? "rgba(57,154,255,0.15)" : "rgba(255,255,255,0.05)",
    color: active ? BLUE : "rgba(255,255,255,0.5)",
    fontFamily: FONT, fontWeight: 700, fontSize: 12, cursor: "pointer",
  });

  // ── Loading state ─────────────────────────────────────────────────────────
  if (phase === "loading") return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, background:"var(--bg-primary)" }}>
      <div style={{ width:48, height:48, border:"4px solid rgba(57,154,255,0.15)", borderTopColor:BLUE, borderRadius:"50%", animation:"spin 0.85s linear infinite" }}/>
      <div style={{ color:"var(--text-primary)", fontWeight:700, fontSize:14 }}>Finding the best videos for {profile.topic}…</div>
      <div style={{ color:"var(--text-secondary)", fontSize:12 }}>{profile.grade} · {profile.subjectLabel}</div>
    </div>
  );

  // ── No API key state — show YouTube search redirect + narration ────────────
  if (phase === "no-api") return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"var(--bg-primary)" }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24 }}>
        <div style={{ fontSize:48 }}>🎬</div>
        <div style={{ color:"var(--text-primary)", fontWeight:900, fontSize:17, textAlign:"center" }}>Search for "{profile.topic}" videos</div>
        <div style={{ color:"var(--text-secondary)", fontSize:13, textAlign:"center", maxWidth:380 }}>
          Add your <strong style={{color:BLUE}}>YOUTUBE_API_KEY</strong> to your <code style={{background:"rgba(255,255,255,0.08)",padding:"2px 6px",borderRadius:4}}>.env</code> file to auto-load videos.<br/>
          Or click below to search on YouTube directly:
        </div>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(profile.topic + " " + profile.subjectLabel + " " + profile.grade + " lesson tutorial")}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:12, background:"#FF0000", color:"var(--text-primary)", fontFamily:FONT, fontWeight:900, fontSize:14, textDecoration:"none", boxShadow:"0 4px 20px rgba(255,0,0,0.35)" }}>
          <span style={{fontSize:18}}>▶</span> Search on YouTube
        </a>
        <button onClick={() => fetchVideos(query)} style={{ padding:"8px 20px", borderRadius:10, border:`1px solid ${BORDER}`, background:"var(--bg-tertiary)", color:"var(--text-primary)", fontFamily:FONT, fontWeight:700, fontSize:12, cursor:"pointer" }}>
          🔄 Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"var(--bg-primary)" }}>

      {/* ── TOP SEARCH BAR — compact ── */}
      <div style={{ padding:"7px 12px", borderBottom:`1px solid ${BORDER}`, display:"flex", gap:7, alignItems:"center", flexShrink:0, background:"var(--bg-secondary)" }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if(e.key==="Enter") fetchVideos(query); }}
          placeholder="Search educational videos…"
          style={{ flex:1, padding:"7px 12px", borderRadius:8, border:`1.5px solid ${BORDER}`, background:"var(--bg-secondary)", color:"var(--text-primary)", fontFamily:FONT, fontSize:12, outline:"none" }}
        />
        <button
          onClick={() => fetchVideos(query)}
          disabled={searching}
          style={{ padding:"7px 14px", borderRadius:8, border:"none", background: searching ? "rgba(57,154,255,0.3)" : `linear-gradient(135deg,#1a7de8,${BLUE})`, color:"var(--text-primary)", fontFamily:FONT, fontWeight:800, fontSize:12, cursor: searching ? "not-allowed":"pointer", flexShrink:0, display:"flex", alignItems:"center", gap:6 }}>
          {searching
            ? <><div style={{ width:12,height:12,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.75s linear infinite" }}/> …</>
            : <>🔍 Search</>}
        </button>
      </div>

      {/* ── MAIN BODY: video left, playlist right ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* LEFT: Player + meta + filters */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", padding:"10px 10px 10px 12px", minWidth:0 }}>

          {activeVideo && (
            <>
              {/* ── Embed — capped height so it never fills the whole screen ── */}
              <div style={{ position:"relative", width:"100%", maxHeight:"54vh", aspectRatio:"16/9", borderRadius:12, overflow:"hidden", background:"#000", marginBottom:8, boxShadow:"0 6px 30px rgba(0,0,0,0.7)", flexShrink:0 }}>
                <iframe
                  key={activeVideo.id}
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:"none" }}
                  onError={() => {
                    // Skip unavailable video, try next
                    if (activeIdx < filteredVideos.length - 1) setActiveIdx(i => i + 1);
                  }}
                />
                {/* Overlay skip button — shown if user sees unavailable error */}
                <button
                  onClick={() => { if(activeIdx < filteredVideos.length-1) setActiveIdx(i=>i+1); }}
                  style={{ position:"absolute", bottom:10, right:10, padding:"5px 12px", borderRadius:8, border:"none", background:"rgba(0,0,0,0.7)", color:"rgba(255,255,255,0.7)", fontFamily:FONT, fontWeight:700, fontSize:11, cursor:"pointer", backdropFilter:"blur(4px)" }}>
                  ⏭ Skip unavailable
                </button>
              </div>

              {/* ── Video meta — single compact row ── */}
              <div style={{ padding:"8px 12px", background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", marginBottom:8, flexShrink:0 }}>
                <div style={{ color:"var(--text-primary)", fontWeight:800, fontSize:13, lineHeight:1.35, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{activeVideo.title}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ color:BLUE, fontWeight:700, fontSize:11 }}>📺 {activeVideo.channel}</span>
                  {activeVideo.duration && <span style={{ color:"rgba(255,255,255,0.35)", fontSize:11, fontWeight:600 }}>⏱ {activeVideo.duration}</span>}
                  <span style={{ color:"rgba(255,255,255,0.22)", fontSize:10.5 }}>{profile.grade} · {profile.subjectLabel}</span>
                  <a href={`https://www.youtube.com/watch?v=${activeVideo.id}`} target="_blank" rel="noopener noreferrer"
                    style={{ marginLeft:"auto", color:"rgba(255,255,255,0.3)", fontSize:10.5, fontWeight:700, textDecoration:"none" }}>
                    ↗ YouTube
                  </a>
                </div>
              </div>

              {/* ── Filter pills — compact ── */}
              <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>
                <span style={{ color:"rgba(255,255,255,0.2)", fontSize:10, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase" }}>Filter:</span>
                {[["all","All"],["short","< 8 min"],["long","8 min+"]].map(([v,l]) => (
                  <button key={v} onClick={() => { setFilterAge(v); setActiveIdx(0); }} style={pill(filterAge===v)}>{l}</button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Playlist — fixed width, scrollable */}
        <div style={{ width:240, flexShrink:0, borderLeft:"1px solid rgba(255,255,255,0.07)", overflowY:"auto", padding:"8px 6px", background:"rgba(5,8,18,0.95)" }}>

          <div style={{ color:"rgba(255,255,255,0.25)", fontSize:10, fontWeight:800, letterSpacing:"1px", textTransform:"uppercase", padding:"3px 6px 8px" }}>
            📋 {filteredVideos.length} Video{filteredVideos.length !== 1 ? "s":""}
          </div>

          {filteredVideos.map((v, i) => (
            <button key={v.id} onClick={() => setActiveIdx(i)}
              style={{ display:"flex", gap:8, width:"100%", padding:"7px 6px", borderRadius:10, border:"none", background: i===activeIdx ? "rgba(57,154,255,0.13)" : "transparent", cursor:"pointer", textAlign:"left", marginBottom:3, outline: i===activeIdx ? `1.5px solid rgba(57,154,255,0.35)` : "none", transition:"all 0.15s" }}>

              {/* Thumbnail */}
              <div style={{ position:"relative", width:82, height:48, borderRadius:7, overflow:"hidden", flexShrink:0, background:"#111" }}>
                <img
                  src={v.thumb || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                  alt=""
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                  onError={e => { e.target.style.display="none"; }}
                />
                {v.duration && (
                  <div style={{ position:"absolute", bottom:2, right:2, background:"rgba(0,0,0,0.88)", color:"var(--text-primary)", fontSize:8.5, fontWeight:800, padding:"1px 4px", borderRadius:3 }}>
                    {v.duration}
                  </div>
                )}
                {i === activeIdx && (
                  <div style={{ position:"absolute", inset:0, background:"rgba(57,154,255,0.28)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                )}
              </div>

              {/* Title + channel */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color: i===activeIdx ? "#93c5fd" : "rgba(255,255,255,0.78)", fontSize:11, fontWeight:700, lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginBottom:3 }}>
                  {v.title}
                </div>
                <div style={{ color:"rgba(255,255,255,0.28)", fontSize:9.5, fontWeight:600 }}>{v.channel}</div>
              </div>
            </button>
          ))}

          {filteredVideos.length === 0 && (
            <div style={{ color:"rgba(255,255,255,0.22)", fontSize:11.5, textAlign:"center", padding:"24px 8px" }}>
              No videos match.<br/>Try "All".
            </div>
          )}

          {/* YouTube badge */}
          <div style={{ marginTop:12, padding:"8px 6px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <span style={{ color:"#FF0000", fontSize:11, fontWeight:900 }}>▶</span>
            <span style={{ color:"rgba(255,255,255,0.18)", fontSize:9.5, fontWeight:700 }}>Powered by YouTube</span>
          </div>
        </div>

      </div>

    </div>
  );
}

// ── Still standing teacher for video panel ──────────────────────────────────
function drawAvatarPanel(ctx, panW, H, t, talking, text, segIdx) {

  // Panel background
  const bg = ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,"#0e1c30"); bg.addColorStop(1,"#060d1a");
  ctx.fillStyle = bg; ctx.fillRect(0,0,panW,H);

  // Floor
  ctx.strokeStyle = "rgba(57,154,255,0.12)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(10,H*0.88); ctx.lineTo(panW-10,H*0.88); ctx.stroke();

  const cx = panW * 0.5;
  const fy = H * 0.87;   // feet
  const S  = H * 0.0033; // scale

  // ── Mouth open amount — ONLY animation, slow with video speed ────────────
  const mOpen = talking ? Math.abs(Math.sin(t * 2.5)) * 5.5 * S : 0;
  const blink = Math.floor(t * 1.5) % 50 > 47;

  // ── Anatomy Y (all fixed, no bob/sway) ───────────────────────────────────
  const FOOT  = fy;
  const ANKLE = fy - 13*S;
  const KNEE  = fy - 46*S;
  const HIP   = fy - 80*S;
  const WAIST = fy - 93*S;
  const BUST  = fy - 110*S;
  const SHLD  = fy - 122*S;
  const NECK  = fy - 131*S;
  const CHIN  = fy - 138*S;
  const HEAD  = fy - 155*S;

  // ── Shadow ───────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath(); ctx.ellipse(cx,FOOT+3,21*S,5*S,0,0,Math.PI*2); ctx.fill();

  // ══ SHOES ════════════════════════════════════════════════════════════════
  [[cx-10*S,-1],[cx+10*S,1]].forEach(([sx,d])=>{
    ctx.fillStyle = "#261a0f";
    ctx.beginPath();
    ctx.moveTo(sx-3*S,ANKLE); ctx.quadraticCurveTo(sx-10*S,FOOT,sx-9*S,FOOT);
    ctx.lineTo(sx+9*S,FOOT); ctx.quadraticCurveTo(sx+12*S,FOOT-4*S,sx+8*S,ANKLE);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath(); ctx.ellipse(sx-3*S,FOOT-3*S,4*S,1.5*S,-0.1,0,Math.PI*2); ctx.fill();
  });

  // ══ TROUSERS ═════════════════════════════════════════════════════════════
  const PT = "#233040";
  [[cx-2*S,-1,"left"],[cx+2*S,1,"right"]].forEach(([ox,d])=>{
    ctx.fillStyle = PT;
    ctx.beginPath();
    ctx.moveTo(ox+d*4*S, HIP+5*S);
    ctx.bezierCurveTo(ox+d*14*S,KNEE+8*S, ox+d*13*S,KNEE-8*S, ox+d*10*S,ANKLE+2*S);
    ctx.lineTo(ox+d*5*S, ANKLE+2*S);
    ctx.bezierCurveTo(ox+d*8*S,KNEE-8*S, ox+d*7*S,KNEE+8*S, ox,HIP+5*S);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle="rgba(0,0,0,0.18)"; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.moveTo(ox+d*8*S,KNEE); ctx.lineTo(ox+d*8*S,ANKLE+6*S); ctx.stroke();
  });

  // ══ BLAZER ═══════════════════════════════════════════════════════════════
  const JK="#1e3d62", JKD="#142a48", JKL="#2a5280";
  const jg = ctx.createLinearGradient(cx-18*S,SHLD,cx+18*S,WAIST);
  jg.addColorStop(0,JKL); jg.addColorStop(0.5,JK); jg.addColorStop(1,JKD);
  ctx.fillStyle = jg;
  ctx.beginPath();
  ctx.moveTo(cx-20*S,SHLD); ctx.lineTo(cx-17*S,WAIST+10*S);
  ctx.quadraticCurveTo(cx,WAIST+14*S,cx+17*S,WAIST+10*S);
  ctx.lineTo(cx+20*S,SHLD);
  ctx.quadraticCurveTo(cx+10*S,BUST-5*S,cx+6*S,NECK+5*S);
  ctx.lineTo(cx-6*S,NECK+5*S);
  ctx.quadraticCurveTo(cx-10*S,BUST-5*S,cx-20*S,SHLD);
  ctx.fill();
  // White lapels
  ctx.fillStyle = "#f0f0f0";
  ctx.beginPath(); ctx.moveTo(cx-6*S,NECK+5*S); ctx.lineTo(cx-15*S,BUST-2*S); ctx.lineTo(cx-4*S,BUST+4*S); ctx.lineTo(cx,BUST+8*S); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+6*S,NECK+5*S); ctx.lineTo(cx+15*S,BUST-2*S); ctx.lineTo(cx+4*S,BUST+4*S); ctx.lineTo(cx,BUST+8*S); ctx.closePath(); ctx.fill();
  // Gold button
  ctx.fillStyle = "#f5a623";
  ctx.beginPath(); ctx.arc(cx,WAIST+4*S,2*S,0,Math.PI*2); ctx.fill();
  // Side shadow
  ctx.fillStyle="rgba(0,0,0,0.12)";
  ctx.beginPath(); ctx.moveTo(cx+16*S,SHLD); ctx.lineTo(cx+14*S,WAIST+8*S); ctx.lineTo(cx+20*S,SHLD); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx-16*S,SHLD); ctx.lineTo(cx-14*S,WAIST+8*S); ctx.lineTo(cx-20*S,SHLD); ctx.closePath(); ctx.fill();

  // ══ ARMS — completely still ═══════════════════════════════════════════════
  ctx.lineCap="round";
  // Left arm down
  ctx.strokeStyle=JKD; ctx.lineWidth=12*S;
  ctx.beginPath(); ctx.moveTo(cx-18*S,SHLD+3*S); ctx.quadraticCurveTo(cx-25*S,WAIST,cx-22*S,HIP); ctx.stroke();
  ctx.strokeStyle="#f0f0f0"; ctx.lineWidth=9*S;
  ctx.beginPath(); ctx.moveTo(cx-22*S,HIP); ctx.lineTo(cx-21*S,HIP+9*S); ctx.stroke();
  ctx.fillStyle="#f5c9a0";
  ctx.beginPath(); ctx.ellipse(cx-20*S,HIP+13*S,4.5*S,6*S,0.1,0,Math.PI*2); ctx.fill();
  // Right arm down (or slightly forward holding marker)
  ctx.strokeStyle=JKD; ctx.lineWidth=12*S;
  ctx.beginPath(); ctx.moveTo(cx+18*S,SHLD+3*S); ctx.quadraticCurveTo(cx+25*S,WAIST,cx+22*S,HIP); ctx.stroke();
  ctx.strokeStyle="#f0f0f0"; ctx.lineWidth=9*S;
  ctx.beginPath(); ctx.moveTo(cx+22*S,HIP); ctx.lineTo(cx+21*S,HIP+9*S); ctx.stroke();
  ctx.fillStyle="#f5c9a0";
  ctx.beginPath(); ctx.ellipse(cx+20*S,HIP+13*S,4.5*S,6*S,-0.1,0,Math.PI*2); ctx.fill();

  // ══ NECK ═════════════════════════════════════════════════════════════════
  ctx.fillStyle="#f5c9a0";
  ctx.beginPath(); ctx.moveTo(cx-5*S,CHIN); ctx.lineTo(cx+5*S,CHIN); ctx.lineTo(cx+6*S,SHLD); ctx.lineTo(cx-6*S,SHLD); ctx.closePath(); ctx.fill();

  // ══ HEAD ═════════════════════════════════════════════════════════════════
  const fg=ctx.createRadialGradient(cx-3*S,HEAD-3*S,1,cx,HEAD,19*S);
  fg.addColorStop(0,"#fdecd8"); fg.addColorStop(0.65,"#f5c9a0"); fg.addColorStop(1,"#d4995a");
  ctx.fillStyle=fg;
  ctx.beginPath(); ctx.ellipse(cx,HEAD,17.5*S,20*S,0,0,Math.PI*2); ctx.fill();
  // Jaw shade
  ctx.fillStyle="rgba(0,0,0,0.06)";
  ctx.beginPath(); ctx.arc(cx,HEAD+8*S,14*S,0.1,Math.PI-0.1); ctx.fill();

  // ══ HAIR ═════════════════════════════════════════════════════════════════
  ctx.fillStyle="#180a00";
  ctx.beginPath(); ctx.arc(cx,HEAD-2*S,19.5*S,Math.PI,Math.PI*2.1); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx-19*S,HEAD+5*S,5.5*S,15*S,-0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+19*S,HEAD+5*S,5.5*S,15*S,0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx,HEAD-2*S,19.5*S,Math.PI,0); ctx.fill();
  // Highlight
  ctx.fillStyle="#3a1800";
  ctx.beginPath(); ctx.ellipse(cx+3*S,HEAD-14*S,7.5*S,3.5*S,0.35,0,Math.PI*2); ctx.fill();

  // ══ FACE FEATURES ════════════════════════════════════════════════════════
  // Eyebrows
  ctx.strokeStyle="#291000"; ctx.lineWidth=2.2*S; ctx.lineCap="round";
  ctx.beginPath(); ctx.moveTo(cx-11*S,HEAD-10*S); ctx.quadraticCurveTo(cx-5.5*S,HEAD-14*S,cx-1*S,HEAD-11*S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+1*S,HEAD-11*S); ctx.quadraticCurveTo(cx+5.5*S,HEAD-14*S,cx+11*S,HEAD-10*S); ctx.stroke();

  // Eye whites
  ctx.fillStyle="#ffffff";
  ctx.beginPath(); ctx.ellipse(cx-7*S,HEAD-5*S,5.5*S,4*S,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+7*S,HEAD-5*S,5.5*S,4*S,0,0,Math.PI*2); ctx.fill();

  if (!blink) {
    ctx.fillStyle="#5c2e0a";
    ctx.beginPath(); ctx.arc(cx-7*S,HEAD-5*S,2.9*S,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+7*S,HEAD-5*S,2.9*S,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#0a0500";
    ctx.beginPath(); ctx.arc(cx-7*S,HEAD-5*S,1.5*S,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+7*S,HEAD-5*S,1.5*S,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.9)";
    ctx.beginPath(); ctx.arc(cx-5.7*S,HEAD-6.3*S,1.1*S,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+8.2*S,HEAD-6.3*S,1.1*S,0,Math.PI*2); ctx.fill();
  } else {
    ctx.strokeStyle="#291000"; ctx.lineWidth=1.8*S;
    ctx.beginPath(); ctx.moveTo(cx-12*S,HEAD-5*S); ctx.quadraticCurveTo(cx-7*S,HEAD-8.5*S,cx-2*S,HEAD-5*S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+2*S,HEAD-5*S); ctx.quadraticCurveTo(cx+7*S,HEAD-8.5*S,cx+12*S,HEAD-5*S); ctx.stroke();
  }
  ctx.strokeStyle="rgba(40,15,3,0.5)"; ctx.lineWidth=1.1*S;
  ctx.beginPath(); ctx.moveTo(cx-12*S,HEAD-5*S); ctx.quadraticCurveTo(cx-7*S,HEAD-10*S,cx-2*S,HEAD-5*S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+2*S,HEAD-5*S); ctx.quadraticCurveTo(cx+7*S,HEAD-10*S,cx+12*S,HEAD-5*S); ctx.stroke();

  // Nose
  ctx.strokeStyle="#c98a50"; ctx.lineWidth=1.3*S;
  ctx.beginPath(); ctx.moveTo(cx-1*S,HEAD-2*S); ctx.quadraticCurveTo(cx-4*S,HEAD+4*S,cx-3*S,HEAD+7*S); ctx.quadraticCurveTo(cx,HEAD+9*S,cx+3*S,HEAD+7*S); ctx.quadraticCurveTo(cx+4*S,HEAD+4*S,cx+1*S,HEAD-2*S); ctx.stroke();
  ctx.fillStyle="rgba(180,100,50,0.35)";
  ctx.beginPath(); ctx.arc(cx-3*S,HEAD+8*S,1.4*S,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+3*S,HEAD+8*S,1.4*S,0,Math.PI*2); ctx.fill();

  // ══ MOUTH — only animation in the whole drawing ════════════════════════
  const LIP = "#c8526a";
  if (mOpen > 0.8) {
    ctx.fillStyle="#3a1018";
    ctx.beginPath(); ctx.ellipse(cx,HEAD+14*S,6.5*S,mOpen+1.5,0,0,Math.PI*2); ctx.fill();
    if (mOpen > 2) {
      ctx.fillStyle="#ede8e0";
      ctx.fillRect(cx-5*S,HEAD+12.5*S,10*S,Math.min(mOpen*0.5,3*S));
    }
    ctx.strokeStyle=LIP; ctx.lineWidth=1.5*S;
    ctx.beginPath(); ctx.ellipse(cx,HEAD+14*S,6.5*S,mOpen+1.5,0,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-6.5*S,HEAD+14*S); ctx.quadraticCurveTo(cx,HEAD+11.5*S,cx+6.5*S,HEAD+14*S); ctx.stroke();
  } else {
    ctx.strokeStyle=LIP; ctx.lineWidth=1.9*S;
    ctx.beginPath(); ctx.arc(cx,HEAD+11*S,5.5*S,0.28,Math.PI-0.28); ctx.stroke();
    ctx.fillStyle="rgba(200,82,106,0.18)";
    ctx.beginPath(); ctx.arc(cx,HEAD+12*S,5*S,0.3,Math.PI-0.3); ctx.fill();
  }

  // Blush
  ctx.fillStyle="rgba(240,130,130,0.1)";
  ctx.beginPath(); ctx.ellipse(cx-13*S,HEAD+6*S,7.5*S,5*S,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+13*S,HEAD+6*S,7.5*S,5*S,0,0,Math.PI*2); ctx.fill();

  // Earrings
  ctx.fillStyle="#ffd700";
  ctx.beginPath(); ctx.arc(cx-18.5*S,HEAD+3*S,2.5*S,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+18.5*S,HEAD+3*S,2.5*S,0,Math.PI*2); ctx.fill();

  // ══ SEGMENT LABEL ════════════════════════════════════════════════════════
  const labels=["Introduction","Key Concepts","Explanation","Examples","Practice","Summary"];
  const lbl=labels[segIdx%6];
  const pw=panW*0.74, ph=26, px=cx-pw/2, py=WAIST+20*S;
  ctx.fillStyle="rgba(57,154,255,0.14)"; ctx.strokeStyle="rgba(57,154,255,0.38)"; ctx.lineWidth=1;
  ctx.beginPath(); safeRoundRect(ctx,px,py,pw,ph,13); ctx.fill(); ctx.stroke();
  ctx.fillStyle="#93c5fd"; ctx.font="bold 11px Nunito,sans-serif"; ctx.textAlign="center";
  ctx.fillText(lbl, cx, py+17);

  // ══ SPEAKING INDICATOR ═══════════════════════════════════════════════════
  if (talking) {
    const bars=9, bw=5*S, gap=3.5*S, totalW=bars*(bw+gap), bx=cx-totalW/2, baseY=py+40;
    for(let i=0;i<bars;i++){
      const h=(0.18+Math.abs(Math.sin(t*4.8+i*0.9)))*15*S;
      ctx.fillStyle=`rgba(57,154,255,${0.35+Math.abs(Math.sin(t*3.2+i))*0.55})`;
      ctx.beginPath(); safeRoundRect(ctx,bx+i*(bw+gap),baseY-h/2,bw,h,bw/2); ctx.fill();
    }
  }
}

// Groq background script loader
async function fetchLessonScript(subject, subjectLabel, topic, grade, level) {
  try {
    const res = await fetch(`${API}/api/slides`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({subject,subjectLabel,topic,grade,level,mode:"fullvideo"})
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.slides || data.slides.length < 4) return null;
    const diagMap = {mathematics:"algebra",science:"photo",english:"noun",history:"coldwar",cs:"variables",ai:"default",webdev:"default"};
    return data.slides.map(s=>({
      dur: Math.max(10, Math.ceil(((s.content||"")+" "+(s.keyPoint||"")).split(" ").filter(Boolean).length/2.2)),
      diag: diagMap[subject]||"default",
      text: (s.content||"")+(s.keyPoint?" "+s.keyPoint:"")+(s.example?" For example: "+s.example:""),
    }));
  } catch(e){ return null; }
}


// ─── FLASHCARD VIEW ──────────────────────────────────────────────────────────
function FlashcardView({ topic, grade, subject, apiUrl }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(new Set());

  useEffect(() => {
    if (topic) loadCards();
  }, [topic]);

  const loadCards = async () => {
    setLoading(true); setCards([]); setIdx(0); setFlipped(false); setDone(new Set());
    try {
      const res = await fetch(`${apiUrl}/api/flashcards`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, grade, subject, num_cards: 8 }),
      });
      const data = await res.json();
      if (data.flashcards) setCards(data.flashcards);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const next = () => { setDone(d => new Set([...d, idx])); setFlipped(false); setTimeout(() => setIdx(i => Math.min(i+1, cards.length-1)), 150); };
  const prev = () => { setFlipped(false); setTimeout(() => setIdx(i => Math.max(i-1, 0)), 150); };
  const reset = () => { setIdx(0); setFlipped(false); setDone(new Set()); };

  if (!topic) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--text-secondary)" }}>
      <div style={{ fontSize:"48px", marginBottom:"12px" }}>📇</div>
      <div style={{ fontSize:"18px", fontWeight:"600" }}>Select a topic to generate flashcards</div>
    </div>
  );

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--text-secondary)" }}>
      <div style={{ width:40, height:40, border:"3px solid rgba(57,154,255,0.3)", borderTopColor:BLUE, borderRadius:"50%", animation:"spin 0.7s linear infinite", marginBottom:16 }}/>
      <div style={{ fontWeight:"600" }}>Generating flashcards…</div>
    </div>
  );

  if (!cards.length) return null;

  const card = cards[idx];
  const progress = (done.size / cards.length) * 100;

  return (
    <div style={{ padding:"24px", maxWidth:600, margin:"0 auto", display:"flex", flexDirection:"column", gap:20, height:"100%", overflowY:"auto" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:"18px", fontWeight:"700", color:"var(--text-primary)" }}>📇 Flashcards — {topic}</div>
          <div style={{ fontSize:"13px", color:"var(--text-secondary)" }}>{idx+1} of {cards.length} • {done.size} reviewed</div>
        </div>
        <button onClick={loadCards} style={{ background:"transparent", border:`1.5px solid ${BLUE}`, borderRadius:10, padding:"6px 14px", color:BLUE, fontWeight:"600", fontSize:"13px", cursor:"pointer" }}>↺ Regenerate</button>
      </div>

      {/* Progress bar */}
      <div style={{ height:6, background:"var(--bg-tertiary)", borderRadius:99 }}>
        <div style={{ height:"100%", width:`${progress}%`, background:BLUE, borderRadius:99, transition:"width 0.4s" }}/>
      </div>

      {/* Flip card */}
      <div onClick={() => setFlipped(f => !f)} style={{ flex:1, minHeight:220, maxHeight:300, cursor:"pointer", perspective:1000 }}>
        <div style={{
          width:"100%", height:"100%", position:"relative", transformStyle:"preserve-3d",
          transition:"transform 0.5s", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>
          {/* Front */}
          <div style={{
            position:"absolute", inset:0, backfaceVisibility:"hidden",
            background:"linear-gradient(135deg,rgba(57,154,255,0.15),rgba(57,154,255,0.05))",
            border:`2px solid ${BLUE}`, borderRadius:18,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center",
          }}>
            <div style={{ fontSize:"11px", fontWeight:"700", color:BLUE, textTransform:"uppercase", letterSpacing:"1px", marginBottom:16 }}>Term / Question</div>
            <div style={{ fontSize:"20px", fontWeight:"700", color:"var(--text-primary)", lineHeight:1.4 }}>{card.front}</div>
            <div style={{ marginTop:20, fontSize:"12px", color:"var(--text-secondary)" }}>Tap to reveal answer</div>
          </div>
          {/* Back */}
          <div style={{
            position:"absolute", inset:0, backfaceVisibility:"hidden", transform:"rotateY(180deg)",
            background:"linear-gradient(135deg,rgba(34,197,94,0.12),rgba(34,197,94,0.04))",
            border:"2px solid #22c55e", borderRadius:18,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center",
          }}>
            <div style={{ fontSize:"11px", fontWeight:"700", color:"#22c55e", textTransform:"uppercase", letterSpacing:"1px", marginBottom:16 }}>Answer</div>
            <div style={{ fontSize:"17px", fontWeight:"600", color:"var(--text-primary)", lineHeight:1.5 }}>{card.back}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <button onClick={prev} disabled={idx===0} style={{ padding:"10px 24px", borderRadius:12, border:`1.5px solid ${BLUE}`, background:"transparent", color:BLUE, fontWeight:"600", fontSize:"14px", cursor:idx===0?"not-allowed":"pointer", opacity:idx===0?0.4:1 }}>← Prev</button>
        {idx < cards.length-1
          ? <button onClick={next} style={{ padding:"10px 28px", borderRadius:12, border:"none", background:BLUE, color:"white", fontWeight:"700", fontSize:"14px", cursor:"pointer" }}>Got it →</button>
          : <button onClick={reset} style={{ padding:"10px 28px", borderRadius:12, border:"none", background:"#22c55e", color:"white", fontWeight:"700", fontSize:"14px", cursor:"pointer" }}>↺ Start Over</button>
        }
      </div>

      {/* Card dots */}
      <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
        {cards.map((_, i) => (
          <div key={i} onClick={() => { setIdx(i); setFlipped(false); }} style={{
            width:10, height:10, borderRadius:"50%", cursor:"pointer",
            background: done.has(i) ? "#22c55e" : i===idx ? BLUE : "var(--bg-tertiary)",
            transition:"background 0.3s",
          }}/>
        ))}
      </div>
    </div>
  );
}

// ─── PRACTICE TEST VIEW ───────────────────────────────────────────────────────
function PracticeTestView({ topic, grade, subject, apiUrl, onScoreSave }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [scores, setScores] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (topic) loadTest();
  }, [topic]);

  const loadTest = async () => {
    setLoading(true); setQuestions([]); setQIdx(0); setSelected(null); setAnswered(false); setScores([]); setDone(false);
    try {
      const res = await fetch(`${apiUrl}/api/practice-test`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, grade, subject, num_questions: 5 }),
      });
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const answer = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    const isCorrect = opt[0] === questions[qIdx].correct;
    setScores(s => [...s, isCorrect]);
  };

  const nextQ = () => {
    if (qIdx + 1 >= questions.length) {
      setDone(true);
      const finalScores = [...scores];
      const pct = Math.round((finalScores.filter(Boolean).length / finalScores.length) * 100);
      onScoreSave?.({ topic, score: pct, date: new Date().toLocaleDateString() });
    } else {
      setQIdx(i => i+1); setSelected(null); setAnswered(false);
    }
  };

  const OPTS = { A: "#3b82f6", B: "#10b981", C: "#f59e0b", D: "#ef4444" };

  if (!topic) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--text-secondary)" }}>
      <div style={{ fontSize:"48px", marginBottom:"12px" }}>📝</div>
      <div style={{ fontSize:"18px", fontWeight:"600" }}>Select a topic to start a practice test</div>
    </div>
  );

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--text-secondary)" }}>
      <div style={{ width:40, height:40, border:"3px solid rgba(57,154,255,0.3)", borderTopColor:BLUE, borderRadius:"50%", animation:"spin 0.7s linear infinite", marginBottom:16 }}/>
      <div style={{ fontWeight:"600" }}>Generating practice test…</div>
    </div>
  );

  if (!questions.length) return null;

  if (done) {
    const correct = scores.filter(Boolean).length;
    const pct = Math.round((correct / questions.length) * 100);
    const emoji = pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "👍" : "📚";
    return (
      <div style={{ padding:"32px 24px", maxWidth:520, margin:"0 auto", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
        <div style={{ fontSize:"64px" }}>{emoji}</div>
        <div style={{ fontSize:"24px", fontWeight:"800", color:"var(--text-primary)" }}>Test Complete!</div>
        <div style={{ fontSize:"52px", fontWeight:"800", color: pct>=70?BLUE:"#f59e0b" }}>{pct}%</div>
        <div style={{ fontSize:"16px", color:"var(--text-secondary)", fontWeight:"600" }}>{correct} / {questions.length} correct on <em>{topic}</em></div>
        <div style={{ width:"100%", height:12, background:"var(--bg-tertiary)", borderRadius:99 }}>
          <div style={{ height:"100%", width:`${pct}%`, background:pct>=70?BLUE:"#f59e0b", borderRadius:99, transition:"width 1s" }}/>
        </div>
        <div style={{ display:"flex", gap:12, marginTop:8 }}>
          <button onClick={loadTest} style={{ padding:"12px 28px", borderRadius:14, border:"none", background:BLUE, color:"white", fontWeight:"700", fontSize:"15px", cursor:"pointer" }}>↺ Try Again</button>
        </div>
        {/* Answer review */}
        <div style={{ width:"100%", textAlign:"left", marginTop:8 }}>
          <div style={{ fontWeight:"700", fontSize:"14px", color:"var(--text-secondary)", marginBottom:12 }}>REVIEW</div>
          {questions.map((q, i) => (
            <div key={i} style={{ marginBottom:12, padding:"12px 16px", borderRadius:12, background:scores[i]?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)", border:`1.5px solid ${scores[i]?"#22c55e":"#ef4444"}` }}>
              <div style={{ fontWeight:"600", fontSize:"13px", color:"var(--text-primary)", marginBottom:4 }}>{i+1}. {q.question}</div>
              <div style={{ fontSize:"12px", color:scores[i]?"#22c55e":"#ef4444", fontWeight:"600" }}>
                {scores[i] ? "✓ Correct" : `✗ Correct: ${q.correct}`}
              </div>
              <div style={{ fontSize:"12px", color:"var(--text-secondary)", marginTop:4 }}>{q.explanation}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[qIdx];
  const progress = ((qIdx) / questions.length) * 100;

  return (
    <div style={{ padding:"24px", maxWidth:600, margin:"0 auto", display:"flex", flexDirection:"column", gap:20, height:"100%", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:"17px", fontWeight:"700", color:"var(--text-primary)" }}>📝 Practice Test — {topic}</div>
        <div style={{ fontSize:"13px", color:"var(--text-secondary)", fontWeight:"600" }}>Q{qIdx+1} of {questions.length}</div>
      </div>
      <div style={{ height:6, background:"var(--bg-tertiary)", borderRadius:99 }}>
        <div style={{ height:"100%", width:`${progress}%`, background:BLUE, borderRadius:99, transition:"width 0.4s" }}/>
      </div>
      <div style={{ background:"var(--bg-secondary)", borderRadius:16, padding:"20px 24px", border:`1.5px solid rgba(57,154,255,0.2)` }}>
        <div style={{ fontSize:"17px", fontWeight:"700", color:"var(--text-primary)", lineHeight:1.5 }}>{q.question}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {q.options.map((opt) => {
          const letter = opt[0];
          const isSelected = selected === opt;
          const isCorrect = answered && letter === q.correct;
          const isWrong = answered && isSelected && letter !== q.correct;
          return (
            <button key={opt} onClick={() => answer(opt)} disabled={answered} style={{
              padding:"14px 18px", borderRadius:12, border:`2px solid ${isCorrect?"#22c55e":isWrong?"#ef4444":answered?"var(--border-color)":OPTS[letter]+"66"}`,
              background: isCorrect?"rgba(34,197,94,0.1)":isWrong?"rgba(239,68,68,0.1)":"var(--bg-secondary)",
              color:"var(--text-primary)", fontWeight:"600", fontSize:"15px", cursor:answered?"default":"pointer",
              textAlign:"left", transition:"all 0.2s", transform: isSelected?"scale(1.01)":"scale(1)",
            }}>
              <span style={{ fontWeight:"800", color:isCorrect?"#22c55e":isWrong?"#ef4444":OPTS[letter], marginRight:10 }}>{letter}</span>
              {opt.slice(3)}
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ padding:"14px 18px", borderRadius:12, background:"rgba(57,154,255,0.08)", border:`1.5px solid rgba(57,154,255,0.3)` }}>
          <div style={{ fontSize:"13px", fontWeight:"700", color:BLUE, marginBottom:4 }}>{selected?.[0]===q.correct?"✓ Correct!":"✗ Incorrect"}</div>
          <div style={{ fontSize:"13px", color:"var(--text-secondary)" }}>{q.explanation}</div>
        </div>
      )}
      {answered && (
        <button onClick={nextQ} style={{ padding:"12px", borderRadius:12, border:"none", background:BLUE, color:"white", fontWeight:"700", fontSize:"15px", cursor:"pointer" }}>
          {qIdx+1 >= questions.length ? "See Results" : "Next Question →"}
        </button>
      )}
    </div>
  );
}

// ─── PROGRESS VIEW ────────────────────────────────────────────────────────────
function ProgressView({ subject, grade }) {
  const key = "ai_tutor_progress_v2";
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { lessons: [], tests: [], streak: 0, lastDate: null };

  const lessons = data.lessons || [];
  const tests = data.tests || [];
  const totalLessons = lessons.length;
  const avgScore = tests.length ? Math.round(tests.reduce((a,t)=>a+t.score,0)/tests.length) : null;
  const streak = data.streak || 0;

  // Subject distribution
  const subjectCounts = {};
  lessons.forEach(l => { subjectCounts[l.subject] = (subjectCounts[l.subject]||0)+1; });
  const topSubjects = Object.entries(subjectCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxCount = topSubjects[0]?.[1] || 1;

  // Recent test scores
  const recentTests = tests.slice(-8);

  return (
    <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:20, overflowY:"auto", height:"100%" }}>
      <div style={{ fontSize:"20px", fontWeight:"800", color:"var(--text-primary)" }}>📊 Learning Progress</div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {[
          { label:"Lessons", value: totalLessons, icon:"📚", color:BLUE },
          { label:"Tests Taken", value: tests.length, icon:"📝", color:"#22c55e" },
          { label:"Avg Score", value: avgScore!=null?`${avgScore}%`:"—", icon:"🏆", color:"#f59e0b" },
          { label:"Day Streak", value: streak, icon:"🔥", color:"#ef4444" },
          { label:"Topics", value: [...new Set(lessons.map(l=>l.topic))].length, icon:"🎯", color:"#8b5cf6" },
          { label:"Subjects", value: Object.keys(subjectCounts).length, icon:"🔬", color:"#06b6d4" },
        ].map(s => (
          <div key={s.label} style={{ background:"var(--bg-secondary)", borderRadius:14, padding:"16px 14px", textAlign:"center", border:`1.5px solid rgba(57,154,255,0.15)` }}>
            <div style={{ fontSize:"28px", marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:"22px", fontWeight:"800", color:s.color }}>{s.value}</div>
            <div style={{ fontSize:"11px", color:"var(--text-secondary)", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Subject bar chart */}
      {topSubjects.length > 0 && (
        <div style={{ background:"var(--bg-secondary)", borderRadius:14, padding:"18px 20px", border:`1.5px solid rgba(57,154,255,0.15)` }}>
          <div style={{ fontWeight:"700", fontSize:"14px", color:"var(--text-secondary)", marginBottom:14, textTransform:"uppercase", letterSpacing:"0.5px" }}>Topics by Subject</div>
          {topSubjects.map(([subj, count]) => (
            <div key={subj} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", fontWeight:"600", color:"var(--text-primary)", marginBottom:4 }}>
                <span>{subj}</span><span>{count}</span>
              </div>
              <div style={{ height:8, background:"var(--bg-tertiary)", borderRadius:99 }}>
                <div style={{ height:"100%", width:`${(count/maxCount)*100}%`, background:BLUE, borderRadius:99, transition:"width 1s" }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent test scores */}
      {recentTests.length > 0 && (
        <div style={{ background:"var(--bg-secondary)", borderRadius:14, padding:"18px 20px", border:`1.5px solid rgba(57,154,255,0.15)` }}>
          <div style={{ fontWeight:"700", fontSize:"14px", color:"var(--text-secondary)", marginBottom:14, textTransform:"uppercase", letterSpacing:"0.5px" }}>Recent Test Scores</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:80 }}>
            {recentTests.map((t, i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }} title={`${t.topic}: ${t.score}%`}>
                <div style={{ width:"100%", background:t.score>=70?BLUE:"#f59e0b", borderRadius:"4px 4px 0 0", height:`${(t.score/100)*70}px`, minHeight:4 }}/>
                <div style={{ fontSize:"10px", fontWeight:"700", color:"var(--text-secondary)" }}>{t.score}%</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:"12px", color:"var(--text-secondary)", marginTop:8, textAlign:"center" }}>Last {recentTests.length} tests</div>
        </div>
      )}

      {/* Recent lessons */}
      {lessons.length > 0 && (
        <div style={{ background:"var(--bg-secondary)", borderRadius:14, padding:"18px 20px", border:`1.5px solid rgba(57,154,255,0.15)` }}>
          <div style={{ fontWeight:"700", fontSize:"14px", color:"var(--text-secondary)", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.5px" }}>Recent Lessons</div>
          {lessons.slice(-5).reverse().map((l, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:i<4?"1px solid var(--border-color)":"none" }}>
              <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text-primary)" }}>{l.topic}</span>
              <span style={{ fontSize:"12px", color:"var(--text-secondary)" }}>{l.date}</span>
            </div>
          ))}
        </div>
      )}

      {lessons.length === 0 && tests.length === 0 && (
        <div style={{ textAlign:"center", color:"var(--text-secondary)", padding:"40px 0" }}>
          <div style={{ fontSize:"48px", marginBottom:12 }}>🌱</div>
          <div style={{ fontSize:"16px", fontWeight:"600" }}>Start learning to build your progress!</div>
          <div style={{ fontSize:"13px", marginTop:8 }}>Study topics, take flashcard sessions, and complete practice tests.</div>
        </div>
      )}
    </div>
  );
}

// Persist progress helper (called from SubjectPage on lesson load and test complete)
function saveProgress(type, payload) {
  const key = "ai_tutor_progress_v2";
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { lessons: [], tests: [], streak: 0, lastDate: null };

  const today = new Date().toLocaleDateString();
  if (data.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    data.streak = data.lastDate === yesterday ? (data.streak || 0) + 1 : 1;
    data.lastDate = today;
  }

  if (type === "lesson") {
    data.lessons = [...(data.lessons || []), { ...payload, date: today }].slice(-50);
  } else if (type === "test") {
    data.tests = [...(data.tests || []), { ...payload, date: today }].slice(-30);
  }
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── SUBJECT / CHAT PAGE ──────────────────────────────────────────────────────
// ─── Chip emojis for K-3 topic buttons ───────────────────────────────────────
const CHIP_EMOJIS = ["🌟","📚","🎯","💡","🔍","🎓","✏️","🧩","🚀","🎨","🌈","⭐","🏆","🔬","🌍"];

const SUBJECT_EMOJIS = {
  mathematics: "🔢",
  science: "🔬",
  english: "📖",
  history: "📜",
  civics: "🏛️",
  geography: "🌍",
  cs: "💻",
  ai: "🤖",
  webdev: "🌐"
};

function SubjectPage({ profile, onHome }) {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [listening, setListening]   = useState(false);
  const [speaking, setSpeaking]     = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [topicList, setTopicList]   = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [showTopicMenu, setShowTopicMenu] = useState(false);

  // NEW: Search, sidebar, voice state, subject switching
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [relatedTopics, setRelatedTopics] = useState([]);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [voiceState, setVoiceState] = useState("idle"); // "idle"|"listening"|"processing"|"speaking"
  const [activeSubject, setActiveSubject] = useState(profile.subject);

  // Chat history & usage counter
  const [showHistory, setShowHistory] = useState(false);
  const usageCounterRef = useRef(null);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  // Debug log - ensure subject is set correctly
  useEffect(() => {
    console.log("SubjectPage mounted with profile.subject:", profile.subject);
    console.log("activeSubject initialized as:", profile.subject);
  }, []);

  // Sync activeSubject with profile changes (handles back-to-home + re-enter)
  useEffect(() => {
    console.log("Profile changed. New subject:", profile.subject);
    setActiveSubject(profile.subject);
  }, [profile.subject]);

  // Video view state
  const [viewMode, setViewMode] = useState("lesson"); // "lesson" | "videos" | "flashcards" | "practice" | "progress"
  const [videoList, setVideoList] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null); // For modal video player

  // Grade helpers
  const isEarlyGrade = ["Grade 1","Grade 2","Grade 3"].includes(profile.grade);
  const topicListFallback = GRADE_TOPICS[activeSubject]?.[profile.grade] || [];

  // Load topics from MCP on mount
  useEffect(() => {
    loadTopics();
  }, []);

  // Voice recognition setup
  const recRef = useRef(null);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  const scrollRef  = useRef(null);
  const bottomRef  = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      console.log("Voice listening started");
      setListening(true);
      setVoiceState("listening");
    };

    rec.onresult = e => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(" ");

      console.log("Voice result:", transcript, "Final:", e.isFinal);

      // If topic is selected, use chat input. Otherwise, use search query.
      if (activeTopic) {
        setInput(transcript);
        if (e.isFinal) {
          setVoiceState("idle");
          setListening(false);
          setTimeout(() => sendText(transcript), 300);
        }
      } else {
        // We're in topic search mode
        setSearchQuery(transcript);
        if (e.isFinal) {
          setVoiceState("idle");
          setListening(false);
          // Auto-select if only one match
          const filtered = topicList.filter(topic =>
            topic.toLowerCase().includes(transcript.toLowerCase())
          );
          if (filtered.length === 1) {
            setTimeout(() => chooseTopic(filtered[0]), 300);
          }
        }
      }
    };

    rec.onend = () => {
      console.log("Voice recognition ended");
      setListening(false);
      setVoiceState("idle");
    };

    rec.onerror = (e) => {
      console.error("Voice error:", e.error);
      setListening(false);
      setVoiceState("idle");

      const errorMessages = {
        "no-speech": "😶 No speech detected. Please speak louder or closer to the microphone.",
        "network": "🌐 Network error. Check your internet connection.",
        "not-allowed": "🔒 Microphone permission denied. Please allow microphone access in browser settings.",
        "audio-capture": "🎙️ Microphone not found. Check if it's connected.",
        "permission-denied": "🔒 Microphone access denied. Enable in your browser settings.",
        "default": "⚠️ Voice input error. Please try again or type instead."
      };

      const message = errorMessages[e.error] || errorMessages["default"];
      console.log("Showing error:", message);
      // Show error in a subtle way - in console and log
      if (activeTopic) {
        setMessages(m => [...m, { role:"bot", content: `Voice input failed: ${message}` }]);
      }
    };

    recRef.current = rec;
  }, [activeTopic, topicList]);

  // Text-to-speech function
  const speakResponse = (text) => {
    if (!synth || !speakerEnabled) return;

    // Toggle: if already speaking, stop it
    if (voiceState === "speaking") {
      synth.cancel();
      setVoiceState("idle");
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => setVoiceState("idle");
    synth.speak(utterance);
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recRef.current) {
      console.error("Voice recognition not available");
      if (activeTopic) {
        const errorMsg = { role:"bot", content: "🌐 Voice recognition not supported in this browser. Try Chrome, Edge, or Firefox." };
        setMessages(m => [...m, errorMsg]);
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setMessages(m => m.filter(msg => msg !== errorMsg));
        }, 5000);
      }
      return;
    }
    if (listening) {
      recRef.current.stop();
      setListening(false);
      setVoiceState("idle");
    } else {
      // Clear input only in search mode (not in chat)
      if (!activeTopic) {
        setSearchQuery("");
      }
      try {
        // Check microphone access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
              console.log("Microphone access granted, starting voice input");
              recRef.current.start();
              setListening(true);
              setVoiceState("listening");
            })
            .catch((err) => {
              console.error("Microphone access denied:", err);
              setListening(false);
              setVoiceState("idle");
              if (activeTopic) {
                const errorMsg = { role:"bot", content: "🔒 Microphone access denied. Please enable microphone in browser settings." };
                setMessages(m => [...m, errorMsg]);
                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                  setMessages(m => m.filter(msg => msg !== errorMsg));
                }, 5000);
              }
            });
        } else {
          recRef.current.start();
          setListening(true);
          setVoiceState("listening");
        }
      } catch (err) {
        console.error("Voice input error:", err);
        setListening(false);
        setVoiceState("idle");
      }
    }
  };

  // Semantic search: use Voyage AI when query >= 3 chars, else simple filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTopics([]);
      return;
    }
    if (searchQuery.length < 3) {
      setFilteredTopics(topicList.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return;
    }
    const subjectToQuery = activeSubject === "custom" ? profile.subjectLabel : activeSubject;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/semantic/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery, subject: subjectToQuery, grade: profile.grade, top_k: 8 })
        });
        const data = await res.json();
        if (data.success && data.results?.length) {
          setFilteredTopics(data.results.map(r => r.topic));
        } else {
          setFilteredTopics(topicList.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        }
      } catch {
        setFilteredTopics(topicList.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, topicList, activeSubject, profile.subjectLabel, profile.grade]);

  // NEW: Load topics when active subject changes
  useEffect(() => {
    const loadTopicsForSubject = async () => {
      const subjectToQuery = activeSubject === "custom" ? profile.subjectLabel : activeSubject;
      setTopicList([]);
      setTopicsLoading(true);
      try {
        const res = await fetch(`${API}/api/mcp/get-topics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: subjectToQuery, grade: profile.grade })
        });
        if (!res.ok) { setTopicsLoading(false); return; }
        const data = await res.json();
        const topics = data.topics || [];
        setTopicList(topics);
        fetch(`${API}/api/semantic/embed-topics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: subjectToQuery, grade: profile.grade, topics })
        }).catch(() => {});
      } catch (e) {
        // keep empty, skeleton will show retry option
      } finally {
        setTopicsLoading(false);
      }
    };
    loadTopicsForSubject();
  }, [activeSubject, profile.grade, topicListFallback, profile.subjectLabel]);

  // NEW: Reset search when topic is selected
  useEffect(() => {
    if (activeTopic) {
      setSearchQuery("");
      setShowTopicMenu(false);
    }
  }, [activeTopic]);

  // Get available topics using MCP (for initial load)
  const loadTopics = async () => {
    setTopicsLoading(true);
    try {
      const subjectToQuery = activeSubject === "custom" ? profile.subjectLabel : activeSubject;
      const res = await fetch(`${API}/api/mcp/get-topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subjectToQuery, grade: profile.grade })
      });
      if (!res.ok) { setTopicsLoading(false); return; }
      const data = await res.json();
      setTopicList(data.topics || []);
    } catch (e) {
      // keep empty
    } finally {
      setTopicsLoading(false);
    }
  };

  // Explain a topic using MCP
  const explainTopic = async (topic) => {
    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      }));
      const res = await fetch(`${API}/api/mcp/explain-topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: activeSubject,
          grade: profile.grade,
          topic: topic,
          history
        })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  };

  // Get practice question using MCP
  const getPracticeQuestion = async (topic) => {
    try {
      const res = await fetch(`${API}/api/mcp/practice-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: activeSubject,
          grade: profile.grade,
          topic: topic
        })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  };

  const fetchVideosForTopic = async (topic) => {
    setLoadingVideos(true);
    try {
      const res = await fetch(`${API}/api/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          query: `${topic} for ${profile.grade} ${activeSubject} students`,
          grade: profile.grade,
          subject: activeSubject
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVideoList(data.videos || []);
      }
    } catch (err) {
      console.error("Video fetch error:", err);
      setVideoList([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Grade-aware content formatting
  const getGradeLevel = () => {
    const gradeStr = profile.grade || "Grade 6";
    return parseInt(gradeStr.replace(/\D/g, "")) || 6;
  };

  const formatContentForGrade = (content) => {
    const gradeNum = getGradeLevel();

    // For K-3 (grades 1-3): Simplify and shorten
    if (gradeNum <= 3) {
      // Truncate to first 250 characters
      const simplified = content.substring(0, 250);
      return simplified.length < content.length ? simplified + "..." : simplified;
    }

    // For grades 4+: Keep full content as-is
    return content;
  };

  const formatSectionForGrade = (section) => {
    const gradeNum = getGradeLevel();

    if (!section) return "";

    // For K-3: Limit to 150 characters
    if (gradeNum <= 3) {
      const truncated = section.substring(0, 150);
      return truncated.length < section.length ? truncated + "..." : truncated;
    }

    return section;
  };

  const getMessageStyles = () => {
    const gradeNum = getGradeLevel();

    if (gradeNum <= 3) {
      return {
        fontSize: "16px",
        lineHeight: "1.8",
        fontWeight: "500"
      };
    }

    return {
      fontSize: "14px",
      lineHeight: "1.6",
      fontWeight: "400"
    };
  };

  // Choose a topic and start the lesson — streams text word by word
  const chooseTopic = (topic) => {
    setActiveTopic(topic);
    setShowTopicMenu(false);
    setRelatedTopics([]);
    setMessages([{ role: "bot", topic, content: "", sections: null, streaming: true }]);
    setLoading(false);
    setVoiceState("idle");
    saveProgress("lesson", { topic, subject: activeSubject });

    (async () => {
      try {
        const history = messages.slice(-6).map(m => ({
          role: m.role === 'bot' ? 'assistant' : 'user',
          content: m.content
        }));

        const res = await fetch(`${API}/api/mcp/explain-topic-stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: activeSubject, grade: profile.grade, topic, history })
        });

        if (!res.ok) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep incomplete line in buffer
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6);
            if (payload === '[DONE]') break;
            try {
              const parsed = JSON.parse(payload);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages([{ role: 'bot', topic, content: accumulated, sections: null, streaming: true }]);
              }
            } catch {}
          }
        }

        // Streaming done — parse sections so formatted layout renders
        const sections = parseSections(accumulated);
        setMessages([{ role: 'bot', topic, content: accumulated, sections, streaming: false }]);

        // Load related topics via Voyage AI semantic search
        const subjectForRelated = activeSubject === "custom" ? profile.subjectLabel : activeSubject;
        try {
          const relRes = await fetch(`${API}/api/semantic/related`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: topic, subject: subjectForRelated, grade: profile.grade, top_k: 4 })
          });
          const relData = await relRes.json();
          if (relData.success && relData.results?.length) {
            setRelatedTopics(relData.results.map(r => r.topic));
          } else {
            setRelatedTopics([]);
          }
        } catch { setRelatedTopics([]); }

        const studentId = profile.grade || "student";
        // Increment usage
        try {
          const res2 = await fetch(`${API}/api/increment-usage`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: studentId, lesson_type: "lesson" })
          });
          const result = await res2.json();
          if (result.exceeded) {
            setLimitExceeded(true);
            setLimitMessage(`⚠️ Daily limit reached! You've used ${result.usage_count}/${result.limit} lessons today.`);
          }
          setTimeout(() => { if (usageCounterRef.current) usageCounterRef.current.refresh(); }, 100);
        } catch {}

        // Save chat
        try {
          await fetch(`${API}/api/save-chat`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: studentId, topic, grade_level: profile.grade,
              subject: profile.subject || "General",
              request_data: { topic },
              response_preview: accumulated.substring(0, 200),
              response_content: accumulated
            })
          });
        } catch {}

      } catch {
        setMessages([{ role: "bot", content: "Could not load topic. Please try again." }]);
      }
    })();
  };

  // Send text message (from input or voice)
  const sendText = (text) => {
    if (!text.trim()) return;
    setInput("");
    setMessages(m => [...m, { role:"user", content: text }]);
    setLoading(true);
    setVoiceState("processing");

    // Check if user is asking for practice question
    if (text.toLowerCase().includes("practice") || text.toLowerCase().includes("question")) {
      getPracticeQuestion(activeTopic || "General").then(data => {
        if (data) {
          const question = data.question || "Question loading...";
          setMessages(m => [...m, { role:"bot", content: question }]);
          setVoiceState("idle");
        } else {
          const msg = "Could not generate practice question.";
          setMessages(m => [...m, { role:"bot", content: msg }]);
          setVoiceState("idle");
        }
      }).finally(() => { setLoading(false); });
    } else {
      // For general questions, use explain-topic with the user input
      explainTopic(text).then(data => {
        if (data) {
          const response = data.explanation || "Response loading...";
          const botMessage = {
            role: "bot",
            topic: text,
            content: response,
            sections: data.sections || null
          };
          setMessages(m => [...m, botMessage]);
          setVoiceState("idle");

          // Save to chat history and increment usage
          const chatContent = response || "";
          const studentId = profile.grade || "student";
          console.log("[AI-Tutor] Saving chat with content length:", chatContent.length);
          console.log("[AI-Tutor] API URL:", API);
          console.log("[AI-Tutor] Student ID:", studentId);

          // Increment usage and refresh counter
          const incrementUsage = async () => {
            try {
              console.log("[AI-Tutor] Calling increment-usage...");
              const res = await fetch(`${API}/api/increment-usage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  student_id: studentId,
                  lesson_type: "lesson"
                })
              });
              const data = await res.json();
              console.log("[AI-Tutor] Usage incremented response:", data);

              // Check if limit is exceeded
              if (data.exceeded) {
                setLimitExceeded(true);
                setLimitMessage(`⚠️ Daily limit reached! You've used ${data.usage_count}/${data.limit} lessons today. Please try again tomorrow.`);
                console.log("[AI-Tutor] Daily limit exceeded:", data);
              }

              // Refresh counter after successful increment
              setTimeout(() => {
                console.log("[AI-Tutor] Refreshing counter, ref current:", usageCounterRef.current);
                if (usageCounterRef.current) {
                  usageCounterRef.current.refresh();
                  console.log("[AI-Tutor] Counter refresh called");
                } else {
                  console.error("[AI-Tutor] usageCounterRef.current is null");
                }
              }, 100);
            } catch (e) {
              console.error("[AI-Tutor] Usage increment error:", e);
            }
          };

          // Save chat
          const saveChat = async () => {
            try {
              console.log("[AI-Tutor] Calling save-chat...");
              const res = await fetch(`${API}/api/save-chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  student_id: studentId,
                  topic: text,
                  grade_level: profile.grade,
                  subject: profile.subject || "General",
                  request_data: { question: text },
                  response_preview: chatContent.substring(0, 200),
                  response_content: chatContent
                })
              });
              const data = await res.json();
              console.log("[AI-Tutor] Chat saved response:", data);
            } catch (e) {
              console.error("[AI-Tutor] Save chat error:", e);
            }
          };

          // Call both
          incrementUsage();
          saveChat();
        } else {
          const msg = "Could not process your question. Try again.";
          setMessages(m => [...m, { role:"bot", content: msg }]);
          setVoiceState("idle");
        }
      }).finally(() => { setLoading(false); });
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior:"smooth" });
    }
  }, [messages]);

  const subjectEmoji = SUBJECT_EMOJIS[profile.subject] || "📚";

  // Return the redesigned student-friendly interface
  return (
    <div style={{ position:"relative", height:"100vh", display:"flex", flexDirection:"column", background:"var(--bg-primary)" }}>
      {/* Header - Colorful and engaging */}
      <div style={{
        padding:"16px 20px",
        background:`linear-gradient(135deg, ${BLUE} 0%, #5b9cff 100%)`,
        color:"var(--text-primary)",
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        boxShadow:"0 4px 12px rgba(57,154,255,0.3)"
      }}>
        <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              background:"rgba(255,255,255,0.2)",
              border:"none",
              cursor:"pointer",
              fontSize:"24px",
              padding:"8px",
              borderRadius:"8px",
              transition:"all 0.2s",
              width:"40px",
              height:"40px",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
            title="Switch subject"
          >
            ☰
          </button>
          <button
            onClick={onHome}
            style={{
              background:"rgba(255,255,255,0.2)",
              border:"none",
              cursor:"pointer",
              fontSize:"24px",
              padding:"8px",
              borderRadius:"8px",
              transition:"all 0.2s",
              width:"40px",
              height:"40px",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
            title="Go home"
          >
            ←
          </button>
          <div>
            <div style={{ fontSize:"18px", fontWeight:"900", marginBottom:"4px" }}>
              {SUBJECT_EMOJIS[activeSubject] || "📚"} {activeSubject === "custom" ? profile.subjectLabel : (SUBJECTS[activeSubject]?.label || "Unknown Subject")}
            </div>
            <div style={{ fontSize:"12px", opacity:0.9 }}>{profile.grade}</div>
          </div>
        </div>

        {/* Right Controls: History, Usage Counter, Voice */}
        <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          {/* History Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background:"rgba(255,255,255,0.2)",
              border:"none",
              cursor:"pointer",
              fontSize:"18px",
              padding:"8px 12px",
              borderRadius:"8px",
              transition:"all 0.2s",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              color:"var(--text-primary)",
              fontWeight:"600"
            }}
            title="Chat history"
          >
            📋
          </button>

          {/* Usage Counter */}
          <UsageCounter
            ref={usageCounterRef}
            apiUrl={API}
            studentId={profile.grade || "student"}
            lessonType="lesson"
          />

          {/* Voice State Indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", fontWeight:"600" }}>
            <div style={{
              width:"8px",
              height:"8px",
              borderRadius:"50%",
              background:voiceState === "listening" ? "#ef4444" : voiceState === "processing" ? "#3b82f6" : voiceState === "speaking" ? "#10b981" : "#94a3b8",
              animation:voiceState === "listening" ? "pulse 1s infinite" : "none"
            }}/>
            <span style={{ display:activeTopic ? "inline" : "none", opacity:0.9 }}>
              {voiceState === "listening" ? "Listening" : voiceState === "processing" ? "Processing" : voiceState === "speaking" ? "Speaking" : ""}
            </span>
          </div>

          {/* Speaker Toggle */}
          <button
            onClick={() => setSpeakerEnabled(!speakerEnabled)}
            style={{
              background:"rgba(255,255,255,0.2)",
              border:"none",
              cursor:"pointer",
              fontSize:"20px",
              padding:"8px",
              borderRadius:"8px",
              transition:"all 0.2s",
              width:"40px",
              height:"40px",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              opacity:speakerEnabled ? 1 : 0.5
            }}
            title={speakerEnabled ? "Mute speaker" : "Unmute speaker"}
          >
            {speakerEnabled ? "🔊" : "🔇"}
          </button>
        </div>

      </div>

      {/* Subject Switching Sidebar */}
      {showSidebar && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowSidebar(false)}
            style={{
              position:"fixed",
              inset:0,
              background:"rgba(0,0,0,0.3)",
              zIndex:999,
              animation:"fadeIn 0.2s ease"
            }}
          />

          {/* Sidebar Panel */}
          <div
            style={{
              position:"fixed",
              left:0,
              top:60,
              width:280,
              height:"calc(100vh - 60px)",
              background:"var(--bg-primary)",
              boxShadow:"2px 0 12px rgba(0,0,0,0.15)",
              overflowY:"auto",
              zIndex:1000,
              animation:"slideIn 0.3s ease",
              display:"flex",
              flexDirection:"column",
              padding:"20px"
            }}
          >
            {/* Sidebar Search Bar */}
            <div style={{ position:"relative", marginBottom:"16px" }}>
              <input
                type="text"
                value={sidebarSearchQuery}
                onChange={(e) => setSidebarSearchQuery(e.target.value)}
                placeholder="🔍 Search subjects..."
                style={{
                  width:"100%",
                  padding:"10px 35px 10px 12px",
                  border:`2px solid ${BORDER}`,
                  borderRadius:"8px",
                  fontSize:"13px",
                  fontFamily:FONT,
                  fontWeight:"500",
                  outline:"none",
                  transition:"all 0.2s",
                  boxSizing:"border-box",
                  background:"var(--bg-secondary)",
                  color:"var(--text-primary)"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = BLUE;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = BORDER;
                }}
              />
              {sidebarSearchQuery && (
                <button
                  onClick={() => setSidebarSearchQuery("")}
                  style={{
                    position:"absolute",
                    right:"8px",
                    top:"50%",
                    transform:"translateY(-50%)",
                    background:"none",
                    border:"none",
                    cursor:"pointer",
                    fontSize:"14px",
                    color:"var(--text-secondary)"
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ fontSize:"12px", fontWeight:"600", color:"var(--text-secondary)", marginBottom:"12px", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              Subjects
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {ALL_SUBJECTS.filter(subject =>
                subject.id !== "custom" && subject.label.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
              ).map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => {
                    setActiveSubject(subject.id);
                    setShowSidebar(false);
                    setActiveTopic(null);
                    setMessages([]);
                    setSearchQuery("");
                    setViewMode("lesson");
                    setVideoList([]);
                  }}
                  style={{
                    padding:"14px 12px",
                    borderRadius:"12px",
                    border:activeSubject === subject.id ? `2px solid ${BLUE}` : `1px solid var(--border-color)`,
                    background:activeSubject === subject.id ? "var(--blue-xlight)" : "var(--bg-secondary)",
                    cursor:"pointer",
                    transition:"all 0.2s",
                    display:"flex",
                    gap:"10px",
                    alignItems:"center",
                    fontWeight:"600",
                    color:"var(--text-primary)"
                  }}
                  onMouseEnter={(e) => {
                    if (activeSubject !== subject.id) {
                      e.target.style.background = "var(--bg-tertiary)";
                      e.target.style.transform = "translateX(4px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSubject !== subject.id) {
                      e.target.style.background = "var(--bg-secondary)";
                      e.target.style.transform = "translateX(0)";
                    }
                  }}
                >
                  <span style={{ fontSize:"22px" }}>{SUBJECT_EMOJIS[subject.id] || "📚"}</span>
                  <span style={{ fontSize:"13px", fontWeight:"600" }}>{subject.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Professional Search Bar for Topics */}
      {!activeTopic && (
        <div style={{
          padding:"20px",
          borderBottom:"2px solid rgba(57,154,255,0.2)"
        }}>
          {/* Search Input with Voice Controls */}
          <div style={{ position:"relative", marginBottom: searchQuery && filteredTopics.length > 0 ? "12px" : 0 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search topics..."
              style={{
                width:"100%",
                padding:"14px 40px 14px 40px",
                border:`2px solid ${BORDER}`,
                borderRadius:"12px",
                fontSize:"15px",
                fontFamily:FONT,
                fontWeight:"500",
                outline:"none",
                transition:"all 0.2s",
                boxSizing:"border-box",
                paddingRight:"100px",
                background:"var(--bg-secondary)",
                color:"var(--text-primary)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = BLUE;
                e.target.style.boxShadow = "0 4px 12px rgba(57,154,255,0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = BORDER;
                e.target.style.boxShadow = "none";
              }}
            />

            {/* Voice Controls inside Search Bar */}
            <div style={{
              position:"absolute",
              right:"10px",
              top:"50%",
              transform:"translateY(-50%)",
              display:"flex",
              gap:"6px",
              alignItems:"center"
            }}>
              {/* Search Button */}
              {searchQuery && (
                <button
                  onClick={() => {
                    const match = filteredTopics.find(t => t.toLowerCase() === searchQuery.toLowerCase());
                    if (match) {
                      chooseTopic(match);
                    } else if (filteredTopics.length > 0) {
                      chooseTopic(filteredTopics[0]);
                    } else {
                      // Treat any text as a topic/question
                      chooseTopic(searchQuery);
                    }
                  }}
                  style={{
                    background:BLUE,
                    border:"none",
                    borderRadius:"8px",
                    cursor:"pointer",
                    padding:"8px 10px",
                    fontSize:"16px",
                    transition:"all 0.2s",
                    color:"var(--text-primary)",
                    fontWeight:"600",
                    minWidth:"40px",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center"
                  }}
                  title="Search topic"
                >
                  🔍
                </button>
              )}

              {/* Microphone Button for Voice Search */}
              <button
                onClick={toggleVoiceInput}
                style={{
                  background:voiceState === "listening" ? "#ef4444" : voiceState === "processing" ? "#3b82f6" : "#e0e8f3",
                  border:"none",
                  borderRadius:"8px",
                  cursor:"pointer",
                  padding:"10px 12px",
                  fontSize:"14px",
                  fontWeight:"600",
                  transition:"all 0.2s",
                  color:"var(--text-primary)",
                  minWidth:"44px",
                  height:"44px",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  boxShadow:voiceState === "listening" ? "0 0 12px rgba(239,68,68,0.4)" : "none"
                }}
                title={voiceState === "listening" ? "Listening... Click to stop" : "Click to speak or speak a topic"}
              >
                {voiceState === "listening" ? (
                  <span style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "white",
                    animation: "pulse 1s infinite",
                    marginRight: "4px"
                  }}></span>
                ) : null}
                🎤
              </button>

              {/* Clear Button */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    background:"none",
                    border:"none",
                    cursor:"pointer",
                    fontSize:"16px",
                    color:"var(--text-secondary)",
                    padding:"4px 6px",
                    transition:"all 0.2s"
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Topic Dropdown Grid */}
          {searchQuery && filteredTopics.length > 0 && (
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",
              gap:"10px",
              maxHeight:"300px",
              overflowY:"auto",
              padding:"12px",
              background:"var(--bg-secondary)",
              border:`1.5px solid ${BORDER}`,
              borderRadius:"12px",
              marginTop:"0px"
            }}>
              {filteredTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => chooseTopic(topic)}
                  style={{
                    padding:"12px 10px",
                    background:"var(--bg-secondary)",
                    border:`1px solid ${BORDER}`,
                    borderRadius:"10px",
                    cursor:"pointer",
                    fontSize:"13px",
                    fontWeight:"600",
                    color:"var(--text-primary)",
                    transition:"all 0.2s",
                    textAlign:"center",
                    lineHeight:"1.4"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--bg-tertiary)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(57,154,255,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "var(--bg-secondary)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {CHIP_EMOJIS[i % CHIP_EMOJIS.length]} {topic}
                </button>
              ))}
            </div>
          )}

          {/* Show all topics if no search query */}
          {!searchQuery && (
            topicsLoading ? (
              /* ── Hero cards while topics load ── */
              <div style={{ marginTop:"12px" }}>
                <div style={{ fontSize:"11px", color:"var(--text-secondary)", textAlign:"center", marginBottom:"10px", letterSpacing:"1px", textTransform:"uppercase" }}>
                  🇮🇳 India's Greatest Minds — Be Inspired!
                </div>
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))",
                  gap:"12px",
                }}>
                  {[
                    { img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/200px-A._P._J._Abdul_Kalam.jpg",  name:"APJ Abdul Kalam",  role:"Scientist & President",       quote:"Dream, dream, dream!",                  color:"#1a3a5c" },
                    { img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Srinivasa_Ramanujan_-_OPC_-_1.jpg/200px-Srinivasa_Ramanujan_-_OPC_-_1.jpg", name:"Ramanujan",        role:"Mathematics Genius",          quote:"Numbers were his best friends.",        color:"#1a2e1a" },
                    { img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/CV_Raman_photo.jpg/200px-CV_Raman_photo.jpg",               name:"C.V. Raman",       role:"Nobel Prize — Physics",        quote:"Curiosity led him to light.",           color:"#2e1a1a" },
                    { img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Vikram_Sarabhai.jpg/200px-Vikram_Sarabhai.jpg",             name:"Vikram Sarabhai",  role:"Father of ISRO",              quote:"He put India in space.",                color:"#1a1a3a" },
                    { img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Savitribai_Phule.jpg/200px-Savitribai_Phule.jpg",           name:"Savitribai Phule", role:"India's First Teacher",       quote:"She fought so you could study.",        color:"#2e1a2e" },
                    { img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Homi_Jehangir_Bhabha_1960s.jpg/200px-Homi_Jehangir_Bhabha_1960s.jpg", name:"Homi Bhabha",  role:"Father of Nuclear Science",   quote:"Science is India's strength.",         color:"#1a2e2e" },
                    { img:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shakuntala_Devi_2013_stamp_of_India.jpg/200px-Shakuntala_Devi_2013_stamp_of_India.jpg", name:"Shakuntala Devi", role:"Human Computer", quote:"Faster than any machine!",             color:"#2e2a10" },
                    { img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Kalpana_Chawla%2C_NASA_photo_portrait_in_orange_suit.jpg/200px-Kalpana_Chawla%2C_NASA_photo_portrait_in_orange_suit.jpg", name:"Kalpana Chawla", role:"First Indian Woman in Space", quote:"Stars were just the beginning.",        color:"#1a1a2e" },
                  ].map((hero, i) => (
                    <div key={i} style={{
                      borderRadius:"14px",
                      background:hero.color,
                      border:`1px solid ${BORDER}`,
                      overflow:"hidden",
                      display:"flex",
                      flexDirection:"column",
                      alignItems:"center",
                      animation:`fadeIn 0.5s ${i * 0.1}s both`,
                      cursor:"default",
                      userSelect:"none",
                    }}>
                      <img
                        src={hero.img}
                        alt={hero.name}
                        style={{ width:"100%", height:"140px", objectFit:"cover", objectPosition:"center top" }}
                        onError={e => { e.target.style.display="none"; }}
                      />
                      <div style={{ padding:"10px 10px 12px", textAlign:"center" }}>
                        <div style={{ fontSize:"13px", fontWeight:"700", color:"#fff", marginBottom:"2px" }}>{hero.name}</div>
                        <div style={{ fontSize:"10px", color:"#399aff", fontWeight:"600", marginBottom:"6px" }}>{hero.role}</div>
                        <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)", fontStyle:"italic", lineHeight:"1.4" }}>"{hero.quote}"</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Regular topic chips after API responds ── */
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",
                gap:"10px",
                maxHeight:"250px",
                overflowY:"auto",
                padding:"12px",
                background:"var(--bg-secondary)",
                border:`1.5px solid ${BORDER}`,
                borderRadius:"12px",
                marginTop:"12px"
              }}>
                {topicList.slice(0, 12).map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => chooseTopic(topic)}
                    style={{
                      padding:"12px 10px",
                      background:"var(--bg-secondary)",
                      border:`1px solid ${BORDER}`,
                      borderRadius:"10px",
                      cursor:"pointer",
                      fontSize:"13px",
                      fontWeight:"600",
                      color:"var(--text-primary)",
                      transition:"all 0.2s",
                      textAlign:"center",
                      lineHeight:"1.4"
                    }}
                    onMouseEnter={e => { e.target.style.background="var(--bg-tertiary)"; e.target.style.transform="translateY(-2px)"; e.target.style.boxShadow="0 4px 12px rgba(57,154,255,0.2)"; }}
                    onMouseLeave={e => { e.target.style.background="var(--bg-secondary)"; e.target.style.transform="translateY(0)"; e.target.style.boxShadow="none"; }}
                  >
                    {CHIP_EMOJIS[i % CHIP_EMOJIS.length]} {topic}
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Get Started prompt — shown only when no topic is selected */}
      {!activeTopic && !topicsLoading && (
        <div style={{ padding:"24px 20px 32px", textAlign:"center" }}>
          <div style={{ fontSize:"40px", marginBottom:"12px" }}>👆</div>
          <div style={{ fontSize:"18px", fontWeight:"700", color:"var(--text-primary)", marginBottom:"8px" }}>
            Pick a topic to start learning!
          </div>
          <div style={{ fontSize:"13px", color:"var(--text-secondary)", maxWidth:"320px", margin:"0 auto 20px" }}>
            Choose any topic above and your AI Tutor will explain it step-by-step, just for you.
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:"10px", flexWrap:"wrap" }}>
            {["Ask anything 🤔", "Learn at your pace 🐢", "Get instant answers ⚡", "Practice with quizzes 📝"].map((tag, i) => (
              <span key={i} style={{
                background:"var(--bg-secondary)",
                border:"1px solid var(--border-color)",
                borderRadius:"20px",
                padding:"5px 14px",
                fontSize:"12px",
                color:"var(--text-secondary)"
              }}>{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Active Topic Header with View Toggle */}
      {activeTopic && (
        <div style={{
          padding:"16px 20px",
          background:"var(--bg-secondary)",
          borderBottom:`2px solid ${BLUE}`,
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          flexWrap:"wrap",
          gap:"12px"
        }}>
          <div>
            <div style={{ fontSize:"14px", color:"var(--text-secondary)" }}>Currently Learning:</div>
            <div style={{ fontSize:"20px", fontWeight:"700", color:BLUE, marginTop:"4px" }}>
              {activeTopic}
            </div>
          </div>

          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            {/* View Toggle Buttons */}
            <div style={{ display:"flex", gap:"4px", background:"var(--bg-tertiary)", padding:"4px", borderRadius:"8px", flexWrap:"wrap" }}>
              {[
                { id:"lesson",    label:"📚 Lesson" },
                { id:"videos",    label:"🎬 Videos",    onClick: () => { if (videoList.length === 0) fetchVideosForTopic(activeTopic); } },
                { id:"flashcards",label:"📇 Flashcards" },
                { id:"practice",  label:"📝 Test" },
                { id:"progress",  label:"📊 Progress" },
              ].map(tab => (
                <button key={tab.id}
                  onClick={() => { setViewMode(tab.id); tab.onClick?.(); }}
                  style={{
                    padding:"8px 12px",
                    background:viewMode === tab.id ? BLUE : "transparent",
                    color:viewMode === tab.id ? "white" : "var(--text-secondary)",
                    border:"none", borderRadius:"6px", cursor:"pointer",
                    fontWeight:"600", fontSize:"12px", transition:"all 0.2s", whiteSpace:"nowrap",
                  }}
                >{tab.label}</button>
              ))}
            </div>

            {/* Change Topic Button */}
            <button
              onClick={() => { setActiveTopic(null); setShowTopicMenu(true); setMessages([]); setViewMode("lesson"); }}
              style={{
                padding:"8px 14px",
                background:"var(--bg-tertiary)",
                border:`2px solid ${BLUE}`,
                borderRadius:"8px",
                cursor:"pointer",
                color:BLUE,
                fontWeight:"600",
                fontSize:"13px"
              }}
            >
              Change Topic
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Chat Area - Beautiful message bubbles */}
      <div
        ref={scrollRef}
        style={{
          flex:1,
          overflowY:"auto",
          padding:"20px",
          display:"flex",
          flexDirection:"column",
          gap:"16px",
          background:"var(--bg-primary)"
        }}
      >
        {/* Videos View */}
        {viewMode === "videos" && activeTopic && (
          loadingVideos ? (
            <div style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"center",
              justifyContent:"center",
              height:"100%",
              textAlign:"center",
              gap:"20px"
            }}>
              <div style={{
                width:"60px",
                height:"60px",
                borderRadius:"50%",
                border:`4px solid ${BLUE}`,
                borderTop:`4px solid transparent`,
                animation:"spin 1s linear infinite"
              }}/>
              <div style={{ fontSize:"16px", fontWeight:"600", color:"var(--text-primary)" }}>Loading videos...</div>
            </div>
          ) : videoList.length > 0 ? (
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
              gap:"16px"
            }}>
              {videoList.map((video, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedVideo(video)}
                  style={{
                    display:"block",
                    borderRadius:"12px",
                    overflow:"hidden",
                    background:"var(--bg-secondary)",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
                    transition:"all 0.3s",
                    textDecoration:"none",
                    cursor:"pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width:"100%",
                    paddingTop:"56.25%",
                    position:"relative",
                    background:"#000",
                    overflow:"hidden"
                  }}>
                    <img
                      src={video.thumb}
                      alt={video.title}
                      style={{
                        position:"absolute",
                        top:0,
                        left:0,
                        width:"100%",
                        height:"100%",
                        objectFit:"cover"
                      }}
                    />
                    {/* Play overlay */}
                    <div style={{
                      position:"absolute",
                      inset:0,
                      background:"rgba(0,0,0,0.3)",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }}>
                      <div style={{
                        width:"50px",
                        height:"50px",
                        background:"white",
                        borderRadius:"50%",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        fontSize:"24px"
                      }}>
                        ▶
                      </div>
                    </div>
                  </div>

                  {/* Title and Channel */}
                  <div style={{ padding:"12px" }}>
                    <div style={{
                      fontSize:"14px",
                      fontWeight:"600",
                      color:"var(--text-primary)",
                      lineHeight:"1.4",
                      marginBottom:"6px",
                      display:"-webkit-box",
                      WebkitLineClamp:2,
                      WebkitBoxOrient:"vertical",
                      overflow:"hidden"
                    }}>
                      {video.title}
                    </div>
                    <div style={{
                      fontSize:"12px",
                      color:"var(--text-secondary)",
                      overflow:"hidden",
                      textOverflow:"ellipsis",
                      whiteSpace:"nowrap"
                    }}>
                      {video.channel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"center",
              justifyContent:"center",
              height:"100%",
              textAlign:"center",
              color:"var(--text-secondary)"
            }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>🎬</div>
              <div style={{ fontSize:"18px", fontWeight:"600", marginBottom:"8px" }}>No Videos Found</div>
              <div style={{ fontSize:"14px" }}>Try searching for a different topic</div>
            </div>
          )
        )}

        {/* Video Modal - shows embedded YouTube player */}
        {selectedVideo && (
          <div style={{
            position:"fixed",
            inset:0,
            background:"rgba(0,0,0,0.8)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            zIndex:9999,
            padding:"20px"
          }} onClick={() => setSelectedVideo(null)}>
            <div style={{
              background:"var(--bg-secondary)",
              borderRadius:"16px",
              width:"100%",
              maxWidth:"900px",
              maxHeight:"90vh",
              display:"flex",
              flexDirection:"column",
              overflow:"hidden",
              boxShadow:"0 20px 60px rgba(0,0,0,0.3)"
            }} onClick={e => e.stopPropagation()}>
              {/* Video Container */}
              <div style={{
                width:"100%",
                aspectRatio:"16/9",
                background:"#000",
                position:"relative"
              }}>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position:"absolute",
                    inset:0,
                    width:"100%",
                    height:"100%",
                    border:"none"
                  }}
                />
              </div>
              {/* Video Info */}
              <div style={{
                padding:"20px",
                flex:1,
                overflow:"auto"
              }}>
                <h2 style={{ margin:"0 0 10px 0", fontSize:"20px", fontWeight:"700", color:"var(--text-primary)" }}>
                  {selectedVideo.title}
                </h2>
                <p style={{ margin:"0 0 10px 0", fontSize:"13px", color:"var(--text-secondary)" }}>
                  📺 {selectedVideo.channel}
                </p>
                {selectedVideo.description && (
                  <p style={{ margin:"0 0 15px 0", fontSize:"13px", color:"var(--text-secondary)", lineHeight:"1.6" }}>
                    {selectedVideo.description}
                  </p>
                )}
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display:"inline-block",
                    padding:"8px 16px",
                    background:BLUE,
                    color:"var(--text-primary)",
                    borderRadius:"8px",
                    textDecoration:"none",
                    fontSize:"13px",
                    fontWeight:"700"
                  }}
                >
                  ↗ Open on YouTube
                </a>
              </div>
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                style={{
                  position:"absolute",
                  top:"12px",
                  right:"12px",
                  width:"32px",
                  height:"32px",
                  borderRadius:"50%",
                  border:"none",
                  background:"rgba(0,0,0,0.5)",
                  color:"var(--text-primary)",
                  fontSize:"20px",
                  cursor:"pointer",
                  fontWeight:"700",
                  zIndex:10000
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Lesson View */}
        {viewMode === "lesson" && (
          <>
            {messages.length === 0 && activeTopic && (
              <div style={{
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
                height:"100%",
                textAlign:"center",
                color:"var(--text-secondary)"
              }}>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}>🎓</div>
                <div style={{ fontSize:"18px", fontWeight:"600", marginBottom:"8px" }}>Ready to Learn!</div>
                <div style={{ fontSize:"14px" }}>Ask a question or use voice input 🎤</div>
              </div>
            )}
          </>
        )}

        {/* Flashcard View */}
        {viewMode === "flashcards" && (
          <FlashcardView topic={activeTopic} grade={profile.grade} subject={activeSubject} apiUrl={API} />
        )}

        {/* Practice Test View */}
        {viewMode === "practice" && (
          <PracticeTestView
            topic={activeTopic} grade={profile.grade} subject={activeSubject} apiUrl={API}
            onScoreSave={(payload) => saveProgress("test", payload)}
          />
        )}

        {/* Progress View */}
        {viewMode === "progress" && (
          <ProgressView subject={activeSubject} grade={profile.grade} />
        )}

        {/* Limit Exceeded Message */}
        {limitExceeded && (
          <div style={{
            background: "#fee2e2",
            border: "2px solid #ef4444",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "16px",
            color: "#991b1b",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideDown 0.3s ease"
          }}>
            <span style={{ fontSize: "24px" }}>🛑</span>
            <div>
              <div style={{ fontWeight: "700", marginBottom: "4px" }}>Daily Limit Reached!</div>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>{limitMessage}</div>
            </div>
            <button
              onClick={() => setLimitExceeded(false)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#991b1b",
                fontSize: "20px",
                cursor: "pointer",
                padding: "4px 8px"
              }}
            >
              ✕
            </button>
          </div>
        )}

        {viewMode === "lesson" && messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display:"flex",
              justifyContent:msg.role === "user" ? "flex-end" : "flex-start",
              animation:`fadeUp 0.3s ease`
            }}
          >
            {msg.role === "user" ? (
              // User message - simple bubble
              <div
                style={{
                  maxWidth:"80%",
                  padding:"14px 18px",
                  borderRadius:"20px 20px 4px 20px",
                  background:BLUE,
                  color:"var(--text-primary)",
                  fontSize:"15px",
                  lineHeight:"1.6",
                  fontWeight:"500",
                  boxShadow:`0 2px 8px rgba(57,154,255,0.3)`,
                  wordWrap:"break-word"
                }}
              >
                {msg.content}
              </div>
            ) : (
              // Bot message - structured format with sections
              <div
                style={{
                  maxWidth:"85%",
                  background:"var(--bg-secondary)",
                  borderRadius:"20px 20px 20px 4px",
                  boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
                  overflow:"hidden"
                }}
              >
                {msg.streaming ? (
                  // Loading animation while streaming — never show raw text
                  <div style={{ padding:"24px 20px", textAlign:"center" }}>
                    <div style={{ fontSize:"15px", fontWeight:"600", color:BLUE, marginBottom:"16px" }}>
                      📚 Preparing your lesson on <em>{msg.topic}</em>...
                    </div>
                    <div style={{ display:"flex", gap:"10px", justifyContent:"center", marginBottom:"12px" }}>
                      {["📖","💡","🌍","✨"].map((emoji, i) => (
                        <div key={i} style={{
                          width:"44px", height:"44px", borderRadius:"12px",
                          background:"rgba(57,154,255,0.1)", border:`1.5px solid rgba(57,154,255,0.2)`,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px",
                          animation:`pulse 1.5s ease-in-out ${i*0.2}s infinite`
                        }}>{emoji}</div>
                      ))}
                    </div>
                    <div style={{ fontSize:"13px", color:"var(--text-secondary)" }}>
                      AI is writing your personalised lesson...
                    </div>
                  </div>
                ) : msg.sections ? (
                  // Structured content with sections
                  <div style={{ padding:"18px 20px" }}>
                    <div style={{ fontSize:"16px", fontWeight:"700", color:BLUE, marginBottom:"14px" }}>
                      📚 {msg.topic || "Lesson"}
                    </div>

                    {/* Definition Section */}
                    {msg.sections.definition && (
                      <div style={{ marginBottom:"16px" }}>
                        <div style={{ fontSize:"14px", fontWeight:"700", color:"var(--text-primary)", marginBottom:"6px" }}>
                          📖 What is it?
                        </div>
                        <div style={{ fontSize:"14px", lineHeight:"1.6", color:"var(--text-primary)", paddingLeft:"16px", borderLeft:`3px solid ${BLUE}`, ...getMessageStyles() }}
                          dangerouslySetInnerHTML={{ __html: formatMessage(formatSectionForGrade(msg.sections.definition)) }} />
                      </div>
                    )}

                    {/* Key Concepts Section */}
                    {msg.sections.keyPoints && (
                      <div style={{ marginBottom:"16px" }}>
                        <div style={{ fontSize:"14px", fontWeight:"700", color:"var(--text-primary)", marginBottom:"8px" }}>
                          💡 Key Ideas
                        </div>
                        <div style={{ fontSize:"14px", lineHeight:"1.7", color:"var(--text-primary)", paddingLeft:"16px", borderLeft:`3px solid ${BLUE}`, ...getMessageStyles() }}
                          dangerouslySetInnerHTML={{ __html: formatMessage(formatSectionForGrade(msg.sections.keyPoints)) }} />
                      </div>
                    )}

                    {/* Real-World Example Section */}
                    {msg.sections.example && (
                      <div style={{ marginBottom:"16px" }}>
                        <div style={{ fontSize:"14px", fontWeight:"700", color:"var(--text-primary)", marginBottom:"6px" }}>
                          🌍 Real-World Example
                        </div>
                        <div style={{ fontSize:"14px", lineHeight:"1.6", color:"var(--text-primary)", paddingLeft:"16px", borderLeft:`3px solid ${BLUE}`, background:"rgba(57,154,255,0.05)", padding:"12px", borderRadius:"6px", ...getMessageStyles() }}
                          dangerouslySetInnerHTML={{ __html: formatMessage(formatSectionForGrade(msg.sections.example)) }} />
                      </div>
                    )}

                    {/* Summary Section */}
                    {msg.sections.summary && (
                      <div style={{ marginBottom:"16px" }}>
                        <div style={{ fontSize:"14px", fontWeight:"700", color:"var(--text-primary)", marginBottom:"6px" }}>
                          ✨ Remember This
                        </div>
                        <div style={{ fontSize:"14px", fontWeight:"600", lineHeight:"1.6", color:BLUE, paddingLeft:"16px", borderLeft:`3px solid ${BLUE}`, background:"rgba(57,154,255,0.08)", padding:"12px", borderRadius:"6px", ...getMessageStyles() }}
                          dangerouslySetInnerHTML={{ __html: formatMessage(formatSectionForGrade(msg.sections.summary)) }} />
                      </div>
                    )}

                    {/* Hear Explanation Button */}
                    <div style={{ display:"flex", gap:"10px", marginTop:"16px", paddingTop:"12px", borderTop:`1px solid #e0e8f3`, flexWrap:"wrap" }}>
                      <button
                        onClick={() => speakResponse(msg.content)}
                        style={{
                          display:"flex",
                          alignItems:"center",
                          gap:"6px",
                          padding:"10px 16px",
                          background: voiceState === "speaking" ? "#d9534f" : BLUE,
                          color:"var(--text-primary)",
                          border:"none",
                          borderRadius:"8px",
                          cursor:"pointer",
                          fontWeight:"600",
                          fontSize:"13px",
                          transition:"all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = voiceState === "speaking" ? "#c9302c" : "#2b7ce6";
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = "0 4px 12px rgba(57,154,255,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = voiceState === "speaking" ? "#d9534f" : BLUE;
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        {voiceState === "speaking" ? "⏹️ Stop" : "🔊 Hear Explanation"}
                      </button>
                    </div>

                  </div>
                ) : (
                  // Fallback plain text for practice questions / follow-up answers
                  <div style={{ padding:"14px 18px", color:"var(--text-primary)", fontSize:"15px", lineHeight:"1.6", ...getMessageStyles() }}>
                    {formatContentForGrade(msg.content)}
                  </div>
                )}

                {/* Related Topics — outside sections block so it always shows */}
                {msg.role === "bot" && !msg.streaming && relatedTopics.length > 0 && (
                  <div style={{ padding:"0 20px 16px 20px" }}>
                    <div style={{ borderTop:`1px solid rgba(57,154,255,0.2)`, paddingTop:"14px" }}>
                      <div style={{ fontSize:"13px", fontWeight:"700", color:"var(--text-secondary)", marginBottom:"10px", letterSpacing:"0.5px" }}>
                        🔗 Related Topics
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                        {relatedTopics.map((rt, i) => (
                          <button
                            key={i}
                            onClick={() => chooseTopic(rt)}
                            style={{
                              padding:"6px 14px",
                              background:"rgba(57,154,255,0.1)",
                              border:`1px solid rgba(57,154,255,0.3)`,
                              borderRadius:"20px",
                              color:BLUE,
                              fontSize:"13px",
                              fontWeight:"600",
                              cursor:"pointer",
                              transition:"all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = BLUE;
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(57,154,255,0.1)";
                              e.currentTarget.style.color = BLUE;
                            }}
                          >
                            {rt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {viewMode === "lesson" && loading && (
          <div style={{ display:"flex", gap:"8px", justifyContent:"flex-start", alignItems:"center" }}>
            <div style={{
              width:"14px",
              height:"14px",
              borderRadius:"50%",
              background:BLUE,
              animation:"bounce 1.2s infinite"
            }}/>
            <div style={{
              width:"14px",
              height:"14px",
              borderRadius:"50%",
              background:BLUE,
              animation:"bounce 1.2s infinite 0.2s"
            }}/>
            <div style={{
              width:"14px",
              height:"14px",
              borderRadius:"50%",
              background:BLUE,
              animation:"bounce 1.2s infinite 0.4s"
            }}/>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input Area - Large and easy to use */}
      {activeTopic && (
        <div style={{
          padding:"16px 20px",
          background:"var(--bg-secondary)",
          borderTop:"2px solid rgba(57,154,255,0.2)",
          display:"flex",
          gap:"12px",
          alignItems:"center"
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendText(input)}
            placeholder="Type your question..."
            style={{
              flex:1,
              padding:"14px 16px",
              border:`2px solid ${BORDER}`,
              borderRadius:"12px",
              fontSize:"15px",
              fontFamily:FONT,
              fontWeight:"500",
              outline:"none",
              transition:"all 0.2s",
              background:"var(--bg-tertiary)",
              color:"var(--text-primary)"
            }}
            onFocus={(e) => e.target.style.borderColor = BLUE}
            onBlur={(e) => e.target.style.borderColor = BORDER}
          />

          {/* Voice Input Button for Questions */}
          <button
            onClick={toggleVoiceInput}
            style={{
              padding:"10px 14px",
              background:voiceState === "listening" ? "#ef4444" : voiceState === "processing" ? "#3b82f6" : BLUE,
              color:"var(--text-primary)",
              border:"none",
              borderRadius:"10px",
              cursor:"pointer",
              fontSize:"16px",
              fontWeight:"600",
              transition:"all 0.2s",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              minWidth:"44px",
              height:"44px",
              boxShadow:voiceState === "listening" ? "0 0 16px rgba(239,68,68,0.5)" : "0 2px 8px rgba(57,154,255,0.2)"
            }}
            title={voiceState === "listening" ? "Listening... Click to stop" : "Click or speak your question"}
          >
            {voiceState === "listening" ? (
              <span style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "white",
                animation: "pulse 1s infinite",
                marginRight: "4px"
              }}></span>
            ) : null}
            🎤
          </button>

          <button
            onClick={() => sendText(input)}
            disabled={loading || !input.trim()}
            style={{
              padding:"14px 28px",
              background:loading || !input.trim() ? "var(--border-color)" : BLUE,
              color:loading || !input.trim() ? "var(--text-secondary)" : "white",
              border:"none",
              borderRadius:"12px",
              cursor:loading || !input.trim() ? "default" : "pointer",
              fontWeight:"700",
              fontSize:"16px",
              transition:"all 0.2s",
              transform:loading || !input.trim() ? "scale(1)" : "scale(1)"
            }}
          >
            Send
          </button>
        </div>
      )}

      {/* Chat History Sidebar */}
      <ChatHistory
        apiUrl={API}
        studentId={profile.grade || "student"}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectChat={(chat) => {
          console.log('[AI-Tutor] onSelectChat called:', chat);
          console.log('[AI-Tutor] Chat content:', chat.content);
          if (chat.content) {
            // Load the selected chat WITHOUT calling setActiveTopic (to prevent auto-loading)
            console.log('[AI-Tutor] Loading chat for topic:', chat.topic);

            // Parse sections from the content
            const sections = parseSections(chat.content);
            console.log('[AI-Tutor] Parsed sections:', sections);

            const chatMessage = {
              role: "bot",
              topic: chat.topic,
              content: chat.content,
              sections: sections
            };
            console.log('[AI-Tutor] Setting messages to:', chatMessage);
            setMessages([chatMessage]);
            setShowHistory(false);
            console.log('[AI-Tutor] Chat loaded successfully');
          } else {
            console.warn('[AI-Tutor] Chat has no content:', chat);
          }
        }}
      />
    </div>
  );
}

// ─── MAIN APP COMPONENT ─────────────────────────────────────────────────────────
export default function App() {
  const [profile, setProfile] = useState(null);

  const handleStart = (p) => {
    console.log("App received profile:", p);
    localStorage.setItem("ai_tutor_profile", JSON.stringify(p));
    setProfile(p);
  };

  if (!profile) {
    return (
      <>
        <HomePage onStart={handleStart}/>
      </>
    );
  }

  return (
    <>
      <SubjectPage
        profile={profile}
        onHome={() => {
          localStorage.removeItem("ai_tutor_profile");
          setProfile(null);
        }}
      />
    </>
  );
}
