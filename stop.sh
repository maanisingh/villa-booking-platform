#!/bin/bash

echo "========================================"
echo "⏹️  Stopping Villa Booking Platform"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop backend
echo -e "${YELLOW}Stopping backend...${NC}"
pkill -f "node.*Server.js" && echo -e "${GREEN}✓ Backend stopped${NC}" || echo "No backend process found"

# Stop frontend
echo -e "${YELLOW}Stopping frontend...${NC}"
pkill -f "vite" && echo -e "${GREEN}✓ Frontend stopped${NC}" || echo "No frontend process found"

echo "========================================"
echo -e "${GREEN}✅ All services stopped${NC}"
echo "========================================"
