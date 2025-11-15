#!/bin/bash

# Villa Booking Platform - Frontend Quick Start Script
# This script starts the frontend development server

echo "🏝️  Villa Booking Platform - Starting Frontend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Check backend connection
echo "🔌 Checking backend connection..."
BACKEND_URL=$(grep VITE_API_URL .env | cut -d '=' -f2)

if [[ $BACKEND_URL == *"localhost"* ]]; then
    PORT=$(echo $BACKEND_URL | grep -oP '(?<=:)\d+')
    if [ ! -z "$PORT" ]; then
        if ! nc -z localhost $PORT 2>/dev/null; then
            echo "⚠️  Backend is not running on port $PORT"
            echo "💡 Start backend first: cd ../backend && ./start-dev.sh"
            echo ""
            read -p "Continue anyway? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        else
            echo "✅ Backend is running on port $PORT"
        fi
    fi
fi

# Start the frontend
echo ""
echo "🚀 Starting frontend development server..."
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend: $BACKEND_URL"
echo "🔄 Using Vite for instant hot-reload"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
