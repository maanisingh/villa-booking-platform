#!/bin/bash

# Villa Booking Platform - Master Setup Script
# This sets up BOTH backend and frontend automatically

echo "🏝️  Villa Booking Platform - Complete Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will set up both backend and frontend for you!"
echo ""

# Step 1: Setup Backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 1: Setting up Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd backend

if [ ! -f setup.sh ]; then
    echo "❌ Backend setup.sh not found!"
    exit 1
fi

# Run backend setup without auto-starting
echo "Installing backend dependencies..."
npm install

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend .env file"
fi

echo "✅ Backend setup complete!"
echo ""

cd ..

# Step 2: Setup Frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 2: Setting up Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd frontend

if [ ! -f setup.sh ]; then
    echo "❌ Frontend setup.sh not found!"
    exit 1
fi

# Run frontend setup without auto-starting
echo "Installing frontend dependencies..."
npm install

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created frontend .env file"
fi

echo "✅ Frontend setup complete!"
echo ""

cd ..

# Step 3: Summary and next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Complete Setup Finished!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Backend: Dependencies installed, .env configured"
echo "✅ Frontend: Dependencies installed, .env configured"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1️⃣  Start Backend (in this terminal):"
echo "   cd backend && npm run dev"
echo ""
echo "2️⃣  Start Frontend (in a new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "Or use the quick start scripts:"
echo "   cd backend && ./start-dev.sh"
echo "   cd frontend && ./start-dev.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Would you like to start both servers now? (Y/n) " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "Starting backend in background..."
    cd backend
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID) - logs in backend.log"
    echo ""

    sleep 2

    cd ../frontend
    echo "Starting frontend..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Servers Running:"
    echo "   Backend:  http://localhost:9000"
    echo "   Frontend: http://localhost:5173"
    echo ""
    echo "Press Ctrl+C to stop frontend"
    echo "Backend will continue running in background"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Start frontend in foreground
    npm run dev

    # When frontend is stopped, ask about backend
    echo ""
    read -p "Stop backend too? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    else
        echo "ℹ️  Backend still running in background (PID: $BACKEND_PID)"
        echo "   To stop: kill $BACKEND_PID"
    fi
fi
