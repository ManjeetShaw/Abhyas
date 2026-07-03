const fs = require("fs");
const Resume = require("../models/Resume");
const { parseResumeFile } = require("../services/resumeParser");

// @route POST /api/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const parsed = await parseResumeFile(req.file.path);

    // Replace any existing resume for this user (delete old file first)
    const existing = await Resume.findOne({ userId: req.user.id });
    if (existing && fs.existsSync(existing.filePath)) {
      fs.unlinkSync(existing.filePath);
    }

    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        extractedText: parsed.extractedText,
        skills: parsed.skills,
        experience: parsed.experience,
        education: parsed.education,
        projects: parsed.projects,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      message: "Resume uploaded and parsed successfully",
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        projects: resume.projects,
        uploadedAt: resume.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Resume upload failed", error: err.message });
  }
};

// @route GET /api/resume
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "No resume uploaded yet" });
    }
    res.status(200).json({ resume });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch resume", error: err.message });
  }
};

// @route DELETE /api/resume
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "No resume to delete" });
    }
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }
    await resume.deleteOne();
    res.status(200).json({ message: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete resume", error: err.message });
  }
};

module.exports = { uploadResume, getResume, deleteResume };
