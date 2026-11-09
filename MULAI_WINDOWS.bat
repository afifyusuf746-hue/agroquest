@echo off
cd /d "%~dp0"
node --version >nul 2>&1
if errorlevel 1 (
 echo Install Node.js 24 LTS terlebih dahulu.
 pause
 exit /b 1
)
if not exist node_modules (
 call npm ci
 if errorlevel 1 (pause & exit /b 1)
)
call npm run setup
if errorlevel 1 (pause & exit /b 1)
call npm start
pause
