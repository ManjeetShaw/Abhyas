const express = require("express");
const {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.patch("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

module.exports = router;
