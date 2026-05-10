import os
from pathlib import Path

def merge_vault_split():
    root_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    exclude_dirs = {'.git', '.obsidian', '.agents', '.claude', '.codex', 'node_modules'}
    
    # カテゴリごとの出力ファイル名
    categories = {
        "陸上": "_Gem_Knowledge_01_陸上.md",
        "就活": "_Gem_Knowledge_02_就活.md",
        "東京理科大学": "_Gem_Knowledge_03_大学.md",
        "アルバイト": "_Gem_Knowledge_04_マイクラ.md",
    }
    # 上記に当てはまらないものをまとめるファイル
    other_file = "_Gem_Knowledge_05_その他.md"

    # ファイルハンドルを保持する辞書
    file_handles = {}
    try:
        # 各カテゴリ用のファイルを開く
        for cat, filename in categories.items():
            f = open(root_dir / filename, 'w', encoding='utf-8')
            f.write(f"# Knowledge Base: {cat}\n\n")
            file_handles[cat] = f
            
        f_other = open(root_dir / other_file, 'w', encoding='utf-8')
        f_other.write("# Knowledge Base: その他 (IT, Schedule, Inbox, etc)\n\n")
        
        count = 0
        for md_file in root_dir.rglob("*.md"):
            # 自分自身や古い統合ファイルは除外
            if md_file.name.startswith("_Gem_") or md_file.name == "_Gemini_All_Data.md":
                continue
                
            skip = False
            for part in md_file.parts:
                if part in exclude_dirs:
                    skip = True
                    break
            if skip:
                continue
                
            relative_path = md_file.relative_to(root_dir)
            try:
                content = md_file.read_text(encoding='utf-8')
                if not content.strip():
                    continue
                    
                # どのカテゴリに属するか判定
                target_f = f_other
                for cat in categories.keys():
                    if cat in relative_path.parts:
                        target_f = file_handles[cat]
                        break
                
                target_f.write(f"\n\n{'='*50}\n")
                target_f.write(f"# FILE: {relative_path}\n")
                target_f.write(f"{'='*50}\n\n")
                target_f.write(content)
                count += 1
                
            except Exception as e:
                print(f"Failed to read {relative_path}: {e}")
                
        print(f"Successfully split {count} Markdown files into 5 Knowledge files!")
        
    finally:
        # 全てのファイルを閉じる
        for f in file_handles.values():
            f.close()
        f_other.close()

if __name__ == "__main__":
    merge_vault_split()
