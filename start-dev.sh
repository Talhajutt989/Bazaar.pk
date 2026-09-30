#!/usr/bin/env bash

# Bazaar.pk - Localhost Auto-Startup Launcher for Mac / Linux
set -e

echo "================================================================"
echo "          Bazaar.pk - Localhost Auto-Startup Launcher"
echo "================================================================"
echo ""

# STEP 1: Check and Start PostgreSQL / Docker Services
echo "[1/5] Checking Local Database Services..."

# Check brew services (macOS)
if command -v brew &> /dev/null; then
    if brew services list 2>/dev/null | grep -q "postgresql.*started"; then
        echo " [OK] PostgreSQL (Homebrew) is already running."
    elif brew services list 2>/dev/null | grep -q "postgresql"; then
        echo " [*] Starting PostgreSQL via brew services..."
        brew services start postgresql || true
    fi
fi

# Check systemctl (Linux)
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet postgresql; then
        echo " [OK] PostgreSQL (systemd) is running."
    elif systemctl list-unit-files | grep -q postgresql; then
        echo " [*] Attempting to start PostgreSQL service..."
        sudo systemctl start postgresql || true
    fi
fi

# Check Docker if compose is used
if command -v docker &> /dev/null; then
    if [ -f "docker-compose.yml" ] || [ -f "compose.yaml" ]; then
        echo " [*] Starting Docker compose services..."
        docker compose up -d || true
    fi
fi

# STEP 2: Run Database Connection Preflight Verification
echo ""
echo "[2/5] Verifying Database Connection and Schema..."
node scripts/preflight.js || true

# STEP 3: Sync Prisma Client
echo ""
echo "[3/5] Syncing Prisma Client (npx prisma generate)..."
npx prisma generate || echo "[!] Prisma generate warning, continuing..."

# STEP 4: Auto-Launch Browser
echo ""
echo "[4/5] Scheduling Browser Launch (http://localhost:3000)..."
(
    max=30
    i=0
    while [ $i -lt $max ]; do
        sleep 1
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -qE "200|304|500"; then
            if command -v open &> /dev/null; then
                open "http://localhost:3000"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "http://localhost:3000"
            fi
            break
        fi
        i=$((i + 1))
    done
) &

# STEP 5: Start Next.js Development Server
echo ""
echo "[5/5] Starting Next.js Development Server on http://localhost:3000..."
echo "================================================================"
echo "Press Ctrl+C in this terminal to stop the server."
echo "================================================================"
echo ""

npm run dev
