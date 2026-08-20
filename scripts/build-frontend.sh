#!/bin/bash

# Build frontend for production and copy to server directory

set -e

echo "Building frontend for production..."

# Set API URL
export VITE_API_URL=${VITE_API_URL:-"https://api.yourdomain.com/api/v1"}

# Install dependencies
npm install

# Build
npm run build

echo "Build complete! Output in ./dist"
