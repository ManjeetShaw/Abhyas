import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./AppLayout.css";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="center-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-shell-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="app-shell-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
