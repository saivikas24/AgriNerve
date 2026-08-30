from datetime import datetime

from app.core.database import SessionLocal
from app.services.market_service import ingest_paddy_prices


def run_daily_ingestion():
    """
    Fetch the current month's live AGMARKNET data
    and insert only new observations into PostgreSQL.
    """

    now = datetime.now()

    print()
    print("=" * 60)
    print("AGRINERVE DAILY MARKET INGESTION")
    print("=" * 60)
    print(f"Date: {now.date()}")
    print(f"Time: {now.strftime('%H:%M:%S')}")
    print("=" * 60)

    db = SessionLocal()

    try:
        result = ingest_paddy_prices(
            db,
            year=now.year,
            month=now.month,
        )

        print()
        print("INGESTION RESULT")
        print("-" * 60)
        print(f"Fetched : {result['fetched']}")
        print(f"Inserted: {result['inserted']}")
        print(f"Skipped : {result['skipped']}")
        print("-" * 60)
        print("Daily ingestion completed successfully.")

    except Exception as exc:
        db.rollback()

        print()
        print("DAILY INGESTION FAILED")
        print("-" * 60)
        print(f"Error: {exc}")
        print("-" * 60)

        raise

    finally:
        db.close()


if __name__ == "__main__":
    run_daily_ingestion()