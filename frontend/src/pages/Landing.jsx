import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Landing.css";

const STEPS = [
  {
    n: "01",
    title: "Upload your resume",
    body: "Abhyas reads your real projects, stack, and experience — not a generic template.",
  },
  {
    n: "02",
    title: "Pick a role and an interviewer",
    body: "Technical, HR, Behavioral, or System Design. A calm senior mentor or a strict panel — your call.",
  },
  {
    n: "03",
    title: "Answer out loud or in code",
    body: "Speak your answers with voice mode, or write real code in the built-in editor for technical rounds.",
  },
  {
    n: "04",
    title: "Get scored like a real debrief",
    body: "Clarity, technical accuracy, completeness, confidence — every answer, every round.",
  },
];

const FEATURES = [
  { icon: "📄", title: "Resume-aware questions", body: "Every question is generated against your actual resume, not a question bank." },
  { icon: "🎙️", title: "Voice mode", body: "Speak your answers and hear the interviewer ask them back, pause and resume anytime." },
  { icon: "💻", title: "Coding round", body: "A real code editor with language switching for technical problems, evaluated on correctness." },
  { icon: "🎭", title: "Interviewer personalities", body: "Friendly HR, Strict FAANG panel, Startup founder, or Senior engineer — each with a different bar." },
  { icon: "📊", title: "Four-part feedback", body: "Clarity, technical accuracy, completeness, and confidence — scored on every single answer." },
  { icon: "🔍", title: "ATS resume score", body: "Paste a job description and see exactly which keywords your resume is missing." },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="landing-logo">Abhyas</span>
        <div className="landing-nav-links">
          {user ? (
            <Link to="/dashboard" className="landing-nav-cta">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="landing-nav-link">
                Log in
              </Link>
              <Link to="/signup" className="landing-nav-cta">
                Start practicing
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">अभ्यास — Sanskrit for practice, repeated on purpose</span>
          <h1>
            Practice the interview
            <br />
            before it's real.
          </h1>
          <p className="landing-subhead">
            Abhyas rehearses you against an AI interviewer that reads your resume, asks real
            follow-up questions, and scores every answer — so the real interview feels like your
            sixth attempt, not your first.
          </p>
          <div className="landing-hero-actions">
            <Link to={user ? "/dashboard" : "/signup"} className="landing-btn-primary">
              {user ? "Go to Dashboard" : "Start practicing — it's free"}
            </Link>
            <a href="#how-it-works" className="landing-btn-secondary">
              See how it works
            </a>
          </div>
        </div>

        <div className="landing-hero-demo" aria-hidden="true">
          <div className="demo-card">
            <div className="demo-card-header">
              <span>Interview Room</span>
              <span className="demo-tag">Backend Engineer · Technical</span>
            </div>
            <div className="demo-bubble demo-question">
              Walk me through how you'd design a rate limiter for a public API.
            </div>
            <div className="demo-bubble demo-answer">
              <span className="demo-typing">
                <i></i>
                <i></i>
                <i></i>
              </span>
            </div>
            <div className="demo-feedback">
              <span className="demo-feedback-label">💬 Feedback</span>
              <div className="demo-scores">
                <span>
                  Clarity <b>8</b>
                </span>
                <span>
                  Technical Accuracy <b>9</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="landing-section" id="how-it-works">
        <h2 className="landing-section-title">Four rounds. That's the whole method.</h2>
        <div className="landing-steps">
          {STEPS.map((s) => (
            <div className="landing-step" key={s.n}>
              <span className="landing-step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section-alt">
        <h2 className="landing-section-title">Everything a real interview loop needs</h2>
        <div className="landing-features">
          {FEATURES.map((f) => (
            <div className="landing-feature-card" key={f.title}>
              <span className="landing-feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-philosophy">
        <h2>Why "Abhyas"</h2>
        <p>
          In Sanskrit, <em>अभ्यास (abhyas)</em> is the word musicians use for daily riyaz and
          martial artists use for kata — practice repeated on purpose until it becomes instinct.
          Job interviews reward the same discipline. Abhyas exists to give you enough reps that
          walking into the real room feels familiar.
        </p>
      </section>

      <footer className="landing-footer">
        <span>Abhyas — practice like it's real, before it actually is.</span>
        <div className="landing-footer-links">
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
