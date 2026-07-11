import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../hooks/useTheme";
import api from "../services/api";

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [allInterviews, setAllInterviews] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    api
      .get("/interview")
      .then(({ data }) => setAllInterviews(data.interviews || []))
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = query.trim()
    ? allInterviews.filter((i) => i.role.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        ☰
      </button>

      <div className="topbar-search" ref={searchRef}>
        <input
          type="text"
          placeholder="Search your interviews..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          aria-label="Search interviews"
        />
        {searchOpen && query.trim() && (
          <div className="topbar-search-results">
            {results.length === 0 ? (
              <div className="topbar-search-empty">No interviews match "{query}"</div>
            ) : (
              results.map((i) => (
                <Link
                  to={`/interview/${i._id}`}
                  key={i._id}
                  className="topbar-search-item"
                  onClick={() => {
                    setQuery("");
                    setSearchOpen(false);
                  }}
                >
                  <span>{i.role}</span>
                  <span className="topbar-search-tag">{i.type}</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        <button
          className="topbar-icon-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="topbar-dropdown-wrap" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            🔔
          </button>
          {notifOpen && (
            <div className="topbar-dropdown notif-dropdown">
              <p className="topbar-dropdown-title">Notifications</p>
              <div className="topbar-dropdown-empty">You're all caught up — no notifications yet.</div>
            </div>
          )}
        </div>

        <div className="topbar-dropdown-wrap" ref={menuRef}>
          <button
            className="topbar-avatar-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Account menu"
            aria-expanded={menuOpen}
          >
            <span className="topbar-avatar">{initials(user?.name)}</span>
            <span className="topbar-dots">⋮</span>
          </button>
          {menuOpen && (
            <div className="topbar-dropdown account-dropdown">
              <div className="account-dropdown-header">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <Link to="/profile" className="topbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                My Profile
              </Link>
              <Link
                to="/account-settings"
                className="topbar-dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                Account Settings
              </Link>
              <Link to="/help" className="topbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                Help
              </Link>
              <button className="topbar-dropdown-item danger" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
