from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    rows = conn.execute(
        text("""
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'market_prices'::regclass
            AND contype = 'u'
        """)
    ).all()

print("UNIQUE CONSTRAINTS:")

for row in rows:
    print(row[0])
