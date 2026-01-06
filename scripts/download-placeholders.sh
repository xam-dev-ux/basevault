#!/bin/bash

# BaseVault - Download Placeholder Images
# This script downloads placeholder images for quick testing

echo "🎨 BaseVault - Downloading Placeholder Images"
echo "=============================================="

cd "$(dirname "$0")/../frontend/public" || exit 1

echo ""
echo "📁 Creating directories..."
mkdir -p screenshots

echo ""
echo "⬇️  Downloading images..."

# Logo (512x512)
echo "  • logo.png (512x512)"
curl -s -o logo.png "https://placehold.co/512x512/0052FF/FFFFFF?text=BV&font=roboto"

# Splash (1080x1920)
echo "  • splash.png (1080x1920)"
curl -s -o splash.png "https://placehold.co/1080x1920/0A0B0D/FFFFFF?text=BaseVault&font=roboto"

# Embed (1200x630)
echo "  • embed.png (1200x630)"
curl -s -o embed.png "https://placehold.co/1200x630/0052FF/FFFFFF?text=BaseVault&font=roboto"

# Hero (1200x630)
echo "  • hero.png (1200x630)"
curl -s -o hero.png "https://placehold.co/1200x630/0041CC/FFFFFF?text=BaseVault&font=roboto"

# Screenshots (750x1334)
echo "  • screenshots/1.png (750x1334)"
curl -s -o screenshots/1.png "https://placehold.co/750x1334/111214/E5E7EB?text=Vault+List&font=roboto"

echo "  • screenshots/2.png (750x1334)"
curl -s -o screenshots/2.png "https://placehold.co/750x1334/111214/E5E7EB?text=Vault+Detail&font=roboto"

echo "  • screenshots/3.png (750x1334)"
curl -s -o screenshots/3.png "https://placehold.co/750x1334/111214/E5E7EB?text=Proposals&font=roboto"

echo ""
echo "✅ All placeholder images downloaded!"
echo ""
echo "📍 Location: frontend/public/"
echo ""
echo "⚠️  IMPORTANT: These are placeholders for testing only."
echo "   Replace with professional images before production launch."
echo "   See IMAGE_GENERATION_GUIDE.md for details."
echo ""
echo "🚀 You can now run: npm run frontend:dev"
echo ""
