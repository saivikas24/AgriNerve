import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { getFarms, createFarm, updateFarm } from "../../api/farms";

import "./FarmSetup.css";

function FarmSetup() {
  const navigate = useNavigate();

  const [farmId, setFarmId] = useState<number | null>(null);

  const [form, setForm] = useState({
    farm_name: "",
    village: "",
    district: "",
    state: "Andhra Pradesh",
    area_acres: "",
    soil_type: "",
    irrigation_type: "",
    preferred_market: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingFarm, setLoadingFarm] = useState(true);
  const [error, setError] = useState("");

  const [markets, setMarkets] = useState<string[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);

  /*
   * Load available APMC markets.
   */
  useEffect(() => {
    async function loadMarkets() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/market/markets",
        );

        if (!response.ok) {
          throw new Error("Unable to load markets.");
        }

        const data: string[] = await response.json();

        setMarkets(data);
      } catch (err) {
        console.error("Market loading error:", err);
        setMarkets([]);
      } finally {
        setMarketsLoading(false);
      }
    }

    loadMarkets();
  }, []);

  /*
   * If an active farm already exists,
   * load it so this page can edit it.
   *
   * If no active farm exists, this remains
   * a normal new-farm setup page.
   */
  useEffect(() => {
    async function loadExistingFarm() {
      try {
        const activeFarmId = localStorage.getItem(
          "agrinerve_active_farm_id",
        );

        if (!activeFarmId) {
          setLoadingFarm(false);
          return;
        }

        const farms = await getFarms();

        const activeFarm = farms.find(
          (farm) => farm.id === Number(activeFarmId),
        );

        if (!activeFarm) {
          localStorage.removeItem(
            "agrinerve_active_farm_id",
          );

          setLoadingFarm(false);
          return;
        }

        setFarmId(activeFarm.id);

        setForm({
          farm_name: activeFarm.farm_name,
          village: activeFarm.village ?? "",
          district: activeFarm.district ?? "",
          state: activeFarm.state,
          area_acres: String(activeFarm.area_acres),
          soil_type: activeFarm.soil_type ?? "",
          irrigation_type:
            activeFarm.irrigation_type ?? "",
          preferred_market:
            activeFarm.preferred_market ?? "",
        });
      } catch (err) {
        console.error(
          "Existing farm loading error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your farm.",
        );
      } finally {
        setLoadingFarm(false);
      }
    }

    loadExistingFarm();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    const area = Number(form.area_acres);

    if (!form.farm_name.trim()) {
      setError("Please enter your farm name.");
      return;
    }

    if (!area || area <= 0) {
      setError("Please enter a valid farm area.");
      return;
    }

    setLoading(true);

    try {
      if (farmId) {
        /*
         * Existing farm:
         * update instead of creating a duplicate.
         */
        await updateFarm(farmId, {
          farm_name: form.farm_name.trim(),
          village:
            form.village.trim() || undefined,
          district:
            form.district.trim() || undefined,
          state: form.state.trim(),
          area_acres: area,
          soil_type:
            form.soil_type || undefined,
          irrigation_type:
            form.irrigation_type || undefined,
          preferred_market:
            form.preferred_market || undefined,
        });

        navigate("/farmer/dashboard", {
          replace: true,
        });

        return;
      }

      /*
       * New farm:
       * create normally.
       */
      const createdFarm = await createFarm({
        farm_name: form.farm_name.trim(),
        village:
          form.village.trim() || undefined,
        district:
          form.district.trim() || undefined,
        state: form.state.trim(),
        area_acres: area,
        soil_type:
          form.soil_type || undefined,
        irrigation_type:
          form.irrigation_type || undefined,
        preferred_market:
          form.preferred_market || undefined,
      });

      localStorage.setItem(
        "agrinerve_active_farm_id",
        String(createdFarm.id),
      );

      navigate("/farmer/crop-setup");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your farm.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingFarm) {
    return (
      <main className="farm-setup-page">
        <section className="farm-setup-card">
          <p>Loading your farm...</p>
        </section>
      </main>
    );
  }

  const isEditing = farmId !== null;

  return (
    <main className="farm-setup-page">
      <section className="farm-setup-container">

        <div className="farm-setup-brand">
          <div className="farm-setup-logo">🌱</div>

          <h1>AgriNerve</h1>

          <p>
            Agricultural Decision Intelligence
          </p>
        </div>

        <div className="farm-setup-card">

          <div className="farm-setup-header">

            <span className="farm-setup-icon">
              🚜
            </span>

            <div>
              <h2>
                {isEditing
                  ? "Update your farm"
                  : "Set up your farm"}
              </h2>

              <p>
                {isEditing
                  ? "Update your farm details and preferred market."
                  : "Add your farm details so AgriNerve can personalize your agricultural intelligence."}
              </p>
            </div>

          </div>

          {error && (
            <div className="farm-setup-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="farm-section-title">
              Farm information
            </div>

            <div className="farm-form-grid">

              <div className="farm-form-group full-width">

                <label htmlFor="farm_name">
                  Farm name *
                </label>

                <input
                  id="farm_name"
                  type="text"
                  placeholder="e.g. Sai Farm"
                  value={form.farm_name}
                  onChange={(event) =>
                    updateField(
                      "farm_name",
                      event.target.value,
                    )
                  }
                  required
                />

              </div>

              <div className="farm-form-group">

                <label htmlFor="village">
                  Village
                </label>

                <input
                  id="village"
                  type="text"
                  placeholder="Enter village"
                  value={form.village}
                  onChange={(event) =>
                    updateField(
                      "village",
                      event.target.value,
                    )
                  }
                />

              </div>

              <div className="farm-form-group">

                <label htmlFor="district">
                  District
                </label>

                <input
                  id="district"
                  type="text"
                  placeholder="Enter district"
                  value={form.district}
                  onChange={(event) =>
                    updateField(
                      "district",
                      event.target.value,
                    )
                  }
                />

              </div>

              <div className="farm-form-group">

                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  type="text"
                  value={form.state}
                  onChange={(event) =>
                    updateField(
                      "state",
                      event.target.value,
                    )
                  }
                  required
                />

              </div>

              <div className="farm-form-group">

                <label htmlFor="area_acres">
                  Farm area (acres) *
                </label>

                <input
                  id="area_acres"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={form.area_acres}
                  onChange={(event) =>
                    updateField(
                      "area_acres",
                      event.target.value,
                    )
                  }
                  required
                />

              </div>

            </div>

            <div className="farm-section-title">
              Market preference
            </div>

            <div className="farm-form-grid">

              <div className="farm-form-group full-width">

                <label htmlFor="preferred_market">
                  Preferred APMC Market
                </label>

                <select
                  id="preferred_market"
                  value={form.preferred_market}
                  onChange={(event) =>
                    updateField(
                      "preferred_market",
                      event.target.value,
                    )
                  }
                  disabled={marketsLoading}
                >

                  <option value="">
                    {marketsLoading
                      ? "Loading markets..."
                      : "Select your preferred APMC market"}
                  </option>

                  {markets.map((market) => (
                    <option
                      key={market}
                      value={market}
                    >
                      {market}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            <div className="farm-section-title">
              Farm conditions
            </div>

            <div className="farm-form-grid">

              <div className="farm-form-group">

                <label htmlFor="soil_type">
                  Soil type
                </label>

                <select
                  id="soil_type"
                  value={form.soil_type}
                  onChange={(event) =>
                    updateField(
                      "soil_type",
                      event.target.value,
                    )
                  }
                >

                  <option value="">
                    Select soil type
                  </option>

                  <option value="Black Soil">
                    Black Soil
                  </option>

                  <option value="Red Soil">
                    Red Soil
                  </option>

                  <option value="Alluvial Soil">
                    Alluvial Soil
                  </option>

                  <option value="Sandy Soil">
                    Sandy Soil
                  </option>

                  <option value="Clay Soil">
                    Clay Soil
                  </option>

                  <option value="Loamy Soil">
                    Loamy Soil
                  </option>

                </select>

              </div>

              <div className="farm-form-group">

                <label htmlFor="irrigation_type">
                  Irrigation type
                </label>

                <select
                  id="irrigation_type"
                  value={form.irrigation_type}
                  onChange={(event) =>
                    updateField(
                      "irrigation_type",
                      event.target.value,
                    )
                  }
                >

                  <option value="">
                    Select irrigation type
                  </option>

                  <option value="Canal">
                    Canal
                  </option>

                  <option value="Borewell">
                    Borewell
                  </option>

                  <option value="Drip">
                    Drip
                  </option>

                  <option value="Sprinkler">
                    Sprinkler
                  </option>

                  <option value="Rainfed">
                    Rainfed
                  </option>

                </select>

              </div>

            </div>

            <div className="farm-setup-note">

              <span>🔄</span>

              <p>
                You can update these details later.
                AgriNerve will use them to improve
                recommendations for your farm.
              </p>

            </div>

            <button
              type="submit"
              className="farm-save-button"
              disabled={loading}
            >
              {loading
                ? isEditing
                  ? "Updating farm..."
                  : "Saving farm..."
                : isEditing
                  ? "Update Farm"
                  : "Save Farm & Continue ➡️"}
            </button>

          </form>

        </div>

      </section>
    </main>
  );
}

export default FarmSetup;