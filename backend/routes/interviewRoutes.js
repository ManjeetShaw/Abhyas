const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  startInterview,
  listInterviews,
  getInterview,
  getStats,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/start", protect, startInterview);
router.get("/stats/summary", protect, getStats);
router.get("/", protect, listInterviews);
router.get("/:id", protect, getInterview);

module.exports = router;
