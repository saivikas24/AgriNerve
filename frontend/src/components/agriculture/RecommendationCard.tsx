import "./RecommendationCard.css";

interface RecommendationCardProps {
  title: string;
  message: string;
  action: string;
  confidence: string;
  priority: "Low" | "Medium" | "High";
}

function RecommendationCard({
  title,
  message,
  action,
  confidence,
  priority,
}: RecommendationCardProps) {
  const priorityClass =
    priority === "High"
      ? "recommendation-priority-high"
      : priority === "Medium"
        ? "recommendation-priority-medium"
        : "recommendation-priority-low";

  return (
    <section className="recommendation-card">
      <div className="recommendation-header">
        <div className="recommendation-icon">
          🧠
        </div>

        <div>
          <span className="recommendation-eyebrow">
            AGRINERVE RECOMMENDS
          </span>

          <h2>{title}</h2>
        </div>

        <span className={`recommendation-priority ${priorityClass}`}>
          {priority} priority
        </span>
      </div>

      <div className="recommendation-content">
        <p>{message}</p>

        <div className="recommendation-action">
          <span>Suggested action</span>

          <strong>{action}</strong>
        </div>
      </div>

      <div className="recommendation-footer">
        <span>
          Decision confidence
        </span>

        <strong>{confidence}</strong>
      </div>
    </section>
  );
}

export default RecommendationCard;