#!/bin/bash

# Exit on error
set -e

# Load environment variables for development only
if [ -f .env.development ]; then
  echo "Loading development environment variables..."
  set -a
  source .env.development
  set +a
elif [ -f .env.local ]; then
  echo "Loading local environment variables..."
  set -a
  source .env.local
  set +a
fi

# Explicitly set NODE_ENV to development
export NODE_ENV=development

# Ensure we're not using production environment
if [ -f .env.production ]; then
  echo "Ignoring production environment for development..."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the development server
echo "Starting development server..."
if [ "$1" == "--with-emulators" ]; then
  npm run dev:with-emulators
else
  npm run dev
fi