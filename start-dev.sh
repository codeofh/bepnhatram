#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
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