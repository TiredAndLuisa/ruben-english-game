@echo off
setlocal enabledelayedexpansion

REM Deploy script wrapper for Node.js deployment tool
REM This avoids PowerShell issues by using cmd.exe

cd /d "c:\Users\migue\OneDrive\Documents\Nova pasta\ruben-english-game-sound"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Could not change directory
    exit /b 1
)

echo Running deployment script...
node scripts\deploy.js

if %ERRORLEVEL% NEQ 0 (
    echo Error: Deployment script failed
    exit /b 1
)

echo Deployment completed successfully!
exit /b 0
