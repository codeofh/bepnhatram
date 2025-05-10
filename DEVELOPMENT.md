# Development Environment Setup

This document explains how the development environment is set up for the Bep Nha Tram project.

## Environment Configuration

The project uses different environment configurations for development and production:

- `.env.development` - Contains development-specific environment variables
- `.env.production` - Contains production-specific environment variables (not used in development)
- `.env.local` - Optional local overrides (not committed to version control)

## Starting Development Server

### On Linux/Mac:

```bash
./start-dev.sh
```

This script:
1. Loads environment variables from `.env.development` (or `.env.local` if available)
2. Sets `NODE_ENV=development`
3. Ignores production environment settings
4. Installs dependencies if needed
5. Starts the development server on port 12000

### On Windows:

```bash
start-dev.bat
```

This script performs the same operations as the Linux/Mac version but for Windows.

## Development with Firebase Emulators

To start the development server with Firebase emulators:

```bash
./start-dev.sh --with-emulators
```

Or on Windows:

```bash
start-dev.bat --with-emulators
```

## Notes

- The development server runs on the default Next.js port (3000) and is accessible at http://localhost:3000
- Firebase emulators can be enabled in development by setting `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` in `.env.development`