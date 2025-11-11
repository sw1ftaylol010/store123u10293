#!/bin/bash

# 🚀 Lonieve Gift - Automated Server Setup Script
# This script will install everything needed and deploy the project

set -e  # Exit on error

echo "🎯 Starting Lonieve Gift deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update system
echo -e "${BLUE}📦 Step 1/8: Updating system packages...${NC}"
sudo apt-get update -qq

# Step 2: Install Node.js 20.x
echo -e "${BLUE}📦 Step 2/8: Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"

# Step 3: Install Git if needed
echo -e "${BLUE}📦 Step 3/8: Checking Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Git installed${NC}"

# Step 4: Create project directory
echo -e "${BLUE}📂 Step 4/8: Creating project directory...${NC}"
mkdir -p ~/lonieve-gift
cd ~/lonieve-gift
echo -e "${GREEN}✅ Directory created: ~/lonieve-gift${NC}"

# Step 5: We'll upload files manually (skip for now)
echo -e "${BLUE}📤 Step 5/8: Ready for file upload...${NC}"
echo -e "${YELLOW}⏸️  Files will be uploaded in the next step${NC}"

# Step 6: Install PM2 for process management
echo -e "${BLUE}📦 Step 6/8: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2 > /dev/null 2>&1
fi
echo -e "${GREEN}✅ PM2 installed${NC}"

# Step 7: Setup firewall for port 3000
echo -e "${BLUE}🔥 Step 7/8: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 3000/tcp > /dev/null 2>&1 || true
fi
echo -e "${GREEN}✅ Port 3000 opened${NC}"

# Step 8: Install dependencies (will run after files are uploaded)
echo -e "${BLUE}📦 Step 8/8: Ready for npm install...${NC}"
echo -e "${YELLOW}⏸️  Will run after project files are uploaded${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Server setup complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 System Info:${NC}"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Working directory: $(pwd)"
echo "  IP Address: $(curl -s ifconfig.me)"
echo ""
echo -e "${YELLOW}🎯 Next steps:${NC}"
echo "  1. Upload project files to ~/lonieve-gift/"
echo "  2. Run: cd ~/lonieve-gift && npm install"
echo "  3. Run: npm run dev"
echo "  4. Access: http://$(curl -s ifconfig.me):3000"
echo ""

