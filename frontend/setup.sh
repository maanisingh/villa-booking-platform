#!/bin/bash

# Villa Booking Platform - Frontend Setup Script
# Run this after cloning the repository

echo "🏝️  Villa Booking Platform - Frontend Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check Node.js
echo "1️⃣  Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Step 2: Check npm
echo "2️⃣  Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION found"
echo ""

# Step 3: Install dependencies
echo "3️⃣  Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Step 4: Setup environment file
echo "4️⃣  Setting up environment configuration..."
if [ -f .env ]; then
    echo "⚠️  .env file already exists"
    read -p "   Overwrite with .env.example? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env
        echo "✅ .env file updated from .env.example"
    else
        echo "ℹ️  Keeping existing .env file"
    fi
else
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
fi
echo ""

# Step 5: Check backend connection
echo "5️⃣  Checking backend connection..."
BACKEND_URL=$(grep VITE_API_URL .env | cut -d '=' -f2)
echo "   Backend URL: $BACKEND_URL"

# Extract host and port for testing
if [[ $BACKEND_URL == *"localhost"* ]]; then
    # Extract port from localhost URL
    PORT=$(echo $BACKEND_URL | grep -oP '(?<=:)\d+')
    if [ ! -z "$PORT" ]; then
        if nc -z localhost $PORT 2>/dev/null; then
            echo "✅ Backend is running on port $PORT"
        else
            echo "⚠️  Backend is not running on port $PORT"
            echo "   Please start the backend first:"
            echo "   cd ../backend && ./start-dev.sh"
        fi
    fi
fi
echo ""

# Step 6: Auto-start option
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Frontend Setup Complete!"
echo ""
echo "🚀 Ready to start the development server!"
echo ""
read -p "Start the frontend development server now? (Y/n) " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    # Auto-start
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Starting frontend development server..."
    echo "📍 Server will run on http://localhost:5173"
    echo "🔄 Using Vite for hot-reload"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    npm run dev
else
    echo "📝 To start the server later, run:"
    echo "   npm run dev"
    echo ""
    echo "📍 Frontend will run on http://localhost:5173"
    echo "📍 Backend should run on http://localhost:9000"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
