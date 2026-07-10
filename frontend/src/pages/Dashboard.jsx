import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import ScoreChart from "../components/ScoreChart";
import "./Dashboard.css";

const QUICK_TYPES = ["Technical", "HR", "Behavioral", "System Design"];

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [resume, setResume] = useState(null);
  const [stats, setStats] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/resume"),
      api.get("/interview/stats/summary"),
      api.get("/interview"),
    ]).then(([resumeRes, statsRes, interviewsRes]) => {
      if (resumeRes.status === "fulfilled") setResume(resumeRes.value.data.resume);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (interviewsRes.status === "fulfilled") setInterviews(interviewsRes.value.data.interviews);
      setLoading(false);
    });
  }, []);

  const continueInterview = interviews.find((i) => i.status !== "completed");
  const recentInterviews = interviews.filter((i) => i._id !== continueInterview?._id).slice(0, 5);

  return (
    <div className="db">
      <div className="db-topbar">
        <div className="db-welcome">
          <h1>Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p>Here's where your interview prep stands today.</p>
        </div>
        <div className="db-topbar-right">
          <span className="db-pill-stat">
            🎯 <b>{stats?.totalInterviews ?? 0}</b> interviews
          </span>
          <button className="db-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--db-muted)" }}>Loading your dashboard...</p>
      ) : (
        <>
          <div className="db-top-grid">
            <div className="db-card db-score-card">
              <div className="db-score-head">
                <div>
                  <span className="db-score-label">Average Score</span>
                  <div className="db-score-value">
                    {stats?.averageScore ?? "—"}
                    <span>/100</span>
                  </div>
                </div>
                {stats?.completedInterviews > 0 && (
                  <span className="db-score-badge">{stats.completedInterviews} completed</span>
                )}
              </div>

              <div className="db-chart-wrap">
                <ScoreChart data={stats?.scoreHistory} />
              </div>

              <div className="db-quickstart-label">Jump into a round</div>
              <div className="db-pill-row">
                {QUICK_TYPES.map((t) => (
                  <Link
                    key={t}
                    to="/interview/new"
                    state={{ presetType: t }}
                    className="db-type-pill"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>

            <div className="db-side-panel">
              <div className="db-mini-card">
                <div className="db-mini-card-header">
                  <h4>📄 Resume</h4>
                  <Link to="/resume" className="db-mini-link">
                    {resume ? "View" : "Upload"}
                  </Link>
                </div>
                <div className="db-mini-body">
                  {resume ? (
                    <>
                      <strong>{resume.fileName}</strong>
                      <br />
                      {resume.skills?.length || 0} skills detected
                    </>
                  ) : (
                    "Upload your resume so questions are tailored to your real experience."
                  )}
                </div>
              </div>

              <div className="db-mini-card">
                <div className="db-mini-card-header">
                  <h4>{continueInterview ? "▶️ Continue Practicing" : "🚀 Get Started"}</h4>
                </div>
                <div className="db-mini-body">
                  {continueInterview ? (
                    <>
                      You have an in-progress <strong>{continueInterview.role}</strong> interview
                      waiting.
                    </>
                  ) : (
                    "Start your first mock interview — pick a role, difficulty, and interviewer."
                  )}
                </div>
                <Link
                  to={continueInterview ? `/interview/${continueInterview._id}` : "/interview/new"}
                  className="db-continue-btn"
                >
                  {continueInterview ? "Resume Interview" : "Start Interview"}
                </Link>
              </div>
            </div>
          </div>

          <div className="db-promo-grid">
            <Link to="/interview/new" state={{ presetType: "Technical", presetCoding: true }} className="db-promo-tile blue">
              <span className="db-promo-icon">💻</span>
              <h4>Try a Coding Round</h4>
              <p>Write real code in the editor, scored on correctness.</p>
            </Link>
            <Link to="/interview/new" className="db-promo-tile violet">
              <span className="db-promo-icon">🎙️</span>
              <h4>Practice with Voice Mode</h4>
              <p>Speak your answers, hear the interviewer ask them back.</p>
            </Link>
            <Link to="/ats-score" className="db-promo-tile pink">
              <span className="db-promo-icon">🔍</span>
              <h4>Check ATS Resume Score</h4>
              <p>Paste a job description, find your missing keywords.</p>
            </Link>
          </div>

          <div className="db-list-card">
            <div className="db-list-header">
              <h3>Recent Interviews</h3>
              <Link to="/interviews" className="db-mini-link">
                View all
              </Link>
            </div>

            {recentInterviews.length === 0 ? (
              <div className="db-empty">No completed interviews yet — they'll show up here.</div>
            ) : (
              recentInterviews.map((i) => (
                <Link to={`/interview/${i._id}`} key={i._id} className="db-row">
                  <div className="db-row-left">
                    <div className="db-row-avatar">{initials(i.role)}</div>
                    <div>
                      <div className="db-row-role">{i.role}</div>
                      <div className="db-row-tags">
                        <span className="db-row-tag">{i.type}</span>
                        <span className="db-row-tag">{i.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <div className="db-row-right">
                    {i.score != null ? (
                      <span className="db-row-score">{i.score}/100</span>
                    ) : (
                      <span className="db-row-status">{i.status}</span>
                    )}
                    <span className="db-row-date">
                      {new Date(i.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
