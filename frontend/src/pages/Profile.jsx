import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>My Profile</h1>
      </header>

      <div className="panel">
        <div className="profile-row">
          <span className="topbar-avatar profile-avatar-lg">
            {user?.name
              ?.split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <div>
            <h3 style={{ margin: "0 0 4px" }}>{user?.name}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {user?.email}
            </p>
          </div>
        </div>

        <div className="profile-detail-row">
          <span className="muted">Target Role</span>
          <span>{user?.targetRole || "Not set"}</span>
        </div>

        <Link to="/account-settings" className="ghost-btn as-link" style={{ marginTop: 20 }}>
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
