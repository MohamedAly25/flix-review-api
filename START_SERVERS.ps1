# FlixReview v1.2.0 - Server Startup Script
# This script starts both backend and frontend servers

Write-Host "🎬 Starting FlixReview v1.2.0 Servers..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path ".\flix-review-api") -or -not (Test-Path ".\flixreview-frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Expected to find: flix-review-api/ and flixreview-frontend/" -ForegroundColor Yellow
    exit 1
}

Write-Host "📍 Current Directory: $PWD" -ForegroundColor Green
Write-Host ""

# Start Backend Server in new window
Write-Host "🔧 Starting Backend Server (Django)..." -ForegroundColor Yellow
$backendScript = @"
Write-Host '🔧 FlixReview Backend Server' -ForegroundColor Cyan
Write-Host '=' * 60 -ForegroundColor Gray
cd '$PWD\flix-review-api'
if (Test-Path '..\venv\Scripts\Activate.ps1') {
    Write-Host '✅ Activating virtual environment...' -ForegroundColor Green
    & '..\venv\Scripts\Activate.ps1'
} elseif (Test-Path 'venv\Scripts\Activate.ps1') {
    Write-Host '✅ Activating virtual environment...' -ForegroundColor Green
    & 'venv\Scripts\Activate.ps1'
} else {
    Write-Host '⚠️  Virtual environment not found, using global Python' -ForegroundColor Yellow
}
Write-Host '🚀 Starting Django server on http://127.0.0.1:8000/' -ForegroundColor Green
Write-Host '📚 API Docs: http://127.0.0.1:8000/api/docs/' -ForegroundColor Blue
Write-Host '🔐 Admin: http://127.0.0.1:8000/admin/' -ForegroundColor Blue
Write-Host ''
python manage.py runserver
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend Server in new window
Write-Host "⚛️  Starting Frontend Server (Next.js)..." -ForegroundColor Yellow
$frontendScript = @"
Write-Host '⚛️  FlixReview Frontend Server' -ForegroundColor Cyan
Write-Host '=' * 60 -ForegroundColor Gray
cd '$PWD\flixreview-frontend'
Write-Host '✅ Starting Next.js development server...' -ForegroundColor Green
Write-Host '🚀 Frontend: http://localhost:3000/' -ForegroundColor Green
Write-Host '📱 Network: Will be shown in output below' -ForegroundColor Blue
Write-Host ''
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

# Summary
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000/" -ForegroundColor White
Write-Host "   Backend:   http://127.0.0.1:8000/api/" -ForegroundColor White
Write-Host "   API Docs:  http://127.0.0.1:8000/api/docs/" -ForegroundColor White
Write-Host "   Admin:     http://127.0.0.1:8000/admin/" -ForegroundColor White
Write-Host ""
Write-Host "⚡ Tips:" -ForegroundColor Yellow
Write-Host "   • Both servers are running in separate windows" -ForegroundColor Gray
Write-Host "   • Press Ctrl+C in each window to stop servers" -ForegroundColor Gray
Write-Host "   • Check each window for any startup errors" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 FlixReview v1.2.0 is ready!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
