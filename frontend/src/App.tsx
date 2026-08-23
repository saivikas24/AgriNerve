import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import OfficerDashboard from "./pages/officer/officerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/farmer/dashboard"
          element={<FarmerDashboard />}
        />

        <Route
          path="/officer/dashboard"
          element={<OfficerDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;