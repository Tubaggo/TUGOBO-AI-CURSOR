@echo off

echo =====================================
echo TUGOBO AI CLEAN DEV START
echo =====================================

echo.
echo Killing Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Removing .next cache...
if exist .next rmdir /s /q .next

echo.
echo Removing Turbopack cache...
if exist .turbo rmdir /s /q .turbo

echo.
echo Installing dependencies...
call pnpm install

echo.
echo Starting dev server...
call pnpm dev

pause
