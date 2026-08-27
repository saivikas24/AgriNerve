import { useEffect, useState } from "react";
import { generateDecision } from "../../services/decisionEngine";
import {
  buildWaterIntelligence,
  fetchMandals,
  fetchReservoirs,
  type Reservoir,
  type WaterIntelligenceResult,
} from "../../services/waterIntelligence";
import { useFarmData } from "./dashboard/hooks/useFarmData";

interface MarketForecast {
  market: string;
  variety: string;
  current_date: string;
  current_price: number;
  forecast_date: string;
  forecast_price: number;
  expected_change: number;
  expected_change_percent: number;
  trend: string;
  recent_change: number;
  recent_change_percent: number;
  decision_signal: string;
  decision_title: string;
  decision_reason: string;
  forecast_horizon_days: number;
  method: string;
}

/*
 * ==================================================
 * NORMALIZE DISTRICT NAME
 * ==================================================
 *
 * Farm profile may contain:
 * "east godavari"
 *
 * Water API may expect:
 * "East Godavari"
 *
 * Keep this normalization in one place.
 */

function normalizeDistrictName(
  value: string,
): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const districtMap: Record<
    string,
    string
  > = {
    "east godavari": "East Godavari",
    "eastgodavari": "East Godavari",

    "west godavari": "West Godavari",
    "westgodavari": "West Godavari",

    "alluri sitharama raju":
      "Alluri Sitharama Raju",

    "ananthapuramu":
      "Ananthapuramu",

    "anantapur":
      "Ananthapuramu",

    "annamayya":
      "Annamayya",

    "bapatla":
      "Bapatla",

    "chittoor":
      "Chittoor",

    "dr. b.r. ambedkar konaseema":
      "Dr. B.R. Ambedkar Konaseema",

    "dr br ambedkar konaseema":
      "Dr. B.R. Ambedkar Konaseema",

    "eluru":
      "Eluru",

    "guntur":
      "Guntur",

    "kakinada":
      "Kakinada",

    "krishna":
      "Krishna",

    "kurnool":
      "Kurnool",

    "nandyal":
      "Nandyal",

    "ntr":
      "NTR",

    "palnadu":
      "Palnadu",

    "parvathipuram manyam":
      "Parvathipuram Manyam",

    "prakasham":
      "Prakasam",

    "nellore":
      "SPSR Nellore",

    "spsr nellore":
      "SPSR Nellore",

    "srikakulam":
      "Srikakulam",

    "tirupati":
      "Tirupati",

    "visakhapatnam":
      "Visakhapatnam",

    "vizianagaram":
      "Vizianagaram",

    "kadapa":
      "YSR Kadapa",

    "ysr kadapa":
      "YSR Kadapa",
  };

  return (
    districtMap[normalized] ??
    value.trim()
  );
}

