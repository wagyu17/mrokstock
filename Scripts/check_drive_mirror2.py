import sqlite3
import os

# Check the main metadata DB to understand synced folders
db_path = os.path.expandvars(
    r"%LOCALAPPDATA%\Google\DriveFS\107873271909545665208\metadata_sqlite_db"
)
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

tables = cursor.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
).fetchall()
print("Tables:", [t[0] for t in tables])

# Look for items with 'management' in name
for t in tables:
    try:
        cols = cursor.execute(f"PRAGMA table_info({t[0]})").fetchall()
        col_names = [c[1] for c in cols]
        # Check if there's a filename or name column
        name_cols = [c for c in col_names if 'name' in c.lower() or 'path' in c.lower() or 'filename' in c.lower()]
        if name_cols:
            for nc in name_cols:
                rows = cursor.execute(
                    f"SELECT * FROM {t[0]} WHERE {nc} LIKE '%management%' LIMIT 5"
                ).fetchall()
                if rows:
                    print(f"\n=== {t[0]}.{nc} matches 'management' ===")
                    print(f"Columns: {col_names}")
                    for r in rows:
                        print(f"  {r}")
    except Exception as e:
        pass

conn.close()
