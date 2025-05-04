#!/bin/bash

# Exit on error
set -e

echo "================================================"
echo "          BUILDING BẾP NHÀ TRÂM WEBSITE         "
echo "================================================"

# Load environment variables if .env.local exists
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local"
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed. Skipping npm install."
fi

# Clean any previous builds
if [ -d ".next" ]; then
  echo "Cleaning previous build..."
  rm -rf .next
fi

# Run build
echo "Starting production build..."
NODE_ENV=production npm run build

echo "================================================"
echo "          BUILD COMPLETED SUCCESSFULLY!         "
echo "================================================"
echo ""
echo "To test the production build locally, run:"
echo "npm run start"