function AgriAdvisor() {
  const {
    farm,
    farmLoading,
    farmError,
    crops,
  } = useFarmData();

  const activeCrop =
    crops.length > 0
      ? crops[0]
      : null;

  const [marketForecast, setMarketForecast] =
    useState<MarketForecast | null>(
      null,
    );

  const [marketLoading, setMarketLoading] =
    useState(false);

  const [marketDataFallback, setMarketDataFallback] =
    useState(false);

  const [mandals, setMandals] =
    useState<string[]>([]);

  const [reservoirs, setReservoirs] =
    useState<Reservoir[]>([]);

  const [selectedMandal, setSelectedMandal] =
    useState("");

  const [selectedReservoirId, setSelectedReservoirId] =
    useState("");

  const [waterIntelligence, setWaterIntelligence] =
    useState<WaterIntelligenceResult>(
      buildWaterIntelligence(null),
    );

  const [waterLoading, setWaterLoading] =
    useState(false);

  const [waterError, setWaterError] =
    useState("");

  /*
   * ==================================================
   * MARKET INTELLIGENCE
   * ==================================================
   */

  useEffect(() => {
    const loadMarketForecast = async () => {
      if (
        !activeCrop?.variety ||
        !farm?.preferred_market
      ) {
        setMarketForecast(null);
        setMarketDataFallback(false);
        return;
      }

      try {
        setMarketLoading(true);
        setMarketDataFallback(false);

        const market =
          farm.preferred_market;

        const varietiesResponse =
          await fetch(
            `http://127.0.0.1:8000/api/v1/market/varieties?market=${encodeURIComponent(
              market,
            )}`,
          );

        if (!varietiesResponse.ok) {
          setMarketForecast(null);
          return;
        }

        const availableVarieties: string[] =
          await varietiesResponse.json();

        let marketVariety =
          activeCrop.variety;

        let usingFallback = false;

        if (
          !availableVarieties.includes(
            activeCrop.variety,
          ) &&
          activeCrop.crop_name
            ?.toLowerCase()
            .includes("paddy") &&
          availableVarieties.includes(
            "1001",
          )
        ) {
          marketVariety = "1001";
          usingFallback = true;
        }

        if (
          !availableVarieties.includes(
            marketVariety,
          )
        ) {
          setMarketForecast(null);
          return;
        }

        const params =
          new URLSearchParams();

        params.set(
          "market",
          market,
        );

        params.set(
          "variety",
          marketVariety,
        );

        const response =
          await fetch(
            `http://127.0.0.1:8000/api/v1/market/forecast?${params.toString()}`,
          );

        if (!response.ok) {
          setMarketForecast(null);
          return;
        }

        const data: MarketForecast =
          await response.json();

        setMarketForecast(data);
        setMarketDataFallback(
          usingFallback,
        );
      } catch (error) {
        console.error(
          "Advisor market loading error:",
          error,
        );

        setMarketForecast(null);
        setMarketDataFallback(false);
      } finally {
        setMarketLoading(false);
      }
    };

    loadMarketForecast();
  }, [
    activeCrop?.variety,
    activeCrop?.crop_name,
    farm?.preferred_market,
  ]);

  /*
   * ==================================================
   * LOAD MANDALS FOR FARM DISTRICT
   * ==================================================
   */

  useEffect(() => {
    const loadMandals = async () => {
      if (!farm?.district) {
        setMandals([]);
        setSelectedMandal("");
        setReservoirs([]);
        setSelectedReservoirId("");

        setWaterIntelligence(
          buildWaterIntelligence(null),
        );

        return;
      }

      try {
        setWaterError("");

        const normalizedDistrict =
          normalizeDistrictName(
            farm.district,
          );

        const data =
          await fetchMandals(
            normalizedDistrict,
          );

        setMandals(data);

        /*
         * Do not automatically select
         * a mandal.
         *
         * Farmer should choose it.
         */

        setSelectedMandal("");
        setReservoirs([]);
        setSelectedReservoirId("");

        setWaterIntelligence(
          buildWaterIntelligence(null),
        );
      } catch (error) {
        console.error(
          "Advisor mandal loading error:",
          error,
        );

        setMandals([]);
        setSelectedMandal("");

        setWaterError(
          "Unable to load water locations.",
        );
      }
    };

    loadMandals();
  }, [farm?.district]);

  /*
   * ==================================================
   * LOAD RESERVOIRS
   * ==================================================
   */

  useEffect(() => {
    const loadReservoirs = async () => {
      if (
        !farm?.district ||
        !selectedMandal
      ) {
        setReservoirs([]);
        setSelectedReservoirId("");

        setWaterIntelligence(
          buildWaterIntelligence(null),
        );

        return;
      }

      try {
        setWaterLoading(true);
        setWaterError("");

        const normalizedDistrict =
          normalizeDistrictName(
            farm.district,
          );

        const data =
          await fetchReservoirs(
            normalizedDistrict,
            selectedMandal,
          );

        setReservoirs(data);

        /*
         * Do not automatically select
         * a reservoir.
         */

        setSelectedReservoirId("");

        setWaterIntelligence(
          buildWaterIntelligence(null),
        );
      } catch (error) {
        console.error(
          "Advisor reservoir loading error:",
          error,
        );

        setReservoirs([]);
        setSelectedReservoirId("");

        setWaterIntelligence(
          buildWaterIntelligence(null),
        );

        setWaterError(
          "Unable to load reservoir data.",
        );
      } finally {
        setWaterLoading(false);
      }
    };

    loadReservoirs();
  }, [
    farm?.district,
    selectedMandal,
  ]);

  /*
   * ==================================================
   * UPDATE WATER INTELLIGENCE
   * ==================================================
   */

  useEffect(() => {
    if (!selectedReservoirId) {
      setWaterIntelligence(
        buildWaterIntelligence(null),
      );

      return;
    }

    const reservoir =
      reservoirs.find(
        (item) =>
          String(item.id) ===
          selectedReservoirId,
      );

    setWaterIntelligence(
      buildWaterIntelligence(
        reservoir ?? null,
      ),
    );
  }, [
    selectedReservoirId,
    reservoirs,
  ]);

  /*
   * ==================================================
   * LOADING
   * ==================================================
   */

  if (farmLoading) {
    return (
      <main style={pageStyle}>
        <section style={heroStyle}>
          <span style={eyebrowStyle}>
            AGRINERVE AI ADVISOR
          </span>

          <h1>
            Loading your farm intelligence...
          </h1>

          <p>
            AgriNerve is preparing your
            personalized agricultural advice.
          </p>
        </section>
      </main>
    );
  }

  if (farmError) {
    return (
      <main style={pageStyle}>
        <section style={heroStyle}>
          <span style={eyebrowStyle}>
            AGRINERVE AI ADVISOR
          </span>

          <h1>
            Unable to load farm data
          </h1>

          <p>{farmError}</p>
        </section>
      </main>
    );
  }

  if (!farm) {
    return null;
  }

  /*
   * ==================================================
   * DECISION ENGINE
   * ==================================================
   */

  const decision =
    generateDecision({
      cropName:
        activeCrop?.crop_name ??
        null,

      waterStatus:
        waterIntelligence.status ===
        "Unavailable"
          ? null
          : waterIntelligence.status,

      waterAvailability:
        waterIntelligence.status ===
        "Unavailable"
          ? null
          : waterIntelligence.availability,

      marketTrend:
        marketForecast?.trend ===
        "rising"
          ? "rising"
          : marketForecast?.trend ===
              "falling"
            ? "falling"
            : marketForecast?.trend ===
                "stable"
              ? "stable"
              : null,

      marketAvailable:
        !!marketForecast,
    });

  return (
    <main style={pageStyle}>

      {/* HEADER */}

      <section style={heroStyle}>
        <span style={eyebrowStyle}>
          AGRINERVE AI ADVISOR
        </span>

        <h1>
          Your agricultural decision advisor
        </h1>

        <p>
          AgriNerve combines your farm,
          crop, water and market
          information to generate
          contextual agricultural
          intelligence.
        </p>
      </section>

      {/* FARM CONTEXT */}

      <section style={gridStyle}>

        <div style={infoCardStyle}>
          <span style={cardLabelStyle}>
            YOUR FARM
          </span>

          <h2>
            {farm.farm_name}
          </h2>

          <p>
            {farm.district
              ? `${farm.district}, `
              : ""}
            {farm.state}
          </p>

          <strong>
            {farm.area_acres} acres
          </strong>
        </div>

        <div style={infoCardStyle}>
          <span style={cardLabelStyle}>
            ACTIVE CROP
          </span>

          <h2>
            {activeCrop?.crop_name ??
              "No crop added"}
          </h2>

          <p>
            Variety:{" "}
            {activeCrop?.variety ??
              "Not available"}
          </p>

          <strong>
            {activeCrop?.season ??
              "Season not set"}
          </strong>
        </div>

        <div style={infoCardStyle}>
          <span style={cardLabelStyle}>
            PREFERRED MARKET
          </span>

          <h2>
            {farm.preferred_market ??
              "Not selected"}
          </h2>

          <p>
            Market intelligence source
            {marketForecast &&
            marketDataFallback
              ? ` • Dataset variety: ${marketForecast.variety}`
              : ""}
          </p>

          <strong>
            {marketLoading
              ? "Loading..."
              : marketForecast
                ? "Available"
                : "Unavailable"}
          </strong>
        </div>

      </section>

      {/* WATER */}

      <section style={sectionStyle}>

        <span style={eyebrowStyle}>
          WATER INTELLIGENCE
        </span>

        <h2>
          Select your water source
        </h2>

        <p>
          Your farm district is used
          automatically. Select a mandal
          and reservoir to include current
          water conditions.
        </p>

        {waterError && (
          <div style={errorStyle}>
            {waterError}
          </div>
        )}

        <div style={waterGridStyle}>

          <div>
            <label style={labelStyle}>
              District
            </label>

            <div
              style={readonlyFieldStyle}
            >
              {farm.district ||
                "Not available"}
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              Mandal
            </label>

            <select
              value={selectedMandal}
              onChange={(event) =>
                setSelectedMandal(
                  event.target.value,
                )
              }
              style={selectStyle}
              disabled={
                mandals.length === 0
              }
            >
              <option value="">
                {mandals.length === 0
                  ? "No mandals available"
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
                ),
              )}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Reservoir
            </label>

            <select
              value={
                selectedReservoirId
              }
              onChange={(event) =>
                setSelectedReservoirId(
                  event.target.value,
                )
              }
              style={selectStyle}
              disabled={
                reservoirs.length === 0 ||
                waterLoading
              }
            >
              <option value="">
                {waterLoading
                  ? "Loading reservoirs..."
                  : "Select reservoir"}
              </option>

              {reservoirs.map(
                (reservoir) => (
                  <option
                    key={reservoir.id}
                    value={String(
                      reservoir.id,
                    )}
                  >
                    {reservoir.reservoir}
                  </option>
                ),
              )}
            </select>
          </div>

        </div>

        <div style={waterResultStyle}>

          <div>
            <span style={cardLabelStyle}>
              WATER AVAILABILITY
            </span>

            <strong style={bigMetricStyle}>
              {
                waterIntelligence.availability
              }
            </strong>
          </div>

          <div>
            <span style={cardLabelStyle}>
              STATUS
            </span>

            <strong>
              {waterIntelligence.status}
            </strong>
          </div>

          <div>
            <span style={cardLabelStyle}>
              IRRIGATION NEED
            </span>

            <strong>
              {
                waterIntelligence.irrigationNeed
              }
            </strong>
          </div>

          <div>
            <span style={cardLabelStyle}>
              DATA SOURCE
            </span>

            <strong>
              {waterIntelligence.source}
            </strong>
          </div>

        </div>

      </section>

      {/* DECISION */}

      <section style={decisionCardStyle}>

        <div style={decisionHeaderStyle}>

          <div style={brainStyle}>
            🧠
          </div>

          <div>
            <span style={eyebrowStyle}>
              AGRINERVE RECOMMENDS
            </span>

            <h2>
              {decision.title}
            </h2>
          </div>

          <span
            style={{
              ...priorityStyle,

              ...(decision.priority ===
              "High"
                ? highPriorityStyle
                : decision.priority ===
                    "Medium"
                  ? mediumPriorityStyle
                  : lowPriorityStyle),
            }}
          >
            {decision.priority} priority
          </span>

        </div>

        <div style={messageStyle}>
          {decision.message}
        </div>

        <div style={actionBoxStyle}>

          <span style={cardLabelStyle}>
            SUGGESTED ACTION
          </span>

          <strong>
            {decision.action}
          </strong>

        </div>

        <div style={confidenceStyle}>

          <span>
            Decision confidence
          </span>

          <strong>
            {decision.confidence}
          </strong>

        </div>

      </section>

      {/* MARKET */}

      <section style={sectionStyle}>

        <span style={eyebrowStyle}>
          MARKET INTELLIGENCE
        </span>

        <h2>
          What the market is telling you
        </h2>

        {!marketForecast ? (
          <div style={emptyStyle}>
            <strong>
              Market intelligence unavailable
            </strong>

            <p>
              Select a preferred APMC
              market and make sure
              compatible crop market
              data is available.
            </p>
          </div>
        ) : (
          <>
            {marketDataFallback && (
              <div style={noticeStyle}>
                <strong>
                  Market dataset notice
                </strong>

                <p>
                  Your crop variety (
                  {activeCrop?.variety}
                  ) is not currently
                  available in this market
                  dataset. The displayed
                  market intelligence uses
                  the available Paddy
                  dataset (
                  {marketForecast.variety}
                  ) as a temporary reference.
                </p>
              </div>
            )}

            <div style={marketGridStyle}>

              <div style={metricStyle}>
                <span>
                  Current price
                </span>

                <strong>
                  ₹
                  {marketForecast.current_price.toLocaleString()}
                </strong>
              </div>

              <div style={metricStyle}>
                <span>
                  Recent change
                </span>

                <strong>
                  {marketForecast.recent_change_percent >=
                  0
                    ? "+"
                    : ""}
                  {marketForecast.recent_change_percent.toFixed(
                    1,
                  )}
                  %
                </strong>
              </div>

              <div style={metricStyle}>
                <span>
                  Trend
                </span>

                <strong>
                  {marketForecast.trend}
                </strong>
              </div>

              <div style={metricStyle}>
                <span>
                  Forecast
                </span>

                <strong>
                  ₹
                  {marketForecast.forecast_price.toLocaleString()}
                </strong>
              </div>

            </div>
          </>
        )}

      </section>

      {/* TRANSPARENCY */}

      <section style={sectionStyle}>

        <span style={eyebrowStyle}>
          DECISION TRANSPARENCY
        </span>

        <h2>
          How AgriNerve is deciding
        </h2>

        <div style={explanationStyle}>

          <div>
            <span>🌱</span>

            <div>
              <strong>
                Crop context
              </strong>

              <p>
                {activeCrop
                  ? `Advice is being generated for ${activeCrop.crop_name}, variety ${activeCrop.variety}.`
                  : "No active crop information is available."}
              </p>
            </div>
          </div>

          <div>
            <span>💧</span>

            <div>
              <strong>
                Water context
              </strong>

              <p>
                {waterIntelligence.status ===
                "Unavailable"
                  ? "No reservoir has been selected yet."
                  : `Water status is ${waterIntelligence.status} with ${waterIntelligence.availability} availability.`}
              </p>
            </div>
          </div>

          <div>
            <span>📈</span>

            <div>
              <strong>
                Market context
              </strong>

              <p>
                {marketForecast
                  ? `The ${marketForecast.market} market is currently showing a ${marketForecast.trend} trend.`
                  : "Market intelligence is currently unavailable."}
              </p>
            </div>
          </div>

          <div>
            <span>🌦️</span>

            <div>
              <strong>
                Weather context
              </strong>

              <p>
                Weather intelligence will
                be added as the next
                independent intelligence
                module.
              </p>
            </div>
          </div>

          <div>
            <span>🌿</span>

            <div>
              <strong>
                Crop health context
              </strong>

              <p>
                Disease detection remains
                an independent intelligence
                module and will be connected
                to the decision engine
                separately.
              </p>
            </div>
          </div>

        </div>

      </section>

    </main>
  );
}

