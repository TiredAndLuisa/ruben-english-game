@ECHO OFF
REM ===================================================
REM Deploy Script Runner
REM Runs the Node.js deployment script in cmd.exe
REM ===================================================

SETLOCAL ENABLEDELAYEDEXPANSION

REM Change to the repository directory
CD /D "C:\Users\migue\OneDrive\Documents\Nova pasta\ruben-english-game-sound"

IF ERRORLEVEL 1 (
    ECHO ERROR: Failed to change directory
    PAUSE
    EXIT /B 1
)

ECHO.
ECHO ===================================================
ECHO Running Deployment Script
ECHO ===================================================
ECHO.

REM Execute the Node.js deployment script
NODE.EXE scripts\deploy.js

REM Capture the exit code
SET EXITCODE=%ERRORLEVEL%

ECHO.
ECHO ===================================================
ECHO Deployment Script Completed with exit code: !EXITCODE!
ECHO ===================================================

EXIT /B !EXITCODE!
