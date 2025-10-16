// Geopolitical Events Platform
class GeopoliticalApp {
    constructor() {
        this.events = [];
        this.categories = [];
        this.regions = [];
        this.filteredEvents = [];
        this.map = null;
        this.markers = [];
        this.selectedEvent = null;
        this.timelineAnimation = null;
        this.charts = {};
        this.heatmapLayer = null;
        this.connectionLines = [];
        this.importBuffer = [];
        this.nextId = 100000; // for generating unique IDs for imported events
        this.importSettings = {
            format: 'auto',
            dateFormat: 'auto',
            dedupMode: 'auto',
            importMode: 'append',
            fieldMapping: {}
        };
        
        // Enhanced properties for mobile and playback
        this.isPlaying = false;
        this.isReady = false;
        this._startupTelemetry = { startedAt: performance.now?.() || Date.now(), marks: [] };
        this.playbackSpeed = 1;
        this.currentPlaybackIndex = 0;
        this.playbackEvents = [];
        this.isMobile = window.innerWidth <= 768;
        this.theme = 'dark';
        this.sidebarVisible = false;
        
        // Touch handling
        this.touchHandler = new TouchHandler(this);
        this.cameraController = new SmartCameraController(this);
        this.zoomLabelEl = document.getElementById('zoomLabel');
        this.zoomLabelHideTimer = null;
        
        this.initializeData();
        this.initializeApp();
        this.setupEventListeners();
    }

    initializeData() {
        // Enhanced data with the provided Ukrainian geopolitical events
        this.events = [
            // Keep existing events for demo
            {
                id: 1,
                title: "Підготовка Європи до війни з Росією",
                channel: "Неаполітичні",
                date: "2024-10-10",
                category: "Війни та конфлікти",
                region: "Європа",
                country: "ЄС",
                lat: 50.8503,
                lng: 4.3517,
                description: "Аналіз підготовки європейських країн до потенційного конфлікту",
                participants: ["ЄС", "НАТО", "Росія"],
                impact: "Зростання напруженості",
                importance: 9,
                sources: ["Неаполітичні YouTube"]
            },
            {
                id: 2,
                title: "Падіння режиму Асада в Сирії",
                channel: "Неаполітичні",
                date: "2024-09-27",
                category: "Політичні зміни",
                region: "Близький Схід",
                country: "Сирія",
                lat: 33.5138,
                lng: 36.2765,
                description: "Аналіз падіння режиму Башара Асада",
                participants: ["Сирія", "Росія", "Іран"],
                impact: "Зміна балансу на Близькому Сході",
                importance: 8,
                sources: ["Неаполітичні YouTube"]
            },
            {
                id: 3,
                title: "Global Britain після Brexit",
                channel: "Good Times Bad Times UA",
                date: "2024-10-08",
                category: "Політичні зміни",
                region: "Європа",
                country: "Великобританія",
                lat: 51.5074,
                lng: -0.1278,
                description: "Нова глобальна роль Великобританії",
                participants: ["Великобританія", "ЄС", "США"],
                impact: "Переформатування британської політики",
                importance: 6,
                sources: ["GTBT UA YouTube"]
            },
            {
                id: 4,
                title: "Ядерна гонка озброєнь",
                channel: "Good Times Bad Times UA",
                date: "2024-09-27",
                category: "Технологічні зміни",
                region: "Глобально",
                country: "Світ",
                lat: 0,
                lng: 0,
                description: "Нова ядерна гонка озброєнь",
                participants: ["США", "Китай", "Росія"],
                impact: "Трансформація енергетики",
                importance: 8,
                sources: ["GTBT UA YouTube"]
            },
            {
                id: 5,
                title: "90% чіпів виробляються в Тайвані",
                channel: "Чотири сторони",
                date: "2024-08-26",
                category: "Технологічні зміни",
                region: "Азія",
                country: "Тайвань",
                lat: 25.0330,
                lng: 121.5654,
                description: "Домінування Тайваню у виробництві чіпів",
                participants: ["Тайвань", "США", "Китай"],
                impact: "Геополітичне значення технологій",
                importance: 9,
                sources: ["Чотири сторони YouTube"]
            },
            {
                id: 6,
                title: "NEOM - місто за $8 трлн",
                channel: "Чотири сторони",
                date: "2024-08-03",
                category: "Економічні зміни",
                region: "Близький Схід",
                country: "Саудівська Аравія",
                lat: 24.7136,
                lng: 46.6753,
                description: "Футуристичне місто в пустелі",
                participants: ["Саудівська Аравія"],
                impact: "Диверсифікація економіки",
                importance: 6,
                sources: ["Чотири сторони YouTube"]
            },
            {
                id: 7,
                title: "Росія купує бензин у Китаю",
                channel: "Ціна Держави",
                date: "2024-10-08",
                category: "Економічні зміни",
                region: "Азія",
                country: "Росія",
                lat: 55.7558,
                lng: 37.6173,
                description: "Енергетична залежність Росії",
                participants: ["Росія", "Китай"],
                impact: "Санкційний тиск",
                importance: 6,
                sources: ["Ціна Держави YouTube"]
            },
            {
                id: 8,
                title: "Казахстан - успішна диктатура",
                channel: "Ціна Держави",
                date: "2024-09-21",
                category: "Політичні системи",
                region: "Азія",
                country: "Казахстан",
                lat: 51.1694,
                lng: 71.4491,
                description: "Авторитарна модель розвитку",
                participants: ["Казахстан"],
                impact: "Ресурсна економіка",
                importance: 5,
                sources: ["Ціна Держави YouTube"]
            },
            {
                id: 1,
                title: "Початок Другої світової війни",
                date: "1939-09-01",
                category: "Війни та конфлікти",
                region: "Європа",
                country: "Польща",
                lat: 52.2297,
                lng: 21.0122,
                description: "Німецьке вторгнення в Польщу ознаменувало початок найруйнівнішої війни в історії людства",
                participants: ["Німеччина", "Польща", "Великобританія", "Франція"],
                impact: "Глобальний конфлікт, який змінив геополітичну карту світу",
                sources: ["BBC History", "Encyclopedia Britannica"]
            },
            {
                id: 2,
                title: "Утворення НАТО",
                date: "1949-04-04",
                category: "Союзи та договори",
                region: "Північна Америка",
                country: "США",
                lat: 38.9072,
                lng: -77.0369,
                description: "Підписання Północноатлантичного договору для колективної безпеки",
                participants: ["США", "Канада", "Великобританія", "Франція", "Італія"],
                impact: "Формування біполярного світу часів Холодної війни",
                sources: ["NATO Official", "US State Department"]
            },
            {
                id: 3,
                title: "Падіння Берлінської стіни",
                date: "1989-11-09",
                category: "Політичні зміни",
                region: "Європа",
                country: "Німеччина",
                lat: 52.5200,
                lng: 13.4050,
                description: "Символічне завершення Холодної війни та поділу Європи",
                participants: ["Східна Німеччина", "Західна Німеччина", "СССР"],
                impact: "Об'єднання Німеччини та початок краху комуністичного блоку",
                sources: ["Deutsche Welle", "History Channel"]
            },
            {
                id: 4,
                title: "Розпад СРСР",
                date: "1991-12-26",
                category: "Політичні зміни",
                region: "Євразія",
                country: "Росія",
                lat: 55.7558,
                lng: 37.6173,
                description: "Офіційне припинення існування Радянського Союзу",
                participants: ["СРСР", "15 союзних республік"],
                impact: "Кінець біполярного світу, поява нових незалежних держав",
                sources: ["Kremlin Archives", "BBC"]
            },
            {
                id: 5,
                title: "Утворення Європейського Союзу",
                date: "1993-11-01",
                category: "Союзи та договори",
                region: "Європа",
                country: "Бельгія",
                lat: 50.8503,
                lng: 4.3517,
                description: "Набрання чинності Маастрихтським договором, що створив ЄС",
                participants: ["12 країн-засновниць ЄС"],
                impact: "Поглиблення європейської інтеграції та створення єдиної валюти",
                sources: ["EU Official", "European Council"]
            },
            {
                id: 6,
                title: "Теракти 11 вересня",
                date: "2001-09-11",
                category: "Тероризм",
                region: "Північна Америка",
                country: "США",
                lat: 40.7128,
                lng: -74.0060,
                description: "Терористичні атаки Аль-Каїди на Всесвітній торговий центр та Пентагон",
                participants: ["Аль-Каїда", "США"],
                impact: "Початок глобальної війни з тероризмом, зміна міжнародної безпекової політики",
                sources: ["9/11 Commission Report", "FBI"]
            },
            {
                id: 7,
                title: "Вторгнення Росії в Україну",
                date: "2022-02-24",
                category: "Війни та конфлікти",
                region: "Європа",
                country: "Україна",
                lat: 50.4501,
                lng: 30.5234,
                description: "Повномасштабне вторгнення Російської Федерації в Україну",
                participants: ["Росія", "Україна", "НАТО", "ЄС"],
                impact: "Найбільший конфлікт в Європі після Другої світової війни",
                sources: ["UN Security Council", "Reuters", "BBC"]
            },
            {
                id: 8,
                title: "Brexit - вихід Великобританії з ЄС",
                date: "2020-01-31",
                category: "Політичні зміни",
                region: "Європа",
                country: "Великобританія",
                lat: 51.5074,
                lng: -0.1278,
                description: "Офіційний вихід Великобританії з Європейського Союзу",
                participants: ["Великобританія", "Європейський Союз"],
                impact: "Перший випадок виходу країни з ЄС, вплив на європейську інтеграцію",
                sources: ["UK Parliament", "European Commission"]
            },
            {
                id: 9,
                title: "Пандемія COVID-19",
                date: "2020-03-11",
                category: "Глобальні кризи",
                region: "Глобально",
                country: "Світ",
                lat: 0,
                lng: 0,
                description: "ВООЗ оголосила пандемію COVID-19",
                participants: ["Всі країни світу", "ВООЗ"],
                impact: "Глобальна економічна криза, зміна міжнародних відносин",
                sources: ["WHO", "Johns Hopkins University"]
            },
            {
                id: 10,
                title: "Китайська економічна реформа",
                date: "1978-12-18",
                category: "Економічні зміни",
                region: "Азія",
                country: "Китай",
                lat: 39.9042,
                lng: 116.4074,
                description: "Початок економічних реформ Ден Сяопіна в Китаї",
                participants: ["КНР", "Ден Сяопін"],
                impact: "Перетворення Китаю на другу економіку світу",
                sources: ["Chinese Government", "World Bank"]
            }
        ];

        this.categories = [
            { name: "Війни та конфлікти", color: "#e74c3c", icon: "⚔️", count: 0 },
            { name: "Політичні зміни", color: "#9b59b6", icon: "🏛️", count: 0 },
            { name: "Економічні зміни", color: "#27ae60", icon: "💰", count: 0 },
            { name: "Технологічні зміни", color: "#3498db", icon: "⚡", count: 0 },
            { name: "Політичні системи", color: "#c0392b", icon: "⚖️", count: 0 },
            { name: "Союзи та договори", color: "#f39c12", icon: "🤝", count: 0 },
            { name: "Тероризм", color: "#34495e", icon: "💥", count: 0 },
            { name: "Глобальні кризи", color: "#e67e22", icon: "🌍", count: 0 },
            // Additional categories to align with imported resources
            { name: "Культурні зміни", color: "#e84393", icon: "🎭", count: 0 },
            { name: "Інфраструктурні проекти", color: "#7f8c8d", icon: "🏗️", count: 0 },
            { name: "Військові аналізи", color: "#2c3e50", icon: "🛡️", count: 0 },
            { name: "Соціально-економічні моделі", color: "#1abc9c", icon: "📊", count: 0 },
            { name: "Економічні моделі", color: "#2ecc71", icon: "📈", count: 0 }
        ];
        
        this.channels = [
            { name: "Неаполітичні", color: "#e74c3c" },
            { name: "Good Times Bad Times UA", color: "#3498db" },
            { name: "Чотири сторони", color: "#f39c12" },
            { name: "Ціна Держави", color: "#27ae60" }
        ];

        this.regions = ["Європа", "Азія", "Близький Схід", "Північна Америка", "Євразія", "Глобально", "Африка/Європа"];
        
        // Calculate category counts
        this.categories.forEach(category => {
            category.count = this.events.filter(event => event.category === category.name).length;
        });

        this.filteredEvents = [...this.events];
    }

    async initializeApp() {
        this.showLoading();
        
        try {
            this.setupTheme();
            this._mark('init:map:start');
            await this.initializeMap();
            this._mark('init:map:end');
            this.initializeFilters();
            this.initializeSearch();
            // Build timeline structure but do not auto-play
            this.initializeTimeline();
            this.initializeEventHandlers();
            this.initializeCharts();
            this.setupMobileOptimizations();
            this.updateDisplay();
            // Show ready overlay until user explicitly presses Play
            this.showTimelineReadyOverlay();
            // Opportunistic bootstrap of local CSV with Ukrainian channels/events (deferred)
            setTimeout(() => this.tryBootstrapLocalResourcesSafe(), 0);
        } catch (error) {
            this._telemetryError('init:fatal', error);
            console.error('Error initializing app:', error);
        } finally {
            this.hideLoading();
        }
    }

    _mark(label) {
        try {
            const t = performance.now?.() || Date.now();
            this._startupTelemetry.marks.push({ label, t });
        } catch (_) {}
    }

    _telemetryError(stage, error) {
        try {
            const err = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { message: String(error) };
            (this._startupTelemetry.errors ||= []).push({ stage, err, t: performance.now?.() || Date.now() });
        } catch (_) {}
    }
    
