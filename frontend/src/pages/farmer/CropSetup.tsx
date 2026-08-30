import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { getFarms } from "../../api/farms";
import { createCrop } from "../../api/crops";

import "./CropSetup.css";


function CropSetup() {
  const navigate = useNavigate();

  const [farmId, setFarmId] =
    useState<number | null>(null);

  const [preferredMarket, setPreferredMarket] =
    useState("");

  const [cropName, setCropName] =
    useState("");

  const [variety, setVariety] =
    useState("");

  const [varieties, setVarieties] =
    useState<string[]>([]);

  const [varietiesLoading, setVarietiesLoading] =
    useState(false);

  const [areaAcres, setAreaAcres] =
    useState("");

  const [sowingDate, setSowingDate] =
    useState("");

  const [harvestDate, setHarvestDate] =
    useState("");

  const [season, setSeason] =
    useState("Kharif");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
   * LOAD ACTIVE FARM
   */
  useEffect(() => {
    async function loadFarm() {
      try {
        const activeFarmId =
          localStorage.getItem(
            "agrinerve_active_farm_id",
          );

        if (!activeFarmId) {
          navigate("/farmer/setup", {
            replace: true,
          });
          return;
        }

        const farms = await getFarms();

        const activeFarm = farms.find(
          (farm) =>
            farm.id === Number(activeFarmId),
        );

        if (!activeFarm) {
          localStorage.removeItem(
            "agrinerve_active_farm_id",
          );

          navigate("/farmer/setup", {
            replace: true,
          });
          return;
        }

        setFarmId(Number(activeFarmId));

        setAreaAcres(
          String(activeFarm.area_acres),
        );

        setPreferredMarket(
          activeFarm.preferred_market ?? "",
        );

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load farm.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadFarm();
  }, [navigate]);


  /*
   * LOAD VARIETIES
   *
   * Crop selection is independent from
   * market availability.
   *
   * Currently our market dataset/API
   * supports Paddy(Common).
   */
  useEffect(() => {
    async function loadVarieties() {
      setVariety("");
      setVarieties([]);

      if (!cropName) {
        return;
      }

      /*
       * Current market dataset is Paddy based.
       *
       * Other crops can still be selected
       * and saved. They simply don't have
       * market variety data yet.
       */
      if (
        cropName.toLowerCase() !==
        "paddy"
      ) {
        return;
      }

      if (!preferredMarket) {
        return;
      }

      try {
        setVarietiesLoading(true);

        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/market/varieties?market=${encodeURIComponent(
            preferredMarket,
          )}`,
        );

        if (!response.ok) {
          setVarieties([]);
          return;
        }

        const data: string[] =
          await response.json();

        setVarieties(data);

      } catch (error) {
        console.error(
          "Unable to load market varieties:",
          error,
        );

        setVarieties([]);

      } finally {
        setVarietiesLoading(false);
      }
    }

    loadVarieties();
  }, [
    cropName,
    preferredMarket,
  ]);


  /*
   * SAVE CROP
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!farmId) {
      setError("Farm not found.");
      return;
    }

    if (!cropName.trim()) {
      setError(
        "Please enter the crop name.",
      );
      return;
    }

    const area = Number(areaAcres);

    if (
      !Number.isFinite(area) ||
      area <= 0
    ) {
      setError(
        "Please enter a valid crop area.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createCrop(farmId, {
        crop_name: cropName.trim(),

        variety:
          variety.trim() || undefined,

        area_acres: area,

        sowing_date:
          sowingDate || undefined,

        expected_harvest_date:
          harvestDate || undefined,

        season:
          season || undefined,

        status: "growing",
      });

      navigate("/farmer/dashboard", {
        replace: true,
      });

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save crop.",
      );
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <main className="crop-setup-page">

        <section className="crop-setup-card">

          <p>
            Loading your farm...
          </p>

        </section>

      </main>
    );
  }


  return (
    <main className="crop-setup-page">

      <section className="crop-setup-card">

        <div className="crop-setup-header">

          <span className="crop-setup-eyebrow">
            CROP SETUP
          </span>

          <h1>
            Add your crop
          </h1>

          <p>
            Tell AgriNerve what you are growing.
            This information will power your crop,
            market and agricultural intelligence.
          </p>

        </div>


        {error && (
          <div className="crop-setup-error">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          <div className="crop-form-grid">

            {/* CROP */}

            <div className="crop-form-group">

              <label htmlFor="crop-name">
                Crop name *
              </label>

              <select
                id="crop-name"
                value={cropName}
                onChange={(event) =>
                  setCropName(
                    event.target.value,
                  )
                }
                required
              >

                <option value="">
                  Select crop
                </option>

                <option value="Paddy">
                  Paddy
                </option>

                <option value="Maize">
                  Maize
                </option>

                <option value="Cotton">
                  Cotton
                </option>

                <option value="Chilli">
                  Chilli
                </option>

                <option value="Groundnut">
                  Groundnut
                </option>

                <option value="Sugarcane">
                  Sugarcane
                </option>

                <option value="Turmeric">
                  Turmeric
                </option>

                <option value="Red Gram">
                  Red Gram
                </option>

                <option value="Black Gram">
                  Black Gram
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            {/* VARIETY */}

            <div className="crop-form-group">

              <label htmlFor="variety">
                Variety
              </label>

              <select
                id="variety"
                value={variety}
                onChange={(event) =>
                  setVariety(
                    event.target.value,
                  )
                }
                disabled={
                  !cropName ||
                  varietiesLoading
                }
              >

                <option value="">
                  {!cropName
                    ? "Select crop first"
                    : varietiesLoading
                      ? "Loading varieties..."
                      : varieties.length > 0
                        ? "Select variety"
                        : "No market varieties available"}
                </option>

                {varieties.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ),
                )}

              </select>

              {/* Market availability message */}

              {cropName &&
                cropName.toLowerCase() !==
                  "paddy" && (
                  <small
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color:
                        "var(--text-secondary)",
                      fontSize: "11px",
                    }}
                  >
                    Market intelligence for{" "}
                    {cropName} is not
                    currently available in
                    the selected market.
                    You can still continue
                    with this crop.
                  </small>
                )}

              {cropName &&
                cropName.toLowerCase() ===
                  "paddy" &&
                preferredMarket &&
                varieties.length === 0 &&
                !varietiesLoading && (
                  <small
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color:
                        "var(--text-secondary)",
                      fontSize: "11px",
                    }}
                  >
                    No Paddy varieties are
                    currently available for
                    {` ${preferredMarket}`}.
                    You can still continue
                    with this crop.
                  </small>
                )}

            </div>


            {/* AREA */}

            <div className="crop-form-group">

              <label htmlFor="area">
                Crop area (acres) *
              </label>

              <input
                id="area"
                type="number"
                min="0.01"
                step="0.01"
                value={areaAcres}
                onChange={(event) =>
                  setAreaAcres(
                    event.target.value,
                  )
                }
                required
              />

            </div>


            {/* SEASON */}

            <div className="crop-form-group">

              <label htmlFor="season">
                Season
              </label>

              <select
                id="season"
                value={season}
                onChange={(event) =>
                  setSeason(
                    event.target.value,
                  )
                }
              >

                <option value="Kharif">
                  Kharif
                </option>

                <option value="Rabi">
                  Rabi
                </option>

                <option value="Zaid">
                  Zaid
                </option>

                <option value="Year-round">
                  Year-round
                </option>

              </select>

            </div>


            {/* SOWING DATE */}

            <div className="crop-form-group">

              <label htmlFor="sowing-date">
                Sowing date
              </label>

              <input
                id="sowing-date"
                type="date"
                value={sowingDate}
                onChange={(event) =>
                  setSowingDate(
                    event.target.value,
                  )
                }
              />

            </div>


            {/* HARVEST DATE */}

            <div className="crop-form-group">

              <label htmlFor="harvest-date">
                Expected harvest date
              </label>

              <input
                id="harvest-date"
                type="date"
                value={harvestDate}
                onChange={(event) =>
                  setHarvestDate(
                    event.target.value,
                  )
                }
              />

            </div>

          </div>


          <div className="crop-setup-info">

            <strong>
              Why we need this
            </strong>

            <p>
              Your crop and sowing information
              helps AgriNerve provide more
              relevant disease, market, water
              and farming recommendations.
            </p>

          </div>


          <div className="crop-setup-actions">

            <button
              type="button"
              className="crop-cancel-button"
              onClick={() =>
                navigate(
                  "/farmer/dashboard",
                )
              }
              disabled={saving}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="crop-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving crop..."
                : "Save crop & continue"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}


export default CropSetup;