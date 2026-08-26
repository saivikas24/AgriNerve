from datetime import datetime

import pandas as pd
from sqlalchemy import select

from app.core.database import Base, SessionLocal, engine
from app.models.reservoir import WaterReservoir


CSV_PATH = "app/ml/water/raw/reservoir_raw.csv"


def main():

    print("=" * 70)
    print("AGRINERVE - WATER RESERVOIR DATABASE LOADER")
    print("=" * 70)

    print()
    print("CREATING TABLES...")

    Base.metadata.create_all(
        bind=engine,
        tables=[
            WaterReservoir.__table__
        ],
    )

    print("TABLE READY: water_reservoirs")

    print()
    print("READING CSV...")

    df = pd.read_csv(
        CSV_PATH
    )

    print(
        f"CSV ROWS: {len(df)}"
    )

    db = SessionLocal()

    try:

        existing = db.scalars(
            select(WaterReservoir)
        ).all()

        if existing:

            print(
                f"EXISTING DATABASE ROWS: {len(existing)}"
            )

            print(
                "Removing previous AP DES snapshot..."
            )

            for row in existing:
                db.delete(row)

            db.commit()

        records = []

        for _, row in df.iterrows():

            updated_at = None

            if pd.notna(
                row["updated_at"]
            ):

                updated_at = datetime.strptime(
                    str(row["updated_at"]),
                    "%d/%m/%y %H:%M",
                )

            fetched_at = datetime.now()

            if pd.notna(
                row["fetched_at"]
            ):

                try:
                    fetched_at = datetime.fromisoformat(
                        str(row["fetched_at"])
                    )
                except ValueError:
                    pass

            record = WaterReservoir(

                source_id=(
                    int(row["source_id"])
                    if pd.notna(row["source_id"])
                    else None
                ),

                district=str(
                    row["district"]
                ),

                mandal=str(
                    row["mandal"]
                ),

                reservoir=str(
                    row["reservoir"]
                ),

                river=(
                    str(row["river"])
                    if pd.notna(row["river"])
                    else None
                ),

                present_level_m=(
                    float(row["present_level_m"])
                    if pd.notna(
                        row["present_level_m"]
                    )
                    else None
                ),

                present_level_ft=(
                    float(row["present_level_ft"])
                    if pd.notna(
                        row["present_level_ft"]
                    )
                    else None
                ),

                present_capacity_mcum=(
                    float(
                        row["present_capacity_mcum"]
                    )
                    if pd.notna(
                        row["present_capacity_mcum"]
                    )
                    else None
                ),

                present_capacity_tmc=(
                    float(
                        row["present_capacity_tmc"]
                    )
                    if pd.notna(
                        row["present_capacity_tmc"]
                    )
                    else None
                ),

                frl_m=(
                    float(row["frl_m"])
                    if pd.notna(row["frl_m"])
                    else None
                ),

                frl_ft=(
                    float(row["frl_ft"])
                    if pd.notna(row["frl_ft"])
                    else None
                ),

                gross_capacity_mcum=(
                    float(
                        row["gross_capacity_mcum"]
                    )
                    if pd.notna(
                        row["gross_capacity_mcum"]
                    )
                    else None
                ),

                gross_capacity_tmc=(
                    float(
                        row["gross_capacity_tmc"]
                    )
                    if pd.notna(
                        row["gross_capacity_tmc"]
                    )
                    else None
                ),

                storage_percentage=(
                    float(
                        row["storage_percentage"]
                    )
                    if pd.notna(
                        row["storage_percentage"]
                    )
                    else None
                ),

                updated_at=updated_at,

                source="AP_DES",

                fetched_at=fetched_at,
            )

            records.append(record)

        db.add_all(records)

        db.commit()

        print()
        print(
            f"INSERTED: {len(records)}"
        )

        count = db.scalar(
            select(
                __import__(
                    "sqlalchemy"
                ).func.count(
                    WaterReservoir.id
                )
            )
        )

        print(
            f"DATABASE ROWS: {count}"
        )

        print()
        print("=" * 70)
        print("DATABASE LOAD SUCCESS")
        print("=" * 70)

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


if __name__ == "__main__":
    main()