    setupTheme() {
        // Set initial theme
        document.body.classList.add('dark-theme');
        
        // Theme toggle handlers
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.switchTheme(theme);
                if (window.lucide?.createIcons) {
                    // Re-render icons in case of dynamic DOM changes
                    window.lucide.createIcons();
                }
            });
        });
    }
    
    switchTheme(theme) {
        this.theme = theme;
        document.body.className = `${theme}-theme`;
        
        // Update active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // Reinitialize map tiles for theme
        if (this.map) {
            this.map.eachLayer(layer => {
                if (layer.options && layer.options.id === 'tileLayer') {
                    this.map.removeLayer(layer);
                }
            });
            this.addMapTileLayer();
        }
    }
    
    setupMobileOptimizations() {
        if (this.isMobile) {
            // Setup mobile menu toggle
            const menuToggle = document.getElementById('mobileMenuToggle');
            menuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
            
            // Setup mobile touch gestures
            this.touchHandler.initialize();
            
            // Show mobile touch hints
            setTimeout(() => {
                const hints = document.querySelector('.mobile-touch-controls');
                if (hints) hints.style.display = 'block';
            }, 2000);
        }
    }
    
    toggleMobileMenu() {
        this.sidebarVisible = !this.sidebarVisible;
        const sidebar = document.getElementById('leftSidebar');
        const menuToggle = document.getElementById('mobileMenuToggle');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (this.sidebarVisible) {
            sidebar.classList.add('mobile-visible');
            menuToggle.classList.add('active');
            if (!overlay) {
                const overlayElement = document.createElement('div');
                overlayElement.className = 'sidebar-overlay';
                overlayElement.addEventListener('click', () => this.toggleMobileMenu());
                document.body.appendChild(overlayElement);
            }
            setTimeout(() => {
                document.querySelector('.sidebar-overlay').classList.add('visible');
            }, 10);
        } else {
            sidebar.classList.remove('mobile-visible');
            menuToggle.classList.remove('active');
            const overlayElement = document.querySelector('.sidebar-overlay');
            if (overlayElement) {
                overlayElement.classList.remove('visible');
                setTimeout(() => {
                    overlayElement.remove();
                }, 250);
            }
        }
    }

    toggleRightSidebar(forceState) {
        const sidebar = document.getElementById('rightSidebar');
        const toggleBtn = document.getElementById('rightSidebarToggle');
        if (!sidebar) return;

        // Match CSS breakpoint: overlay behavior up to 1024px, desktop otherwise
        const isOverlayMode = window.innerWidth <= 1024;
        const isCurrentlyOpen = isOverlayMode
            ? sidebar.classList.contains('open')
            : !sidebar.classList.contains('collapsed');

        const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

        if (shouldOpen) {
            if (isOverlayMode) {
                sidebar.classList.add('open');
            } else {
                sidebar.classList.remove('collapsed');
            }
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
            sidebar.setAttribute('aria-hidden', 'false');
        } else {
            if (isOverlayMode) {
                sidebar.classList.remove('open');
            } else {
                sidebar.classList.add('collapsed');
            }
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            sidebar.setAttribute('aria-hidden', 'true');
        }
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    async initializeMap() {
        // Show map loading indicator
        const loadingIndicator = document.getElementById('mapLoading');
        loadingIndicator.classList.add('visible');
        
        // Initialize Leaflet map with enhanced mobile options
        this.map = L.map('map', {
            center: [50, 10],
            zoom: 3,
            zoomControl: !this.isMobile, // Hide default zoom on mobile
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true,
            tap: true,
            tapTolerance: 15,
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true,
            bounceAtZoomLimits: true,
            wheelDebounceTime: 60,
            wheelPxPerZoomLevel: 60
        });
        
        // Add custom zoom control for mobile
        if (this.isMobile) {
            const customZoomControl = L.control.zoom({
                position: 'bottomright'
            });
            customZoomControl.addTo(this.map);
        }
        
        // Add tile layer based on theme
        this.addMapTileLayer();
        
        // Initialize smart camera controller
        this.cameraController.initialize();
        
        // Setup map event handlers
        this.setupMapEventHandlers();
        
        // Add markers
        this.addMarkersToMap();
        
        // Hide loading indicator
        setTimeout(() => {
            loadingIndicator.classList.remove('visible');
        }, 1000);
    }
    
    addMapTileLayer() {
        const isDark = this.theme === 'dark';
        const tileUrl = isDark 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
            
        const tileLayer = L.tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 18,
            id: 'tileLayer'
        });
        
        tileLayer.addTo(this.map);
    }
    
    setupMapEventHandlers() {
        this.map.on('movestart', () => {
            document.querySelector('.map-loading').style.opacity = '0.3';
        });
        
        this.map.on('moveend', () => {
            document.querySelector('.map-loading').style.opacity = '0';
        });
        
        this.map.on('zoomstart', () => {
            this.markers.forEach(marker => {
                marker.setOpacity(0.7);
            });
            this.updateZoomLabel();
        });
        
        this.map.on('zoom', () => {
            this.updateZoomLabel();
        });

        this.map.on('zoomend', () => {
            this.markers.forEach(marker => {
                marker.setOpacity(1);
            });
            this.queueHideZoomLabel();
        });
    }

    updateZoomLabel() {
        if (!this.zoomLabelEl) return;
        const zoom = this.map ? this.map.getZoom() : null;
        if (zoom == null) return;
        const zoomText = `Zoom ${zoom.toFixed(1)}`;
        if (this.zoomLabelEl.textContent !== zoomText) {
            this.zoomLabelEl.textContent = zoomText;
        }
        this.positionZoomLabel();
        this.zoomLabelEl.classList.add('visible');
        this.zoomLabelEl.setAttribute('aria-hidden', 'false');
        if (this.zoomLabelHideTimer) {
            clearTimeout(this.zoomLabelHideTimer);
            this.zoomLabelHideTimer = null;
        }
    }

    queueHideZoomLabel() {
        if (!this.zoomLabelEl) return;
        if (this.zoomLabelHideTimer) clearTimeout(this.zoomLabelHideTimer);
        this.zoomLabelHideTimer = setTimeout(() => {
            this.zoomLabelEl.classList.remove('visible');
            this.zoomLabelEl.setAttribute('aria-hidden', 'true');
        }, 500);
    }

    positionZoomLabel() {
        if (!this.zoomLabelEl) return;
        const mapContainer = document.querySelector('.map-container');
        const controls = document.querySelector('.map-controls');
        if (!mapContainer) return;

        const mapRect = mapContainer.getBoundingClientRect();
        let topPx = 16; // fallback spacing

        if (controls) {
            const controlsRect = controls.getBoundingClientRect();
            const controlsAreTop = controlsRect.top <= mapRect.top + 20; // threshold near top
            if (controlsAreTop) {
                topPx = Math.max(16, Math.round(controlsRect.bottom - mapRect.top + 8));
            }
        }

        // Clamp within container height
        const maxTop = Math.max(0, mapRect.height - 40); // avoid bottom cutoff
        const clampedTop = Math.min(topPx, maxTop);
        this.zoomLabelEl.style.top = `${clampedTop}px`;
    }

    addMarkersToMap() {
        // Clear existing markers and connections
        this.clearMarkersAndConnections();

        this.filteredEvents.forEach(event => {
            const category = this.categories.find(cat => cat.name === event.category);
            const channel = this.channels.find(ch => ch.name === event.channel);
            const color = category ? category.color : '#333';
            const icon = category ? category.icon : '📍';

            // Create enhanced marker with importance-based sizing
            const radius = Math.max(6, Math.min(16, event.importance * 1.5));
            
            const marker = L.circleMarker([event.lat, event.lng], {
                radius: radius,
                fillColor: color,
                color: channel ? channel.color : '#fff',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.8,
                className: 'map-marker'
            });

            // Add enhanced popup with channel info
            const popupContent = `
                <div class="marker-popup">
                    <div class="popup-header">
                        <span class="popup-icon">${icon}</span>
                        <h4>${event.title}</h4>
                    </div>
                    <div class="popup-meta">
                        <p><strong>📅 Дата:</strong> ${this.formatDate(event.date)}</p>
                        <p><strong>📂 Категорія:</strong> ${event.category}</p>
                        <p><strong>🌍 Регіон:</strong> ${event.region}</p>
                        <p><strong>📺 Канал:</strong> <span style="color: ${channel?.color}">${event.channel}</span></p>
                        <p><strong>⭐ Важливість:</strong> ${event.importance}/10</p>
                    </div>
                    <div class="popup-actions">
                        <button onclick="app.selectEvent(${event.id})" class="btn btn--sm btn--primary">Детальніше</button>
                        <button onclick="app.shareEvent(${event.id})" class="btn btn--sm btn--outline">📤 Поділитися</button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });
            
            // Enhanced click handler with animation
            marker.on('click', (e) => {
                this.selectEvent(event.id);
                e.target.getElement().classList.add('highlight');
                setTimeout(() => {
                    e.target.getElement().classList.remove('highlight');
                }, 1000);
            });

            // Store event data with marker
            marker.eventData = event;
            marker.addTo(this.map);
            this.markers.push(marker);
        });
        
        // Add connections if enabled
        if (document.getElementById('connectionsToggle')?.classList.contains('active')) {
            this.addConnectionLines();
        }
    }
    
    clearMarkersAndConnections() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        this.connectionLines.forEach(line => this.map.removeLayer(line));
        this.connectionLines = [];
    }
    
    addConnectionLines() {
        // Connect related events (same region or participants)
        for (let i = 0; i < this.filteredEvents.length; i++) {
            for (let j = i + 1; j < this.filteredEvents.length; j++) {
                const event1 = this.filteredEvents[i];
                const event2 = this.filteredEvents[j];
                
                // Check if events are related
                const sameRegion = event1.region === event2.region;
                const sharedParticipants = event1.participants.some(p => event2.participants.includes(p));
                const timeDiff = Math.abs(new Date(event1.date) - new Date(event2.date)) / (1000 * 60 * 60 * 24);
                const sameChannel = event1.channel === event2.channel;
                
                if ((sameRegion || sharedParticipants || sameChannel) && timeDiff < 365) {
                    const line = L.polyline(
                        [[event1.lat, event1.lng], [event2.lat, event2.lng]], 
                        {
                            color: '#32a8b8',
                            weight: 2,
                            opacity: 0.6,
                            dashArray: '5, 10',
                            className: 'event-connection-line'
                        }
                    );
                    
                    line.addTo(this.map);
                    this.connectionLines.push(line);
                }
            }
        }
    }

    initializeFilters() {
        // Quick filters
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyQuickFilter(btn.dataset.filter);
            });
        });
        
        // Category filters with icons
        const categoryContainer = document.getElementById('categoryFilters');
        categoryContainer.innerHTML = '';

        this.categories.forEach(category => {
            const checkboxHtml = `
                <div class="checkbox-item" data-category="${category.name}">
                    <input type="checkbox" id="cat-${category.name}" value="${category.name}" checked>
                    <label for="cat-${category.name}">
                        <span class="category-icon">${category.icon}</span>
                        ${category.name} (${category.count})
                    </label>
                    <div class="category-color" style="background-color: ${category.color}"></div>
                </div>
            `;
            categoryContainer.insertAdjacentHTML('beforeend', checkboxHtml);
        });

        // Region filter
        const regionSelect = document.getElementById('regionFilter');
        this.regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });

        // Set default date range to cover entire dataset
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        const validDates = this.events
            .map(e => new Date(e.date))
            .filter(d => !isNaN(d));
        const minDate = validDates.length ? new Date(Math.min(...validDates)) : new Date('1930-01-01');
        const maxDate = validDates.length ? new Date(Math.max(...validDates)) : new Date('2025-12-31');
        dateFrom.value = minDate.toISOString().slice(0, 10);
        dateTo.value = maxDate.toISOString().slice(0, 10);

        // Add event listeners
        categoryContainer.addEventListener('change', () => this.applyFilters());
        regionSelect.addEventListener('change', () => this.applyFilters());
        dateFrom.addEventListener('change', () => this.applyFilters());
        dateTo.addEventListener('change', () => this.applyFilters());

        // Apply initial filters using the full dataset date range
        this.applyFilters();
    }
    
    applyQuickFilter(filter) {
        const now = new Date();
        let filterFunction;
        
        switch(filter) {
            case 'recent':
                filterFunction = (event) => {
                    const eventDate = new Date(event.date);
                    const daysDiff = (now - eventDate) / (1000 * 60 * 60 * 24);
                    return daysDiff <= 90; // Last 3 months
                };
                break;
            case 'conflicts':
                filterFunction = (event) => {
                    return event.category === 'Війни та конфлікти' || 
                           event.participants.some(p => ['Росія', 'Україна', 'НАТО'].includes(p));
                };
                break;
            case 'important':
                filterFunction = (event) => event.importance >= 8;
                break;
            default:
                filterFunction = () => true;
        }
        
        this.filteredEvents = this.events.filter(filterFunction);
        this.updateDisplay();
        this.rebuildTimeline();
    }

    initializeSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchSuggestions = document.getElementById('searchSuggestions');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length < 2) {
                searchSuggestions.style.display = 'none';
                searchInput.setAttribute('aria-expanded', 'false');
                return;
            }

            const matches = this.events.filter(event => 
                (event.title && event.title.toLowerCase().includes(query)) ||
                (event.description && event.description.toLowerCase().includes(query)) ||
                (event.country && event.country.toLowerCase().includes(query))
            ).slice(0, 8);

            if (matches.length > 0) {
                searchSuggestions.innerHTML = matches.map((event, idx) => 
                    `<div class="search-suggestion" role="option" id="suggestion-${idx}" onclick="app.selectEventAndSearch(${event.id}, '${event.title.replace(/'/g, "&#39;")}')">
                        ${event.title} (${this.formatDate(event.date)})
                    </div>`
                ).join('');
                searchSuggestions.style.display = 'block';
                searchInput.setAttribute('aria-expanded', 'true');
            } else {
                searchSuggestions.style.display = 'none';
                searchInput.setAttribute('aria-expanded', 'false');
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
                searchInput.setAttribute('aria-expanded', 'false');
            }
        });
    }

    selectEventAndSearch(eventId, title) {
        const input = document.getElementById('searchInput');
        const suggestions = document.getElementById('searchSuggestions');
        input.value = title;
        suggestions.style.display = 'none';
        input.setAttribute('aria-expanded', 'false');
        this.selectEvent(eventId);
    }

    initializeTimeline() {
        const timeline = document.getElementById('timeline');
        const scale = document.getElementById('timelineScale');

        // Sort currently visible (filtered) events by date
        const sortedEvents = [...this.filteredEvents]
            .filter(e => !isNaN(new Date(e.date)))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Reset container state
        timeline.innerHTML = '';
        scale.innerHTML = '';

        if (sortedEvents.length === 0) {
            this.isReady = false;
            return;
        }

        const firstDate = new Date(sortedEvents[0].date);
        const lastDate = new Date(sortedEvents[sortedEvents.length - 1].date);
        const minYear = firstDate.getFullYear();
        const maxYear = lastDate.getFullYear();
        const yearRange = Math.max(0, maxYear - minYear);

        // Calculate positions for all events first
        const eventPositions = sortedEvents.map((event, idx) => {
            const eventDate = new Date(event.date);
            const eventYear = eventDate.getFullYear();

            // Handle short or zero ranges gracefully
            let position;
            if (yearRange === 0) {
                const denom = Math.max(sortedEvents.length - 1, 1);
                position = (idx / denom) * 100;
            } else {
                position = ((eventYear - minYear) / yearRange) * 100;
            }

            const size = Math.max(8, Math.min(18, (Number(event.importance) || 5) * 1.2));
            
            return {
                event,
                position,
                size,
                row: 0 // Will be calculated for collision detection
            };
        });

        // Collision detection and vertical stacking
        // Group events that are within a certain threshold (2% of timeline width)
        const COLLISION_THRESHOLD = 2; // percentage
        
        for (let i = 0; i < eventPositions.length; i++) {
            const current = eventPositions[i];
            let maxRowBelow = -1;
            
            // Check all previous events for collisions
            for (let j = 0; j < i; j++) {
                const other = eventPositions[j];
                const distance = Math.abs(current.position - other.position);
                
                // If events overlap or are very close
                if (distance < COLLISION_THRESHOLD) {
                    maxRowBelow = Math.max(maxRowBelow, other.row);
                }
            }
            
            // Place current event in the next available row
            current.row = maxRowBelow + 1;
        }

        // Calculate the maximum number of rows needed
        const maxRows = Math.max(...eventPositions.map(ep => ep.row), 0) + 1;
        
        // Adjust timeline height if needed (with a reasonable max)
        const baseHeight = 60;
        const rowHeight = 20;
        const calculatedHeight = Math.min(baseHeight + (maxRows - 1) * rowHeight, 120);
        // Set height on the timeline element
        timeline.style.height = `${calculatedHeight}px`;
        timeline.style.minHeight = `${calculatedHeight}px`;

        // Add events to timeline with collision-aware positioning
        eventPositions.forEach(({ event, position, size, row }) => {
            const eventDate = new Date(event.date);
            const eventYear = eventDate.getFullYear();
            
            const category = this.categories.find(cat => cat.name === event.category);
            const color = category ? category.color : '#333';

            const eventElement = document.createElement('div');
            eventElement.className = 'timeline-event';
            eventElement.style.left = `${position}%`;
            eventElement.style.backgroundColor = color;
            eventElement.dataset.eventId = event.id;
            eventElement.style.width = `${size}px`;
            eventElement.style.height = `${size}px`;
            
            // Apply vertical offset based on row
            // Center events when there are multiple rows
            const verticalOffset = row * rowHeight - ((maxRows - 1) * rowHeight) / 2;
            // Use CSS variable or direct positioning without conflicting with transform
            // We need to override the default 50% transform with an absolute position
            eventElement.style.top = `${50 + (verticalOffset / calculatedHeight * 100)}%`;
            eventElement.style.transform = 'translate(-50%, -50%)';

            const tooltip = document.createElement('div');
            tooltip.className = 'timeline-tooltip';
            tooltip.textContent = `${event.title} (${eventYear}) • ${event.region}`;
            eventElement.appendChild(tooltip);

            // Adjust tooltip position for edge events
            if (position < 15) {
                tooltip.style.left = '0';
                tooltip.style.transform = 'translateX(0)';
            } else if (position > 85) {
                tooltip.style.left = 'auto';
                tooltip.style.right = '0';
                tooltip.style.transform = 'translateX(0)';
            }

            eventElement.addEventListener('click', () => {
                this.selectEvent(event.id);
            });

            timeline.appendChild(eventElement);
        });

        // ===== RESPONSIVE TIMELINE YEAR DISPLAY =====
        // This section implements a dynamic, importance-based year display system:
        // - Desktop: Shows up to 20 most important years
        // - Mobile: Shows up to 7 most important years
        // - Importance is determined by the number of events in each year
        // - First and last years are always displayed for context
        // - Collision detection prevents overlapping labels
        
        // Calculate year importance based on event counts
        const yearEventCounts = {};
        sortedEvents.forEach(event => {
            const eventYear = new Date(event.date).getFullYear();
            yearEventCounts[eventYear] = (yearEventCounts[eventYear] || 0) + 1;
        });
        
        // Create array of years with their importance (event count)
        const allYears = [];
        for (let year = minYear; year <= maxYear; year++) {
            allYears.push({
                year: year,
                eventCount: yearEventCounts[year] || 0,
                position: yearRange === 0 ? 50 : ((year - minYear) / yearRange) * 100
            });
        }
        
        // Sort years by importance (event count descending), then by year
        const sortedYears = [...allYears].sort((a, b) => {
            if (b.eventCount !== a.eventCount) {
                return b.eventCount - a.eventCount; // Most events first
            }
            return a.year - b.year; // Same count: chronological order
        });
        
        // Determine max years based on screen size
        const isMobile = window.innerWidth <= 768;
        const maxYearsToDisplay = isMobile ? 7 : 20; // Mobile: 7 years, Desktop: 20 years
        
        // Select top N most important years
        let yearsToDisplay = sortedYears.slice(0, Math.min(maxYearsToDisplay, sortedYears.length));
        
        // Always include first and last year if not already included
        const firstYearObj = allYears.find(y => y.year === minYear);
        const lastYearObj = allYears.find(y => y.year === maxYear);
        
        if (!yearsToDisplay.some(y => y.year === minYear) && firstYearObj) {
            yearsToDisplay.push(firstYearObj);
        }
        if (!yearsToDisplay.some(y => y.year === maxYear) && lastYearObj && yearRange > 0) {
            yearsToDisplay.push(lastYearObj);
        }
        
        // Remove duplicates and sort by position for rendering
        const uniqueYears = [];
        const seenYears = new Set();
        yearsToDisplay.forEach(yearObj => {
            if (!seenYears.has(yearObj.year)) {
                seenYears.add(yearObj.year);
                uniqueYears.push(yearObj);
            }
        });
        
        // Sort by position for proper left-to-right ordering
        uniqueYears.sort((a, b) => a.position - b.position);
        
        // Add year markers with collision detection
        // Increased spacing to prevent overlap: mobile needs more space due to smaller screen
        const YEAR_LABEL_MIN_SPACING = isMobile ? 15 : 6; // More spacing on mobile (increased from 12/5)
        const addedYears = [];
        
        uniqueYears.forEach(({ year, position, eventCount }) => {
            // Check if this year would collide with any already added years
            const wouldCollide = addedYears.some(addedYear => {
                return Math.abs(addedYear.position - position) < YEAR_LABEL_MIN_SPACING;
            });
            
            // Always add first and last year, skip others if they would collide
            const isEdgeYear = year === minYear || year === maxYear;
            if (!wouldCollide || isEdgeYear) {
                // If it's an edge year that would collide, remove the colliding year
                if (isEdgeYear && wouldCollide) {
                    const collidingIndex = addedYears.findIndex(addedYear => 
                        Math.abs(addedYear.position - position) < YEAR_LABEL_MIN_SPACING
                    );
                    if (collidingIndex !== -1) {
                        const collidingElement = addedYears[collidingIndex].element;
                        if (collidingElement && collidingElement.parentNode) {
                            collidingElement.parentNode.removeChild(collidingElement);
                        }
                        addedYears.splice(collidingIndex, 1);
                    }
                }
                
                const yearElement = document.createElement('div');
                yearElement.className = 'timeline-year';
                yearElement.style.left = `${position}%`;
                yearElement.textContent = year;
                
                // Add visual emphasis for years with many events
                if (eventCount >= 5) {
                    yearElement.style.fontWeight = '700'; // Extra bold for important years
                    yearElement.style.color = 'var(--color-primary)';
                    yearElement.style.borderColor = 'var(--color-primary)';
                    yearElement.style.borderWidth = '2px';
                    yearElement.setAttribute('data-importance', 'high');
                } else if (eventCount >= 2) {
                    yearElement.style.fontWeight = '600'; // Semi-bold for moderate years
                    yearElement.setAttribute('data-importance', 'medium');
                } else {
                    yearElement.setAttribute('data-importance', 'low');
                }
                
                // Mark edge years for reference
                if (year === minYear || year === maxYear) {
                    yearElement.setAttribute('data-edge', 'true');
                }
                
                scale.appendChild(yearElement);
                
                addedYears.push({ year, position, element: yearElement, eventCount });
            }
        });

        // Ensure timeline playhead exists and is appended to the timeline
        let playhead = document.getElementById('timelinePlayhead');
        if (!playhead) {
            playhead = document.createElement('div');
            playhead.id = 'timelinePlayhead';
            playhead.className = 'timeline-playhead';
        }
        // Re-append to ensure it's within the freshly rebuilt timeline
        timeline.appendChild(playhead);
        this.isReady = true;
    }

    rebuildTimeline() {
        this.initializeTimeline();
    }

    initializeEventHandlers() {
        // Clear filters button
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Import/Discovery controls
        const scanBtn = document.getElementById('scanSourcesBtn');
        const importBtn = document.getElementById('importBtn');
        const clearBtn = document.getElementById('clearImportBtn');
        const importFileInput = document.getElementById('importFile');

        if (scanBtn) {
            scanBtn.addEventListener('click', () => this.handleScanButton());
        }
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importBufferedEvents());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearImportPreview());
        }
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => this.handleImportFile(e));
        }

        // Import UI controls and behaviors
        this.setupImportUi();

        // Enhanced map controls
        document.getElementById('resetView').addEventListener('click', () => {
            this.cameraController.resetView();
        });
        
        document.getElementById('fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        document.getElementById('layersToggle').addEventListener('click', () => {
            this.toggleLayers();
        });
        
        document.getElementById('heatmapToggle').addEventListener('click', () => {
            this.toggleHeatmap();
        });
        
        document.getElementById('connectionsToggle').addEventListener('click', () => {
            this.toggleConnections();
        });
        
        document.getElementById('shareMap').addEventListener('click', () => {
            this.shareCurrentView();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Right sidebar toggle on larger screens too
        const rightToggle = document.getElementById('rightSidebarToggle');
        if (rightToggle) {
            rightToggle.addEventListener('click', () => this.toggleRightSidebar());
        }

        // Enhanced timeline controls
        document.getElementById('timelinePlay').addEventListener('click', () => {
            this.hideTimelineReadyOverlay();
            this.playTimelineAnimation();
        });

        document.getElementById('timelinePause').addEventListener('click', () => {
            this.pauseTimelineAnimation();
        });

        document.getElementById('timelineReset').addEventListener('click', () => {
            this.resetTimelineAnimation();
        });
        
        // Speed control
        document.getElementById('playbackSpeed').addEventListener('change', (e) => {
            this.playbackSpeed = parseFloat(e.target.value);
        });
        
        // Progress bar interaction
        const progressBar = document.getElementById('timelineProgressBar');
        progressBar.addEventListener('click', (e) => {
            this.seekToProgress(e);
        });

        // Ready overlay explicit play
        const readyBtn = document.getElementById('timelineReadyPlayBtn');
        if (readyBtn) {
            readyBtn.addEventListener('click', () => {
                this.hideTimelineReadyOverlay();
                this.playTimelineAnimation();
            });
        }
    }

    setupImportUi() {
        const importFormat = document.getElementById('importFormat');
        const dateFormat = document.getElementById('dateFormat');
        const dedupMode = document.getElementById('dedupMode');
        const importFileInput = document.getElementById('importFile');
        const importModeRadios = Array.from(document.querySelectorAll('input[name="importMode"]'));

        if (importFormat) {
            importFormat.addEventListener('change', (e) => {
                this.importSettings.format = e.target.value || 'auto';
                if (importFileInput) {
                    const fmt = this.importSettings.format;
                    importFileInput.setAttribute('accept', fmt === 'csv' ? '.csv' : (fmt === 'json' ? '.json' : '.csv,.json'));
                }
            });
        }

        if (dateFormat) {
            dateFormat.addEventListener('change', (e) => {
                this.importSettings.dateFormat = e.target.value || 'auto';
            });
        }

        if (dedupMode) {
            dedupMode.addEventListener('change', (e) => {
                this.importSettings.dedupMode = e.target.value || 'auto';
            });
        }

        if (importModeRadios && importModeRadios.length) {
            importModeRadios.forEach(r => r.addEventListener('change', (e) => {
                if (e.target.checked) this.importSettings.importMode = e.target.value;
            }));
        }

        // Initialize mapping listeners (will be populated after CSV is selected)
        const mappingIds = ['map-title','map-date','map-lat','map-lng','map-description','map-category','map-region','map-country','map-importance','map-sources'];
        mappingIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    const key = id.replace('map-','');
                    this.importSettings.fieldMapping[key] = el.value || '';
                });
            }
        });
    }

    setupFieldMappingForCsv(csvText) {
        const headers = this.extractCsvHeaders(csvText);
        if (!headers || !headers.length) return;
        this.refreshFieldMappingOptions(headers);
        // Preselect guesses
        const guess = this.guessMappingFromHeaders(headers);
        this.importSettings.fieldMapping = { ...guess };
        Object.entries(guess).forEach(([key, header]) => {
            const el = document.getElementById(`map-${key}`);
            if (el && header) el.value = header;
        });
    }

    extractCsvHeaders(text) {
        const firstLine = (text.split(/\r?\n/).find(Boolean) || '').trim();
        if (!firstLine) return [];
        const headers = this.splitCsvLine(firstLine).map(h => (h || '').trim());
        return headers;
    }

    refreshFieldMappingOptions(headers) {
        const mappingIds = ['map-title','map-date','map-lat','map-lng','map-description','map-category','map-region','map-country','map-importance','map-sources'];
        mappingIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = '';
            const frag = document.createDocumentFragment();
            const empty = document.createElement('option');
            empty.value = '';
            empty.textContent = '—';
            frag.appendChild(empty);
            headers.forEach(h => {
                const opt = document.createElement('option');
                opt.value = h;
                opt.textContent = h;
                frag.appendChild(opt);
            });
            el.appendChild(frag);
        });
    }

    guessMappingFromHeaders(headers) {
        const lc = headers.map(h => h.toLowerCase());
        const pick = (...candidates) => {
            for (const c of candidates) {
                const idx = lc.indexOf(c);
                if (idx !== -1) return headers[idx];
            }
            return '';
        };
        return {
            title: pick('title','name','headline'),
            date: pick('date','published','publishedat','pubdate','updated','time'),
            lat: pick('lat','latitude','y'),
            lng: pick('lng','longitude','lon','x'),
            description: pick('description','summary','content','desc'),
            category: pick('category','type','topic'),
            region: pick('region','area'),
            country: pick('country','nation','state'),
            importance: pick('importance','priority','score','rank'),
            sources: pick('sources','link','url')
        };
    }

    applyFieldMappingToObject(obj, mapping) {
        if (!mapping) return obj;
        const out = { ...obj };
        const entries = Object.entries(mapping).filter(([, src]) => src);
        const targetToDefault = {
            title: '', date: '', lat: '', lng: '', description: '', category: '', region: '', country: '', importance: '', sources: ''
        };
        const mapped = { ...targetToDefault };
        for (const [target, src] of entries) {
            mapped[target] = obj[src];
        }
        // Preserve unknown fields as-is but prefer mapped values for known targets
        return { ...obj, ...mapped };
    }

    parseDateByFormat(input, format) {
        try {
            if (!input) return '';
            const s = String(input).trim();
            const pad = (n) => n.toString().padStart(2, '0');
            if (format === 'YYYY-MM-DD') {
                const m = s.match(/^(\d{4})[-\/.](\d{2})[-\/.](\d{2})$/);
                if (!m) return '';
                return `${m[1]}-${m[2]}-${m[3]}`;
            }
            if (format === 'DD/MM/YYYY') {
                const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
                if (!m) return '';
                const dd = pad(parseInt(m[1]));
                const mm = pad(parseInt(m[2]));
                const yyyy = m[3];
                return `${yyyy}-${mm}-${dd}`;
            }
            if (format === 'MM/DD/YYYY') {
                const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
                if (!m) return '';
                const mm = pad(parseInt(m[1]));
                const dd = pad(parseInt(m[2]));
                const yyyy = m[3];
                return `${yyyy}-${mm}-${dd}`;
            }
            if (format === 'YYYY-MM-DDTHH:mm:ssZ') {
                const d = new Date(s);
                if (isNaN(d.getTime())) return '';
                return d.toISOString().slice(0,10);
            }
        } catch (_) {}
        return '';
    }

    computeEventDedupKeyByMode(mode, event) {
        const m = (mode || 'auto').toLowerCase();
        if (m === 'off') {
            return `no:${event.id}:${Math.random().toString(36).slice(2)}`;
        }
        if (m === 'title_date_coords') {
            const title = (event.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
            const date = event.date || '';
            const lat = Number.isFinite(event.lat) ? event.lat.toFixed(3) : 'x';
            const lng = Number.isFinite(event.lng) ? event.lng.toFixed(3) : 'x';
            return `tdl:${title}|${date}|${lat}|${lng}`;
        }
        // auto
        return this.computeEventDedupKey(event);
    }

    showValidation(message) {
        const el = document.getElementById('importValidation');
        if (el) el.textContent = message || '';
    }

    initializeCharts() {
        // Category distribution chart
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        this.charts.category = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: this.categories.map(cat => cat.name),
                datasets: [{
                    data: this.categories.map(cat => cat.count),
                    backgroundColor: this.categories.map(cat => cat.color),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Timeline distribution chart
        const timelineCtx = document.getElementById('timelineChart').getContext('2d');
        const timelinePeriods = [
            { period: "1930-1950", events: 1 },
            { period: "1950-1970", events: 1 },
            { period: "1970-1990", events: 2 },
            { period: "1990-2010", events: 4 },
            { period: "2010-2025", events: 2 }
        ];

        this.charts.timeline = new Chart(timelineCtx, {
            type: 'bar',
            data: {
                labels: timelinePeriods.map(p => p.period),
                datasets: [{
                    label: 'Події',
                    data: timelinePeriods.map(p => p.events),
                    backgroundColor: '#32a8b8',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    refreshCharts() {
        // Recompute category counts
        this.categories.forEach(category => {
            category.count = this.events.filter(event => event.category === category.name).length;
        });

        if (this.charts.category) {
            this.charts.category.data.datasets[0].data = this.categories.map(cat => cat.count);
            this.charts.category.update();
        }

        if (this.charts.timeline) {
            // Simple heuristic: recompute by decade buckets
            const counts = new Map();
            this.events.forEach(ev => {
                const y = new Date(ev.date).getFullYear();
                const bucketStart = Math.floor(y / 10) * 10;
                const key = `${bucketStart}-${bucketStart + 10}`;
                counts.set(key, (counts.get(key) || 0) + 1);
            });
            const labels = Array.from(counts.keys()).sort((a,b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]));
            const data = labels.map(l => counts.get(l));
            this.charts.timeline.data.labels = labels;
            this.charts.timeline.data.datasets[0].data = data;
            this.charts.timeline.update();
        }
    }

    applyFilters() {
        const selectedCategories = Array.from(
            document.querySelectorAll('#categoryFilters input[type="checkbox"]:checked')
        ).map(checkbox => checkbox.value);

        const selectedRegion = document.getElementById('regionFilter').value;
        const dateFrom = new Date(document.getElementById('dateFrom').value);
        const dateTo = new Date(document.getElementById('dateTo').value);

        this.filteredEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            
            const categoryMatch = selectedCategories.includes(event.category);
            const regionMatch = !selectedRegion || event.region === selectedRegion;
            const dateMatch = eventDate >= dateFrom && eventDate <= dateTo;

            return categoryMatch && regionMatch && dateMatch;
        });

        this.updateDisplay();
        this.rebuildTimeline();
    }

    clearFilters() {
        // Reset category checkboxes
        document.querySelectorAll('#categoryFilters input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });

        // Reset region filter
        document.getElementById('regionFilter').value = '';

        // Reset date range
        document.getElementById('dateFrom').value = '1930-01-01';
        document.getElementById('dateTo').value = '2025-12-31';

        this.applyFilters();
    }

    updateDisplay() {
        // Update map markers
        this.addMarkersToMap();

        // Update statistics
        document.getElementById('totalEvents').textContent = `Всього подій: ${this.events.length}`;
        document.getElementById('filteredEvents').textContent = `Відфільтровано: ${this.filteredEvents.length}`;

        // Update charts after data changes
        this.refreshCharts();
    }

    selectEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.selectedEvent = event;

        // Update timeline active state
        document.querySelectorAll('.timeline-event').forEach(el => {
            el.classList.remove('active');
        });
        const timelineEvent = document.querySelector(`[data-event-id="${eventId}"]`);
        if (timelineEvent) {
            timelineEvent.classList.add('active');
        }

        // Smart camera transition to event
        this.cameraController.focusOnEvent(event);
        
        // Highlight marker
        this.highlightMarker(event);

        // Update details panel
        this.displayEventDetails(event);
        
        // Close mobile menu if open
        if (this.isMobile && this.sidebarVisible) {
            this.toggleMobileMenu();
        }

        // Ensure right sidebar is visible when an event is selected
        this.toggleRightSidebar(true);
    }
    
    highlightMarker(event) {
        // Reset all markers
        this.markers.forEach(marker => {
            marker.getElement()?.classList.remove('highlight');
        });
        
        // Find and highlight selected marker
        const selectedMarker = this.markers.find(m => 
            m.eventData && m.eventData.id === event.id
        );
        
        if (selectedMarker) {
            selectedMarker.getElement()?.classList.add('highlight');
            setTimeout(() => {
                selectedMarker.getElement()?.classList.remove('highlight');
            }, 2000);
        }
    }

    displayEventDetails(event) {
        const detailsContainer = document.getElementById('eventDetails');
        const category = this.categories.find(cat => cat.name === event.category);
        
        detailsContainer.innerHTML = `
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-date">${this.formatDate(event.date)}</div>
                <div class="event-category" style="background-color: ${category?.color || '#333'}; color: white;">
                    ${event.category}
                </div>
                <p class="event-description">${event.description}</p>
                
                <div class="event-section">
                    <div class="event-section-title">Учасники:</div>
                    <ul class="event-list">
                        ${event.participants.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="event-section">
                    <div class="event-section-title">Вплив:</div>
                    <p>${event.impact}</p>
                </div>
                
                <div class="event-section">
                    <div class="event-section-title">Джерела:</div>
                    <div class="event-sources">
                        ${event.sources.map(source => `<a href="#" class="source-link" target="_blank">${source}</a>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    exportToCSV() {
        const headers = ['ID', 'Назва', 'Канал', 'Дата', 'Категорія', 'Регіон', 'Країна', 'lat', 'lng', 'Опис', 'Учасники', 'Вплив', 'Джерела'];
        const csvContent = [
            headers.join(','),
            ...this.filteredEvents.map(event => [
                event.id,
                `"${event.title}"`,
                `"${event.channel || ''}"`,
                event.date,
                `"${event.category}"`,
                `"${event.region}"`,
                `"${event.country}"`,
                event.lat,
                event.lng,
                `"${event.description}"`,
                `"${event.participants.join('; ')}"`,
                `"${event.impact}"`,
                `"${(event.sources || []).join('; ')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'geopolitical_events.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ===================== IMPORT / DISCOVERY =====================
    setImportStatus(text, progress = null) {
        const status = document.getElementById('importStatusText');
        const fill = document.getElementById('importProgressFill');
        if (status) status.textContent = text;
        if (fill && progress !== null) fill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    }

    clearImportPreview() {
        this.importBuffer = [];
        const list = document.getElementById('importPreviewList');
        const importBtn = document.getElementById('importBtn');
        if (list) list.innerHTML = '';
        if (importBtn) importBtn.disabled = true;
        this.setImportStatus('Очищено', 0);
    }

    appendToImportPreview(events) {
        const list = document.getElementById('importPreviewList');
        if (!list) return;
        const fragment = document.createDocumentFragment();
        events.forEach(ev => {
            const item = document.createElement('div');
            item.className = 'import-preview-item';
            const dateStr = this.formatDate(ev.date);
            item.innerHTML = `
                <div>
                    <strong>${ev.title}</strong>
                    <div class="meta">${dateStr} • ${ev.region || ''} • ${ev.country || ''}</div>
                </div>
                <div>${ev.category || ''}</div>
            `;
            fragment.appendChild(item);
        });
        list.appendChild(fragment);
    }

    handleImportFile(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const content = reader.result;
                let parsed = [];
                const fmtPref = (this.importSettings.format || 'auto').toLowerCase();
                const isJson = fmtPref === 'json' || file.name.toLowerCase().endsWith('.json');
                if (isJson) {
                    const data = JSON.parse(content);
                    parsed = Array.isArray(data) ? data : (data.events || []);
                } else {
                    // CSV
                    this.setupFieldMappingForCsv(content);
                    parsed = this.parseCsv(content);
                    // Apply field mapping and date format if provided
                    const mapping = this.importSettings.fieldMapping || {};
                    const dateFmt = this.importSettings.dateFormat || 'auto';
                    parsed = parsed.map(obj => {
                        const mapped = this.applyFieldMappingToObject(obj, mapping);
                        if (dateFmt && dateFmt !== 'auto' && mapped.date) {
                            const d = this.parseDateByFormat(mapped.date, dateFmt);
                            if (d) mapped.date = d;
                        }
                        return mapped;
                    });
                }

                // Normalize and validate
                const normalized = this.normalizeAndValidateBatch(parsed);
                // Preserve original string IDs for stronger deduplication if present
                normalized.forEach((ev, idx) => {
                    const rawId = parsed[idx]?.id;
                    if (rawId && typeof rawId === 'string' && !Number.isInteger(Number(rawId))) {
                        ev._originalId = String(rawId);
                    }
                });

                // Deduplicate within the imported set
                const seen = new Set();
                const dedupMode = this.importSettings.dedupMode || 'auto';
                const unique = [];
                for (const ev of normalized) {
                    const key = this.computeEventDedupKeyByMode(dedupMode, ev);
                    if (!seen.has(key)) {
                        seen.add(key);
                        unique.push(ev);
                    }
                }

                // Remove items already present in the app (by chosen dedup mode)
                const existingKeys = new Set(this.events.map(ev => this.computeEventDedupKeyByMode(dedupMode, ev)));
                const toBuffer = unique.filter(ev => !existingKeys.has(this.computeEventDedupKeyByMode(dedupMode, ev)));

                const invalidCount = Math.max(0, parsed.length - normalized.length);
                this.showValidation(invalidCount ? `Валідно: ${normalized.length}. Пропущено: ${invalidCount}.` : '');

                this.importBuffer.push(...toBuffer);
                this.appendToImportPreview(toBuffer);
                document.getElementById('importBtn').disabled = this.importBuffer.length === 0;
                this.setImportStatus(`Завантажено з файлу: ${toBuffer.length}`, 30);
            } catch (err) {
                console.error('Import file parse error', err);
                this.showValidation('Помилка читання або парсингу файлу');
                this.showToast('Помилка читання файлу імпорту');
            }
        };
        reader.readAsText(file);
    }

    parseCsv(text) {
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length <= 1) return [];
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => this.splitCsvLine(line));
        return rows.map(cols => {
            const obj = {};
            headers.forEach((h, i) => obj[h] = cols[i]);
            // Normalize some common header variants inline for CSV convenience
            if (obj.lat === undefined && obj.latitude !== undefined) obj.lat = obj.latitude;
            if (obj.lng === undefined && (obj.longitude !== undefined || obj.lon !== undefined)) obj.lng = obj.longitude ?? obj.lon;
            return obj;
        });
    }

    splitCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result.map(s => s.replace(/^\"|\"$/g, ''));
    }

    normalizeAndValidateBatch(rawItems) {
        const out = [];
        for (const raw of rawItems) {
            const normalized = this.normalizeEvent(raw);
            if (normalized && this.validateEvent(normalized)) {
                out.push(normalized);
            }
        }
        return out;
    }

    normalizeEvent(raw) {
        // Map incoming fields to internal schema
        const toNumber = (v) => {
            const num = typeof v === 'string' ? parseFloat(v) : v;
            return isFinite(num) ? num : 0;
        };
        const toNumericId = (v) => {
            // Preserve numeric IDs; convert prefixed IDs to a stable hash-like number space via incrementing counter
            if (v === undefined || v === null || v === '') return this.nextId++;
            const asNum = Number(v);
            if (Number.isInteger(asNum)) return asNum;
            // Non-numeric id: keep in sources and still give numeric id for app usage
            return this.nextId++;
        };
        const ensureArray = (v) => Array.isArray(v) ? v : (typeof v === 'string' && v.startsWith('[') ? JSON.parse(v.replace(/'/g, '"')) : (v ? [String(v)] : []));
        const dateRaw = raw.date || raw.publishedAt || raw.pubDate || raw.updated || '';
        const normalizedDate = this.normalizeEventDate(dateRaw);

        // Normalize region/category labels and compute importance with fallbacks
        const normalizedRegion = this.normalizeRegionLabel(raw.region || '');
        const normalizedCategory = this.normalizeCategoryLabel(raw.category || raw.topic);
        let importanceValue = Number.parseInt(raw.importance);
        if (!Number.isFinite(importanceValue)) {
            const conf = Number.parseFloat(raw.confidence);
            if (Number.isFinite(conf)) {
                importanceValue = Math.round(conf * 10);
            }
        }
        if (!Number.isFinite(importanceValue)) {
            importanceValue = 5;
        }
        const event = {
            id: toNumericId(raw.id),
            title: (raw.title || raw.headline || 'Без назви').toString().trim(),
            channel: raw.channel || raw.source || raw.channel_name || '',
            date: normalizedDate || new Date().toISOString().slice(0,10),
            category: normalizedCategory || 'Політичні зміни',
            region: normalizedRegion || '',
            country: raw.country || '',
            lat: toNumber(raw.lat ?? raw.latitude),
            lng: toNumber(raw.lng ?? raw.longitude),
            description: raw.description || raw.summary || raw.content || '',
            participants: ensureArray(raw.participants),
            impact: raw.impact || '',
            importance: Math.max(1, Math.min(10, importanceValue)),
            sources: ensureArray(raw.sources || raw.link || raw.url)
        };
        return event;
    }

    validateEvent(event) {
        // Basic required fields
        if (!event.title || !event.date) return false;
        const time = Date.parse(event.date);
        if (isNaN(time)) return false;
        if (typeof event.lat !== 'number' || typeof event.lng !== 'number') return false;
        if (event.lat < -90 || event.lat > 90 || event.lng < -180 || event.lng > 180) return false;
        // Category whitelist: ensure it exists or default
        const category = this.categories.find(c => c.name === event.category);
        if (!category) {
            // Fallback to a default category
            event.category = 'Політичні зміни';
        }
        // Region fallback
        if (!event.region) {
            event.region = 'Глобально';
        }
        if (!event.country) {
            event.country = 'Світ';
        }
        if (!event.importance || isNaN(event.importance)) {
            event.importance = 5;
        }
        if (!event.participants) event.participants = [];
        // Deduplicate participants and trim
        event.participants = Array.from(new Set(event.participants.map(p => String(p).trim()).filter(Boolean)));
        if (!event.sources) event.sources = [];
        // Ensure sources are strings and valid-ish URLs if present
        event.sources = event.sources.map(s => String(s).trim()).filter(Boolean);
        // Enforce consistent country casing and trimming
        event.country = String(event.country).trim();
        event.region = String(event.region).trim();
        event.category = String(event.category).trim();
        // Round coordinates to 6 decimals to avoid floating jitter
        if (Number.isFinite(event.lat)) event.lat = Math.round(event.lat * 1e6) / 1e6;
        if (Number.isFinite(event.lng)) event.lng = Math.round(event.lng * 1e6) / 1e6;
        return true;
    }

    normalizeEventDate(input) {
        if (!input) return '';
        // Respect explicit date format if chosen
        const fmt = this.importSettings?.dateFormat || 'auto';
        if (fmt && fmt !== 'auto') {
            const d = this.parseDateByFormat(String(input), fmt);
            if (d) return d;
        }
        // Fallback: Attempt to parse various formats and normalize to YYYY-MM-DD
        const parsed = new Date(input);
        if (isNaN(parsed.getTime())) return '';
        const iso = parsed.toISOString();
        return iso.slice(0, 10);
    }

    normalizeRegionLabel(input) {
        const value = String(input || '').trim();
        if (!value) return value;
        const low = value.toLowerCase();
        if (/(africa).*(europe)|(europe).*(africa)/.test(low)) {
            return 'Африка/Європа';
        }
        const mapping = new Map([
            ['europe', 'Європа'],
            ['asia', 'Азія'],
            ['middle east', 'Близький Схід'],
            ['north america', 'Північна Америка'],
            ['eurasia', 'Євразія'],
            ['global', 'Глобально'],
            ['world', 'Глобально'],
            ['ukraine', 'Європа'],
        ]);
        return mapping.get(low) || value;
    }

    normalizeCategoryLabel(input) {
        const value = String(input || '').trim();
        if (!value) return value;
        const low = value.toLowerCase();
        const mapping = new Map([
            ['global crises', 'Глобальні кризи'],
            ['wars and conflicts', 'Війни та конфлікти'],
            ['political changes', 'Політичні зміни'],
            ['economic changes', 'Економічні зміни'],
            ['technological changes', 'Технологічні зміни'],
        ]);
        return mapping.get(low) || value;
    }

    computeEventDedupKey(event) {
        // Prefer stable link if available
        const link = Array.isArray(event.sources) && event.sources.length ? event.sources[0] : '';
        if (link && /^https?:\/\//i.test(link)) {
            return `link:${link}`;
        }
        // If original string id present in sources, use it to strengthen dedup
        const originalId = (event._originalId && typeof event._originalId === 'string') ? event._originalId : '';
        const title = (event.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const date = event.date || '';
        const lat = Number.isFinite(event.lat) ? event.lat.toFixed(3) : 'x';
        const lng = Number.isFinite(event.lng) ? event.lng.toFixed(3) : 'x';
        return originalId ? `oid:${originalId}` : `tdl:${title}|${date}|${lat}|${lng}`;
    }

    async scanSources() {
        // Backward-compatible manual scan using the new SourceScanner
        const sources = this.prepareSourcesFromUI();
        if (!this.scanner) this.scanner = new SourceScanner(this);
        this.scanner.setSources(sources);
        this.setImportStatus('Сканування джерел...', 5);
        const results = await this.scanner.scanOnce({ updateUi: true });
        // Start auto-refresh after a manual scan if there are sources
        if (sources.length) {
            this.scanner.startAutoRefresh();
            this.updateScanButtonUi(true);
        }
        return results;
    }

    prepareSourcesFromUI() {
        const rssTextarea = document.getElementById('rssUrls');
        const newsApiKey = document.getElementById('newsApiKey')?.value?.trim();
        const newsApiQuery = document.getElementById('newsApiQuery')?.value?.trim() || 'geopolitics';
        const govJsonUrl = document.getElementById('govJsonUrl')?.value?.trim();
        const corsProxy = document.getElementById('corsProxyUrl')?.value?.trim();

        // NEW: Trusted data sources
        const gdeltQuery = document.getElementById('gdeltQuery')?.value?.trim() || 'geopolitical';
        const gdeltTimespan = document.getElementById('gdeltTimespan')?.value || '7d';
        const acledApiKey = document.getElementById('acledApiKey')?.value?.trim();
        const acledCountry = document.getElementById('acledCountry')?.value?.trim() || 'Ukraine';
        const reliefwebCountry = document.getElementById('reliefwebCountry')?.value?.trim();
        const eventRegistryKey = document.getElementById('eventRegistryKey')?.value?.trim();
        const eventRegistryKeyword = document.getElementById('eventRegistryKeyword')?.value?.trim() || 'geopolitics';

        const rssUrls = (rssTextarea?.value || '')
            .split(/\n|[,;]/)
            .map(u => u.trim())
            .filter(Boolean);

        const sources = [];
        
        // Priority 1: GDELT - Free, reliable, geolocated
        if (gdeltQuery) {
            sources.push({
                id: `gdelt:${gdeltQuery}`,
                type: 'gdelt',
                url: 'https://api.gdeltproject.org/api/v2/doc/doc',
                priority: 1,
                intervalMs: 6 * 60 * 60 * 1000, // 6 hours
                corsProxy: '',
                params: { query: gdeltQuery, timespan: gdeltTimespan, maxRecords: 100 }
            });
        }

        // Priority 2: ACLED - High quality conflict data (requires key)
        if (acledApiKey && acledApiKey !== 'your-acled-api-key') {
            sources.push({
                id: `acled:${acledCountry}`,
                type: 'acled',
                url: 'https://api.acleddata.com/acled/read',
                priority: 1,
                intervalMs: 24 * 60 * 60 * 1000, // 24 hours
                corsProxy: '',
                params: { apiKey: acledApiKey, country: acledCountry, limit: 100 }
            });
        }

        // Priority 3: ReliefWeb - UN humanitarian reports (free)
        sources.push({
            id: `reliefweb:${reliefwebCountry || 'all'}`,
            type: 'reliefweb',
            url: 'https://api.reliefweb.int/v1/reports',
            priority: 2,
            intervalMs: 12 * 60 * 60 * 1000, // 12 hours
            corsProxy: '',
            params: { country: reliefwebCountry }
        });

        // Priority 4: EventRegistry (requires key, better than NewsAPI)
        if (eventRegistryKey && eventRegistryKey !== 'your-eventregistry-api-key') {
            sources.push({
                id: `eventregistry:${eventRegistryKeyword}`,
                type: 'eventregistry',
                url: 'https://eventregistry.org/api/v1/article/getArticles',
                priority: 2,
                intervalMs: 8 * 60 * 60 * 1000, // 8 hours
                corsProxy: '',
                params: { apiKey: eventRegistryKey, keyword: eventRegistryKeyword }
            });
        }

        // RSS feeds
        rssUrls.forEach((url, idx) => {
            sources.push({
                id: `rss:${idx}:${url}`,
                type: 'rss',
                url,
                priority: 2,
                intervalMs: 15 * 60 * 1000,
                corsProxy
            });
        });
        
        if (govJsonUrl) {
            sources.push({
                id: `json:${govJsonUrl}`,
                type: 'json',
                url: govJsonUrl,
                priority: 1,
                intervalMs: 20 * 60 * 1000,
                corsProxy
            });
        }
        
        // Always include bundled local CSV resource if available
        sources.push({
            id: 'csv:local:ukraine_channels_events.csv',
            type: 'csv',
            url: window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'ukraine_channels_events.csv',
            priority: 1,
            intervalMs: 60 * 60 * 1000,
            corsProxy
        });
        
        if (newsApiKey) {
            sources.push({
                id: `newsapi:${newsApiQuery}`,
                type: 'newsapi',
                url: 'https://newsapi.org/v2/everything',
                priority: 3,
                intervalMs: 30 * 60 * 1000,
                corsProxy,
                params: { apiKey: newsApiKey, query: newsApiQuery }
            });
        }
        
        return sources;
    }

    handleScanButton() {
        const isActive = this.scanner && this.scanner.isAutoRefreshing;
        if (isActive) {
            this.scanner.stopAutoRefresh();
            this.updateScanButtonUi(false);
            this.showToast('Автооновлення зупинено');
            return;
        }
        // Trigger a manual scan, then auto-refresh will be enabled inside
        this.scanSources();
    }

    updateScanButtonUi(isActive) {
        const scanBtn = document.getElementById('scanSourcesBtn');
        if (!scanBtn) return;
        if (isActive) {
            scanBtn.classList.add('active');
            scanBtn.textContent = 'Зупинити автооновлення';
        } else {
            scanBtn.classList.remove('active');
            scanBtn.textContent = 'Сканувати джерела';
        }
    }

    async fetchWithCors(url, corsProxy, options = {}) {
        const finalUrl = corsProxy ? `${corsProxy.replace(/\/$/, '')}/${encodeURIComponent(url)}` : url;
        const res = await fetch(finalUrl, options);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res;
    }

    async fetchRss(url, corsProxy) {
        const res = await this.fetchWithCors(url, corsProxy);
        const text = await res.text();
        const items = this.parseRss(text);
        return items.map(item => ({
            title: item.title,
            description: item.description,
            date: item.pubDate || item.published,
            sources: [item.link],
            // location/category inference is out of scope; leave defaults
        }));
    }

    parseRss(xmlText) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'text/xml');
        const entries = [];
        const itemNodes = [...xml.querySelectorAll('item')];
        if (itemNodes.length) {
            itemNodes.forEach(n => entries.push({
                title: n.querySelector('title')?.textContent || '',
                description: n.querySelector('description')?.textContent || '',
                link: n.querySelector('link')?.textContent || '',
                pubDate: n.querySelector('pubDate')?.textContent || ''
            }));
        } else {
            // Atom
            const atomEntries = [...xml.querySelectorAll('entry')];
            atomEntries.forEach(n => entries.push({
                title: n.querySelector('title')?.textContent || '',
                description: n.querySelector('summary')?.textContent || n.querySelector('content')?.textContent || '',
                link: n.querySelector('link')?.getAttribute('href') || '',
                published: n.querySelector('published')?.textContent || n.querySelector('updated')?.textContent || ''
            }));
        }
        return entries;
    }

    async fetchNewsApi(apiKey, query, corsProxy) {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=100`;
        const res = await this.fetchWithCors(url, corsProxy, { headers: { 'X-Api-Key': apiKey } }).catch(async () => {
            // If proxy route with headers fails, try direct
            const r = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
            if (!r.ok) throw new Error('NewsAPI failed');
            return r;
        });
        const json = await res.json();
        if (!json.articles) return [];
        return json.articles.map(a => ({
            title: a.title,
            description: a.description || a.content || '',
            date: a.publishedAt,
            sources: [a.url],
            country: a.source?.name || ''
        }));
    }

    async fetchGovJson(url, corsProxy) {
        const res = await this.fetchWithCors(url, corsProxy).catch(() => fetch(url));
        const json = await res.json();
        return Array.isArray(json) ? json : (json.events || []);
    }

    // ========== NEW TRUSTED DATA SOURCES ==========

    /**
     * Fetch events from GDELT Project (Global Database of Events, Language, and Tone)
     * No API key required - free public access
     * @param {string} query - Search query (e.g., "Ukraine war", "geopolitical")
     * @param {string} timespan - Date range (e.g., "7d" for last 7 days)
     * @param {number} maxRecords - Maximum records to fetch (default 100)
     */
    async fetchGDELT(query = 'geopolitical', timespan = '7d', maxRecords = 100) {
        try {
            const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${maxRecords}&timespan=${timespan}&format=json`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`GDELT API failed: ${res.status}`);
            
            const data = await res.json();
            if (!data.articles) return [];
            
            return data.articles.map(article => ({
                title: article.title || 'Untitled Event',
                description: article.url || '',
                date: this.parseGDELTDate(article.seendate),
                lat: this.parseFloat(article.lat),
                lng: this.parseFloat(article.lon),
                sources: [article.url].filter(Boolean),
                country: article.sourcecountry || '',
                region: this.inferRegionFromCountry(article.sourcecountry),
                category: this.inferCategoryFromText(article.title),
                importance: 5,
                _source: 'GDELT',
                _originalId: article.url
            })).filter(e => e.lat && e.lng); // Only include geolocated events
        } catch (err) {
            console.error('GDELT fetch error:', err);
            return [];
        }
    }

    /**
     * Fetch conflict events from ACLED (Armed Conflict Location & Event Data Project)
     * Requires API key - register at https://developer.acleddata.com
     * @param {string} apiKey - ACLED API key
     * @param {string} country - Country name (e.g., "Ukraine")
     * @param {number} limit - Max events to fetch
     */
    async fetchACLED(apiKey, country = 'Ukraine', limit = 100) {
        if (!apiKey || apiKey === 'your-acled-api-key') {
            console.warn('ACLED: No valid API key provided');
            return [];
        }
        
        try {
            const url = `https://api.acleddata.com/acled/read?key=${apiKey}&country=${encodeURIComponent(country)}&limit=${limit}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`ACLED API failed: ${res.status}`);
            
            const data = await res.json();
            if (!data.data) return [];
            
            return data.data.map(event => ({
                title: `${event.event_type}: ${event.notes?.substring(0, 80) || 'Conflict event'}`,
                description: event.notes || '',
                date: event.event_date,
                lat: parseFloat(event.latitude),
                lng: parseFloat(event.longitude),
                region: event.region || this.inferRegionFromCountry(country),
                country: country,
                category: 'Війни та конфлікти',
                importance: event.fatalities > 10 ? 8 : (event.fatalities > 0 ? 6 : 5),
                sources: event.source ? [event.source] : [],
                participants: [event.actor1, event.actor2].filter(Boolean),
                _source: 'ACLED',
                _originalId: `acled_${event.data_id}`
            }));
        } catch (err) {
            console.error('ACLED fetch error:', err);
            return [];
        }
    }

    /**
     * Fetch humanitarian reports from UN OCHA ReliefWeb
     * No API key required
     * @param {string} country - Country filter (optional)
     */
    async fetchReliefWeb(country = '') {
        try {
            let url = 'https://api.reliefweb.int/v1/reports?appname=CivilizationSphere&limit=100';
            if (country) {
                url += `&filter[field]=country.name&filter[value]=${encodeURIComponent(country)}`;
            }
            
            const res = await fetch(url);
            if (!res.ok) throw new Error(`ReliefWeb API failed: ${res.status}`);
            
            const data = await res.json();
            if (!data.data) return [];
            
            return data.data.map(report => {
                const fields = report.fields;
                return {
                    title: fields.title || 'Humanitarian Report',
                    description: fields.body?.substring(0, 500) || '',
                    date: fields.date?.created || fields.date?.changed || new Date().toISOString(),
                    country: fields.primary_country?.name || '',
                    region: this.inferRegionFromCountry(fields.primary_country?.name),
                    category: 'Глобальні кризи',
                    importance: 6,
                    sources: fields.url ? [fields.url] : [],
                    _source: 'ReliefWeb',
                    _originalId: `reliefweb_${report.id}`
                };
            });
        } catch (err) {
            console.error('ReliefWeb fetch error:', err);
            return [];
        }
    }

    /**
     * Fetch from EventRegistry (better alternative to NewsAPI)
     * Requires API key - register at https://eventregistry.org
     * @param {string} apiKey - EventRegistry API key
     * @param {string} keyword - Search keyword
     */
    async fetchEventRegistry(apiKey, keyword = 'geopolitics') {
        if (!apiKey || apiKey === 'your-eventregistry-api-key') {
            console.warn('EventRegistry: No valid API key provided');
            return [];
        }
        
        try {
            const url = `https://eventregistry.org/api/v1/article/getArticles`;
            const body = {
                apiKey: apiKey,
                keyword: keyword,
                resultType: 'articles',
                articlesSortBy: 'date',
                articlesCount: 100,
                includeArticleLocation: true,
                includeArticleCategories: true
            };
            
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            if (!res.ok) throw new Error(`EventRegistry API failed: ${res.status}`);
            
            const data = await res.json();
            if (!data.articles?.results) return [];
            
            return data.articles.results.map(article => ({
                title: article.title || 'News Event',
                description: article.body?.substring(0, 500) || '',
                date: article.dateTime || article.date,
                lat: article.location?.lat,
                lng: article.location?.lng,
                country: article.location?.country?.label,
                region: this.inferRegionFromCountry(article.location?.country?.label),
                category: this.inferCategoryFromText(article.title),
                importance: 5,
                sources: article.url ? [article.url] : [],
                _source: 'EventRegistry',
                _originalId: article.uri
            }));
        } catch (err) {
            console.error('EventRegistry fetch error:', err);
            return [];
        }
    }

    /**
     * Geocode location using Nominatim (OpenStreetMap)
     * Free service - respects rate limits (1 req/sec)
     * @param {string} location - Location name to geocode
     * @returns {Promise<{lat: number, lng: number}|null>}
     */
    async geocodeLocation(location) {
        if (!location || typeof location !== 'string') return null;
        
        try {
            // Rate limiting - ensure 1 second between requests
            const now = Date.now();
            if (this._lastGeocodeTime && (now - this._lastGeocodeTime) < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1000 - (now - this._lastGeocodeTime)));
            }
            this._lastGeocodeTime = Date.now();
            
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'CivilizationSphere/1.0 (Educational geopolitical events platform)' }
            });
            
            if (!res.ok) return null;
            
            const data = await res.json();
            if (!data || data.length === 0) return null;
            
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        } catch (err) {
            console.error('Geocoding error:', err);
            return null;
        }
    }

    // ========== HELPER UTILITIES ==========

    parseGDELTDate(seendate) {
        if (!seendate) return new Date().toISOString();
        // GDELT format: YYYYMMDDHHMMSS
        const str = String(seendate);
        const year = str.substring(0, 4);
        const month = str.substring(4, 6);
        const day = str.substring(6, 8);
        return `${year}-${month}-${day}T00:00:00.000Z`;
    }

    parseFloat(val) {
        if (val === null || val === undefined || val === '') return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
    }

    inferRegionFromCountry(country) {
        if (!country) return 'Глобально';
        
        const countryLower = country.toLowerCase();
        const regionMap = {
            'ukraine': 'Європа',
            'poland': 'Європа', 'germany': 'Європа', 'france': 'Європа', 'uk': 'Європа',
            'united kingdom': 'Європа', 'italy': 'Європа', 'spain': 'Європа', 'russia': 'Європа',
            'syria': 'Близький Схід', 'israel': 'Близький Схід', 'lebanon': 'Близький Схід',
            'iran': 'Близький Схід', 'iraq': 'Близький Схід', 'saudi arabia': 'Близький Схід',
            'china': 'Азія', 'japan': 'Азія', 'india': 'Азія', 'pakistan': 'Азія',
            'vietnam': 'Азія', 'thailand': 'Азія', 'south korea': 'Азія', 'north korea': 'Азія',
            'usa': 'Північна Америка', 'united states': 'Північна Америка', 'canada': 'Північна Америка',
            'mexico': 'Латинська Америка', 'brazil': 'Латинська Америка', 'argentina': 'Латинська Америка',
            'nigeria': 'Африка', 'egypt': 'Африка', 'south africa': 'Африка', 'kenya': 'Африка',
            'australia': 'Океанія', 'new zealand': 'Океанія'
        };
        
        for (const [key, region] of Object.entries(regionMap)) {
            if (countryLower.includes(key)) return region;
        }
        
        return 'Глобально';
    }

    inferCategoryFromText(text) {
        if (!text) return 'Політичні зміни';
        
        const textLower = text.toLowerCase();
        const categoryKeywords = {
            'Війни та конфлікти': ['war', 'war', 'conflict', 'battle', 'attack', 'missile', 'bomb', 'strike', 'invasion', 'warfare'],
            'Політичні зміни': ['election', 'government', 'president', 'parliament', 'reform', 'sanction', 'policy', 'vote', 'legislation'],
            'Економічні зміни': ['economy', 'trade', 'market', 'gdp', 'inflation', 'oil', 'gas', 'energy', 'export', 'import', 'currency'],
            'Технологічні зміни': ['technology', 'nuclear', 'reactor', 'chip', 'semiconductor', 'ai', 'cyber', 'space'],
            'Глобальні кризи': ['crisis', 'disaster', 'humanitarian', 'refugee', 'famine', 'drought', 'pandemic', 'emergency'],
            'Тероризм': ['terror', 'terrorist', 'bombing', 'hostage', 'extremist']
        };
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                return category;
            }
        }
        
        return 'Політичні зміни';
    }

    /**
     * Enhanced deduplication with fuzzy matching
     * @param {Array} newEvents - Events to check for duplicates
     * @returns {Array} - Deduplicated events
     */
    deduplicateEvents(newEvents) {
        const existing = new Set(this.events.map(e => this.makeEventKey(e)));
        const deduplicated = [];
        
        for (const event of newEvents) {
            const key = this.makeEventKey(event);
            if (!existing.has(key)) {
                // Additional fuzzy check for similar titles and dates
                const isDuplicate = this.events.some(existingEvent => {
                    const titleSimilarity = this.calculateSimilarity(
                        existingEvent.title?.toLowerCase() || '',
                        event.title?.toLowerCase() || ''
                    );
                    const sameDate = existingEvent.date?.substring(0, 10) === event.date?.substring(0, 10);
                    return titleSimilarity > 0.85 && sameDate;
                });
                
                if (!isDuplicate) {
                    deduplicated.push(event);
                    existing.add(key);
                }
            }
        }
        
        return deduplicated;
    }

    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0) return 1.0;
        return (longer.length - this.editDistance(longer, shorter)) / longer.length;
    }

    editDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + cost
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    importBufferedEvents() {
        if (!this.importBuffer.length) {
            this.showToast('Немає подій для імпорту');
            return;
        }
        const total = this.importBuffer.length;
        let imported = 0;
        const batchSize = 50; // batch import
        const doBatch = () => {
            const batch = this.importBuffer.splice(0, batchSize);
            // Apply replace or append on the first batch
            if (imported === 0 && (this.importSettings.importMode || 'append') === 'replace') {
                this.events = [];
            }
            batch.forEach(ev => this.events.push(ev));
            imported += batch.length;
            this.filteredEvents = [...this.events];
            this.updateDisplay();
            this.rebuildTimeline();
            this.cameraController.calculateOptimalBounds();
            const progress = Math.round((imported / total) * 100);
            this.setImportStatus(`Імпортовано ${imported}/${total}`, progress);
            if (this.importBuffer.length) {
                setTimeout(doBatch, 50);
            } else {
                document.getElementById('importBtn').disabled = true;
                this.showToast('Імпорт завершено');
            }
        };
        doBatch();
    }

    playTimelineAnimation() {
        if (this.isPlaying) return;
        // ensure timeline is prepared
        if (!this.isReady) {
            this.showTimelineReadyOverlay('Підготовка…');
            return;
        }

        this.isPlaying = true;
        this.hideTimelineReadyOverlay();
        this.playbackEvents = [...this.filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
        this.currentPlaybackIndex = 0;
        
        // Update UI
        this.updatePlaybackUI();
        
        // Start playback
        try {
            this.continuePlayback();
        } catch (err) {
            this._telemetryError('play:start', err);
            this.pauseTimelineAnimation();
        }
    }
    
    continuePlayback() {
        if (!this.isPlaying || this.currentPlaybackIndex >= this.playbackEvents.length) {
            this.pauseTimelineAnimation();
            return;
        }
        
        const currentEvent = this.playbackEvents[this.currentPlaybackIndex];
        
        // Update timeline playhead
        this.updateTimelinePlayhead();
        
        // Update progress
        this.updateProgress();
        
        // Select current event with smooth transition
        this.selectEvent(currentEvent.id);
        
        // Mark timeline event as playing
        const timelineEvent = document.querySelector(`[data-event-id="${currentEvent.id}"]`);
        if (timelineEvent) {
            timelineEvent.classList.add('playing');
        }
        
        this.currentPlaybackIndex++;
        
        // Schedule next event based on speed
        const baseDelay = 2000; // 2 seconds base
        const delay = baseDelay / this.playbackSpeed;
        
        this.timelineAnimation = setTimeout(() => {
            try {
                this.continuePlayback();
            } catch (err) {
                this._telemetryError('play:tick', err);
                this.pauseTimelineAnimation();
            }
        }, delay);
    }
    
    updateTimelinePlayhead() {
        const playhead = document.getElementById('timelinePlayhead');
        if (!playhead || this.playbackEvents.length === 0) return;
        
        const progress = this.currentPlaybackIndex / this.playbackEvents.length;
        const timelineEl = document.getElementById('timeline');
        const timelineWidth = timelineEl.offsetWidth;
        playhead.style.left = `${Math.max(0, Math.min(1, progress)) * timelineWidth}px`;
        playhead.classList.add('active');
    }
    
    updateProgress() {
        const progressFill = document.getElementById('timelineProgressFill');
        const progressHandle = document.getElementById('timelineProgressHandle');
        
        if (progressFill && this.playbackEvents.length > 0) {
            const progress = (this.currentPlaybackIndex / this.playbackEvents.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressHandle.style.left = `${progress}%`;
        }
    }
    
    updatePlaybackUI() {
        const indicator = document.getElementById('playbackIndicator');
        if (this.isPlaying) {
            indicator.classList.add('active');
            indicator.querySelector('span:last-child').textContent = `Playback ${this.playbackSpeed}x`;
        } else {
            indicator.classList.remove('active');
        }
    }
    
    seekToProgress(e) {
        if (!this.playbackEvents.length) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const progress = (e.clientX - rect.left) / rect.width;
        const targetIndex = Math.floor(progress * this.playbackEvents.length);
        
        this.currentPlaybackIndex = Math.max(0, Math.min(targetIndex, this.playbackEvents.length - 1));
        this.updateProgress();
        this.updateTimelinePlayhead();
        
        if (this.currentPlaybackIndex < this.playbackEvents.length) {
            this.selectEvent(this.playbackEvents[this.currentPlaybackIndex].id);
        }
    }

    pauseTimelineAnimation() {
        this.isPlaying = false;
        
        if (this.timelineAnimation) {
            clearTimeout(this.timelineAnimation);
            this.timelineAnimation = null;
        }
        
        // Remove playing class from all events
        document.querySelectorAll('.timeline-event').forEach(el => {
            el.classList.remove('playing');
        });
        
        this.updatePlaybackUI();
    }

    resetTimelineAnimation() {
        this.pauseTimelineAnimation();
        this.currentPlaybackIndex = 0;
        
        // Reset UI elements
        document.querySelectorAll('.timeline-event').forEach(el => {
            el.classList.remove('active', 'playing');
        });
        
        const playhead = document.getElementById('timelinePlayhead');
        if (playhead) {
            playhead.classList.remove('active');
            playhead.style.left = '0px';
        }
        document.getElementById('timelineProgressFill').style.width = '0%';
        document.getElementById('timelineProgressHandle').style.left = '0%';
        
        this.selectedEvent = null;
        document.getElementById('eventDetails').innerHTML = `
            <div class="no-selection">
                <p>Оберіть подію на карті або в часовій шкалі для перегляду деталей</p>
            </div>
        `;
        
        // Reset camera view
        this.cameraController.resetView();
    }

    showTimelineReadyOverlay(text = 'Підготовка відтворення…') {
        const overlay = document.getElementById('timelineReadyOverlay');
        const textEl = document.getElementById('timelineReadyText');
        if (!overlay) return;
        if (textEl) textEl.textContent = text;
        overlay.classList.add('visible');
        overlay.setAttribute('aria-hidden', 'false');
    }

    hideTimelineReadyOverlay() {
        const overlay = document.getElementById('timelineReadyOverlay');
        if (!overlay) return;
        overlay.classList.remove('visible');
        overlay.setAttribute('aria-hidden', 'true');
    }
}

// Enhanced Classes for Mobile and Smart Camera
class TouchHandler {
    constructor(app) {
        this.app = app;
        this.touchStart = null;
        this.touchEnd = null;
    }
    
    initialize() {
        const mapElement = document.getElementById('map');
        
        mapElement.addEventListener('touchstart', (e) => {
            this.touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                time: Date.now()
            };
        });
        
        mapElement.addEventListener('touchend', (e) => {
            if (!this.touchStart) return;
            
            this.touchEnd = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY,
                time: Date.now()
            };
            
            this.handleSwipe();
        });
        
        // Handle pinch zoom
        let initialDistance = null;
        mapElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });
        
        mapElement.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && initialDistance) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scaleFactor = currentDistance / initialDistance;
                
                if (scaleFactor > 1.2) {
                    this.app.map.zoomIn();
                    initialDistance = currentDistance;
                } else if (scaleFactor < 0.8) {
                    this.app.map.zoomOut();
                    initialDistance = currentDistance;
                }
            }
        });
    }
    
    getDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }
    
    handleSwipe() {
        if (!this.touchStart || !this.touchEnd) return;
        
        const deltaX = this.touchEnd.x - this.touchStart.x;
        const deltaY = this.touchEnd.y - this.touchStart.y;
        const deltaTime = this.touchEnd.time - this.touchStart.time;
        
        // Check for swipe (minimum distance and maximum time)
        if (Math.abs(deltaX) > 50 && deltaTime < 300) {
            if (deltaX > 0) {
                // Swipe right - previous event
                this.app.navigateToEvent('previous');
            } else {
                // Swipe left - next event
                this.app.navigateToEvent('next');
            }
        }
    }
}

