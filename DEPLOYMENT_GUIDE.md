# 🚀 Deployment Guide - Civilization Sphere

## ✅ Ready for Production! No Additional Services Required!

Застосунок тепер може працювати на будь-якому хостингу **БЕЗ додаткових сервісів**!

---

## 📦 Versions Available

### 1. **Static HTML Version** (index.html)
- ✅ Працює на будь-якому web-сервері (Apache, Nginx, IIS)
- ✅ Дані вбудовані в `data.js`
- ✅ Не потребує PHP, Python, або інших backend технологій
- ✅ Може працювати навіть локально (file://)

### 2. **PHP Version** (index.php)
- ✅ Працює на будь-якому PHP хостингу
- ✅ Дані завантажуються server-side з `data/events.json`
- ✅ Не потребує додаткових PHP розширень
- ✅ Працює з PHP 5.4+

---

## 🎯 Quick Start

### Варіант A: Static HTML (Рекомендовано)

**1. Завантажте файли на хостинг:**
```
your-website.com/
├── index.html          # Головна сторінка
├── app.js              # Логіка застосунку
├── style.css           # Стилі
├── data.js             # Вбудовані дані (143KB)
└── data/
    └── events.json     # Опціонально (для бекапу)
```

**2. Відкрийте в браузері:**
```
https://your-website.com/index.html
```

**Готово!** Застосунок працює без жодних налаштувань!

---

### Варіант B: PHP Version

**1. Завантажте файли на PHP хостинг:**
```
your-website.com/
├── index.php           # PHP версія
├── app.js              # Логіка застосунку
├── style.css           # Стилі
└── data/
    └── events.json     # Дані (обов'язково!)
```

**2. Переконайтеся що PHP увімкнено:**
```bash
php -v  # Повинно показати версію PHP
```

**3. Відкрийте в браузері:**
```
https://your-website.com/index.php
```

або налаштуйте `.htaccess` для автоматичного редіректу:
```apache
DirectoryIndex index.php index.html
RewriteEngine On
RewriteRule ^$ index.php [L]
```

---

## 🌐 Deployment on Different Hosting Providers

### **Shared Hosting (cPanel, Plesk)**

1. Завантажте файли через FTP або File Manager
2. Розмістіть у папці `public_html/` або `www/`
3. Відкрийте: `https://your-domain.com/`

**Файли для завантаження:**
- ✅ `index.html` (або `index.php`)
- ✅ `app.js`
- ✅ `style.css`
- ✅ `data.js` (для HTML версії)
- ✅ `data/events.json` (для PHP версії)

---

### **GitHub Pages**

```bash
# 1. Створіть repo на GitHub
git init
git add index.html app.js style.css data.js
git commit -m "Deploy Civilization Sphere"
git branch -M main
git remote add origin https://github.com/yourusername/civilization-sphere.git
git push -u origin main

# 2. Увімкніть GitHub Pages в Settings → Pages
# 3. Виберіть branch: main, folder: / (root)
```

**URL:** `https://yourusername.github.io/civilization-sphere/`

---

### **Netlify**

```bash
# Метод 1: Drag & Drop
# 1. Перейдіть на https://netlify.com
# 2. Перетягніть папку з файлами
# 3. Готово!

# Метод 2: CLI
npm install -g netlify-cli
netlify deploy --prod
```

---

### **Vercel**

```bash
# 1. Встановіть Vercel CLI
npm install -g vercel

# 2. Deploy
cd /workspace
vercel --prod
```

---

### **Apache Server**

**`.htaccess` (опціонально):**
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType application/json "access plus 1 hour"
</IfModule>

# Default page
DirectoryIndex index.html index.php
```

---

### **Nginx**

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/civilization-sphere;
    index index.html index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    # PHP support (optional)
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

---

## 📋 Required Files

### Minimal Setup (Static HTML):
```
✅ index.html       (25 KB)
✅ app.js           (41 KB)
✅ style.css        (your existing file)
✅ data.js          (143 KB)
```

### PHP Setup:
```
✅ index.php        (25 KB)
✅ app.js           (41 KB)
✅ style.css        (your existing file)
✅ data/events.json (143 KB)
```

### External Dependencies (CDN):
- ✅ Leaflet.js (maps) - loaded from CDN
- ✅ Chart.js (analytics) - loaded from CDN
- ✅ Leaflet MarkerCluster - loaded from CDN

**No installation needed!** Everything loads from CDN automatically.

---

## 🔧 Configuration

### Update Data

**Static HTML version:**
```bash
# 1. Update data/events.json
# 2. Regenerate data.js:
node -e "
const fs = require('fs');
const events = JSON.parse(fs.readFileSync('data/events.json', 'utf8'));
const output = 'window.EVENTS_DATA = ' + JSON.stringify(events, null, 2) + ';';
fs.writeFileSync('data.js', output);
"
# 3. Upload new data.js to server
```

**PHP version:**
```bash
# Just update data/events.json
# PHP will automatically load the new data
```

---

## 🧪 Testing Locally

### Static HTML:
```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: PHP
php -S localhost:8000

# Option 3: Node.js
npx http-server -p 8000

# Then open: http://localhost:8000
```

### Direct File Access:
```bash
# Open directly in browser (works with data.js embedded):
file:///path/to/index.html
```

---

## 🚀 Performance Optimization

### 1. Enable Gzip Compression
Reduces data.js from 143KB to ~15KB!

**Apache (.htaccess):**
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE application/javascript
</IfModule>
```

**Nginx:**
```nginx
gzip on;
gzip_types application/javascript;
```

### 2. Enable Browser Caching
```apache
<IfModule mod_expires.c>
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3. Use CDN (Optional)
Upload `data.js`, `app.js`, `style.css` to CDN for faster loading.

---

## 🛡️ Security

### Recommended Headers (.htaccess):
```apache
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>
```

---

## 🐛 Troubleshooting

### Issue: "Loading data..." forever

**Solution 1: Check browser console (F12)**
- Look for errors
- Make sure `data.js` loads successfully

**Solution 2: Clear browser cache**
- Ctrl+Shift+R (Windows/Linux)
- Cmd+Shift+R (Mac)

**Solution 3: Verify files are uploaded**
```bash
# Check if files are accessible:
curl https://your-site.com/data.js
curl https://your-site.com/app.js
```

### Issue: Map not showing

**Solution 1: Check console for Leaflet errors**
- Make sure CDN is accessible
- Check internet connection

**Solution 2: Verify data has coordinates**
```javascript
// Open console and check:
console.log(window.EVENTS_DATA[0]);
// Should have lat/lng properties
```

### Issue: PHP version not working

**Solution 1: Check PHP is enabled**
```bash
php -v
```

**Solution 2: Check file permissions**
```bash
chmod 644 index.php
chmod 644 data/events.json
```

**Solution 3: Check PHP error log**
```bash
tail -f /var/log/php-error.log
```

---

## 📊 Data Format

The `events.json` file should have this structure:
```json
[
  {
    "id": "unique-id",
    "title": "Event title",
    "date": "2025-10-13T06:56:21.989Z",
    "region": "Ukraine",
    "category": "Geopolitics/News/Analysis",
    "channel_name": "Channel Name",
    "source_url": "https://...",
    "description": "Event description",
    "importance": 5,
    "lat": 48.3794,
    "lng": 31.1656
  }
]
```

If events don't have `lat/lng`, the app will automatically assign coordinates based on region.

---

## ✅ Checklist Before Deployment

- [ ] All files uploaded (`index.html`, `app.js`, `style.css`, `data.js`)
- [ ] Test in browser (should load in < 3 seconds)
- [ ] Check browser console for errors (F12)
- [ ] Test on mobile device
- [ ] Enable gzip compression for better performance
- [ ] Set up analytics (optional)
- [ ] Test all features:
  - [ ] Map displays correctly
  - [ ] Filters work
  - [ ] Timeline works
  - [ ] Charts display
  - [ ] Export works (CSV/JSON)

---

## 📞 Support

If you encounter issues:

1. **Check browser console** (F12 → Console)
2. **Clear cache** (Ctrl+Shift+R)
3. **Test with static HTML version** (simpler, fewer dependencies)
4. **Check file permissions** (should be readable)
5. **Verify CDN accessibility** (Leaflet, Chart.js)

---

## 🎉 Success!

Your Civilization Sphere app is now deployed and working without any additional services!

**Live URLs:**
- Static HTML: `https://your-domain.com/index.html`
- PHP version: `https://your-domain.com/index.php`

Both versions work identically - choose based on your hosting capabilities!

---

**Version:** 2.0 (Self-Contained)  
**Last Updated:** 2025-10-27  
**Status:** ✅ Production Ready
