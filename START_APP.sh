#!/bin/bash
# Civilization Sphere - Startup Script

echo "🌍 Starting Civilization Sphere..."
echo ""
echo "📊 Project: Геополітична Карта України"
echo "🎨 Design: Modern UI with Glassmorphism"
echo "⚡ Features: Maps, Timeline, Analytics, Filters"
echo ""

# Kill any existing server
pkill -f "python.*http.server" 2>/dev/null

# Start Python HTTP server
echo "🚀 Starting server on port 8000..."
python3 -m http.server 8000 --directory . > server.log 2>&1 &
SERVER_PID=$!

sleep 2

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ Server started successfully!"
    echo ""
    echo "🌐 Open in your browser:"
    echo "   http://localhost:8000"
    echo ""
    echo "📖 Features available:"
    echo "   • Interactive Leaflet.js map"
    echo "   • Timeline playback controls"
    echo "   • Advanced filtering system"
    echo "   • Real-time Chart.js analytics"
    echo "   • Dark/Light theme toggle"
    echo "   • CSV/JSON data export"
    echo "   • Mobile-responsive design"
    echo ""
    echo "ℹ️  Server PID: $SERVER_PID"
    echo "🛑 To stop: pkill -f 'python.*http.server'"
else
    echo "❌ Failed to start server"
    exit 1
fi