class SmartCameraController {
    constructor(app) {
        this.app = app;
        this.isTransitioning = false;
    }
    
    initialize() {
        // Setup camera bounds based on events
        this.calculateOptimalBounds();
    }
    
    calculateOptimalBounds() {
        if (this.app.filteredEvents.length === 0) return;
        
        const lats = this.app.filteredEvents.map(e => e.lat).filter(lat => lat !== 0);
        const lngs = this.app.filteredEvents.map(e => e.lng).filter(lng => lng !== 0);
        
        if (lats.length === 0 || lngs.length === 0) return;
        
        this.bounds = {
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lngs),
            west: Math.min(...lngs)
        };
    }
    
    focusOnEvent(event, zoom = null) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        const targetZoom = zoom || this.calculateOptimalZoom(event);
        const center = [event.lat, event.lng];
        
        // Smooth fly to animation
        this.app.map.flyTo(center, targetZoom, {
            animate: true,
            duration: 1.2,
            easeLinearity: 0.1
        });
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1200);
    }
    
    calculateOptimalZoom(event) {
        // Calculate zoom based on event importance and region
        const baseZoom = this.app.isMobile ? 4 : 6;
        const importanceBonus = Math.floor(event.importance / 3);
        
        // Regional zoom adjustments
        const regionZooms = {
            'Європа': 5,
            'Азія': 4,
            'Близький Схід': 6,
            'Глобально': 2
        };
        
        const regionZoom = regionZooms[event.region] || baseZoom;
        return Math.min(10, regionZoom + importanceBonus);
    }
    
    fitAllEvents() {
        if (!this.bounds || this.app.filteredEvents.length === 0) return;
        
        const paddingOptions = {
            padding: this.app.isMobile ? [20, 20] : [50, 50],
            animate: true,
            duration: 1
        };
        
        const boundingBox = [
            [this.bounds.south, this.bounds.west],
            [this.bounds.north, this.bounds.east]
        ];
        
        this.app.map.fitBounds(boundingBox, paddingOptions);
    }
    
    resetView() {
        if (this.app.filteredEvents.length > 1) {
            this.fitAllEvents();
        } else {
            this.app.map.flyTo([50, 10], 3, {
                animate: true,
                duration: 1
            });
        }
    }
}

