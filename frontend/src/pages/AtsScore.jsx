import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function scoreColor(score) {
  if (score == null) return "var(--muted)";
  if (score >= 75) return "var(--success)";
  if (score >= 50) return "#f5a623";
  return "var(--error)";
}

export default function AtsScore() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/resume/ats-score", { jobDescription });
      setResult(data.atsCheck);
    } catch (err) {
      setError(err.response?.data?.message || "Could not compute ATS score");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>ATS Resume Score</h1>
        <Link to="/dashboard" className="link-muted">
          ← Back to Dashboard
        </Link>
      </header>

      <div className="panel">
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="ats-form">
          <label>
            Paste the job description
            <textarea
              rows={8}
              placeholder="Paste the full job posting text here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={submitting}
            />
          </label>
          <button
            type="submit"
            className="primary-btn"
            disabled={submitting || !jobDescription.trim()}
          >
            {submitting ? "Scoring..." : "Check ATS Score"}
          </button>
        </form>
      </div>

      {result && (
        <div className="panel ats-result">
          <div className="ats-score-display">
            <div
              className="ats-score-circle"
              style={{ borderColor: scoreColor(result.atsScore) }}
            >
              <span style={{ color: scoreColor(result.atsScore) }}>
                {result.atsScore != null ? result.atsScore : "—"}
              </span>
              <span className="ats-score-suffix">/100</span>
            </div>
            <p className="muted">ATS Match Score</p>
          </div>

          {result.missingKeywords?.length > 0 && (
            <div className="summary-section">
              <h4>🔍 Missing Keywords</h4>
              <div className="skill-chips">
                {result.missingKeywords.map((k) => (
                  <span className="chip chip-warning" key={k}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div className="summary-section">
              <h4>💡 Suggestions</h4>
              <ul>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
