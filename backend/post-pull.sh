#!/bin/bash

# Villa Booking Platform - Post-Pull Hook
# This script runs automatically after git pull to update dependencies and restart server

echo "🔄 Post-pull updates..."

# Check if package.json was modified
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
    echo "📦 package.json changed - updating dependencies..."
    npm install
    echo "✅ Dependencies updated"
fi

# Check if .env.example was modified
if git diff HEAD@{1} --name-only | grep -q ".env.example"; then
    echo "⚙️  .env.example changed"
    if [ ! -f .env ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo "✅ Created .env file"
    else
        echo "ℹ️  .env already exists - please check .env.example for new variables"
    fi
fi

# Check if server is running in PM2
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "villa-backend"; then
        echo "🔄 Restarting PM2 process..."
        pm2 restart villa-backend
        echo "✅ Server restarted"
    fi
fi

echo "✅ Post-pull updates complete!"
