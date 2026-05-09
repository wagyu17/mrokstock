"""
sync_garmin.py  ─ Garmin Connect から最新データを自動同期する
──────────────────────────────────────────────────────────────
初回セットアップ:
  pip install garminconnect

  初回実行時にメールアドレスとパスワードを入力します。
  認証トークンが %USERPROFILE%\\.garth に保存されるので、
  2回目以降はパスワード入力不要です。

  2段階認証（MFA）が有効な場合:
    ガーミンからSMSまたはメールで届いたコードを入力してください。

使い方:
  更新.bat を実行すると自動的に呼ばれます。
  または単独で:
  > python scripts\\sync_garmin.py
──────────────────────────────────────────────────────────────
"""
import sys, os, csv, io, getpass, json
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR  = Path(__file__).resolve().parent.parent
CSV_PATH  = BASE_DIR / "training_log_2026.csv"
LAP_DIR   = BASE_DIR / "更新用トレーニングログ"
ACT_CSV   = LAP_DIR / "Activities_synced.csv"
TOKEN_DIR = Path.home() / ".garth"

sys.stdout.reconfigure(encoding='utf-8')

try:
    import garminconnect
except ImportError:
    print("ERROR: garminconnect がインストールされていません。")
    print("       pip install garminconnect  を実行してください。")
    sys.exit(1)

# ── アクティビティタイプ（英語 → 日本語） ────────────────
TYPE_MAP = {
    "running":             "ラン",
    "track_running":       "トラックラン",
    "treadmill_running":   "トレッドミル",
    "indoor_running":      "屋内ラン",
    "cycling":             "サイクリング",
    "indoor_cycling":      "屋内バイク（サイクリング）",
    "elliptical":          "エリプティカル",
    "strength_training":   "筋力トレーニング",
    "fitness_equipment":   "フィットネス機器",
    "cardio_training":     "有酸素運動",
    "walking":             "ウォーキング",
    "hiking":              "ハイキング",
    "swimming":            "水泳",
    "open_water_swimming": "オープンウォータースイミング",
    "other":               "その他",
}

# training_log_2026.csv のカラム順（Garmin手動エクスポートと同じ）
CSV_COLUMNS = [
    'アクティビティタイプ', '日付', 'お気に入り', 'タイトル', '距離', 'カロリー',
    'タイム', '平均心拍数', '最大心拍数', '有酸素トレーニング効果',
    '平均ピッチ', '最高ピッチ', '平均ペース', '最高ペース', '総上昇量', '総下降量',
    '平均歩幅', '平均上下動比', '平均上下動', '平均接地時間', '平均GCTバランス',
    '勾配調整後のペース（GAP）平均', 'Normalized Power® (NP®)',
    'Training Stress Score®', '平均パワー', '最大パワー',
    'ステップ', '合計レップ数', '合計セット数', 'Body Battery消費量',
    '最低気温', '減圧', 'ベストラップタイム', 'ラップ数', '最高気温',
    '平均呼吸数', '最小呼吸数', '最大呼吸数', 'ストレス変化',
    'ストレス開始', 'ストレス終了', '平均ストレス', '最大ストレス',
    '移動時間', '経過時間', '最低高度', '最高高度',
]


