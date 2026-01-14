#!/bin/bash

# Research Hub - Deployment Script
# This script builds and prepares the app for GitHub Pages deployment

echo "🚀 Building Research Hub for production..."

# Build the project
npm run build

echo "✅ Build complete!"
echo ""
echo "📦 Production files are in the 'dist/' directory"
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Commit your changes: git add . && git commit -m 'Build for deployment'"
echo "2. Push to main: git push origin main"
echo "3. Deploy dist folder to gh-pages branch"
echo ""
echo "Or use gh-pages package:"
echo "  npm install --save-dev gh-pages"
echo "  npx gh-pages -d dist"
echo ""
echo "🌟 Your app is ready for deployment!"
