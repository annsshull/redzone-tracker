@echo off
setlocal enabledelayedexpansion
title RAKSHA - Command Intelligence Platform

:: Ensure we are working from the batch script's directory
cd /d "%~dp0"

echo ===============================================================
echo   Launching RAKSHA Ultra-Dark Command Center...
echo ===============================================================
echo.

:: 1. Locate directory containing index.html
if not exist "index.html" (
    echo [SEARCH] Locating index.html in subdirectories...
    for /r %%f in (index.html) do (
        if exist "%%f" (
            echo [OK] Found index.html in: %%~dpf
            cd /d "%%~dpf"
            goto :locate_done
        )
    )
    echo [ERROR] index.html not found!
    pause
    exit /b 1
)

:locate_done
:: 2. Release port 8000 if previously occupied by a stale session
echo [PORT] Checking and clearing port 8000...
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>&1
)

:: 3. Detect Real Python (Check user AppData first, then Program Files, then py, then system python)
set "PY_EXE="

if exist "%USERPROFILE%\AppData\Local\Programs\Python\Python314\python.exe" (
    set "PY_EXE=%USERPROFILE%\AppData\Local\Programs\Python\Python314\python.exe"
    goto :start_server
)
if exist "%USERPROFILE%\AppData\Local\Programs\Python\Python313\python.exe" (
    set "PY_EXE=%USERPROFILE%\AppData\Local\Programs\Python\Python313\python.exe"
    goto :start_server
)
if exist "%USERPROFILE%\AppData\Local\Programs\Python\Python312\python.exe" (
    set "PY_EXE=%USERPROFILE%\AppData\Local\Programs\Python\Python312\python.exe"
    goto :start_server
)
if exist "%USERPROFILE%\AppData\Local\Programs\Python\Python311\python.exe" (
    set "PY_EXE=%USERPROFILE%\AppData\Local\Programs\Python\Python311\python.exe"
    goto :start_server
)
if exist "%USERPROFILE%\AppData\Local\Programs\Python\Python310\python.exe" (
    set "PY_EXE=%USERPROFILE%\AppData\Local\Programs\Python\Python310\python.exe"
    goto :start_server
)

if exist "%LocalAppData%\Programs\Python\Python314\python.exe" (
    set "PY_EXE=%LocalAppData%\Programs\Python\Python314\python.exe"
    goto :start_server
)
if exist "%LocalAppData%\Programs\Python\Python313\python.exe" (
    set "PY_EXE=%LocalAppData%\Programs\Python\Python313\python.exe"
    goto :start_server
)
if exist "%LocalAppData%\Programs\Python\Python312\python.exe" (
    set "PY_EXE=%LocalAppData%\Programs\Python\Python312\python.exe"
    goto :start_server
)

if exist "%ProgramFiles%\Python314\python.exe" (
    set "PY_EXE=%ProgramFiles%\Python314\python.exe"
    goto :start_server
)
if exist "%ProgramFiles%\Python313\python.exe" (
    set "PY_EXE=%ProgramFiles%\Python313\python.exe"
    goto :start_server
)
if exist "%ProgramFiles%\Python312\python.exe" (
    set "PY_EXE=%ProgramFiles%\Python312\python.exe"
    goto :start_server
)

:: Try py launcher
py -c "import http.server" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PY_EXE=py"
    goto :start_server
)

:: Try system python (must be real python, not Microsoft WindowsApps shim)
python -c "import http.server" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PY_EXE=python"
    goto :start_server
)

:start_server
:: 4. Launch web server (Python if available, otherwise built-in Windows PowerShell)
if defined PY_EXE (
    echo [SERVER] Starting Python server on port 8000...
    start "RAKSHA HTTP Server" /b "!PY_EXE!" -m http.server 8000
) else (
    echo [SERVER] Python not detected. Starting built-in Windows PowerShell Server on port 8000...
    start "RAKSHA PowerShell Server" /b powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0server.ps1" -Port 8000 -Root "%cd%"
)

:: 5. Wait 2 seconds for socket to bind
timeout /t 2 /nobreak >nul 2>&1

:: 6. Launch browser
echo [BROWSER] Opening dashboard at http://localhost:8000 ...
start "" "http://localhost:8000"

echo.
echo ===============================================================
echo   RAKSHA Command Intelligence Platform is RUNNING!
echo   URL: http://localhost:8000
echo.
echo   - Minimalist Left-Side Analytical Suite Loaded
echo   - 100%% Keyless Dark Leaflet Geospatial Map Active
echo   - Real-time Multi-Hazard Telemetry Feeds Armed
echo.
echo   NOTE: Keep this window OPEN while using the platform.
echo   Close this window or press any key when you wish to exit.
echo ===============================================================
echo.

pause >nul

:: Clean up server on exit
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>&1
)
