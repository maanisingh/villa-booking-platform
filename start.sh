#!/bin/bash

echo "========================================"
echo "🏖️  Villa Booking Platform Launcher"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${YELLOW}[1/5]${NC} Checking MongoDB..."
if ! pgrep -x mongod > /dev/null; then
    echo -e "${YELLOW}Starting MongoDB...${NC}"
    sudo systemctl start mongod 2>/dev/null || sudo service mongodb start 2>/dev/null || {
        echo -e "${RED}❌ MongoDB not found. Please install MongoDB first.${NC}"
        echo "Install MongoDB: https://www.mongodb.com/docs/manual/installation/"
        exit 1
    }
    sleep 3
fi
echo -e "${GREEN}✓ MongoDB is running${NC}"

# Check backend dependencies
echo -e "${YELLOW}[2/5]${NC} Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi
echo -e "${GREEN}✓ Backend dependencies ready${NC}"

# Check frontend dependencies
echo -e "${YELLOW}[3/5]${NC} Checking frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi
echo -e "${GREEN}✓ Frontend dependencies ready${NC}"

# Start backend
echo -e "${YELLOW}[4/5]${NC} Starting backend server..."
cd ../backend
# Kill existing process if any
pkill -f "node.*Server.js" 2>/dev/null
# Start in background
nohup npm run dev > /tmp/villa-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:9000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start. Check logs: tail -f /tmp/villa-backend.log${NC}"
        exit 1
    fi
done

# Start frontend
echo -e "${YELLOW}[5/5]${NC} Starting frontend server..."
cd ../frontend
# Kill existing process if any
pkill -f "vite" 2>/dev/null
# Start in background
nohup npm run dev > /tmp/villa-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo "========================================"
echo -e "${GREEN}✅ Villa Booking Platform is running!${NC}"
echo "========================================"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:9000"
echo "📊 Health:   http://localhost:9000/api/health"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f /tmp/villa-backend.log"
echo "   Frontend: tail -f /tmp/villa-frontend.log"
echo ""
echo "⏹️  To stop: ./stop.sh"
echo "========================================"
