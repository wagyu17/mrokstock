@echo off
chcp 65001 >nul
cd /d "C:\Users\tomot\Desktop\陸上"
echo ================================
echo  Garmin データ同期中...
echo ================================
python scripts\sync_garmin.py
echo.
echo ================================
echo  トレーニングログ 更新中...
echo ================================
python scripts\update_excel.py
echo.
echo ================================
echo  ポイント練習ラップデータ 更新中...
echo ================================
python scripts\import_laps.py
echo.
echo ================================
echo  トレーニング計画 進捗更新中...
echo ================================
python scripts\update_plan.py
echo.
echo ================================
echo  フィットネス管理 CTL/ATL/TSB 更新中...
echo ================================
python scripts\update_fitness.py
echo.
echo ================================
echo  GitHub へプッシュ中...
echo ================================
git add training_log_2026.csv site/ 更新用トレーニングログ/
git diff --staged --quiet || git commit -m "chore: auto sync %date%"
git push
