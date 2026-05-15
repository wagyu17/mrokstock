<#
.SYNOPSIS
CurseForge などからダウンロードした jar を、同名フォルダへ格納して解析用 Markdown を生成します。

.EXAMPLE
powershell -ExecutionPolicy Bypass -File .\mod解析自動化.ps1 -JarPath "$HOME\Downloads\example.jar"

.EXAMPLE
powershell -ExecutionPolicy Bypass -File .\mod解析自動化.ps1 -LatestFromDownloads

.EXAMPLE
powershell -ExecutionPolicy Bypass -File .\mod解析自動化.ps1 -JarPath "$HOME\Downloads\example.jar" -Move
#>

[CmdletBinding()]
param(
  [Parameter(ValueFromPipeline = $true, ValueFromPipelineByPropertyName = $true)]
  [Alias('FullName')]
  [string[]]$JarPath,

  [switch]$LatestFromDownloads,

  [string]$DownloadsPath = (Join-Path $HOME 'Downloads'),

  [string]$OutputRoot = $PSScriptRoot,

  [switch]$Move,

  [switch]$OverwriteMarkdown,

  [int]$MaxJavapClasses = 80
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Resolve-Tool {
  param([string]$Name)

  $command = Get-Command $Name -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($command) {
    return $command.Source
  }

  return $null
}

function Get-SafeFileName {
  param([string]$Name)

  $safe = $Name
  foreach ($char in [System.IO.Path]::GetInvalidFileNameChars()) {
    $safe = $safe.Replace([string]$char, '_')
  }
  return $safe.Trim()
}

function Read-ZipEntryText {
  param([System.IO.Compression.ZipArchiveEntry]$Entry)

  $stream = $Entry.Open()
  try {
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $true)
    try {
      return $reader.ReadToEnd()
    }
    finally {
      $reader.Dispose()
    }
  }
  finally {
    $stream.Dispose()
  }
}

function Read-ZipEntryBytes {
  param([System.IO.Compression.ZipArchiveEntry]$Entry)

  $stream = $Entry.Open()
  try {
    $memory = New-Object System.IO.MemoryStream
    try {
      $stream.CopyTo($memory)
      return $memory.ToArray()
    }
    finally {
      $memory.Dispose()
    }
  }
  finally {
    $stream.Dispose()
  }
}

function ConvertTo-ClassText {
  param([byte[]]$Bytes)

  return [System.Text.Encoding]::GetEncoding(28591).GetString($Bytes)
}

function Escape-MdCell {
  param($Value)

  if ($null -eq $Value) {
    return ''
  }

  return ([string]$Value).Replace('|', '\|').Replace("`r", ' ').Replace("`n", ' ').Trim()
}