/* ==================================================
   STYLES
   ================================================== */

const pageStyle: React.CSSProperties = {
  padding: "32px",
  maxWidth: "1400px",
  margin: "0 auto",
};

const heroStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dfe7df",
  borderRadius: "20px",
  padding: "32px",
  marginBottom: "20px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1.4px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "18px",
  marginBottom: "20px",
};

const infoCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dfe7df",
  borderRadius: "16px",
  padding: "22px",
};

const cardLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  marginBottom: "10px",
};

const sectionStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dfe7df",
  borderRadius: "20px",
  padding: "26px",
  marginBottom: "20px",
};

const decisionCardStyle: React.CSSProperties = {
  background: "#174d2b",
  color: "#ffffff",
  borderRadius: "20px",
  padding: "28px",
  marginBottom: "20px",
};

const decisionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const brainStyle: React.CSSProperties = {
  fontSize: "32px",
  width: "56px",
  height: "56px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "14px",
  background:
    "rgba(255,255,255,0.12)",
};

const priorityStyle: React.CSSProperties = {
  marginLeft: "auto",
  padding: "8px 14px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 700,
};

const highPriorityStyle: React.CSSProperties = {
  background: "#ffd9d9",
  color: "#8b1e1e",
};

const mediumPriorityStyle: React.CSSProperties = {
  background: "#fff0c9",
  color: "#805800",
};

