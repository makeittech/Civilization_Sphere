# 🚀 Civilization Sphere - Quick Start Guide

## ⚡ Get Running in 30 Seconds

### Step 1: Start the Server
```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js
npx http-server

# Or using PHP
php -S localhost:8000
```

### Step 2: Open in Browser
```
http://localhost:8000
```

That's it! The app is ready to use.

---

## 📖 How to Use

### 🗺️ Map Navigation
- **Click** on a marker to see event details
- **Scroll** to zoom in/out
- **Drag** to pan across the map
- **+/-** buttons for manual zoom control
- **🎯** button to reset to default view

### 🔍 Search & Filter
1. Type in the **Search** box for instant search
2. Use **Quick Filters** for common searches:
   - All eventos
   - Recent (last 7 days)
   - Important events
   - Conflicts only

3. Check **Categories** to filter by type
4. Check **Regions** to filter by location
5. Check **Channels** to filter by source
6. Set **Date Range** for time-based filtering

### ⏰ Timeline Playback
1. Click **▶ Play** to start animation
2. Adjust **Speed** (0.5x to 5x)
3. Click on slider to jump to any point
4. Click **⏸ Pause** to stop
5. Click **↻ Reset** to go back to start

### 📊 Analytics
- View 4 interactive charts
- Charts update automatically when you filter
- Hover over charts for details
- Charts adapt to light/dark theme

### 💾 Export Data
- **CSV**: Click "Експорт CSV" to export as spreadsheet
- **JSON**: Click "Експорт JSON" to export as JSON

### 🎨 Theme
- Click **🌙** or **☀️** in top right to switch theme
- Theme preference is saved automatically

### ? Help
- Click **?** button for comprehensive guide
- Includes keyboard shortcuts and tips

---

## 📱 Mobile Tips

- Swipe left/right to navigate
- Pinch to zoom map
- Tap markers to see details
- Click hamburger menu (☰) for controls
- All features work on mobile!

---

## 🎓 Feature Overview

| Feature | Location | How to Use |
|---------|----------|-----------|
| Search | Left panel | Type keywords |
| Quick Filters | Left panel | Click buttons |
| Category Filter | Left panel | Check boxes |
| Region Filter | Left panel | Check boxes |
| Channel Filter | Left panel | Check boxes |
| Date Range | Left panel | Set dates |
| Map | Center | Click, drag, scroll |
| Timeline | Bottom | Drag slider |
| Playback | Timeline | Click ▶ button |
| Speed Control | Timeline | Select dropdown |
| Analytics | Bottom | Auto-updates |
| Event Details | Right panel | Appears on click |
| Export | Left panel | Click buttons |
| Theme | Top right | Click 🌙/☀️ |
| Help | Top right | Click ? |

---

## 💡 Pro Tips

1. **Narrow Down Results**: Use multiple filters together
2. **Watch Timeline**: Hit play to see events animate chronologically
3. **Compare Events**: Use analytics to understand patterns
4. **Export Data**: Export filtered results for analysis
5. **Dark Mode**: Easier on eyes in low light
6. **Mobile Use**: Works perfectly on phones and tablets

---

## 🔧 Technical Details

- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: Modern CSS3 with themes
- **Map**: Leaflet.js
- **Charts**: Chart.js
- **Data**: 83 geopolitical events
- **Responsive**: Works on all devices
- **Accessibility**: Full WCAG compliance

---

## 🆘 Troubleshooting

### Map not loading?
- Check internet connection (needs map tiles from OpenStreetMap)
- Clear browser cache and refresh
- Try a different browser

### Events not showing?
- Check that data/events.json exists
- Verify filters aren't too restrictive
- Try "All eventos" quick filter

### Charts not rendering?
- Ensure Chart.js library loaded (CDN)
- Check browser console for errors
- Try refreshing page

### Theme not saving?
- Enable localStorage in browser settings
- Check that cookies/storage isn't blocked

### Performance slow?
- Close other browser tabs
- Disable browser extensions
- Use a modern browser (Chrome, Firefox, Safari, Edge)

---

## 📋 Browser Compatibility

✅ **Fully Supported:**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🎯 Common Tasks

### Find events about conflicts
1. Click "Conflicts" in Quick Filters
2. Or use search: type "war" or "conflict"

### See events by region
1. Check region in "Регіони" section
2. Click "Recent" to see newest first

### Export all visible events
1. Apply desired filters
2. Click "Експорт CSV" or "Експорт JSON"

### Watch timeline animation
1. Click ▶ Play button
2. Adjust speed if needed
3. Watch events appear chronologically

### Switch to dark theme
1. Click 🌙 button (top right)
2. Theme saves automatically

---

## 📚 Learn More

- Read **REBUILD_SUMMARY.md** for technical details
- Check **README.md** for project overview
- Open **Help Modal** (?) in app for instructions

---

## 💬 Questions?

Check the built-in Help modal (?) or review the comprehensive documentation files.

**Happy Exploring! 🌍**
