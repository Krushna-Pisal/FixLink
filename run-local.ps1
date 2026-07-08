<#
  FixLink — Local Development Launcher (Windows, No Docker)
  ========================================================
  This script downloads and runs all dependencies locally:
    - Apache Maven (for Spring Boot build)
    - MongoDB Community Server
    - LiveKit Server (dev mode)
  Then launches the backend and frontend dev servers.

  Usage:
    PowerShell -ExecutionPolicy Bypass -File run-local.ps1

  Stop all: Ctrl+C or close the terminal windows.
#>

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# ── Load .env file variables ───────────────────────────────────────────────
if (Test-Path "$root\.env") {
    Write-Host "[*] Loading environment variables from .env file..." -ForegroundColor Cyan
    Get-Content "$root\.env" | Where-Object { $_ -match '=' -and $_ -notmatch '^\s*#' } | ForEach-Object {
        $key, $val = $_ -split '=', 2
        $key = $key.Trim()
        $val = $val.Trim()
        if ($val -like '"*"' -or $val -like "'*'") {
            $val = $val.Substring(1, $val.Length - 2)
        }
        [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
    }
}


# ── Config ──────────────────────────────────────────────────────────────────
$MVN_VERSION    = "3.9.6"
$MVN_URL        = "https://dlcdn.apache.org/maven/maven-3/$MVN_VERSION/binaries/apache-maven-$MVN_VERSION-bin.zip"
$MVN_DIR        = "$root\.tools\maven"
$MVN_BIN        = "$MVN_DIR\apache-maven-$MVN_VERSION\bin\mvn.cmd"

$MONGO_VERSION  = "7.0.12"
$MONGO_URL      = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-$MONGO_VERSION.zip"
$MONGO_DIR      = "$root\.tools\mongodb"
$MONGO_BIN      = "$MONGO_DIR\mongodb-win32-x86_64-windows-$MONGO_VERSION\bin\mongod.exe"
if (-Not (Test-Path $MONGO_BIN)) {
    $MONGO_BIN_CANDIDATE = (Get-ChildItem "$MONGO_DIR\*\bin\mongod.exe" -ErrorAction SilentlyContinue).FullName
    if ($null -ne $MONGO_BIN_CANDIDATE) { $MONGO_BIN = $MONGO_BIN_CANDIDATE }
}
$MONGO_DATA     = "$root\.tools\mongodb-data"

$LK_VERSION     = "1.7.2"
$LK_URL         = "https://github.com/livekit/livekit/releases/download/v$LK_VERSION/livekit_${LK_VERSION}_windows_amd64.zip"
$LK_DIR         = "$root\.tools\livekit"
$LK_BIN         = "$LK_DIR\livekit-server.exe"

# ── Helper: Download & Extract ───────────────────────────────────────────────
function DownloadAndExtract($url, $targetDir, $label) {
    $zipPath = "$env:TEMP\fixlink_$label.zip"
    if (-Not (Test-Path $targetDir)) {
        Write-Host "[>] Downloading $label..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        Write-Host "[*] Extracting $label..." -ForegroundColor Cyan
        Expand-Archive -Path $zipPath -DestinationPath $targetDir -Force
        Remove-Item $zipPath -Force
        Write-Host "[+] $label ready." -ForegroundColor Green
    } else {
        Write-Host "[+] $label already present." -ForegroundColor Green
    }
}

# ── Download Dependencies ────────────────────────────────────────────────────
DownloadAndExtract $MVN_URL   $MVN_DIR   "maven"
DownloadAndExtract $MONGO_URL $MONGO_DIR "mongodb"
DownloadAndExtract $LK_URL    $LK_DIR    "livekit"

# ── Start MongoDB ─────────────────────────────────────────────────────────────
New-Item -ItemType Directory -Path $MONGO_DATA -Force | Out-Null
Write-Host "[*] Starting MongoDB on :27017..." -ForegroundColor Yellow
$mongoProc = Start-Process -FilePath $MONGO_BIN `
    -ArgumentList "--dbpath `"$MONGO_DATA`" --port 27017" `
    -PassThru -WindowStyle Minimized
Write-Host "   MongoDB PID: $($mongoProc.Id)"
Start-Sleep -Seconds 3

# ── Start LiveKit ─────────────────────────────────────────────────────────────
Write-Host "[*] Starting LiveKit server on :7880 (dev mode)..." -ForegroundColor Yellow
$livekitProc = Start-Process -FilePath $LK_BIN `
    -ArgumentList "--dev" `
    -PassThru -WindowStyle Minimized
Write-Host "   LiveKit PID: $($livekitProc.Id)"
Start-Sleep -Seconds 2

# ── Start Spring Boot Backend ─────────────────────────────────────────────────
Write-Host "[*] Starting Spring Boot backend on :8080..." -ForegroundColor Yellow
$javaProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c `"$MVN_BIN`" spring-boot:run" `
    -WorkingDirectory "$root\fixlink-server" `
    -PassThru -WindowStyle Normal
Write-Host "   Spring Boot PID: $($javaProc.Id)"
Write-Host "   Waiting for backend to start (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# ── Install npm deps & Start Frontend ────────────────────────────────────────
Write-Host "[*] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location "$root\fixlink-client"
& npm install --silent
Write-Host "[*] Starting Vite frontend on :5173..." -ForegroundColor Yellow
$frontendProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run dev" `
    -WorkingDirectory "$root\fixlink-client" `
    -PassThru -WindowStyle Normal
Pop-Location

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  [+] FixLink is running!" -ForegroundColor Green
Write-Host "  ->  Agent Dashboard  -> http://localhost:5173" -ForegroundColor White
Write-Host "  ->  Spring Boot API  -> http://localhost:8080" -ForegroundColor White
Write-Host "  ->  MongoDB          -> mongodb://localhost:27017/fixlink" -ForegroundColor White
Write-Host "  ->  LiveKit          -> ws://localhost:7880" -ForegroundColor White
Write-Host ""
Write-Host "  Default test creds: agent@fixlink.dev / fix1234" -ForegroundColor Yellow
Write-Host "  Register first at http://localhost:5173/login" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Gray

# Wait for user to press Ctrl+C
try {
    Wait-Process -Id $javaProc.Id
} finally {
    Write-Host "[!] Stopping services..." -ForegroundColor Red
    foreach ($proc in @($mongoProc, $livekitProc, $javaProc, $frontendProc)) {
        try { $proc.Kill() } catch { }
    }
}
