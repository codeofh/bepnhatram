@echo off

REM Check if .env.local exists and load it
if exist .env.local (
  echo Loading environment variables...
  for /F "tokens=*" %%i in (.env.local) do set %%i
)

REM Install dependencies if needed
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

REM Start the development server
echo Starting development server...
if "%1"=="--with-emulators" (
  call npm run dev:with-emulators
) else (
  call npm run dev:windows
)