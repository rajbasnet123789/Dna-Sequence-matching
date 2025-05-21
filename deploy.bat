deploy.batdeploy.bat@echo off
echo ===== DNA Sequence Comparison Application Deployment =====
echo.
echo This script will deploy both the backend and frontend of your application.
echo.

echo 1. Deploying Backend to Heroku...
call deploy_backend.bat
if %errorlevel% neq 0 (
    echo Backend deployment failed. Please check the errors above.
    exit /b 1
)

echo.
echo 2. Deploying Frontend to Netlify...
call deploy_frontend.bat
if %errorlevel% neq 0 (
    echo Frontend deployment failed. Please check the errors above.
    exit /b 1
)

echo.
echo ===== Deployment Complete! =====
echo.
echo Your DNA Sequence Comparison Application is now deployed:
echo - Backend API: https://dna-sequence-api.herokuapp.com
echo - Frontend: Check the Netlify URL from the output above
echo.
echo Remember to update your frontend .env file with the correct backend URL if needed.
echo.
