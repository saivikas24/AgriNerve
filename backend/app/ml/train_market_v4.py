from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


BASE = Path("app/ml/datasets_7day")

TRAIN_FILE = BASE / "train.csv"
VALIDATION_FILE = BASE / "validation.csv"
TEST_FILE = BASE / "test.csv"


TARGET = "target_modal_price_7d"


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


def evaluate(
    model,
    X,
    y,
    name,
):
    predictions = model.predict(X)

    mae = mean_absolute_error(
        y,
        predictions,
    )

    rmse = mean_squared_error(
        y,
        predictions,
    ) ** 0.5

    non_zero = y != 0

    mape = (
        abs(
            (
                y[non_zero]
                - predictions[non_zero]
            )
            / y[non_zero]
        ).mean()
        * 100
    )

    print()
    print(name)
    print("-" * 60)
    print(f"ROWS : {len(y)}")
    print(f"MAE  : ₹{mae:.2f}")
    print(f"RMSE : ₹{rmse:.2f}")
    print(f"MAPE : {mape:.2f}%")

    return predictions


def main():

    print("=" * 70)
    print(
        "AGRINERVE MARKET PRICE — "
        "RANDOM FOREST V4 — 7-DAY FORECAST"
    )
    print("=" * 70)

    train = pd.read_csv(
        TRAIN_FILE
    )

    validation = pd.read_csv(
        VALIDATION_FILE
    )

    test = pd.read_csv(
        TEST_FILE
    )

    X_train = train[FEATURES]
    y_train = train[TARGET]

    X_validation = validation[FEATURES]
    y_validation = validation[TARGET]

    X_test = test[FEATURES]
    y_test = test[TARGET]

    print()
    print("TRAINING DATA")
    print("-" * 60)
    print(
        f"ROWS: {len(train)}"
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
        X_train,
        y_train,
    )

    print("MODEL TRAINED")

    validation_predictions = evaluate(
        model,
        X_validation,
        y_validation,
        "VALIDATION",
    )

    test_predictions = evaluate(
        model,
        X_test,
        y_test,
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
    # SAVE PREDICTIONS
    # ---------------------------------------------------------

    prediction_output = test[
        [
            "market",
            "variety",
            "arrival_date",
            "modal_price",
            "target_date",
            TARGET,
        ]
    ].copy()

    prediction_output[
        "predicted_modal_price_7d"
    ] = test_predictions

    output_path = (
        Path("app/ml")
        / "v4_test_predictions.csv"
    )

    prediction_output.to_csv(
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