// Source Scanner: multi-source ingestion with normalization, dedup, and auto-refresh
class SourceScanner {
    constructor(app) {
        this.app = app;
        this.sources = [];
        this.isAutoRefreshing = false;
        this.refreshTimer = null;
        this.sourceStateById = new Map(); // id -> { lastRun, nextRun, errorCount }
        this.isScanInFlight = false;
    }

    setSources(sources) {
        const normalized = (sources || []).map(src => ({
            id: src.id || `${src.type}:${src.url}`,
            type: (src.type || 'json').toLowerCase(),
            url: src.url,
            priority: Number.isFinite(src.priority) ? src.priority : 5,
            intervalMs: Number.isFinite(src.intervalMs) ? src.intervalMs : 30 * 60 * 1000,
            corsProxy: src.corsProxy || '',
            params: src.params || {}
        })).filter(s => !!s.url);
        this.sources = normalized;
        // Initialize per-source state
        normalized.forEach(s => {
            if (!this.sourceStateById.has(s.id)) {
                this.sourceStateById.set(s.id, { lastRun: 0, nextRun: Date.now(), errorCount: 0 });
            }
        });
    }

    async scanOnce({ updateUi = false } = {}) {
        if (!this.sources.length) {
            if (updateUi) this.app.setImportStatus('Немає джерел для сканування', 0);
            return [];
        }
        if (this.isScanInFlight) {
            return [];
        }
        this.isScanInFlight = true;
        try {
            const total = this.sources.length;
            let completed = 0;
            const allRawItems = [];

            // Fetch all sources in parallel but track progress per-settlement
            const results = await Promise.allSettled(this.sources.map(async (src) => {
                const state = this.sourceStateById.get(src.id) || { errorCount: 0 };
                try {
                    const items = await this.fetchSource(src);
                    allRawItems.push(...items.map(i => ({ item: i, _srcId: src.id })));
                    state.errorCount = 0;
                    state.lastRun = Date.now();
                    state.nextRun = state.lastRun + src.intervalMs;
                    this.sourceStateById.set(src.id, state);
                } catch (err) {
                    state.errorCount = (state.errorCount || 0) + 1;
                    const backoff = Math.min(2 ** state.errorCount, 32);
                    const base = Math.max(5 * 60 * 1000, src.intervalMs);
                    state.lastRun = Date.now();
                    state.nextRun = state.lastRun + backoff * base;
                    this.sourceStateById.set(src.id, state);
                    console.warn('Source scan failed', src.id, err);
                } finally {
                    completed += 1;
                    if (updateUi) {
                        const progress = Math.round((completed / total) * 70) + 10; // 10-80%
                        this.app.setImportStatus(`Сканування: ${completed}/${total}`, progress);
                    }
                }
            }));

            // Normalize and validate
            const normalized = this.app.normalizeAndValidateBatch(allRawItems.map(r => r.item));
            // Deduplicate across sources with priority rules
            const byKey = new Map();
            const getPriority = (srcId) => this.sources.find(s => s.id === srcId)?.priority ?? 5;
            for (const raw of allRawItems) {
                const event = this.app.normalizeEvent(raw.item);
                if (!event || !this.app.validateEvent(event)) continue;
                const key = this.app.computeEventDedupKey(event);
                const existing = byKey.get(key);
                const srcPriority = getPriority(raw._srcId);
                if (!existing || srcPriority < existing.priority) {
                    byKey.set(key, { event, priority: srcPriority });
                }
            }

            // Remove events already present in the app by dedup key
            const existingKeys = new Set(this.app.events.map(ev => this.app.computeEventDedupKey(ev)));
            const uniqueEvents = [];
            for (const [key, { event }] of byKey.entries()) {
                if (!existingKeys.has(key)) uniqueEvents.push(event);
            }

            // Update UI preview buffer
            if (updateUi) {
                this.app.clearImportPreview();
                this.app.importBuffer = uniqueEvents;
                this.app.appendToImportPreview(uniqueEvents);
                const importBtn = document.getElementById('importBtn');
                if (importBtn) importBtn.disabled = this.app.importBuffer.length === 0;
                this.app.setImportStatus(`Знайдено: ${uniqueEvents.length}`, uniqueEvents.length ? 90 : 30);
            }

            return uniqueEvents;
        } finally {
            this.isScanInFlight = false;
        }
    }

