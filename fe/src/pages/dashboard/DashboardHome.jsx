import { useContext } from "react";
import { AuthContext } from "../../context/auth.context";
import "./dashboard.css";

export default function DashboardHome() {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard-home">
      {/* Greeting */}
      <section className="welcome">
        <h1>Welcome back 👋</h1>
        <p className="user-email">{user?.email}</p>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stat-card">
          <h3>Todos</h3>
          <p className="stat-number">0</p>
          <span className="stat-hint">Tasks pending</span>
        </div>

        <div className="stat-card">
          <h3>Groups</h3>
          <p className="stat-number">0</p>
          <span className="stat-hint">Joined groups</span>
        </div>

        <div className="stat-card">
          <h3>Money</h3>
          <p className="stat-number">$0</p>
          <span className="stat-hint">This month</span>
        </div>
      </section>

      {/* Quick actions */}
      <section className="quick-actions">
        <h2>Quick actions</h2>

        <div className="actions">
          <a href="/dashboard/todos">➕ Create todo</a>
          <a href="/dashboard/groups">👥 Create group</a>
          <a href="/dashboard/money">💰 Add transaction</a>
        </div>
      </section>
    </div>
  );
}