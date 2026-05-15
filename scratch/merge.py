import os

base_dir = r"c:\Users\tomot\Desktop\management\アルバイト\マイクラ開発\website"
index_path = os.path.join(base_dir, "index.html")
style_path = os.path.join(base_dir, "style.css")
script_path = os.path.join(base_dir, "script.js")

with open(index_path, "r", encoding="utf-8") as f:
    html = f.read()

with open(style_path, "r", encoding="utf-8") as f:
    css = f.read()

with open(script_path, "r", encoding="utf-8") as f:
    js = f.read()

html = html.replace('<link rel="stylesheet" href="style.css">', f"<style>\n{css}\n</style>")
html = html.replace('<script src="script.js"></script>', f"<script>\n{js}\n</script>")

with open(index_path, "w", encoding="utf-8") as f:
    f.write(html)

print("Merged successfully.")
