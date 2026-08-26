from pathlib import Path
from datetime import datetime
import re

import pandas as pd
import requests
import urllib3
from bs4 import BeautifulSoup


BASE_URL = "https://www.desweather.ap.gov.in"

RESERVOIR_URL = (
    f"{BASE_URL}/Realtime/Reservoir.jsp"
)

OUTPUT_DIR = Path(
    "app/ml/water/raw"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 "
        "Chrome/151.0 Safari/537.36"
    )
}

urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)


def clean_text(value):

    if value is None:
        return None

    value = value.strip()

    value = re.sub(
        r"\s+",
        " ",
        value,
    )

    if value in {
        "",
        "-",
        "NA",
        "N/A",
    }:
        return None

    return value


def to_float(value):

    value = clean_text(value)

    if value is None:
        return None

    value = (
        value
        .replace("%", "")
        .replace(",", "")
    )

    try:
        return float(value)

    except ValueError:
        return None


def fetch_html():

    print("=" * 70)
    print(
        "AGRINERVE AP DES RESERVOIR COLLECTOR V3"
    )
    print("=" * 70)

    print()
    print("FETCHING:")
    print(RESERVOIR_URL)

    response = requests.get(
        RESERVOIR_URL,
        headers=HEADERS,
        verify=False,
        timeout=60,
    )

    response.raise_for_status()

    print(
        "HTTP STATUS:",
        response.status_code,
    )

    print(
        "HTML BYTES :",
        len(response.content),
    )

    return response.text


def parse_reservoirs(html):

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    rows = soup.find_all(
        "tr",
        class_="noselect",
    )

    print()
    print(
        "HTML DATA ROWS:",
        len(rows),
    )

    records = []

    for row in rows:

        cells = row.find_all("td")

        if len(cells) < 16:
            continue

        values = []

        for cell in cells:

            text = cell.get_text(
                " ",
                strip=True,
            )

            values.append(
                clean_text(text)
            )

        if len(values) < 16:
            continue

        record = {
            "source_id": values[1],

            "district": values[2],

            "mandal": values[3],

            "reservoir": values[4],

            "river": values[5],

            "present_level_m":
                to_float(values[6]),

            "present_level_ft":
                to_float(values[7]),

            "present_capacity_mcum":
                to_float(values[8]),

            "present_capacity_tmc":
                to_float(values[9]),

            "frl_m":
                to_float(values[10]),

            "frl_ft":
                to_float(values[11]),

            "gross_capacity_mcum":
                to_float(values[12]),

            "gross_capacity_tmc":
                to_float(values[13]),

            "storage_percentage":
                to_float(values[14]),

            "updated_at":
                values[15],

            "source":
                "AP_DES",

            "fetched_at":
                datetime.now().isoformat(),
        }

        records.append(record)

    return pd.DataFrame(records)


def validate_data(df):

    print()
    print("=" * 70)
    print("DATA VALIDATION")
    print("=" * 70)

    print()

    print(
        "TOTAL RECORDS:",
        len(df),
    )

    print()

    print(
        "DISTRICTS:",
        df["district"].nunique(),
    )

    print(
        "MANDALS:",
        df["mandal"].nunique(),
    )

    print(
        "RESERVOIRS:",
        df["reservoir"].nunique(),
    )

    print()

    print(
        "MISSING VALUES:"
    )

    missing = df.isna().sum()

    for column, count in missing.items():

        if count > 0:

            print(
                f"  {column}: {count}"
            )

    print()

    invalid_percentage = df[
        (
            df["storage_percentage"]
            < 0
        )
        |
        (
            df["storage_percentage"]
            > 100
        )
    ]

    print(
        "INVALID STORAGE %:",
        len(invalid_percentage),
    )

    print()

    invalid_capacity = df[
        (
            df["present_capacity_tmc"]
            > df["gross_capacity_tmc"]
        )
    ]

    print(
        "PRESENT CAPACITY > GROSS:",
        len(invalid_capacity),
    )


def main():

    html = fetch_html()

    df = parse_reservoirs(
        html
    )

    if df.empty:

        raise RuntimeError(
            "No reservoir records parsed."
        )

    validate_data(
        df
    )

    print()
    print("=" * 70)
    print("SAMPLE RESERVOIRS")
    print("=" * 70)

    print()

    print(
        df[
            [
                "district",
                "mandal",
                "reservoir",
                "river",
                "present_level_m",
                "present_capacity_tmc",
                "gross_capacity_tmc",
                "storage_percentage",
                "updated_at",
            ]
        ]
        .head(10)
        .to_string(
            index=False
        )
    )

    output = (
        OUTPUT_DIR
        / "reservoir_raw.csv"
    )

    df.to_csv(
        output,
        index=False,
    )

    print()
    print(
        "SAVED:",
        output,
    )

    print()
    print("=" * 70)
    print(
        "RESERVOIR COLLECTION SUCCESS"
    )
    print("=" * 70)


if __name__ == "__main__":
    main()
