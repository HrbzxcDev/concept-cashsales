Write-Host "Starting Cron Service for Fetch and Save Data..." -ForegroundColor Green
Write-Host ""
Write-Host "This will run the fetch-and-save operation every hour." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the service." -ForegroundColor Yellow
Write-Host ""

try {
    npm run cron:start
} catch {
    Write-Host "Error starting cron service: $_" -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
