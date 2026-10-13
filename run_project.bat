@echo off
title StrokeCare AI - Unified Server (Port 8000)
cd /d "%~dp0"

echo ===================================================
echo           Starting StrokeCare AI Platform
echo ===================================================
echo.

:: 1. Check if virtual environment exists
if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in .\venv!
    echo Please make sure the venv folder exists.
    pause
    exit /b 1
)

:: 2. Check if port 8000 is already in use and free it
echo [1/3] Checking port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [INFO] Port 8000 is occupied by PID %%a. Closing previous process...
    taskkill /F /PID %%a >nul 2>&1
)

:: 3. Run the Unified Backend + Frontend Server
echo [2/3] Starting Unified Server on http://localhost:8000 ...
echo [3/3] Swagger API Docs available at http://localhost:8000/docs
echo.
echo Press Ctrl + C anytime in this window to stop the server.
echo ===================================================
echo.

venv\Scripts\python.exe backend\run.py

pause
