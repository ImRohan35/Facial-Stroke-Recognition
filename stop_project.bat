@echo off
title StrokeCare AI - Stop Server
cd /d "%~dp0"

echo ===================================================
echo        Stopping StrokeCare AI Background Tasks
echo ===================================================
echo.

set FOUND=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [INFO] Found process %%a on Port 8000. Terminating...
    taskkill /F /PID %%a
    set FOUND=1
)

if %FOUND%==0 (
    echo [INFO] Port 8000 is already free! No running server found.
) else (
    echo [SUCCESS] Server stopped and Port 8000 is now free.
)

echo.
pause
