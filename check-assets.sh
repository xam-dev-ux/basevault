#!/bin/bash

# Script to check if all required assets exist for Base App indexing

echo "🔍 Checking BaseVault Assets for Base App Indexing..."
echo "=================================================="
echo ""

BASE_URL="https://basevault-woad.vercel.app"

# Function to check URL
check_url() {
    local url=$1
    local name=$2

    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$status" = "200" ]; then
        echo "✅ $name - FOUND ($status)"
        return 0
    else
        echo "❌ $name - NOT FOUND ($status)"
        return 1
    fi
}

echo "📋 Checking Manifest..."
check_url "$BASE_URL/.well-known/farcaster.json" "Manifest"
echo ""

echo "🖼️ Checking Visual Assets..."
check_url "$BASE_URL/icon-1024.png" "App Icon (1024x1024)"
check_url "$BASE_URL/cover-1200x630.png" "Cover Photo (1200x630)"
check_url "$BASE_URL/splash.png" "Splash Image (optional)"
echo ""

echo "📸 Checking Screenshots..."
check_url "$BASE_URL/screenshots/screenshot-1.png" "Screenshot 1"
check_url "$BASE_URL/screenshots/screenshot-2.png" "Screenshot 2"
check_url "$BASE_URL/screenshots/screenshot-3.png" "Screenshot 3"
echo ""

echo "=================================================="
echo "📝 Summary:"
echo ""
echo "Next steps:"
echo "1. Create missing assets (see BASE_APP_INDEXING_CHECKLIST.md)"
echo "2. Deploy to Vercel"
echo "3. Run this script again to verify"
echo "4. Share URL on Base App/Warpcast to trigger indexing"
echo ""
echo "Your app URL: $BASE_URL"
echo "=================================================="