function Get-KeyNameFromCode {
  param([int]$Code)

  if ($Code -eq -1) { return '未割り当て' }
  if ($Code -ge 65 -and $Code -le 90) { return [char]$Code }
  if ($Code -ge 48 -and $Code -le 57) { return [char]$Code }
  if ($Code -ge 290 -and $Code -le 314) { return 'F' + ($Code - 289) }

  $glfw = @{
    32 = 'Space'; 39 = "'"; 44 = ','; 45 = '-'; 46 = '.'; 47 = '/';
    59 = ';'; 61 = '='; 91 = '['; 92 = '\'; 93 = ']'; 96 = '`';
    256 = 'Esc'; 257 = 'Enter'; 258 = 'Tab'; 259 = 'Backspace';
    260 = 'Insert'; 261 = 'Delete'; 262 = 'Right'; 263 = 'Left';
    264 = 'Down'; 265 = 'Up'; 266 = 'PageUp'; 267 = 'PageDown';
    268 = 'Home'; 269 = 'End'; 280 = 'CapsLock';
    340 = 'Left Shift'; 341 = 'Left Ctrl'; 342 = 'Left Alt';
    343 = 'Left Super'; 344 = 'Right Shift'; 345 = 'Right Ctrl'; 346 = 'Right Alt'
  }
  if ($glfw.ContainsKey($Code)) {
    return $glfw[$Code]
  }

  $legacyLwjgl = @{
    1 = 'Esc'; 15 = 'Tab'; 16 = 'Q'; 17 = 'W'; 18 = 'E'; 19 = 'R'; 20 = 'T';
    21 = 'Y'; 22 = 'U'; 23 = 'I'; 24 = 'O'; 25 = 'P'; 29 = 'Left Ctrl';
    30 = 'A'; 31 = 'S'; 32 = 'D'; 33 = 'F'; 34 = 'G'; 35 = 'H'; 36 = 'J';
    37 = 'K'; 38 = 'L'; 42 = 'Left Shift'; 44 = 'Z'; 45 = 'X'; 46 = 'C';
    47 = 'V'; 48 = 'B'; 49 = 'N'; 50 = 'M'; 56 = 'Left Alt'; 57 = 'Space'
  }
  if ($legacyLwjgl.ContainsKey($Code)) {
    return $legacyLwjgl[$Code] + " (旧キーコード $Code)"
  }

  return "key code $Code"
}

function Get-LanguageMap {
  param([System.IO.Compression.ZipArchive]$Zip)

  $map = @{}
  $entries = $Zip.Entries | Where-Object {
    $_.FullName -match '^assets/.+/lang/(ja_jp|en_us)\.(json|lang)$'
  } | Sort-Object FullName

  foreach ($entry in $entries) {
    $text = Read-ZipEntryText $entry
    if ($entry.FullName.EndsWith('.json')) {
      try {
        $json = $text | ConvertFrom-Json
        foreach ($prop in $json.PSObject.Properties) {
          if (-not $map.ContainsKey($prop.Name)) {
            $map[$prop.Name] = [string]$prop.Value
          }
        }
      }
      catch {
        Write-Warning "lang JSON を読めませんでした: $($entry.FullName)"
      }
    }
    else {
      foreach ($line in ($text -split "`r?`n")) {
        if ($line -match '^\s*#') { continue }
        if ($line -match '^\s*([^=]+?)\s*=\s*(.+?)\s*$') {
          $key = $Matches[1].Trim()
          if (-not $map.ContainsKey($key)) {
            $map[$key] = $Matches[2].Trim()
          }
        }
      }
    }
  }

  return $map
}

function Get-ModMetadata {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$FallbackName
  )

  $meta = [ordered]@{
    DisplayName = $FallbackName
    ModId = ''
    Version = ''
    Loader = ''
    MinecraftVersion = ''
    Description = ''
    MetadataFile = ''
  }

  $tomlEntry = $Zip.Entries | Where-Object {
    $_.FullName -in @('META-INF/mods.toml', 'META-INF/neoforge.mods.toml')
  } | Select-Object -First 1

  if ($tomlEntry) {
    $text = Read-ZipEntryText $tomlEntry
    $meta.Loader = if ($tomlEntry.FullName -like '*neoforge*') { 'NeoForge/Forge系' } else { 'Forge系' }
    $meta.MetadataFile = $tomlEntry.FullName

    if ($text -match '(?m)^\s*modId\s*=\s*"([^"]+)"') { $meta.ModId = $Matches[1] }
    elseif ($text -match "(?m)^\s*modId\s*=\s*'([^']+)'") { $meta.ModId = $Matches[1] }
    if ($text -match '(?m)^\s*version\s*=\s*"([^"]+)"') { $meta.Version = $Matches[1] }
    elseif ($text -match "(?m)^\s*version\s*=\s*'([^']+)'") { $meta.Version = $Matches[1] }
    if ($text -match '(?m)^\s*displayName\s*=\s*"([^"]+)"') { $meta.DisplayName = $Matches[1] }
    elseif ($text -match "(?m)^\s*displayName\s*=\s*'([^']+)'") { $meta.DisplayName = $Matches[1] }
    if ($text -match '(?ms)^\s*description\s*=\s*"""(.+?)"""') { $meta.Description = $Matches[1].Trim() }
    elseif ($text -match '(?m)^\s*description\s*=\s*"([^"]+)"') { $meta.Description = $Matches[1].Trim() }
    elseif ($text -match "(?m)^\s*description\s*=\s*'([^']+)'") { $meta.Description = $Matches[1].Trim() }
    if ($text -match '(?ms)\[\[dependencies\.[^\]]+\]\].*?modId\s*=\s*"minecraft".*?versionRange\s*=\s*"([^"]+)"') { $meta.MinecraftVersion = $Matches[1] }
    elseif ($text -match "(?ms)\[\[dependencies\.[^\]]+\]\].*?modId\s*=\s*'minecraft'.*?versionRange\s*=\s*'([^']+)'") { $meta.MinecraftVersion = $Matches[1] }

    return [pscustomobject]$meta
  }

  $fabricEntry = $Zip.Entries | Where-Object { $_.FullName -eq 'fabric.mod.json' } | Select-Object -First 1
  if ($fabricEntry) {
    $text = Read-ZipEntryText $fabricEntry
    try {
      $json = $text | ConvertFrom-Json
      $meta.Loader = 'Fabric'
      $meta.MetadataFile = 'fabric.mod.json'
      if ($json.name) { $meta.DisplayName = [string]$json.name }
      if ($json.id) { $meta.ModId = [string]$json.id }
      if ($json.version) { $meta.Version = [string]$json.version }
      if ($json.description) { $meta.Description = [string]$json.description }
      if ($json.depends -and $json.depends.minecraft) { $meta.MinecraftVersion = [string]$json.depends.minecraft }
    }
    catch {
      Write-Warning 'fabric.mod.json を読めませんでした。'
    }
    return [pscustomobject]$meta
  }

  $quiltEntry = $Zip.Entries | Where-Object { $_.FullName -eq 'quilt.mod.json' } | Select-Object -First 1
  if ($quiltEntry) {
    $meta.Loader = 'Quilt'
    $meta.MetadataFile = 'quilt.mod.json'
    return [pscustomobject]$meta
  }

  $mcmodEntry = $Zip.Entries | Where-Object { $_.FullName -eq 'mcmod.info' } | Select-Object -First 1
  if ($mcmodEntry) {
    $meta.Loader = 'Forge 1.12系'
    $meta.MetadataFile = 'mcmod.info'
    $text = Read-ZipEntryText $mcmodEntry
    try {
      $json = $text | ConvertFrom-Json
      $first = @($json)[0]
      if ($first.name) { $meta.DisplayName = [string]$first.name }
      if ($first.modid) { $meta.ModId = [string]$first.modid }
      if ($first.version) { $meta.Version = [string]$first.version }
      if ($first.description) { $meta.Description = [string]$first.description }
      if ($first.mcversion) { $meta.MinecraftVersion = [string]$first.mcversion }
    }
    catch {
      Write-Warning 'mcmod.info を読めませんでした。'
    }
  }

  return [pscustomobject]$meta
}

function Get-ClassCandidates {
  param([System.IO.Compression.ZipArchive]$Zip)

  $keyPattern = 'KeyMapping|KeyBinding|RegisterKeyMappingsEvent|KeyInputEvent|InputConstants|GLFW_KEY_|key\.'
  $commandPattern = 'RegisterCommandsEvent|CommandDispatcher|LiteralArgumentBuilder|com/mojang/brigadier|net/minecraft/commands/Commands|Commands\.literal'
  $operationPattern = 'Procedure|Message|Packet|OnKeyPressed|onKeyPressed|Screen|Overlay|Gui'

  $classes = New-Object System.Collections.Generic.List[object]
  $entries = $Zip.Entries | Where-Object { $_.FullName.EndsWith('.class') -and $_.FullName -notmatch 'module-info\.class$' }

  foreach ($entry in $entries) {
    $classPath = $entry.FullName
    $className = $classPath -replace '/', '.'
    $className = $className -replace '\.class$', ''

    $nameHint = $classPath -match '(?i)(key|bind|input|command|procedure|message|packet|screen|gui|overlay)'
    $text = ''
    $score = 0
    $types = New-Object System.Collections.Generic.List[string]

    if ($nameHint -or $entry.Length -lt 262144) {
      try {
        $text = ConvertTo-ClassText (Read-ZipEntryBytes $entry)
      }
      catch {
        $text = ''
      }
    }

    if ($classPath -match '(?i)(key|bind|input)' -or $text -match $keyPattern) {
      $types.Add('Key')
      $score += 50
    }
    if ($classPath -match '(?i)command' -or $text -match $commandPattern) {
      $types.Add('Command')
      $score += 50
    }
    if ($classPath -match '(?i)(procedure|message|packet|screen|gui|overlay)' -or $text -match $operationPattern) {
      $types.Add('Operation')
      $score += 20
    }

    if ($types.Count -gt 0) {
      $classes.Add([pscustomobject]@{
        ClassName = $className
        Path = $classPath
        Type = ($types | Select-Object -Unique) -join ', '
        Score = $score
      })
    }
  }

  return $classes
}

function Invoke-JavapSafe {
  param(
    [string]$JavapPath,
    [string]$JarFile,
    [string]$ClassName
  )

  if (-not $JavapPath) {
    return ''
  }

  try {
    return (& $JavapPath -classpath $JarFile -p -c -constants $ClassName 2>$null | Out-String -Width 4096)
  }
  catch {
    return ''
  }
}

function Get-JavapStrings {
  param([string]$Text)

  $items = New-Object System.Collections.Generic.List[string]
  foreach ($match in [regex]::Matches($Text, '// String ([^\r\n]+)')) {
    $value = $match.Groups[1].Value.Trim()
    if ($value) {
      $items.Add($value)
    }
  }
  return $items | Select-Object -Unique
}

function Get-KeyMappingsFromJavap {
  param(
    [object[]]$JavapResults,
    [hashtable]$LanguageMap
  )

  $items = New-Object System.Collections.Generic.List[object]
  $seen = @{}

  foreach ($result in $JavapResults) {
    if ($result.Type -notmatch 'Key') { continue }
    if (-not $result.Text) { continue }

    $lines = $result.Text -split "`r?`n"
    for ($i = 0; $i -lt $lines.Count; $i++) {
      if ($lines[$i] -notmatch '// String (key\.[^\s]+)') { continue }

      $translationKey = $Matches[1].Trim()
      if ($translationKey -match '^key\.(category|categories)\.') { continue }
      if ($seen.ContainsKey($translationKey)) { continue }

      $start = [Math]::Max(0, $i - 4)
      $end = [Math]::Min($lines.Count - 1, $i + 24)
      $window = ($lines[$start..$end] -join ' ')

      $defaultKey = '未検出'
      if ($window -match 'GLFW_KEY_([A-Z0-9_]+)') {
        $defaultKey = ($Matches[1] -replace '_', ' ')
      }
      elseif ($window -match 'GLFW_MOUSE_BUTTON_([A-Z0-9_]+)') {
        $defaultKey = 'Mouse ' + ($Matches[1] -replace '_', ' ')
      }
      elseif ($window -match 'iconst_m1') {
        $defaultKey = '未割り当て'
      }
      elseif ($window -match '(?:bipush|sipush)\s+(-?\d+)') {
        $defaultKey = Get-KeyNameFromCode ([int]$Matches[1])
      }

      $label = $translationKey
      if ($LanguageMap.ContainsKey($translationKey)) {
        $label = $LanguageMap[$translationKey]
      }

      $seen[$translationKey] = $true
      $items.Add([pscustomobject]@{
        Key = $defaultKey
        Label = $label
        TranslationKey = $translationKey
        SourceClass = $result.ClassName
      })
    }
  }

  return $items
}

function Test-CommandLiteral {
  param([string]$Value)

  if (-not $Value) { return $false }
  if ($Value.Length -gt 48) { return $false }
  if ($Value -notmatch '^[a-z][a-z0-9_/-]*$') { return $false }

  $exclude = @(
    'true', 'false', 'null', 'success', 'fail', 'none', 'all',
    'target', 'targets', 'player', 'players', 'entity', 'entities',
    'amount', 'value', 'state', 'enable', 'enabled', 'disable', 'disabled',
    'x', 'y', 'z', 'pos', 'position', 'location', 'item', 'block',
    'count', 'radius', 'from', 'to', 'with', 'name', 'type', 'mode'
  )
  return $exclude -notcontains $Value
}

function Get-CommandsFromJavap {
  param([object[]]$JavapResults)

  $items = New-Object System.Collections.Generic.List[object]

  foreach ($result in $JavapResults) {
    if ($result.Type -notmatch 'Command') { continue }
    if ($result.ClassName -notmatch '(?i)Command|Commands') { continue }
    if (-not $result.Text) { continue }

    $strings = @(Get-JavapStrings $result.Text)
    $literals = @($strings | Where-Object { Test-CommandLiteral $_ } | Select-Object -Unique | Select-Object -First 40)

    if ($literals.Count -gt 0) {
      $items.Add([pscustomobject]@{
        SourceClass = $result.ClassName
        Literals = $literals
      })
    }
  }

  return $items
}

function New-Markdown {
  param(
    [System.IO.FileInfo]$JarItem,
    [object]$Meta,
    [object[]]$KeyMappings,
    [object[]]$Commands,
    [object[]]$ClassCandidates,
    [object[]]$JavapResults
  )

  $sb = New-Object System.Text.StringBuilder
  $title = if ($Meta.DisplayName) { $Meta.DisplayName } else { [System.IO.Path]::GetFileNameWithoutExtension($JarItem.Name) }

  $null = $sb.AppendLine("# $title キー割り当て・特殊コマンド・操作方法")
  $null = $sb.AppendLine()
  $null = $sb.AppendLine("## MOD概要")
  $null = $sb.AppendLine()
  if ($Meta.Description) {
    $null = $sb.AppendLine($Meta.Description)
  }
  else {
    $null = $sb.AppendLine("このファイルは jar から自動生成した解析下書きです。MODの詳しい内容は、実機確認後に追記してください。")
  }
  $null = $sb.AppendLine()

  $null = $sb.AppendLine("## 解析元")
  $null = $sb.AppendLine()
  $null = $sb.AppendLine(('- 対象ファイル: `{0}`' -f $JarItem.Name))
  if ($Meta.MetadataFile) { $null = $sb.AppendLine(('- メタデータ: `{0}`' -f $Meta.MetadataFile)) }
  if ($Meta.ModId) { $null = $sb.AppendLine(('- MOD ID: `{0}`' -f $Meta.ModId)) }
  if ($Meta.Version) { $null = $sb.AppendLine(('- バージョン: `{0}`' -f $Meta.Version)) }
  if ($Meta.Loader) { $null = $sb.AppendLine(('- ローダー: `{0}`' -f $Meta.Loader)) }
  if ($Meta.MinecraftVersion) { $null = $sb.AppendLine(('- 対応 Minecraft: `{0}`' -f $Meta.MinecraftVersion)) }
  $null = $sb.AppendLine(('- 生成日時: `{0}`' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')))
  $null = $sb.AppendLine('- 解析方法: jar 内のメタデータ、lang、class 名、`javap` による key/command 文字列を自動抽出')
  $null = $sb.AppendLine()

  $null = $sb.AppendLine("## キー割り当て")
  $null = $sb.AppendLine()
  if ($KeyMappings.Count -gt 0) {
    $null = $sb.AppendLine("| デフォルトキー | 表示名 | 内部キー名 | 解析元クラス |")
    $null = $sb.AppendLine("| --- | --- | --- | --- |")
    foreach ($key in $KeyMappings) {
      $null = $sb.AppendLine(('| {0} | {1} | `{2}` | `{3}` |' -f (Escape-MdCell $key.Key), (Escape-MdCell $key.Label), (Escape-MdCell $key.TranslationKey), (Escape-MdCell $key.SourceClass)))
    }
    $null = $sb.AppendLine()
    $null = $sb.AppendLine('上の表は `KeyMapping` / `KeyBinding` らしき登録から自動抽出したものです。ゲーム内の「設定 > 操作設定」で実際の表示名と競合を確認してください。')
  }
  else {
    $null = $sb.AppendLine("専用キー割り当ては自動検出できませんでした。右クリック、スニーク + 右クリック、GUI、または通常の Minecraft 操作で扱うタイプの可能性があります。")
  }
  $null = $sb.AppendLine()

  $null = $sb.AppendLine("## 特殊コマンド")
  $null = $sb.AppendLine()
  if ($Commands.Count -gt 0) {
    $null = $sb.AppendLine("以下は Brigadier / command 系クラスから抽出したコマンド・サブコマンド候補です。正確な引数構造はゲーム内の補完、または追加解析で確認してください。")
    $null = $sb.AppendLine()
    $null = $sb.AppendLine("| 解析元クラス | 検出したコマンド/サブコマンド候補 |")
    $null = $sb.AppendLine("| --- | --- |")
    foreach ($command in $Commands) {
      $literalText = ($command.Literals | ForEach-Object { '`' + $_ + '`' }) -join ', '
      $null = $sb.AppendLine(('| `{0}` | {1} |' -f (Escape-MdCell $command.SourceClass), (Escape-MdCell $literalText)))
    }
  }
  else {
    $null = $sb.AppendLine('独自のスラッシュコマンドは自動検出できませんでした。`RegisterCommandsEvent` や Brigadier の登録クラスが見つからない場合、このMOD単体では専用コマンドを持たない可能性があります。')
  }
  $null = $sb.AppendLine()

  $null = $sb.AppendLine("## 操作方法")
  $null = $sb.AppendLine()
  $null = $sb.AppendLine("### 基本の確認手順")
  $null = $sb.AppendLine()
  $null = $sb.AppendLine("1. Minecraft を起動し、対象MODを入れたプロファイルを開きます。")
  $null = $sb.AppendLine("2. 「設定 > 操作設定」を開き、このMarkdownのキー名や表示名で検索します。")
  $null = $sb.AppendLine("3. 赤く表示されるキー競合があれば、使う頻度の低いMOD側を別キーに変更します。")
  $null = $sb.AppendLine("4. アイテムやブロックを追加するMODの場合は、まずクリエイティブタブまたはJEIで追加要素を確認します。")
  $null = $sb.AppendLine("5. 実際のワールドで試す前に、テストワールドで右クリック、スニーク + 右クリック、左クリック、GUI操作を確認します。")
  $null = $sb.AppendLine()

  if ($KeyMappings.Count -gt 0) {
    $null = $sb.AppendLine("### キー操作の下書き")
    $null = $sb.AppendLine()
    foreach ($key in $KeyMappings) {
      $null = $sb.AppendLine(('- `{0}`: {1} を実行するキーです。実際の効果、発動条件、クールダウン、必要アイテムは実機確認して追記してください。' -f (Escape-MdCell $key.Key), (Escape-MdCell $key.Label)))
    }
    $null = $sb.AppendLine()
  }

  if ($Commands.Count -gt 0) {
    $null = $sb.AppendLine("### コマンド操作の下書き")
    $null = $sb.AppendLine()
    $null = $sb.AppendLine('- コマンドはチャット欄を開いて `/` から入力します。')
    $null = $sb.AppendLine("- 多くのMODコマンドは OP 権限、クリエイティブ権限、またはサーバー側の権限設定が必要です。")
    $null = $sb.AppendLine("- 引数はゲーム内補完に出る順番を見ながら確認してください。")
    $null = $sb.AppendLine()
  }

  $null = $sb.AppendLine("## 解析で見つかった関連クラス")
  $null = $sb.AppendLine()
  $topClasses = @($ClassCandidates | Sort-Object @{ Expression = 'Score'; Descending = $true }, ClassName | Select-Object -First 30)
  if ($topClasses.Count -gt 0) {
    $null = $sb.AppendLine("| 種類 | クラス |")
    $null = $sb.AppendLine("| --- | --- |")
    foreach ($class in $topClasses) {
      $null = $sb.AppendLine(('| {0} | `{1}` |' -f (Escape-MdCell $class.Type), (Escape-MdCell $class.ClassName)))
    }
  }
  else {
    $null = $sb.AppendLine("キー、コマンド、画面、パケットに関係しそうなクラスは自動検出できませんでした。")
  }
  $null = $sb.AppendLine()

  $null = $sb.AppendLine("## 追記メモ")
  $null = $sb.AppendLine()
  $null = $sb.AppendLine("- このMarkdownは自動生成の下書きです。最終版では、実際にゲーム内で試した操作方法を具体例つきで追記してください。")
  $null = $sb.AppendLine("- 特に、GUIの開き方、必要アイテム、前提条件、キー長押し/短押し、クールダウン、権限が必要なコマンドは手動確認が必要です。")
  $null = $sb.AppendLine('- 解析ログは同じフォルダの `解析ログ.json` に保存されます。')

  return $sb.ToString()
}

function New-CodexPrompt {
  param(
    [System.IO.FileInfo]$JarItem,
    [object]$Meta,
    [string]$TargetDir,
    [string]$MarkdownPath,
    [string]$LogPath,
    [object[]]$KeyMappings,
    [object[]]$Commands
  )

  $title = if ($Meta.DisplayName) { $Meta.DisplayName } else { [System.IO.Path]::GetFileNameWithoutExtension($JarItem.Name) }
  $sb = New-Object System.Text.StringBuilder

  $null = $sb.AppendLine('# Codex追記依頼')
  $null = $sb.AppendLine()
  $null = $sb.AppendLine('このファイルは、前処理後に Codex へ渡すための作業メモです。')
  $null = $sb.AppendLine()
  $null = $sb.AppendLine('## 対象')
  $null = $sb.AppendLine()
  $null = $sb.AppendLine(('- MOD名: {0}' -f $title))
  $null = $sb.AppendLine(('- 作業フォルダ: `{0}`' -f $TargetDir))
  $null = $sb.AppendLine(('- jar: `{0}`' -f $JarItem.FullName))
  $null = $sb.AppendLine(('- 下書きMarkdown: `{0}`' -f $MarkdownPath))
  $null = $sb.AppendLine(('- 解析ログ: `{0}`' -f $LogPath))
  $null = $sb.AppendLine()
  $null = $sb.AppendLine('## 前処理で検出した概要')
  $null = $sb.AppendLine()
  $null = $sb.AppendLine(('- キー割り当て候補: {0} 件' -f $KeyMappings.Count))
  $null = $sb.AppendLine(('- コマンド候補クラス: {0} 件' -f $Commands.Count))
  if ($Meta.ModId) { $null = $sb.AppendLine(('- MOD ID: `{0}`' -f $Meta.ModId)) }
  if ($Meta.Version) { $null = $sb.AppendLine(('- バージョン: `{0}`' -f $Meta.Version)) }
  if ($Meta.MinecraftVersion) { $null = $sb.AppendLine(('- 対応 Minecraft: `{0}`' -f $Meta.MinecraftVersion)) }
  $null = $sb.AppendLine()

  $null = $sb.AppendLine('## Codexへの依頼文')
  $null = $sb.AppendLine()
  $null = $sb.AppendLine('```text')
  $null = $sb.AppendLine(('作業フォルダ `{0}` を対象にしてください。' -f $TargetDir))
  $null = $sb.AppendLine()
  $null = $sb.AppendLine('このフォルダ内の jar、`解析ログ.json`、`キー割り当てと操作方法.md` を読み、jarを必要に応じて逆コンパイル・文字列検索・メタデータ確認しながら、`キー割り当てと操作方法.md` を完成版に近づけてください。')
  $null = $sb.AppendLine()
  $null = $sb.AppendLine('必ず日本語で、以下の構成を意識して充実させてください。')
  $null = $sb.AppendLine()
  $null = $sb.AppendLine('1. MOD概要')
  $null = $sb.AppendLine('2. 解析元')
  $null = $sb.AppendLine('3. キー割り当て')
  $null = $sb.AppendLine('4. 特殊コマンド、独自コマンド')
  $null = $sb.AppendLine('5. 主要アイテム・ブロック・画面の操作方法')
  $null = $sb.AppendLine('6. 基本操作の流れ')
  $null = $sb.AppendLine('7. 注意点、キー競合、権限が必要な操作')
  $null = $sb.AppendLine()
  $null = $sb.AppendLine('下書きの自動検出結果は誤検出を含む可能性があります。class名、lang、レシピ、コマンド登録、キー登録を確認し、確度が低いものは「候補」「要実機確認」と明記してください。')
  $null = $sb.AppendLine('特殊コマンドが見つからない場合は、「独自コマンドは確認できませんでした」と明記してください。')
  $null = $sb.AppendLine('操作方法は、子どもや初心者が見ても手順を追えるように、具体的なアイテム名、右クリック、スニーク + 右クリック、GUI、条件、失敗しやすい点まで書いてください。')
  $null = $sb.AppendLine('```')
  $null = $sb.AppendLine()

  $null = $sb.AppendLine('## 仕上げチェック')
  $null = $sb.AppendLine()
  $null = $sb.AppendLine('- [ ] 専用キーがある場合、デフォルトキー・機能・操作方法を表にした')
  $null = $sb.AppendLine('- [ ] 専用キーがない場合、そのことを明記した')
  $null = $sb.AppendLine('- [ ] 独自コマンドがある場合、用途と権限の注意を書いた')
  $null = $sb.AppendLine('- [ ] 独自コマンドがない場合、そのことを明記した')
  $null = $sb.AppendLine('- [ ] 主要アイテム・ブロック・GUIの使い方を手順化した')
  $null = $sb.AppendLine('- [ ] 推測と確認済み情報を分けて書いた')
  $null = $sb.AppendLine('- [ ] 最後に注意点・競合しやすいキーを書いた')

  return $sb.ToString()
}