    startAutoRefresh() {
        if (this.isAutoRefreshing) return;
        this.isAutoRefreshing = true;
        // Align next runs to now
        const now = Date.now();
        for (const [id, state] of this.sourceStateById.entries()) {
            if (!state.nextRun || state.nextRun < now) {
                state.nextRun = now + 1000;
                this.sourceStateById.set(id, state);
            }
        }
        // Poller tick
        const tick = async () => {
            if (!this.isAutoRefreshing) return;
            const dueSources = this.sources.filter(s => {
                const st = this.sourceStateById.get(s.id);
                return st && st.nextRun && st.nextRun <= Date.now();
            });
            if (dueSources.length) {
                // Temporarily narrow to due sources
                const all = this.sources;
                try {
                    this.sources = dueSources;
                    await this.scanOnce({ updateUi: true });
                } finally {
                    this.sources = all;
                }
            }
            this.refreshTimer = setTimeout(tick, 15 * 1000);
        };
        this.refreshTimer = setTimeout(tick, 1500);
    }

    stopAutoRefresh() {
        this.isAutoRefreshing = false;
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    async fetchSource(src) {
        switch (src.type) {
            case 'rss':
                return await this.app.fetchRss(src.url, src.corsProxy);
            case 'json':
                return await this.fetchGenericJson(src);
            case 'csv':
                return await this.fetchGenericCsv(src);
            case 'xml':
                return await this.fetchGenericXml(src);
            case 'newsapi':
                return await this.fetchNewsApiWrapper(src);
            case 'gdelt':
                return await this.fetchGDELTWrapper(src);
            case 'acled':
                return await this.fetchACLEDWrapper(src);
            case 'reliefweb':
                return await this.fetchReliefWebWrapper(src);
            case 'eventregistry':
                return await this.fetchEventRegistryWrapper(src);
            default:
                // Try JSON, then RSS, then XML
                try { return await this.fetchGenericJson(src); } catch(_) {}
                try { return await this.app.fetchRss(src.url, src.corsProxy); } catch(_) {}
                return await this.fetchGenericXml(src);
        }
    }

    // ========== NEW DATA SOURCE WRAPPERS ==========

    async fetchGDELTWrapper(src) {
        const { query, timespan, maxRecords } = src.params || {};
        return await this.app.fetchGDELT(
            query || 'geopolitical',
            timespan || '7d',
            maxRecords || 100
        );
    }

    async fetchACLEDWrapper(src) {
        const { apiKey, country, limit } = src.params || {};
        return await this.app.fetchACLED(
            apiKey || process.env.ACLED_API_KEY || '',
            country || 'Ukraine',
            limit || 100
        );
    }

    async fetchReliefWebWrapper(src) {
        const { country } = src.params || {};
        return await this.app.fetchReliefWeb(country || '');
    }

    async fetchEventRegistryWrapper(src) {
        const { apiKey, keyword } = src.params || {};
        return await this.app.fetchEventRegistry(
            apiKey || process.env.EVENTREGISTRY_API_KEY || '',
            keyword || 'geopolitics'
        );
    }

    async fetchGenericJson(src) {
        const res = await this.app.fetchWithCors(src.url, src.corsProxy).catch(() => fetch(src.url));
        const json = await res.json();
        if (Array.isArray(json)) return json;
        if (json && Array.isArray(json.events)) return json.events;
        if (json && json.data && Array.isArray(json.data)) return json.data;
        return [];
    }

    async fetchGenericCsv(src) {
        const res = await this.app.fetchWithCors(src.url, src.corsProxy).catch(() => fetch(src.url));
        const text = await res.text();
        return this.app.parseCsv(text);
    }

    async fetchGenericXml(src) {
        const res = await this.app.fetchWithCors(src.url, src.corsProxy).catch(() => fetch(src.url));
        const text = await res.text();
        return this.parseGenericXmlEvents(text, src.url);
    }

    async fetchNewsApiWrapper(src) {
        const { apiKey, query } = src.params || {};
        if (!apiKey) return [];
        return await this.app.fetchNewsApi(apiKey, query || 'geopolitics', src.corsProxy);
    }

    parseGenericXmlEvents(xmlText, baseLink) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'text/xml');
        const out = [];
        const eventNodes = [...xml.querySelectorAll('event')];
        if (eventNodes.length) {
            eventNodes.forEach(n => {
                out.push({
                    title: n.querySelector('title, name')?.textContent || '',
                    description: n.querySelector('description, summary, details')?.textContent || '',
                    date: n.querySelector('date, published, updated')?.textContent || '',
                    category: n.querySelector('category, type, topic')?.textContent || '',
                    region: n.querySelector('region')?.textContent || '',
                    country: n.querySelector('country')?.textContent || '',
                    lat: n.querySelector('lat, latitude')?.textContent,
                    lng: n.querySelector('lng, longitude, lon')?.textContent,
                    participants: (n.querySelector('participants')?.textContent || '').split(/[,;|]/),
                    importance: n.querySelector('importance, score')?.textContent,
                    sources: [n.querySelector('link, url, href')?.textContent || baseLink || '']
                });
            });
            return out;
        }
        // Fallback to RSS/Atom-like nodes
        const rssItems = this.app.parseRss(xmlText) || [];
        return rssItems.map(i => ({
            title: i.title,
            description: i.description,
            date: i.pubDate || i.published,
            sources: [i.link]
        }));
    }
}

