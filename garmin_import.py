#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
garmin_import.py
----------------
2種類のGarminデータをObsidianノートに変換するスクリプト。

【使い方】
  # セッションFIT → 詳細トレーニングログ（PDCA形式）
  python garmin_import.py Training/Session_Data/20251207.fit

  # 月次アクティビティCSV → 月間サマリーノート
  python garmin_import.py Training/Monthly_Data/2025_12_Run.csv

  # 複数ファイル一括処理
  python garmin_import.py Training/Monthly_Data/*.csv

  # 確認のみ（ファイル作成なし）
  python garmin_import.py session.fit --dry-run

【CSV対応フォーマット】
  GarminConnect日本語エクスポート（月次アクティビティ一覧）
  ヘッダー例: アクティビティタイプ,日付,タイトル,距離,カロリー,タイム,...

【出力先】
  FIT  → Training/Logs/YYYY/MM/YYYY-MM-DD_{種別}.md
  月次  → Training/Monthly/YYYY-MM_monthly.md
"""

import sys, os, re, csv, math, argparse
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

VAULT_ROOT   = Path(__file__).parent
DEFAULT_LOGS = VAULT_ROOT / "Training" / "Logs"
DEFAULT_MON  = VAULT_ROOT / "Training" / "Monthly"

# 心拍ゾーン（最大心拍数の割合）
HR_ZONES = [
    (0.00, 0.60, "Z1 回復"),
    (0.60, 0.70, "Z2 有酸素"),
    (0.70, 0.80, "Z3 テンポ"),
    (0.80, 0.90, "Z4 閾値"),
    (0.90, 9.99, "Z5 VO2Max"),
]

# 日本語 → 英語のアクティビティタイプマッピング
JP_TYPE = {
    "ラン":         "run",
    "トラックラン": "track",
    "トレッドミル": "treadmill",
    "屋内ラン":     "treadmill",
    "バーチャルラン": "run",
}

# 種別の日本語表示名
TYPE_LABEL = {
    "run":       "ロードラン",
    "track":     "トラックラン",
    "treadmill": "トレッドミル",
}


# ─── ユーティリティ ──────────────────────────────────────────────────────────

def sanitize(name: str) -> str:
    name = re.sub(r'[\\/:*?"<>|]', "", name)
    name = re.sub(r"\s+", "_", name.strip())
    return name or "activity"


def sec_to_mmss(sec: float) -> str:
    if not sec or sec <= 0:
        return "--"
    m, s = divmod(int(sec), 60)
    return f"{m}:{s:02d}"


def speed_to_pace(speed_ms: float) -> str:
    """m/s → mm:ss /km"""
    if not speed_ms or speed_ms <= 0:
        return "--"
    return sec_to_mmss(1000 / speed_ms)


def dist_and_speed_to_pace(dist_km: float, elapsed_sec: float) -> str:
    """距離(km)と時間(秒)からペースを計算"""
    if not dist_km or not elapsed_sec or dist_km <= 0:
        return "--"
    pace_sec = elapsed_sec / dist_km
    return sec_to_mmss(pace_sec)


def parse_garmin_distance(raw: str) -> float:
    """
    Garmin CSV の距離を km に変換する。
    - 小数点あり（例: "15.65"）→ km そのまま
    - 整数（例: "3,600" "1,000" "90"）→ メートルと判断 → /1000 して km に変換
    """
    clean = raw.replace(",", "").strip()
    if not clean or clean == "--":
        return 0.0
    try:
        val = float(clean)
    except ValueError:
        return 0.0
    # 元の文字列に小数点がなければメートル単位
    if "." not in raw:
        return val / 1000.0
    return val


def parse_int(raw: str) -> int:
    try:
        return int(re.sub(r"[^\d]", "", str(raw)))
    except ValueError:
        return 0


def parse_float(raw: str) -> float:
    try:
        return float(re.sub(r"[^\d.]", "", str(raw)))
    except ValueError:
        return 0.0


def guess_session_type(title: str, act_type: str) -> str:
    """セッション種別をタイトル・タイプから推定"""
    t = (title + " " + act_type).lower()
    kw_map = [
        (["interval", "インターバル", "high/low", "×", "x"],  "interval"),
        (["race", "レース", "記録会", "大会", "競技会", "駅伝"], "race"),
        (["tempo", "テンポ", "ペース走", "pace"],              "tempo"),
        (["fartlek", "ファートレク"],                          "fartlek"),
        (["lsd", "long", "ロング", "easy"],                    "LSD"),
        (["jog", "ジョグ", "recovery", "回復"],                "jog"),
    ]
    for keywords, tag in kw_map:
        if any(k in t for k in keywords):
            return tag
    if act_type in ("track", "トラックラン"):
        return "interval"
    return "jog"


# ─── FIT インポーター ────────────────────────────────────────────────────────

def import_fit(filepath: Path, output_dir: Path, dry_run: bool):
    try:
        from fitparse import FitFile
    except ImportError:
        print("ERROR: fitparse 未インストール。 pip install fitparse を実行してください。")
        sys.exit(1)

    print(f"[FIT] {filepath.name}")
    fit      = FitFile(str(filepath))
    session  = {f.name: f.value for msg in fit.get_messages("session") for f in msg}
    laps     = [{f.name: f.value for f in msg} for msg in fit.get_messages("lap")]
    records  = [{f.name: f.value for f in msg} for msg in fit.get_messages("record")]
    print(f"  レコード: {len(records)}秒  ラップ: {len(laps)}")

    # ── 基本フィールド ──
    start_time   = session.get("start_time")
    date_str     = start_time.strftime("%Y-%m-%d") if start_time else datetime.today().strftime("%Y-%m-%d")

    total_dist_m = float(session.get("total_distance") or 0)
    dist_km      = round(total_dist_m / 1000, 2)

    elapsed_sec  = float(session.get("total_elapsed_time") or 0)
    moving_sec   = float(session.get("total_timer_time") or elapsed_sec)

    avg_hr   = int(session.get("avg_heart_rate") or 0)
    max_hr   = int(session.get("max_heart_rate") or 195)
    calories = int(session.get("total_calories") or 0)
    ascent   = int(session.get("total_ascent") or 0)

    # ケイデンス（FITは片足回転数 → ×2）
    raw_cad     = session.get("avg_running_cadence") or session.get("avg_cadence") or 0
    avg_cadence = int(raw_cad) * 2 if raw_cad else 0
    max_cad_raw = session.get("max_running_cadence") or session.get("max_cadence") or 0
    max_cadence = int(max_cad_raw) * 2 if max_cad_raw else 0

    # 走行ダイナミクス
    avg_gct     = session.get("avg_stance_time")          # ms
    avg_vo      = session.get("avg_vertical_oscillation") # mm → cm
    avg_balance = session.get("avg_stance_time_balance")

    # ペース：avg_speedが0の場合は距離÷時間で計算
    avg_speed_ms = float(session.get("avg_speed") or 0)
    max_speed_ms = float(session.get("max_speed") or 0)
    if avg_speed_ms > 0:
        avg_pace = speed_to_pace(avg_speed_ms)
    else:
        avg_pace = dist_and_speed_to_pace(dist_km, moving_sec)

    best_pace = speed_to_pace(max_speed_ms) if max_speed_ms > 0 else "--"

    # タイトル（日付＋種別で生成）
    sport     = str(session.get("sport") or "running").lower()
    sub_sport = str(session.get("sub_sport") or "").lower()
    note_type = _fit_guess_type(sport, sub_sport, laps)
    TYPE_JP   = {"interval": "インターバル", "race": "レース", "tempo": "テンポ走",
                 "fartlek": "ファートレク", "LSD": "ロング走", "jog": "ジョグ"}
    title     = f"{date_str}_{TYPE_JP.get(note_type, 'トレーニング')}"

    # ── 分析 ──
    hr_zones   = _calc_hr_zones(records, max_hr)
    lap_rows   = _build_lap_rows(laps)
    pace_dist  = _calc_pace_dist(records)

    # GCT単位変換（μs → ms）
    if avg_gct and avg_gct > 1000:
        avg_gct = avg_gct / 1000  # μs → ms
    if avg_vo and avg_vo > 1000:
        avg_vo = avg_vo / 100     # mm → cm として表示

    note = _build_fit_note(
        date_str=date_str, title=title, note_type=note_type,
        dist_km=dist_km, elapsed=sec_to_mmss(elapsed_sec), moving=sec_to_mmss(moving_sec),
        avg_pace=avg_pace, best_pace=best_pace,
        avg_hr=avg_hr, max_hr=max_hr, avg_cadence=avg_cadence, max_cadence=max_cadence,
        calories=calories, ascent=ascent,
        avg_gct=f"{avg_gct:.1f}" if avg_gct else None,
        avg_vo=f"{avg_vo:.1f}" if avg_vo else None,
        avg_balance=avg_balance,
        hr_zones=hr_zones, lap_rows=lap_rows, pace_dist=pace_dist,
    )

    dt   = datetime.strptime(date_str, "%Y-%m-%d")
    dest = output_dir / dt.strftime("%Y") / dt.strftime("%m") / f"{date_str}_{sanitize(note_type)}.md"

    if dry_run:
        print(f"  [DRY-RUN] → {dest}")
        print("─" * 60)
        print(note[:1000] + "\n...")
    else:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(note, encoding="utf-8")
        print(f"  [OK] → {dest}")

    print(f"  距離:{dist_km}km  ペース:{avg_pace}/km  平均HR:{avg_hr}  ケイデンス:{avg_cadence}spm")


def _fit_guess_type(sport: str, sub_sport: str, laps: list) -> str:
    if "track" in sub_sport:
        return "interval"
    lap_dists = [float(l.get("total_distance") or 0) for l in laps if l.get("total_distance")]
    if len(lap_dists) >= 4:
        avg_lap = sum(lap_dists) / len(lap_dists)
        if avg_lap < 1500:
            return "interval"
    return "jog"


def _calc_hr_zones(records: list, max_hr: int) -> dict:
    if not max_hr:
        return {}
    zone_secs = {name: 0 for _, _, name in HR_ZONES}
    valid = 0
    for rec in records:
        hr = rec.get("heart_rate")
        if not hr:
            continue
        pct = hr / max_hr
        for lo, hi, name in HR_ZONES:
            if lo <= pct < hi:
                zone_secs[name] += 1
                break
        valid += 1
    total = max(valid, 1)
    return {n: {"sec": s, "pct": round(s / total * 100, 1)} for n, s in zone_secs.items()}


def _calc_pace_dist(records: list) -> dict:
    buckets = [
        (0,   240,  "〜4:00"),
        (240, 270,  "4:00〜4:30"),
        (270, 300,  "4:30〜5:00"),
        (300, 360,  "5:00〜6:00"),
        (360, 9999, "6:00〜"),
    ]
    counts = {lbl: 0 for _, _, lbl in buckets}
    valid  = 0
    for rec in records:
        spd = rec.get("speed") or rec.get("enhanced_speed") or 0
        if not spd or spd <= 0:
            continue
        ps = 1000 / spd
        for lo, hi, lbl in buckets:
            if lo <= ps < hi:
                counts[lbl] += 1
                break
        valid += 1
    total = max(valid, 1)
    return {lbl: {"sec": s, "pct": round(s / total * 100, 1)} for lbl, s in counts.items()}


def _build_lap_rows(laps: list) -> list:
    rows = []
    for i, lap in enumerate(laps):
        dist    = float(lap.get("total_distance") or 0)
        elapsed = float(lap.get("total_elapsed_time") or 0)
        avg_hr  = lap.get("avg_heart_rate") or "--"
        avg_spd = float(lap.get("avg_speed") or 0)
        pace    = speed_to_pace(avg_spd) if avg_spd > 0 else dist_and_speed_to_pace(dist / 1000, elapsed)
        raw_cad = lap.get("avg_running_cadence") or 0
        cadence = int(raw_cad) * 2 if raw_cad else "--"
        if dist > 50:
            rows.append({
                "no":      i + 1,
                "dist":    f"{dist / 1000:.3f}",
                "time":    sec_to_mmss(elapsed),
                "pace":    pace,
                "hr":      avg_hr,
                "cadence": cadence,
            })
    return rows


def _build_fit_note(*, date_str, title, note_type, dist_km, elapsed, moving,
                    avg_pace, best_pace, avg_hr, max_hr, avg_cadence, max_cadence,
                    calories, ascent, avg_gct, avg_vo, avg_balance,
                    hr_zones, lap_rows, pace_dist) -> str:
    L = []
    L += ["---",
          f"date: {date_str}",
          f"type: {note_type}",
          f"distance_km: {dist_km}",
          f"time: {elapsed}",
          f"avg_pace: {avg_pace}",
          f"avg_hr: {avg_hr}",
          f"max_hr: {max_hr}",
          f"cadence: {avg_cadence}",
          "rpe:",
          "injury_notes:",
          "tags: [陸上, トレーニングログ]",
          "---", "",
          f"# {title}", ""]

    L += ["## Plan", "",
          "<!-- 練習前の目的・設定ペース・目標HR・予想RPEを記入 -->", "", ""]

    L += ["## Do", "", "### サマリー", "",
          "| 項目 | 値 |", "|------|-----|",
          f"| 距離 | **{dist_km} km** |",
          f"| 総時間 | {elapsed} |",
          f"| 動作時間 | {moving} |",
          f"| 平均ペース | **{avg_pace} /km** |",
          f"| ベストペース | {best_pace} /km |",
          f"| 平均HR | {avg_hr} bpm |",
          f"| 最大HR | {max_hr} bpm |",
          f"| 平均ケイデンス | {avg_cadence} spm |",
          f"| 最大ケイデンス | {max_cadence} spm |",
          f"| カロリー | {calories} kcal |",
          f"| 総上昇 | {ascent} m |"]
    if avg_gct:
        L.append(f"| 平均接地時間 (GCT) | {avg_gct} ms |")
    if avg_vo:
        L.append(f"| 平均上下動 | {avg_vo} cm |")
    if avg_balance:
        L.append(f"| 左右バランス | {avg_balance} |")
    L.append("")

    if hr_zones:
        L += ["### 心拍ゾーン分布", "",
              "| ゾーン | 時間 | 割合 | グラフ |",
              "|--------|------|------|----|"]
        for name, d in hr_zones.items():
            bar = "█" * max(1, int(d["pct"] / 5)) if d["sec"] > 0 else ""
            L.append(f"| {name} | {sec_to_mmss(d['sec'])} | {d['pct']}% | {bar} |")
        L.append("")

    if pace_dist:
        visible = [(lbl, d) for lbl, d in pace_dist.items() if d["sec"] > 0]
        if visible:
            L += ["### ペース分布（1秒データ）", "",
                  "| ペース帯 | 時間 | 割合 |",
                  "|---------|------|------|"]
            for lbl, d in visible:
                L.append(f"| {lbl} /km | {sec_to_mmss(d['sec'])} | {d['pct']}% |")
            L.append("")

    if lap_rows:
        L += ["### ラップ詳細", "",
              "| Lap | 距離 (km) | タイム | ペース | 平均HR | ケイデンス |",
              "|-----|-----------|--------|--------|--------|-----------|"]
        for r in lap_rows:
            L.append(f"| {r['no']} | {r['dist']} | {r['time']} | {r['pace']} /km | {r['hr']} bpm | {r['cadence']} spm |")
        L.append("")

    L += ["## Check", "",
          "- 計画との差異: ",
          "- 体感・フォーム: ",
          "- 怪我・違和感: ", ""]

    L += ["## Action", "",
          "- [ ] ", "",
          "---",
          "*[[2026_annual_training_plan]] | [[running_physiology_knowledge]] | [[Training/README]]*"]

    return "\n".join(L)


# ─── 月次CSVインポーター（日本語Garmin形式） ─────────────────────────────────

# 日本語列名 → 内部キーのマッピング
JP_COLUMNS = {
    "アクティビティタイプ": "type",
    "日付":               "date",
    "タイトル":           "title",
    "距離":               "distance",
    "カロリー":           "calories",
    "タイム":             "time",
    "平均心拍数":         "avg_hr",
    "最大心拍数":         "max_hr",
    "平均ピッチ":         "avg_cadence",
    "最高ピッチ":         "max_cadence",
    "平均ペース":         "avg_pace",
    "最高ペース":         "best_pace",
    "総上昇量":           "ascent",
    "Training Stress Score®": "tss",
    "平均接地時間":       "avg_gct",
    "平均上下動":         "avg_vo",
    "平均GCTバランス":    "gct_balance",
    "有酸素トレーニング効果": "aerobic_te",
}

RUNNING_JP  = {"ラン", "トラックラン", "トレッドミル", "屋内ラン", "バーチャルラン"}
STRENGTH_JP = {"筋力トレーニング", "HIIT", "カーディオ", "ジムおよびフィットネス器具", "Xトレーナー"}
CYCLING_JP  = {"バイク", "屋内バイク", "バーチャルバイク"}


def import_monthly_csv(filepath: Path, output_dir: Path, dry_run: bool):
    print(f"[CSV] {filepath.name}")

    with open(filepath, encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        raw_rows = list(reader)

    if not raw_rows:
        print("  [WARN] データ行なし")
        return

    # 列名を内部キーにマッピング
    headers = list(raw_rows[0].keys())
    col_map = {}
    for jp, key in JP_COLUMNS.items():
        for h in headers:
            if jp in h:
                col_map[h] = key
                break

    def get(row, key, default=""):
        for h, k in col_map.items():
            if k == key and h in row:
                return row[h]
        return default

    # ランニング系アクティビティのみフィルタ
    activities = []
    for row in raw_rows:
        act_type = get(row, "type").strip()
        if act_type not in RUNNING_JP:
            continue
        raw_date = get(row, "date").strip()
        try:
            dt = datetime.strptime(raw_date[:19], "%Y-%m-%d %H:%M:%S")
        except ValueError:
            continue

        dist_km  = parse_garmin_distance(get(row, "distance", "0"))
        en_type  = JP_TYPE.get(act_type, "run")

        activities.append({
            "dt":         dt,
            "date_str":   dt.strftime("%Y-%m-%d"),
            "type_jp":    act_type,
            "type_en":    en_type,
            "title":      get(row, "title"),
            "dist_km":    dist_km,
            "time":       get(row, "time"),
            "avg_hr":     parse_int(get(row, "avg_hr", "0")),
            "max_hr":     parse_int(get(row, "max_hr", "0")),
            "avg_cadence": parse_int(get(row, "avg_cadence", "0")),
            "avg_pace":   get(row, "avg_pace"),
            "best_pace":  get(row, "best_pace"),
            "ascent":     parse_int(get(row, "ascent", "0")),
            "tss":        parse_float(get(row, "tss", "0")),
            "aerobic_te": parse_float(get(row, "aerobic_te", "0")),
            "avg_gct":    get(row, "avg_gct"),
            "gct_balance": get(row, "gct_balance"),
        })

    if not activities:
        print("  [WARN] ランニング系アクティビティが見つかりません")
        return

    # 年月を特定（ファイル名または最初のアクティビティから）
    ym = _detect_year_month(filepath, activities)
    print(f"  対象月: {ym}  アクティビティ数: {len(activities)}")

    note = _build_monthly_note(ym, activities)

    dest = output_dir / f"{ym}_monthly.md"
    if dry_run:
        print(f"  [DRY-RUN] → {dest}")
        print("─" * 60)
        print(note[:1200] + "\n...")
    else:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(note, encoding="utf-8")
        print(f"  [OK] → {dest}")


def _detect_year_month(filepath: Path, activities: list) -> str:
    """ファイル名またはアクティビティ日付から年月(YYYY-MM)を判定"""
    # ファイル名から試みる (例: 2025_12_Run.csv)
    m = re.search(r"(\d{4})[_\-](\d{1,2})", filepath.stem)
    if m:
        return f"{m.group(1)}-{int(m.group(2)):02d}"
    # アクティビティの最多月を使用
    months = defaultdict(int)
    for a in activities:
        months[a["dt"].strftime("%Y-%m")] += 1
    return max(months, key=months.get)


def _build_monthly_note(ym: str, activities: list) -> str:
    year, month_num = ym.split("-")

    # ── 集計 ──
    total_km    = sum(a["dist_km"] for a in activities)
    n_sessions  = len(activities)
    weekly_avg  = round(total_km / 4.3, 1)

    by_type     = defaultdict(lambda: {"km": 0.0, "count": 0})
    for a in activities:
        by_type[a["type_en"]]["km"]    += a["dist_km"]
        by_type[a["type_en"]]["count"] += 1

    # 平均HR（0を除く）
    hrs         = [a["avg_hr"] for a in activities if a["avg_hr"] > 0]
    avg_hr_all  = round(sum(hrs) / len(hrs)) if hrs else 0

    # ベストペース（記録会/レース以外も含む全体最速）
    pace_secs   = [pace_str_to_sec(a["best_pace"]) for a in activities
                   if a["best_pace"] and a["best_pace"] != "--"]
    best_pace   = sec_to_mmss(min(pace_secs)) if pace_secs else "--"

    # 週別距離
    weeks = _calc_weekly(activities, ym)

    # 代表セッション（距離上位5件）
    top5 = sorted(activities, key=lambda x: x["dist_km"], reverse=True)[:5]

    # トラック/インターバルセッション一覧
    track_sessions = [a for a in activities if a["type_en"] == "track"]

    L = []
    L += ["---",
          f"date: {ym}-01",
          "tags: [陸上, 月次サマリー]",
          f"total_km: {round(total_km, 1)}",
          f"sessions: {n_sessions}",
          f"weekly_avg_km: {weekly_avg}",
          "---", "",
          f"# {ym} 月間トレーニングサマリー", ""]

    # ── 総距離 ──
    L += ["## 走行距離", "",
          "| 月間合計 | セッション数 | 週平均（推定） |",
          "|---------|------------|--------------|",
          f"| **{round(total_km, 1)} km** | {n_sessions} 回 | {weekly_avg} km |", ""]

    # ── 種別内訳 ──
    L += ["## 種別内訳", "",
          "| 種別 | 距離 | セッション | 割合 |",
          "|-----|------|----------|------|"]
    for en, lbl in TYPE_LABEL.items():
        d = by_type.get(en)
        if d and d["count"] > 0:
            pct = round(d["km"] / total_km * 100) if total_km > 0 else 0
            bar = "█" * (pct // 5)
            L.append(f"| {lbl} | {round(d['km'], 1)} km | {d['count']} 回 | {bar} {pct}% |")
    L.append("")

    # ── 心拍サマリー ──
    L += ["## 心拍数サマリー", "",
          f"- 月間平均HR: **{avg_hr_all} bpm**",
          f"- セッション最速ペース: **{best_pace} /km**", ""]

    # ── 週別内訳 ──
    if weeks:
        L += ["## 週別走行距離", "",
              "| 週 | 距離 | セッション数 | グラフ |",
              "|----|------|------------|-------|"]
        max_wkm = max(w["km"] for w in weeks.values()) if weeks else 1
        for wk, d in sorted(weeks.items()):
            bar_len = int(d["km"] / max(max_wkm, 1) * 20)
            bar = "█" * bar_len
            L.append(f"| W{wk} | {round(d['km'], 1)} km | {d['count']} 回 | {bar} |")
        L.append("")

    # ── 代表セッション ──
    L += ["## 主要セッション（距離上位5件）", "",
          "| 日付 | タイトル | 距離 | 平均ペース | 平均HR |",
          "|-----|---------|------|----------|-------|"]
    for a in top5:
        pace_disp = a["avg_pace"] if a["avg_pace"] and a["avg_pace"] != "--" else "-"
        hr_disp   = f"{a['avg_hr']} bpm" if a["avg_hr"] > 0 else "-"
        L.append(f"| {a['date_str']} | {a['title'][:25]} | {round(a['dist_km'],1)} km | {pace_disp} | {hr_disp} |")
    L.append("")

    # ── トラック練習一覧 ──
    if track_sessions:
        L += ["## トラック練習一覧", "",
              "| 日付 | タイトル | 距離 | ペース | 平均HR |",
              "|-----|---------|------|-------|-------|"]
        for a in sorted(track_sessions, key=lambda x: x["dt"]):
            L.append(f"| {a['date_str']} | {a['title'][:30]} | {round(a['dist_km'],2)} km | {a['avg_pace']} | {a['avg_hr']} bpm |")
        L.append("")

    # ── 月間評価（手入力欄） ──
    L += ["## 月間評価", "",
          "| 項目 | 評価 | コメント |",
          "|------|------|--------|",
          "| 走行距離 達成度 |  |  |",
          "| ポイント練の質 |  |  |",
          "| 怪我・コンディション |  |  |",
          "| 筋トレ頻度 |  |  |", ""]

    L += ["## 来月への申し送り", "",
          "<!-- 強化点・修正点・継続事項 -->", "",
          "- [ ] ", "",
          "---",
          f"*[[2026_annual_training_plan]] | [[Training/README]]*"]

    return "\n".join(L)


def _calc_weekly(activities: list, ym: str) -> dict:
    """週番号ごとの距離・セッション数を集計"""
    year, month = int(ym[:4]), int(ym[5:])
    weeks = defaultdict(lambda: {"km": 0.0, "count": 0})
    for a in activities:
        if a["dt"].year == year and a["dt"].month == month:
            wk = (a["dt"].day - 1) // 7 + 1
            weeks[wk]["km"]    += a["dist_km"]
            weeks[wk]["count"] += 1
    return dict(weeks)


def pace_str_to_sec(pace: str) -> float:
    """mm:ss → 秒"""
    if not pace or pace in ("--", ""):
        return 999999
    parts = pace.strip().split(":")
    try:
        return int(parts[0]) * 60 + int(parts[1])
    except (ValueError, IndexError):
        return 999999


# ─── エントリーポイント ──────────────────────────────────────────────────────

# ─── 筋トレ・クロストレーニング CSV ─────────────────────────────────────────

def import_crosstraining_csv(filepath: Path, output_dir: Path, dry_run: bool, label: str):
    """筋力トレーニング/バイク等のCSVから月別サマリーノートを生成"""
    print(f"[CSV:{label}] {filepath.name}")

    with open(filepath, encoding="utf-8-sig", newline="") as fh:
        rows = list(csv.DictReader(fh))

    if not rows:
        print("  データなし")
        return

    # 列名を正規化
    def get(row, *keys):
        for k in keys:
            for h, v in row.items():
                if k in h:
                    return v
        return ""

    # 全アクティビティをパース
    activities = []
    for row in rows:
        act_type = get(row, "アクティビティタイプ").strip()
        raw_date = get(row, "日付").strip()
        try:
            dt = datetime.strptime(raw_date[:19], "%Y-%m-%d %H:%M:%S")
        except ValueError:
            continue
        title    = get(row, "タイトル").strip()
        calories = parse_int(get(row, "カロリー"))
        duration = get(row, "タイム", "経過時間").strip()
        avg_hr   = parse_int(get(row, "平均心拍数"))
        distance = parse_garmin_distance(get(row, "距離") or "0")
        sets     = parse_int(get(row, "合計セット数"))
        reps     = parse_int(get(row, "合計レップ数"))
        activities.append({
            "dt": dt, "date_str": dt.strftime("%Y-%m-%d"),
            "type": act_type, "title": title,
            "calories": calories, "duration": duration,
            "avg_hr": avg_hr, "distance_km": distance,
            "sets": sets, "reps": reps,
        })

    if not activities:
        print("  有効なデータなし")
        return

    # 月別にグループ化
    by_month = defaultdict(list)
    for a in activities:
        by_month[a["dt"].strftime("%Y-%m")].append(a)

    print(f"  {len(activities)}件 / {len(by_month)}ヶ月分")

    for ym, month_acts in sorted(by_month.items()):
        note = _build_crosstraining_note(ym, month_acts, label)
        dest = output_dir / f"{ym}_{label}_monthly.md"
        if dry_run:
            print(f"  [DRY-RUN] → {dest}  ({len(month_acts)}件)")
        else:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(note, encoding="utf-8")
            total_cal = sum(a["calories"] for a in month_acts)
            print(f"  [OK] {ym} {label} {len(month_acts)}セッション / {total_cal}kcal → {dest.name}")


def _build_crosstraining_note(ym: str, acts: list, label: str) -> str:
    total_cal  = sum(a["calories"] for a in acts)
    n          = len(acts)
    hrs        = [a["avg_hr"] for a in acts if a["avg_hr"] > 0]
    avg_hr     = round(sum(hrs)/len(hrs)) if hrs else 0
    total_dist = round(sum(a["distance_km"] for a in acts), 1)

    # 種別カウント
    by_type = defaultdict(int)
    for a in acts:
        by_type[a["type"]] += 1

    L = []
    L += ["---",
          f"date: {ym}-01",
          f"tags: [陸上, {label}, 月次サマリー]",
          f"sessions: {n}",
          f"total_calories: {total_cal}",
          "---", "",
          f"# {ym} {label}サマリー", ""]

    L += ["## 概要", "",
          "| 項目 | 値 |", "|------|-----|",
          f"| セッション数 | {n} 回 |",
          f"| 総消費カロリー | {total_cal} kcal |"]
    if avg_hr:
        L.append(f"| 平均HR | {avg_hr} bpm |")
    if total_dist > 0:
        L.append(f"| 総距離 | {total_dist} km |")
    L.append("")

    if len(by_type) > 1:
        L += ["## 種別内訳", "",
              "| 種別 | 回数 |", "|-----|------|"]
        for t, c in sorted(by_type.items(), key=lambda x: -x[1]):
            L.append(f"| {t} | {c} 回 |")
        L.append("")

    L += ["## セッション一覧", "",
          "| 日付 | タイトル | 時間 | 平均HR | カロリー |",
          "|-----|---------|------|-------|--------|"]
    for a in sorted(acts, key=lambda x: x["dt"]):
        hr_disp  = f"{a['avg_hr']} bpm" if a["avg_hr"] > 0 else "-"
        cal_disp = f"{a['calories']} kcal" if a["calories"] > 0 else "-"
        sets_disp = f" ({a['sets']}set)" if a["sets"] > 0 else ""
        L.append(f"| {a['date_str']} | {a['title'][:20]}{sets_disp} | {a['duration']} | {hr_disp} | {cal_disp} |")
    L.append("")

    L += ["## メモ", "", "- [ ] ", "",
          "---", f"*[[2026_annual_training_plan]] | [[Training/README]]*"]
    return "\n".join(L)


def _detect_csv_category(filepath: Path, rows: list) -> str:
    """CSVの内容からカテゴリ（running/strength/cycling/mixed）を判定"""
    if not rows:
        return "mixed"
    types = set()
    for row in rows[:20]:  # 先頭20行で判定
        for h, v in row.items():
            if "アクティビティタイプ" in h:
                types.add(v.strip())
    running  = types & RUNNING_JP
    strength = types & STRENGTH_JP
    cycling  = types & CYCLING_JP
    if running and not strength and not cycling:
        return "running"
    if strength and not running and not cycling:
        return "strength"
    if cycling and not running and not strength:
        return "cycling"
    return "mixed"


# ─── エントリーポイント ──────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="GarminデータをObsidianトレーニングログに変換",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("files", nargs="+", help=".fit または .csv ファイル（複数可）")
    parser.add_argument("--output-dir",  help=f"FITログの出力先 (デフォルト: {DEFAULT_LOGS})")
    parser.add_argument("--monthly-dir", help=f"月次ノートの出力先 (デフォルト: {DEFAULT_MON})")
    parser.add_argument("--dry-run", action="store_true", help="ファイルを作成せず確認のみ")
    args = parser.parse_args()

    log_dir = Path(args.output_dir).resolve()  if args.output_dir  else DEFAULT_LOGS
    mon_dir = Path(args.monthly_dir).resolve() if args.monthly_dir else DEFAULT_MON

    for pattern in args.files:
        paths = list(Path(".").glob(pattern)) or [Path(pattern)]
        for path in paths:
            path = path.resolve()
            if not path.exists():
                print(f"[ERROR] 見つかりません: {path}")
                continue

            if path.suffix.lower() == ".fit":
                import_fit(path, log_dir, args.dry_run)

            elif path.suffix.lower() == ".csv":
                # CSVの内容を読んでカテゴリ判定
                with open(path, encoding="utf-8-sig", newline="") as fh:
                    sample = list(csv.DictReader(fh))
                category = _detect_csv_category(path, sample)
                if category == "running":
                    import_monthly_csv(path, mon_dir, args.dry_run)
                elif category == "strength":
                    import_crosstraining_csv(path, mon_dir, args.dry_run, "筋トレ")
                elif category == "cycling":
                    import_crosstraining_csv(path, mon_dir, args.dry_run, "バイク")
                else:
                    # mixed: ランニングとそれ以外が混在 → 分けて処理
                    import_monthly_csv(path, mon_dir, args.dry_run)
                    import_crosstraining_csv(path, mon_dir, args.dry_run, "クロストレーニング")
            else:
                print(f"[ERROR] 非対応形式: {path.suffix}  (.fit / .csv のみ)")


if __name__ == "__main__":
    main()
