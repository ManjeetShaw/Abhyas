import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/interview")
      .then(({ data }) => setInterviews(data.interviews))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Interview History</h1>
        <Link to="/dashboard" className="link-muted">
          ← Back to Dashboard
        </Link>
      </header>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : interviews.length === 0 ? (
        <div className="panel empty-state">
          <div className="empty-icon">🗂️</div>
          <h3>No interviews yet</h3>
          <p className="muted">Start your first mock interview to see it show up here.</p>
          <Link to="/interview/new" className="primary-btn as-link">
            Start an Interview
          </Link>
        </div>
      ) : (
        <div className="interview-list">
          {interviews.map((i) => (
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
  );
}
