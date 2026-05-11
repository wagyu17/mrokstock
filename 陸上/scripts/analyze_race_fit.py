"""Parse FIT activity and print summary statistics for 5/10 race analysis."""
import sys
from collections import defaultdict
from fitparse import FitFile

PATH = r"C:\Users\tomot\Desktop\management\陸上\更新用トレーニングログ\22830804822_ACTIVITY.fit"

fit = FitFile(PATH)

# ---- session ----
print("===== SESSION =====")
for msg in fit.get_messages('session'):
    for f in msg:
        if f.value is None:
            continue
        print(f"{f.name}: {f.value} {f.units or ''}")

# ---- laps ----
print("\n===== LAPS =====")
laps = []
for msg in fit.get_messages('lap'):
    d = {f.name: f.value for f in msg}
    laps.append(d)
print(f"lap count: {len(laps)}")
keys = ['message_index','total_distance','total_elapsed_time','total_timer_time',
        'avg_speed','max_speed','avg_heart_rate','max_heart_rate',
        'avg_cadence','max_cadence','avg_running_cadence','total_calories',
        'total_ascent','total_descent','avg_step_length','avg_vertical_oscillation',
        'avg_stance_time','avg_vertical_ratio']
for i,l in enumerate(laps):
    print(f"\n-- lap {i+1} --")
    for k in keys:
        if k in l and l[k] is not None:
            print(f"  {k}: {l[k]}")

# ---- records: aggregate per ~1km bucket by distance ----
print("\n===== RECORDS (every 50 samples) =====")
records = []
for msg in fit.get_messages('record'):
    d = {f.name: f.value for f in msg}
    records.append(d)
print(f"record count: {len(records)}")

if records:
    print(f"first record keys: {list(records[0].keys())}")
    # print every Nth
    N = max(1, len(records)//30)
    for i in range(0, len(records), N):
        r = records[i]
        ts = r.get('timestamp')
        dist = r.get('distance')
        spd = r.get('enhanced_speed') or r.get('speed')
        hr = r.get('heart_rate')
        cad = r.get('cadence')
        pace = (1000.0/spd) if spd else None
        print(f"i={i} t={ts} dist={dist} spd={spd} pace={'%.1f' % pace if pace else None} hr={hr} cad={cad}")

# ---- per-km splits from records ----
print("\n===== PER-KM SPLITS (computed from records) =====")
if records:
    km = 1
    last_dist = 0.0
    last_t = None
    hr_buf = []
    cad_buf = []
    spd_buf = []
    start_t = None
    for r in records:
        d = r.get('distance')
        t = r.get('timestamp')
        if d is None or t is None:
            continue
        if start_t is None:
            start_t = t
            last_t = t
        hr_buf.append(r.get('heart_rate'))
        cad_buf.append(r.get('cadence'))
        s = r.get('enhanced_speed') or r.get('speed')
        if s:
            spd_buf.append(s)
        while d >= km*1000:
            elapsed = (t - last_t).total_seconds() if last_t else None
            hr_valid = [x for x in hr_buf if x]
            cad_valid = [x for x in cad_buf if x]
            avg_hr = sum(hr_valid)/len(hr_valid) if hr_valid else None
            max_hr = max(hr_valid) if hr_valid else None
            avg_cad = sum(cad_valid)/len(cad_valid) if cad_valid else None
            avg_spd = sum(spd_buf)/len(spd_buf) if spd_buf else None
            pace = 1000.0/avg_spd if avg_spd else None
            total_elapsed = (t - start_t).total_seconds()
            ahr = f"{avg_hr:.1f}" if avg_hr else "na"
            ac = f"{avg_cad*2:.1f}" if avg_cad else "na"
            ap = f"{pace:.1f}" if pace else "na"
            print(f"km {km}: elapsed={total_elapsed:.0f}s split~{elapsed:.0f}s "
                  f"avgHR={ahr} maxHR={max_hr} avgCad*2={ac} pace={ap}s/km")
            last_t = t
            hr_buf = []
            cad_buf = []
            spd_buf = []
            km += 1
    # tail
    if hr_buf:
        hr_valid = [x for x in hr_buf if x]
        cad_valid = [x for x in cad_buf if x]
        avg_hr = sum(hr_valid)/len(hr_valid) if hr_valid else None
        max_hr = max(hr_valid) if hr_valid else None
        avg_cad = sum(cad_valid)/len(cad_valid) if cad_valid else None
        avg_spd = sum(spd_buf)/len(spd_buf) if spd_buf else None
        pace = 1000.0/avg_spd if avg_spd else None
        print(f"tail (after km {km-1}): avgHR={avg_hr} maxHR={max_hr} avgCad*2={avg_cad*2 if avg_cad else None} pace={pace}s/km")
