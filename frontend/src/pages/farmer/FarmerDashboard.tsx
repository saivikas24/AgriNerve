import { useEffect, useState } from "react";

import FarmProfileCard from "../../components/agriculture/FarmProfileCard";
import CropHealthCard from "../../components/agriculture/CropHealthCard";
import MarketCard from "../../components/agriculture/MarketCard";
import WaterStatusCard from "../../components/agriculture/WaterStatusCard";
import WeatherStatusCard from "../../components/agriculture/WeatherStatusCard";
import RecommendationCard from "../../components/agriculture/RecommendationCard";

import "./FarmerDashboard.css";


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


type WaterStatus =
  | "Good"
  | "Moderate"
  | "Low"
  | "Critical";


function getWaterStatus(
  storage: number | null,
): WaterStatus {

  if (storage === null) {
    return "Critical";
  }

  if (storage >= 60) {
    return "Good";
  }

  if (storage >= 40) {
    return "Moderate";
  }

  if (storage >= 20) {
    return "Low";
  }

  return "Critical";
}


function getIrrigationNeed(
  storage: number | null,
): string {

  if (storage === null) {
    return "Unknown";
  }

  if (storage >= 60) {
    return "Low";
  }

  if (storage >= 40) {
    return "Moderate";
  }

  if (storage >= 20) {
    return "High";
  }

  return "Very high";
}