// Enhanced App Methods
GeopoliticalApp.prototype.setupEventListeners = function() {
    // Window resize handler with debouncing for timeline updates
    let resizeTimeout;
    let previousIsMobile = this.isMobile;
    
    window.addEventListener('resize', () => {
        const newIsMobile = window.innerWidth <= 768;
        this.isMobile = newIsMobile;
        
        if (this.map) {
            this.map.invalidateSize();
        }
        this.positionZoomLabel();
        
        // Rebuild timeline when crossing mobile/desktop breakpoint
        if (previousIsMobile !== newIsMobile) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.rebuildTimeline();
                previousIsMobile = newIsMobile;
            }, 300); // Debounce for 300ms
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.sidebarVisible) {
            this.toggleMobileMenu();
        }
        if (e.key === ' ' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            this.isPlaying ? this.pauseTimelineAnimation() : this.playTimelineAnimation();
        }
        if (e.key === 'ArrowLeft') {
            this.navigateToEvent('previous');
        }
        if (e.key === 'ArrowRight') {
            this.navigateToEvent('next');
        }
    });
};

GeopoliticalApp.prototype.navigateToEvent = function(direction) {
    if (!this.selectedEvent) return;
    
    const currentIndex = this.filteredEvents.findIndex(e => e.id === this.selectedEvent.id);
    let newIndex;
    
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % this.filteredEvents.length;
    } else {
        newIndex = currentIndex === 0 ? this.filteredEvents.length - 1 : currentIndex - 1;
    }
    
    this.selectEvent(this.filteredEvents[newIndex].id);
};

