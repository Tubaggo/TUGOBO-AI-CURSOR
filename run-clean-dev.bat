@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo [1/3] Stopping Node.js processes ^(node.exe^)...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo       No running node.exe found, or could not stop ^(continuing^).
) else (
    echo       Stopped node.exe.
)
rem Brief pause helps Windows release file locks on .next
timeout /t 1 /nobreak >nul

echo [2/3] Removing apps\web\.next ...
if exist "apps\web\.next" (
    rmdir /s /q "apps\web\.next"
    if exist "apps\web\.next" (
        echo       WARNING: folder still exists. Close editors/terminals using those files and run again.
    ) else (
        echo       Removed apps\web\.next
    )
) else (
    echo       apps\web\.next not found ^(skipped^).
)

echo [3/3] Starting dev server ^(npm run dev from repo root^)...
call npm run dev
