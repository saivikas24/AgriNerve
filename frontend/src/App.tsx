import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verification from "./pages/auth/Verification";

import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import DiseaseDetection from "./pages/farmer/DiseaseDetection";
import MarketIntelligence from "./pages/farmer/MarketIntelligence";
import WaterIntelligence from "./pages/farmer/WaterIntelligence";
import FarmSetup from "./pages/farmer/FarmSetup";
import CropSetup from "./pages/farmer/CropSetup";
import AgriAdvisor from "./pages/farmer/AgriAdvisor";

import OfficerDashboard from "./pages/officer/officerDashboard";

import FarmerLayout from "./layouts/FarmerLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verification"
          element={<Verification />}
        />

        <Route element={<FarmerLayout />}>

          <Route
            path="/farmer/dashboard"
            element={<FarmerDashboard />}
          />

          <Route
            path="/farmer/setup"
            element={<FarmSetup />}
          />

          <Route
            path="/farmer/crop-setup"
            element={<CropSetup />}
          />

          <Route
            path="/farmer/disease-detection"
            element={<DiseaseDetection />}
          />

          <Route
            path="/farmer/market-intelligence"
            element={<MarketIntelligence />}
          />

          <Route
            path="/farmer/water-intelligence"
            element={<WaterIntelligence />}
          />

          <Route
            path="/farmer/advisor"
            element={<AgriAdvisor />}
          />

        </Route>

        <Route
          path="/officer/dashboard"
          element={<OfficerDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;