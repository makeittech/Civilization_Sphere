(function () {
  'use strict';

  const DB_NAME = 'GeopoliticalDB';
  const DB_VERSION = 1;
  const STORE_RESOURCES = 'resources';
  const STORE_CATEGORIES = 'categories';
  const STORE_USERS = 'users';
  const STORE_SETTINGS = 'settings';
  const STORE_NOTIFICATIONS = 'notifications';

  const CHANNEL_NAME = 'geopolitical-dashboard';

  const defaultRoles = {
    viewer: { canEdit: false, canApprove: false },
    contributor: { canEdit: true, canApprove: false },
    editor: { canEdit: true, canApprove: true },
    admin: { canEdit: true, canApprove: true }
  };

  let dbInstance = null;
  let currentUser = { username: 'guest', role: 'viewer' };
  let broadcast = null;

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;

        if (!db.objectStoreNames.contains(STORE_RESOURCES)) {
          const store = db.createObjectStore(STORE_RESOURCES, { keyPath: 'id' });
          store.createIndex('by_status', 'status', { unique: false });
          store.createIndex('by_date', 'date', { unique: false });
          store.createIndex('by_category', 'category', { unique: false });
          store.createIndex('by_source', 'source', { unique: false });
          store.createIndex('by_hash', 'hash', { unique: true });
        }

        if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
          db.createObjectStore(STORE_CATEGORIES, { keyPath: 'name' });
        }

        if (!db.objectStoreNames.contains(STORE_USERS)) {
          const users = db.createObjectStore(STORE_USERS, { keyPath: 'username' });
          users.createIndex('by_role', 'role', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains(STORE_NOTIFICATIONS)) {
          const noti = db.createObjectStore(STORE_NOTIFICATIONS, { keyPath: 'id', autoIncrement: true });
          noti.createIndex('by_createdAt', 'createdAt', { unique: false });
          noti.createIndex('by_type', 'type', { unique: false });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function withStore(storeName, mode, fn) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const result = fn(store);
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  function hashString(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    const hex = (hash >>> 0).toString(16).padStart(8, '0');
    return `h_${hex}`;
  }

  function computeResourceHash(resource) {
    const key = [
      (resource.title || '').trim().toLowerCase(),
      (resource.date || '').trim(),
      String(resource.lat || ''),
      String(resource.lng || ''),
      (resource.source || '').trim().toLowerCase()
    ].join('|');
    return hashString(key);
  }

  const ResourceStore = {
    async upsertResource(resource) {
      const now = new Date().toISOString();
      const normalized = { ...resource };
      if (!normalized.id) normalized.id = `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      normalized.hash = computeResourceHash(normalized);
      normalized.createdAt = normalized.createdAt || now;
      normalized.updatedAt = now;
      if (!normalized.status) normalized.status = 'pending';

      const existingByHash = await this.getResourceByHash(normalized.hash);
      if (existingByHash) {
        return existingByHash;
      }

      await withStore(STORE_RESOURCES, 'readwrite', (s) => s.put(normalized));
      Dashboard.emit('resource:upserted', normalized);
      return normalized;
    },

    async getResourceByHash(hash) {
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_RESOURCES, 'readonly');
        const store = tx.objectStore(STORE_RESOURCES);
        const idx = store.index('by_hash');
        const req = idx.get(hash);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    },

    async listResourcesByStatus(status) {
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_RESOURCES, 'readonly');
        const store = tx.objectStore(STORE_RESOURCES);
        const idx = store.index('by_status');
        const req = idx.getAll(IDBKeyRange.only(status));
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },

    async listAllResources() {
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_RESOURCES, 'readonly');
        const store = tx.objectStore(STORE_RESOURCES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },

    async setResourceStatus(id, status) {
      const item = await new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_RESOURCES, 'readonly');
        const store = tx.objectStore(STORE_RESOURCES);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      if (!item) return null;
      item.status = status;
      item.updatedAt = new Date().toISOString();
      await withStore(STORE_RESOURCES, 'readwrite', (s) => s.put(item));
      Dashboard.emit('resource:status', item);
      return item;
    },

    async addCategory(category) {
      const normalized = {
        name: category.name,
        color: category.color || '#32a8b8',
        icon: category.icon || '📍',
        count: category.count || 0
      };
      await withStore(STORE_CATEGORIES, 'readwrite', (s) => s.put(normalized));
      return normalized;
    },

    async listCategories() {
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_CATEGORIES, 'readonly');
        const store = tx.objectStore(STORE_CATEGORIES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },

    async ensureDefaultCategoriesFromApp() {
      if (!window.app || !window.app.categories) return;
      const existing = await this.listCategories();
      if (existing.length) return;
      for (const cat of window.app.categories) {
        await this.addCategory(cat);
      }
    },

    async upsertUser(user) {
      await withStore(STORE_USERS, 'readwrite', (s) => s.put(user));
      return user;
    },

    async getUser(username) {
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_USERS, 'readonly');
        const store = tx.objectStore(STORE_USERS);
        const req = store.get(username);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    },

    async setSetting(key, value) {
      await withStore(STORE_SETTINGS, 'readwrite', (s) => s.put({ key, value }));
    },

    async getSetting(key, fallback = null) {
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_SETTINGS, 'readonly');
        const store = tx.objectStore(STORE_SETTINGS);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : fallback);
        req.onerror = () => reject(req.error);
      });
    },

    async addNotification(notification) {
      const payload = {
        type: notification.type || 'info',
        title: notification.title || '',
        body: notification.body || '',
        createdAt: Date.now()
      };
      await withStore(STORE_NOTIFICATIONS, 'readwrite', (s) => s.add(payload));
      Dashboard.emit('notification:new', payload);
      return payload;
    },

    async listNotifications(limit = 50) {
      const all = await new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_NOTIFICATIONS, 'readonly');
        const store = tx.objectStore(STORE_NOTIFICATIONS);
        const idx = store.index('by_createdAt');
        const items = [];
        idx.openCursor(null, 'prev').onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor && items.length < limit) {
            items.push(cursor.value);
            cursor.continue();
          } else {
            resolve(items);
          }
        };
        tx.onerror = () => reject(tx.error);
      });
      return all;
    }
  };

  const Dashboard = {
    async init() {
      dbInstance = await openDatabase();
      broadcast = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_NAME) : null;
      if (broadcast) {
        broadcast.onmessage = (msg) => {
          if (!msg || !msg.data) return;
          window.dispatchEvent(new CustomEvent('dashboard:broadcast', { detail: msg.data }));
        };
      }

      await this.ensureDefaultAdmin();
      await ResourceStore.ensureDefaultCategoriesFromApp();

      this.bindUI();
      this.refreshUIState();

      await this.mergeApprovedResourcesIntoMap();
    },

    emit(eventName, detail) {
      try {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
        if (broadcast) broadcast.postMessage({ event: eventName, detail });
      } catch (_) {}
    },

    async ensureDefaultAdmin() {
      const existing = await ResourceStore.getUser('admin');
      if (!existing) {
        await ResourceStore.upsertUser({ username: 'admin', role: 'admin', password: this.simpleHash('admin') });
      }
      const saved = await ResourceStore.getSetting('currentUser');
      if (saved) currentUser = saved;
      this.updateUserBadge();
    },

    simpleHash(str) {
      return hashString(String(str));
    },

    bindUI() {
      const openBtn = document.getElementById('openDashboard');
      const closeBtn = document.getElementById('closeDashboard');
      const panel = document.getElementById('dashboardPanel');

      if (openBtn && panel) {
        openBtn.addEventListener('click', () => this.togglePanel(true));
      }
      if (closeBtn && panel) {
        closeBtn.addEventListener('click', () => this.togglePanel(false));
      }

      document.querySelectorAll('.dashboard-tab').forEach((btn) => {
        btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
      });

      const manualForm = document.getElementById('manualForm');
      if (manualForm) {
        manualForm.addEventListener('submit', (e) => this.handleManualSubmit(e));
        const saveDraftBtn = document.getElementById('saveDraft');
        if (saveDraftBtn) saveDraftBtn.addEventListener('click', () => this.handleManualSaveDraft());
      }

      const exportApprovedGeoJSON = document.getElementById('exportApprovedGeoJSON');
      if (exportApprovedGeoJSON) exportApprovedGeoJSON.addEventListener('click', () => this.exportApprovedToGeoJSON());
      const exportAllNDJSON = document.getElementById('exportAllNDJSON');
      if (exportAllNDJSON) exportAllNDJSON.addEventListener('click', () => this.exportAllToNDJSON());

      const exportMapBtn = document.getElementById('exportGeoJSON');
      if (exportMapBtn) exportMapBtn.addEventListener('click', () => this.exportCurrentMapGeoJSON());

      const addCategoryBtn = document.getElementById('addCategory');
      if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => this.handleAddCategory());

      const loginForm = document.getElementById('loginForm');
      if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());

      const enableDesktop = document.getElementById('enableDesktopNotifications');
      if (enableDesktop) enableDesktop.addEventListener('change', (e) => this.toggleDesktopNotifications(e.target.checked));

      window.addEventListener('resource:status', async (e) => {
        if (e.detail && e.detail.status === 'approved') {
          await this.mergeApprovedResourcesIntoMap();
        }
      });
    },

    async refreshUIState() {
      await this.populateCategorySelect();
      await this.renderCategoryManager();
      await this.renderReviewList();
      await this.renderNotifications();
      await this.applySavedNotificationPreference();
      this.updatePermissionsUI();
    },

    togglePanel(visible) {
      const panel = document.getElementById('dashboardPanel');
      if (!panel) return;
      panel.classList.toggle('visible', visible);
      panel.classList.toggle('hidden', !visible);
      panel.setAttribute('aria-hidden', visible ? 'false' : 'true');
    },

    switchTab(name) {
      document.querySelectorAll('.dashboard-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === name);
      });
      document.querySelectorAll('.dashboard-section').forEach((sec) => {
        sec.classList.toggle('active', sec.id === `tab-${name}`);
      });
    },

    async populateCategorySelect() {
      const select = document.getElementById('resCategory');
      if (!select) return;
      select.innerHTML = '';
      let categories = await ResourceStore.listCategories();
      if ((!categories || !categories.length) && window.app && window.app.categories) {
        categories = window.app.categories;
      }
      for (const cat of categories) {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = cat.name;
        select.appendChild(opt);
      }
    },

    gatherManualFormData() {
      const title = document.getElementById('resTitle').value.trim();
      const date = document.getElementById('resDate').value;
      const lat = parseFloat(document.getElementById('resLat').value);
      const lng = parseFloat(document.getElementById('resLng').value);
      const category = document.getElementById('resCategory').value;
      const tags = document.getElementById('resTags').value.split(',').map((t) => t.trim()).filter(Boolean);
      const importance = parseInt(document.getElementById('resImportance').value, 10);
      const source = document.getElementById('resSource').value.trim();
      const description = document.getElementById('resDescription').value.trim();
      const locationName = document.getElementById('resLocationName').value.trim();
      return { title, date, lat, lng, category, tags, importance, source, description, locationName };
    },

    validateResource(resource) {
      const errors = [];
      if (!resource.title) errors.push('Вкажіть назву');
      if (!resource.date) errors.push('Вкажіть дату');
      if (!Number.isFinite(resource.lat) || !Number.isFinite(resource.lng)) errors.push('Невірні координати');
      if (!resource.category) errors.push('Оберіть категорію');
      if (!resource.source) errors.push('Вкажіть джерело');
      if (!Number.isFinite(resource.importance) || resource.importance < 1 || resource.importance > 10) errors.push('Важливість 1-10');
      return errors;
    },

    setManualErrors(messages) {
      const box = document.getElementById('manualErrors');
      if (!box) return;
      box.innerHTML = messages.map((m) => `• ${m}`).join('<br>');
    },

    async handleManualSubmit(e) {
      e.preventDefault();
      this.setManualErrors([]);
      const data = this.gatherManualFormData();
      const errors = this.validateResource(data);
      if (errors.length) {
        this.setManualErrors(errors);
        return;
      }
      const resource = {
        ...data,
        status: 'pending',
        createdBy: currentUser.username,
        createdByRole: currentUser.role
      };
      const saved = await ResourceStore.upsertResource(resource);
      await ResourceStore.addNotification({ type: 'resource', title: 'Нова подія на перевірці', body: saved.title });
      this.notifyDesktop(`Нова подія на перевірці: ${saved.title}`);
      this.clearManualForm();
      await this.renderReviewList();
    },

    async handleManualSaveDraft() {
      this.setManualErrors([]);
      const data = this.gatherManualFormData();
      const minimalChecks = [];
      if (!data.title) minimalChecks.push('Назва порожня');
      if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) minimalChecks.push('Невірні координати');
      if (minimalChecks.length) {
        this.setManualErrors(minimalChecks);
        return;
      }
      const saved = await ResourceStore.upsertResource({ ...data, status: 'draft', createdBy: currentUser.username, createdByRole: currentUser.role });
      await ResourceStore.addNotification({ type: 'draft', title: 'Чернетка збережена', body: saved.title });
      this.notifyDesktop(`Чернетка збережена: ${saved.title}`);
      this.clearManualForm();
    },

    clearManualForm() {
      const fields = ['resTitle','resDate','resLat','resLng','resTags','resImportance','resSource','resDescription','resLocationName'];
      fields.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const cat = document.getElementById('resCategory');
      if (cat) cat.selectedIndex = 0;
    },

    async renderReviewList() {
      const container = document.getElementById('reviewList');
      if (!container) return;
      const items = await ResourceStore.listResourcesByStatus('pending');
      if (!items.length) {
        container.innerHTML = '<p class="event-description">Немає записів для перевірки.</p>';
        return;
      }
      container.innerHTML = '';
      for (const item of items) {
        const row = document.createElement('div');
        row.className = 'card mt-8';
        row.innerHTML = `
          <div class="card__body">
            <div><strong>${item.title}</strong></div>
            <div class="mt-8" style="font-size: 12px; color: var(--color-text-secondary)">${item.date} • ${item.category} • важл. ${item.importance}</div>
            <div class="mt-8">${item.description}</div>
            <div class="mt-8 flex gap-8">
              <button class="btn btn--primary" data-action="approve">Затвердити</button>
              <button class="btn btn--outline" data-action="reject">Відхилити</button>
            </div>
          </div>
        `;
        row.querySelector('[data-action="approve"]').addEventListener('click', async () => {
          if (!defaultRoles[currentUser.role]?.canApprove) return;
          await ResourceStore.setResourceStatus(item.id, 'approved');
          await ResourceStore.addNotification({ type: 'approved', title: 'Подію затверджено', body: item.title });
          this.notifyDesktop(`Подію затверджено: ${item.title}`);
          await this.mergeApprovedResourcesIntoMap();
          await this.renderReviewList();
        });
        row.querySelector('[data-action="reject"]').addEventListener('click', async () => {
          if (!defaultRoles[currentUser.role]?.canApprove) return;
          await ResourceStore.setResourceStatus(item.id, 'rejected');
          await ResourceStore.addNotification({ type: 'rejected', title: 'Подію відхилено', body: item.title });
          this.notifyDesktop(`Подію відхилено: ${item.title}`);
          await this.renderReviewList();
        });
        container.appendChild(row);
      }
    },

    async handleAddCategory() {
      const nameEl = document.getElementById('newCategoryName');
      const colorEl = document.getElementById('newCategoryColor');
      const name = nameEl.value.trim();
      const color = colorEl.value || '#32a8b8';
      if (!name) return;
      await ResourceStore.addCategory({ name, color, icon: '🏷️', count: 0 });
      nameEl.value = '';
      await this.populateCategorySelect();
      await this.renderCategoryManager();
    },

    async renderCategoryManager() {
      const container = document.getElementById('categoryManager');
      if (!container) return;
      const cats = await ResourceStore.listCategories();
      if (!cats.length) {
        container.innerHTML = '<p class="event-description">Категорій ще немає.</p>';
        return;
      }
      const html = cats.map((c) => `<div class="flex items-center gap-8 my-8"><span style="width:14px;height:14px;background:${c.color};border-radius:9999px;display:inline-block"></span><span>${c.name}</span></div>`).join('');
      container.innerHTML = html;
    },

    async exportApprovedToGeoJSON() {
      const approved = await ResourceStore.listResourcesByStatus('approved');
      const geo = this.toGeoJSONFromResources(approved);
      this.downloadBlob(JSON.stringify(geo, null, 2), 'approved_resources.geojson', 'application/geo+json');
    },

    async exportAllToNDJSON() {
      const all = await ResourceStore.listAllResources();
      const lines = all.map((x) => JSON.stringify(x)).join('\n');
      this.downloadBlob(lines, 'all_resources.ndjson', 'application/x-ndjson');
    },

    exportCurrentMapGeoJSON() {
      if (!window.app) return;
      const features = (window.app.filteredEvents || window.app.events || []).map((e) => ({
        type: 'Feature',
        properties: {
          id: e.id,
          title: e.title,
          date: e.date,
          category: e.category,
          region: e.region,
          country: e.country,
          description: e.description,
          participants: e.participants,
          impact: e.impact,
          importance: e.importance,
          sources: e.sources
        },
        geometry: { type: 'Point', coordinates: [e.lng, e.lat] }
      }));
      const geo = { type: 'FeatureCollection', features };
      this.downloadBlob(JSON.stringify(geo, null, 2), 'map_selection.geojson', 'application/geo+json');
    },

    toGeoJSONFromResources(list) {
      const features = list.map((r) => ({
        type: 'Feature',
        properties: {
          id: r.id,
          title: r.title,
          date: r.date,
          category: r.category,
          tags: r.tags || [],
          source: r.source,
          importance: r.importance,
          status: r.status,
          description: r.description,
          locationName: r.locationName || ''
        },
        geometry: { type: 'Point', coordinates: [r.lng, r.lat] }
      }));
      return { type: 'FeatureCollection', features };
    },

    downloadBlob(content, filename, mime) {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    async handleLogin(e) {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;
      if (!username || !password) return;
      const user = await ResourceStore.getUser(username);
      if (!user) return;
      if (user.password !== this.simpleHash(password)) return;
      currentUser = { username: user.username, role: user.role };
      await ResourceStore.setSetting('currentUser', currentUser);
      this.updateUserBadge();
      this.updatePermissionsUI();
      this.notifyDesktop(`Вхід: ${user.username}`);
    },

    async handleLogout() {
      currentUser = { username: 'guest', role: 'viewer' };
      await ResourceStore.setSetting('currentUser', currentUser);
      this.updateUserBadge();
      this.updatePermissionsUI();
      this.notifyDesktop('Вихід з акаунту');
    },

    updateUserBadge() {
      const badge = document.getElementById('currentUserBadge');
      if (!badge) return;
      badge.textContent = currentUser.username === 'guest' ? 'Гість' : `${currentUser.username} (${currentUser.role})`;
      badge.className = 'status ' + (currentUser.username === 'guest' ? 'status--info' : 'status--success');
    },

    updatePermissionsUI() {
      const canApprove = !!defaultRoles[currentUser.role]?.canApprove;
      const reviewTabBtn = Array.from(document.querySelectorAll('.dashboard-tab')).find((b) => b.dataset.tab === 'review');
      if (reviewTabBtn) {
        reviewTabBtn.disabled = !canApprove;
        reviewTabBtn.style.opacity = canApprove ? '1' : '0.5';
      }
      const reviewSection = document.getElementById('tab-review');
      if (reviewSection) reviewSection.style.display = canApprove ? '' : 'none';
    },

    async applySavedNotificationPreference() {
      const pref = await ResourceStore.getSetting('desktopNotifications', false);
      const chk = document.getElementById('enableDesktopNotifications');
      if (chk) chk.checked = !!pref;
    },

    async toggleDesktopNotifications(enabled) {
      await ResourceStore.setSetting('desktopNotifications', !!enabled);
      if (enabled) {
        if (Notification && Notification.permission !== 'granted') {
          try { await Notification.requestPermission(); } catch (_) {}
        }
      }
    },

    async renderNotifications() {
      const feed = document.getElementById('notificationFeed');
      if (!feed) return;
      const items = await ResourceStore.listNotifications(50);
      feed.innerHTML = items.map((n) => `<div class="my-8" style="font-size: 12px; color: var(--color-text-secondary)">${new Date(n.createdAt).toLocaleString()} • ${n.title}</div>`).join('');
    },

    notifyDesktop(message) {
      ResourceStore.addNotification({ type: 'info', title: message, body: '' }).catch(() => {});
      if (Notification && Notification.permission === 'granted') {
        try { new Notification(message); } catch (_) {}
      }
    },

    async mergeApprovedResourcesIntoMap() {
      if (!window.app) return;
      const approved = await ResourceStore.listResourcesByStatus('approved');
      const baseEvents = Array.isArray(window.app.events) ? window.app.events.slice() : [];

      const existingHashes = new Set(baseEvents.map((e) => e.hash).filter(Boolean));
      const mapped = approved
        .filter((r) => !existingHashes.has(r.hash))
        .map((r) => ({
          id: `db-${r.id}`,
          title: r.title,
          channel: 'Dashboard',
          date: r.date,
          category: r.category,
          region: 'Глобально',
          country: r.locationName || 'Світ',
          lat: r.lat,
          lng: r.lng,
          description: r.description,
          participants: (r.tags || []).slice(0),
          impact: '—',
          importance: r.importance || 5,
          sources: r.source ? [r.source] : [],
          hash: r.hash
        }));

      const combined = baseEvents.concat(mapped);
      window.app.events = combined;
      window.app.filteredEvents = combined.slice();

      if (Array.isArray(window.app.categories)) {
        window.app.categories.forEach((cat) => {
          cat.count = combined.filter((e) => e.category === cat.name).length;
        });
      }

      if (typeof window.app.updateDisplay === 'function') {
        window.app.updateDisplay();
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init().catch((err) => console.error('Dashboard init error', err));
    window.Dashboard = Dashboard;
    window.ResourceStore = ResourceStore;
  });
})();
