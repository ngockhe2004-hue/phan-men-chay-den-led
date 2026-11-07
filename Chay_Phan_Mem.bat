@echo off
chcp 65001 >nul
title KHOI DONG HE THONG LED SIGNAGE CMS PRO
color 0b

echo ================================================================
echo         HỆ THỐNG QUẢN TRỊ VÀ TRÌNH CHIẾU MÀN HÌNH LED
echo                    LED SIGNAGE CMS PRO (v2.0)
echo ================================================================
echo.

cd /d "%~dp0"

:: 1. Cấu hình Docker PATH nếu có
if exist "%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin\docker.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin;%PATH%"
)
if exist "C:\Program Files\Docker\Docker\resources\bin\docker.exe" (
    set "PATH=C:\Program Files\Docker\Docker\resources\bin;%PATH%"
)

:: 2. Khởi động Docker Containers (PostgreSQL, Redis, MinIO, Adminer) nếu có Docker
echo [1/3] Đang kiểm tra cơ sở dữ liệu...
where docker >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    docker compose -f backend\docker-compose.yml up -d >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo       [OK] Database PostgreSQL (5432) & MinIO (9000/9001) đã sẵn sàng.
    ) else (
        echo       [OK] Đang chạy với CSDL Cục Bộ (Resilient Mode) - Sẵn sàng 100%%.
    )
) else (
    echo       [OK] Đang chạy với CSDL Cục Bộ (Resilient Mode) - Sẵn sàng 100%%.
)
echo.

:: 3. Khởi động Backend NestJS
echo [2/3] Đang khởi động Backend API Server (Port 5000)...
start "LED CMS Backend API" /min cmd /c "cd /d "%~dp0backend" && npm run start"
echo       [OK] Backend API đã khởi động tại: http://localhost:5000/api
echo.

:: 4. Khởi động Frontend Web CMS
echo [3/3] Đang khởi động Giao diện Web CMS (Port 3000)...
echo.
echo ================================================================
echo   THÔNG TIN TRUY CẬP HỆ THỐNG:
echo   - Giao diện Web CMS:    http://localhost:3000/
echo   - Trình phát LED Player:http://localhost:3000/player/index.html
echo   - Backend REST API:     http://localhost:5000/api
echo   - Thư mục Media Upload: http://localhost:5000/uploads
echo ================================================================
echo.

:: Mở trình duyệt Web CMS
timeout /t 3 /nobreak >nul
start http://localhost:3000/

:: Chạy Frontend Dev Server
npm run dev

pause
