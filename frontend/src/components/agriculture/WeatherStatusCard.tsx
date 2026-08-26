import { useEffect, useState } from "react";

interface WeatherStatusCardProps {
  district: string;
  mandal: string;
}

interface WeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };

  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    wind_speed_10m: number;
    weather_code: number;
  };

  daily: {
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };

  source: string;
}

function getWeatherDescription(
  code: number,
): string {

  if (code === 0) {
    return "Clear sky";
  }

  if (code === 1 || code === 2) {
    return "Partly cloudy";
  }

  if (code === 3) {
    return "Cloudy";
  }

  if (
    code === 45 ||
    code === 48
  ) {
    return "Foggy";
  }

  if (
    code >= 51 &&
    code <= 67
  ) {
    return "Rain";
  }

  if (
    code >= 80 &&
    code <= 82
  ) {
    return "Rain showers";
  }

  if (
    code >= 95
  ) {
    return "Thunderstorm";
  }

  return "Variable weather";
}


function WeatherStatusCard({
  district,
  mandal,
}: WeatherStatusCardProps) {

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(false);


  useEffect(() => {

    if (!district || !mandal) {

      setWeather(null);
      setError(false);

      return;
    }


    const loadWeather = async () => {

      try {

        setLoading(true);
        setError(false);

        const response =
          await fetch(
            `http://127.0.0.1:8000/api/v1/weather?district=${encodeURIComponent(
              district
            )}&mandal=${encodeURIComponent(
              mandal
            )}`
          );


        if (!response.ok) {
          throw new Error(
            "Failed to load weather"
          );
        }


        const data: WeatherData =
          await response.json();


        setWeather(data);

      } catch (error) {

        console.error(
          "Weather loading error:",
          error
        );

        setWeather(null);
        setError(true);

      } finally {

        setLoading(false);

      }

    };


    loadWeather();

  }, [
    district,
    mandal,
  ]);


  if (!district || !mandal) {

    return (
      <section
        className="agri-card"
        style={{
          marginTop: "20px",
          padding: "24px",
        }}
      >

        <span className="metric-card-eyebrow">
          WEATHER INTELLIGENCE
        </span>

        <h3
          className="metric-card-title"
          style={{
            marginTop: "6px",
          }}
        >
          Weather conditions
        </h3>

        <p
          style={{
            marginTop: "8px",
            opacity: 0.7,
          }}
        >
          Select a district and mandal to
          view live weather conditions.
        </p>

      </section>
    );
  }


  if (loading) {

    return (
      <section
        className="agri-card"
        style={{
          marginTop: "20px",
          padding: "24px",
        }}
      >

        <span className="metric-card-eyebrow">
          WEATHER INTELLIGENCE
        </span>

        <h3
          className="metric-card-title"
          style={{
            marginTop: "6px",
          }}
        >
          Loading weather...
        </h3>

        <p
          style={{
            marginTop: "8px",
            opacity: 0.7,
          }}
        >
          Fetching current conditions for{" "}
          {mandal}, {district}.
        </p>

      </section>
    );
  }


  if (error || !weather) {

    return (
      <section
        className="agri-card"
        style={{
          marginTop: "20px",
          padding: "24px",
        }}
      >

        <span className="metric-card-eyebrow">
          WEATHER INTELLIGENCE
        </span>

        <h3
          className="metric-card-title"
          style={{
            marginTop: "6px",
          }}
        >
          Weather unavailable
        </h3>

        <p
          style={{
            marginTop: "8px",
            opacity: 0.7,
          }}
        >
          AgriNerve could not retrieve weather
          data for {mandal}, {district}.
        </p>

      </section>
    );
  }


  const current =
    weather.current;

  const daily =
    weather.daily;


  const tomorrowRainChance =
    daily.precipitation_probability_max?.[1] ??
    0;


  const tomorrowRain =
    daily.precipitation_sum?.[1] ??
    0;


  const tomorrowMax =
    daily.temperature_2m_max?.[1] ??
    null;


  const tomorrowMin =
    daily.temperature_2m_min?.[1] ??
    null;


  return (
    <section
      className="agri-card"
      style={{
        marginTop: "20px",
        padding: "24px",
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
        }}
      >

        <div>

          <span className="metric-card-eyebrow">
            WEATHER INTELLIGENCE
          </span>

          <h3
            className="metric-card-title"
            style={{
              marginTop: "6px",
            }}
          >
            {weather.location.name}
          </h3>

          <p
            style={{
              marginTop: "6px",
              opacity: 0.7,
            }}
          >
            {mandal}, {district}
          </p>

        </div>


        <div
          style={{
            fontSize: "36px",
          }}
        >
          🌦️
        </div>

      </div>


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "16px",
          marginTop: "24px",
        }}
      >

        <div>

          <span>
            Temperature
          </span>

          <strong
            style={{
              display: "block",
              fontSize: "24px",
              marginTop: "5px",
            }}
          >
            {current.temperature_2m}°C
          </strong>

          <small>
            {getWeatherDescription(
              current.weather_code
            )}
          </small>

        </div>


        <div>

          <span>
            Humidity
          </span>

          <strong
            style={{
              display: "block",
              fontSize: "24px",
              marginTop: "5px",
            }}
          >
            {current.relative_humidity_2m}%
          </strong>

        </div>


        <div>

          <span>
            Rain
          </span>

          <strong
            style={{
              display: "block",
              fontSize: "24px",
              marginTop: "5px",
            }}
          >
            {current.rain} mm
          </strong>

        </div>


        <div>

          <span>
            Wind
          </span>

          <strong
            style={{
              display: "block",
              fontSize: "24px",
              marginTop: "5px",
            }}
          >
            {current.wind_speed_10m} km/h
          </strong>

        </div>

      </div>


      <div
        style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid #e5e7eb",
        }}
      >

        <span className="metric-card-eyebrow">
          TOMORROW FORECAST
        </span>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "16px",
            marginTop: "12px",
          }}
        >

          <div>

            <span>
              Rain probability
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "4px",
              }}
            >
              {tomorrowRainChance}%
            </strong>

          </div>


          <div>

            <span>
              Expected rainfall
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "4px",
              }}
            >
              {tomorrowRain} mm
            </strong>

          </div>


          <div>

            <span>
              Temperature
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "4px",
              }}
            >
              {tomorrowMin !== null &&
              tomorrowMax !== null
                ? `${tomorrowMin}°C – ${tomorrowMax}°C`
                : "Unavailable"}
            </strong>

          </div>

        </div>

      </div>


      <div
        style={{
          marginTop: "20px",
          fontSize: "13px",
          opacity: 0.7,
        }}
      >
        Source: {weather.source}
      </div>

    </section>
  );
}


export default WeatherStatusCard;
