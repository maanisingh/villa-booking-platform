#!/bin/bash

# Villa Booking Platform - First-Time Setup Script
# Run this after cloning the repository

echo "🏝️  Villa Booking Platform - Backend Setup"
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

# Step 5: Check MongoDB
echo "5️⃣  Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed"
    echo "   Install MongoDB: https://www.mongodb.com/docs/manual/installation/"
else
    MONGO_VERSION=$(mongod --version | head -1)
    echo "✅ $MONGO_VERSION found"

    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB is installed but not running"
        echo "   Start it with: sudo systemctl start mongod"
    else
        echo "✅ MongoDB is running"

        # Seed database with test data
        echo ""
        echo "6️⃣  Seeding database with test data..."
        npm run seed
    fi
fi
echo ""

# Step 6: Auto-start option
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Complete!"
echo ""
echo "🚀 Ready to start the backend server!"
echo ""
read -p "Start the development server now? (Y/n) " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    # Auto-start
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Starting backend server..."
    echo "📍 Server will run on http://localhost:9000"
    echo "🔄 Using nodemon for auto-reload"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    npm run dev
else
    echo "📝 To start the server later, run:"
    echo "   ./start-dev.sh"
    echo "   OR"
    echo "   npm run dev"
    echo ""
    echo "📍 Server will run on http://localhost:9000"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
