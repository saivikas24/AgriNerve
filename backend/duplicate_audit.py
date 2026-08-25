from app.core.database import SessionLocal
from app.models.market_price import MarketPrice
from sqlalchemy import select, func


db = SessionLocal()

try:
    duplicate_keys = db.execute(
        select(
            MarketPrice.state,
            MarketPrice.market,
            MarketPrice.commodity,
            MarketPrice.variety,
            MarketPrice.arrival_date,
        )
        .group_by(
            MarketPrice.state,
            MarketPrice.market,
            MarketPrice.commodity,
            MarketPrice.variety,
            MarketPrice.arrival_date,
        )
        .having(func.count(MarketPrice.id) > 1)
        .order_by(MarketPrice.arrival_date)
    ).all()

    print()
    print("=" * 70)
    print("DUPLICATE RECORD INSPECTION")
    print("=" * 70)

    for key in duplicate_keys:

        state, market, commodity, variety, arrival_date = key

        print()
        print("-" * 70)
        print(
            f"Market   : {market}"
        )
        print(
            f"Variety  : {variety}"
        )
        print(
            f"Date     : {arrival_date}"
        )

        records = db.scalars(
            select(MarketPrice)
            .where(
                MarketPrice.state == state,
                MarketPrice.market == market,
                MarketPrice.commodity == commodity,
                MarketPrice.variety == variety,
                MarketPrice.arrival_date == arrival_date,
            )
            .order_by(MarketPrice.id)
        ).all()

        print(
            f"Records  : {len(records)}"
        )

        for record in records:
            print(
                f"  ID={record.id} | "
                f"Arrivals={record.arrivals_mt} | "
                f"Min={record.minimum_price} | "
                f"Max={record.maximum_price} | "
                f"Modal={record.modal_price} | "
                f"Fetched={record.fetched_at}"
            )

    print()
    print("=" * 70)
    print(
        f"DUPLICATE GROUPS: {len(duplicate_keys)}"
    )
    print("=" * 70)

finally:
    db.close()
