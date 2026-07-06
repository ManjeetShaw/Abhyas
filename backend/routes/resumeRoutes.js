const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadResume, getResume, deleteResume, getAtsScore } = require("../controllers/resumeController");

const router = express.Router();

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.post("/ats-score", protect, getAtsScore);
router.get("/", protect, getResume);
router.delete("/", protect, deleteResume);

module.exports = router;
