@echo off
chcp 65001 >nul
echo ========================================================
echo   ĐANG ĐẨY CODE LÊN GITHUB: ngockhe2004-hue
echo ========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   DA DAY CODE LEN GITHUB THANH CONG!
    echo   Xem tai: https://github.com/ngockhe2004-hue/phan-men-chay-den-led
    echo ========================================================
) else (
    echo   Xay ra loi khi push. Vui long kiem tra tai khoan GitHub.
)
echo.
pause
