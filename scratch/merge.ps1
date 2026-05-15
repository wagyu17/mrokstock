
$css = Get-Content -Path "アルバイト/マイクラ開発/website/style.css" -Raw
$js = Get-Content -Path "アルバイト/マイクラ開発/website/script.js" -Raw
$html = Get-Content -Path "アルバイト/マイクラ開発/website/index.html" -Raw

$html = $html -replace '<link rel="stylesheet" href="style.css">', "<style>`n$css`n</style>"
$html = $html -replace '<script src="script.js"></script>', "<script>`n$js`n</script>"

$html | Out-File -FilePath "アルバイト/マイクラ開発/website/index.html" -Encoding utf8