const lowPriorityStyle: React.CSSProperties = {
  background: "#dff4e4",
  color: "#17652b",
};

const messageStyle: React.CSSProperties = {
  marginTop: "26px",
  fontSize: "17px",
  lineHeight: 1.7,
};

const actionBoxStyle: React.CSSProperties = {
  marginTop: "24px",
  padding: "18px",
  borderRadius: "14px",
  border:
    "1px solid rgba(255,255,255,0.25)",
  background:
    "rgba(255,255,255,0.08)",
};

const confidenceStyle: React.CSSProperties = {
  marginTop: "20px",
  paddingTop: "18px",
  borderTop:
    "1px solid rgba(255,255,255,0.2)",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
};

const waterGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "16px",
  marginTop: "20px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
  marginBottom: "8px",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccd7cc",
  background: "#ffffff",
  fontSize: "14px",
};

const readonlyFieldStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccd7cc",
  background: "#f6f8f5",
  fontSize: "14px",
};

const waterResultStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "16px",
  marginTop: "20px",
  padding: "20px",
  borderRadius: "16px",
  background: "#f6f8f5",
};

const bigMetricStyle: React.CSSProperties = {
  fontSize: "24px",
};

const errorStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "12px",
  borderRadius: "10px",
  background: "#fff0f0",
  color: "#8b1e1e",
};

const emptyStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "20px",
  borderRadius: "14px",
  background: "#f6f8f5",
};

const noticeStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "16px 18px",
  borderRadius: "14px",
  background: "#fff8e6",
  border: "1px solid #ead9a5",
};

const marketGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "16px",
  marginTop: "18px",
};

const metricStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "14px",
  background: "#f6f8f5",
};

const explanationStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
  marginTop: "18px",
};

export default AgriAdvisor;