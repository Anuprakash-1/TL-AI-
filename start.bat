@echo off
title TruthLens AI Launcher
echo ===================================================
echo        Starting TruthLens AI System...
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Backend Server on port 8000...
start "TruthLens AI - Backend" cmd /k "cd /d "%~dp0backend" && .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Launching Frontend Server on port 5173...
start "TruthLens AI - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0 --port 5173"

echo.
echo Waiting for servers to initialize...
timeout /t 3 /nobreak > nul

echo Opening TruthLens AI in your browser...
start http://localhost:5173/

echo.
echo ===================================================
echo TruthLens AI is now running!
echo - Frontend: http://localhost:5173/
echo - Backend:  http://localhost:8000/
echo.
echo Do not close the backend and frontend terminal windows.
echo ===================================================
pause
