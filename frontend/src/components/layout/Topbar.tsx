import "./Topbar.css";
function Topbar() {
  return (
    <header className="agri-topbar">
      <div className="topbar-heading">
        <span className="topbar-eyebrow">AGRI-NERVE FARMER PORTAL</span>

        <h2>Good morning 👋</h2>

        <p>
          Your agricultural intelligence at a glance
        </p>
      </div>

      <div className="topbar-actions">
        <button className="notification-button" aria-label="Notifications">
          🔔
        </button>

        <div className="profile-area">
          <div className="profile-avatar">
            F
          </div>

          <div className="profile-details">
            <strong>Farmer</strong>
            <span>Andhra Pradesh</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;