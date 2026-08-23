import "./AgricultureCards.css";

interface CropHealthCardProps {
  cropName: string;
  healthStatus: "Healthy" | "At Risk" | "Critical";
  riskLevel: "Low" | "Medium" | "High";
  lastChecked: string;
}

function CropHealthCard({
  cropName,
  healthStatus,
  riskLevel,
  lastChecked,
}: CropHealthCardProps) {
  const statusClass =
    healthStatus === "Healthy"
      ? "status-success"
      : healthStatus === "At Risk"
        ? "status-warning"
        : "status-danger";

  return (
    <section className="agri-card crop-health-card">
      <div className="metric-card-header">
        <div>
          <span className="metric-card-eyebrow">
            CROP HEALTH
          </span>

          <h3 className="metric-card-title">
            {cropName}
          </h3>
        </div>

        <div className="metric-card-icon crop-health-icon">
          🌿
        </div>
      </div>

      <div className="health-status">
        <span className={`status-badge ${statusClass}`}>
          <span className="status-dot" />
          {healthStatus}
        </span>
      </div>

      <div className="metric-card-footer">
        <div>
          <span>Risk level</span>
          <strong>{riskLevel}</strong>
        </div>

        <div className="metric-last-checked">
          <span>Last checked</span>
          <strong>{lastChecked}</strong>
        </div>
      </div>
    </section>
  );
}

export default CropHealthCard;