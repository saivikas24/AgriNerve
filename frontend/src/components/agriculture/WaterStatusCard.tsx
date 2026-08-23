import "./WaterStatusCard.css";

interface WaterStatusCardProps {
  availability: string;
  status: "Good" | "Moderate" | "Low" | "Critical";
  irrigationNeed: string;
  source: string;
}

function WaterStatusCard({
  availability,
  status,
  irrigationNeed,
  source,
}: WaterStatusCardProps) {
  const statusClass =
    status === "Good"
      ? "status-success"
      : status === "Moderate"
        ? "status-warning"
        : status === "Low"
          ? "status-danger"
          : "status-danger";

  return (
    <section className="agri-card water-status-card">
      <div className="metric-card-header">
        <div>
          <span className="metric-card-eyebrow">
            WATER INTELLIGENCE
          </span>

          <h3 className="metric-card-title">
            Irrigation Status
          </h3>
        </div>

        <div className="metric-card-icon water-icon">
          💧
        </div>
      </div>

      <div className="water-main-status">
        <div className="water-availability">
          <span>Water availability</span>

          <strong>{availability}</strong>
        </div>

        <span className={`status-badge ${statusClass}`}>
          <span className="status-dot" />
          {status}
        </span>
      </div>

      <div className="water-details">
        <div>
          <span>Irrigation need</span>
          <strong>{irrigationNeed}</strong>
        </div>

        <div>
          <span>Data source</span>
          <strong>{source}</strong>
        </div>
      </div>
    </section>
  );
}

export default WaterStatusCard;