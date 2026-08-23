import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import OfficerDashboard from "./pages/officer/officerDashboard";

import FarmerLayout from "./layouts/FarmerLayout";
import DiseaseDetection from "./pages/farmer/DiseaseDetection";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Farmer Application */}
        <Route element={<FarmerLayout />}>

          <Route
            path="/farmer/dashboard"
            element={<FarmerDashboard />}
          />
              <Route
               path="/farmer/disease-detection"
               element={<DiseaseDetection />}
              />

        </Route>

        {/* Officer */}
        <Route
          path="/officer/dashboard"
          element={<OfficerDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;