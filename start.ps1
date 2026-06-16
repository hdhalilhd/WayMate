# WayMate — Tüm servisleri başlat
# Kullanım: .\start.ps1

$pgBin  = "C:\Program Files\PostgreSQL\17\bin"
$pgData = "C:\Program Files\PostgreSQL\17\data"
$pgBinPostGIS = "C:\Users\HALIL\yolarkadashim\postgis-bin"
$backendDir  = "C:\Users\HALIL\yolarkadashim\backend\YolArkadashim.API"
$frontendDir = "C:\Users\HALIL\yolarkadashim\frontend"

# PATH güncelle (bu session için)
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("PATH","User") + ";" +
            $pgBin + ";" + $pgBinPostGIS

# ── 1) PostgreSQL (port 5433 — forklift-telemetri projesiyle çakışmamak için) ───
Write-Host ""
Write-Host "▶  PostgreSQL başlatılıyor (port 5433)..." -ForegroundColor Cyan
$pgStatus = & "$pgBin\pg_ctl.exe" status -D $pgData 2>&1
if ($pgStatus -like "*çalışıyor*" -or $pgStatus -like "*running*") {
    Write-Host "   ✓ PostgreSQL zaten çalışıyor." -ForegroundColor Green
} else {
    & "$pgBin\pg_ctl.exe" start -D $pgData -l "$pgData\pg.log" -o "-p 5433 -c dynamic_library_path='$pgBinPostGIS'" 2>&1 | Out-Null
    Start-Sleep 4
    Write-Host "   ✓ PostgreSQL başlatıldı (5433)." -ForegroundColor Green
}

# ── 2) Backend ─────────────────────────────────────────────────────────────────
Write-Host "▶  Backend başlatılıyor (http://localhost:5000)..." -ForegroundColor Cyan
$pathForChild = $env:PATH
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:PATH = '$pathForChild'; cd '$backendDir'; dotnet run --launch-profile http"
) -WindowStyle Normal

Start-Sleep 2

# ── 3) Frontend ────────────────────────────────────────────────────────────────
Write-Host "▶  Frontend başlatılıyor (http://localhost:3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:PATH = '$pathForChild'; cd '$frontendDir'; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  🚀  Tüm servisler başlatılıyor!" -ForegroundColor Green
Write-Host "  Frontend  →  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend   →  http://localhost:5000" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Durdurmak için açılan pencereleri kapatın." -ForegroundColor DarkGray
