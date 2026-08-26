import pandas as pd
from pathlib import Path
from sklearn.metrics import mean_absolute_error, mean_squared_error


BASE_DIR = Path("app/ml/datasets")


def evaluate(name: str, df: pd.DataFrame) -> None:
    if df.empty:
        print(f"\n{name}: NO DATA")
        return

    actual = df["target_modal_price"]
    predicted = df["modal_price"]

    mae = mean_absolute_error(
        actual,
        predicted,
    )

    rmse = mean_squared_error(
        actual,
        predicted,
    ) ** 0.5

    non_zero = actual != 0

    mape = (
        (
            (
                actual[non_zero]
                - predicted[non_zero]
            ).abs()
            / actual[non_zero].abs()
        ).mean()
        * 100
    )

    print()
    print(name)
    print("-" * 50)
    print(f"ROWS : {len(df)}")
    print(f"MAE  : ₹{mae:.2f}")
    print(f"RMSE : ₹{rmse:.2f}")
    print(f"MAPE : {mape:.2f}%")


def main() -> None:
    print("=" * 70)
    print("AGRINERVE MARKET PRICE — NAIVE BASELINE")
    print("=" * 70)

    train = pd.read_csv(
        BASE_DIR / "train.csv"
    )

    validation = pd.read_csv(
        BASE_DIR / "validation.csv"
    )

    test = pd.read_csv(
        BASE_DIR / "test.csv"
    )

    # Primary evaluation series.
    primary_series = {
        ("Karapa APMC", "1001"),
        ("Peddapuram APMC", "1001"),
        ("Rajahmundry APMC", "Paddy"),
        ("Tiruvuru APMC", "Sona"),
    }

    def filter_series(df):
        mask = [
            (market, variety) in primary_series
            for market, variety
            in zip(
                df["market"],
                df["variety"],
            )
        ]

        return df.loc[mask].copy()

    primary_validation = filter_series(
        validation
    )

    primary_test = filter_series(
        test
    )

    evaluate(
        "PRIMARY VALIDATION",
        primary_validation,
    )

    evaluate(
        "PRIMARY TEST",
        primary_test,
    )

    print()
    print("=" * 70)


if __name__ == "__main__":
    main()
