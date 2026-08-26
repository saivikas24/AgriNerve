import { useEffect, useMemo, useState } from "react";
import "./MarketIntelligence.css";

interface MarketPrice {
  id: number;
  state: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  arrivals_mt: number;
  minimum_price: number;
  maximum_price: number;
  modal_price: number;
  source: string;
  fetched_at: string;
}

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
  forecast_horizon_days: number;
  method: string;
}

const API_BASE =
  "http://127.0.0.1:8000/api/v1/market";

function MarketIntelligence() {
  const [data, setData] = useState<MarketPrice[]>([]);

  const [markets, setMarkets] = useState<string[]>(
    [],
  );

  const [varieties, setVarieties] = useState<
    string[]
  >([]);

  const [market, setMarket] = useState("");
  const [variety, setVariety] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [forecast, setForecast] =
    useState<MarketForecast | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [isLoadingVarieties, setIsLoadingVarieties] =
    useState(false);

  const [isLoadingForecast, setIsLoadingForecast] =
    useState(false);

  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Load markets and initial varieties
  // ---------------------------------------------------------

  useEffect(() => {
    const loadFilterMetadata = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [
          marketsResponse,
          varietiesResponse,
        ] = await Promise.all([
          fetch(`${API_BASE}/markets`),
          fetch(`${API_BASE}/varieties`),
        ]);

        if (!marketsResponse.ok) {
          throw new Error(
            `Markets API returned ${marketsResponse.status}`,
          );
        }

        if (!varietiesResponse.ok) {
          throw new Error(
            `Varieties API returned ${varietiesResponse.status}`,
          );
        }

        const marketsResult: string[] =
          await marketsResponse.json();

        const varietiesResult: string[] =
          await varietiesResponse.json();

        setMarkets(marketsResult);
        setVarieties(varietiesResult);
      } catch (err) {
        console.error(
          "FILTER METADATA ERROR:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load market filters.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterMetadata();
  }, []);

  // ---------------------------------------------------------
  // Load varieties whenever market changes
  // ---------------------------------------------------------

  useEffect(() => {
    const loadMarketVarieties = async () => {
      try {
        setIsLoadingVarieties(true);

        const params = new URLSearchParams();

        if (market) {
          params.set("market", market);
        }

        const response = await fetch(
          `${API_BASE}/varieties?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(
            `Varieties API returned ${response.status}`,
          );
        }

        const result: string[] =
          await response.json();

        setVarieties(result);

        if (
          variety &&
          !result.includes(variety)
        ) {
          setVariety("");
          setForecast(null);
        }
      } catch (err) {
        console.error(
          "MARKET VARIETIES ERROR:",
          err,
        );

        setVarieties([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load varieties.",
        );
      } finally {
        setIsLoadingVarieties(false);
      }
    };

    loadMarketVarieties();
  }, [market]);

  // ---------------------------------------------------------
  // Fetch forecast
  // ---------------------------------------------------------

  const fetchForecast = async (
    selectedMarket = market,
    selectedVariety = variety,
  ) => {
    if (
      !selectedMarket.trim() ||
      !selectedVariety.trim()
    ) {
      setForecast(null);
      return;
    }

    setIsLoadingForecast(true);

    try {
      const params = new URLSearchParams();

      params.set(
        "market",
        selectedMarket.trim(),
      );

      params.set(
        "variety",
        selectedVariety.trim(),
      );

      const response = await fetch(
        `${API_BASE}/forecast?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(
          `Forecast API returned ${response.status}`,
        );
      }

      const result: MarketForecast =
        await response.json();

      if (
        !result ||
        typeof result.forecast_price !==
          "number"
      ) {
        throw new Error(
          "Forecast API returned an unexpected response.",
        );
      }

      setForecast(result);
    } catch (err) {
      console.error(
        "FORECAST API ERROR:",
        err,
      );

      setForecast(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load market forecast.",
      );
    } finally {
      setIsLoadingForecast(false);
    }
  };

  // ---------------------------------------------------------
  // Fetch filtered market prices
  // ---------------------------------------------------------

  const fetchPrices = async (
    selectedMarket = market,
    selectedVariety = variety,
    selectedStartDate = startDate,
    selectedEndDate = endDate,
  ) => {
    setIsAnalyzing(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (selectedMarket.trim()) {
        params.set(
          "market",
          selectedMarket.trim(),
        );
      }

      if (selectedVariety.trim()) {
        params.set(
          "variety",
          selectedVariety.trim(),
        );
      }

      if (selectedStartDate) {
        params.set(
          "start_date",
          selectedStartDate,
        );
      }

      if (selectedEndDate) {
        params.set(
          "end_date",
          selectedEndDate,
        );
      }

      params.set("limit", "1000");

      const url =
        `${API_BASE}/prices?${params.toString()}`;

      console.log(
        "MARKET API REQUEST:",
        url,
      );

      const response = await fetch(url);

      console.log(
        "MARKET API STATUS:",
        response.status,
      );

      if (!response.ok) {
        throw new Error(
          `Market API returned ${response.status}`,
        );
      }

      const result: MarketPrice[] =
        await response.json();

      if (!Array.isArray(result)) {
        throw new Error(
          "Market API returned an unexpected response.",
        );
      }

      setData(result);

      await fetchForecast(
        selectedMarket,
        selectedVariety,
      );
    } catch (err) {
      console.error(
        "MARKET API ERROR:",
        err,
      );

      setData([]);
      setForecast(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load market data.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ---------------------------------------------------------
  // Reset
  // ---------------------------------------------------------

  const resetFilters = () => {
    setMarket("");
    setVariety("");
    setStartDate("");
    setEndDate("");
    setForecast(null);

    fetchPrices(
      "",
      "",
      "",
      "",
    );
  };

  // ---------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------

  const latest = data[0];

  const averageModal = useMemo(() => {
    if (!data.length) {
      return 0;
    }

    return (
      data.reduce(
        (sum, item) =>
          sum + item.modal_price,
        0,
      ) / data.length
    );
  }, [data]);

  const priceChange = useMemo(() => {
    if (data.length < 2) {
      return 0;
    }

    const sorted = [...data].sort(
      (a, b) =>
        new Date(
          b.arrival_date,
        ).getTime() -
        new Date(
          a.arrival_date,
        ).getTime(),
    );

    const latestPrice =
      sorted[0].modal_price;

    const previousPrice =
      sorted[1].modal_price;

    if (!previousPrice) {
      return 0;
    }

    return (
      ((latestPrice - previousPrice) /
        previousPrice) *
      100
    );
  }, [data]);

  // ---------------------------------------------------------
  // Chart data
  // ---------------------------------------------------------

  const chartData = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          new Date(
            a.arrival_date,
          ).getTime() -
          new Date(
            b.arrival_date,
          ).getTime(),
      )
      .slice(-14);
  }, [data]);

  // ---------------------------------------------------------
  // Format chart date
  // Example:
  // 2026-08-11 -> 11 Aug
  // ---------------------------------------------------------

  const formatChartDate = (
    dateString: string,
  ) => {
    const date = new Date(
      `${dateString}T00:00:00`,
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      },
    );
  };

  // ---------------------------------------------------------
  // Full date for tooltip
  // Example:
  // 11 Aug 2026
  // ---------------------------------------------------------

  const formatFullDate = (
    dateString: string,
  ) => {
    const date = new Date(
      `${dateString}T00:00:00`,
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  // ---------------------------------------------------------
  // Chart points
  // ---------------------------------------------------------

  const chartPoints = useMemo(() => {
    if (!chartData.length) {
      return "";
    }

    const width = 760;
    const height = 240;
    const padding = 30;

    const prices = chartData.map(
      (item) => item.modal_price,
    );

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const range = max - min || 1;

    return chartData
      .map((item, index) => {
        const x =
          padding +
          (index /
            Math.max(
              chartData.length - 1,
              1,
            )) *
            (width - padding * 2);

        const y =
          height -
          padding -
          ((item.modal_price - min) /
            range) *
            (height - padding * 2);

        return `${x},${y}`;
      })
      .join(" ");
  }, [chartData]);

  // ---------------------------------------------------------
  // Chart filled area
  // ---------------------------------------------------------

  const chartAreaPoints = useMemo(() => {
    if (!chartPoints) {
      return "";
    }

    return `30,210 ${chartPoints} 730,210`;
  }, [chartPoints]);

  // ---------------------------------------------------------
  // Forecast formatting
  // ---------------------------------------------------------

  const formattedForecastDate =
    forecast
      ? new Date(
          `${forecast.forecast_date}T00:00:00`,
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          },
        )
      : "";

  const forecastTrendClass =
    forecast?.trend === "rising"
      ? "positive"
      : forecast?.trend === "falling"
        ? "negative"
        : "";

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className="market-page">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="market-hero">

        <div>

          <div className="market-eyebrow">

            <span className="live-dot" />

            LIVE MARKET INTELLIGENCE

          </div>

          <h1>

            Know the market.
            <br />

            <span>
              Sell with confidence.
            </span>

          </h1>

          <p>
            Real agricultural market prices
            from Andhra Pradesh APMCs,
            powered by government market data.
          </p>

        </div>

        <div className="market-hero-badge">

          <span>
            DATA SOURCE
          </span>

          <strong>
            AGMARKNET
          </strong>

          <small>
            Government market data
          </small>

        </div>

      </section>

      {/* =====================================================
          FILTERS
          ===================================================== */}

      <section className="market-filter-card">

        <div className="filter-header">

          <div>

            <span className="section-kicker">
              MARKET EXPLORER
            </span>

            <h2>
              Find the right market
            </h2>

          </div>

          <button
            type="button"
            className="reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>

        </div>

        <div className="filter-grid">

          {/* MARKET */}

          <label className="filter-field">

            <span>
              Market
            </span>

            <select
              value={market}
              onChange={(event) => {
                setMarket(
                  event.target.value,
                );

                setVariety("");

                setForecast(null);
              }}
              disabled={
                isLoading ||
                markets.length === 0
              }
            >

              <option value="">
                All markets
              </option>

              {markets.map((item) => (
                <option
                  value={item}
                  key={item}
                >
                  {item}
                </option>
              ))}

            </select>

          </label>

          {/* VARIETY */}

          <label className="filter-field">

            <span>
              Crop variety
            </span>

            <select
              value={variety}
              onChange={(event) => {
                setVariety(
                  event.target.value,
                );

                setForecast(null);
              }}
              disabled={
                isLoading ||
                isLoadingVarieties
              }
            >

              <option value="">
                {isLoadingVarieties
                  ? "Loading varieties..."
                  : "All varieties"}
              </option>

              {varieties.map((item) => (
                <option
                  value={item}
                  key={item}
                >
                  {item}
                </option>
              ))}

            </select>

          </label>

          {/* FROM */}

          <label className="filter-field">

            <span>
              From
            </span>

            <input
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(
                  event.target.value,
                )
              }
            />

          </label>

          {/* TO */}

          <label className="filter-field">

            <span>
              To
            </span>

            <input
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(
                  event.target.value,
                )
              }
            />

          </label>

          {/* ANALYZE */}

          <button
            type="button"
            className="apply-button"
            onClick={() =>
              fetchPrices()
            }
            disabled={
              isAnalyzing ||
              isLoading
            }
          >

            {isAnalyzing
              ? "Analyzing..."
              : "Analyze"}

            <span>
              {"\u2192"}
            </span>

          </button>

        </div>

      </section>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div className="market-error">

          <strong>
            Unable to load market data
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              fetchPrices()
            }
          >
            Retry
          </button>

        </div>

      )}

      {/* =====================================================
          LOADING / DATA
          ===================================================== */}

      {isAnalyzing ? (

        <div className="market-loading">

          <div className="loading-orb" />

          <h3>
            Analyzing market signals
          </h3>

          <p>
            Fetching the latest AGMARKNET
            observations and forecast...
          </p>

        </div>

      ) : data.length === 0 ? (

        <div className="market-loading">

          <h3>
            No market observations found
          </h3>

          <p>
            Select a market and variety,
            then click Analyze.
          </p>

          <button
            type="button"
            className="reset-button"
            onClick={resetFilters}
          >
            Clear filters
          </button>

        </div>

      ) : (

        <>

          {/* =================================================
              PRICE CARDS
              ================================================= */}

          <section className="price-grid">

            {/* MODAL */}

            <article className="price-card featured">

              <div className="price-card-top">

                <span>
                  MODAL PRICE
                </span>

                <span
                  className={
                    priceChange >= 0
                      ? "trend positive"
                      : "trend negative"
                  }
                >

                  {priceChange >= 0
                    ? "\u2197"
                    : "\u2198"}{" "}

                  {Math.abs(
                    priceChange,
                  ).toFixed(1)}
                  %

                </span>

              </div>

              <div className="main-price">

                {"\u20B9"}

                {latest
                  ? latest.modal_price.toLocaleString(
                      "en-IN",
                    )
                  : "—"}

              </div>

              <p>
                per quintal
              </p>

              <div className="price-card-footer">

                Latest reported modal
                market price

              </div>

            </article>

            {/* MINIMUM */}

            <article className="price-card">

              <div className="price-card-top">

                <span>
                  MINIMUM
                </span>

                <span className="metric-icon">
                  {"\u2193"}
                </span>

              </div>

              <div className="secondary-price">

                {"\u20B9"}

                {latest
                  ? latest.minimum_price.toLocaleString(
                      "en-IN",
                    )
                  : "—"}

              </div>

              <p>
                per quintal
              </p>

            </article>

            {/* MAXIMUM */}

            <article className="price-card">

              <div className="price-card-top">

                <span>
                  MAXIMUM
                </span>

                <span className="metric-icon">
                  {"\u2191"}
                </span>

              </div>

              <div className="secondary-price">

                {"\u20B9"}

                {latest
                  ? latest.maximum_price.toLocaleString(
                      "en-IN",
                    )
                  : "—"}

              </div>

              <p>
                per quintal
              </p>

            </article>

            {/* AVERAGE */}

            <article className="price-card">

              <div className="price-card-top">

                <span>
                  AVERAGE MODAL
                </span>

                <span className="metric-icon">
                  {"\u2248"}
                </span>

              </div>

              <div className="secondary-price">

                {"\u20B9"}

                {averageModal.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  },
                )}

              </div>

              <p>
                selected observations
              </p>

            </article>

          </section>

          {/* =================================================
              MAIN CONTENT
              ================================================= */}

          <section className="market-main-grid">

            {/* =================================================
                PRICE HISTORY CHART
                ================================================= */}

            <article className="chart-card">

              <div className="card-heading">

                <div>

                  <span className="section-kicker">
                    PRICE HISTORY
                  </span>

                  <h2>
                    Recent modal price movement
                  </h2>

                </div>

                <span className="chart-period">
                  LAST 14 OBSERVATIONS
                </span>

              </div>

              <div className="chart-wrapper">

                {chartData.length > 0 ? (

                  <>

                    {/* SVG GRAPH */}

                    <div className="chart-svg-container">

                      <svg
                        className="price-chart"
                        viewBox="0 0 760 240"
                        preserveAspectRatio="none"
                      >

                        <defs>

                          <linearGradient
                            id="priceArea"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >

                            <stop
                              offset="0%"
                              stopColor="#2d8050"
                              stopOpacity="0.18"
                            />

                            <stop
                              offset="100%"
                              stopColor="#2d8050"
                              stopOpacity="0"
                            />

                          </linearGradient>

                        </defs>

                        {/* GRID */}

                        <line
                          className="chart-grid-line"
                          x1="30"
                          y1="30"
                          x2="730"
                          y2="30"
                        />

                        <line
                          className="chart-grid-line"
                          x1="30"
                          y1="90"
                          x2="730"
                          y2="90"
                        />

                        <line
                          className="chart-grid-line"
                          x1="30"
                          y1="150"
                          x2="730"
                          y2="150"
                        />

                        <line
                          className="chart-grid-line"
                          x1="30"
                          y1="210"
                          x2="730"
                          y2="210"
                        />

                        {/* AREA */}

                        <polygon
                          className="chart-area"
                          points={chartAreaPoints}
                        />

                        {/* PRICE LINE */}

                        <polyline
                          className="chart-line"
                          points={chartPoints}
                        />

                        {/* POINTS */}

                        {chartData.map(
                          (
                            item,
                            index,
                          ) => {

                            const prices =
                              chartData.map(
                                (row) =>
                                  row.modal_price,
                              );

                            const min =
                              Math.min(
                                ...prices,
                              );

                            const max =
                              Math.max(
                                ...prices,
                              );

                            const range =
                              max - min || 1;

                            const x =
                              30 +
                              (index /
                                Math.max(
                                  chartData.length -
                                    1,
                                  1,
                                )) *
                                700;

                            const y =
                              210 -
                              ((item.modal_price -
                                min) /
                                range) *
                                180;

                            return (
                              <circle
                                key={`${item.id}-${index}`}
                                className="chart-point"
                                cx={x}
                                cy={y}
                                r="4"
                              >

                                {/* Hover information */}

                                <title>
                                  {formatFullDate(
                                    item.arrival_date,
                                  )}

                                  {"\n"}

                                  Modal Price: ₹
                                  {item.modal_price.toLocaleString(
                                    "en-IN",
                                  )}

                                </title>

                              </circle>
                            );
                          },
                        )}

                      </svg>

                    </div>

                    {/* =================================================
                        DATE AXIS
                        ================================================= */}

                    <div className="chart-date-axis">

                      {chartData.map(
                        (
                          item,
                          index,
                        ) => {

                          /*
                           * If there are <= 8 observations,
                           * show every date.
                           *
                           * If there are more than 8,
                           * show alternate dates and
                           * always show the final date.
                           */

                          const showLabel =
                            chartData.length <=
                              8 ||
                            index % 2 === 0 ||
                            index ===
                              chartData.length -
                                1;

                          if (!showLabel) {
                            return (
                              <span
                                key={`empty-${item.id}`}
                                className="chart-date-empty"
                              />
                            );
                          }

                          return (
                            <span
                              key={item.id}
                              className="chart-date-label"
                            >
                              {formatChartDate(
                                item.arrival_date,
                              )}
                            </span>
                          );
                        },
                      )}

                    </div>

                    {/* =================================================
                        EXACT RANGE
                        ================================================= */}

                    <div className="chart-range">

                      <span>
                        {chartData[0]
                          .arrival_date}
                      </span>

                      <span>
                        {
                          chartData[
                            chartData.length -
                              1
                          ].arrival_date
                        }
                      </span>

                    </div>

                  </>

                ) : (

                  <div className="empty-chart">

                    No chart data available.

                  </div>

                )}

              </div>

            </article>

            {/* =================================================
                MARKET SNAPSHOT
                ================================================= */}

            <article className="snapshot-card">

              <div className="card-heading">

                <div>

                  <span className="section-kicker">
                    MARKET SNAPSHOT
                  </span>

                  <h2>
                    Current observation
                  </h2>

                </div>

              </div>

              <div className="snapshot-location">

                <div className="location-icon">
                  {"\u2302"}
                </div>

                <div>

                  <strong>
                    {market ||
                      latest?.market ||
                      "All markets"}
                  </strong>

                  <span>
                    {variety ||
                      latest?.variety ||
                      "All varieties"}
                  </span>

                </div>

              </div>

              <div className="snapshot-divider" />

              <div className="snapshot-row">

                <span>
                  Latest date
                </span>

                <strong>
                  {latest?.arrival_date ||
                    "—"}
                </strong>

              </div>

              <div className="snapshot-row">

                <span>
                  Modal price
                </span>

                <strong>
                  {latest
                    ? `\u20B9${latest.modal_price.toLocaleString(
                        "en-IN",
                      )}`
                    : "—"}
                </strong>

              </div>

              <div className="snapshot-row">

                <span>
                  Arrivals
                </span>

                <strong>
                  {latest
                    ? `${latest.arrivals_mt.toLocaleString(
                        "en-IN",
                      )} MT`
                    : "—"}
                </strong>

              </div>

              <div className="snapshot-row">

                <span>
                  Source
                </span>

                <strong>
                  {latest?.source ||
                    "AGMARKNET"}
                </strong>

              </div>

              <div className="source-badge">

                <span className="source-dot" />

                Government market
                observation

              </div>

            </article>

          </section>

          {/* =================================================
              7-DAY FORECAST
              ================================================= */}

          {market && variety && (

            <section className="decision-banner">

              <div className="decision-icon">
                {"\u2192"}
              </div>

              <div>

                <h2>
                  7-Day Market Forecast
                </h2>

                {isLoadingForecast ? (

                  <p>
                    Calculating the latest
                    forecast...
                  </p>

                ) : forecast ? (

                  <p>

                    Current modal price is{" "}

                    <strong>
                      {"\u20B9"}
                      {forecast.current_price.toLocaleString(
                        "en-IN",
                      )}
                    </strong>

                    . The baseline forecast for{" "}

                    <strong>
                      {formattedForecastDate}
                    </strong>

                    {" "}is{" "}

                    <strong>
                      {"\u20B9"}
                      {forecast.forecast_price.toLocaleString(
                        "en-IN",
                      )}
                    </strong>

                    {" "}per quintal.

                  </p>

                ) : (

                  <p>
                    Forecast is unavailable
                    for this market and variety.
                  </p>

                )}

              </div>

              {forecast && (

                <div className="decision-status">

                  <span>
                    {forecast.forecast_horizon_days}
                    -DAY TREND
                  </span>

                  <strong
                    className={
                      forecastTrendClass
                    }
                  >

                    {forecast.trend
                      .charAt(0)
                      .toUpperCase() +
                      forecast.trend.slice(1)}

                  </strong>

                  <small
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#7d8982",
                    }}
                  >

                    {forecast.expected_change >=
                    0
                      ? "+"
                      : ""}

                    {"\u20B9"}

                    {forecast.expected_change.toLocaleString(
                      "en-IN",
                    )}

                    {" "}

                    (
                    {forecast.expected_change_percent.toFixed(
                      2,
                    )}
                    %)

                  </small>

                </div>

              )}

            </section>

          )}

          {/* =================================================
              DECISION NOTE
              ================================================= */}

          <section className="decision-banner">

            <div className="decision-icon">
              {"\u2713"}
            </div>

            <div>

              <h2>
                Market intelligence, not just
                market data.
              </h2>

              <p>

                AgriNerve combines the latest
                market observations with a
                validated forecasting baseline.
                The current production forecast
                uses the latest modal price because
                it outperformed the tested machine
                learning models for this dataset.

              </p>

            </div>

            <div className="decision-status">

              <span>
                FORECAST METHOD
              </span>

              <strong>
                VALIDATED BASELINE
              </strong>

            </div>

          </section>

        </>

      )}

    </div>
  );
}

export default MarketIntelligence;