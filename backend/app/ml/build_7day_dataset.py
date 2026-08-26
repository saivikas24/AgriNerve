from __future__ import annotations

import pandas as pd
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.market_price import MarketPrice
from app.services.variety_service import normalize_variety


MIN_SERIES_RECORDS = 50
MAX_TARGET_GAP_DAYS = 14


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
    "target_date",
    "target_modal_price_7d",
]


def load_data() -> pd.DataFrame:
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


def clean_data(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()

    initial = len(df)

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
    )

    duplicate_count = initial - len(df)

    positive = (
        (df["arrivals_mt"] > 0)
        & (df["minimum_price"] > 0)
        & (df["maximum_price"] > 0)
        & (df["modal_price"] > 0)
    )

    non_positive_count = (
        (~positive).sum()
    )

    df = df.loc[
        positive
    ].copy()

    valid_order = (
        (df["minimum_price"] <= df["modal_price"])
        & (df["modal_price"] <= df["maximum_price"])
    )

    price_error_count = (
        (~valid_order).sum()
    )

    df = df.loc[
        valid_order
    ].copy()

    df["arrival_date"] = pd.to_datetime(
        df["arrival_date"]
    )

    print()
    print("CLEANING SUMMARY")
    print("-" * 70)
    print(
        f"INITIAL RECORDS          : {initial}"
    )
    print(
        f"DUPLICATES REMOVED       : {duplicate_count}"
    )
    print(
        f"NON-POSITIVE REMOVED     : {non_positive_count}"
    )
    print(
        f"PRICE ORDER ERRORS       : {price_error_count}"
    )
    print(
        f"CLEAN RECORDS            : {len(df)}"
    )

    return df.reset_index(drop=True)


def build_dataset(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()

    df = df.sort_values(
        [
            "market",
            "variety",
            "arrival_date",
        ]
    )

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
        df.index.isin(
            eligible_series
        )
    ].reset_index()

    output = []

    for (
        market,
        variety,
    ), group in df.groupby(
        ["market", "variety"],
        sort=False,
    ):

        group = group.sort_values(
            "arrival_date"
        ).copy()

        price = group["modal_price"]

        # ---------------------------------------------------------
        # HISTORICAL FEATURES
        # ---------------------------------------------------------

        group["lag_1"] = (
            price.shift(1)
        )

        group["lag_7"] = (
            price.shift(7)
        )

        previous_price = (
            price.shift(1)
        )

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

        group["price_change_1"] = (
            price
            - price.shift(1)
        )

        group["price_change_7"] = (
            price
            - price.shift(7)
        )

        group["price_vs_rolling_7"] = (
            price
            / group["rolling_mean_7"]
        )

        group["price_vs_rolling_14"] = (
            price
            / group["rolling_mean_14"]
        )

        group["month"] = (
            group["arrival_date"]
            .dt.month
        )

        group["day_of_week"] = (
            group["arrival_date"]
            .dt.dayofweek
        )

        # ---------------------------------------------------------
        # 7-DAY CALENDAR TARGET
        # ---------------------------------------------------------
        #
        # Find the first available market observation
        # ON OR AFTER current_date + 7 days.
        #
        # IMPORTANT:
        # We accept it only if the actual gap is <= 14 days.
        #
        # This prevents long reporting gaps from becoming
        # incorrectly labelled as "7-day" forecasts.
        # ---------------------------------------------------------

        dates = (
            group["arrival_date"]
            .to_numpy()
        )

        prices = (
            group["modal_price"]
            .to_numpy()
        )

        target_dates = []
        target_prices = []

        rejected_long_gaps = 0

        for current_date in dates:

            desired_date = (
                pd.Timestamp(current_date)
                + pd.Timedelta(days=7)
            )

            future_mask = (
                dates >= desired_date
            )

            if not future_mask.any():

                target_dates.append(
                    pd.NaT
                )

                target_prices.append(
                    float("nan")
                )

                continue

            first_index = (
                future_mask.argmax()
            )

            candidate_date = pd.Timestamp(
                dates[first_index]
            )

            gap_days = (
                candidate_date
                - pd.Timestamp(current_date)
            ).days

            if (
                7
                <= gap_days
                <= MAX_TARGET_GAP_DAYS
            ):

                target_dates.append(
                    dates[first_index]
                )

                target_prices.append(
                    prices[first_index]
                )

            else:

                target_dates.append(
                    pd.NaT
                )

                target_prices.append(
                    float("nan")
                )

                if gap_days > MAX_TARGET_GAP_DAYS:
                    rejected_long_gaps += 1

        group["target_date"] = (
            target_dates
        )

        group["target_modal_price_7d"] = (
            target_prices
        )

        output.append(group)

    result = pd.concat(
        output,
        ignore_index=True,
    )

    # Remove rows without enough historical information
    # or without a valid 7-14 day target.
    result = result.dropna(
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
            "target_date",
            "target_modal_price_7d",
        ]
    )

    result = result[
        FEATURE_COLUMNS
    ]

    result = result.sort_values(
        [
            "arrival_date",
            "market",
            "variety",
        ]
    ).reset_index(
        drop=True
    )

    return result


def main():

    print("=" * 70)
    print(
        "AGRINERVE 7-DAY MARKET DATASET BUILDER V4"
    )
    print("=" * 70)

    raw = load_data()

    print()
    print(
        f"RAW RECORDS: {len(raw)}"
    )

    clean = clean_data(
        raw
    )

    dataset = build_dataset(
        clean
    )

    print()
    print(
        f"ANALYTICAL RECORDS: {len(dataset)}"
    )

    print(
        "MARKET-VARIETY SERIES: "
        f"{dataset[['market', 'variety']].drop_duplicates().shape[0]}"
    )

    print(
        "CURRENT DATE RANGE: "
        f"{dataset['arrival_date'].min().date()} "
        f"→ "
        f"{dataset['arrival_date'].max().date()}"
    )

    print(
        "TARGET DATE RANGE: "
        f"{dataset['target_date'].min().date()} "
        f"→ "
        f"{dataset['target_date'].max().date()}"
    )

    # ---------------------------------------------------------
    # FINAL TARGET-GAP AUDIT
    # ---------------------------------------------------------

    gap = (
        dataset["target_date"]
        - dataset["arrival_date"]
    ).dt.days

    print()
    print("TARGET GAP AUDIT")
    print("-" * 70)
    print(
        f"MIN GAP        : {gap.min()}"
    )
    print(
        f"MEDIAN GAP     : {gap.median()}"
    )
    print(
        f"MEAN GAP       : {gap.mean():.2f}"
    )
    print(
        f"MAX GAP        : {gap.max()}"
    )
    print(
        f"GAPS < 7 DAYS  : {(gap < 7).sum()}"
    )
    print(
        f"GAPS > 14 DAYS : {(gap > 14).sum()}"
    )

    print()
    print("SAMPLE 7-DAY TARGETS")
    print("-" * 100)

    print(
        dataset[
            [
                "market",
                "variety",
                "arrival_date",
                "modal_price",
                "target_date",
                "target_modal_price_7d",
            ]
        ]
        .head(10)
        .to_string(
            index=False
        )
    )

    output = (
        "app/ml/market_7day_dataset.csv"
    )

    dataset.to_csv(
        output,
        index=False,
    )

    print()
    print(
        f"DATASET SAVED: {output}"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()
