#!/bin/bash

echo "🚀 Starting Kiosk Marketplace DApp..."

# Check if bun is available
if command -v bun &> /dev/null; then
    echo "📦 Installing dependencies with bun..."
    bun install
    echo "🔥 Starting development server..."
    bun dev
else
    echo "📦 Installing dependencies with npm..."
    npm install
    echo "🔥 Starting development server..."
    npm run dev
fi
