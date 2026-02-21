@echo off
echo ========================================
echo MindFlow Companion Feature Testing
echo ========================================
echo.

echo Checking if you have a development build installed...
echo.
echo If you have the MindFlow development build installed on your device:
echo   1. Make sure your device and computer are on the same WiFi network
echo   2. Open the MindFlow app on your device
echo   3. Wait for the dev server to start below
echo.

echo Starting Expo development server...
echo.
cd /d "%~dp0"
npx expo start --dev-client

pause
