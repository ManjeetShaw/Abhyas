import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ResumeUpload() {
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchResume = async () => {
    try {
      const { data } = await api.get("/resume");
      setResume(data.resume);
    } catch {
      setResume(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResume(data.resume);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete("/resume");
      setResume(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete resume");
    }
  };

  if (loading) return <div className="center-screen">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Resume</h1>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </header>

      <section className="dashboard-body">
        {error && <div className="error-banner">{error}</div>}

        {!resume ? (
          <form onSubmit={handleUpload} className="resume-form">
            <p className="muted">Upload a PDF resume to get started (max 5MB).</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit" disabled={!file || uploading}>
              {uploading ? "Uploading & parsing..." : "Upload Resume"}
            </button>
          </form>
        ) : (
          <div className="resume-summary">
            <p>
              <strong>{resume.fileName}</strong> uploaded{" "}
              {new Date(resume.uploadedAt || resume.createdAt).toLocaleDateString()}
            </p>

            <h3>Detected Skills</h3>
            {resume.skills?.length ? (
              <div className="skill-chips">
                {resume.skills.map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted">No skills detected — try a more detailed resume.</p>
            )}

            {resume.projects?.length > 0 && (
              <>
                <h3>Projects</h3>
                <ul>
                  {resume.projects.slice(0, 5).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </>
            )}

            {resume.experience?.length > 0 && (
              <>
                <h3>Experience</h3>
                <ul>
                  {resume.experience.slice(0, 5).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </>
            )}

            <button className="danger" onClick={handleDelete}>
              Remove Resume
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
