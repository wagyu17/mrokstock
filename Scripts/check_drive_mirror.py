import sqlite3
import os

db_path = os.path.expandvars(
    r"%LOCALAPPDATA%\Google\DriveFS\107873271909545665208\mirror_sqlite.db"
)
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

tables = cursor.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
).fetchall()
print("Tables:", [t[0] for t in tables])

for t in tables:
    cols = cursor.execute(f"PRAGMA table_info({t[0]})").fetchall()
    print(f"\n=== {t[0]} ===")
    print(f"Columns: {[c[1] for c in cols]}")
    rows = cursor.execute(f"SELECT * FROM {t[0]} LIMIT 3").fetchall()
    for r in rows:
        print(f"  {r}")

conn.close()
