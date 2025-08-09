@echo off
echo Starting Cron Service for Fetch and Save Data...
echo.
echo This will run the fetch-and-save operation every hour.
echo Press Ctrl+C to stop the service.
echo.

npm run cron:start

pause