GeopoliticalApp.prototype.toggleFullscreen = function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
};

GeopoliticalApp.prototype.toggleLayers = function() {
    // Toggle between different map themes
    this.switchTheme(this.theme === 'dark' ? 'light' : 'dark');
};

GeopoliticalApp.prototype.toggleHeatmap = function() {
    const button = document.getElementById('heatmapToggle');
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        // Add heatmap functionality here
        this.showHeatmap();
    } else {
        this.hideHeatmap();
    }
};

GeopoliticalApp.prototype.showHeatmap = function() {
    // Create heatmap data points
    const heatPoints = this.filteredEvents.map(event => [
        event.lat, 
        event.lng, 
        event.importance * 0.1
    ]);
    
    // This would require a heatmap library like Leaflet.heat
    // For now, just show enhanced markers
    this.markers.forEach(marker => {
        marker.setStyle({
            radius: marker.options.radius * 1.5,
            fillOpacity: 0.9
        });
    });
};

GeopoliticalApp.prototype.hideHeatmap = function() {
    this.markers.forEach(marker => {
        marker.setStyle({
            radius: marker.options.radius / 1.5,
            fillOpacity: 0.8
        });
    });
};

GeopoliticalApp.prototype.toggleConnections = function() {
    const button = document.getElementById('connectionsToggle');
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        this.addConnectionLines();
    } else {
        this.connectionLines.forEach(line => this.map.removeLayer(line));
        this.connectionLines = [];
    }
};

