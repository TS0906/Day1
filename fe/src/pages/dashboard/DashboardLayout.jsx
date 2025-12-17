import { NavLink, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/auth.context";
import "./dashboard.css";
export default function DashboardLayout(){
    const {user, logout} = useContext(AuthContext);
    return (
        <div className="dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
            <h2 className="logo">MyApp</h2>
            <nav>
                <NavLink to="/dashboard" end>Home</NavLink>
                <NavLink to="/dashboard/todos">Todos</NavLink>
                <NavLink to="/dashboard/groups">Groups</NavLink>
                <NavLink to="/dashboard/money">Money</NavLink>
            </nav>
            </aside>
             {/* Main */}
            <main className="main">
                <header className="header">
                    <span>{user?.email}</span>
                    <button onClick={logout}>Logout</button>
                </header>
                <section className="content">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}