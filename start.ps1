# TruthLens AI PowerShell Launcher
$rootDir = $PSScriptRoot

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       Starting TruthLens AI System...             " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Start Backend in new window
Write-Host "`n[1/2] Starting Backend Server (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

# 2. Start Frontend in new window
Write-Host "[2/2] Starting Frontend Server (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; npm run dev -- --host 0.0.0.0 --port 5173"

Start-Sleep -Seconds 3

# 3. Open Browser
Write-Host "`nOpening TruthLens AI in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5173/"

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "TruthLens AI is running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173/" -ForegroundColor White
Write-Host "Backend:  http://localhost:8000/" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green