GeopoliticalApp.prototype.shareCurrentView = function() {
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const selectedEventId = this.selectedEvent ? this.selectedEvent.id : '';
    
    const url = `${window.location.origin}${window.location.pathname}?lat=${center.lat}&lng=${center.lng}&zoom=${zoom}&event=${selectedEventId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Геополітичні Події',
            text: this.selectedEvent ? this.selectedEvent.title : 'Інтерактивна карта геополітичних подій',
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        // Show toast notification
        this.showToast('Посилання скопійовано в буфер обміну!');
    }
};

GeopoliticalApp.prototype.shareEvent = function(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;
    
    const url = `${window.location.origin}${window.location.pathname}?event=${eventId}`;
    
    if (navigator.share) {
        navigator.share({
            title: event.title,
            text: event.description,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        this.showToast('Посилання на подію скопійовано!');
    }
};

GeopoliticalApp.prototype.showToast = function(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-surface);
        color: var(--color-text);
        padding: 12px 24px;
        border-radius: 25px;
        border: 1px solid var(--color-border);
        z-index: 10000;
        font-size: 14px;
        box-shadow: var(--shadow-lg);
        animation: toastIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
};

GeopoliticalApp.prototype.tryBootstrapLocalResources = function() {
    const sources = [
        { type: 'csv', url: 'ukraine_channels_events.csv' },
        { type: 'csv', url: 'data/new_events.csv', headerIfMissing: 'event_id,title,date,date_precision,location,region,category,source_video,transcript_snippet,confidence,provenance,extraction_method,dupe_flag' },
        { type: 'json', url: 'data/events_summary.json', jsonSelector: 'sample_new_events' }
    ];

    const fetchOne = async (src) => {
        try {
            const res = await fetch(src.url);
            if (!res.ok) return [];
            if (src.type === 'csv') {
                let text = await res.text();
                const firstLine = (text.split(/\r?\n/).find(Boolean) || '');
                const hasHeader = /(^|,)(id|event_id)(,|$)/i.test(firstLine) && /(^|,)(title)(,|$)/i.test(firstLine);
                if (!hasHeader && src.headerIfMissing) {
                    text = src.headerIfMissing + '\n' + text;
                }
                const rawRows = this.parseCsv(text);
                const normalized = this.normalizeAndValidateBatch(rawRows);
                // Preserve original string IDs if present for deduplication strength
                normalized.forEach((ev, idx) => {
                    const rid = rawRows[idx]?.id;
                    if (rid && typeof rid === 'string' && !Number.isInteger(Number(rid))) {
                        ev._originalId = String(rid);
                    }
                });
                return normalized;
            }
            if (src.type === 'json') {
                const json = await res.json();
                let arr = [];
                if (Array.isArray(json)) arr = json;
                else if (Array.isArray(json.events)) arr = json.events;
                else if (Array.isArray(json[src.jsonSelector])) {
                    arr = json[src.jsonSelector].map(item => ({
                        id: item.id,
                        title: item.title,
                        date: item.date,
                        category: this.normalizeCategoryLabel(item.category || ''),
                        region: this.normalizeRegionLabel(item.region || ''),
                        country: item.place || '',
                        description: item.description || '',
                        importance: item.importance,
                        sources: [item.url].filter(Boolean)
                    }));
                }
                return this.normalizeAndValidateBatch(arr);
            }
            return [];
        } catch (_) {
            return [];
        }
    };

    Promise.all(sources.map(fetchOne))
        .then(lists => {
            const allNew = lists.flat();
            if (!allNew.length) return;

            // Deduplicate within new items
            const seen = new Set();
            const uniqueNew = [];
            for (const ev of allNew) {
                const key = this.computeEventDedupKey(ev);
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueNew.push(ev);
                }
            }

            // Remove items already present in the app
            const existingKeys = new Set(this.events.map(ev => this.computeEventDedupKey(ev)));
            const toAdd = uniqueNew.filter(ev => !existingKeys.has(this.computeEventDedupKey(ev)));
            if (!toAdd.length) return;

            this.events.push(...toAdd);
            this.filteredEvents = [...this.events];
            // Recompute category counts
            this.categories.forEach(category => {
                category.count = this.events.filter(event => event.category === category.name).length;
            });
            // Refresh UI
            this.updateDisplay();
            this.rebuildTimeline();
            if (this.cameraController) this.cameraController.calculateOptimalBounds();
            this.showToast(`Імпортовано локальних подій: ${toAdd.length}`);
        })
        .catch(() => {});
};

// Safe wrapper to avoid blocking startup; with error telemetry
GeopoliticalApp.prototype.tryBootstrapLocalResourcesSafe = function() {
    try {
        this.tryBootstrapLocalResources();
    } catch (err) {
        this._telemetryError('bootstrap:local', err);
    }
};

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GeopoliticalApp();
});

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);

// Global function for popup buttons
window.app = app;