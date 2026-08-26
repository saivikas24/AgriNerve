from __future__ import annotations

import pandas as pd
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.market_price import MarketPrice
from app.services.variety_service import normalize_variety


MIN_SERIES_RECORDS = 50


FEATURE_COLUMNS = [
    "market",
    "variety",
    "arrival_date",
    "arrivals_mt",
    "minimum_price",
    "maximum_price",
    "modal_price",
    "lag_1",
    "lag_7",
    "rolling_mean_7",
    "rolling_mean_14",
    "rolling_std_7",
    "rolling_std_14",
    "price_change_1",
    "price_change_7",
    "price_vs_rolling_7",
    "price_vs_rolling_14",
    "month",
    "day_of_week",
    "target_modal_price",
]


def load_market_data() -> pd.DataFrame:
    db = SessionLocal()

    try:
        rows = db.scalars(
            select(MarketPrice)
            .where(
                MarketPrice.state == "Andhra Pradesh",
                MarketPrice.commodity == "Paddy(Common)",
            )
            .order_by(
                MarketPrice.market,
                MarketPrice.variety,
                MarketPrice.arrival_date,
                MarketPrice.id,
            )
        ).all()

        records = [
            {
                "market": row.market,
                "variety": normalize_variety(row.variety),
                "arrival_date": row.arrival_date,
                "arrivals_mt": row.arrivals_mt,
                "minimum_price": row.minimum_price,
                "maximum_price": row.maximum_price,
                "modal_price": row.modal_price,
            }
            for row in rows
        ]

    finally:
        db.close()

    return pd.DataFrame(records)


def clean_market_data(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()

    initial_count = len(df)

    df = df.drop_duplicates(
        subset=[
            "market",
            "variety",
            "arrival_date",
            "arrivals_mt",
            "minimum_price",
            "maximum_price",
            "modal_price",
        ]
    ).reset_index(drop=True)

    duplicates_removed = (
        initial_count - len(df)
    )

    positive_mask = (
        (df["arrivals_mt"] > 0)
        & (df["minimum_price"] > 0)
        & (df["maximum_price"] > 0)
        & (df["modal_price"] > 0)
    )

    non_positive_removed = (
        (~positive_mask).sum()
    )

    df = df.loc[
        positive_mask
    ].reset_index(drop=True)

    valid_price_order = (
        (df["minimum_price"] <= df["modal_price"])
        & (df["modal_price"] <= df["maximum_price"])
    )

    price_order_removed = (
        (~valid_price_order).sum()
    )

    df = df.loc[
        valid_price_order
    ].reset_index(drop=True)

    print()
    print("CLEANING SUMMARY")
    print("-" * 70)
    print(
        f"Initial records           : {initial_count}"
    )
    print(
        f"Exact duplicates removed  : {duplicates_removed}"
    )
    print(
        f"Non-positive removed      : {non_positive_removed}"
    )
    print(
        f"Price-order errors removed: {price_order_removed}"
    )
    print(
        f"Clean records             : {len(df)}"
    )

    return df


def build_analytical_dataset(
    df: pd.DataFrame,
) -> pd.DataFrame:

    if df.empty:
        raise ValueError(
            "No clean market data available."
        )

    df = df.copy()

    df["arrival_date"] = pd.to_datetime(
        df["arrival_date"]
    )

    df = df.sort_values(
        [
            "market",
            "variety",
            "arrival_date",
        ]
    ).reset_index(drop=True)

    series_counts = (
        df.groupby(
            ["market", "variety"]
        )
        .size()
    )

    eligible_series = series_counts[
        series_counts >= MIN_SERIES_RECORDS
    ].index

    df = df.set_index(
        ["market", "variety"]
    )

    df = df.loc[
        df.index.isin(eligible_series)
    ].reset_index()

    result_frames: list[pd.DataFrame] = []

    for (market, variety), group in df.groupby(
        ["market", "variety"],
        sort=False,
    ):

        group = group.sort_values(
            "arrival_date"
        ).copy()

        price = group["modal_price"]

        # Historical lag features.
        group["lag_1"] = price.shift(1)
        group["lag_7"] = price.shift(7)

        # Historical rolling statistics.
        previous_price = price.shift(1)

        group["rolling_mean_7"] = (
            previous_price
            .rolling(
                window=7,
                min_periods=7,
            )
            .mean()
        )

        group["rolling_mean_14"] = (
            previous_price
            .rolling(
                window=14,
                min_periods=14,
            )
            .mean()
        )

        group["rolling_std_7"] = (
            previous_price
            .rolling(
                window=7,
                min_periods=7,
            )
            .std()
        )

        group["rolling_std_14"] = (
            previous_price
            .rolling(
                window=14,
                min_periods=14,
            )
            .std()
        )

        # Price momentum.
        group["price_change_1"] = (
            price - price.shift(1)
        )

        group["price_change_7"] = (
            price - price.shift(7)
        )

        # Relative position against historical trend.
        group["price_vs_rolling_7"] = (
            price
            / group["rolling_mean_7"]
        )

        group["price_vs_rolling_14"] = (
            price
            / group["rolling_mean_14"]
        )

        # Calendar features.
        group["month"] = (
            group["arrival_date"].dt.month
        )

        group["day_of_week"] = (
            group["arrival_date"].dt.dayofweek
        )

        # Next observed modal price.
        group["target_modal_price"] = (
            price.shift(-1)
        )

        result_frames.append(group)

    analytical_df = pd.concat(
        result_frames,
        ignore_index=True,
    )

    analytical_df = analytical_df.dropna(
        subset=[
            "lag_1",
            "lag_7",
            "rolling_mean_7",
            "rolling_mean_14",
            "rolling_std_7",
            "rolling_std_14",
            "price_change_1",
            "price_change_7",
            "price_vs_rolling_7",
            "price_vs_rolling_14",
            "target_modal_price",
        ]
    )

    analytical_df = analytical_df[
        FEATURE_COLUMNS
    ]

    analytical_df = analytical_df.sort_values(
        [
            "arrival_date",
            "market",
            "variety",
        ]
    ).reset_index(drop=True)

    return analytical_df


def main() -> None:

    print("=" * 70)
    print(
        "AGRINERVE MARKET ANALYTICAL DATASET BUILDER V2"
    )
    print("=" * 70)

    raw_df = load_market_data()

    print(
        f"RAW RECORDS: {len(raw_df)}"
    )

    clean_df = clean_market_data(
        raw_df
    )

    analytical_df = build_analytical_dataset(
        clean_df
    )

    print()
    print(
        f"ANALYTICAL RECORDS: {len(analytical_df)}"
    )

    print(
        "MARKET-VARIETY SERIES: "
        f"{analytical_df[['market', 'variety']].drop_duplicates().shape[0]}"
    )

    print(
        "DATE RANGE: "
        f"{analytical_df['arrival_date'].min().date()} "
        f"→ "
        f"{analytical_df['arrival_date'].max().date()}"
    )

    print()
    print("COLUMNS:")

    for column in analytical_df.columns:
        print(f"  - {column}")

    output_path = (
        "app/ml/market_analytical_dataset.csv"
    )

    analytical_df.to_csv(
        output_path,
        index=False,
    )

    print()
    print(
        f"DATASET SAVED: {output_path}"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()
