import "./MarketCard.css";

interface MarketCardProps {
  cropName: string;
  currentPrice: string;
  priceChange: string;
  trend: "Rising" | "Stable" | "Falling";
  marketName: string;
}

function MarketCard({
  cropName,
  currentPrice,
  priceChange,
  trend,
  marketName,
}: MarketCardProps) {
  const trendClass =
    trend === "Rising"
      ? "status-success"
      : trend === "Stable"
        ? "status-info"
        : "status-danger";

  const trendIcon =
    trend === "Rising"
      ? "↗"
      : trend === "Stable"
        ? "→"
        : "↘";

  return (
    <section className="agri-card market-card">
      <div className="metric-card-header">
        <div>
          <span className="metric-card-eyebrow">
            MARKET INTELLIGENCE
          </span>

          <h3 className="metric-card-title">
            {cropName}
          </h3>
        </div>

        <div className="metric-card-icon market-icon">
          📈
        </div>
      </div>

      <div className="market-price">
        <span>Current market price</span>

        <strong>{currentPrice}</strong>
      </div>

      <div className="market-trend">
        <span className={`status-badge ${trendClass}`}>
          {trendIcon} {trend}
        </span>

        <span className="market-change">
          {priceChange}
        </span>
      </div>

      <div className="market-location">
        <span>Market</span>

        <strong>{marketName}</strong>
      </div>
    </section>
  );
}

export default MarketCard;