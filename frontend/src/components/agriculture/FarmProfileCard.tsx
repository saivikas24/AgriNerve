import "./FarmProfileCard.css";
interface FarmProfileCardProps {
  farmerName: string;
  district: string;
  state: string;
  crop: string;
  farmArea: string;
  season: string;
}

function FarmProfileCard({
  farmerName,
  district,
  state,
  crop,
  farmArea,
  season,
}: FarmProfileCardProps) {
  return (
    <section className="farm-profile-card agri-card">
      <div className="farm-profile-header">
        <div>
          <span className="farm-profile-eyebrow">
            YOUR FARM
          </span>

          <h2>
            {farmerName}'s Farm
          </h2>

          <p>
            {district}, {state}
          </p>
        </div>

        <div className="farm-profile-icon">
          🌾
        </div>
      </div>

      <div className="farm-profile-details">
        <div className="farm-detail">
          <span className="farm-detail-label">
            CROP
          </span>

          <strong>{crop}</strong>
        </div>

        <div className="farm-detail">
          <span className="farm-detail-label">
            FARM AREA
          </span>

          <strong>{farmArea}</strong>
        </div>

        <div className="farm-detail">
          <span className="farm-detail-label">
            SEASON
          </span>

          <strong>{season}</strong>
        </div>
      </div>
    </section>
  );
}

export default FarmProfileCard;