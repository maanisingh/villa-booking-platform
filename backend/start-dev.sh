#!/bin/bash

# Villa Booking Platform - Quick Development Start Script
# This script starts the backend server for local development

echo "🏝️  Villa Booking Platform - Starting Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚙️  Please edit .env with your configuration before continuing"
    echo ""
    read -p "Press Enter to continue with default settings or Ctrl+C to exit and edit .env..."
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running"
    echo "💡 Start MongoDB with: sudo systemctl start mongod"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start the server
echo ""
echo "🚀 Starting backend server..."
echo "📍 Server will run on http://localhost:9000"
echo "🔄 Using nodemon for auto-reload on file changes"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
