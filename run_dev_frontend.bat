@echo off
title StrokeCare AI - Frontend Dev Server (Port 3000)
cd /d "%~dp0\frontend"

echo ===================================================
echo     Starting Frontend Vite Dev Server (Port 3000)
echo ===================================================
echo.
echo Make sure the backend server (run_project.bat) is also running!
echo URL: http://localhost:3000
echo.

npm run dev -- --port 3000

pause
