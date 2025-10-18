@echo off
REM FlixReview v1.2.0 - Server Startup Batch File
REM This batch file starts the PowerShell script to launch both servers

cls
echo.
echo ===============================================
echo    FlixReview v1.2.0 - Server Launcher
echo ===============================================
echo.
echo Initializing server startup sequence...
echo.

REM Check if PowerShell is available
echo [1/4] Checking PowerShell availability...
powershell -Command "Write-Host 'PowerShell check passed'" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: PowerShell is not available on this system
    echo SOLUTION: Please install PowerShell or run START_SERVERS.ps1 directly
    echo.
    pause
    exit /b 1
)
echo       PowerShell is available.

REM Check if we're in the correct directory
echo.
echo [2/4] Validating project structure...
if not exist "flixreview-backend" (
    echo.
    echo ERROR: Backend directory not found
    echo SOLUTION: Please run this script from the project root directory
    echo EXPECTED: flixreview-backend/ folder
    echo.
    pause
    exit /b 1
)

if not exist "flixreview-frontend" (
    echo.
    echo ERROR: Frontend directory not found
    echo SOLUTION: Please run this script from the project root directory
    echo EXPECTED: flixreview-frontend/ folder
    echo.
    pause
    exit /b 1
)
echo       Project structure validated.

REM Show current directory
echo.
echo [3/4] Current working directory:
echo       %CD%

REM Execute the PowerShell script with error handling
echo.
echo [4/4] Starting servers...
echo       Launching PowerShell startup script...
powershell -ExecutionPolicy Bypass -File "%~dp0START_SERVERS.ps1"
set PS_EXIT_CODE=%ERRORLEVEL%

echo.
echo ===============================================
if %PS_EXIT_CODE% EQU 0 (
    echo STATUS: All servers started successfully
    echo.
    echo ACCESS POINTS:
    echo   Frontend: http://localhost:3000/
    echo   Backend:  http://127.0.0.1:8000/
    echo   API Docs: http://127.0.0.1:8000/api/docs/
    echo   Admin:    http://127.0.0.1:8000/admin/
    echo.
    echo SUCCESS: FlixReview is now running!
) else (
    echo STATUS: Server startup completed with warnings
    echo NOTE: Check the PowerShell windows for detailed error information
    echo.
    echo TROUBLESHOOTING:
    echo   - Verify both server windows are open
    echo   - Check for error messages in PowerShell windows
    echo   - Ensure ports 3000 and 8000 are available
)
echo ===============================================
echo.
echo Press any key to close this window...
pause >nul