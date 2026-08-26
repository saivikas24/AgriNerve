import pandas as pd
from pathlib import Path

base = Path("app/ml/datasets")

files = {
    "TRAIN": "train.csv",
    "VALIDATION": "validation.csv",
    "TEST": "test.csv",
}

series = [
    ("Karapa APMC", "1001"),
    ("Nandyal APMC", "Sona Mahsuri"),
    ("Peddapuram APMC", "1001"),
    ("Rajahmundry APMC", "Paddy"),
    ("Tiruvuru APMC", "Sona"),
]

dfs = {
    name: pd.read_csv(base / filename)
    for name, filename in files.items()
}

print("SERIES | TRAIN | VALIDATION | TEST")
print("-" * 90)

for market, variety in series:
    counts = []

    for name in ["TRAIN", "VALIDATION", "TEST"]:
        df = dfs[name]

        count = (
            (df["market"] == market)
            & (df["variety"] == variety)
        ).sum()

        counts.append(count)

    print(
        f"{market} | {variety} | "
        f"{counts[0]} | {counts[1]} | {counts[2]}"
    )
