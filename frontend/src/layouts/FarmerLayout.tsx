import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import "./FarmerLayout.css";

function FarmerLayout() {
  return (
    <div className="farmer-layout">
      <Sidebar />

      <div className="farmer-main">
        <Topbar />

        <main className="farmer-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default FarmerLayout;