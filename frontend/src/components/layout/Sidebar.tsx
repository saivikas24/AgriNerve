import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("agrinerve_access_token");
    navigate("/login");
  }

  return (
    <aside className="agri-sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">🌱</div>

        <div>
          <h1>AgriNerve</h1>
          <span>Decision Intelligence</span>
        </div>
      </div>

      {/* Farmer context */}
      <div className="farm-context">
        <span className="context-label">YOUR FARM</span>

        <div className="farm-location">
          <span>📍</span>

          <div>
            <strong>Andhra Pradesh</strong>
            <small>Farmer Portal</small>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation">

        <span className="navigation-label">
          FARM MANAGEMENT
        </span>

        {/* Working */}
        <NavLink
          to="/farmer/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">🏠</span>
          <span>Dashboard</span>
        </NavLink>

        {/* Working */}
        <NavLink
          to="/farmer/disease-detection"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">🌿</span>
          <span>Crop Health</span>
        </NavLink>

        {/* Working */}
        <NavLink
          to="/farmer/market-intelligence"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">📈</span>
          <span>Market Intelligence</span>
        </NavLink>

              {/* Working */}
        <NavLink
          to="/farmer/water-intelligence"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">💧</span>
          <span>Water & Irrigation</span>
        </NavLink>

        {/* Future */}
        <button
          type="button"
          className="sidebar-link future-link"
          disabled
        >
          <span className="sidebar-icon">🤖</span>
          <span>Agri Advisor</span>
          <small>Coming soon</small>
        </button>

      </nav>

      {/* Regional identity */}
      <div className="regional-card">
        <span className="regional-icon">🌾</span>

        <div>
          <strong>Mana Bhoomi</strong>
          <p>మన భూమి • Our Land</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="sidebar-footer">

        <div className="sidebar-footer-brand">
          <span>AgriNerve</span>
          <span>AP Edition</span>
        </div>

        {/* Logout */}
        <button
          type="button"
          className="sidebar-link logout-link"
          onClick={handleLogout}
        >
          <span className="sidebar-icon">🚪</span>
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;
