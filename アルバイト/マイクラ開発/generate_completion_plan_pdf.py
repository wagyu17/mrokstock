"""8月末完成計画書 PDFジェネレータ（クライアント確認用）"""
from fpdf import FPDF
from pathlib import Path

OUT = Path(__file__).parent / "完成計画書_クライアント確認用_20260421.pdf"
FONT_REG = "C:/Windows/Fonts/NotoSansJP-VF.ttf"
FONT_BLD = "C:/Windows/Fonts/NotoSansJP-VF.ttf"  # 同一フォントで太字はsetで切替

# カラー（落ち着いた濃紺ベース）
NAVY = (32, 58, 96)
ACCENT = (210, 140, 50)
GRAY_BG = (238, 240, 244)
LIGHT_BG = (247, 249, 252)
BORDER = (190, 198, 210)
TEXT = (30, 35, 45)
MUTED = (110, 118, 130)


class PlanPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=18)
        self.add_font("noto", "", FONT_REG)
        self.add_font("noto", "B", FONT_BLD)
        self.set_margins(18, 18, 18)
        self.alias_nb_pages()

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-14)
        self.set_font("noto", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 6, f"ワンライフ様 Minecraft学習コンテンツ 完成計画書    {self.page_no()} / {{nb}}",
                  align="C")

    # ── レイアウトプリミティブ ──
    def h1(self, text):
        self.set_font("noto", "B", 16)
        self.set_text_color(*NAVY)
        self.cell(0, 10, text, new_x="LMARGIN", new_y="NEXT")
        # 下線
        y = self.get_y()
        self.set_draw_color(*NAVY)
        self.set_line_width(0.6)
        self.line(18, y, 70, y)
        self.set_line_width(0.2)
        self.ln(4)

    def h2(self, text):
        self.ln(2)
        self.set_font("noto", "B", 12)
        self.set_text_color(*NAVY)
        # 左に細いバー
        x, y = self.get_x(), self.get_y()
        self.set_fill_color(*ACCENT)
        self.rect(x, y + 1.2, 1.5, 5.5, "F")
        self.set_x(x + 3.5)
        self.cell(0, 8, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text, size=10, leading=5.8):
        self.set_font("noto", "", size)
        self.set_text_color(*TEXT)
        self.multi_cell(0, leading, text)
        self.ln(1)

    def kv_table(self, rows, col1=45):
        self.set_font("noto", "", 10)
        page_w = self.w - self.l_margin - self.r_margin
        col2 = page_w - col1
        for label, value in rows:
            y0 = self.get_y()
            # ラベル側（塗り）
            self.set_fill_color(*GRAY_BG)
            self.set_text_color(*NAVY)
            self.set_font("noto", "B", 10)
            self.multi_cell(col1, 7, label, border=0, fill=True, new_x="RIGHT", new_y="TOP")
            # 値側
            self.set_text_color(*TEXT)
            self.set_font("noto", "", 10)
            self.set_fill_color(255, 255, 255)
            self.multi_cell(col2, 7, value, border=0, fill=False, new_x="LMARGIN", new_y="NEXT")
            y1 = self.get_y()
            # 下線
            self.set_draw_color(*BORDER)
            self.line(self.l_margin, y1, self.l_margin + page_w, y1)
            self.ln(0.5)


