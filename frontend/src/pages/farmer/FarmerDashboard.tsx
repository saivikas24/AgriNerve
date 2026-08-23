import FarmProfileCard from "../../components/agriculture/FarmProfileCard";
import CropHealthCard from "../../components/agriculture/CropHealthCard";
import MarketCard from "../../components/agriculture/MarketCard";
import WaterStatusCard from "../../components/agriculture/WaterStatusCard";
import RecommendationCard from "../../components/agriculture/RecommendationCard";
import "./FarmerDashboard.css";

function FarmerDashboard() {
  return (
    <div className="farmer-dashboard">
      <section className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            FARM OVERVIEW
          </span>

          <h1>Good morning, Farmer 👋</h1>

          <p>
            Here's what AgriNerve sees across your farm today.
          </p>
        </div>

        <span className="demo-badge">
          DEMO DATA
        </span>
      </section>

      <FarmProfileCard
        farmerName="Demo Farmer"
        district="Krishna District"
        state="Andhra Pradesh"
        crop="Paddy"
        farmArea="2.4 acres"
        season="Kharif"
      />

      <section className="dashboard-metrics">
        <CropHealthCard
          cropName="Paddy"
          healthStatus="Healthy"
          riskLevel="Low"
          lastChecked="Today"
        />

        <MarketCard
          cropName="Paddy"
          currentPrice="₹7,250 / q"
          priceChange="+4.2%"
          trend="Rising"
          marketName="Local Market"
        />

        <WaterStatusCard
          availability="82%"
          status="Good"
          irrigationNeed="Low"
          source="Demo data"
        />
      </section>

      <RecommendationCard
        title="Monitor before you sell"
        message="Current demo conditions indicate stable crop health and a positive market trend. AgriNerve recommends monitoring the market before making a selling decision."
        action="Review market movement over the next few days."
        confidence="Demo — not model generated"
        priority="Low"
      />
    </div>
  );
}

export default FarmerDashboard;