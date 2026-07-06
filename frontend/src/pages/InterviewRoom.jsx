import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useVoice } from "../hooks/useVoice";

const statusLabel = {
  created: "Just started",
  "in-progress": "In progress",
  completed: "Completed",
};

const DIMENSIONS = [
  { key: "clarity", label: "Clarity" },
  { key: "technicalAccuracy", label: "Technical Accuracy" },
  { key: "completeness", label: "Completeness" },
  { key: "confidence", label: "Confidence" },
];

const LANGUAGES = ["javascript", "python", "java", "cpp"];

function DimensionBars({ question }) {
  const hasDims = DIMENSIONS.some((d) => question[d.key] != null);
  if (!hasDims) return null;

  return (
    <div className="dimension-bars">
      {DIMENSIONS.map((d) => (
        <div className="dimension-row" key={d.key}>
          <span className="dimension-label">{d.label}</span>
          <div className="dimension-track">
            <div
              className="dimension-fill"
              style={{ width: `${((question[d.key] || 0) / 10) * 100}%` }}
            />
          </div>
          <span className="dimension-value">{question[d.key] ?? "—"}/10</span>
        </div>
      ))}
    </div>
  );
}

export default function InterviewRoom() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [voiceModeOn, setVoiceModeOn] = useState(false);
  const lastSpokenQuestionRef = useRef(null);

  const voice = useVoice();

  const fetchInterview = async () => {
    try {
      const { data } = await api.get(`/interview/${id}`);
      setInterview(data.interview);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load interview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (voice.transcript) setAnswer(voice.transcript);
  }, [voice.transcript]);

  const questions = interview?.questions || [];
  const currentQuestion = questions[questions.length - 1];
  const isCompleted = interview?.status === "completed";
  const isCodingRound = interview?.codingRound;

  useEffect(() => {
    if (!voiceModeOn || !currentQuestion || isCompleted || isCodingRound) return;
    if (lastSpokenQuestionRef.current === currentQuestion.question) return;
    lastSpokenQuestionRef.current = currentQuestion.question;
    voice.speak(currentQuestion.question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceModeOn, currentQuestion?.question, isCompleted, isCodingRound]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    voice.stopListening();
    voice.stopSpeaking();
    setSubmitting(true);
    setError("");
    try {
      const payload = isCodingRound ? { answer, language } : { answer };
      const { data } = await api.post(`/interview/${id}/answer`, payload);
      setInterview(data.interview);
      setAnswer("");
      voice.setTranscript("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVoiceMode = () => {
    if (voiceModeOn) {
      voice.stopSpeaking();
      voice.stopListening();
    }
    setVoiceModeOn((v) => !v);
  };

  if (loading) return <div className="center-screen">Loading...</div>;

  if (error && !interview) {
    return (
      <div className="page-container">
        <div className="error-banner">{error}</div>
        <Link to="/dashboard" className="link-muted">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const answeredQuestions = questions.filter((q) => q.answer);

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
        <span className="badge badge-accent">{interview.personality}</span>
        {isCodingRound && <span className="badge">💻 Coding Round</span>}
        <span className="badge badge-accent">{statusLabel[interview.status]}</span>
        <span className="badge">
          Question {questions.length}
          {isCompleted ? "" : " (in progress)"}
        </span>
        {!isCodingRound && (voice.sttSupported || voice.ttsSupported) && !isCompleted && (
          <button
            type="button"
            className={`voice-toggle ${voiceModeOn ? "on" : ""}`}
            onClick={toggleVoiceMode}
          >
            🎙️ Voice Mode {voiceModeOn ? "On" : "Off"}
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {answeredQuestions.length > 0 && (
        <div className="qa-history">
          {answeredQuestions.map((q, i) => (
            <div className="panel qa-turn" key={q._id || i}>
              <p className="muted">Interviewer</p>
              <div className="question-bubble">{q.question}</div>

              <p className="muted" style={{ marginTop: 14 }}>
                You
              </p>
              {q.language ? (
                <pre className="code-bubble">
                  <code>{q.answer}</code>
                </pre>
              ) : (
                <div className="answer-bubble">{q.answer}</div>
              )}

              {q.feedback && (
                <div className="feedback-box">
                  <div className="feedback-header">
                    <span>💬 Feedback</span>
                    {q.score != null && <span className="score-pill">{q.score}/10</span>}
                  </div>
                  <p>{q.feedback}</p>
                  <DimensionBars question={q} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isCompleted ? (
        <div className="panel completion-card">
          <div className="empty-icon">🎉</div>
          <h3>Interview Complete</h3>
          <p className="score-pill large">{interview.score}/100</p>
          <p className="muted">{interview.summary}</p>

          {interview.strengths?.length > 0 && (
            <div className="summary-section">
              <h4>💪 Strengths</h4>
              <div className="skill-chips">
                {interview.strengths.map((s) => (
                  <span className="chip chip-success" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interview.weakAreas?.length > 0 && (
            <div className="summary-section">
              <h4>🎯 Areas to Improve</h4>
              <div className="skill-chips">
                {interview.weakAreas.map((w) => (
                  <span className="chip chip-warning" key={w}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interview.recommendedTopics?.length > 0 && (
            <div className="summary-section">
              <h4>📚 Recommended Topics</h4>
              <div className="skill-chips">
                {interview.recommendedTopics.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="completion-actions">
            <Link to="/interview/new" className="primary-btn as-link">
              Start Another Interview
            </Link>
            <Link to="/interviews" className="ghost-btn as-link">
              View History
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel interview-room">
          <div className="interviewer-row">
            <p className="muted">Interviewer · AI-generated</p>
            {!isCodingRound && voiceModeOn && voice.ttsSupported && (
              <div className="voice-controls">
                {voice.isSpeaking && !voice.isPaused ? (
                  <button type="button" className="icon-btn" onClick={voice.pauseSpeaking} title="Pause">
                    ⏸️
                  </button>
                ) : voice.isSpeaking && voice.isPaused ? (
                  <button type="button" className="icon-btn" onClick={voice.resumeSpeaking} title="Resume">
                    ▶️
                  </button>
                ) : (
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => voice.speak(currentQuestion.question)}
                    title="Play question"
                  >
                    🔊
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="question-bubble">{currentQuestion.question}</div>

          <form onSubmit={handleSubmitAnswer} className="answer-form">
            {isCodingRound ? (
              <>
                <select
                  className="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={submitting}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <textarea
                  className="code-editor"
                  placeholder={`// Write your ${language} solution here...`}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={12}
                  spellCheck={false}
                  disabled={submitting}
                />
              </>
            ) : (
              <textarea
                placeholder={voice.isListening ? "Listening..." : "Type your answer here..."}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                disabled={submitting}
              />
            )}
            <div className="answer-form-actions">
              {!isCodingRound && voiceModeOn && voice.sttSupported && (
                <button
                  type="button"
                  className={`icon-btn mic-btn ${voice.isListening ? "recording" : ""}`}
                  onClick={voice.isListening ? voice.stopListening : voice.startListening}
                  disabled={submitting}
                  title={voice.isListening ? "Stop dictating" : "Dictate your answer"}
                >
                  {voice.isListening ? "⏹️ Stop" : "🎤 Speak Answer"}
                </button>
              )}
              <button type="submit" className="primary-btn" disabled={submitting || !answer.trim()}>
                {submitting ? "Evaluating..." : "Submit Answer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