# ── フォーマット関数 ──────────────────────────────────────
def fmt_time(secs):
    """秒 → HH:MM:SS"""
    if secs is None:
        return '--'
    h, rem = divmod(int(secs), 3600)
    m, s   = divmod(rem, 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


def fmt_pace(speed_ms):
    """m/s → M:SS (分/km)"""
    if not speed_ms or speed_ms <= 0:
        return '--'
    total = 1000 / speed_ms
    m, s  = divmod(int(total), 60)
    return f"{m}:{s:02d}"


def fmt_dist(dist_m):
    """メートル → カンマ区切り整数文字列
    import_laps.py の距離照合（単位: m）と合わせるため整数メートルで統一。
    """
    if dist_m is None:
        return '--'
    return f"{int(round(dist_m)):,}"


def fmt_gct(left_pct):
    """左接地率 → '左 XX.X%／右 YY.Y%'"""
    if left_pct is None:
        return '--'
    return f"左 {left_pct:.1f}%／右 {100 - left_pct:.1f}%"


def v(x):
    """None → '--'"""
    return '--' if x is None else x


def activity_to_row(a):
    """garminconnect アクティビティ辞書 → CSV行リスト"""
    type_key = (a.get('activityType') or {}).get('typeKey', 'other')
    ja_type  = TYPE_MAP.get(type_key, type_key)

    row = {col: '--' for col in CSV_COLUMNS}
    row.update({
        'アクティビティタイプ':      ja_type,
        '日付':                    a.get('startTimeLocal', '--'),
        'お気に入り':               'false',
        'タイトル':                 a.get('activityName', ''),
        '距離':                    fmt_dist(a.get('distance')),
        'カロリー':                 v(a.get('calories')),
        'タイム':                   fmt_time(a.get('duration')),
        '平均心拍数':               v(a.get('averageHR')),
        '最大心拍数':               v(a.get('maxHR')),
        '有酸素トレーニング効果':     v(a.get('aerobicTrainingEffect')),
        '平均ピッチ':               v(a.get('averageRunningCadenceInStepsPerMinute')),
        '最高ピッチ':               v(a.get('maxRunningCadenceInStepsPerMinute')),
        '平均ペース':               fmt_pace(a.get('averageSpeed')),
        '最高ペース':               fmt_pace(a.get('maxSpeed')),
        '総上昇量':                 v(a.get('elevationGain')),
        '総下降量':                 v(a.get('elevationLoss')),
        '平均歩幅':                 v(a.get('averageStrideLength')),
        '平均上下動比':             v(a.get('avgVerticalRatio')),
        '平均上下動':               v(a.get('avgVerticalOscillation')),
        '平均接地時間':             v(a.get('avgGroundContactTime')),
        '平均GCTバランス':          fmt_gct(a.get('avgGct')),
        '最低気温':                 v(a.get('minTemperature')),
        '最高気温':                 v(a.get('maxTemperature')),
        'ラップ数':                 v(a.get('lapCount')),
        '移動時間':                 fmt_time(a.get('movingDuration')),
        '経過時間':                 fmt_time(a.get('elapsedDuration')),
        '最低高度':                 v(a.get('minElevation')),
        '最高高度':                 v(a.get('maxElevation')),
    })
    return [row[col] for col in CSV_COLUMNS]


# ── CSV ユーティリティ ────────────────────────────────────
def get_existing_datetimes():
    """CSV に存在する '日付' 文字列のセットを返す（重複防止）"""
    existing = set()
    if not CSV_PATH.exists():
        return existing
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            d = row.get('日付', '').strip()
            if d:
                existing.add(d)
    return existing


def get_last_date():
    """CSV の最新日付（datetime）を返す。ファイルがなければ None。"""
    if not CSV_PATH.exists():
        return None
    latest = None
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            try:
                dt = datetime.strptime(row['日付'], '%Y-%m-%d %H:%M:%S')
                if latest is None or dt > latest:
                    latest = dt
            except Exception:
                continue
    return latest


def prepend_rows(new_rows):
    """新規行を training_log_2026.csv のヘッダー直後に挿入（新しい順）"""
    if CSV_PATH.exists():
        with open(CSV_PATH, 'r', encoding='utf-8-sig', newline='') as f:
            content = f.read()
        nl     = content.find('\n')
        header = content[:nl + 1] if nl != -1 else content + '\n'
        rest   = content[nl + 1:] if nl != -1 else ''
    else:
        header = ','.join(CSV_COLUMNS) + '\n'
        rest   = ''

    buf    = io.StringIO()
    writer = csv.writer(buf, lineterminator='\n')
    for row in new_rows:
        writer.writerow(row)

    with open(CSV_PATH, 'w', encoding='utf-8-sig', newline='') as f:
        f.write(header + buf.getvalue() + rest)


def update_activities_csv(new_rows):
    """Activities_synced.csv を更新（import_laps.py の日付照合用）"""
    LAP_DIR.mkdir(exist_ok=True)

    existing = set()
    if ACT_CSV.exists():
        with open(ACT_CSV, 'r', encoding='utf-8-sig') as f:
            for row in csv.DictReader(f):
                d = row.get('日付', '').strip()
                if d:
                    existing.add(d)

    # 行[1] = 日付カラム
    to_add = [r for r in new_rows if r[1] not in existing]
    if not to_add:
        return

    write_header = not ACT_CSV.exists()
    with open(ACT_CSV, 'w' if write_header else 'a',
              encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, lineterminator='\n')
        if write_header:
            writer.writerow(CSV_COLUMNS)
        writer.writerows(to_add)


# ── 認証 ─────────────────────────────────────────────────
def login():
    """garmin クライアントを返す。トークンがあれば再利用。CI環境では環境変数を使用。"""

    def mfa_callback():
        return input('\n  2段階認証コード（SMS/メール/Authenticator）: ').strip()

    # CI環境（非対話）: 環境変数から強制ログイン
    is_ci = not sys.stdin.isatty()
    ci_email    = os.environ.get('GARMIN_EMAIL', '').strip()
    ci_password = os.environ.get('GARMIN_PASSWORD', '').strip()

    if is_ci:
        if not ci_email or not ci_password:
            print('ERROR: CI環境では GARMIN_EMAIL / GARMIN_PASSWORD 環境変数が必要です')
            sys.exit(1)
        TOKEN_DIR.mkdir(parents=True, exist_ok=True)
        garmin = garminconnect.Garmin(ci_email, ci_password, prompt_mfa=mfa_callback)
        garmin.login(str(TOKEN_DIR))
        print('  ✓ CI環境変数でログイン')
        return garmin

    # ローカル: 保存済みトークンで試みる
    if ci_email and ci_password:
        TOKEN_DIR.mkdir(parents=True, exist_ok=True)
        garmin = garminconnect.Garmin(ci_email, ci_password, prompt_mfa=mfa_callback)
        garmin.login(str(TOKEN_DIR))
        print('  ✓ 環境変数でログイン')
        return garmin

    if TOKEN_DIR.exists():
        garmin = garminconnect.Garmin(prompt_mfa=mfa_callback)
        try:
            garmin.login(str(TOKEN_DIR))
            print('  ✓ 保存済みトークンでログイン')
            return garmin
        except Exception:
            print('  トークン無効 → 再ログインします')

    # 対話ログイン（初回 or トークン期限切れ）
    print()
    email    = input('  Garmin メールアドレス: ').strip()
    password = getpass.getpass('  パスワード: ')
    TOKEN_DIR.mkdir(parents=True, exist_ok=True)

    garmin = garminconnect.Garmin(email, password, prompt_mfa=mfa_callback)
    garmin.login(str(TOKEN_DIR))
    print(f'  ✓ ログイン成功（トークン保存先: {TOKEN_DIR}）')
    return garmin


# ── メイン ───────────────────────────────────────────────
def main():
    print('\n========================================')
    print(' Garmin Connect データ同期')
    print('========================================')

    garmin   = login()
    last_dt  = get_last_date()
    existing = get_existing_datetimes()

    # 取得開始日を決定（最終同期日の翌日 or 今年1月1日）
    if last_dt:
        start_date = (last_dt + timedelta(days=1)).strftime('%Y-%m-%d')
        print(f'  最終同期: {last_dt.strftime("%Y-%m-%d %H:%M:%S")}')
    else:
        start_date = '2026-01-01'
        print('  初回同期 — 2026年1月以降を全件取得します')

    end_date = datetime.now().strftime('%Y-%m-%d')
    print(f'  取得対象: {start_date} ～ {end_date}')

    print('  アクティビティ一覧を取得中...', end='', flush=True)
    try:
        activities = garmin.get_activities_by_date(start_date, end_date)
    except Exception as e:
        print(f'\n  ✗ 取得失敗: {e}')
        sys.exit(1)
    print(f' {len(activities)} 件取得')

    # 重複除外
    new_acts = [
        a for a in activities
        if a.get('startTimeLocal', '') not in existing
    ]

    # 新しい順にソート
    new_acts.sort(key=lambda a: a.get('startTimeLocal', ''), reverse=True)
    print(f'  新規アクティビティ: {len(new_acts)} 件')

    if not new_acts:
        print('  同期するデータがありません。\n')
        return

    # training_log_2026.csv & Activities_synced.csv を更新
    new_rows = [activity_to_row(a) for a in new_acts]
    prepend_rows(new_rows)
    update_activities_csv(new_rows)
    print(f'  ✓ training_log_2026.csv に {len(new_acts)} 件追記')
    print(f'  ✓ Activities_synced.csv 更新')

    # ラップCSVのダウンロード
    LAP_DIR.mkdir(exist_ok=True)
    DL_FMT       = garminconnect.Garmin.ActivityDownloadFormat.CSV
    downloaded   = skipped = errors = 0

    for a in new_acts:
        act_id   = a.get('activityId')
        act_name = a.get('activityName', '')
        dt_str   = a.get('startTimeLocal', '')[:10]
        if not act_id:
            continue

        out_path = LAP_DIR / f"activity_{act_id}.csv"
        if out_path.exists():
            skipped += 1
            continue

        print(f'  ラップDL: {dt_str}  {act_name}', end='', flush=True)
        try:
            data = garmin.download_activity(act_id, dl_fmt=DL_FMT)
            with open(out_path, 'wb') as f:
                f.write(data)
            downloaded += 1
            print(' ✓')
        except Exception as e:
            errors += 1
            print(f' ⚠ {e}')

    print(f'\n  ラップCSV: {downloaded} 件DL / {skipped} 件スキップ / {errors} 件失敗')
    print('  同期完了!\n')


if __name__ == '__main__':
    main()
