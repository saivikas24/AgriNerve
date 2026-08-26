import requests


GEOCODING_URL = (
    "https://geocoding-api.open-meteo.com/v1/search"
)

FORECAST_URL = (
    "https://api.open-meteo.com/v1/forecast"
)


def get_coordinates(
    district: str,
    mandal: str,
):
    """
    Resolve an agricultural location to coordinates.

    First tries the mandal + district combination.
    If that fails, tries the mandal alone.
    """

    queries = [
        f"{mandal}, Andhra Pradesh, India",
        f"{mandal}, India",
        mandal,
    ]

    for query in queries:

        response = requests.get(
            GEOCODING_URL,
            params={
                "name": query,
                "count": 10,
                "language": "en",
                "format": "json",
            },
            timeout=20,
        )

        response.raise_for_status()

        data = response.json()

        results = data.get("results", [])

        for result in results:

            country = result.get(
                "country",
                ""
            )

            admin1 = result.get(
                "admin1",
                ""
            )

            if (
                country.lower() == "india"
                and
                "andhra" in admin1.lower()
            ):
                return {
                    "name": result.get("name"),
                    "latitude": result["latitude"],
                    "longitude": result["longitude"],
                    "elevation": result.get("elevation"),
                    "timezone": result.get("timezone"),
                }

    raise ValueError(
        f"Weather location not found: "
        f"{mandal}, {district}"
    )


def get_weather(
    latitude: float,
    longitude: float,
):

    response = requests.get(
        FORECAST_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,

            "current": ",".join([
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation",
                "rain",
                "wind_speed_10m",
                "weather_code",
            ]),

            "hourly": ",".join([
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation_probability",
                "precipitation",
                "rain",
                "wind_speed_10m",
            ]),

            "daily": ",".join([
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "rain_sum",
                "precipitation_probability_max",
                "weather_code",
            ]),

            "forecast_days": 7,

            "timezone": "auto",
        },

        timeout=20,
    )

    response.raise_for_status()

    return response.json()


def get_weather_for_location(
    district: str,
    mandal: str,
):

    location = get_coordinates(
        district,
        mandal,
    )

    weather = get_weather(
        location["latitude"],
        location["longitude"],
    )

    return {
        "location": {
            "district": district,
            "mandal": mandal,
            **location,
        },

        "current": weather.get(
            "current",
            {},
        ),

        "hourly": weather.get(
            "hourly",
            {},
        ),

        "daily": weather.get(
            "daily",
            {},
        ),

        "source": "Open-Meteo",
    }
