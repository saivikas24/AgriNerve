from datetime import date

from app.core.database import SessionLocal
from app.services.market_service import ingest_paddy_prices


def month_range(
    start_year: int,
    start_month: int,
    end_year: int,
    end_month: int,
):
    current_year = start_year
    current_month = start_month

    while (
        current_year < end_year
        or (
            current_year == end_year
            and current_month <= end_month
        )
    ):
        yield current_year, current_month

        if current_month == 12:
            current_month = 1
            current_year += 1
        else:
            current_month += 1


def ingest_historical_data(
    start_year: int,
    start_month: int,
    end_year: int,
    end_month: int,
):
    total_fetched = 0
    total_inserted = 0
    total_skipped = 0

    print()
    print("=" * 60)
    print("AGRINERVE HISTORICAL MARKET INGESTION")
    print("=" * 60)
    print(
        f"Range: {start_year}-{start_month:02d}"
        f" → {end_year}-{end_month:02d}"
    )
    print("=" * 60)

    for year, month in month_range(
        start_year,
        start_month,
        end_year,
        end_month,
    ):
        print()
        print(
            f"Fetching {year}-{month:02d}..."
        )

        db = SessionLocal()

        try:
            result = ingest_paddy_prices(
                db,
                year=year,
                month=month,
            )

            fetched = result["fetched"]
            inserted = result["inserted"]
            skipped = result["skipped"]

            total_fetched += fetched
            total_inserted += inserted
            total_skipped += skipped

            print(
                f"  Fetched : {fetched}"
            )
            print(
                f"  Inserted: {inserted}"
            )
            print(
                f"  Skipped : {skipped}"
            )

        except Exception as exc:
            db.rollback()

            print(
                f"  ERROR: {exc}"
            )
            print(
                "  Continuing with next month..."
            )

        finally:
            db.close()

    print()
    print("=" * 60)
    print("INGESTION COMPLETE")
    print("=" * 60)
    print(
        f"Total fetched : {total_fetched}"
    )
    print(
        f"Total inserted: {total_inserted}"
    )
    print(
        f"Total skipped : {total_skipped}"
    )
    print("=" * 60)


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 5:
        print(
            "Usage:"
        )
        print(
            "python historical_ingestion.py "
            "START_YEAR START_MONTH END_YEAR END_MONTH"
        )
        print()
        print(
            "Example:"
        )
        print(
            "python historical_ingestion.py "
            "2026 5 2026 5"
        )
        raise SystemExit(1)

    start_year = int(sys.argv[1])
    start_month = int(sys.argv[2])
    end_year = int(sys.argv[3])
    end_month = int(sys.argv[4])

    ingest_historical_data(
        start_year=start_year,
        start_month=start_month,
        end_year=end_year,
        end_month=end_month,
    )
