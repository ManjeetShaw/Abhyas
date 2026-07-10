require("dotenv").config();
const dns = require("node:dns");
// Some networks/OS DNS resolvers don't reliably resolve MongoDB Atlas's
// SRV records. Pointing Node directly at public DNS avoids ECONNREFUSED
// errors on `mongodb+srv://` URIs.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
// CLIENT_URL can be a comma-separated list, e.g.
// "https://abhyas.binarybuilds.online,https://abhyas-seven.vercel.app"
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin header) and any listed origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "abhyas-backend" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Abhyas backend running on port ${PORT}`));
};

start();

module.exports = app;
