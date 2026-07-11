import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard", end: true },
  { to: "/resume", icon: "📄", label: "Resume" },
  { to: "/interview/new", icon: "🎯", label: "Practice" },
  { to: "/interviews", icon: "🗂️", label: "History" },
  { to: "/ats-score", icon: "🔍", label: "ATS Score" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="sidebar-logo">Abhyas</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/help" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <span className="sidebar-icon" aria-hidden="true">
              ❓
            </span>
            Help
          </NavLink>
        </div>
      </aside>
    </>
  );
}
