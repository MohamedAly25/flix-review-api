# FlixReview v0.3.0 - Server Startup Script
# This script starts both backend and frontend servers
# New in v0.3.0: Enhanced admin dashboard and professional API documentation

Write-Host "Starting FlixReview v0.3.0 Servers..." -ForegroundColor Cyan
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
    Write-Host ''
    Write-Host 'Backend URLs:' -ForegroundColor Cyan
    Write-Host '   API:        http://127.0.0.1:8000/api/' -ForegroundColor White
    Write-Host '   Admin:      http://127.0.0.1:8000/admin/' -ForegroundColor White
    Write-Host '   Dashboard:  http://127.0.0.1:8000/admin/dashboard/' -ForegroundColor Yellow
    Write-Host '   API Docs:   http://127.0.0.1:8000/api/docs/' -ForegroundColor Yellow
    Write-Host '   Swagger:    http://127.0.0.1:8000/api/swagger/' -ForegroundColor Yellow
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
    Write-Host ''
    Write-Host 'Frontend URL:' -ForegroundColor Cyan
    Write-Host '   Local:      http://localhost:3000/' -ForegroundColor White
    Write-Host '   Network:    will be shown in output below' -ForegroundColor Gray
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
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Frontend Application:" -ForegroundColor Yellow
Write-Host "   └─ http://localhost:3000/" -ForegroundColor White
Write-Host ""
Write-Host "   Backend API:" -ForegroundColor Yellow
Write-Host "   └─ http://127.0.0.1:8000/api/" -ForegroundColor White
Write-Host ""
Write-Host "   Documentation (NEW in v0.3.0):" -ForegroundColor Yellow
Write-Host "   ├─ API Docs:    http://127.0.0.1:8000/api/docs/" -ForegroundColor White
Write-Host "   ├─ Swagger UI:  http://127.0.0.1:8000/api/swagger/" -ForegroundColor White
Write-Host "   └─ Schema:      http://127.0.0.1:8000/api/schema/" -ForegroundColor White
Write-Host ""
Write-Host "   Admin Interface (ENHANCED in v0.3.0):" -ForegroundColor Yellow
Write-Host "   ├─ Admin Home:  http://127.0.0.1:8000/admin/" -ForegroundColor White
Write-Host "   └─ Dashboard:   http://127.0.0.1:8000/admin/dashboard/" -ForegroundColor White
Write-Host ""
Write-Host "Network Access:" -ForegroundColor Yellow
Write-Host "   Your IP: $networkIP" -ForegroundColor Gray
Write-Host "   Frontend:  http://$networkIP"`:3000/" -ForegroundColor White
Write-Host "   Backend:   http://$networkIP"`:8000/api/" -ForegroundColor White
Write-Host "   Note: Accessible from devices on your network" -ForegroundColor Gray
Write-Host "   Note: Ensure firewall allows ports 3000 and 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "   • Both servers run in separate windows" -ForegroundColor Gray
Write-Host "   • Press Ctrl+C in each window to stop" -ForegroundColor Gray
Write-Host "   • Check each window for startup messages" -ForegroundColor Gray
Write-Host "   • Admin credentials: admin / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "What's New in v0.3.0:" -ForegroundColor Yellow
Write-Host "   Professional admin dashboard with charts" -ForegroundColor Gray
Write-Host "   Real-time statistics and analytics" -ForegroundColor Gray
Write-Host "   Enhanced API documentation" -ForegroundColor Gray
Write-Host "   Beautiful Tailwind CSS design" -ForegroundColor Gray
Write-Host "   Mobile-responsive layouts" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "   FlixReview v0.3.0 is ready!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
try {
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
} catch {
    # Fallback for systems without RawUI
    Read-Host 'Press Enter to exit'
}