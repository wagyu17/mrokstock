import sqlite3
import os

db_path = os.path.expandvars(
    r"%LOCALAPPDATA%\Google\DriveFS\107873271909545665208\metadata_sqlite_db"
)
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check items table structure
cols = cursor.execute("PRAGMA table_info(items)").fetchall()
col_names = [c[1] for c in cols]
print("items columns:", col_names)

# Find management-related items
for col in col_names:
    if 'name' in col.lower() or 'title' in col.lower() or 'filename' in col.lower():
        try:
            rows = cursor.execute(
                f"SELECT stable_id, {col} FROM items WHERE {col} LIKE '%management%' LIMIT 10"
            ).fetchall()
            if rows:
                print(f"\nMatches in '{col}':")
                for r in rows:
                    print(f"  stable_id={r[0]}, {col}={r[1]}")
        except:
            pass

# Also check shortcut_details
print("\n=== shortcut_details ===")
scols = cursor.execute("PRAGMA table_info(shortcut_details)").fetchall()
print("Columns:", [c[1] for c in scols])
srows = cursor.execute("SELECT * FROM shortcut_details LIMIT 10").fetchall()
for r in srows:
    print(f"  {r}")

conn.close()
