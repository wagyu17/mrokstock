import pandas as pd

df = pd.read_excel('hr_zone_analysis.xlsx', sheet_name='Garminデータ', header=1)
df_recent = df.dropna(subset=['日付']).tail(5)

out = "直近5回のトレーニングデータ:\n\n"
for index, row in df_recent.iterrows():
    out += f"■ {row['日付']} - {row['タイトル']} ({row['アクティビティタイプ']})\n"
    out += f"  距離: {row.get('距離', 'N/A')} km\n"
    out += f"  タイム: {row.get('タイム', 'N/A')}\n"
    out += f"  平均ペース: {row.get('平均ペース', 'N/A')} /km\n"
    out += f"  平均心拍: {row.get('平均心拍数', 'N/A')} bpm (最高: {row.get('最高心拍数', 'N/A')} bpm)\n"
    out += f"  Aerobic TE: {row.get('有酸素TE', 'N/A')}, Anaerobic TE: {row.get('無酸素TE', 'N/A')}\n"
    out += f"  平均ピッチ: {row.get('平均ピッチ', 'N/A')} spm, 平均ストライド: {row.get('平均ストライド長', 'N/A')} m\n"
    out += "\n"

with open('recent_analysis.txt', 'w', encoding='utf-8') as f:
    f.write(out)

