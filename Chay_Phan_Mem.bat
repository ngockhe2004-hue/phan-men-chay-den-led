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

:: 1. Cấu hình Docker PATH nếu cần
set "DOCKER_BIN=C:\Users\NGOCKHE\AppData\Local\Programs\DockerDesktop\resources\bin"
if exist "%DOCKER_BIN%\docker.exe" (
    set "PATH=%DOCKER_BIN%;%PATH%"
)

:: 2. Khởi động Docker Containers (PostgreSQL, Redis, MinIO, Adminer)
echo [1/3] Đang kiểm tra & khởi động cơ sở dữ liệu Docker...
docker compose -f backend\docker-compose.yml up -d >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo       [OK] Database PostgreSQL (5432) & MinIO (9000/9001) đã sẵn sàng.
) else (
    echo       [Chu Y] Docker chua bat hoac dang khoi dong, tiep tuc chay...
)
echo.

:: 3. Khởi động Backend NestJS
echo [2/3] Đang khởi động Backend API Server (Port 5000)...
start "LED CMS Backend API" /min cmd /c "cd /d "%~dp0backend" && npm run start:dev"
echo       [OK] Backend API đã khởi động tại: http://localhost:5000/api
echo.

:: 4. Khởi động Frontend Web CMS
echo [3/3] Đang khởi động Giao diện Web CMS...
echo.
echo ================================================================
echo   THÔNG TIN TRUY CẬP HỆ THỐNG:
echo   - Giao diện Web CMS:    http://localhost:3000/
echo   - Backend REST API:     http://localhost:5000/api
echo   - MinIO File Storage:   http://localhost:9001 (led_minio_admin / Led@Minio2026)
echo   - Adminer Database GUI: http://localhost:8080 (PostgreSQL: led_cms)
echo ================================================================
echo.

:: Mở trình duyệt Web CMS
timeout /t 3 /nobreak >nul
start http://localhost:3000/

:: Chạy Frontend Dev Server
npm run dev

pause