function Analyze-ModJar {
  param(
    [string]$InputJarPath,
    [string]$Root,
    [bool]$ShouldMove,
    [bool]$ShouldOverwriteMarkdown,
    [string]$JavapPath,
    [int]$MaxClasses
  )

  $jarItem = Get-Item -LiteralPath $InputJarPath
  if ($jarItem.Extension -ne '.jar') {
    throw "jar ファイルではありません: $InputJarPath"
  }

  $folderName = Get-SafeFileName ([System.IO.Path]::GetFileNameWithoutExtension($jarItem.Name))
  $targetDir = Join-Path $Root $folderName
  New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

  $targetJar = Join-Path $targetDir $jarItem.Name
  if ($jarItem.FullName -ne $targetJar) {
    if ($ShouldMove) {
      Move-Item -LiteralPath $jarItem.FullName -Destination $targetJar -Force
    }
    else {
      Copy-Item -LiteralPath $jarItem.FullName -Destination $targetJar -Force
    }
  }

  $targetJarItem = Get-Item -LiteralPath $targetJar
  $markdownPath = Join-Path $targetDir 'キー割り当てと操作方法.md'
  $logPath = Join-Path $targetDir '解析ログ.json'
  $codexPromptPath = Join-Path $targetDir 'Codex追記依頼.md'

  if ((Test-Path -LiteralPath $markdownPath) -and -not $ShouldOverwriteMarkdown) {
    Write-Host "Markdown は既に存在するため上書きしません: $markdownPath" -ForegroundColor Yellow
    Write-Host "上書きしたい場合は -OverwriteMarkdown を付けてください。" -ForegroundColor Yellow
    return
  }

  Write-Host "解析中: $($targetJarItem.Name)" -ForegroundColor Cyan

  $zip = [System.IO.Compression.ZipFile]::OpenRead($targetJarItem.FullName)
  try {
    $meta = Get-ModMetadata -Zip $zip -FallbackName $folderName
    $languageMap = Get-LanguageMap -Zip $zip
    $classCandidates = @(Get-ClassCandidates -Zip $zip)
  }
  finally {
    $zip.Dispose()
  }

  $javapTargets = @(
    $classCandidates |
      Sort-Object @{ Expression = { if ($_.Type -match 'Key|Command') { 0 } else { 1 } } }, @{ Expression = 'Score'; Descending = $true }, ClassName |
      Select-Object -First $MaxClasses
  )

  $javapResults = New-Object System.Collections.Generic.List[object]
  foreach ($candidate in $javapTargets) {
    $text = Invoke-JavapSafe -JavapPath $JavapPath -JarFile $targetJarItem.FullName -ClassName $candidate.ClassName
    $javapResults.Add([pscustomobject]@{
      ClassName = $candidate.ClassName
      Type = $candidate.Type
      Text = $text
    })
  }

  $keyMappings = @(Get-KeyMappingsFromJavap -JavapResults $javapResults -LanguageMap $languageMap)
  $commands = @(Get-CommandsFromJavap -JavapResults $javapResults)

  $markdown = New-Markdown -JarItem $targetJarItem -Meta $meta -KeyMappings $keyMappings -Commands $commands -ClassCandidates $classCandidates -JavapResults $javapResults
  Set-Content -LiteralPath $markdownPath -Value $markdown -Encoding UTF8
  $codexPrompt = New-CodexPrompt -JarItem $targetJarItem -Meta $meta -TargetDir $targetDir -MarkdownPath $markdownPath -LogPath $logPath -KeyMappings $keyMappings -Commands $commands
  Set-Content -LiteralPath $codexPromptPath -Value $codexPrompt -Encoding UTF8

  $log = [ordered]@{
    jar = $targetJarItem.FullName
    generatedMarkdown = $markdownPath
    generatedCodexPrompt = $codexPromptPath
    generatedAt = (Get-Date).ToString('o')
    metadata = $meta
    keyMappings = $keyMappings
    commands = $commands
    classCandidates = $classCandidates
    javapAvailable = [bool]$JavapPath
  }
  $log | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $logPath -Encoding UTF8

  Write-Host "完了: $markdownPath" -ForegroundColor Green
  Write-Host "Codex追記依頼: $codexPromptPath" -ForegroundColor Green
}

