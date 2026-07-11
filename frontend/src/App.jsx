import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./layouts/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import StartInterview from "./pages/StartInterview";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewHistory from "./pages/InterviewHistory";
import AtsScore from "./pages/AtsScore";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import Help from "./pages/Help";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume" element={<ResumeUpload />} />
            <Route path="/interview/new" element={<StartInterview />} />
            <Route path="/interview/:id" element={<InterviewRoom />} />
            <Route path="/interviews" element={<InterviewHistory />} />
            <Route path="/ats-score" element={<AtsScore />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/help" element={<Help />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
