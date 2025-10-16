#!/bin/bash

# Civilization Sphere App - Test Deployment Script
# This script sets up the testing environment and runs comprehensive tests

set -e  # Exit on any error

echo "🚀 Civilization Sphere App - Test Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update -qq

# Install required system packages
print_status "Installing system dependencies..."
sudo apt install -y python3 python3-pip wget curl unzip

# Install Google Chrome
print_status "Installing Google Chrome..."
if ! command -v google-chrome-stable &> /dev/null; then
    # Add Google Chrome repository
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
    sudo apt update -qq
    sudo apt install -y google-chrome-stable
    print_success "Google Chrome installed successfully"
else
    print_success "Google Chrome already installed"
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
pip3 install --user selenium webdriver-manager requests

# Verify installations
print_status "Verifying installations..."
python3 --version
google-chrome-stable --version
python3 -c "import selenium; print('Selenium version:', selenium.__version__)"

# Check if we're in the correct directory
if [ ! -f "index.html" ] || [ ! -f "app.js" ]; then
    print_error "Please run this script from the Civilization Sphere app directory"
    exit 1
fi

# Start the application server
print_status "Starting application server..."
if pgrep -f "python3 -m http.server 8000" > /dev/null; then
    print_warning "Server already running on port 8000"
    SERVER_PID=$(pgrep -f "python3 -m http.server 8000")
    print_status "Server PID: $SERVER_PID"
else
    nohup python3 -m http.server 8000 > server.log 2>&1 &
    SERVER_PID=$!
    print_success "Server started with PID: $SERVER_PID"
    sleep 3  # Give server time to start
fi

# Wait for server to be ready
print_status "Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        print_success "Server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Server failed to start after 30 seconds"
        exit 1
    fi
    sleep 1
done

# Run the test suite
print_status "Running comprehensive test suite..."
if [ -f "test_app.py" ]; then
    python3 test_app.py
    TEST_EXIT_CODE=$?
    
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        print_success "All tests passed! ✅"
    else
        print_error "Some tests failed! ❌"
        exit $TEST_EXIT_CODE
    fi
else
    print_error "Test script (test_app.py) not found!"
    exit 1
fi

# Generate test report
print_status "Generating test report..."
if [ -f "test_report.json" ]; then
    print_success "Test report generated: test_report.json"
    
    # Display summary
    echo ""
    echo "📊 Test Summary:"
    echo "================"
    python3 -c "
import json
with open('test_report.json', 'r') as f:
    data = json.load(f)
total = len(data)
passed = sum(1 for v in data.values() if v['status'] == 'PASS')
failed = total - passed
print(f'Total Tests: {total}')
print(f'Passed: {passed}')
print(f'Failed: {failed}')
print(f'Success Rate: {(passed/total)*100:.1f}%')
"
else
    print_warning "Test report not found"
fi

# Optional: Take screenshot
print_status "Taking application screenshot..."
if command -v google-chrome-stable &> /dev/null; then
    google-chrome-stable --headless --disable-gpu --screenshot=app_screenshot.png --window-size=1920,1080 http://localhost:8000 2>/dev/null || true
    if [ -f "app_screenshot.png" ]; then
        print_success "Screenshot saved: app_screenshot.png"
    else
        print_warning "Screenshot capture failed"
    fi
fi

# Display final status
echo ""
echo "🎉 Test Deployment Complete!"
echo "============================"
echo "✅ Server running on: http://localhost:8000"
echo "✅ Test results: test_report.json"
echo "✅ Server logs: server.log"
if [ -f "app_screenshot.png" ]; then
    echo "✅ Screenshot: app_screenshot.png"
fi

# Keep server running option
echo ""
read -p "Keep server running? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Server will continue running. Use 'pkill -f python3 -m http.server 8000' to stop it."
else
    print_status "Stopping server..."
    pkill -f "python3 -m http.server 8000" || true
    print_success "Server stopped"
fi

print_success "Deployment script completed successfully!"