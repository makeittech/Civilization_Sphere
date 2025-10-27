#!/bin/bash
# Civilization Sphere - Startup & Diagnostic Script

clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🌍 CIVILIZATION SPHERE - Startup & Diagnostics        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "1️⃣  Перевірка файлів..."
echo "───────────────────────────────────────────────────────────"

# Check data file
if [ -f "data/events.json" ]; then
    EVENT_COUNT=$(node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('data/events.json', 'utf8')); console.log(data.length);" 2>/dev/null)
    print_status 0 "data/events.json існує ($EVENT_COUNT подій)"
else
    print_status 1 "data/events.json не знайдено!"
    exit 1
fi

# Check main files
[ -f "index.html" ] && print_status 0 "index.html" || print_status 1 "index.html відсутній"
[ -f "app.js" ] && print_status 0 "app.js" || print_status 1 "app.js відсутній"
[ -f "style.css" ] && print_status 0 "style.css" || print_status 1 "style.css відсутній"

echo ""
echo "2️⃣  Перевірка серверу..."
echo "───────────────────────────────────────────────────────────"

# Kill existing server
pkill -f "python.*http.server" 2>/dev/null
print_info "Зупинено попередні сервери"
sleep 1

# Start new server
nohup python3 -m http.server 8000 > server.log 2>&1 &
SERVER_PID=$!
sleep 2

# Check if server is running
if ps -p $SERVER_PID > /dev/null 2>&1; then
    print_status 0 "Сервер запущено (PID: $SERVER_PID)"
else
    print_status 1 "Не вдалося запустити сервер"
    exit 1
fi

# Test server response
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null)
if [ "$HTTP_STATUS" = "200" ]; then
    print_status 0 "Сервер відповідає (HTTP $HTTP_STATUS)"
else
    print_status 1 "Сервер не відповідає (HTTP $HTTP_STATUS)"
fi

# Test data file accessibility
HTTP_DATA=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/data/events.json 2>/dev/null)
if [ "$HTTP_DATA" = "200" ]; then
    print_status 0 "Файл даних доступний (HTTP $HTTP_DATA)"
else
    print_status 1 "Файл даних недоступний (HTTP $HTTP_DATA)"
fi

echo ""
echo "3️⃣  Перевірка залежностей..."
echo "───────────────────────────────────────────────────────────"

# Test external libraries
LEAFLET_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://unpkg.com/leaflet@1.9.4/dist/leaflet.js)
if [ "$LEAFLET_TEST" = "200" ]; then
    print_status 0 "Leaflet.js доступний"
else
    print_warning "Leaflet.js може бути недоступний (CDN: $LEAFLET_TEST)"
fi

CHART_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js)
if [ "$CHART_TEST" = "200" ]; then
    print_status 0 "Chart.js доступний"
else
    print_warning "Chart.js може бути недоступний (CDN: $CHART_TEST)"
fi

echo ""
echo "4️⃣  Тестування JavaScript..."
echo "───────────────────────────────────────────────────────────"

# Check JS syntax
node -c app.js 2>/dev/null
print_status $? "Синтаксис app.js"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✓ ВСЕ ГОТОВО!                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🌐 Відкрийте у браузері:${NC}"
echo -e "   ${BLUE}http://localhost:8000${NC}"
echo ""
echo -e "${GREEN}🧪 Тестова сторінка:${NC}"
echo -e "   ${BLUE}http://localhost:8000/test_loading.html${NC}"
echo ""
echo -e "${YELLOW}📝 Корисні команди:${NC}"
echo "   - Переглянути лог сервера:  tail -f server.log"
echo "   - Зупинити сервер:          pkill -f 'python.*http.server'"
echo "   - Повторити діагностику:    bash start_and_test.sh"
echo ""
echo -e "${YELLOW}🐛 Якщо проблема з завантаженням:${NC}"
echo "   1. Відкрийте консоль браузера (F12)"
echo "   2. Перейдіть на вкладку Console"
echo "   3. Оновіть сторінку (Ctrl+R або Cmd+R)"
echo "   4. Перевірте помилки в консолі"
echo ""
echo -e "${BLUE}Server PID:${NC} $SERVER_PID"
echo ""
