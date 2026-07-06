const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const { generateOpeningQuestion, evaluateAnswer, generateSessionSummary } = require("../services/aiService");

const MAX_QUESTIONS = 5;

// @route POST /api/interview/start
// Creates a new interview record with an AI-generated opening question,
// personalized against the candidate's resume when one is on file.
const startInterview = async (req, res) => {
  try {
    const { role, type, difficulty, personality, codingRound } = req.body;

    if (!role || !type) {
      return res.status(400).json({ message: "Role and interview type are required" });
    }

    const resume = await Resume.findOne({ userId: req.user.id });

    const question = await generateOpeningQuestion({
      role,
      type,
      difficulty: difficulty || "Medium",
      resumeText: resume?.extractedText,
      personality: personality || "Senior Engineer",
      codingRound: !!codingRound,
    });

    const interview = await Interview.create({
      userId: req.user.id,
      role,
      type,
      difficulty: difficulty || "Medium",
      personality: personality || "Senior Engineer",
      codingRound: !!codingRound,
      status: "created",
      questions: [{ question, language: codingRound ? "javascript" : null }],
    });

    res.status(201).json({ interview });
  } catch (err) {
    res.status(500).json({ message: "Could not start interview", error: err.message });
  }
};

// @route POST /api/interview/:id/answer
// Records the candidate's answer to the current (last, unanswered) question,
// gets AI feedback + score for it, and either appends the next question or
// marks the interview completed with an overall score.
const submitAnswer = async (req, res) => {
  try {
    const { answer, language } = req.body;
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: "Answer text is required" });
    }

    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    if (interview.status === "completed") {
      return res.status(400).json({ message: "This interview has already ended" });
    }

    const currentQuestion = interview.questions[interview.questions.length - 1];
    if (currentQuestion.answer) {
      return res.status(400).json({ message: "Current question has already been answered" });
    }

    currentQuestion.answer = answer.trim();
    if (interview.codingRound && language) {
      currentQuestion.language = language;
    }

    const resume = await Resume.findOne({ userId: req.user.id });
    const isFinalRound = interview.questions.length >= MAX_QUESTIONS;

    const history = interview.questions
      .filter((q) => q.answer)
      .map((q) => ({ question: q.question, answer: q.answer, language: q.language }));

    const { feedback, score, clarity, technicalAccuracy, completeness, confidence, followUpQuestion } =
      await evaluateAnswer({
        role: interview.role,
        type: interview.type,
        difficulty: interview.difficulty,
        resumeText: resume?.extractedText,
        history,
        isFinalRound,
        personality: interview.personality,
        codingRound: interview.codingRound,
      });

    currentQuestion.feedback = feedback;
    currentQuestion.score = score;
    currentQuestion.clarity = clarity;
    currentQuestion.technicalAccuracy = technicalAccuracy;
    currentQuestion.completeness = completeness;
    currentQuestion.confidence = confidence;

    if (isFinalRound || !followUpQuestion) {
      interview.status = "completed";
      const scored = interview.questions.filter((q) => q.score != null);
      interview.score = scored.length
        ? Math.round((scored.reduce((sum, q) => sum + q.score, 0) / scored.length) * 10)
        : null;

      const fullHistory = interview.questions
        .filter((q) => q.answer)
        .map((q) => ({
          question: q.question,
          answer: q.answer,
          clarity: q.clarity,
          technicalAccuracy: q.technicalAccuracy,
          completeness: q.completeness,
          confidence: q.confidence,
        }));

      const summaryResult = await generateSessionSummary({
        role: interview.role,
        type: interview.type,
        difficulty: interview.difficulty,
        history: fullHistory,
      });

      interview.summary = summaryResult.summary;
      interview.strengths = summaryResult.strengths || [];
      interview.weakAreas = summaryResult.weakAreas || [];
      interview.recommendedTopics = summaryResult.recommendedTopics || [];
    } else {
      interview.status = "in-progress";
      interview.questions.push({
        question: followUpQuestion,
        language: interview.codingRound ? language || currentQuestion.language : null,
      });
    }

    await interview.save();
    res.status(200).json({ interview });
  } catch (err) {
    res.status(500).json({ message: "Could not process answer", error: err.message });
  }
};

// @route GET /api/interview
const listInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("role type difficulty status score createdAt");
    res.status(200).json({ interviews });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch interviews", error: err.message });
  }
};

// @route GET /api/interview/:id
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.status(200).json({ interview });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch interview", error: err.message });
  }
};

// @route GET /api/interview/stats/summary
// Powers the dashboard: total interviews, average score, most recent
// strengths/weak areas across completed interviews.
const getStats = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id });
    const completed = interviews.filter((i) => i.status === "completed" && i.score != null);

    const totalInterviews = interviews.length;
    const averageScore = completed.length
      ? Math.round(completed.reduce((sum, i) => sum + i.score, 0) / completed.length)
      : null;

    const weakAreaCounts = {};
    completed.forEach((i) => {
      i.weakAreas.forEach((area) => {
        weakAreaCounts[area] = (weakAreaCounts[area] || 0) + 1;
      });
    });
    const topWeakAreas = Object.entries(weakAreaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area]) => area);

    const scoreHistory = completed
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((i) => ({ date: i.createdAt, score: i.score, role: i.role }));

    res.status(200).json({
      totalInterviews,
      completedInterviews: completed.length,
      averageScore,
      topWeakAreas,
      scoreHistory,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not compute stats", error: err.message });
  }
};

module.exports = { startInterview, submitAnswer, listInterviews, getInterview, getStats };
