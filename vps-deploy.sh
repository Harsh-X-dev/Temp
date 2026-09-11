#!/bin/bash
set -e

PROJECT_DIR="/Production/AstroVedansh/GemoStone_Frontend_WebApp"
echo "🚀 Starting VPS Deployment for gemostone.com..."

if [ -d "$PROJECT_DIR" ]; then
  cd "$PROJECT_DIR"
else
  echo "Error: Directory $PROJECT_DIR does not exist!"
  exit 1
fi

echo "1. Fetching latest code from GitHub..."
git fetch origin
BRANCH=$(git symbolic-ref --short HEAD || echo "Development")
git reset --hard "origin/$BRANCH"

echo "2. Installing dependencies..."
npm install --legacy-peer-deps

echo "3. Building production Next.js bundle..."
npm run build

echo "4. Restarting PM2 process..."
if pm2 list | grep -q "gemostone-frontend"; then
  pm2 restart gemostone-frontend
else
  PORT=3010 pm2 start npm --name "gemostone-frontend" -- start
  pm2 save
fi

echo "5. Reloading Nginx..."
sudo systemctl reload nginx

echo "=== ✅ VPS Deployment Complete for gemostone.com ==="