function FarmerDashboard() {

  const [districts, setDistricts] =
    useState<string[]>([]);

  const [mandals, setMandals] =
    useState<string[]>([]);

  const [reservoirs, setReservoirs] =
    useState<Reservoir[]>([]);

  const [selectedDistrict, setSelectedDistrict] =
    useState("");

  const [selectedMandal, setSelectedMandal] =
    useState("");

  const [selectedReservoirId, setSelectedReservoirId] =
    useState("");

  const [selectedReservoir, setSelectedReservoir] =
    useState<Reservoir | null>(null);

  const [loadingDistricts, setLoadingDistricts] =
    useState(true);

  const [loadingMandals, setLoadingMandals] =
    useState(false);

  const [loadingReservoirs, setLoadingReservoirs] =
    useState(false);

  const [waterError, setWaterError] =
    useState(false);


  /*
   * Load districts once.
   */
  useEffect(() => {

    const loadDistricts = async () => {

      try {

        setLoadingDistricts(true);

        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/water/districts"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load districts"
          );
        }

        const data: string[] =
          await response.json();

        setDistricts(data);

      } catch (error) {

        console.error(
          "District loading error:",
          error
        );

      } finally {

        setLoadingDistricts(false);

      }
    };


    loadDistricts();

  }, []);


  /*
   * Load mandals only after the user
   * explicitly selects a district.
   */
  useEffect(() => {

    if (!selectedDistrict) {

      setMandals([]);
      setSelectedMandal("");
      setReservoirs([]);
      setSelectedReservoirId("");
      setSelectedReservoir(null);

      return;
    }


    const loadMandals = async () => {

      try {

        setLoadingMandals(true);

        setMandals([]);
        setSelectedMandal("");
        setReservoirs([]);
        setSelectedReservoirId("");
        setSelectedReservoir(null);
        setWaterError(false);


        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/water/mandals?district=${encodeURIComponent(
            selectedDistrict
          )}`
        );


        if (!response.ok) {
          throw new Error(
            "Failed to load mandals"
          );
        }


        const data: string[] =
          await response.json();


        setMandals(data);

      } catch (error) {

        console.error(
          "Mandal loading error:",
          error
        );

        setMandals([]);

      } finally {

        setLoadingMandals(false);

      }

    };


    loadMandals();

  }, [selectedDistrict]);


  /*
   * Load reservoirs only after the user
   * explicitly selects a mandal.
   */
  useEffect(() => {

    if (
      !selectedDistrict ||
      !selectedMandal
    ) {

      setReservoirs([]);
      setSelectedReservoirId("");
      setSelectedReservoir(null);

      return;
    }


    const loadReservoirs = async () => {

      try {

        setLoadingReservoirs(true);
        setWaterError(false);

        setReservoirs([]);
        setSelectedReservoirId("");
        setSelectedReservoir(null);


        const url =
          `http://127.0.0.1:8000/api/v1/water/reservoirs?district=${encodeURIComponent(
            selectedDistrict
          )}&mandal=${encodeURIComponent(
            selectedMandal
          )}&limit=20`;


        const response =
          await fetch(url);


        if (!response.ok) {
          throw new Error(
            "Failed to load reservoirs"
          );
        }


        const data: Reservoir[] =
          await response.json();


        setReservoirs(data);

      } catch (error) {

        console.error(
          "Reservoir loading error:",
          error
        );

        setReservoirs([]);
        setWaterError(true);

      } finally {

        setLoadingReservoirs(false);

      }

    };


    loadReservoirs();

  }, [
    selectedDistrict,
    selectedMandal,
  ]);


  /*
   * Set the actual reservoir only after
   * the user explicitly selects it.
   */
  useEffect(() => {

    if (!selectedReservoirId) {

      setSelectedReservoir(null);

      return;
    }


    const reservoir =
      reservoirs.find(
        (item) =>
          String(item.id) ===
          selectedReservoirId
      );


    setSelectedReservoir(
      reservoir ?? null
    );

  }, [
    selectedReservoirId,
    reservoirs,
  ]);


  const storage =
    selectedReservoir?.storage_percentage ?? null;


  const waterStatus =
    getWaterStatus(storage);


  const irrigationNeed =
    getIrrigationNeed(storage);


  const availability =
    storage !== null
      ? `${storage.toFixed(1)}%`
      : "Unavailable";


  return (

    <div className="farmer-dashboard">

      <section className="dashboard-heading">

        <div>

          <span className="dashboard-eyebrow">
            FARM OVERVIEW
          </span>


          <h1>
            Good morning, Farmer ??
          </h1>


          <p>
            Here's what AgriNerve sees across
            your farm today.
          </p>

        </div>


        <span className="demo-badge">
          DEMO FARM
        </span>

      </section>


      <FarmProfileCard
        farmerName="Demo Farmer"
        district={
          selectedDistrict
            ? `${selectedDistrict} District`
            : "Select location"
        }
        state="Andhra Pradesh"
        crop="Paddy"
        farmArea="2.4 acres"
        season="Kharif"
      />


      {/* WATER LOCATION SELECTION */}

      <section
        className="agri-card"
        style={{
          marginTop: "20px",
          padding: "24px",
        }}
      >

        <span className="metric-card-eyebrow">
          WATER LOCATION
        </span>


        <h3
          className="metric-card-title"
          style={{
            marginTop: "6px",
          }}
        >
          Select your location
        </h3>


        <p
          style={{
            marginTop: "6px",
            marginBottom: "20px",
          }}
        >
          Select a district, mandal and
          reservoir to view water intelligence.
        </p>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "16px",
          }}
        >

          {/* DISTRICT */}

          <div>

            <label
              htmlFor="water-district"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              District
            </label>


            <select
              id="water-district"
              value={selectedDistrict}
              disabled={loadingDistricts}
              onChange={(event) => {

                setSelectedDistrict(
                  event.target.value
                );

              }}
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "white",
                fontSize: "14px",
              }}
            >

              <option value="">
                {loadingDistricts
                  ? "Loading districts..."
                  : "Select district"}
              </option>


              {districts.map(
                (district) => (

                  <option
                    key={district}
                    value={district}
                  >
                    {district}
                  </option>

                )
              )}

            </select>

          </div>


          {/* MANDAL */}

          <div>

            <label
              htmlFor="water-mandal"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Mandal
            </label>


            <select
              id="water-mandal"
              value={selectedMandal}
              disabled={
                !selectedDistrict ||
                loadingMandals
              }
              onChange={(event) => {

                setSelectedMandal(
                  event.target.value
                );

              }}
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "white",
                fontSize: "14px",
              }}
            >

              <option value="">
                {loadingMandals
                  ? "Loading mandals..."
                  : "Select mandal"}
              </option>


              {mandals.map(
                (mandal) => (

                  <option
                    key={mandal}
                    value={mandal}
                  >
                    {mandal}
                  </option>

                )
              )}

            </select>

          </div>


          {/* RESERVOIR */}

          <div>

            <label
              htmlFor="water-reservoir"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Reservoir
            </label>


            <select
              id="water-reservoir"
              value={selectedReservoirId}
              disabled={
                !selectedMandal ||
                loadingReservoirs
              }
              onChange={(event) => {

                setSelectedReservoirId(
                  event.target.value
                );

              }}
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "white",
                fontSize: "14px",
              }}
            >

              <option value="">
                {loadingReservoirs
                  ? "Loading reservoirs..."
                  : "Select reservoir"}
              </option>


              {reservoirs.map(
                (reservoir) => (

                  <option
                    key={reservoir.id}
                    value={reservoir.id}
                  >
                    {reservoir.reservoir}
                  </option>

                )
              )}

            </select>

          </div>

        </div>

      </section>


      <section className="dashboard-metrics">

        <CropHealthCard
          cropName="Paddy"
          healthStatus="Healthy"
          riskLevel="Low"
          lastChecked="Today"
        />


        <MarketCard
          cropName="Paddy"
          currentPrice="?7,250 / q"
          priceChange="+4.2%"
          trend="Rising"
          marketName="Local Market"
        />


        <WaterStatusCard
          availability={
            loadingReservoirs
              ? "Loading..."
              : waterError
                ? "Unavailable"
                : selectedReservoir
                  ? availability
                  : "Select reservoir"
          }

          status={
            loadingReservoirs || waterError
              ? "Critical"
              : selectedReservoir
                ? waterStatus
                : "Moderate"
          }

          irrigationNeed={
            loadingReservoirs
              ? "Loading..."
              : waterError
                ? "Unavailable"
                : selectedReservoir
                  ? irrigationNeed
                  : "Select reservoir"
          }

          source={
            loadingReservoirs
              ? "Loading..."
              : waterError
                ? "Unavailable"
                : selectedReservoir
                  ? "AP DES"
                  : "Waiting for selection"
          }
        />

      </section>


      <WeatherStatusCard
        district={selectedDistrict}
        mandal={selectedMandal}
      />

      {selectedReservoir &&
        !waterError && (

        <section
          className="agri-card"
          style={{
            marginTop: "20px",
            padding: "24px",
          }}
        >

          <span className="metric-card-eyebrow">
            WATER SOURCE
          </span>


          <h3
            className="metric-card-title"
            style={{
              marginTop: "6px",
            }}
          >
            {selectedReservoir.reservoir}
          </h3>


          <p
            style={{
              marginTop: "6px",
              marginBottom: "20px",
            }}
          >

            {selectedReservoir.district}
            {" · "}
            {selectedReservoir.mandal}

            {selectedReservoir.river
              ? ` · ${selectedReservoir.river} River`
              : ""}

          </p>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "16px",
            }}
          >

            <div>

              <span>
                Storage
              </span>

              <strong
                style={{
                  display: "block",
                  fontSize: "22px",
                  marginTop: "4px",
                }}
              >

                {storage !== null
                  ? `${storage.toFixed(1)}%`
                  : "—"}

              </strong>

            </div>


            <div>

              <span>
                Current capacity
              </span>

              <strong
                style={{
                  display: "block",
                  fontSize: "22px",
                  marginTop: "4px",
                }}
              >

                {selectedReservoir.present_capacity_tmc !== null
                  ? `${selectedReservoir.present_capacity_tmc.toFixed(2)} TMC`
                  : "—"}

              </strong>

            </div>


            <div>

              <span>
                Gross capacity
              </span>

              <strong
                style={{
                  display: "block",
                  fontSize: "22px",
                  marginTop: "4px",
                }}
              >

                {selectedReservoir.gross_capacity_tmc !== null
                  ? `${selectedReservoir.gross_capacity_tmc.toFixed(2)} TMC`
                  : "—"}

              </strong>

            </div>

          </div>


          <div
            style={{
              marginTop: "20px",
              fontSize: "13px",
              opacity: 0.7,
            }}
          >

            Source: AP DES

            {selectedReservoir.updated_at
              ? ` · Updated ${new Date(
                  selectedReservoir.updated_at
                ).toLocaleString()}`
              : ""}

          </div>

        </section>

      )}


      {selectedMandal &&
        !loadingReservoirs &&
        !waterError &&
        reservoirs.length === 0 && (

        <section
          className="agri-card"
          style={{
            marginTop: "20px",
            padding: "20px",
          }}
        >

          <strong>
            No reservoir found
          </strong>


          <p
            style={{
              marginTop: "6px",
            }}
          >
            No AP DES reservoir record is
            currently available for{" "}
            {selectedMandal}, {selectedDistrict}.

          </p>

        </section>

      )}


      {waterError && (

        <section
          className="agri-card"
          style={{
            marginTop: "20px",
            padding: "20px",
          }}
        >

          <strong>
            Water data temporarily unavailable
          </strong>


          <p
            style={{
              marginTop: "6px",
            }}
          >
            AgriNerve could not connect to
            the water data service.

          </p>

        </section>

      )}


      <RecommendationCard
        title="Water-aware farming insight"

        message={
          selectedReservoir
            ? `Current storage at ${selectedReservoir.reservoir} is ${availability}. AgriNerve is using this water condition as part of its agricultural decision intelligence.`
            : "Select a district, mandal and reservoir to view water intelligence."
        }

        action={
          selectedReservoir
            ? "Combine water conditions with crop and market conditions before making an irrigation decision."
            : "Select your location to continue."
        }

        confidence={
          selectedReservoir
            ? "Based on AP DES government water data"
            : "Waiting for location selection"
        }

        priority={
          selectedReservoir
            ? "Low"
            : "Low"
        }
      />

    </div>

  );
}


export default FarmerDashboard;





