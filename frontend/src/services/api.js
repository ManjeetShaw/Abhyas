import axios from "axios";

// In dev, this defaults to the local backend. In production, set
// VITE_API_URL in your hosting provider's environment variables
// (e.g. Vercel) to your deployed backend's URL, e.g.
// https://your-backend.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
