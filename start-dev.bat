@echo off
cd /d "%~dp0"
title Bazaar.pk - Localhost Development Server

echo ================================================================
echo           Bazaar.pk - Localhost Auto-Startup Launcher
echo ================================================================
echo.

:: STEP 1: Check and Start PostgreSQL / Docker Services
echo [1/4] Checking Local Database Services...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Service *postgres*, *docker* -ErrorAction SilentlyContinue | Where-Object {$_.Status -ne 'Running'} | ForEach-Object { try { Start-Service $_.Name -ErrorAction SilentlyContinue; Write-Host ('[OK] Started service: ' + $_.Name) } catch { } }"

:: STEP 2: Run Database Preflight Verification & Prisma Generate
echo.
echo [2/4] Verifying Database Connection and Syncing Prisma...
node scripts/preflight.js
call npx prisma generate

:: STEP 3: Auto-Launch Browser when server is booting
echo.
echo [3/4] Scheduling Browser Launch (http://localhost:3000)...
start /b "" powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'"

:: STEP 4: Start Next.js Development Server
echo.
echo [4/4] Starting Next.js Development Server on http://localhost:3000...
echo ================================================================
echo Press Ctrl+C in this window to stop the development server.
echo ================================================================
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo ================================================================
    echo Server stopped.
    echo ================================================================
    pause
)
