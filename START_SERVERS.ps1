# FlixReview v1.2.0 - Server Startup Script
# This script starts both backend and frontend servers

Write-Host "Starting FlixReview v1.2.0 Servers..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Gray
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path ".\flixreview-backend") -or -not (Test-Path ".\flixreview-frontend")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Expected to find: flixreview-backend/ and flixreview-frontend/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Current Directory: $PWD" -ForegroundColor Green
Write-Host ""

# Get current location for scripts
$currentPath = Get-Location

# Start Backend Server in new window
Write-Host "Starting Backend Server (Django)..." -ForegroundColor Yellow
$backendPath = $currentPath.Path + "\flixreview-backend"
$backendCommand = @"
& {
    Set-Location '$backendPath'
    Write-Host 'FlixReview Backend Server' -ForegroundColor Cyan
    Write-Host '============================================================' -ForegroundColor Gray
    if (Test-Path '..\venv\Scripts\Activate.ps1') {
        Write-Host 'Activating virtual environment...' -ForegroundColor Green
        & '..\venv\Scripts\Activate.ps1'
    } elseif (Test-Path 'venv\Scripts\Activate.ps1') {
        Write-Host 'Activating virtual environment...' -ForegroundColor Green
        & 'venv\Scripts\Activate.ps1'
    } else {
        Write-Host 'Virtual environment not found, using global Python' -ForegroundColor Yellow
    }
    Write-Host 'Starting Django server on http://127.0.0.1:8000/' -ForegroundColor Green
    Write-Host 'API Docs: http://127.0.0.1:8000/api/docs/' -ForegroundColor Blue
    Write-Host 'Admin: http://127.0.0.1:8000/admin/' -ForegroundColor Blue
    Write-Host ''
    python manage.py runserver
}
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# Wait for backend to start
Write-Host "Waiting for backend to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend Server in new window
Write-Host "Starting Frontend Server (Next.js)..." -ForegroundColor Yellow
$frontendPath = $currentPath.Path + "\flixreview-frontend"
$frontendCommand = @"
& {
    Set-Location '$frontendPath'
    Write-Host 'FlixReview Frontend Server' -ForegroundColor Cyan
    Write-Host '============================================================' -ForegroundColor Gray
    Write-Host 'Starting Next.js development server...' -ForegroundColor Green
    Write-Host 'Frontend: http://localhost:3000/' -ForegroundColor Green
    Write-Host 'Network: will be shown in output below' -ForegroundColor Blue
    Write-Host ''
    npm run dev
}
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

# Compute a network IP if possible (fallback to localhost)
try {
    $networkIP = (Get-NetIPAddress -AddressFamily IPv4 |
                  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
                  Select-Object -First 1 -ExpandProperty IPAddress)
} catch {
    $networkIP = $env:COMPUTERNAME
}

if (-not $networkIP) { $networkIP = '127.0.0.1' }

# Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000/" -ForegroundColor White
Write-Host "   Backend:   http://127.0.0.1:8000/api/" -ForegroundColor White
Write-Host "   API Docs:  http://127.0.0.1:8000/api/docs/" -ForegroundColor White
Write-Host "   Admin:     http://127.0.0.1:8000/admin/" -ForegroundColor White
Write-Host ""
Write-Host "Network Access:" -ForegroundColor Yellow
Write-Host "   - Your network IP: $networkIP" -ForegroundColor Gray
Write-Host "   - Frontend (Network):  http://$networkIP`:3000/" -ForegroundColor White
Write-Host "   - Backend (Network):   http://$networkIP`:8000/api/" -ForegroundColor White
Write-Host "   - Frontend accessible from phones/tablets on your network" -ForegroundColor Gray
Write-Host "   - Backend API accessible from other devices" -ForegroundColor Gray
Write-Host "   - Make sure firewall allows ports 3000 and 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "   - Both servers are running in separate windows" -ForegroundColor Gray
Write-Host "   - Press Ctrl+C in each window to stop servers" -ForegroundColor Gray
Write-Host "   - Check each window for any startup errors" -ForegroundColor Gray
Write-Host ""
Write-Host "FlixReview v1.2.0 is ready!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..."
try {
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
} catch {
    # Fallback for systems without RawUI
    Read-Host 'Press Enter to exit'
}