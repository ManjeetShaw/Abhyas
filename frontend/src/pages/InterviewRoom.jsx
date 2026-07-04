import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const statusLabel = {
  created: "Ready to begin",
  "in-progress": "In progress",
  completed: "Completed",
};

export default function InterviewRoom() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/interview/${id}`)
      .then(({ data }) => setInterview(data.interview))
      .catch((err) => setError(err.response?.data?.message || "Could not load interview"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="center-screen">Loading...</div>;

  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">{error}</div>
        <Link to="/dashboard" className="link-muted">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const firstQuestion = interview.questions?.[0]?.question;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{interview.role}</h1>
        <Link to="/dashboard" className="link-muted">
          ← Back to Dashboard
        </Link>
      </header>

      <div className="badge-row">
        <span className="badge">{interview.type}</span>
        <span className="badge">{interview.difficulty}</span>
        <span className="badge badge-accent">{statusLabel[interview.status]}</span>
      </div>

      <div className="panel interview-room">
        <p className="muted">Interviewer · AI-generated</p>
        <div className="question-bubble">{firstQuestion}</div>

        <div className="coming-soon">
          <p>🎤 Live back-and-forth Q&amp;A, follow-up questions, and instant scoring are coming in Phase 5.</p>
          <p className="muted">For now, this confirms your interview was created and stored correctly.</p>
        </div>
      </div>
    </div>
  );
}
