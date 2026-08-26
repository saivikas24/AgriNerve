from pathlib import Path

import pandas as pd


INPUT_PATH = Path(
    "app/ml/market_analytical_dataset.csv"
)

OUTPUT_DIR = Path("app/ml/datasets")


def main() -> None:
    print("=" * 70)
    print("AGRINERVE TIME-BASED DATASET SPLIT")
    print("=" * 70)

    df = pd.read_csv(INPUT_PATH)

    df["arrival_date"] = pd.to_datetime(
        df["arrival_date"]
    )

    print(f"TOTAL ROWS: {len(df)}")
    print(
        f"DATE RANGE: "
        f"{df['arrival_date'].min().date()} "
        f"→ "
        f"{df['arrival_date'].max().date()}"
    )

    # Strict chronological split.
    train = df[
        df["arrival_date"].dt.year <= 2024
    ].copy()

    validation = df[
        df["arrival_date"].dt.year == 2025
    ].copy()

    test = df[
        df["arrival_date"].dt.year == 2026
    ].copy()

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    train_path = OUTPUT_DIR / "train.csv"
    validation_path = OUTPUT_DIR / "validation.csv"
    test_path = OUTPUT_DIR / "test.csv"

    train.to_csv(
        train_path,
        index=False,
    )

    validation.to_csv(
        validation_path,
        index=False,
    )

    test.to_csv(
        test_path,
        index=False,
    )

    print()
    print("SPLIT RESULTS")
    print("-" * 70)
    print(f"TRAIN      : {len(train)}")
    print(f"VALIDATION : {len(validation)}")
    print(f"TEST       : {len(test)}")

    print()
    print("TRAIN RANGE:")
    print(
        train["arrival_date"].min().date(),
        "→",
        train["arrival_date"].max().date(),
    )

    print("VALIDATION RANGE:")
    print(
        validation["arrival_date"].min().date(),
        "→",
        validation["arrival_date"].max().date(),
    )

    print("TEST RANGE:")
    print(
        test["arrival_date"].min().date(),
        "→",
        test["arrival_date"].max().date(),
    )

    print()
    print("MARKET-VARIETY SERIES")
    print("-" * 70)

    train_series = set(
        zip(
            train["market"],
            train["variety"],
        )
    )

    validation_series = set(
        zip(
            validation["market"],
            validation["variety"],
        )
    )

    test_series = set(
        zip(
            test["market"],
            test["variety"],
        )
    )

    print(
        f"TRAIN SERIES      : {len(train_series)}"
    )

    print(
        f"VALIDATION SERIES : {len(validation_series)}"
    )

    print(
        f"TEST SERIES       : {len(test_series)}"
    )

    print()
    print(
        "TEST SERIES WITHOUT TRAIN HISTORY:"
    )

    unseen_test = (
        test_series - train_series
    )

    if unseen_test:
        for market, variety in sorted(
            unseen_test
        ):
            print(
                f"  {market} | {variety}"
            )
    else:
        print("  None")

    print()
    print("FILES:")
    print(f"  {train_path}")
    print(f"  {validation_path}")
    print(f"  {test_path}")

    print("=" * 70)


if __name__ == "__main__":
    main()
