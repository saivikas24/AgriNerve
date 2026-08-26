from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


BASE = Path("app/ml/datasets_7day")

FEATURES = [
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

TARGET = "target_delta_7d"


def evaluate(model, data, name):

    X = data[FEATURES]
    actual_delta = data[TARGET]

    predicted_delta = model.predict(X)

    predicted_price = (
        data["modal_price"].values
        + predicted_delta
    )

    actual_price = (
        data["target_modal_price_7d"].values
    )

    mae = mean_absolute_error(
        actual_price,
        predicted_price,
    )

    rmse = mean_squared_error(
        actual_price,
        predicted_price,
    ) ** 0.5

    mape = (
        abs(
            (
                actual_price
                - predicted_price
            )
            / actual_price
        ).mean()
        * 100
    )

    print()
    print(name)
    print("-" * 60)
    print(f"ROWS : {len(data)}")
    print(f"MAE  : ₹{mae:.2f}")
    print(f"RMSE : ₹{rmse:.2f}")
    print(f"MAPE : {mape:.2f}%")

    return predicted_price


def main():

    print("=" * 70)
    print(
        "AGRINERVE MARKET PRICE — "
        "DELTA MODEL V5 — 7-DAY FORECAST"
    )
    print("=" * 70)

    train = pd.read_csv(
        BASE / "train.csv"
    )

    validation = pd.read_csv(
        BASE / "validation.csv"
    )

    test = pd.read_csv(
        BASE / "test.csv"
    )

    # ---------------------------------------------------------
    # CREATE DELTA TARGET
    # ---------------------------------------------------------

    for data in [
        train,
        validation,
        test,
    ]:

        data[TARGET] = (
            data["target_modal_price_7d"]
            - data["modal_price"]
        )

    print()
    print("TRAINING DATA")
    print("-" * 60)
    print(
        f"ROWS: {len(train)}"
    )

    print(
        f"DELTA MEAN: "
        f"₹{train[TARGET].mean():.2f}"
    )

    print(
        f"DELTA STD : "
        f"₹{train[TARGET].std():.2f}"
    )

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1,
    )

    model.fit(
        train[FEATURES],
        train[TARGET],
    )

    print()
    print("MODEL TRAINED")

    evaluate(
        model,
        validation,
        "VALIDATION",
    )

    test_predictions = evaluate(
        model,
        test,
        "TEST",
    )

    print()
    print("FEATURE IMPORTANCE")
    print("-" * 60)

    importance = pd.Series(
        model.feature_importances_,
        index=FEATURES,
    ).sort_values(
        ascending=False
    )

    for feature, value in importance.items():

        print(
            f"{feature:<25} "
            f"{value:.4f}"
        )

    # ---------------------------------------------------------
    # SAVE TEST PREDICTIONS
    # ---------------------------------------------------------

    output = test[
        [
            "market",
            "variety",
            "arrival_date",
            "modal_price",
            "target_date",
            "target_modal_price_7d",
        ]
    ].copy()

    output[
        "predicted_modal_price_7d"
    ] = test_predictions

    output[
        "predicted_delta_7d"
    ] = (
        test_predictions
        - output["modal_price"]
    )

    output_path = (
        Path("app/ml")
        / "v5_test_predictions.csv"
    )

    output.to_csv(
        output_path,
        index=False,
    )

    print()
    print(
        f"PREDICTIONS SAVED: {output_path}"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()