def cover(pdf: PlanPDF):
    pdf.add_page()
    # ヘッダーバー
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, pdf.w, 42, "F")
    pdf.set_xy(18, 12)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("noto", "B", 11)
    pdf.cell(0, 6, "株式会社ワンライフ 御中", new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(18, 20)
    pdf.set_font("noto", "B", 20)
    pdf.cell(0, 10, "Minecraft学習コンテンツ 完成計画書", new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(18)
    pdf.set_font("noto", "", 11)
    pdf.cell(0, 6, "2026年8月末 完成・納品に向けたスケジュール確認のお願い")

    # 基本情報ボックス
    pdf.set_xy(18, 58)
    pdf.set_fill_color(*LIGHT_BG)
    pdf.set_draw_color(*BORDER)
    pdf.rect(18, 58, pdf.w - 36, 52, "DF")

    pdf.set_xy(24, 62)
    pdf.set_text_color(*NAVY)
    pdf.set_font("noto", "B", 11)
    pdf.cell(0, 6, "本資料について", new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(24)
    pdf.set_text_color(*TEXT)
    pdf.set_font("noto", "", 10)
    msg = (
        "本資料は、放課後等デイサービス向け Minecraft学習コンテンツを\n"
        "2026年8月末までに完成・納品するための具体的な月次・週次スケジュール、\n"
        "成果物の範囲、およびクライアント様にご協力いただきたい事項を\n"
        "整理したものです。内容をご確認の上、ご承認または修正のご希望を\n"
        "お知らせいただけますと、速やかに本格開発へ着手いたします。"
    )
    pdf.set_xy(24, 70)
    pdf.multi_cell(pdf.w - 48, 5.5, msg)

    # 表
    pdf.set_xy(18, 120)
    pdf.kv_table([
        ("プロジェクト名", "前橋市デジタルツイン×Minecraft 探求学習コンテンツ"),
        ("委託者", "株式会社ワンライフ"),
        ("受託者", "丸岡 大也"),
        ("対象", "放課後等デイサービスに通う小学1年〜高校生"),
        ("完成目標", "2026年8月末（納品）"),
        ("本計画書 作成日", "2026年4月21日"),
        ("ご回答期限の目安", "2026年4月30日（木）"),
    ], col1=40)

    # 末尾メッセージ
    pdf.ln(6)
    pdf.set_text_color(*MUTED)
    pdf.set_font("noto", "", 9)
    pdf.multi_cell(0, 5,
        "※ 本計画は、先日共有済みの「方針すり合わせ資料」に基づくミッション型構成を前提としています。\n"
        "※ 大幅な仕様変更が発生した場合、スケジュールは再調整いたします。")


def section_goal(pdf: PlanPDF):
    pdf.add_page()
    pdf.h1("1. 完成目標と全体像")

    pdf.h2("最終成果物（納品物）")
    pdf.body(
        "・Minecraft 統合ワールドファイル（.mcworld） × 1\n"
        "  5カテゴリ × 3難易度 = 全15ミッションエリア + ハブ拠点（前橋駅周辺）を収録\n"
        "・PDF教材 × 15セット（児童向けワークシート + スタッフ向けガイド）\n"
        "・スタッフ向け運用マニュアル × 1（ワールドの開閉・バックアップ・トラブル対応）"
    )

    pdf.h2("完成までの全体スケジュール（月次サマリー）")
    # ガントチャート風テーブル
    months = ["4月", "5月", "6月", "7月前半", "7月後半", "8月"]
    rows = [
        ("フェーズ0：方針確定・合意",            [1, 0, 0, 0, 0, 0]),
        ("フェーズ1：ハブ + 第1ミッション",     [0, 1, 0, 0, 0, 0]),
        ("フェーズ2：まち・自然 計6ミッション", [0, 0, 1, 0, 0, 0]),
        ("フェーズ3：もの・ことば 計6ミッション",[0, 0, 0, 1, 0, 0]),
        ("フェーズ4：せかい + PDF全量 + 運用書", [0, 0, 0, 0, 1, 0]),
        ("フェーズ5：テスト・修正・納品",       [0, 0, 0, 0, 0, 1]),
    ]
    page_w = pdf.w - pdf.l_margin - pdf.r_margin
    label_w = 70
    cell_w = (page_w - label_w) / len(months)

    # ヘッダ
    pdf.set_font("noto", "B", 9)
    pdf.set_fill_color(*NAVY)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(label_w, 8, "フェーズ", border=0, align="L", fill=True)
    for m in months:
        pdf.cell(cell_w, 8, m, border=0, align="C", fill=True)
    pdf.ln()

    pdf.set_font("noto", "", 9)
    pdf.set_text_color(*TEXT)
    for i, (label, bar) in enumerate(rows):
        fill = GRAY_BG if i % 2 == 0 else LIGHT_BG
        pdf.set_fill_color(*fill)
        pdf.cell(label_w, 8, label, border=0, align="L", fill=True)
        for idx, v in enumerate(bar):
            if v:
                pdf.set_fill_color(*ACCENT)
                pdf.cell(cell_w, 8, "●", border=0, align="C", fill=True)
                pdf.set_fill_color(*fill)
            else:
                pdf.cell(cell_w, 8, "", border=0, align="C", fill=True)
        pdf.ln()

    pdf.ln(3)
    pdf.set_text_color(*MUTED)
    pdf.set_font("noto", "", 9)
    pdf.multi_cell(0, 5,
        "●＝当該フェーズの主担当期間。前後のフェーズとは一部オーバーラップさせ、"
        "教材（PDF）作成や試作フィードバック反映を並行して進めます。")


def section_phases(pdf: PlanPDF):
    pdf.add_page()
    pdf.h1("2. フェーズ別 詳細スケジュール")

    phases = [
        {
            "title": "フェーズ0｜方針確定・クライアント合意",
            "period": "2026年4月21日 〜 4月30日（約1.5週）",
            "goal": "ミッション型構成・スコープについて合意し、開発着手の前提を揃える。",
            "tasks": [
                "本計画書・方針すり合わせ資料に基づくご確認と承認取得",
                "ミッション名称（15本）の最終確定",
                "MakeCodeの位置づけ（段階導入／必須／お任せ）の決定",
                "「せかいをのぞこう（海外都市）」の今回スコープ可否の決定",
            ],
            "deliv": "ご承認済み要件定義書（第6版）",
        },
        {
            "title": "フェーズ1｜ハブ拠点 + 第1ミッション（品質基準の確立）",
            "period": "2026年5月1日 〜 5月31日（約4週）",
            "goal": "完成形の型を1本作り、以降の横展開用テンプレートを固める。",
            "tasks": [
                "ハブ拠点（前橋駅周辺）：チュートリアル神殿／5ゲート／マイルーム／テレポート機構",
                "「まちをつくろう／やさしい：公園に花壇を設計しよう」完成",
                "探求学習9ステップを全実装し、動作確認",
                "PDF教材 第1号（児童用＋スタッフ用）作成",
                "試作版をクライアント様に共有・フィードバック取得",
            ],
            "deliv": "試作ワールド（ハブ + 第1ミッション）、PDF教材サンプル1セット",
        },
        {
            "title": "フェーズ2｜「まちをつくろう」「自然を探ろう」完成",
            "period": "2026年6月1日 〜 6月30日（約4週）",
            "goal": "2カテゴリ×3難易度（計6ミッション）を完成させ、ワールドの半分を仕上げる。",
            "tasks": [
                "まちをつくろう（ふつう：駅前広場リデザイン／むずかしい：商店街再開発）",
                "自然を探ろう（易：赤城山観察／中：利根川の洪水対策／上：気候と農業）",
                "各ミッションのPDF教材（計6セット）作成",
                "ハブ⇔各ミッションのテレポート・戻り動線 全体テスト",
            ],
            "deliv": "6ミッション完成版、PDF教材 6セット",
        },
        {
            "title": "フェーズ3｜「ものをつくろう」「ことばで伝えよう」完成",
            "period": "2026年7月1日 〜 7月15日（約2週）",
            "goal": "残り2カテゴリを完成させ、国内向け12ミッションを揃える。",
            "tasks": [
                "ものをつくろう（易：木の橋／中：耐震住宅／上：太陽光発電建物）",
                "ことばで伝えよう（易：案内看板／中：観光マップ／上：市長への提案書）",
                "PDF教材（計6セット）作成",
            ],
            "deliv": "6ミッション完成版、PDF教材 6セット",
        },
        {
            "title": "フェーズ4｜「せかいをのぞこう」+ PDF全量 + 運用マニュアル",
            "period": "2026年7月16日 〜 7月31日（約2週）",
            "goal": "海外都市エリアの完成と、教材・運用ドキュメントの総仕上げ。",
            "tasks": [
                "せかいをのぞこう（易：他都市比較／中：ロンドン／上：NYC × 前橋）",
                "PDF教材 残り3セット作成、全15セットの校正・体裁統一",
                "スタッフ向け運用マニュアル作成（開閉・バックアップ・トラブル対応）",
            ],
            "deliv": "15ミッション完成版、PDF教材 全15セット、運用マニュアル",
        },
        {
            "title": "フェーズ5｜テスト・修正・最終納品",
            "period": "2026年8月1日 〜 8月31日（約4週）",
            "goal": "実運用環境での確認を経て、安心して現場で使える状態で納品する。",
            "tasks": [
                "スタッフ様による操作テスト（「ワールドを開くだけで運用できるか」確認）",
                "児童によるテストプレイ（可能な範囲で）／9ステップ機能確認・詰まり抽出",
                "テスト結果に基づく修正・最終ポリッシュ",
                ".mcworld ファイルサイズ最終確認、OneDriveバックアップ運用テスト",
                "最終納品（.mcworld × 1 / PDF × 15 / 運用マニュアル × 1）",
            ],
            "deliv": "最終納品パッケージ一式（2026年8月31日）",
        },
    ]

    for p in phases:
        # ヘッダ行
        pdf.set_fill_color(*NAVY)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("noto", "B", 11)
        pdf.cell(0, 8, "  " + p["title"], border=0, fill=True, new_x="LMARGIN", new_y="NEXT")

        # 本体ボックス
        pdf.set_draw_color(*BORDER)
        pdf.set_fill_color(*LIGHT_BG)
        start_y = pdf.get_y()
        pdf.set_text_color(*TEXT)
        pdf.set_font("noto", "B", 10)
        pdf.set_x(pdf.l_margin)
        pdf.cell(22, 6, "  期間", border=0, new_x="RIGHT", new_y="TOP")
        pdf.set_font("noto", "", 10)
        pdf.multi_cell(0, 6, p["period"], new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("noto", "B", 10)
        pdf.cell(22, 6, "  目的", border=0, new_x="RIGHT", new_y="TOP")
        pdf.set_font("noto", "", 10)
        pdf.multi_cell(0, 6, p["goal"], new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("noto", "B", 10)
        pdf.cell(22, 6, "  主タスク", border=0, new_x="RIGHT", new_y="TOP")
        pdf.set_font("noto", "", 10)
        tasks_str = "\n".join("・" + t for t in p["tasks"])
        pdf.multi_cell(0, 5.8, tasks_str, new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("noto", "B", 10)
        pdf.cell(22, 6, "  成果物", border=0, new_x="RIGHT", new_y="TOP")
        pdf.set_font("noto", "", 10)
        pdf.set_text_color(*NAVY)
        pdf.multi_cell(0, 6, p["deliv"], new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(*TEXT)
        pdf.ln(3)


def section_checkpoints(pdf: PlanPDF):
    pdf.add_page()
    pdf.h1("3. クライアント様とのチェックポイント")

    pdf.body(
        "各フェーズ末に、クライアント様へ進捗報告と成果物の共有を行います。"
        "確認いただく内容と想定スケジュールは以下の通りです。"
    )

    rows = [
        ("4/30", "フェーズ0末", "本計画書・方針すり合わせ資料のご承認", "メール返信 / オンライン30分"),
        ("5/31", "フェーズ1末", "ハブ + 第1ミッション試作版レビュー", "Minecraft体験 + 方向性確認(60分)"),
        ("6/30", "フェーズ2末", "6ミッション + PDF教材サンプルの中間確認", "動画共有 + フィードバック"),
        ("7/15", "フェーズ3末", "12ミッション完成状況のご報告",          "進捗レポート（文書）"),
        ("7/31", "フェーズ4末", "全15ミッション + PDF全量 + 運用書 共有", "オンライン説明(60分)"),
        ("8/中",  "テストプレイ", "スタッフ様・児童様によるテストご協力",   "現場立会い または リモート"),
        ("8/31", "納品",       "最終納品パッケージのお渡し・受領確認",   "対面 または オンライン"),
    ]

    page_w = pdf.w - pdf.l_margin - pdf.r_margin
    col_w = [18, 24, 80, page_w - 18 - 24 - 80]

    # ヘッダ
    pdf.set_fill_color(*NAVY)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("noto", "B", 10)
    for w, h in zip(col_w, ["日付", "区切り", "確認内容", "想定形式"]):
        pdf.cell(w, 8, h, border=0, align="C", fill=True)
    pdf.ln()

    pdf.set_font("noto", "", 9.5)
    pdf.set_text_color(*TEXT)
    for i, r in enumerate(rows):
        fill = LIGHT_BG if i % 2 == 0 else (255, 255, 255)
        pdf.set_fill_color(*fill)
        # 行の高さをmulti_cellで揃える
        x0 = pdf.get_x()
        y0 = pdf.get_y()
        # まず最も長くなりがちな列を計測
        max_lines = 1
        for idx, cell in enumerate(r):
            lines = pdf.multi_cell(col_w[idx], 5.5, cell, dry_run=True, output="LINES")
            max_lines = max(max_lines, len(lines))
        h = max_lines * 5.5 + 1
        pdf.set_xy(x0, y0)
        for idx, cell in enumerate(r):
            align = "C" if idx in (0, 1) else "L"
            pdf.multi_cell(col_w[idx], h, cell, border=0, fill=True, align=align,
                           new_x="RIGHT", new_y="TOP", max_line_height=5.5)
        pdf.ln(h)
        # 下罫
        pdf.set_draw_color(*BORDER)
        pdf.line(pdf.l_margin, pdf.get_y(), pdf.l_margin + sum(col_w), pdf.get_y())

    pdf.ln(4)

    pdf.h2("クライアント様にご協力いただきたいこと")
    pdf.body(
        "・各チェックポイントでの1〜2営業日以内のご回答\n"
        "・フェーズ1末（5月末）試作版への率直なフィードバック（方向性が固まる最重要タイミング）\n"
        "・テストプレイ期間（2026年8月）における現場での試遊機会のご提供\n"
        "・児童向け表現・禁則事項など、発達特性配慮に関するご助言"
    )


def section_risk(pdf: PlanPDF):
    pdf.add_page()
    pdf.h1("4. リスクと対応方針")

    risks = [
        ("Arnisによる海外都市地形の生成に時間がかかる",
         "「せかいをのぞこう」をフェーズ4に配置。生成遅延時は『景観のみ』にスコープ縮退。"),
        (".mcworld のファイルサイズが肥大化し動作が重くなる",
         "各フェーズ終了時にサイズ計測。必要に応じ地形精度の段階的ダウン調整で対応。"),
        ("フェーズ1試作後に方針変更の要望が入る",
         "フェーズ1を最小プロトタイプと位置づけ、早期に方向性を固定。以降は差分調整に留める。"),
        ("PDF教材15セットの作成工数が膨らむ",
         "スタッフ用スクリプトを共通テンプレート化し、ミッション差分のみを記述する形式で効率化。"),
        ("クライアントテストプレイのタイミングが確保できない",
         "リモート動画共有／内部代替テストでの補完を併用し、納期死守。"),
    ]

    page_w = pdf.w - pdf.l_margin - pdf.r_margin
    c1 = page_w * 0.4
    c2 = page_w - c1

    pdf.set_fill_color(*NAVY)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("noto", "B", 10)
    pdf.cell(c1, 8, "リスク", border=0, align="C", fill=True)
    pdf.cell(c2, 8, "対応方針", border=0, align="C", fill=True)
    pdf.ln()

    pdf.set_font("noto", "", 10)
    pdf.set_text_color(*TEXT)
    for i, (risk, resp) in enumerate(risks):
        fill = LIGHT_BG if i % 2 == 0 else (255, 255, 255)
        pdf.set_fill_color(*fill)
        x0, y0 = pdf.get_x(), pdf.get_y()
        # 高さ測定
        lines1 = pdf.multi_cell(c1, 5.8, risk, dry_run=True, output="LINES")
        lines2 = pdf.multi_cell(c2, 5.8, resp, dry_run=True, output="LINES")
        h = max(len(lines1), len(lines2)) * 5.8 + 2
        pdf.set_xy(x0, y0)
        pdf.multi_cell(c1, h, risk, border=0, fill=True, align="L",
                       new_x="RIGHT", new_y="TOP", max_line_height=5.8)
        pdf.multi_cell(c2, h, resp, border=0, fill=True, align="L",
                       new_x="LMARGIN", new_y="NEXT", max_line_height=5.8)
        pdf.set_draw_color(*BORDER)
        pdf.line(pdf.l_margin, pdf.get_y(), pdf.l_margin + page_w, pdf.get_y())


def section_confirm(pdf: PlanPDF):
    pdf.h1("5. ご承認のお願い")

    pdf.body(
        "本計画書の内容にて 2026年8月末の完成・納品を目指し、開発を本格始動させたく存じます。"
        "以下のいずれかに✓を付け、2026年4月30日（木）までにご返信いただけますと幸いです。"
    )

    opts = [
        "上記スケジュール・内容で合意します（このまま開発着手）",
        "概ね合意しますが、以下の点について修正を希望します",
        "下記事項について追加で相談させてください",
    ]
    for o in opts:
        pdf.set_font("noto", "", 11)
        pdf.set_text_color(*TEXT)
        # チェックボックス
        x, y = pdf.get_x(), pdf.get_y()
        pdf.set_draw_color(*NAVY)
        pdf.set_line_width(0.4)
        pdf.rect(x, y + 1.5, 4.5, 4.5)
        pdf.set_x(x + 7)
        pdf.cell(0, 8, o, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(2)
    pdf.set_font("noto", "", 10)
    pdf.set_text_color(*MUTED)
    pdf.multi_cell(0, 5.5,
        "【ご記入欄】修正希望・ご相談事項がございましたら以下にご記入ください。")

    pdf.ln(2)
    pdf.set_draw_color(*BORDER)
    for _ in range(5):
        y = pdf.get_y() + 8
        pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
        pdf.ln(8)

    pdf.ln(4)
    # 署名欄
    page_w = pdf.w - pdf.l_margin - pdf.r_margin
    half = page_w / 2 - 3
    y0 = pdf.get_y()

    pdf.set_font("noto", "B", 10)
    pdf.set_text_color(*NAVY)
    pdf.cell(half, 7, "ご確認日 / ご署名（クライアント様）", new_x="RIGHT", new_y="TOP")
    pdf.cell(half, 7, "確認日 / 署名（受託者）", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("noto", "", 10)
    pdf.set_text_color(*TEXT)
    box_h = 22
    pdf.set_draw_color(*BORDER)
    pdf.rect(pdf.l_margin, pdf.get_y(), half, box_h)
    pdf.rect(pdf.l_margin + half + 6, pdf.get_y(), half, box_h)
    pdf.ln(box_h + 6)

    pdf.set_text_color(*MUTED)
    pdf.set_font("noto", "", 9)
    pdf.multi_cell(0, 5,
        "ご不明点・ご相談事項がございましたらお気軽にご連絡ください。\n"
        "引き続きどうぞよろしくお願い申し上げます。")


def main():
    pdf = PlanPDF()
    cover(pdf)
    section_goal(pdf)
    section_phases(pdf)
    section_checkpoints(pdf)
    section_risk(pdf)
    section_confirm(pdf)
    pdf.output(str(OUT))
    print(f"wrote: {OUT}")


if __name__ == "__main__":
    main()
