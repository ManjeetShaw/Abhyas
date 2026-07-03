import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [resume, setResume] = useState(null);
  const [checkingResume, setCheckingResume] = useState(true);

  useEffect(() => {
    api
      .get("/resume")
      .then(({ data }) => setResume(data.resume))
      .catch(() => setResume(null))
      .finally(() => setCheckingResume(false));
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.name} 👋</h1>
        <button onClick={logout}>Log out</button>
      </header>

      <section className="dashboard-body">
        <h3>Resume</h3>
        {checkingResume ? (
          <p className="muted">Checking resume status...</p>
        ) : resume ? (
          <p>
            ✅ <strong>{resume.fileName}</strong> uploaded — {resume.skills?.length || 0}{" "}
            skills detected.{" "}
            <Link to="/resume">View details</Link>
          </p>
        ) : (
          <p>
            You haven't uploaded a resume yet. <Link to="/resume">Upload one now</Link> to
            unlock personalized interview questions.
          </p>
        )}

        <p className="muted" style={{ marginTop: 24 }}>
          Coming next — Phase 3: full dashboard with interview history and progress charts.
        </p>
      </section>
    </div>
  );
}
