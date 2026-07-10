import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const TYPES = ["Technical", "HR", "Behavioral", "System Design"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const PERSONALITIES = [
  { name: "Senior Engineer", blurb: "Calm, precise, mentor-like" },
  { name: "Friendly HR", blurb: "Warm, encouraging, culture-focused" },
  { name: "Strict FAANG Interviewer", blurb: "Rigorous, terse, exacting" },
  { name: "Startup Founder", blurb: "Fast-paced, pragmatic, scrappy" },
];

export default function StartInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("");
  const [type, setType] = useState(location.state?.presetType || "Technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [personality, setPersonality] = useState("Senior Engineer");
  const [codingRound, setCodingRound] = useState(!!location.state?.presetCoding);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      setError("Please enter a target role");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/interview/start", {
        role,
        type,
        difficulty,
        personality,
        codingRound: type === "Technical" ? codingRound : false,
      });
      navigate(`/interview/${data.interview._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not start interview");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Start a New Interview</h1>
        <Link to="/dashboard" className="link-muted">
          ← Back to Dashboard
        </Link>
      </header>

      <form className="panel start-interview-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}

        <label>
          Target Role
          <input
            type="text"
            placeholder="e.g. Backend Engineer, Frontend Developer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </label>

        <label>Interview Type</label>
        <div className="option-grid">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t}
              className={`option-card ${type === t ? "selected" : ""}`}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <label>Difficulty</label>
        <div className="option-grid three-col">
          {DIFFICULTIES.map((d) => (
            <button
              type="button"
              key={d}
              className={`option-card ${difficulty === d ? "selected" : ""}`}
              onClick={() => setDifficulty(d)}
            >
              {d}
            </button>
          ))}
        </div>

        <label>Interviewer Personality</label>
        <div className="option-grid persona-grid">
          {PERSONALITIES.map((p) => (
            <button
              type="button"
              key={p.name}
              className={`option-card persona-card ${personality === p.name ? "selected" : ""}`}
              onClick={() => setPersonality(p.name)}
            >
              <span className="persona-name">{p.name}</span>
              <span className="persona-blurb">{p.blurb}</span>
            </button>
          ))}
        </div>

        {type === "Technical" && (
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={codingRound}
              onChange={(e) => setCodingRound(e.target.checked)}
            />
            💻 Enable Coding Round (write code instead of prose answers)
          </label>
        )}

        <button type="submit" className="primary-btn" disabled={submitting}>
          {submitting ? "Starting..." : "Start Interview"}
        </button>
      </form>
    </div>
  );
}
