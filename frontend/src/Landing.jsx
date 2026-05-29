import React, { useState } from "react";
import { useTheme } from "./context/ThemeContext";

const FEATURES = [
  { icon: "📚", title: "Personal AI Tutor", desc: "Friendly lessons explained the way you learn best — fun, simple, and engaging." },
  { icon: "🎨", title: "Visual Lessons", desc: "Every lesson comes with a cute illustration so concepts stick faster." },
  { icon: "📇", title: "Flashcards", desc: "Auto-generated flashcards to revise any topic in minutes." },
  { icon: "📝", title: "Practice Tests", desc: "Quick tests that grow with you — get instant feedback and track progress." },
  { icon: "🔊", title: "Hear It Aloud", desc: "Listen to every lesson read out loud, perfect for younger learners." },
  { icon: "📊", title: "Progress Tracking", desc: "See how far you've come and what's next to learn." },
];

function pwStrength(p) {
  if (!p) return { s: 0, label: "", color: "var(--text-secondary)" };
  let s = 0;
  if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++; if (p.length >= 12) s++;
  if (s <= 1) return { s, label: "Weak", color: "#ef4444" };
  if (s <= 3) return { s, label: "Fair", color: "#f59e0b" };
  return { s, label: "Strong", color: "#22c55e" };
}

const ip = { width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box" };
const lab = { display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 };

function AuthModal({ mode, onClose, onSwitch, onEnter }) {
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const st = pwStrength(form.password);
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault(); setErr("");
    if (isSignup) {
      if (!form.name.trim() || !form.email.trim()) return setErr("Name and email are required.");
      if (form.password.length < 8) return setErr("Password must be at least 8 characters.");
      localStorage.setItem("ai_tutor_account", JSON.stringify({ name: form.name, email: form.email, password: btoa(form.password) }));
      onEnter();
    } else {
      const u = JSON.parse(localStorage.getItem("ai_tutor_account") || "null");
      if (!u) return setErr("No account found. Please sign up first.");
      const id = form.email.trim().toLowerCase();
      if (id !== (u.email || "").toLowerCase() && id !== (u.name || "").toLowerCase()) return setErr("Account not found.");
      if (u.password && atob(u.password) !== form.password) return setErr("Wrong password.");
      onEnter();
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "var(--bg-secondary)", borderRadius: 18, border: "1.5px solid var(--border-color)", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ background: "var(--blue)", padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{isSignup ? "Create your account" : "Welcome back"}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9 }}>{isSignup ? "Start learning with your AI tutor" : "Log in to continue"}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <form onSubmit={submit} style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {err && <div style={{ background: "#ef444418", border: "1px solid #ef444455", color: "#ef4444", padding: "9px 12px", borderRadius: 9, fontSize: 13 }}>{err}</div>}
          {isSignup && <div><label style={lab}>Full Name</label><input style={ip} value={form.name} onChange={set("name")} placeholder="Your name" /></div>}
          <div><label style={lab}>{isSignup ? "Email" : "Email or Name"}</label><input style={ip} value={form.email} onChange={set("email")} placeholder={isSignup ? "you@email.com" : "email or name"} /></div>
          <div>
            <label style={lab}>Password</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...ip, paddingRight: 44 }} type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder={isSignup ? "At least 8 characters" : "Your password"} />
              <button type="button" onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15 }}>{showPw ? "🙈" : "👁️"}</button>
            </div>
            {isSignup && form.password && (
              <div style={{ marginTop: 7 }}>
                <div style={{ display: "flex", gap: 4 }}>{[1,2,3,4,5].map((b) => <div key={b} style={{ flex: 1, height: 4, borderRadius: 4, background: b <= st.s ? st.color : "var(--border-color)" }} />)}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: st.color }}>{st.label}</span>
              </div>
            )}
          </div>
          <button type="submit" style={{ marginTop: 4, padding: "12px", borderRadius: 10, border: "none", background: "var(--blue)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>{isSignup ? "Create Account" : "Log In"}</button>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button type="button" onClick={onSwitch} style={{ background: "none", border: "none", color: "var(--blue)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>{isSignup ? "Log In" : "Sign Up"}</button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function Landing({ onEnter }) {
  const { isDark, toggleTheme } = useTheme();
  const [auth, setAuth] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 6vw", borderBottom: "1.5px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 }}>🤖</div>
          <span style={{ fontSize: 20, fontWeight: 800 }}>AI <span style={{ color: "var(--blue)" }}>Tutor</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={toggleTheme} title="Toggle theme" style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", cursor: "pointer", fontSize: 18 }}>{isDark ? "☀️" : "🌙"}</button>
          <button onClick={() => setAuth("login")} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Log In</button>
          <button onClick={() => setAuth("signup")} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "var(--blue)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "var(--shadow)" }}>Sign Up Free</button>
        </div>
      </header>

      <section style={{ textAlign: "center", padding: "64px 6vw 40px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, background: "var(--blue-xlight)", color: "var(--blue)", fontWeight: 700, fontSize: 13, marginBottom: 22 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)" }} /> Lessons · Flashcards · Tests · Voice
        </div>
        <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 18px" }}>Your friendly<br /><span style={{ color: "var(--blue)" }}>AI Tutor.</span></h1>
        <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto 30px", lineHeight: 1.6 }}>
          Learn any subject with a personal AI tutor who explains things in fun, simple language — with pictures, flashcards, tests, and voice.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setAuth("signup")} style={{ padding: "14px 30px", borderRadius: 12, border: "none", background: "var(--blue)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "var(--shadow-lg)" }}>Get Started Free →</button>
          <button onClick={onEnter} style={{ padding: "14px 30px", borderRadius: 12, border: "1.5px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Try it now</button>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 6vw 56px" }}>
        <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 800, margin: "0 0 32px" }}>Everything to make learning fun</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "var(--bg-secondary)", border: "1.5px solid var(--border-color)", borderRadius: 16, padding: 24, boxShadow: "var(--shadow)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, background: "var(--blue-xlight)", marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1.5px solid var(--border-color)", padding: "24px 6vw", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} /> Powered by Codevidhya</div>
        <div style={{ marginTop: 6 }}>© 2025 AI Tutor</div>
      </footer>

      {auth && <AuthModal mode={auth} onClose={() => setAuth(null)} onSwitch={() => setAuth((m) => (m === "signup" ? "login" : "signup"))} onEnter={onEnter} />}
    </div>
  );
}
