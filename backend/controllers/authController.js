const crypto = require("crypto");
const User = require("../models/User");
const { generateToken, setTokenCookie } = require("../utils/generateToken");
const { sendPasswordResetEmail } = require("../services/emailService");

// @route POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password, targetRole });
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// @route POST /api/auth/logout
const logout = async (_req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't leak whether the email exists
      return res.status(200).json({ message: "If that account exists, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save({ validateBeforeSave: false });

    // CLIENT_URL may be a comma-separated list (multiple allowed origins) —
    // use the first one as the canonical link target for emails.
    const primaryClientUrl = (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")[0]
      .trim();
    const resetLink = `${primaryClientUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetLink });
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr.message);
      // Don't fail the request just because email delivery failed — the
      // token still exists and works if surfaced another way (e.g. logs
      // during local dev without an email key configured).
    }

    const response = { message: "If that account exists, a reset link has been sent" };
    if (!process.env.RESEND_API_KEY) {
      // No email provider configured (e.g. local dev) — surface the link
      // directly so the flow is still testable end-to-end.
      response.devResetLink = resetLink;
    }

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Could not process request", error: err.message });
  }
};

// @route POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Could not reset password", error: err.message });
  }
};

// @route PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, targetRole } = req.body;
    const user = await User.findById(req.user.id);

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      user.name = name.trim();
    }
    if (targetRole !== undefined) {
      user.targetRole = targetRole.trim();
    }

    await user.save();

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Could not update profile", error: err.message });
  }
};

// @route POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Could not change password", error: err.message });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
};
