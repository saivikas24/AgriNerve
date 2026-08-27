import { useEffect, useState } from "react";
import "./WaterIntelligence.css";

interface Reservoir {
  id: number;
  source_id: number | null;
  district: string;
  mandal: string;
  reservoir: string;
  river: string | null;
  present_level_m: number | null;
  present_level_ft: number | null;
  present_capacity_mcum: number | null;
  present_capacity_tmc: number | null;
  frl_m: number | null;
  frl_ft: number | null;
  gross_capacity_mcum: number | null;
  gross_capacity_tmc: number | null;
  storage_percentage: number | null;
  updated_at: string | null;
  source: string;
  fetched_at: string;
}

const API_BASE = "http://127.0.0.1:8000/api/v1/water";

function getWaterStatus(storage: number | null) {
  if (storage === null) return "Unavailable";
  if (storage >= 60) return "Good";
  if (storage >= 40) return "Moderate";
  if (storage >= 20) return "Low";
  return "Critical";
}

function WaterIntelligence() {
  const [districts, setDistricts] = useState<string[]>([]);
  const [mandals, setMandals] = useState<string[]>([]);
  const [reservoirs, setReservoirs] = useState<Reservoir[]>([]);

  const [district, setDistrict] = useState("");
  const [mandal, setMandal] = useState("");
  const [reservoirId, setReservoirId] = useState("");

  const [selectedReservoir, setSelectedReservoir] =
    useState<Reservoir | null>(null);

  const [loadingDistricts, setLoadingDistricts] =
    useState(true);
  const [loadingMandals, setLoadingMandals] =
    useState(false);
  const [loadingReservoirs, setLoadingReservoirs] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDistricts() {
      try {
        setError("");

        const response = await fetch(
          `${API_BASE}/districts`,
        );

        if (!response.ok) {
          throw new Error(
            `District API returned ${response.status}`,
          );
        }

        const data: string[] = await response.json();
        setDistricts(data);
      } catch (err) {
        console.error("Water districts error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load districts.",
        );
      } finally {
        setLoadingDistricts(false);
      }
    }

    loadDistricts();
  }, []);

  useEffect(() => {
    if (!district) {
      setMandals([]);
      setMandal("");
      setReservoirs([]);
      setReservoirId("");
      setSelectedReservoir(null);
      return;
    }

    async function loadMandals() {
      try {
        setLoadingMandals(true);
        setError("");

        const params = new URLSearchParams();
        params.set("district", district);

        const response = await fetch(
          `${API_BASE}/mandals?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(
            `Mandal API returned ${response.status}`,
          );
        }

        const data: string[] = await response.json();

        setMandals(data);
        setMandal("");
        setReservoirs([]);
        setReservoirId("");
        setSelectedReservoir(null);
      } catch (err) {
        console.error("Water mandals error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load mandals.",
        );
      } finally {
        setLoadingMandals(false);
      }
    }

    loadMandals();
  }, [district]);

  useEffect(() => {
    if (!district || !mandal) {
      setReservoirs([]);
      setReservoirId("");
      setSelectedReservoir(null);
      return;
    }

    async function loadReservoirs() {
      try {
        setLoadingReservoirs(true);
        setError("");

        const params = new URLSearchParams();
        params.set("district", district);
        params.set("mandal", mandal);

        const response = await fetch(
          `${API_BASE}/reservoirs?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(
            `Reservoir API returned ${response.status}`,
          );
        }

        const data: Reservoir[] = await response.json();

        setReservoirs(data);

        if (data.length > 0) {
          setReservoirId(String(data[0].id));
          setSelectedReservoir(data[0]);
        } else {
          setReservoirId("");
          setSelectedReservoir(null);
        }
      } catch (err) {
        console.error("Water reservoirs error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load reservoirs.",
        );
      } finally {
        setLoadingReservoirs(false);
      }
    }

    loadReservoirs();
  }, [district, mandal]);

  function handleReservoirChange(value: string) {
    setReservoirId(value);

    const reservoir = reservoirs.find(
      (item) => String(item.id) === value,
    );

    setSelectedReservoir(reservoir ?? null);
  }

  const status = getWaterStatus(
    selectedReservoir?.storage_percentage ?? null,
  );

  return (
    <main className="water-page">
      <section className="water-page-header">
        <span className="water-eyebrow">
          WATER INTELLIGENCE
        </span>

        <h1>Water & Irrigation</h1>

        <p>
          Monitor reservoir conditions and water
          availability across Andhra Pradesh.
        </p>
      </section>

      <section className="water-filters">
        <div className="water-filter">
          <label htmlFor="water-district">
            District
          </label>

          <select
            id="water-district"
            value={district}
            onChange={(event) =>
              setDistrict(event.target.value)
            }
            disabled={loadingDistricts}
          >
            <option value="">
              {loadingDistricts
                ? "Loading districts..."
                : "Select district"}
            </option>

            {districts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="water-filter">
          <label htmlFor="water-mandal">
            Mandal
          </label>

          <select
            id="water-mandal"
            value={mandal}
            onChange={(event) =>
              setMandal(event.target.value)
            }
            disabled={!district || loadingMandals}
          >
            <option value="">
              {loadingMandals
                ? "Loading mandals..."
                : "Select mandal"}
            </option>

            {mandals.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="water-filter">
          <label htmlFor="water-reservoir">
            Reservoir
          </label>

          <select
            id="water-reservoir"
            value={reservoirId}
            onChange={(event) =>
              handleReservoirChange(event.target.value)
            }
            disabled={!mandal || loadingReservoirs}
          >
            <option value="">
              {loadingReservoirs
                ? "Loading reservoirs..."
                : "Select reservoir"}
            </option>

            {reservoirs.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.reservoir}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <section className="water-error">
          <strong>Unable to load water data</strong>
          <p>{error}</p>
        </section>
      )}

      {!error && !selectedReservoir && (
        <section className="water-empty">
          <div className="water-empty-icon">💧</div>

          <h2>Select a reservoir</h2>

          <p>
            Choose a district, mandal and reservoir
            to view its current water conditions.
          </p>
        </section>
      )}

      {selectedReservoir && (
        <>
          <section className="water-main-card">
            <div className="water-card-header">
              <div>
                <span className="water-eyebrow">
                  WATER SOURCE
                </span>

                <h2>
                  {selectedReservoir.reservoir}
                </h2>

                <p>
                  {selectedReservoir.district} ·{" "}
                  {selectedReservoir.mandal}
                  {selectedReservoir.river
                    ? ` · ${selectedReservoir.river} River`
                    : ""}
                </p>
              </div>

              <span
                className={`water-status water-status-${status.toLowerCase()}`}
              >
                {status}
              </span>
            </div>

            <div className="water-metrics">
              <div className="water-metric">
                <span>Storage</span>
                <strong>
                  {selectedReservoir.storage_percentage !==
                  null
                    ? `${selectedReservoir.storage_percentage}%`
                    : "Unavailable"}
                </strong>
              </div>

              <div className="water-metric">
                <span>Current capacity</span>
                <strong>
                  {selectedReservoir.present_capacity_tmc !==
                  null
                    ? `${selectedReservoir.present_capacity_tmc.toFixed(2)} TMC`
                    : "Unavailable"}
                </strong>
              </div>

              <div className="water-metric">
                <span>Gross capacity</span>
                <strong>
                  {selectedReservoir.gross_capacity_tmc !==
                  null
                    ? `${selectedReservoir.gross_capacity_tmc.toFixed(2)} TMC`
                    : "Unavailable"}
                </strong>
              </div>

              <div className="water-metric">
                <span>Current level</span>
                <strong>
                  {selectedReservoir.present_level_m !==
                  null
                    ? `${selectedReservoir.present_level_m.toFixed(2)} m`
                    : "Unavailable"}
                </strong>
              </div>
            </div>
          </section>

          <section className="water-details">
            <div>
              <span>Full reservoir level</span>
              <strong>
                {selectedReservoir.frl_m !== null
                  ? `${selectedReservoir.frl_m.toFixed(2)} m`
                  : "Unavailable"}
              </strong>
            </div>

            <div>
              <span>Data source</span>
              <strong>
                {selectedReservoir.source}
              </strong>
            </div>

            <div>
              <span>Last updated</span>
              <strong>
                {selectedReservoir.updated_at
                  ? new Date(
                      selectedReservoir.updated_at,
                    ).toLocaleString()
                  : "Unavailable"}
              </strong>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default WaterIntelligence;
