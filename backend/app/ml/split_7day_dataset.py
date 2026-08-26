import pandas as pd
from pathlib import Path

INPUT = Path("app/ml/market_7day_dataset.csv")
OUTPUT = Path("app/ml/datasets_7day")

OUTPUT.mkdir(
    parents=True,
    exist_ok=True,
)

df = pd.read_csv(
    INPUT,
    parse_dates=[
        "arrival_date",
        "target_date",
    ],
)

df = df.sort_values(
    "arrival_date"
).reset_index(drop=True)

train = df[
    df["arrival_date"] < "2025-01-01"
].copy()

validation = df[
    (df["arrival_date"] >= "2025-01-01")
    & (df["arrival_date"] < "2026-01-01")
].copy()

test = df[
    df["arrival_date"] >= "2026-01-01"
].copy()

train.to_csv(
    OUTPUT / "train.csv",
    index=False,
)

validation.to_csv(
    OUTPUT / "validation.csv",
    index=False,
)

test.to_csv(
    OUTPUT / "test.csv",
    index=False,
)

print("=" * 70)
print("AGRINERVE V4 — 7-DAY TIME-BASED SPLIT")
print("=" * 70)

print()
print("TOTAL:", len(df))

print()
print("SPLIT RESULTS")
print("-" * 70)

for name, data in [
    ("TRAIN", train),
    ("VALIDATION", validation),
    ("TEST", test),
]:

    print(
        f"{name:<12}: {len(data)}"
    )

    if len(data) > 0:
        print(
            f"  CURRENT DATE : "
            f"{data['arrival_date'].min().date()} "
            f"→ "
            f"{data['arrival_date'].max().date()}"
        )

        print(
            f"  TARGET DATE  : "
            f"{data['target_date'].min().date()} "
            f"→ "
            f"{data['target_date'].max().date()}"
        )

print()
print("FILES:")
print(
    "  app/ml/datasets_7day/train.csv"
)
print(
    "  app/ml/datasets_7day/validation.csv"
)
print(
    "  app/ml/datasets_7day/test.csv"
)

print("=" * 70)
