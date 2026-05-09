#!/usr/bin/env python3
"""
scripts/build_site.py  ─ スマホ対応 静的サイト生成
使い方: python scripts/build_site.py
出力:   site/index.html  (ブラウザで開く / OneDrive 経由でスマホ共有)
"""
import sys, csv, json
from datetime import datetime, date, timedelta
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

BASE = Path(__file__).parent.parent
OUT  = BASE / 'site' / 'index.html'
(BASE / 'site').mkdir(exist_ok=True)

# ══ 定数 ══════════════════════════════════════════════════
RUN_TYPES   = {'ラン', 'トラックラン', 'トレッドミル', '屋内ラン'}
TRACK_TYPES = {'トラックラン'}
JPDAY       = ['月', '火', '水', '木', '金', '土', '日']

ZONE_DEF = [
    ('Z1', 0,   127, '#AEF0D4', '#2D6A4F', 'Zone1 (< 127)'),
    ('Z2', 128, 149, '#BDE0FB', '#1D3557', 'Zone2 (128-149)'),
    ('Z3', 150, 164, '#FFF3B0', '#7B5C00', 'Zone3 LT1 (150-164)'),
    ('Z4', 165, 174, '#FFCBA4', '#9B3B00', 'Zone4 LT2 (165-174)'),
    ('Z5', 175, 999, '#FFADAD', '#7D0000', 'Zone5 VO2max (175+)'),
]

TYPE_META = {
    'ラン':             ('🏃', '#3B82F6', 'ラン'),
    'トラックラン':     ('🏟', '#6366F1', 'トラック'),
    'トレッドミル':     ('⚡', '#8B5CF6', 'TM'),
    '屋内ラン':         ('🏃', '#3B82F6', '屋内'),
    'Xトレーナー':      ('🚴', '#10B981', 'X-TRN'),
    '筋力トレーニング': ('🏋', '#F59E0B', '筋トレ'),
    '瞑想':             ('🧘', '#6B7280', '瞑想'),
    'バイク':           ('🚴', '#10B981', 'バイク'),
}

# ══ ヘルパー ══════════════════════════════════════════════
def parse_dist(s, atype):
    if not s or s == '--': return 0.0
    try:    v = float(s.replace(',', ''))
    except: return 0.0
    return v / 1000 if atype in TRACK_TYPES else v

def parse_secs(s):
    if not s or s == '--': return 0
    s = s.split('.')[0]
    p = s.split(':')
    try:
        if len(p) == 3: return int(p[0])*3600 + int(p[1])*60 + int(p[2])
        if len(p) == 2: return int(p[0])*60 + int(p[1])
    except: pass
    return 0

def fmt_dur(s):
    if not s: return '--'
    h, r = divmod(s, 3600); m, sec = divmod(r, 60)
    return f"{h}:{m:02d}:{sec:02d}" if h else f"{m}:{sec:02d}"

def parse_int(s):
    if not s or s == '--': return None
    try: return int(float(s))
    except: return None

def hr_zone(hr):
    if hr is None: return ('--', '#E8E8E8', '#888', '—')
    for sh, lo, hi, bg, fg, _ in ZONE_DEF:
        if lo <= hr <= hi: return (sh, bg, fg, f"{hr}bpm")
    return ('--', '#E8E8E8', '#888', f"{hr}bpm")

def esc(s):
    return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

def week_mon(date_str):
    d = datetime.strptime(date_str, '%Y-%m-%d').date()
    return d - timedelta(days=d.weekday())

