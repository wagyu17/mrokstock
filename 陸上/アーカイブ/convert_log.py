import csv, sys, re
from collections import defaultdict
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

# ── CSV 読み込み ─────────────────────────────────────────────────────
with open('training_log_2026.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    header = next(reader)
    rows = list(reader)

C_TYPE=0; C_DATE=1; C_TITLE=3; C_DIST=4; C_CAL=5; C_TIME=6
C_AVG_HR=7; C_MAX_HR=8; C_AVG_PACE=12; C_BEST_PACE=13

MAX_HR = 187

# ── ユーティリティ ─────────────────────────────────────────────────
def parse_dist_km(s):
    s = s.strip()
    if s in ('--', '', '0.00'): return 0.0
    if '.' in s:
        try: return float(s)
        except: return 0.0
    else:
        try: return float(s.replace(',','')) / 1000
        except: return 0.0

def parse_float(s):
    try: return float(s.replace(',',''))
    except: return None

def parse_date(s):
    try: return datetime.strptime(s, '%Y-%m-%d %H:%M:%S')
    except: return None

def time_block(dt):
    if dt is None: return 'AM'
    h = dt.hour
    if 4 <= h < 12:  return 'AM'
    if 12 <= h < 18: return 'PM'
    return 'Night'

def fmt_pace(s):
    """5:36 → 5′36″"""
    if s in ('--', ''): return None
    p = s.split(':')
    try: return f"{p[0]}′{p[1]}″"
    except: return s

def fmt_time(s):
    """00:21:50 → 21′50″  /  01:00:00 → 60min"""
    p = s.split(':')
    try:
        h, m, sec = int(p[0]), int(p[1]), p[2]
        if h > 0:
            total_min = h*60 + m
            return f"{total_min}min"
        return f"{m}′{sec}″"
    except:
        return s

def zone_label(hr_str):
    v = parse_float(hr_str)
    if v is None: return None
    if v < MAX_HR * 0.60: return 'Z1'
    if v < MAX_HR * 0.70: return 'Z2'
    if v < MAX_HR * 0.80: return 'Z3'
    if v < MAX_HR * 0.90: return 'Z4'
    return 'Z5'

# ── 場所マッピング ──────────────────────────────────────────────────
LOCATION = {
    'ラン':           '@Road (Asphalt)',
    '屋内ラン':       '@TM',
    'トラックラン':   '@Track',
    'トレッドミル':   '@TM',
    '屋内バイク':     '@Bike (Indoor)',
    'バイク':         '@Road (Bike)',
    'Xトレーナー':    '@Elliptical',
    '筋力トレーニング': '@Gym',
    'HIIT':           '@Gym',
    'マルチスポーツ': '@—',
    '瞑想':           '@Meditation & Stretch',
}

# ── セッション目的ラベル ─────────────────────────────────────────────
def purpose(block_rows):
    types = [r[C_TYPE] for r in block_rows]
    hrs   = [parse_float(r[C_AVG_HR]) for r in block_rows]
    hrs   = [h for h in hrs if h]

    # 瞑想
    if all(t == '瞑想' for t in types):
        return '超回復・副交感神経起動'
    # 筋トレのみ
    if all(t == '筋力トレーニング' for t in types):
        return '筋力・補強'
    # HIIT
    if 'HIIT' in types:
        return '無酸素・HIIT'
    # トラックラン含む
    if 'トラックラン' in types:
        avg = sum(hrs)/len(hrs) if hrs else 0
        if avg >= MAX_HR * 0.80:
            return '閾値・スピード持久力'
        return '乳酸クリアランス強化'
    # 屋外ランのみ
    run_types = {'ラン','屋内ラン'}
    cross_types = {'トレッドミル','屋内バイク','Xトレーナー','バイク'}
    has_run   = any(t in run_types for t in types)
    has_cross = any(t in cross_types for t in types)
    if has_run and has_cross:
        return '有酸素ボリューム拡張（無衝撃＋特異的）'
    if has_cross and not has_run:
        has_ellip = any(t in {'Xトレーナー','屋内バイク','バイク'} for t in types)
        has_tm    = 'トレッドミル' in types
        if has_ellip and has_tm:
            return '有酸素ボリューム拡張（無衝撃＋特異的）'
        return '有酸素ボリューム（無衝撃クロストレーニング）'
    # 屋外ランのみ → HR で分類
    avg = sum(hrs)/len(hrs) if hrs else 0
    if avg >= MAX_HR * 0.80: return '閾値トレーニング'
    if avg >= MAX_HR * 0.70: return '有酸素強度'
    return '有酸素・ベース構築'

# ── 1 セッション → トレーニング行 ───────────────────────────────────
def training_line(r):
    t     = r[C_TYPE]
    title = r[C_TITLE]
    dist  = parse_dist_km(r[C_DIST])
    pace  = fmt_pace(r[C_AVG_PACE])
    hr    = r[C_AVG_HR]
    zl    = zone_label(hr)
    time_ = fmt_time(r[C_TIME])
    loc   = LOCATION.get(t, '@—')
    hr_str = f'HR{int(float(hr))}' if parse_float(hr) else '—'

    # インターバル記法がタイトルに含まれる場合そのまま使う
    interval_match = re.search(r'\d+[×x×]\d+[×x×][^\s]+', title)

    if t == '瞑想':
        return f'1×1×{time_} ({hr_str}) [–] {loc}'

    if t in ('Xトレーナー', '屋内バイク', 'バイク'):
        return f'1×1×{time_} ({zl} / {hr_str}) [–] {loc}'

    if t == '筋力トレーニング':
        return f'1×1×{time_} [–] {loc}'

    if t == 'HIIT':
        pace_str = f'{pace}/km' if pace else '—'
        return f'1×1×{time_} ({pace_str} / {hr_str}) [–] {loc}'

    if t == 'トレッドミル':
        # タイトルにインターバル記法があればそのまま
        if interval_match or ('High' in title or 'Low' in title):
            pace_str = f'{pace}/km' if pace else '—'
            return f'{title} ({pace_str} / {hr_str}) [–] {loc}'
        pace_str = f'{pace}/km' if pace else '—'
        return f'1×1×{time_} ({pace_str} / {hr_str}) [–] {loc}'

    # トラックラン
    if t == 'トラックラン':
        if dist > 0:
            dist_str = f'{dist*1000:.0f}m' if dist < 1 else f'{dist:.2f}km'
            pace_str = f'{pace}/km' if pace else '—'
            return f'1×1×{dist_str} ({pace_str} / {hr_str}) [–] {loc}'
        pace_str = f'{pace}/km' if pace else '—'
        return f'1×1×{time_} ({pace_str} / {hr_str}) [–] {loc}'

    # ラン・屋内ラン
    if dist > 0:
        pace_str = f'{pace}/km' if pace else '—'
        return f'1×1×{dist:.2f}km ({pace_str} / {hr_str}) [–] {loc}'
    pace_str = f'{pace}/km' if pace else '—'
    return f'1×1×{time_} ({pace_str} / {hr_str}) [–] {loc}'

# ── セッションをグループ化（日付 × 時間帯） ─────────────────────────
groups = defaultdict(list)
for r in rows:
    dt = parse_date(r[C_DATE])
    if dt is None: continue
    key = (dt.strftime('%Y-%m-%d'), time_block(dt))
    groups[key].append((dt, r))

# 時刻順にソート
for key in groups:
    groups[key].sort(key=lambda x: x[0])

# ── Markdown 生成 ────────────────────────────────────────────────────
lines = []
lines.append('# トレーニングログ 2025-12〜2026-04\n')
lines.append('> 最大心拍数 187 bpm 基準  \n')
lines.append('> Zone2: 112-130 / Zone3: 131-149 / Zone4: 150-168 / Zone5: 169-187\n')
lines.append('\n---\n')

# 日付順でソート
sorted_keys = sorted(groups.keys(), key=lambda x: x[0], reverse=True)

prev_date = None
for key in sorted_keys:
    date_str, block = key
    dt_obj = datetime.strptime(date_str, '%Y-%m-%d')
    jp_date = f'{dt_obj.year}/{dt_obj.month:02d}/{dt_obj.day:02d}'

    block_rows = [r for _, r in groups[key]]
    purp = purpose(block_rows)

    if date_str != prev_date:
        lines.append(f'\n## {jp_date}\n')
        prev_date = date_str

    lines.append(f'**{jp_date} {block}【{purp}】**  ')
    for _, r in groups[key]:
        tline = training_line(r)
        lines.append(f'{tline}  ')
    lines.append('Note:  ')
    lines.append('  ')
    lines.append('RPE:  ')
    lines.append('  ')
    lines.append('')

output = '\n'.join(lines)
with open('training_log_formatted.md', 'w', encoding='utf-8') as f:
    f.write(output)

print(f'完了: {len(groups)} ブロック → training_log_formatted.md')
