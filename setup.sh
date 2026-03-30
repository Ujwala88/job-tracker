#!/bin/bash
set -e

echo ""
echo "=========================================="
echo "  Job Tracker — First-time Setup"
echo "=========================================="
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Install it from https://nodejs.org (choose the LTS version)"
  exit 1
fi

echo "Node.js: $(node --version)"
echo "npm:     $(npm --version)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "Setting up database..."
npx prisma db push

echo ""
echo "Adding sample data..."
npm run db:seed

echo ""
echo "=========================================="
echo "  Setup complete!"
echo ""
echo "  To start the app:"
echo "    npm run dev"
echo ""
echo "  Then open: http://localhost:3000"
echo "=========================================="
echo ""
