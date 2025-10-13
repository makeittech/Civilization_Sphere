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
        
        // Enhanced properties for mobile and playback
        this.isPlaying = false;
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
            { name: "Глобальні кризи", color: "#e67e22", icon: "🌍", count: 0 }
        ];
        
        this.channels = [
            { name: "Неаполітичні", color: "#e74c3c" },
            { name: "Good Times Bad Times UA", color: "#3498db" },
            { name: "Чотири сторони", color: "#f39c12" },
            { name: "Ціна Держави", color: "#27ae60" }
        ];

        this.regions = ["Європа", "Азія", "Близький Схід", "Північна Америка", "Євразія", "Глобально"];
        
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
            await this.initializeMap();
            this.initializeFilters();
            this.initializeSearch();
            this.initializeTimeline();
            this.initializeEventHandlers();
            this.initializeCharts();
            this.setupMobileOptimizations();
            this.updateDisplay();
        } catch (error) {
            console.error('Error initializing app:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    setupTheme() {
        // Set initial theme
        document.body.classList.add('dark-theme');
        
        // Theme toggle handlers
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.switchTheme(theme);
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

        // Set default date range
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        dateFrom.value = '2024-01-01';
        dateTo.value = '2025-12-31';

        // Add event listeners
        categoryContainer.addEventListener('change', () => this.applyFilters());
        regionSelect.addEventListener('change', () => this.applyFilters());
        dateFrom.addEventListener('change', () => this.applyFilters());
        dateTo.addEventListener('change', () => this.applyFilters());
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
    }

    initializeSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchSuggestions = document.getElementById('searchSuggestions');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length < 2) {
                searchSuggestions.style.display = 'none';
                return;
            }

            const matches = this.events.filter(event => 
                event.title.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query) ||
                event.country.toLowerCase().includes(query)
            ).slice(0, 5);

            if (matches.length > 0) {
                searchSuggestions.innerHTML = matches.map(event => 
                    `<div class="search-suggestion" onclick="app.selectEventAndSearch(${event.id}, '${event.title}')">
                        ${event.title} (${this.formatDate(event.date)})
                    </div>`
                ).join('');
                searchSuggestions.style.display = 'block';
            } else {
                searchSuggestions.style.display = 'none';
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });
    }

    selectEventAndSearch(eventId, title) {
        document.getElementById('searchInput').value = title;
        document.getElementById('searchSuggestions').style.display = 'none';
        this.selectEvent(eventId);
    }

    initializeTimeline() {
        const timeline = document.getElementById('timeline');
        const scale = document.getElementById('timelineScale');
        
        // Sort events by date
        const sortedEvents = [...this.events].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (sortedEvents.length === 0) return;
        const minYear = new Date(sortedEvents[0].date).getFullYear();
        const maxYear = new Date(sortedEvents[sortedEvents.length - 1].date).getFullYear();
        const yearRange = maxYear - minYear;
        
        timeline.innerHTML = '';
        scale.innerHTML = '';
        
        // Add events to timeline
        sortedEvents.forEach(event => {
            const eventYear = new Date(event.date).getFullYear();
            const position = ((eventYear - minYear) / yearRange) * 100;
            
            const category = this.categories.find(cat => cat.name === event.category);
            const color = category ? category.color : '#333';
            
            const eventElement = document.createElement('div');
            eventElement.className = 'timeline-event';
            eventElement.style.left = `${position}%`;
            eventElement.style.backgroundColor = color;
            eventElement.dataset.eventId = event.id;
            
            const tooltip = document.createElement('div');
            tooltip.className = 'timeline-tooltip';
            tooltip.textContent = `${event.title} (${eventYear})`;
            eventElement.appendChild(tooltip);
            
            eventElement.addEventListener('click', () => {
                this.selectEvent(event.id);
            });
            
            timeline.appendChild(eventElement);
        });
        
        // Add year markers
        for (let year = minYear; year <= maxYear; year += 10) {
            const position = ((year - minYear) / yearRange) * 100;
            const yearElement = document.createElement('div');
            yearElement.className = 'timeline-year';
            yearElement.style.left = `${position}%`;
            yearElement.textContent = year;
            scale.appendChild(yearElement);
        }
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

        // Enhanced timeline controls
        document.getElementById('timelinePlay').addEventListener('click', () => {
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
        const headers = ['ID', 'Назва', 'Дата', 'Категорія', 'Регіон', 'Країна', 'Опис', 'Учасники', 'Вплив'];
        const csvContent = [
            headers.join(','),
            ...this.filteredEvents.map(event => [
                event.id,
                `"${event.title}"`,
                event.date,
                `"${event.category}"`,
                `"${event.region}"`,
                `"${event.country}"`,
                `"${event.description}"`,
                `"${event.participants.join('; ')}"`,
                `"${event.impact}"`
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
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(content);
                    parsed = Array.isArray(data) ? data : (data.events || []);
                } else {
                    parsed = this.parseCsv(content);
                }
                const normalized = this.normalizeAndValidateBatch(parsed);
                this.importBuffer.push(...normalized);
                this.appendToImportPreview(normalized);
                document.getElementById('importBtn').disabled = this.importBuffer.length === 0;
                this.setImportStatus(`Завантажено з файлу: ${normalized.length}`, 30);
            } catch (err) {
                console.error('Import file parse error', err);
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
        const ensureArray = (v) => Array.isArray(v) ? v : (typeof v === 'string' && v.startsWith('[') ? JSON.parse(v.replace(/'/g, '"')) : (v ? [String(v)] : []));
        const dateRaw = raw.date || raw.publishedAt || raw.pubDate || raw.updated || '';
        const normalizedDate = this.normalizeEventDate(dateRaw);

        const event = {
            id: raw.id || this.nextId++,
            title: (raw.title || raw.headline || 'Без назви').toString().trim(),
            channel: raw.channel || raw.source || '',
            date: normalizedDate || new Date().toISOString().slice(0,10),
            category: raw.category || raw.topic || 'Політичні зміни',
            region: raw.region || '',
            country: raw.country || '',
            lat: toNumber(raw.lat ?? raw.latitude),
            lng: toNumber(raw.lng ?? raw.longitude),
            description: raw.description || raw.summary || raw.content || '',
            participants: ensureArray(raw.participants),
            impact: raw.impact || '',
            importance: Math.max(1, Math.min(10, parseInt(raw.importance || 5))),
            sources: ensureArray(raw.sources || raw.link)
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
        return true;
    }

    normalizeEventDate(input) {
        if (!input) return '';
        // Attempt to parse various formats and normalize to YYYY-MM-DD
        const parsed = new Date(input);
        if (isNaN(parsed.getTime())) return '';
        const iso = parsed.toISOString();
        return iso.slice(0, 10);
    }

    computeEventDedupKey(event) {
        // Prefer stable link if available
        const link = Array.isArray(event.sources) && event.sources.length ? event.sources[0] : '';
        if (link && /^https?:\/\//i.test(link)) {
            return `link:${link}`;
        }
        const title = (event.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const date = event.date || '';
        const lat = Number.isFinite(event.lat) ? event.lat.toFixed(3) : 'x';
        const lng = Number.isFinite(event.lng) ? event.lng.toFixed(3) : 'x';
        return `tdl:${title}|${date}|${lat}|${lng}`;
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

        const rssUrls = (rssTextarea?.value || '')
            .split(/\n|[,;]/)
            .map(u => u.trim())
            .filter(Boolean);

        const sources = [];
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
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=20`;
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

        this.isPlaying = true;
        this.playbackEvents = [...this.filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
        this.currentPlaybackIndex = 0;
        
        // Update UI
        this.updatePlaybackUI();
        
        // Start playback
        this.continuePlayback();
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
            this.continuePlayback();
        }, delay);
    }
    
    updateTimelinePlayhead() {
        const playhead = document.getElementById('timelinePlayhead');
        if (!playhead || this.playbackEvents.length === 0) return;
        
        const progress = this.currentPlaybackIndex / this.playbackEvents.length;
        const timelineWidth = document.getElementById('timeline').offsetWidth;
        playhead.style.left = `${progress * timelineWidth}px`;
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
        
        document.getElementById('timelinePlayhead').classList.remove('active');
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
            case 'xml':
                return await this.fetchGenericXml(src);
            case 'newsapi':
                return await this.fetchNewsApiWrapper(src);
            default:
                // Try JSON, then RSS, then XML
                try { return await this.fetchGenericJson(src); } catch(_) {}
                try { return await this.app.fetchRss(src.url, src.corsProxy); } catch(_) {}
                return await this.fetchGenericXml(src);
        }
    }

    async fetchGenericJson(src) {
        const res = await this.app.fetchWithCors(src.url, src.corsProxy).catch(() => fetch(src.url));
        const json = await res.json();
        if (Array.isArray(json)) return json;
        if (json && Array.isArray(json.events)) return json.events;
        if (json && json.data && Array.isArray(json.data)) return json.data;
        return [];
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
    // Window resize handler
    window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        if (this.map) {
            this.map.invalidateSize();
        }
        this.positionZoomLabel();
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