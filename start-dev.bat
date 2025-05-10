@echo off

REM Load environment variables for development
if exist .env.development (
  echo Loading development environment variables...
  for /F "usebackq tokens=1,2 delims==" %%G in (".env.development") do (
    set "%%G=%%H"
  )
) else if exist .env.local (
  echo Loading local environment variables...
  for /F "usebackq tokens=1,2 delims==" %%G in (".env.local") do (
    set "%%G=%%H"
  )
)

REM Explicitly set NODE_ENV to development
set NODE_ENV=development

REM Ensure we're not using production environment
if exist .env.production (
  echo Ignoring production environment for development...
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
  call npm run dev
)