#!/bin/bash

# Local Lighthouse Testing Script
# Runs the same Lighthouse audit as the GitHub Actions workflow

set -e

echo "🔍 Starting Local Lighthouse Testing..."

# Step 1: Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Step 2: Build application
echo "🏗️ Building application..."
npm run build

# Step 3: Start local server
echo "🚀 Starting Vite preview server..."
npm run preview &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
for i in {1..30}; do
    if curl -f http://localhost:4173 > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    echo "⏳ Attempt $i/30: Server not ready yet, waiting..."
    sleep 2
done

# Final check
if ! curl -f http://localhost:4173 > /dev/null 2>&1; then
    echo "❌ Server failed to start after 60 seconds"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Step 4: Install and run Lighthouse CI
echo "🔍 Installing Lighthouse CI..."
npm install -g @lhci/cli

echo "🔍 Running Lighthouse audit..."
lhci autorun

echo ""
echo "📊 Lighthouse audit completed!"
echo "📁 Results saved in .lighthouseci/ directory"

# Parse and display results if available
if [ -d ".lighthouseci" ]; then
    REPORT_FILE=$(find .lighthouseci -name "*.json" | head -1)
    if [ -f "$REPORT_FILE" ]; then
        echo ""
        echo "📊 Quick Results Summary:"
        
        if command -v jq &> /dev/null; then
            PERFORMANCE=$(cat "$REPORT_FILE" | jq '.categories.performance.score * 100')
            ACCESSIBILITY=$(cat "$REPORT_FILE" | jq '.categories.accessibility.score * 100')
            BEST_PRACTICES=$(cat "$REPORT_FILE" | jq '.categories["best-practices"].score * 100')
            SEO=$(cat "$REPORT_FILE" | jq '.categories.seo.score * 100')
            
            echo "| Category | Score | Status |"
            echo "|----------|-------|--------|"
            echo "| Performance | ${PERFORMANCE}% | $([ $(echo "$PERFORMANCE >= 80" | bc -l) -eq 1 ] && echo "✅" || echo "❌") |"
            echo "| Accessibility | ${ACCESSIBILITY}% | $([ $(echo "$ACCESSIBILITY >= 90" | bc -l) -eq 1 ] && echo "✅" || echo "❌") |"
            echo "| Best Practices | ${BEST_PRACTICES}% | $([ $(echo "$BEST_PRACTICES >= 90" | bc -l) -eq 1 ] && echo "✅" || echo "❌") |"
            echo "| SEO | ${SEO}% | $([ $(echo "$SEO >= 90" | bc -l) -eq 1 ] && echo "✅" || echo "❌") |"
        else
            echo "⚠️ jq not installed - install with: sudo apt-get install jq (Ubuntu) or brew install jq (Mac)"
            echo "📁 Full report available in: $REPORT_FILE"
        fi
    fi
fi

echo ""
echo "🎯 Performance Testing Complete!"
echo "🌐 Server running at http://localhost:4173"
echo "💡 Press Ctrl+C to stop the server when done"

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    kill $SERVER_PID 2>/dev/null || true
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT

# Keep the server running
wait $SERVER_PID