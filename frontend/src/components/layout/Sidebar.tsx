import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
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
        <span className="navigation-label">FARM MANAGEMENT</span>

        <NavLink
          to="/farmer/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">⌂</span>
          <span>My Farm</span>
        </NavLink>

        <button className="sidebar-link future-link" disabled>
          <span className="sidebar-icon">🌿</span>
          <span>Crop Health</span>
          <small>Coming soon</small>
        </button>

        <button className="sidebar-link future-link" disabled>
          <span className="sidebar-icon">📈</span>
          <span>Market Intelligence</span>
          <small>Coming soon</small>
        </button>

        <button className="sidebar-link future-link" disabled>
          <span className="sidebar-icon">💧</span>
          <span>Water & Irrigation</span>
          <small>Coming soon</small>
        </button>

        <button className="sidebar-link future-link" disabled>
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
        <span>AgriNerve</span>
        <span>AP Edition</span>
      </div>
    </aside>
  );
}

export default Sidebar;