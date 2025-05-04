@echo off
echo ================================================
echo          BUILDING BEP NHA TRAM WEBSITE         
echo ================================================

REM Load environment variables if .env.local exists
if exist .env.local (
  echo Loading environment variables from .env.local
  for /F "tokens=*" %%i in (.env.local) do set %%i
)

REM Install dependencies if needed
if not exist node_modules (
  echo Installing dependencies...
  call npm install
) else (
  echo Dependencies already installed. Skipping npm install.
)

REM Clean any previous builds
if exist .next (
  echo Cleaning previous build...
  rmdir /s /q .next
)

REM Run build
echo Starting production build...
set NODE_ENV=production
call npm run build

echo ================================================
echo          BUILD COMPLETED SUCCESSFULLY!         
echo ================================================
echo.
echo To test the production build locally, run:
echo npm run start