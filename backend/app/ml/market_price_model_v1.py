from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


BASE_DIR = Path("app/ml/datasets")

FEATURE_COLUMNS = [
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
]

PRIMARY_SERIES = {
    ("Karapa APMC", "1001"),
    ("Peddapuram APMC", "1001"),
    ("Rajahmundry APMC", "Paddy"),
    ("Tiruvuru APMC", "Sona"),
}


def filter_primary(df):
    mask = [
        (market, variety) in PRIMARY_SERIES
        for market, variety in zip(
            df["market"],
            df["variety"],
        )
    ]

    return df.loc[mask].copy()


def evaluate(name, model, df):
    if df.empty:
        print(f"{name}: NO DATA")
        return

    X = df[FEATURE_COLUMNS]
    y = df["target_modal_price"]

    predictions = model.predict(X)

    mae = mean_absolute_error(y, predictions)

    rmse = mean_squared_error(
        y,
        predictions,
    ) ** 0.5

    mape = (
        (
            (y - predictions).abs()
            / y.abs()
        ).mean()
        * 100
    )

    print()
    print(name)
    print("-" * 60)
    print(f"ROWS : {len(df)}")
    print(f"MAE  : ₹{mae:.2f}")
    print(f"RMSE : ₹{rmse:.2f}")
    print(f"MAPE : {mape:.2f}%")


def main():
    print("=" * 70)
    print("AGRINERVE MARKET PRICE — RANDOM FOREST V2")
    print("=" * 70)

    train = filter_primary(
        pd.read_csv(BASE_DIR / "train.csv")
    )

    validation = filter_primary(
        pd.read_csv(BASE_DIR / "validation.csv")
    )

    test = filter_primary(
        pd.read_csv(BASE_DIR / "test.csv")
    )

    print()
    print(f"TRAINING ROWS: {len(train)}")

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    model.fit(
        train[FEATURE_COLUMNS],
        train["target_modal_price"],
    )

    print("MODEL TRAINED")

    evaluate(
        "VALIDATION",
        model,
        validation,
    )

    evaluate(
        "TEST",
        model,
        test,
    )

    print()
    print("FEATURE IMPORTANCE")
    print("-" * 60)

    importance = pd.Series(
        model.feature_importances_,
        index=FEATURE_COLUMNS,
    ).sort_values(
        ascending=False
    )

    for feature, value in importance.items():
        print(
            f"{feature:<25} {value:.4f}"
        )

    print()
    print("=" * 70)


if __name__ == "__main__":
    main()
