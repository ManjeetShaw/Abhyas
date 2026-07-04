const Interview = require("../models/Interview");

// @route POST /api/interview/start
// Creates a new interview record. Actual AI-generated questions arrive in
// Phase 4 — for now we seed a single friendly opening question so the rest
// of the app (history, status, UI) has something real to render against.
const startInterview = async (req, res) => {
  try {
    const { role, type, difficulty } = req.body;

    if (!role || !type) {
      return res.status(400).json({ message: "Role and interview type are required" });
    }

    const interview = await Interview.create({
      userId: req.user.id,
      role,
      type,
      difficulty: difficulty || "Medium",
      status: "created",
      questions: [
        {
          question: `Tell me a bit about yourself and why you're interested in the ${role} role.`,
        },
      ],
    });

    res.status(201).json({ interview });
  } catch (err) {
    res.status(500).json({ message: "Could not start interview", error: err.message });
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

    res.status(200).json({
      totalInterviews,
      completedInterviews: completed.length,
      averageScore,
      topWeakAreas,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not compute stats", error: err.message });
  }
};

module.exports = { startInterview, listInterviews, getInterview, getStats };
