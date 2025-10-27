# upgrade-node22.ps1
# Run as Administrator in project root

$log = Join-Path $PWD "upgrade-log.txt"
"`n==== Upgrade started: $(Get-Date) ====`n" | Out-File $log -Encoding utf8

Write-Host "1) Verify npm & node"
node -v 2>&1 | Tee-Object -FilePath $log -Append
npm -v 2>&1 | Tee-Object -FilePath $log -Append

Write-Host "2) Close common lock holders and verify admin"
# Ensure script is running elevated
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
  Write-Error "Script must be run as Administrator. Exiting." | Tee-Object -FilePath $log -Append
  exit 1
}

Write-Host "3) Try safe remove of node_modules and package-lock.json"
npm cache verify 2>&1 | Tee-Object -FilePath $log -Append
npx rimraf node_modules package-lock.json 2>&1 | Tee-Object -FilePath $log -Append

if (Test-Path node_modules) {
  Write-Host "4) Take ownership and force remove (if present)"
  takeown /F . /R /A 2>&1 | Tee-Object -FilePath $log -Append
  icacls . /grant Administrators:F /T 2>&1 | Tee-Object -FilePath $log -Append
  npx rimraf node_modules package-lock.json 2>&1 | Tee-Object -FilePath $log -Append
}

Write-Host "5) Remove node-sass from package.json (if present) and add sass + gulp-sass@^5"
# Backup package.json
Copy-Item package.json package.json.bak -Force
(Get-Content package.json -Raw) `
  -replace '"node-sass"\s*:\s*"[^"]*",?', '' `
  | Set-Content package.json
npm install --no-audit --no-fund sass --save-dev 2>&1 | Tee-Object -FilePath $log -Append
npm install --no-audit --no-fund gulp-sass@^5 --save-dev 2>&1 | Tee-Object -FilePath $log -Append

Write-Host "6) Ensure gulpfile uses Dart Sass (manual check recommended)"
"`nPlease ensure your gulpfile loads gulp-sass like:`nconst sass = require('gulp-sass')(require('sass'));`n" | Tee-Object -FilePath $log -Append
Write-Host "(Script will continue: open gulpfile and adjust if necessary.)"

Write-Host "7) Install Python 3 (64-bit) path into npm config if detected"
# Try detect 64-bit python3 on PATH
$py = (& where.exe python 2>$null | Select-String -Pattern "Python" -Quiet) -and (where.exe python 2>$null) | ForEach-Object { $_ } | Select-Object -First 1
if ($py) {
  $pyPath = (where.exe python | Select-Object -First 1)
  npm config set python $pyPath 2>&1 | Tee-Object -FilePath $log -Append
  "Set npm python to $pyPath" | Tee-Object -FilePath $log -Append
} else {
  "No python on PATH found. Install 64-bit Python 3.11+ and re-run script or set npm config manually." | Tee-Object -FilePath $log -Append
}

Write-Host "8) Update global node-gyp (best-effort)"
npm install -g node-gyp@9 2>&1 | Tee-Object -FilePath $log -Append

Write-Host "9) Fresh install (captures verbose output)"
# Use legacy-peer-deps as a fallback; remove flag later after resolving peers
npm install --legacy-peer-deps --loglevel verbose 2>&1 | Tee-Object -FilePath $log -Append

Write-Host "10) Attempt npm rebuild to surface any native build errors"
npm rebuild --verbose 2>&1 | Tee-Object -FilePath $log -Append

"`n==== Upgrade finished: $(Get-Date) ====`nLogs saved to $log" | Tee-Object -FilePath $log -Append
Write-Host "Done. See upgrade-log.txt for details."