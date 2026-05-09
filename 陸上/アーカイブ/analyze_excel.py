import pandas as pd

df = pd.read_excel('hr_zone_analysis.xlsx', sheet_name='Garminデータ')

with open('analyze_output.txt', 'w', encoding='utf-8') as f:
    for c in df.columns:
        f.write(str(c) + '\n')
    f.write("\n\nData (last 10 rows):\n")
    # avoid index and display all columns on single output if possible, but df.to_json is better
    f.write(df.tail(10).to_json(orient='records', force_ascii=False))

