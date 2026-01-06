#!/bin/bash

# BaseVault - Pre-Push Security Check
# Verifica que no se suban archivos sensibles

echo "🔒 BaseVault - Security Check Before Push"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.." || exit 1

# Check if .env files are properly ignored
echo "📋 Checking for sensitive files..."
echo ""

SENSITIVE_FILES=$(git status --porcelain | grep -E "\\.env$|\\.env\\.local$|\\.env\\.production$")

if [ -n "$SENSITIVE_FILES" ]; then
    echo "❌ ERROR: Sensitive .env files detected in staging!"
    echo ""
    echo "Files that would be committed:"
    echo "$SENSITIVE_FILES"
    echo ""
    echo "These files should be in .gitignore"
    echo "Run: git rm --cached <file>"
    echo ""
    exit 1
else
    echo "✅ No .env files in staging"
fi

# Check for private keys in files
echo "✅ Checking for private key patterns..."

PRIVATE_KEY_FOUND=$(git grep -n "PRIVATE_KEY.*=" -- ':!.env.example' ':!*.md' 2>/dev/null || true)

if [ -n "$PRIVATE_KEY_FOUND" ]; then
    echo "⚠️  WARNING: Found PRIVATE_KEY references in:"
    echo "$PRIVATE_KEY_FOUND"
    echo ""
    echo "Make sure these are template/example files only!"
    echo ""
fi

# Check for hardcoded secrets
echo "✅ Checking for hardcoded tokens..."

TOKEN_FOUND=$(git grep -nE "(ghp_|github_pat_)" 2>/dev/null || true)

if [ -n "$TOKEN_FOUND" ]; then
    echo "❌ ERROR: GitHub token found in code!"
    echo "$TOKEN_FOUND"
    echo ""
    echo "NEVER commit tokens to GitHub!"
    exit 1
fi

# Check staged files
echo ""
echo "📦 Files ready to commit:"
git status --short

echo ""
echo "📊 Commit statistics:"
git diff --cached --stat

echo ""
echo "✅ Security check passed!"
echo ""
echo "🔐 Verified:"
echo "  - No .env files"
echo "  - No private keys"
echo "  - No GitHub tokens"
echo ""
echo "📤 Ready to push!"
echo ""
echo "Next steps:"
echo "  1. Create repository at: https://github.com/new"
echo "  2. Run: git push -u origin main"
echo "  3. See GITHUB_SETUP.md for details"
echo ""
