import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import ScoreChart from "../components/ScoreChart";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [resume, setResume] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/resume"),
      api.get("/interview/stats/summary"),
      api.get("/interview"),
    ]).then(([resumeRes, statsRes, interviewsRes]) => {
      if (resumeRes.status === "fulfilled") setResume(resumeRes.value.data.resume);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (interviewsRes.status === "fulfilled") {
        setRecent(interviewsRes.value.data.interviews.slice(0, 3));
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="muted">Here's where your interview prep stands.</p>
        </div>
        <button onClick={logout} className="ghost-btn">
          Log out
        </button>
      </header>

      {loading ? (
        <p className="muted">Loading your dashboard...</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">Interviews Taken</span>
              <span className="stat-value">{stats?.totalInterviews ?? 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Average Score</span>
              <span className="stat-value">
                {stats?.averageScore != null ? `${stats.averageScore}/100` : "—"}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Resume Status</span>
              <span className="stat-value">
                {resume ? "✅ Uploaded" : "⚠️ Missing"}
              </span>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                <h3>Resume</h3>
                <Link to="/resume" className="link-muted">
                  {resume ? "View" : "Upload"}
                </Link>
              </div>
              {resume ? (
                <p>
                  <strong>{resume.fileName}</strong> — {resume.skills?.length || 0} skills
                  detected.
                </p>
              ) : (
                <p className="muted">
                  Upload your resume so interview questions can be tailored to your
                  background.
                </p>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Start Practicing</h3>
              </div>
              <p className="muted">
                Pick a role, difficulty, and interview type to begin a new mock session.
              </p>
              <Link to="/interview/new" className="primary-btn as-link">
                Start New Interview
              </Link>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Progress Over Time</h3>
            </div>
            <ScoreChart data={stats?.scoreHistory} />
            {stats?.topWeakAreas?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p className="muted" style={{ marginBottom: 8 }}>
                  Recurring weak areas:
                </p>
                <div className="skill-chips">
                  {stats.topWeakAreas.map((area) => (
                    <span className="chip" key={area}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Recent Interviews</h3>
              <Link to="/interviews" className="link-muted">
                View all
              </Link>
            </div>

            {recent.length === 0 ? (
              <p className="muted">
                No interviews yet — your first one will show up here.
              </p>
            ) : (
              <div className="interview-list">
                {recent.map((i) => (
                  <Link to={`/interview/${i._id}`} key={i._id} className="interview-card">
                    <div>
                      <h4>{i.role}</h4>
                      <div className="badge-row">
                        <span className="badge">{i.type}</span>
                        <span className="badge">{i.difficulty}</span>
                      </div>
                    </div>
                    <div className="interview-card-right">
                      {i.score != null ? (
                        <span className="score-pill">{i.score}/100</span>
                      ) : (
                        <span className="badge badge-accent">{i.status}</span>
                      )}
                      <span className="muted small">
                        {new Date(i.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
