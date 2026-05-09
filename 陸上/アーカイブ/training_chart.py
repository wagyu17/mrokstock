import csv
from collections import Counter
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import os

# 日本語フォント設定
font_candidates = [
    "C:/Windows/Fonts/msgothic.ttc",
    "C:/Windows/Fonts/meiryo.ttc",
    "C:/Windows/Fonts/YuGothM.ttc",
]
for font_path in font_candidates:
    if os.path.exists(font_path):
        fm.fontManager.addfont(font_path)
        prop = fm.FontProperties(fname=font_path)
        plt.rcParams["font.family"] = prop.get_name()
        break

# データ読み込み
with open("training_log_2026.csv", "r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    next(reader)
    rows = list(reader)

types = [row[0] for row in rows if row[0] != "瞑想"]
count = Counter(types)
labels = list(count.keys())
values = list(count.values())
total = sum(values)

# カラーパレット
colors = [
    "#4E79A7", "#F28E2B", "#E15759", "#76B7B2",
    "#59A14F", "#EDC948", "#B07AA1", "#FF9DA7",
    "#9C755F", "#BAB0AC"
]

fig, axes = plt.subplots(1, 2, figsize=(14, 7))
fig.suptitle("トレーニング種別の割合（2025年12月〜2026年4月）", fontsize=16, fontweight="bold", y=1.01)

# --- 円グラフ ---
wedges, texts, autotexts = axes[0].pie(
    values,
    labels=labels,
    autopct=lambda p: f"{p:.1f}%" if p > 3 else "",
    colors=colors,
    startangle=140,
    pctdistance=0.75,
    wedgeprops=dict(edgecolor="white", linewidth=1.5),
)
for at in autotexts:
    at.set_fontsize(9)
axes[0].set_title("種別ごとの割合", fontsize=13, pad=12)

# --- 棒グラフ ---
sorted_items = sorted(count.items(), key=lambda x: x[1], reverse=True)
bar_labels = [item[0] for item in sorted_items]
bar_values = [item[1] for item in sorted_items]
bar_colors = colors[: len(bar_labels)]

bars = axes[1].barh(bar_labels[::-1], bar_values[::-1], color=bar_colors[::-1], edgecolor="white")
for bar, val in zip(bars, bar_values[::-1]):
    axes[1].text(
        bar.get_width() + 0.3, bar.get_y() + bar.get_height() / 2,
        f"{val}回 ({val/total*100:.1f}%)",
        va="center", fontsize=9
    )
axes[1].set_xlabel("回数", fontsize=11)
axes[1].set_title("種別ごとの回数", fontsize=13, pad=12)
axes[1].set_xlim(0, max(bar_values) * 1.35)
axes[1].spines["top"].set_visible(False)
axes[1].spines["right"].set_visible(False)

plt.tight_layout()
out_path = "training_chart.png"
plt.savefig(out_path, dpi=150, bbox_inches="tight")
print(f"保存完了: {out_path}")
plt.show()
