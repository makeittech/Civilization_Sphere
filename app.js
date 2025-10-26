/* ============================================================================
   CIVILIZATION SPHERE - MODERN APPLICATION
   ============================================================================
   A comprehensive geopolitical events visualization platform with:
   - Interactive Leaflet.js map with event markers
   - Timeline with playback and speed controls
   - Advanced filtering (categories, regions, dates, channels)
   - Mobile-optimized responsive design
   - Dark/light theme switching
   - Real-time analytics using Chart.js
   - Data export functionality
   ============================================================================ */

'use strict';

class CivilizationSphere {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.selectedEvent = null;
        this.map = null;
        this.markers = [];
        this.charts = {};
        this.isPlaying = false;
        this.playbackIndex = 0;
        this.playbackSpeed = 1;
        this.playbackInterval = null;

        // Filter state
        this.filters = {
            search: '',
            quickFilter: 'all',
            categories: new Set(),
            regions: new Set(),
            channels: new Set(),
            dateFrom: null,
            dateTo: null
        };

        // UI Elements cache
        this.uiElements = {};

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
            this.loadTheme();
            this.setupEventListeners();
            await this.loadData();
            this.initializeMap();
            this.updateUI();
            this.showNotification('Додаток успішно завантажений', 'success');
            this.showLoading(false);
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Помилка при завантаженні: ' + error.message, 'error');
            this.showLoading(false);
        }
    }

    /**
     * Cache frequently used UI elements
     */
    cacheUIElements() {
        this.uiElements = {
            // Control Panel
            searchInput: document.getElementById('search-input'),
            quickFilterBtns: document.querySelectorAll('.quick-filter-btn'),
            categoriesContainer: document.getElementById('categories-container'),
            regionsContainer: document.getElementById('regions-container'),
            channelsContainer: document.getElementById('channels-container'),
            dateFrom: document.getElementById('date-from'),
            dateTo: document.getElementById('date-to'),
            
            // Timeline
            playBtn: document.getElementById('play-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetTimelineBtn: document.getElementById('reset-timeline-btn'),
            speedSelect: document.getElementById('speed-select'),
            timelineSlider: document.getElementById('timeline-slider'),
            timelineProgress: document.getElementById('timeline-progress'),
            currentDate: document.getElementById('current-date'),
            totalDate: document.getElementById('total-date'),
            
            // Map
            mapContainer: document.getElementById('map'),
            zoomInBtn: document.getElementById('zoom-in-btn'),
            zoomOutBtn: document.getElementById('zoom-out-btn'),
            resetViewBtn: document.getElementById('reset-view-btn'),
            
            // Event Details
            eventDetails: document.getElementById('event-details'),
            eventPanel: document.querySelector('.event-panel'),
            eventPanelClose: document.getElementById('event-panel-close'),
            
            // Control Panel
            controlPanel: document.querySelector('.control-panel'),
            panelClose: document.getElementById('panel-close-btn'),
            
            // Export buttons
            exportCsvBtn: document.getElementById('export-csv-btn'),
            exportJsonBtn: document.getElementById('export-json-btn'),
            
            // Statistics
            totalEvents: document.getElementById('total-events'),
            visibleEvents: document.getElementById('visible-events'),
            regionCount: document.getElementById('region-count'),
            channelCount: document.getElementById('channel-count'),
            
            // Theme & Navigation
            themeToggle: document.getElementById('theme-toggle'),
            helpBtn: document.getElementById('help-btn'),
            helpModal: document.getElementById('help-modal'),
            helpModalClose: document.getElementById('help-modal-close'),
            
            // Mobile
            mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
            
            // Notifications
            loadingSpinner: document.getElementById('loading-spinner'),
            notificationToast: document.getElementById('notification-toast')
        };
    }

    /**
     * Setup event listeners for all interactive elements
     */
    setupEventListeners() {
        // Search
        this.uiElements.searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // Quick filters
        this.uiElements.quickFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.uiElements.quickFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filters.quickFilter = btn.dataset.filter;
                this.applyFilters();
            });
        });

        // Date filters
        this.uiElements.dateFrom.addEventListener('change', () => {
            this.filters.dateFrom = this.uiElements.dateFrom.value;
            this.applyFilters();
        });

        this.uiElements.dateTo.addEventListener('change', () => {
            this.filters.dateTo = this.uiElements.dateTo.value;
            this.applyFilters();
        });

        // Timeline controls
        this.uiElements.playBtn.addEventListener('click', () => this.startPlayback());
        this.uiElements.pauseBtn.addEventListener('click', () => this.pausePlayback());
        this.uiElements.resetTimelineBtn.addEventListener('click', () => this.resetPlayback());
        this.uiElements.speedSelect.addEventListener('change', (e) => {
            this.playbackSpeed = parseFloat(e.target.value);
        });

        this.uiElements.timelineSlider.addEventListener('mousedown', (e) => {
            this.pausePlayback();
            this.handleTimelineInteraction(e);
        });

        this.uiElements.timelineSlider.addEventListener('touchstart', (e) => {
            this.pausePlayback();
            this.handleTimelineInteraction(e);
        });

        // Map controls
        this.uiElements.zoomInBtn.addEventListener('click', () => this.map.zoomIn());
        this.uiElements.zoomOutBtn.addEventListener('click', () => this.map.zoomOut());
        this.uiElements.resetViewBtn.addEventListener('click', () => this.resetMapView());

        // Export buttons
        this.uiElements.exportCsvBtn.addEventListener('click', () => this.exportToCSV());
        this.uiElements.exportJsonBtn.addEventListener('click', () => this.exportToJSON());

        // Event panel close
        this.uiElements.eventPanelClose.addEventListener('click', () => {
            this.uiElements.eventPanel.classList.remove('active');
        });

        // Control panel close
        this.uiElements.panelClose.addEventListener('click', () => {
            this.uiElements.controlPanel.classList.remove('active');
        });

        // Theme toggle
        this.uiElements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Help modal
        this.uiElements.helpBtn.addEventListener('click', () => {
            this.uiElements.helpModal.style.display = 'flex';
        });

        this.uiElements.helpModalClose.addEventListener('click', () => {
            this.uiElements.helpModal.style.display = 'none';
        });

        this.uiElements.helpModal.addEventListener('click', (e) => {
            if (e.target === this.uiElements.helpModal) {
                this.uiElements.helpModal.style.display = 'none';
            }
        });

        // Mobile menu
        if (this.uiElements.mobileMenuToggle) {
            this.uiElements.mobileMenuToggle.addEventListener('click', () => {
                this.uiElements.mobileMenuToggle.classList.toggle('active');
                this.uiElements.controlPanel.classList.toggle('active');
            });
        }

        // Close mobile menu on filter change
        document.addEventListener('click', (e) => {
            if (this.uiElements.mobileMenuToggle && !e.target.closest('.mobile-menu-toggle') &&
                !e.target.closest('.control-panel')) {
                this.uiElements.mobileMenuToggle.classList.remove('active');
                this.uiElements.controlPanel.classList.remove('active');
            }
        });
    }

    /**
     * Load events data from data/events.json
     */
    async loadData() {
        try {
            const response = await fetch('data/events.json');
            if (!response.ok) throw new Error('Failed to load events data');
            this.events = await response.json();

            // Enhance events with geographic data
            this.enhanceEventData();

            // Initialize filter UI
            this.initializeFilterUI();

            this.filteredEvents = [...this.events];
            return this.events;
        } catch (error) {
            console.error('Data loading error:', error);
            this.showNotification('Не вдалося завантажити дані', 'error');
            throw error;
        }
    }

    /**
     * Enhance event data with geographic coordinates
     */
    enhanceEventData() {
        const regionCoordinates = {
            'Ukraine': [48.3794, 31.1656],
            'Europe': [54.5973, 15.2551],
            'Asia': [34.0479, 100.6197],
            'Middle East': [25.3548, 55.3643],
            'Africa': [-8.7832, 34.5085],
            'North America': [45.7128, -74.0060],
            'South America': [-15.7975, -52.4894],
            'Oceania': [-23.6345, 133.8807],
            'Global': [20.0, 0.0],
            'Європа': [54.5973, 15.2551],
            'Азія': [34.0479, 100.6197],
            'Близький Схід': [25.3548, 55.3643],
            'Африка': [-8.7832, 34.5085],
            'Північна Америка': [45.7128, -74.0060],
            'Південна Америка': [-15.7975, -52.4894],
            'Океанія': [-23.6345, 133.8807],
            'Глобально': [20.0, 0.0]
        };

        this.events.forEach(event => {
            if (!event.lat || !event.lng) {
                const coords = regionCoordinates[event.region] || regionCoordinates['Ukraine'];
                event.lat = coords[0] + (Math.random() - 0.5) * 2;
                event.lng = coords[1] + (Math.random() - 0.5) * 2;
            }
            event.importance = event.importance || 5;
            event.date = event.date || new Date().toISOString();
        });

        // Sort by date
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * Initialize filter UI elements
     */
    initializeFilterUI() {
        // Get unique values
        const categories = [...new Set(this.events.map(e => e.category).filter(Boolean))];
        const regions = [...new Set(this.events.map(e => e.region).filter(Boolean))];
        const channels = [...new Set(this.events.map(e => e.channel_name).filter(Boolean))];

        // Populate categories
        this.uiElements.categoriesContainer.innerHTML = categories
            .sort()
            .map(cat => `
                <div class="filter-checkbox">
                    <input type="checkbox" id="cat-${cat}" value="${cat}" class="category-filter">
                    <label for="cat-${cat}">${cat}</label>
                </div>
            `)
            .join('');

        // Populate regions
        this.uiElements.regionsContainer.innerHTML = regions
            .sort()
            .map(reg => `
                <div class="filter-checkbox">
                    <input type="checkbox" id="reg-${reg}" value="${reg}" class="region-filter">
                    <label for="reg-${reg}">${reg}</label>
                </div>
            `)
            .join('');

        // Populate channels
        this.uiElements.channelsContainer.innerHTML = channels
            .sort()
            .map(ch => `
                <div class="filter-checkbox">
                    <input type="checkbox" id="ch-${ch}" value="${ch}" class="channel-filter">
                    <label for="ch-${ch}">${ch}</label>
                </div>
            `)
            .join('');

        // Add event listeners to checkboxes
        document.querySelectorAll('.category-filter').forEach(cb => {
            cb.addEventListener('change', () => {
                this.filters.categories = new Set(
                    Array.from(document.querySelectorAll('.category-filter:checked'))
                        .map(el => el.value)
                );
                this.applyFilters();
            });
        });

        document.querySelectorAll('.region-filter').forEach(cb => {
            cb.addEventListener('change', () => {
                this.filters.regions = new Set(
                    Array.from(document.querySelectorAll('.region-filter:checked'))
                        .map(el => el.value)
                );
                this.applyFilters();
            });
        });

        document.querySelectorAll('.channel-filter').forEach(cb => {
            cb.addEventListener('change', () => {
                this.filters.channels = new Set(
                    Array.from(document.querySelectorAll('.channel-filter:checked'))
                        .map(el => el.value)
                );
                this.applyFilters();
            });
        });

        // Set date limits
        if (this.events.length > 0) {
            const dates = this.events.map(e => new Date(e.date));
            const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
            const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

            this.uiElements.dateFrom.min = minDate.toISOString().split('T')[0];
            this.uiElements.dateTo.max = maxDate.toISOString().split('T')[0];
        }
    }

    /**
     * Apply all active filters
     */
    applyFilters() {
        this.filteredEvents = this.events.filter(event => {
            // Search filter
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const matches = (event.title?.toLowerCase().includes(searchLower)) ||
                               (event.description?.toLowerCase().includes(searchLower)) ||
                               (event.channel_name?.toLowerCase().includes(searchLower));
                if (!matches) return false;
            }

            // Quick filters
            if (this.filters.quickFilter !== 'all') {
                const today = new Date();
                const eventDate = new Date(event.date);
                switch (this.filters.quickFilter) {
                    case 'recent':
                        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (eventDate < sevenDaysAgo) return false;
                        break;
                    case 'important':
                        if ((event.importance || 0) < 7) return false;
                        break;
                    case 'conflicts':
                        const conflictKeywords = ['war', 'conflict', 'конфлікт', 'війна'];
                        const isConflict = conflictKeywords.some(kw =>
                            event.title?.toLowerCase().includes(kw) ||
                            event.category?.toLowerCase().includes(kw)
                        );
                        if (!isConflict) return false;
                        break;
                }
            }

            // Category filter
            if (this.filters.categories.size > 0) {
                if (!this.filters.categories.has(event.category)) return false;
            }

            // Region filter
            if (this.filters.regions.size > 0) {
                if (!this.filters.regions.has(event.region)) return false;
            }

            // Channel filter
            if (this.filters.channels.size > 0) {
                if (!this.filters.channels.has(event.channel_name)) return false;
            }

            // Date range filter
            if (this.filters.dateFrom) {
                if (new Date(event.date) < new Date(this.filters.dateFrom)) return false;
            }
            if (this.filters.dateTo) {
                if (new Date(event.date) > new Date(this.filters.dateTo + 'T23:59:59')) return false;
            }

            return true;
        });

        this.updateUI();
    }

    /**
     * Update UI with filtered data
     */
    updateUI() {
        this.updateStatistics();
        this.updateMap();
        this.updateCharts();
        this.updateTimeline();
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const uniqueRegions = new Set(this.filteredEvents.map(e => e.region)).size;
        const uniqueChannels = new Set(this.filteredEvents.map(e => e.channel_name)).size;

        this.uiElements.totalEvents.textContent = this.events.length;
        this.uiElements.visibleEvents.textContent = this.filteredEvents.length;
        this.uiElements.regionCount.textContent = uniqueRegions;
        this.uiElements.channelCount.textContent = uniqueChannels;
    }

    /**
     * Initialize Leaflet map
     */
    initializeMap() {
        // Create map
        this.map = L.map('map').setView([48.3794, 31.1656], 4);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            className: 'map-tiles'
        }).addTo(this.map);

        // Add events to map
        this.updateMap();
    }

    /**
     * Update map with filtered events
     */
    updateMap() {
        // Remove existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Add new markers
        this.filteredEvents.forEach(event => {
            const importance = event.importance || 5;
            const size = Math.min(25 + importance * 2, 45);
            const color = this.getCategoryColor(event.category);

            const html = `
                <div style="
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    cursor: pointer;
                ">
                    ${importance}
                </div>
            `;

            const marker = L.marker([event.lat, event.lng], {
                icon: L.divIcon({
                    html: html,
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                    popupAnchor: [0, -size / 2]
                })
            }).addTo(this.map);

            marker.on('click', () => this.showEventDetails(event));
            this.markers.push(marker);
        });

        // Fit bounds if events exist
        if (this.filteredEvents.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    /**
     * Reset map view to default
     */
    resetMapView() {
        this.map.setView([48.3794, 31.1656], 4);
    }

    /**
     * Show event details in side panel
     */
    showEventDetails(event) {
        this.selectedEvent = event;
        const html = `
            <div class="event-details-content">
                <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
                
                <div class="event-meta">
                    <div class="meta-item">
                        <span class="meta-label">📅 Дата</span>
                        <span class="meta-value">${this.formatDate(event.date)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">🗺️ Регіон</span>
                        <span class="meta-value">${event.region}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">📂 Категорія</span>
                        <span class="meta-value">${event.category}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">⭐ Важливість</span>
                        <span class="meta-value">${event.importance || 'N/A'}</span>
                    </div>
                </div>

                <div class="event-description">
                    <span class="event-description-label">📺 Канал</span>
                    <span class="event-description-text">${event.channel_name}</span>
                </div>

                ${event.description ? `
                    <div class="event-description">
                        <span class="event-description-label">📝 Опис</span>
                        <span class="event-description-text">${this.escapeHtml(event.description.substring(0, 300))}</span>
                    </div>
                ` : ''}

                <div class="event-links">
                    ${event.source_url ? `
                        <a href="${event.source_url}" target="_blank" rel="noopener noreferrer" class="event-link">
                            🔗 Переглянути на YouTube
                        </a>
                    ` : ''}
                    ${event.url ? `
                        <a href="${event.url}" target="_blank" rel="noopener noreferrer" class="event-link">
                            🔗 Переглянути джерело
                        </a>
                    ` : ''}
                </div>
            </div>
        `;

        this.uiElements.eventDetails.innerHTML = html;
        this.uiElements.eventPanel.classList.add('active');

        // On mobile, close control panel
        if (window.innerWidth < 1024) {
            this.uiElements.controlPanel.classList.remove('active');
        }
    }

    /**
     * Get color for category
     */
    getCategoryColor(category) {
        const colors = {
            'Geopolitics/News/Analysis': '#3498db',
            'Війни та конфлікти': '#e74c3c',
            'Політичні зміни': '#f39c12',
            'Економічні зміни': '#27ae60',
            'Технологічні зміни': '#9b59b6',
            'Політичні системи': '#1abc9c',
            'Союзи та договори': '#34495e',
            'Тероризм': '#c0392b',
            'Глобальні кризи': '#d35400',
            'Інфраструктурні проекти': '#2980b9',
            'Культурні зміни': '#16a085',
            'Військові аналізи': '#8e44ad',
            'Соціально-економічні моделі': '#2ecc71',
            'Економічні моделі': '#27ae60',
            'Кліматичні зміни': '#3498db',
            'Кібербезпека': '#e67e22',
            'Космічні програми': '#2c3e50',
            'Біотехнології': '#1abc9c'
        };
        return colors[category] || '#3498db';
    }

    /**
     * Update analytics charts
     */
    updateCharts() {
        this.updateCategoryChart();
        this.updateRegionChart();
        this.updateTimelineChart();
        this.updateImportanceChart();
    }

    /**
     * Update category distribution chart
     */
    updateCategoryChart() {
        const ctx = document.getElementById('categories-chart');
        if (!ctx) return;

        const categoryData = {};
        this.filteredEvents.forEach(event => {
            const cat = event.category || 'Невизначена';
            categoryData[cat] = (categoryData[cat] || 0) + 1;
        });

        const labels = Object.keys(categoryData).slice(0, 10);
        const data = labels.map(label => categoryData[label]);

        if (this.charts.categories) this.charts.categories.destroy();

        this.charts.categories = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6',
                        '#1abc9c', '#34495e', '#c0392b', '#d35400', '#2980b9'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 10 },
                            color: this.getTextColor()
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
        const ctx = document.getElementById('regions-chart');
        if (!ctx) return;

        const regionData = {};
        this.filteredEvents.forEach(event => {
            const reg = event.region || 'Невизначений';
            regionData[reg] = (regionData[reg] || 0) + 1;
        });

        const labels = Object.keys(regionData);
        const data = labels.map(label => regionData[label]);

        if (this.charts.regions) this.charts.regions.destroy();

        this.charts.regions = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Кількість подій',
                    data: data,
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: this.getGridColor()
                        },
                        ticks: {
                            color: this.getTextColor()
                        }
                    },
                    y: {
                        grid: {
                            color: this.getGridColor()
                        },
                        ticks: {
                            color: this.getTextColor()
                        }
                    }
                }
            }
        });
    }

    /**
     * Update timeline chart (events per month)
     */
    updateTimelineChart() {
        const ctx = document.getElementById('timeline-chart');
        if (!ctx) return;

        const monthData = {};
        this.filteredEvents.forEach(event => {
            const date = new Date(event.date);
            const month = date.toISOString().substring(0, 7);
            monthData[month] = (monthData[month] || 0) + 1;
        });

        const labels = Object.keys(monthData).sort();
        const data = labels.map(label => monthData[label]);

        if (this.charts.timeline) this.charts.timeline.destroy();

        this.charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'События',
                    data: data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.getGridColor()
                        },
                        ticks: {
                            color: this.getTextColor()
                        }
                    },
                    x: {
                        grid: {
                            color: this.getGridColor()
                        },
                        ticks: {
                            color: this.getTextColor()
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

        const importanceData = {
            'Критична (8-10)': 0,
            'Висока (6-7)': 0,
            'Середня (4-5)': 0,
            'Низька (1-3)': 0
        };

        this.filteredEvents.forEach(event => {
            const imp = event.importance || 5;
            if (imp >= 8) importanceData['Критична (8-10)']++;
            else if (imp >= 6) importanceData['Висока (6-7)']++;
            else if (imp >= 4) importanceData['Середня (4-5)']++;
            else importanceData['Низька (1-3)']++;
        });

        const labels = Object.keys(importanceData);
        const data = labels.map(label => importanceData[label]);

        if (this.charts.importance) this.charts.importance.destroy();

        this.charts.importance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#e74c3c', '#f39c12', '#f1c40f', '#27ae60'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 10 },
                            color: this.getTextColor()
                        }
                    }
                }
            }
        });
    }

    /**
     * Update timeline progress and display
     */
    updateTimeline() {
        if (this.filteredEvents.length === 0) {
            this.uiElements.currentDate.textContent = '--';
            this.uiElements.totalDate.textContent = '--';
            return;
        }

        const dates = this.filteredEvents.map(e => new Date(e.date)).sort((a, b) => a - b);
        this.uiElements.totalDate.textContent = this.formatDate(dates[dates.length - 1]);
    }

    /**
     * Handle timeline slider interaction
     */
    handleTimelineInteraction(e) {
        const rect = this.uiElements.timelineSlider.parentElement.getBoundingClientRect();
        const x = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const percentage = (x - rect.left) / rect.width;
        this.playbackIndex = Math.floor(percentage * this.filteredEvents.length);
        this.updatePlaybackUI();
    }

    /**
     * Start playback
     */
    startPlayback() {
        if (this.filteredEvents.length === 0) {
            this.showNotification('Немає событий для відтворення', 'warning');
            return;
        }

        this.isPlaying = true;
        this.uiElements.playBtn.style.display = 'none';
        this.uiElements.pauseBtn.style.display = 'flex';

        this.playbackInterval = setInterval(() => {
            this.playbackIndex++;
            if (this.playbackIndex >= this.filteredEvents.length) {
                this.pausePlayback();
                return;
            }
            this.updatePlaybackUI();
        }, 500 / this.playbackSpeed);
    }

    /**
     * Pause playback
     */
    pausePlayback() {
        this.isPlaying = false;
        this.uiElements.playBtn.style.display = 'flex';
        this.uiElements.pauseBtn.style.display = 'none';
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
        const progress = (this.playbackIndex / this.filteredEvents.length) * 100;
        this.uiElements.timelineProgress.style.width = progress + '%';
        this.uiElements.timelineSlider.style.left = progress + '%';
        this.uiElements.timelineSlider.setAttribute('aria-valuenow', Math.round(progress));

        if (this.playbackIndex < this.filteredEvents.length) {
            const event = this.filteredEvents[this.playbackIndex];
            this.uiElements.currentDate.textContent = this.formatDate(event.date);
            this.showEventDetails(event);
        }
    }

    /**
     * Export filtered events to CSV
     */
    exportToCSV() {
        if (this.filteredEvents.length === 0) {
            this.showNotification('Немає даних для експорту', 'warning');
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

        this.downloadFile(csv, 'events.csv', 'text/csv');
        this.showNotification('Дані експортовані у CSV', 'success');
    }

    /**
     * Export filtered events to JSON
     */
    exportToJSON() {
        if (this.filteredEvents.length === 0) {
            this.showNotification('Немає даних для експорту', 'warning');
            return;
        }

        const json = JSON.stringify(this.filteredEvents, null, 2);
        this.downloadFile(json, 'events.json', 'application/json');
        this.showNotification('Дані експортовані у JSON', 'success');
    }

    /**
     * Download file helper
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
     * Toggle dark/light theme
     */
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeIcon();
    }

    /**
     * Load saved theme
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        this.updateThemeIcon();
    }

    /**
     * Update theme icon
     */
    updateThemeIcon() {
        const isDark = document.body.classList.contains('dark-theme');
        this.uiElements.themeToggle.innerHTML = `<span>${isDark ? '☀️' : '🌙'}</span>`;
    }

    /**
     * Show/hide loading spinner
     */
    showLoading(show) {
        this.uiElements.loadingSpinner.style.display = show ? 'block' : 'none';
    }

    /**
     * Show notification toast
     */
    showNotification(message, type = 'info') {
        this.uiElements.notificationToast.textContent = message;
        this.uiElements.notificationToast.className = `notification-toast ${type}`;
        this.uiElements.notificationToast.style.display = 'block';

        setTimeout(() => {
            this.uiElements.notificationToast.style.display = 'none';
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
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Get text color based on theme
     */
    getTextColor() {
        return document.body.classList.contains('dark-theme') ? '#f5f5f5' : '#1a1a2e';
    }

    /**
     * Get grid color based on theme
     */
    getGridColor() {
        return document.body.classList.contains('dark-theme') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CivilizationSphere();
});
