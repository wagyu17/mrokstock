import sqlite3
import os

db_path = os.path.expandvars(
    r"%LOCALAPPDATA%\Google\DriveFS\107873271909545665208\metadata_sqlite_db"
)
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get details of management folder (stable_id=13621)
print("=== management folder (stable_id=13621) ===")
row = cursor.execute("SELECT * FROM items WHERE stable_id=13621").fetchone()
cols = cursor.execute("PRAGMA table_info(items)").fetchall()
col_names = [c[1] for c in cols]
for name, val in zip(col_names, row):
    print(f"  {name}: {val}")

# Check parent
print("\n=== Parent of management ===")
parents = cursor.execute("SELECT * FROM stable_parents WHERE child_stable_id=13621").fetchall()
pcols = cursor.execute("PRAGMA table_info(stable_parents)").fetchall()
print(f"Columns: {[c[1] for c in pcols]}")
for p in parents:
    print(f"  {p}")
    # Get parent name
    parent_id = p[1] if len(p) > 1 else None
    if parent_id:
        prow = cursor.execute("SELECT stable_id, local_title, id FROM items WHERE stable_id=?", (parent_id,)).fetchone()
        if prow:
            print(f"  Parent: stable_id={prow[0]}, title={prow[1]}, id={prow[2]}")

# Who is 陸上 shortcut (stable_id=24552)?
print("\n=== shortcut target 7655 ===")
row2 = cursor.execute("SELECT stable_id, local_title, id FROM items WHERE stable_id=7655").fetchone()
if row2:
    print(f"  stable_id={row2[0]}, title={row2[1]}, id={row2[2]}")

# Check if this management folder is a "mirrored" local folder or pure cloud
# Look at local_stable_ids
print("\n=== local_stable_ids for management ===")
lscols = cursor.execute("PRAGMA table_info(local_stable_ids)").fetchall()
print(f"Columns: {[c[1] for c in lscols]}")
lsrows = cursor.execute("SELECT * FROM local_stable_ids WHERE stable_id=13621").fetchall()
for r in lsrows:
    print(f"  {r}")

conn.close()