# ══ CSV 読み込み ══════════════════════════════════════════
acts = []
with open(BASE / 'training_log_2026.csv', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        atype = (row.get('アクティビティタイプ') or '').strip()
        ds    = (row.get('日付') or '').strip()
        if not ds: continue
        try:    dt = datetime.strptime(ds[:19], '%Y-%m-%d %H:%M:%S')
        except: continue

        dist  = parse_dist(row.get('距離', ''), atype)
        dur   = parse_secs(row.get('タイム', ''))
        ahr   = parse_int(row.get('平均心拍数', ''))
        mhr   = parse_int(row.get('最大心拍数', ''))
        ps    = (row.get('平均ペース') or '').strip()
        pace  = None
        if ps and ps != '--':
            pp = ps.split(':')
            try: pace = int(pp[0])*60 + int(pp[1])
            except: pass

        zsh, zbg, zfg, zlab = hr_zone(ahr)
        icon, col, lbl = TYPE_META.get(atype, ('⚡', '#9CA3AF', atype[:5] if atype else '?'))

        acts.append({
            'type':    atype,
            'is_run':  atype in RUN_TYPES,
            'date':    dt.strftime('%Y-%m-%d'),
            'mmdd':    f"{dt.month}/{dt.day}",
            'dow':     JPDAY[dt.weekday()],
            'title':   row.get('タイトル', '').strip(),
            'dist':    round(dist, 2),
            'dur':     dur,
            'dur_s':   fmt_dur(dur),
            'ahr':     ahr,
            'mhr':     mhr,
            'pace':    pace,
            'pace_s':  f"{pace//60}'{pace%60:02d}\"" if pace else '--',
            'zsh':     zsh,
            'zbg':     zbg,
            'zfg':     zfg,
            'zlab':    zlab,
            'icon':    icon,
            'col':     col,
            'lbl':     lbl,
        })

acts.sort(key=lambda x: x['date'], reverse=True)

# ══ 週次集計 ══════════════════════════════════════════════
weekly = {}
for a in acts:
    ws = week_mon(a['date'])
    if ws not in weekly: weekly[ws] = {'dist': 0.0, 'sessions': 0}
    weekly[ws]['sessions'] += 1
    if a['is_run']: weekly[ws]['dist'] += a['dist']

wkeys = sorted(weekly)
last8 = wkeys[-8:]
chart_wl = [f"{w.month}/{w.day}" for w in last8]
chart_wd = [round(weekly[w]['dist'], 1) for w in last8]

# ══ HRゾーン累計(分) ══════════════════════════════════════
zone_mins = {sh: 0.0 for sh, *_ in ZONE_DEF}
for a in acts:
    if a['is_run'] and a['ahr'] and a['dur'] > 0:
        if a['zsh'] in zone_mins: zone_mins[a['zsh']] += a['dur'] / 60
chart_zl = list(zone_mins.keys())
chart_zv = [round(v) for v in zone_mins.values()]

# ══ 週次距離推移（全週） ══════════════════════════════════
chart_all_wl = [f"{w.month}/{w.day}" for w in wkeys]
chart_all_wd = [round(weekly[w]['dist'], 1) for w in wkeys]

# ══ 7日統計 ═══════════════════════════════════════════════
today  = date.today()
cutoff = today - timedelta(days=7)
r7     = [a for a in acts if datetime.strptime(a['date'],'%Y-%m-%d').date() >= cutoff]
r7run  = [a for a in r7 if a['is_run']]
st_km  = round(sum(a['dist'] for a in r7run), 1)
st_ses = len(r7)
hrs7   = [a['ahr'] for a in r7run if a['ahr']]
st_hr  = round(sum(hrs7)/len(hrs7)) if hrs7 else '--'

# ══ カウントダウン ════════════════════════════════════════
race1 = date(2026, 5, 10)
days1 = max(0, (race1 - today).days)

# ══ 今週スケジュール ══════════════════════════════════════
SCHEDULE = {
    '月': 'バイク/エリプティカル 45〜60min (HR <130) + 完全休養',
    '火': 'イージージョグ 40〜50min (HR 140-145) + 筋トレ',
    '水': '【LT①】4〜5×2000m (3:35〜3:40) → 【LT②】20×400m (3:20)',
    '木': 'バイク 45min (HR 130-140) + イージージョグ 30min',
    '金': 'イージージョグ 40min (HR 140-145) + スプリント',
    '土': '【LT③】6〜8×1000m (3:30) → 【LT④】10〜12×500m (3:20)',
    '日': 'ロングラン 15〜20km (4:15〜4:30/km) 代々木クロカン',
}
today_dow  = JPDAY[today.weekday()]
today_plan = SCHEDULE.get(today_dow, 'レスト')

# ══ HTML 部品生成 ══════════════════════════════════════════
def make_act_row(a, idx):
    isrun  = '1' if a['is_run'] else '0'
    dist   = f"{a['dist']}km" if a['dist'] > 0 else '—'
    title  = esc(a['title']) or esc(a['type'])
    return (
        f'<div class="act-item" data-isrun="{isrun}" data-idx="{idx}">'
        f'<div class="act-top">'
        f'<span class="act-icon" style="background:{a["col"]}18;color:{a["col"]}">{a["icon"]}</span>'
        f'<div class="act-top-r">'
        f'<span class="act-date">{a["mmdd"]}({a["dow"]})</span>'
        f'<span class="badge" style="background:{a["col"]}20;color:{a["col"]}">{esc(a["lbl"])}</span>'
        f'</div></div>'
        f'<div class="act-title">{title}</div>'
        f'<div class="act-pills">'
        f'<span class="pill">📏 {dist}</span>'
        f'<span class="pill">⏱ {a["dur_s"]}</span>'
        f'<span class="pill">🏃 {a["pace_s"]}</span>'
        f'<span class="pill" style="background:{a["zbg"]};color:{a["zfg"]}">❤️ {a["zlab"]}</span>'
        f'</div></div>'
    )

def make_recent_mini(a):
    dist = f"{a['dist']}km" if a['dist'] > 0 else a['dur_s']
    return (
        f'<div class="rec-row">'
        f'<span class="rec-icon" style="color:{a["col"]}">{a["icon"]}</span>'
        f'<div class="rec-info"><div class="rec-title">{esc(a["title"]) or esc(a["type"])}</div>'
        f'<div class="rec-sub">{a["mmdd"]}({a["dow"]}) · {dist} · {a["pace_s"]}</div></div>'
        f'<span class="pill" style="background:{a["zbg"]};color:{a["zfg"]}">{a["zlab"]}</span>'
        f'</div>'
    )

act_list_html = '\n'.join(make_act_row(a, i) for i, a in enumerate(acts[:100]))
recent3_html  = '\n'.join(make_recent_mini(a) for a in acts[:3])

sched_rows = ''.join(
    f'<tr class="{"sched-today" if d == today_dow else ""}">'
    f'<td class="sched-d">{d}</td><td class="sched-p">{p}</td></tr>'
    for d, p in SCHEDULE.items()
)

pb_rows = [
    ('800m',    "1'55\"40", '2025/10', '大学歴代5位'),
    ('10000m',  "34'02\"",  '2024/10', '標準まであと2秒'),
    ('ハーフ',  "75'48\"",  '2025/03', ''),
    ('3000m',   "9'28\"",   '—',       '現状値'),
    ('5000m',   "16'00\"",  '—',       '現状値'),
]
pb_html = ''.join(
    f'<tr><td class="pb-ev">{ev}</td><td class="pb-mk">{mk}</td>'
    f'<td class="pb-dt">{dt}</td><td class="pb-nt">{nt}</td></tr>'
    for ev, mk, dt, nt in pb_rows
)

zone_guide_rows = ''.join(
    f'<tr><td class="zg-sh" style="background:{bg};color:{fg}">{sh}</td>'
    f'<td class="zg-nm">{name}</td></tr>'
    for sh, lo, hi, bg, fg, name in ZONE_DEF
)

chart_json = json.dumps({
    'wl':  chart_wl,  'wd':  chart_wd,
    'awl': chart_all_wl, 'awd': chart_all_wd,
    'zl':  chart_zl,  'zv':  chart_zv,
    'zbg': ['#AEF0D4','#BDE0FB','#FFF3B0','#FFCBA4','#FFADAD'],
}, ensure_ascii=False)

generated = datetime.now().strftime('%Y-%m-%d %H:%M')

# ══ HTML テンプレート ══════════════════════════════════════
HTML = """\
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>陸上 2026</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
     background:#F0F4F8;color:#1E293B;padding-bottom:64px;max-width:480px;margin:0 auto}
/* ── HEADER ── */
.hdr{background:linear-gradient(135deg,#1E40AF,#2563EB);color:#fff;
     padding:12px 16px 10px;position:sticky;top:0;z-index:100;
     display:flex;align-items:center;justify-content:space-between}
.hdr-title{font-size:16px;font-weight:700;letter-spacing:.5px}
.hdr-sub{font-size:10px;opacity:.7}
/* ── BOTTOM NAV ── */
.bnav{position:fixed;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;
      background:#fff;border-top:1px solid #E2E8F0;display:flex;z-index:100}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;padding:6px 0 4px;
    font-size:9px;color:#94A3B8;border:none;background:none;cursor:pointer;transition:.15s}
.nb .ni{font-size:22px;margin-bottom:1px}
.nb.active{color:#2563EB}
.nb.active .ni{transform:scale(1.1)}
/* ── TABS ── */
.tab{display:none;padding:12px 12px 20px;animation:fi .2s ease}
.tab.active{display:block}
@keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
/* ── CARDS ── */
.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;
      box-shadow:0 1px 3px rgba(0,0,0,.07)}
.card-title{font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;
            letter-spacing:.5px;margin-bottom:10px}
/* ── COUNTDOWN ── */
.cd-card{background:linear-gradient(135deg,#1E40AF,#3B82F6);color:#fff;
         border-radius:14px;padding:16px;margin-bottom:10px;text-align:center;
         box-shadow:0 4px 12px rgba(59,130,246,.35)}
.cd-num{font-size:64px;font-weight:800;line-height:1}
.cd-label{font-size:12px;opacity:.85;margin-top:2px}
.cd-race{font-size:14px;font-weight:600;margin-top:8px;
         background:rgba(255,255,255,.15);border-radius:8px;padding:4px 12px;display:inline-block}
/* ── STATS ROW ── */
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}
.stat{background:#fff;border-radius:10px;padding:10px 8px;text-align:center;
      box-shadow:0 1px 3px rgba(0,0,0,.07)}
.stat-num{font-size:22px;font-weight:700;color:#1E40AF}
.stat-lbl{font-size:10px;color:#64748B;margin-top:2px}
/* ── TODAY PLAN ── */
.today-card{background:#EFF6FF;border:1.5px solid #BFDBFE;border-radius:12px;padding:12px;margin-bottom:10px}
.today-title{font-size:11px;font-weight:700;color:#1E40AF;margin-bottom:6px}
.today-text{font-size:13px;color:#1E293B;line-height:1.5}
/* ── RECENT ── */
.rec-row{display:flex;align-items:center;gap:10px;padding:10px 0;
         border-bottom:1px solid #F1F5F9}
.rec-row:last-child{border-bottom:none}
.rec-icon{font-size:24px;width:36px;text-align:center;flex-shrink:0}
.rec-info{flex:1;min-width:0}
.rec-title{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rec-sub{font-size:11px;color:#64748B;margin-top:2px}
/* ── ACTIVITY LIST ── */
.filter-bar{display:flex;gap:6px;margin-bottom:10px;overflow-x:auto;padding-bottom:2px}
.fb{border:1.5px solid #E2E8F0;border-radius:20px;padding:5px 12px;font-size:12px;
    font-weight:500;background:#fff;color:#64748B;cursor:pointer;white-space:nowrap}
.fb.active{background:#2563EB;color:#fff;border-color:#2563EB}
.act-item{background:#fff;border-radius:10px;padding:12px;margin-bottom:8px;
          box-shadow:0 1px 3px rgba(0,0,0,.06)}
.act-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.act-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;
          justify-content:center;font-size:16px;flex-shrink:0}
.act-top-r{display:flex;align-items:center;gap:6px}
.act-date{font-size:12px;font-weight:600;color:#64748B}
.act-title{font-size:13px;font-weight:500;margin-bottom:6px;
           white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.act-pills{display:flex;flex-wrap:wrap;gap:4px}
/* ── BADGES / PILLS ── */
.badge{font-size:10px;font-weight:600;border-radius:4px;padding:2px 6px}
.pill{font-size:11px;border-radius:20px;padding:3px 8px;background:#F1F5F9;color:#475569}
/* ── CHARTS ── */
.chart-wrap{position:relative;height:200px;margin-top:4px}
/* ── PLAN ── */
.goals-table,.sched-table,.pb-table,.zone-table{width:100%;border-collapse:collapse;font-size:12px;margin-top:4px}
.goals-table td,.sched-table td,.pb-table td,.zone-table td{padding:7px 6px;border-bottom:1px solid #F1F5F9;vertical-align:top}
.goal-tag{font-size:10px;font-weight:700;border-radius:4px;padding:2px 6px;
          background:#EFF6FF;color:#1E40AF;white-space:nowrap}
.goal-content{font-size:12px;font-weight:500}
.goal-date{font-size:11px;color:#64748B}
.sched-d{width:28px;font-weight:700;color:#374151;white-space:nowrap}
.sched-p{color:#374151;line-height:1.4}
.sched-today td{background:#EFF6FF}
.sched-today .sched-d{color:#2563EB}
.pb-ev{font-weight:600;white-space:nowrap}
.pb-mk{font-weight:700;color:#1E40AF;white-space:nowrap}
.pb-dt,.pb-nt{color:#64748B;font-size:11px}
.zg-sh{border-radius:4px;padding:3px 6px;font-size:11px;font-weight:700;text-align:center;white-space:nowrap}
.zg-nm{font-size:11px;color:#374151;padding-left:8px}
/* ── PHASE BANNER ── */
.phase-banner{background:linear-gradient(135deg,#7C3AED,#A78BFA);color:#fff;
              border-radius:10px;padding:12px;margin-bottom:10px}
.phase-name{font-size:15px;font-weight:700}
.phase-sub{font-size:11px;opacity:.85;margin-top:3px}
.phase-goal{font-size:12px;background:rgba(255,255,255,.2);border-radius:6px;
            padding:4px 10px;display:inline-block;margin-top:8px}
/* ── GENERATED ── */
.gen-note{text-align:center;font-size:10px;color:#94A3B8;padding:8px;margin-top:4px}
</style>
</head>
<body>

<header class="hdr">
  <div>
    <div class="hdr-title">🏃 陸上 2026</div>
    <div class="hdr-sub">Phase 1 &mdash; 標準記録突破へ</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;opacity:.8">更新</div>
    <div style="font-size:10px;opacity:.6">GENERATED_AT</div>
  </div>
</header>

<main>

<!-- ═══ HOME ═══ -->
<div id="tab-home" class="tab active">

  <div class="cd-card">
    <div class="cd-num">DAYS1</div>
    <div class="cd-label">日後</div>
    <div class="cd-race">🏁 5月10日 東海大ナイター 10000m</div>
  </div>

  <div class="stat-row">
    <div class="stat">
      <div class="stat-num">ST_KM</div>
      <div class="stat-lbl">7日間 km</div>
    </div>
    <div class="stat">
      <div class="stat-num">ST_SES</div>
      <div class="stat-lbl">7日間 活動数</div>
    </div>
    <div class="stat">
      <div class="stat-num">ST_HR</div>
      <div class="stat-lbl">7日 平均HR</div>
    </div>
  </div>

  <div class="today-card">
    <div class="today-title">📅 TODAY_DOW曜日 今日の予定</div>
    <div class="today-text">TODAY_PLAN</div>
  </div>

  <div class="card">
    <div class="card-title">直近の活動</div>
    RECENT3
  </div>

</div>

<!-- ═══ LOG ═══ -->
<div id="tab-log" class="tab">
  <div class="filter-bar">
    <button class="fb active" onclick="filterActs('all',this)">全て</button>
    <button class="fb" onclick="filterActs('run',this)">ランのみ</button>
    <button class="fb" onclick="filterActs('other',this)">クロストレ</button>
  </div>
  ACT_LIST
  <div class="gen-note">最新100件を表示</div>
</div>

<!-- ═══ CHARTS ═══ -->
<div id="tab-charts" class="tab">
  <div class="card">
    <div class="card-title">週別走行距離 (km)</div>
    <div class="chart-wrap"><canvas id="chart-weekly"></canvas></div>
  </div>
  <div class="card">
    <div class="card-title">HRゾーン分布 (累計・分)</div>
    <div class="chart-wrap"><canvas id="chart-zone"></canvas></div>
  </div>
  <div class="card">
    <div class="card-title">週次距離推移（全期間）</div>
    <div class="chart-wrap"><canvas id="chart-trend"></canvas></div>
  </div>
</div>

<!-- ═══ PLAN ═══ -->
<div id="tab-plan" class="tab">

  <div class="phase-banner">
    <div class="phase-name">Phase 1 &mdash; 標準記録突破へのピーキング</div>
    <div class="phase-sub">4月13日 〜 5月10日（4週間）</div>
    <div class="phase-goal">🎯 目標タイム: 33分50秒（必須: 34分00秒切り）</div>
  </div>

  <div class="card">
    <div class="card-title">シーズン目標</div>
    <table class="goals-table">
      <tr>
        <td><span class="goal-tag">絶対</span></td>
        <td class="goal-content">10000m 34:00切り（予選会標準突破）</td>
        <td class="goal-date">5月10日</td>
      </tr>
      <tr>
        <td><span class="goal-tag">主</span></td>
        <td class="goal-content">10000m 32:30以内（3:15/km）</td>
        <td class="goal-date">9月後半</td>
      </tr>
      <tr>
        <td><span class="goal-tag">最終</span></td>
        <td class="goal-content">箱根駅伝予選会 出走</td>
        <td class="goal-date">10月</td>
      </tr>
    </table>
  </div>

  <div class="card">
    <div class="card-title">Phase 1 週間スケジュール</div>
    <table class="sched-table">
      SCHED_ROWS
    </table>
  </div>

  <div class="card">
    <div class="card-title">自己ベスト</div>
    <table class="pb-table">
      <tr style="font-size:10px;color:#64748B">
        <th style="text-align:left">種目</th><th style="text-align:left">記録</th>
        <th style="text-align:left">日付</th><th style="text-align:left">備考</th>
      </tr>
      PB_ROWS
    </table>
  </div>

  <div class="card">
    <div class="card-title">HRゾーン基準（HRMax 187bpm）</div>
    <table class="zone-table">
      ZONE_GUIDE
    </table>
  </div>

</div>

</main>

<nav class="bnav">
  <button class="nb active" id="nb-home" onclick="switchTab('home')">
    <span class="ni">🏠</span>ホーム
  </button>
  <button class="nb" id="nb-log" onclick="switchTab('log')">
    <span class="ni">📋</span>ログ
  </button>
  <button class="nb" id="nb-charts" onclick="switchTab('charts')">
    <span class="ni">📊</span>グラフ
  </button>
  <button class="nb" id="nb-plan" onclick="switchTab('plan')">
    <span class="ni">📅</span>計画
  </button>
</nav>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
const D = CHART_JSON;
let chartsReady = false;

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nb').forEach(el => el.classList.remove('active'));
  document.getElementById('nb-' + name).classList.add('active');
  if (name === 'charts' && !chartsReady) buildCharts();
}

function filterActs(type, btn) {
  document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.act-item').forEach(el => {
    const ir = el.dataset.isrun;
    let show = true;
    if (type === 'run')   show = ir === '1';
    if (type === 'other') show = ir === '0';
    el.style.display = show ? '' : 'none';
  });
}

function buildCharts() {
  chartsReady = true;
  Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, sans-serif';
  Chart.defaults.font.size = 11;

  new Chart(document.getElementById('chart-weekly'), {
    type: 'bar',
    data: {
      labels: D.wl,
      datasets: [{ label: '走行距離 (km)', data: D.wd,
        backgroundColor: '#3B82F6', borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'km' } } }
    }
  });

  new Chart(document.getElementById('chart-zone'), {
    type: 'doughnut',
    data: {
      labels: D.zl,
      datasets: [{ data: D.zv, backgroundColor: D.zbg, borderWidth: 1 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { font: { size: 10 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}分` } }
      }
    }
  });

  new Chart(document.getElementById('chart-trend'), {
    type: 'line',
    data: {
      labels: D.awl,
      datasets: [{ label: '週間距離 (km)', data: D.awd,
        borderColor: '#6366F1', backgroundColor: '#6366F120',
        borderWidth: 2, pointRadius: 3, fill: true, tension: 0.3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}
</script>
</body>
</html>
"""

# ══ プレースホルダー置換 ══════════════════════════════════
html = (HTML
    .replace('GENERATED_AT', generated)
    .replace('DAYS1',        str(days1))
    .replace('ST_KM',        str(st_km))
    .replace('ST_SES',       str(st_ses))
    .replace('ST_HR',        str(st_hr))
    .replace('TODAY_DOW',    today_dow)
    .replace('TODAY_PLAN',   esc(today_plan))
    .replace('RECENT3',      recent3_html)
    .replace('ACT_LIST',     act_list_html)
    .replace('SCHED_ROWS',   sched_rows)
    .replace('PB_ROWS',      pb_html)
    .replace('ZONE_GUIDE',   zone_guide_rows)
    .replace('CHART_JSON',   chart_json)
)

OUT.write_text(html, encoding='utf-8')
print(f'✅ 生成完了: {OUT}')
print(f'   活動データ: {len(acts)} 件')
print(f'   週次データ: {len(wkeys)} 週')

# ══ data.json 出力 (Gemini参照用) ══════════════════════════
JSON_OUT = BASE / 'site' / 'data.json'
data_export = {
    'generated_at': generated,
    'stats_7d': {
        'km': st_km,
        'sessions': st_ses,
        'avg_hr': st_hr,
    },
    'race_countdown': {
        'name': '東海大ナイター 10000m',
        'date': '2026-05-10',
        'days_remaining': days1,
    },
    'recent_activities': [
        {
            'date':     a['date'],
            'type':     a['type'],
            'title':    a['title'],
            'dist_km':  a['dist'],
            'duration': a['dur_s'],
            'avg_hr':   a['ahr'],
            'max_hr':   a['mhr'],
            'pace':     a['pace_s'],
            'hr_zone':  a['zsh'],
        }
        for a in acts[:30]
    ],
    'weekly_summary': [
        {
            'week_start': str(w),
            'km':         round(weekly[w]['dist'], 1),
            'sessions':   weekly[w]['sessions'],
        }
        for w in sorted(weekly.keys())[-12:]
    ],
}
JSON_OUT.write_text(json.dumps(data_export, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'✅ data.json 生成: {JSON_OUT}')
