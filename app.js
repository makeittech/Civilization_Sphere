/* ============================================================================
   CIVILIZATION SPHERE - ADVANCED APPLICATION
   ============================================================================
   Modern geopolitical events visualization platform with:
   - Leaflet.js map with marker clustering
   - Real-time filtering and search
   - Timeline playback with smooth animations
   - Chart.js analytics with interactive visualizations
   - Dark/light theme with smooth transitions
   - Mobile-optimized responsive design
   - Data export (CSV/JSON)
   ============================================================================ */

'use strict';

class CivilizationSphere {
    constructor() {
        // Data
        this.events = [];
        this.filteredEvents = [];
        this.selectedEvent = null;
        
        // Map
        this.map = null;
        this.markers = [];
        this.markerClusterGroup = null;
        
        // Charts
        this.charts = {};
        
        // Timeline
        this.isPlaying = false;
        this.playbackIndex = 0;
        this.playbackSpeed = 1;
        this.playbackInterval = null;
        
        // Filters
        this.filters = {
            search: '',
            quickFilter: 'all',
            categories: new Set(),
            regions: new Set(),
            channels: new Set(),
            dateFrom: null,
            dateTo: null
        };
        
        // UI Elements
        this.ui = {};
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoading(true);
            this.cacheUIElements();
            this.setupEventListeners();
            this.loadTheme();
            await this.loadData();
            this.initializeMap();
            this.updateUI();
            this.showToast('Додаток успішно завантажено', 'success');
            this.showLoading(false);
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('Помилка завантаження: ' + error.message, 'error');
            this.showLoading(false);
        }
    }
    
    /**
     * Cache UI elements for better performance
     */
    cacheUIElements() {
        this.ui = {
            // Sidebars
            filtersSidebar: document.getElementById('filters-sidebar'),
            detailsSidebar: document.getElementById('details-sidebar'),
            closeFilters: document.getElementById('close-filters'),
            closeDetails: document.getElementById('close-details'),
            mobileFiltersToggle: document.getElementById('mobile-filters-toggle'),
            
            // Search & Filters
            searchInput: document.getElementById('search-input'),
            quickFilters: document.querySelectorAll('.quick-filter'),
            categoriesList: document.getElementById('categories-list'),
            regionsList: document.getElementById('regions-list'),
            channelsList: document.getElementById('channels-list'),
            dateFrom: document.getElementById('date-from'),
            dateTo: document.getElementById('date-to'),
            
            // Map
            mapContainer: document.getElementById('map'),
            zoomIn: document.getElementById('zoom-in'),
            zoomOut: document.getElementById('zoom-out'),
            resetView: document.getElementById('reset-view'),
            
            // Timeline
            playBtn: document.getElementById('play-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            speedSelect: document.getElementById('speed-select'),
            timelineTrack: document.querySelector('.timeline-track'),
            timelineProgress: document.getElementById('timeline-progress'),
            timelineHandle: document.getElementById('timeline-handle'),
            currentDate: document.getElementById('current-date'),
            endDate: document.getElementById('end-date'),
            
            // Export
            exportCsv: document.getElementById('export-csv'),
            exportJson: document.getElementById('export-json'),
            
            // Stats
            totalEvents: document.getElementById('total-events'),
            visibleEvents: document.getElementById('visible-events'),
            regionCount: document.getElementById('region-count'),
            channelCount: document.getElementById('channel-count'),
            
            // Event Details
            eventDetails: document.getElementById('event-details'),
            
            // Theme & Help
            themeToggle: document.getElementById('theme-toggle'),
            helpBtn: document.getElementById('help-btn'),
            helpModal: document.getElementById('help-modal'),
            closeHelpModal: document.getElementById('close-help-modal'),
            
            // Loading & Toast
            loading: document.getElementById('loading'),
            toastContainer: document.getElementById('toast-container')
        };
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search
        this.ui.searchInput.addEventListener('input', () => {
            this.filters.search = this.ui.searchInput.value.toLowerCase();
            this.applyFilters();
        });
        
        // Quick Filters
        this.ui.quickFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.quickFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filters.quickFilter = btn.dataset.filter;
                this.applyFilters();
            });
        });
        
        // Date Filters
        this.ui.dateFrom.addEventListener('change', () => {
            this.filters.dateFrom = this.ui.dateFrom.value;
            this.applyFilters();
        });
        
        this.ui.dateTo.addEventListener('change', () => {
            this.filters.dateTo = this.ui.dateTo.value;
            this.applyFilters();
        });
        
        // Map Controls
        this.ui.zoomIn.addEventListener('click', () => this.map.zoomIn());
        this.ui.zoomOut.addEventListener('click', () => this.map.zoomOut());
        this.ui.resetView.addEventListener('click', () => this.resetMapView());
        
        // Timeline Controls
        this.ui.playBtn.addEventListener('click', () => this.startPlayback());
        this.ui.pauseBtn.addEventListener('click', () => this.pausePlayback());
        this.ui.resetBtn.addEventListener('click', () => this.resetPlayback());
        this.ui.speedSelect.addEventListener('change', (e) => {
            this.playbackSpeed = parseFloat(e.target.value);
        });
        
        // Timeline interaction
        this.ui.timelineTrack.addEventListener('click', (e) => this.handleTimelineClick(e));
        this.ui.timelineHandle.addEventListener('mousedown', (e) => this.startTimelineDrag(e));
        this.ui.timelineHandle.addEventListener('touchstart', (e) => this.startTimelineDrag(e));
        
        // Export
        this.ui.exportCsv.addEventListener('click', () => this.exportToCSV());
        this.ui.exportJson.addEventListener('click', () => this.exportToJSON());
        
        // Sidebars
        this.ui.closeFilters?.addEventListener('click', () => {
            this.ui.filtersSidebar.classList.remove('active');
        });
        
        this.ui.closeDetails.addEventListener('click', () => {
            this.ui.detailsSidebar.classList.remove('active');
        });
        
        this.ui.mobileFiltersToggle?.addEventListener('click', () => {
            this.ui.filtersSidebar.classList.toggle('active');
        });
        
        // Theme Toggle
        this.ui.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Help Modal
        this.ui.helpBtn.addEventListener('click', () => {
            this.ui.helpModal.style.display = 'flex';
        });
        
        this.ui.closeHelpModal.addEventListener('click', () => {
            this.ui.helpModal.style.display = 'none';
        });
        
        this.ui.helpModal.addEventListener('click', (e) => {
            if (e.target === this.ui.helpModal) {
                this.ui.helpModal.style.display = 'none';
            }
        });
    }
    
    /**
     * Load events data
     */
    async loadData() {
        try {
            const response = await fetch('data/events.json');
            if (!response.ok) throw new Error('Failed to load events data');
            
            this.events = await response.json();
            this.enhanceEventData();
            this.initializeFilterUI();
            this.filteredEvents = [...this.events];
            
            return this.events;
        } catch (error) {
            console.error('Data loading error:', error);
            throw error;
        }
    }
    
    /**
     * Enhance event data with coordinates and defaults
     */
    enhanceEventData() {
        const regionCoordinates = {
            'Ukraine': [48.3794, 31.1656],
            'Europe': [54.5260, 15.2551],
            'Європа': [54.5260, 15.2551],
            'Asia': [34.0479, 100.6197],
            'Азія': [34.0479, 100.6197],
            'Middle East': [29.2985, 47.9248],
            'Близький Схід': [29.2985, 47.9248],
            'Africa': [-8.7832, 34.5085],
            'Африка': [-8.7832, 34.5085],
            'North America': [54.5260, -105.2551],
            'Північна Америка': [54.5260, -105.2551],
            'South America': [-8.7832, -55.4915],
            'Південна Америка': [-8.7832, -55.4915],
            'Oceania': [-22.7359, 140.0188],
            'Океанія': [-22.7359, 140.0188],
            'Global': [20.0, 0.0],
            'Глобально': [20.0, 0.0]
        };
        
        this.events.forEach(event => {
            if (!event.lat || !event.lng) {
                const coords = regionCoordinates[event.region] || regionCoordinates['Ukraine'];
                event.lat = coords[0] + (Math.random() - 0.5) * 3;
                event.lng = coords[1] + (Math.random() - 0.5) * 3;
            }
            event.importance = event.importance || 5;
            event.date = event.date || new Date().toISOString();
        });
        
        // Sort by date
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    /**
     * Initialize filter UI
     */
    initializeFilterUI() {
        const categories = [...new Set(this.events.map(e => e.category).filter(Boolean))].sort();
        const regions = [...new Set(this.events.map(e => e.region).filter(Boolean))].sort();
        const channels = [...new Set(this.events.map(e => e.channel_name).filter(Boolean))].sort();
        
        // Populate categories
        this.ui.categoriesList.innerHTML = categories.map(cat => `
            <div class="filter-item">
                <input type="checkbox" id="cat-${this.sanitizeId(cat)}" value="${cat}" class="category-filter">
                <label for="cat-${this.sanitizeId(cat)}">${this.escapeHtml(cat)}</label>
            </div>
        `).join('');
        
        // Populate regions
        this.ui.regionsList.innerHTML = regions.map(reg => `
            <div class="filter-item">
                <input type="checkbox" id="reg-${this.sanitizeId(reg)}" value="${reg}" class="region-filter">
                <label for="reg-${this.sanitizeId(reg)}">${this.escapeHtml(reg)}</label>
            </div>
        `).join('');
        
        // Populate channels (limit to top 20)
        this.ui.channelsList.innerHTML = channels.slice(0, 20).map(ch => `
            <div class="filter-item">
                <input type="checkbox" id="ch-${this.sanitizeId(ch)}" value="${ch}" class="channel-filter">
                <label for="ch-${this.sanitizeId(ch)}">${this.escapeHtml(ch)}</label>
            </div>
        `).join('');
        
        // Add event listeners
        document.querySelectorAll('.category-filter').forEach(cb => {
            cb.addEventListener('change', () => {
                this.filters.categories = new Set(
                    Array.from(document.querySelectorAll('.category-filter:checked')).map(el => el.value)
                );
                this.applyFilters();
            });
        });
        
        document.querySelectorAll('.region-filter').forEach(cb => {
            cb.addEventListener('change', () => {
                this.filters.regions = new Set(
                    Array.from(document.querySelectorAll('.region-filter:checked')).map(el => el.value)
                );
                this.applyFilters();
            });
        });
        
        document.querySelectorAll('.channel-filter').forEach(cb => {
            cb.addEventListener('change', () => {
                this.filters.channels = new Set(
                    Array.from(document.querySelectorAll('.channel-filter:checked')).map(el => el.value)
                );
                this.applyFilters();
            });
        });
        
        // Set date range limits
        if (this.events.length > 0) {
            const dates = this.events.map(e => new Date(e.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            
            this.ui.dateFrom.min = this.formatDateInput(minDate);
            this.ui.dateTo.max = this.formatDateInput(maxDate);
        }
    }
    
    /**
     * Apply all active filters
     */
    applyFilters() {
        this.filteredEvents = this.events.filter(event => {
            // Search filter
            if (this.filters.search) {
                const searchText = this.filters.search.toLowerCase();
                const matches = (event.title?.toLowerCase().includes(searchText)) ||
                               (event.description?.toLowerCase().includes(searchText)) ||
                               (event.channel_name?.toLowerCase().includes(searchText)) ||
                               (event.category?.toLowerCase().includes(searchText));
                if (!matches) return false;
            }
            
            // Quick filter
            if (this.filters.quickFilter !== 'all') {
                const eventDate = new Date(event.date);
                const now = new Date();
                
                switch (this.filters.quickFilter) {
                    case 'recent':
                        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (eventDate < sevenDaysAgo) return false;
                        break;
                    case 'important':
                        if ((event.importance || 0) < 8) return false;
                        break;
                    case 'conflicts':
                        const conflictKeywords = ['war', 'conflict', 'війна', 'конфлікт', 'battle', 'бій'];
                        const hasConflict = conflictKeywords.some(kw => 
                            event.title?.toLowerCase().includes(kw) ||
                            event.category?.toLowerCase().includes(kw)
                        );
                        if (!hasConflict) return false;
                        break;
                }
            }
            
            // Category filter
            if (this.filters.categories.size > 0 && !this.filters.categories.has(event.category)) {
                return false;
            }
            
            // Region filter
            if (this.filters.regions.size > 0 && !this.filters.regions.has(event.region)) {
                return false;
            }
            
            // Channel filter
            if (this.filters.channels.size > 0 && !this.filters.channels.has(event.channel_name)) {
                return false;
            }
            
            // Date range filter
            if (this.filters.dateFrom) {
                if (new Date(event.date) < new Date(this.filters.dateFrom)) return false;
            }
            if (this.filters.dateTo) {
                const endDate = new Date(this.filters.dateTo);
                endDate.setHours(23, 59, 59, 999);
                if (new Date(event.date) > endDate) return false;
            }
            
            return true;
        });
        
        this.updateUI();
    }
    
    /**
     * Update all UI components
     */
    updateUI() {
        this.updateStatistics();
        this.updateMap();
        this.updateCharts();
        this.updateTimelineInfo();
    }
    
    /**
     * Update statistics display
     */
    updateStatistics() {
        const uniqueRegions = new Set(this.filteredEvents.map(e => e.region)).size;
        const uniqueChannels = new Set(this.filteredEvents.map(e => e.channel_name)).size;
        
        this.ui.totalEvents.textContent = this.events.length.toLocaleString();
        this.ui.visibleEvents.textContent = this.filteredEvents.length.toLocaleString();
        this.ui.regionCount.textContent = uniqueRegions;
        this.ui.channelCount.textContent = uniqueChannels;
    }
    
    /**
     * Initialize Leaflet map
     */
    initializeMap() {
        // Create map
        this.map = L.map('map', {
            center: [48.3794, 31.1656],
            zoom: 5,
            zoomControl: false
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);
        
        // Create marker cluster group
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });
        
        this.map.addLayer(this.markerClusterGroup);
        this.updateMap();
    }
    
    /**
     * Update map markers
     */
    updateMap() {
        if (!this.map || !this.markerClusterGroup) return;
        
        // Clear existing markers
        this.markerClusterGroup.clearLayers();
        this.markers = [];
        
        // Add new markers
        this.filteredEvents.forEach(event => {
            const importance = event.importance || 5;
            const color = this.getCategoryColor(event.category);
            const size = Math.max(20, Math.min(importance * 4, 50));
            
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="custom-marker" style="
                    background: ${color};
                    width: ${size}px;
                    height: ${size}px;
                    font-size: ${size * 0.3}px;
                ">${importance}</div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2]
            });
            
            const marker = L.marker([event.lat, event.lng], { icon });
            
            marker.on('click', () => this.showEventDetails(event));
            
            this.markers.push(marker);
            this.markerClusterGroup.addLayer(marker);
        });
        
        // Fit bounds if markers exist
        if (this.filteredEvents.length > 0) {
            try {
                this.map.fitBounds(this.markerClusterGroup.getBounds().pad(0.1));
            } catch (e) {
                // Fallback if bounds are invalid
                this.map.setView([48.3794, 31.1656], 5);
            }
        }
    }
    
    /**
     * Reset map view
     */
    resetMapView() {
        this.map.setView([48.3794, 31.1656], 5);
    }
    
    /**
     * Show event details
     */
    showEventDetails(event) {
        this.selectedEvent = event;
        
        const html = `
            <div class="event-content">
                <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
                
                <div class="event-meta">
                    <div class="meta-row">
                        <div class="meta-label">📅 Дата</div>
                        <div class="meta-value">${this.formatDate(event.date)}</div>
                    </div>
                    <div class="meta-row">
                        <div class="meta-label">🗺️ Регіон</div>
                        <div class="meta-value">${this.escapeHtml(event.region)}</div>
                    </div>
                    <div class="meta-row">
                        <div class="meta-label">📂 Категорія</div>
                        <div class="meta-value">${this.escapeHtml(event.category)}</div>
                    </div>
                    <div class="meta-row">
                        <div class="meta-label">⭐ Важливість</div>
                        <div class="meta-value">${event.importance || 'N/A'} / 10</div>
                    </div>
                    <div class="meta-row">
                        <div class="meta-label">📺 Канал</div>
                        <div class="meta-value">${this.escapeHtml(event.channel_name)}</div>
                    </div>
                </div>
                
                ${event.description ? `
                    <div class="event-description">
                        ${this.escapeHtml(event.description.substring(0, 300))}${event.description.length > 300 ? '...' : ''}
                    </div>
                ` : ''}
                
                <div class="event-links">
                    ${event.source_url ? `
                        <a href="${event.source_url}" target="_blank" rel="noopener noreferrer" class="event-link">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Переглянути джерело
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
        
        this.ui.eventDetails.innerHTML = html;
        this.ui.detailsSidebar.classList.add('active');
    }
    
    /**
     * Get category color
     */
    getCategoryColor(category) {
        const colors = {
            'Geopolitics/News/Analysis': '#3b82f6',
            'Війни та конфлікти': '#ef4444',
            'Політичні зміни': '#f59e0b',
            'Економічні зміни': '#10b981',
            'Технологічні зміни': '#8b5cf6',
            'Політичні системи': '#06b6d4',
            'Союзи та договори': '#6366f1',
            'Тероризм': '#dc2626',
            'Глобальні кризи': '#ea580c',
            'Інфраструктурні проекти': '#0284c7',
            'Культурні зміни': '#14b8a6',
            'Військові аналізи': '#7c3aed',
            'Соціально-економічні моделі': '#059669',
            'Економічні моделі': '#10b981',
            'Кліматичні зміни': '#0ea5e9',
            'Кібербезпека': '#f97316',
            'Космічні програми': '#6366f1',
            'Біотехнології': '#14b8a6'
        };
        return colors[category] || '#6366f1';
    }
    
    /**
     * Update analytics charts
     */
    updateCharts() {
        this.updateCategoryChart();
        this.updateRegionChart();
        this.updateTimeChart();
        this.updateImportanceChart();
    }
    
    /**
     * Update category distribution chart
     */
    updateCategoryChart() {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;
        
        const categoryData = {};
        this.filteredEvents.forEach(event => {
            const cat = event.category || 'Інше';
            categoryData[cat] = (categoryData[cat] || 0) + 1;
        });
        
        const sorted = Object.entries(categoryData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        
        const labels = sorted.map(([label]) => label.length > 25 ? label.substring(0, 25) + '...' : label);
        const data = sorted.map(([, value]) => value);
        const colors = sorted.map(([label]) => this.getCategoryColor(label));
        
        if (this.charts.category) this.charts.category.destroy();
        
        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: { size: 10 },
                            color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update region distribution chart
     */
    updateRegionChart() {
        const ctx = document.getElementById('region-chart');
        if (!ctx) return;
        
        const regionData = {};
        this.filteredEvents.forEach(event => {
            const reg = event.region || 'Інше';
            regionData[reg] = (regionData[reg] || 0) + 1;
        });
        
        const labels = Object.keys(regionData);
        const data = Object.values(regionData);
        
        if (this.charts.region) this.charts.region.destroy();
        
        this.charts.region = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Події',
                    data,
                    backgroundColor: '#3b82f6',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--surface-200')
                        }
                    },
                    y: {
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update time distribution chart
     */
    updateTimeChart() {
        const ctx = document.getElementById('time-chart');
        if (!ctx) return;
        
        const monthData = {};
        this.filteredEvents.forEach(event => {
            const month = new Date(event.date).toISOString().substring(0, 7);
            monthData[month] = (monthData[month] || 0) + 1;
        });
        
        const labels = Object.keys(monthData).sort();
        const data = labels.map(label => monthData[label]);
        
        if (this.charts.time) this.charts.time.destroy();
        
        this.charts.time = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Події',
                    data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--surface-200')
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update importance distribution chart
     */
    updateImportanceChart() {
        const ctx = document.getElementById('importance-chart');
        if (!ctx) return;
        
        const importanceRanges = {
            'Критична (8-10)': 0,
            'Висока (6-7)': 0,
            'Середня (4-5)': 0,
            'Низька (1-3)': 0
        };
        
        this.filteredEvents.forEach(event => {
            const imp = event.importance || 5;
            if (imp >= 8) importanceRanges['Критична (8-10)']++;
            else if (imp >= 6) importanceRanges['Висока (6-7)']++;
            else if (imp >= 4) importanceRanges['Середня (4-5)']++;
            else importanceRanges['Низька (1-3)']++;
        });
        
        const labels = Object.keys(importanceRanges);
        const data = Object.values(importanceRanges);
        
        if (this.charts.importance) this.charts.importance.destroy();
        
        this.charts.importance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: ['#ef4444', '#f59e0b', '#fbbf24', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: { size: 10 },
                            color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update timeline info
     */
    updateTimelineInfo() {
        if (this.filteredEvents.length > 0) {
            const dates = this.filteredEvents.map(e => new Date(e.date)).sort((a, b) => a - b);
            this.ui.endDate.textContent = this.formatDate(dates[dates.length - 1]);
        } else {
            this.ui.currentDate.textContent = '—';
            this.ui.endDate.textContent = '—';
        }
    }
    
    /**
     * Handle timeline click
     */
    handleTimelineClick(e) {
        if (this.filteredEvents.length === 0) return;
        
        const rect = this.ui.timelineTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.playbackIndex = Math.floor(percentage * this.filteredEvents.length);
        this.updatePlaybackUI();
    }
    
    /**
     * Start timeline drag
     */
    startTimelineDrag(e) {
        e.preventDefault();
        this.pausePlayback();
        
        const handleMove = (e) => {
            const rect = this.ui.timelineTrack.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            
            this.playbackIndex = Math.floor(percentage * this.filteredEvents.length);
            this.updatePlaybackUI();
        };
        
        const handleEnd = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchend', handleEnd);
        };
        
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchend', handleEnd);
    }
    
    /**
     * Start playback
     */
    startPlayback() {
        if (this.filteredEvents.length === 0) {
            this.showToast('Немає подій для відтворення', 'warning');
            return;
        }
        
        this.isPlaying = true;
        this.ui.playBtn.style.display = 'none';
        this.ui.pauseBtn.style.display = 'flex';
        
        this.playbackInterval = setInterval(() => {
            this.playbackIndex++;
            if (this.playbackIndex >= this.filteredEvents.length) {
                this.pausePlayback();
                this.playbackIndex = this.filteredEvents.length - 1;
                return;
            }
            this.updatePlaybackUI();
        }, 1000 / this.playbackSpeed);
    }
    
    /**
     * Pause playback
     */
    pausePlayback() {
        this.isPlaying = false;
        this.ui.playBtn.style.display = 'flex';
        this.ui.pauseBtn.style.display = 'none';
        
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
    }
    
    /**
     * Reset playback
     */
    resetPlayback() {
        this.pausePlayback();
        this.playbackIndex = 0;
        this.updatePlaybackUI();
    }
    
    /**
     * Update playback UI
     */
    updatePlaybackUI() {
        if (this.filteredEvents.length === 0) return;
        
        const percentage = (this.playbackIndex / Math.max(1, this.filteredEvents.length - 1)) * 100;
        this.ui.timelineProgress.style.width = percentage + '%';
        this.ui.timelineHandle.style.left = percentage + '%';
        
        if (this.playbackIndex < this.filteredEvents.length) {
            const event = this.filteredEvents[this.playbackIndex];
            this.ui.currentDate.textContent = this.formatDate(event.date);
            this.showEventDetails(event);
        }
    }
    
    /**
     * Export to CSV
     */
    exportToCSV() {
        if (this.filteredEvents.length === 0) {
            this.showToast('Немає даних для експорту', 'warning');
            return;
        }
        
        const headers = ['ID', 'Назва', 'Дата', 'Категорія', 'Регіон', 'Канал', 'Важливість', 'Посилання'];
        const rows = this.filteredEvents.map(e => [
            e.id,
            e.title,
            this.formatDate(e.date),
            e.category,
            e.region,
            e.channel_name,
            e.importance || '',
            e.source_url || ''
        ]);
        
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        this.downloadFile(csv, 'civilization-sphere-events.csv', 'text/csv;charset=utf-8;');
        this.showToast('Дані експортовано у CSV', 'success');
    }
    
    /**
     * Export to JSON
     */
    exportToJSON() {
        if (this.filteredEvents.length === 0) {
            this.showToast('Немає даних для експорту', 'warning');
            return;
        }
        
        const json = JSON.stringify(this.filteredEvents, null, 2);
        this.downloadFile(json, 'civilization-sphere-events.json', 'application/json');
        this.showToast('Дані експортовано у JSON', 'success');
    }
    
    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Toggle theme
     */
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Update charts colors
        this.updateCharts();
    }
    
    /**
     * Load saved theme
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(savedTheme + '-theme');
    }
    
    /**
     * Show loading overlay
     */
    showLoading(show) {
        this.ui.loading.style.display = show ? 'flex' : 'none';
    }
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.ui.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }
    
    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    /**
     * Format date for input
     */
    formatDateInput(date) {
        return date.toISOString().split('T')[0];
    }
    
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
    
    /**
     * Sanitize ID
     */
    sanitizeId(text) {
        return String(text).replace(/[^a-zA-Z0-9-_]/g, '-');
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new CivilizationSphere();
    });
} else {
    window.app = new CivilizationSphere();
}
