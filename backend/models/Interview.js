const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    feedback: { type: String, default: "" },
    score: { type: Number, default: null },
    followUps: { type: [String], default: [] },
  },
  { _id: true, timestamps: true }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Technical", "HR", "Behavioral", "System Design"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["created", "in-progress", "completed"],
      default: "created",
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    score: {
      type: Number,
      default: null,
    },
    summary: {
      type: String,
      default: "",
    },
    strengths: {
      type: [String],
      default: [],
    },
    weakAreas: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