$javapPath = Resolve-Tool 'javap.exe'
if (-not $javapPath) {
  $javapPath = Resolve-Tool 'javap'
}
if (-not $javapPath) {
  Write-Warning 'javap が見つからないため、キーとコマンドの詳細抽出精度が下がります。JDK を PATH に追加してください。'
}

$targets = New-Object System.Collections.Generic.List[string]
if ($LatestFromDownloads) {
  $latest = Get-ChildItem -LiteralPath $DownloadsPath -Filter '*.jar' -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $latest) {
    throw "Downloads フォルダに jar が見つかりません: $DownloadsPath"
  }
  $targets.Add($latest.FullName)
}

if ($JarPath) {
  foreach ($path in $JarPath) {
    $targets.Add((Get-Item -LiteralPath $path).FullName)
  }
}

if ($targets.Count -eq 0) {
  throw '解析する jar を指定してください。例: -JarPath "$HOME\Downloads\example.jar" または -LatestFromDownloads'
}

New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null

foreach ($target in $targets) {
  Analyze-ModJar -InputJarPath $target -Root $OutputRoot -ShouldMove:$Move.IsPresent -ShouldOverwriteMarkdown:$OverwriteMarkdown.IsPresent -JavapPath $javapPath -MaxClasses $MaxJavapClasses
}
