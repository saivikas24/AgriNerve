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

const API_BASE = "http://127.0.0.1:8000/api/v1/market";

function MarketIntelligence() {
  const [data, setData] = useState<MarketPrice[]>([]);

  const [markets, setMarkets] = useState<string[]>([]);
  const [varieties, setVarieties] = useState<string[]>([]);

  const [market, setMarket] = useState("");
  const [variety, setVariety] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingVarieties, setIsLoadingVarieties] =
    useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Load all markets and initial varieties
  // ---------------------------------------------------------
  useEffect(() => {
    const loadFilterMetadata = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [marketsResponse, varietiesResponse] =
          await Promise.all([
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

        // If currently selected variety doesn't exist
        // in the selected market, clear it.
        if (
          variety &&
          !result.includes(variety)
        ) {
          setVariety("");
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

      console.log(
        "MARKET API RESPONSE:",
        result,
      );

      if (!Array.isArray(result)) {
        throw new Error(
          "Market API returned an unexpected response.",
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "MARKET API ERROR:",
        err,
      );

      setData([]);

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
  // Reset everything
  // ---------------------------------------------------------
  const resetFilters = () => {
    setMarket("");
    setVariety("");
    setStartDate("");
    setEndDate("");

    fetchPrices("", "", "", "");
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
        new Date(b.arrival_date).getTime() -
        new Date(a.arrival_date).getTime(),
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

  const chartData = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          new Date(a.arrival_date).getTime() -
          new Date(b.arrival_date).getTime(),
      )
      .slice(-14);
  }, [data]);

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

  return (
    <div className="market-page">

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

          <span>DATA SOURCE</span>

          <strong>
            AGMARKNET
          </strong>

          <small>
            Government market data
          </small>

        </div>

      </section>

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

          <label className="filter-field">

            <span>
              Crop variety
            </span>

            <select
              value={variety}
              onChange={(event) =>
                setVariety(
                  event.target.value,
                )
              }
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

      {isAnalyzing ? (

        <div className="market-loading">

          <div className="loading-orb" />

          <h3>
            Analyzing market signals
          </h3>

          <p>
            Fetching the latest AGMARKNET
            observations...
          </p>

        </div>

      ) : data.length === 0 ? (

        <div className="market-loading">

          <h3>
            No market observations found
          </h3>

          <p>
            No AGMARKNET records match the
            selected market, variety and
            date range.
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

          <section className="price-grid">

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

                {averageModal
                  ? averageModal.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      },
                    )
                  : "—"}

              </div>

              <p>
                across{" "}
                {data.length.toLocaleString()}{" "}
                records
              </p>

            </article>

          </section>

          <section className="market-main-grid">

            <article className="chart-card">

              <div className="card-heading">

                <div>

                  <span className="section-kicker">
                    PRICE MOVEMENT
                  </span>

                  <h2>
                    Modal price trend
                  </h2>

                </div>

                <span className="chart-period">
                  Last{" "}
                  {chartData.length}{" "}
                  observations
                </span>

              </div>

              {chartData.length > 1 ? (

                <div className="chart-wrapper">

                  <svg
                    viewBox="0 0 760 240"
                    preserveAspectRatio="none"
                    className="price-chart"
                  >

                    <line
                      x1="30"
                      y1="30"
                      x2="730"
                      y2="30"
                      className="chart-grid-line"
                    />

                    <line
                      x1="30"
                      y1="120"
                      x2="730"
                      y2="120"
                      className="chart-grid-line"
                    />

                    <line
                      x1="30"
                      y1="210"
                      x2="730"
                      y2="210"
                      className="chart-grid-line"
                    />

                    <polyline
                      points={
                        chartPoints
                      }
                      className="chart-line"
                    />

                    {chartData.map(
                      (item, index) => {

                        const prices =
                          chartData.map(
                            (point) =>
                              point.modal_price,
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
                            key={item.id}
                            cx={x}
                            cy={y}
                            r="4"
                            className="chart-point"
                          />
                        );
                      },
                    )}

                  </svg>

                  <div className="chart-labels">

                    {chartData
                      .filter(
                        (_, index) =>
                          index === 0 ||
                          index ===
                            chartData.length -
                              1,
                      )
                      .map((item) => (
                        <span key={item.id}>
                          {item.arrival_date}
                        </span>
                      ))}

                  </div>

                </div>

              ) : (

                <div className="empty-chart">
                  Not enough observations
                  for a trend.
                </div>

              )}

            </article>

            <article className="snapshot-card">

              <div className="card-heading">

                <div>

                  <span className="section-kicker">
                    MARKET SNAPSHOT
                  </span>

                  <h2>
                    Current signal
                  </h2>

                </div>

              </div>

              <div className="snapshot-location">

                <div className="location-icon">
                  {"\u25CE"}
                </div>

                <div>

                  <strong>
                    {latest?.market ||
                      "All markets"}
                  </strong>

                  <span>
                    Andhra Pradesh
                  </span>

                </div>

              </div>

              <div className="snapshot-divider" />

              <div className="snapshot-row">

                <span>
                  Commodity
                </span>

                <strong>
                  {latest?.commodity ||
                    "Paddy(Common)"}
                </strong>

              </div>

              <div className="snapshot-row">

                <span>
                  Variety
                </span>

                <strong>
                  {latest?.variety ||
                    "—"}
                </strong>

              </div>

              <div className="snapshot-row">

                <span>
                  Latest arrivals
                </span>

                <strong>
                  {latest
                    ? `${latest.arrivals_mt} MT`
                    : "—"}
                </strong>

              </div>

              <div className="snapshot-row">

                <span>
                  Records analyzed
                </span>

                <strong>
                  {data.length.toLocaleString()}
                </strong>

              </div>

              <div className="source-badge">

                <span className="source-dot" />

                Verified source · AGMARKNET

              </div>

            </article>

          </section>

          <section className="decision-banner">

            <div className="decision-icon">
              {"\u2726"}
            </div>

            <div>

              <span className="section-kicker">
                NEXT-GENERATION DECISION SUPPORT
              </span>

              <h2>
                AI price prediction is coming next.
              </h2>

              <p>
                AgriNerve will combine historical
                prices, arrivals and market signals
                to estimate future price movement
                and help farmers decide when and
                where to sell.
              </p>

            </div>

            <div className="decision-status">

              <span>
                PHASE 2
              </span>

              <strong>
                ML MODEL
              </strong>

            </div>

          </section>

        </>

      )}

    </div>
  );
}

export default MarketIntelligence;
