$ErrorActionPreference = "Stop"

$sourceRoot = Split-Path -Parent $PSScriptRoot
$distRoot = Join-Path $sourceRoot "dist\twitch-vertical-layout"
$pairs = @(
  @("manifest.json", "manifest.json"),
  @("src\content.js", "src\content.js"),
  @("src\twitch-vertical.css", "src\twitch-vertical.css")
)

foreach ($pair in $pairs) {
  $sourceHash = (Get-FileHash -LiteralPath (Join-Path $sourceRoot $pair[0]) -Algorithm SHA256).Hash
  $distHash = (Get-FileHash -LiteralPath (Join-Path $distRoot $pair[1]) -Algorithm SHA256).Hash
  if ($sourceHash -ne $distHash) {
    throw "Distribution file is out of sync: $($pair[0])"
  }
}

$chromeCandidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chrome = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $chrome) {
  throw "Google Chrome was not found."
}

$harnessPath = (Resolve-Path "$PSScriptRoot\layout-harness.html").Path
$harnessUrl = [System.Uri]::new($harnessPath).AbsoluteUri
$profilePath = Join-Path $env:TEMP "twitch-vertical-layout-harness"

$outputPath = Join-Path $env:TEMP "tvl-harness-$([guid]::NewGuid()).html"
$errorPath = Join-Path $env:TEMP "tvl-harness-$([guid]::NewGuid()).log"
$arguments = @(
  "--headless=new",
  "--disable-gpu",
  "--allow-file-access-from-files",
  "--user-data-dir=$profilePath",
  "--window-size=800,1400",
  "--virtual-time-budget=1000",
  "--dump-dom",
  $harnessUrl
)

$process = Start-Process -FilePath $chrome `
  -ArgumentList $arguments `
  -NoNewWindow `
  -Wait `
  -PassThru `
  -RedirectStandardOutput $outputPath `
  -RedirectStandardError $errorPath

if ($process.ExitCode -ne 0) {
  throw "Chrome exited with code $($process.ExitCode)."
}

$output = Get-Content -Raw -LiteralPath $outputPath
[System.IO.File]::Delete($outputPath)
[System.IO.File]::Delete($errorPath)

if ($output -notmatch 'id="harness-result"[^>]*data-status="pass"') {
  $result = [regex]::Match($output, '<output id="harness-result"[^>]*>(.*?)</output>').Groups[1].Value
  throw "Layout harness failed: $result"
}

Write-Output "Layout harness passed."
