import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PasswordInput from "../components/PasswordInput";

export default function AccountSettings() {
  const { user, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [targetRole, setTargetRole] = useState(user?.targetRole || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    setSavingProfile(true);
    try {
      await updateProfile({ name, targetRole });
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileErr(err.response?.data?.message || "Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    setSavingPw(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPwMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPwErr(err.response?.data?.message || "Could not change password");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Account Settings</h1>
      </header>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Edit Profile</h3>
        {profileErr && <div className="error-banner">{profileErr}</div>}
        {profileMsg && <div className="info-banner">{profileMsg}</div>}
        <form onSubmit={handleProfileSubmit} className="settings-form">
          <label>
            Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Target Role <span className="optional">(optional)</span>
            <input
              type="text"
              placeholder="e.g. Backend Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </label>
          <button type="submit" className="primary-btn" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Change Password</h3>
        {pwErr && <div className="error-banner">{pwErr}</div>}
        {pwMsg && <div className="info-banner">{pwMsg}</div>}
        <form onSubmit={handlePasswordSubmit} className="settings-form">
          <label>
            Current Password
            <PasswordInput
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label>
            New Password
            <PasswordInput
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
          <button type="submit" className="primary-btn" disabled={savingPw}>
            {savingPw ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
