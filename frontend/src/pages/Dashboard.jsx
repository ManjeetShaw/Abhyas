import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.name} 👋</h1>
        <button onClick={logout}>Log out</button>
      </header>

      <section className="dashboard-body">
        <p>
          Your dashboard will show resume status, previous interviews, and progress here.
        </p>
        <p className="muted">
          Coming in Phase 2: Resume Upload &amp; Parsing.
        </p>
      </section>
    </div>
  );
}
