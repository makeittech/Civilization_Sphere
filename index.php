<?php
/**
 * Civilization Sphere - PHP Version
 * Works on any PHP hosting without additional services
 */

// Load events data
$eventsFile = 'data/events.json';
$events = [];

if (file_exists($eventsFile)) {
    $jsonContent = file_get_contents($eventsFile);
    $events = json_decode($jsonContent, true);
}

// Embed data directly in HTML
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Civilization Sphere - Інтерактивна платформа для візуалізації геополітичних подій України">
    <meta name="theme-color" content="#1e293b">
    <title>Civilization Sphere - Геополітична Карта України</title>
    
    <!-- Leaflet.js CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossorigin=""/>
    
    <!-- Leaflet MarkerCluster CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
    
    <!-- Main Styles -->
    <link rel="stylesheet" href="style.css">
    
    <!-- Embedded Data from PHP -->
    <script>
        // Data loaded server-side by PHP
        window.EVENTS_DATA = <?php echo json_encode($events); ?>;
        console.log('✓ Data loaded via PHP:', window.EVENTS_DATA.length, 'events');
    </script>
</head>
<body class="light-theme">
    <!-- Skip to main content for accessibility -->
    <a href="#main-content" class="skip-link">Перейти до основного контенту</a>
    
    <!-- Header -->
    <header class="app-header">
        <div class="header-container">
            <div class="header-left">
                <div class="logo">
                    <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <div class="logo-text">
                        <h1>Civilization Sphere</h1>
                        <p class="subtitle">Геополітична Карта України (PHP Version)</p>
                    </div>
                </div>
            </div>
            
            <nav class="header-nav">
                <button class="icon-btn" id="theme-toggle" title="Перемикач теми" aria-label="Перемикач теми">
                    <svg class="theme-icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                    <svg class="theme-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                </button>
                <button class="icon-btn" id="help-btn" title="Довідка" aria-label="Довідка">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </button>
                <button class="icon-btn mobile-only" id="mobile-filters-toggle" title="Фільтри" aria-label="Фільтри">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                </button>
            </nav>
        </div>
    </header>

    <!-- Main Application -->
    <main id="main-content" class="app-main">
        <!-- Left Sidebar - Filters and Controls -->
        <aside class="sidebar sidebar-left" id="filters-sidebar">
            <div class="sidebar-header">
                <h2>Фільтри та Керування</h2>
                <button class="close-btn mobile-only" id="close-filters" aria-label="Закрити">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            
            <div class="sidebar-content">
                <!-- Search -->
                <section class="filter-section">
                    <h3 class="section-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        Пошук
                    </h3>
                    <input type="text" id="search-input" class="search-input" 
                           placeholder="Пошук подій..." aria-label="Пошук подій">
                </section>

                <!-- Quick Filters -->
                <section class="filter-section">
                    <h3 class="section-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                        Швидкі Фільтри
                    </h3>
                    <div class="quick-filters">
                        <button class="quick-filter active" data-filter="all">Всі події</button>
                        <button class="quick-filter" data-filter="recent">Останні 7 днів</button>
                        <button class="quick-filter" data-filter="important">Важливі (8+)</button>
                        <button class="quick-filter" data-filter="conflicts">Конфлікти</button>
                    </div>
                </section>

                <!-- Categories -->
                <section class="filter-section">
                    <h3 class="section-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        Категорії
                    </h3>
                    <div class="filter-list scrollable" id="categories-list"></div>
                </section>

                <!-- Regions -->
                <section class="filter-section">
                    <h3 class="section-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Регіони
                    </h3>
                    <div class="filter-list scrollable" id="regions-list"></div>
                </section>

                <!-- Channels -->
                <section class="filter-section">
                    <h3 class="section-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                            <polyline points="17 2 12 7 7 2"/>
                        </svg>
                        Канали
                    </h3>
                    <div class="filter-list scrollable" id="channels-list"></div>
                </section>

                <!-- Date Range -->
                <section class="filter-section">
                    <h3 class="section-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Період
                    </h3>
                    <div class="date-range">
                        <input type="date" id="date-from" class="date-input" aria-label="Дата від">
                        <span class="date-separator">—</span>
                        <input type="date" id="date-to" class="date-input" aria-label="Дата до">
                    </div>
                </section>

                <!-- Export -->
                <section class="filter-section">
                    <h3 class="section-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Експорт Даних
                    </h3>
                    <div class="export-buttons">
                        <button class="btn btn-secondary" id="export-csv">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            Експорт CSV
                        </button>
                        <button class="btn btn-secondary" id="export-json">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            Експорт JSON
                        </button>
                    </div>
                </section>

                <!-- Statistics -->
                <section class="filter-section">
                    <h3 class="section-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="20" x2="12" y2="10"/>
                            <line x1="18" y1="20" x2="18" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="16"/>
                        </svg>
                        Статистика
                    </h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="total-events">0</div>
                            <div class="stat-label">Всього подій</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="visible-events">0</div>
                            <div class="stat-label">Видимих</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="region-count">0</div>
                            <div class="stat-label">Регіонів</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="channel-count">0</div>
                            <div class="stat-label">Каналів</div>
                        </div>
                    </div>
                </section>
            </div>
        </aside>

        <!-- Center Content Area -->
        <div class="content-area">
            <!-- Map Section -->
            <section class="map-container">
                <div id="map" class="map"></div>
                <div class="map-controls">
                    <button class="map-btn" id="zoom-in" title="Збільшити">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                            <line x1="11" y1="8" x2="11" y2="14"/>
                            <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                    </button>
                    <button class="map-btn" id="zoom-out" title="Зменшити">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                            <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                    </button>
                    <button class="map-btn" id="reset-view" title="Скинути вид">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"/>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                    </button>
                </div>
            </section>

            <!-- Timeline Section -->
            <section class="timeline-container">
                <div class="timeline-header">
                    <div class="timeline-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <h3>Часова Шкала</h3>
                    </div>
                    <div class="timeline-controls">
                        <button class="timeline-btn" id="play-btn" title="Відтворити">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                        </button>
                        <button class="timeline-btn" id="pause-btn" title="Пауза" style="display: none;">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16"/>
                                <rect x="14" y="4" width="4" height="16"/>
                            </svg>
                        </button>
                        <button class="timeline-btn" id="reset-btn" title="Скинути">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="1 4 1 10 7 10"/>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                            </svg>
                        </button>
                        <div class="speed-selector">
                            <select id="speed-select" aria-label="Швидкість відтворення">
                                <option value="0.5">0.5x</option>
                                <option value="1" selected>1x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                                <option value="3">3x</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="timeline-track">
                    <div class="timeline-progress" id="timeline-progress"></div>
                    <div class="timeline-handle" id="timeline-handle"></div>
                </div>
                <div class="timeline-info">
                    <span id="current-date">—</span>
                    <span class="separator">/</span>
                    <span id="end-date">—</span>
                </div>
            </section>

            <!-- Analytics Section -->
            <section class="analytics-container">
                <div class="analytics-header">
                    <h3>
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"/>
                            <line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                        Аналітика
                    </h3>
                </div>
                <div class="charts-grid">
                    <div class="chart-card">
                        <h4>Розподіл за категоріями</h4>
                        <canvas id="category-chart"></canvas>
                    </div>
                    <div class="chart-card">
                        <h4>Розподіл за регіонами</h4>
                        <canvas id="region-chart"></canvas>
                    </div>
                    <div class="chart-card">
                        <h4>Події за часом</h4>
                        <canvas id="time-chart"></canvas>
                    </div>
                    <div class="chart-card">
                        <h4>Рівень важливості</h4>
                        <canvas id="importance-chart"></canvas>
                    </div>
                </div>
            </section>
        </div>

        <!-- Right Sidebar - Event Details -->
        <aside class="sidebar sidebar-right" id="details-sidebar">
            <div class="sidebar-header">
                <h2>Деталі Події</h2>
                <button class="close-btn" id="close-details" aria-label="Закрити">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="sidebar-content" id="event-details">
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4"/>
                        <path d="M12 8h.01"/>
                    </svg>
                    <p>Виберіть подію на карті для перегляду деталей</p>
                </div>
            </div>
        </aside>
    </main>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loading">
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p id="loading-text">Завантаження даних...</p>
        </div>
    </div>

    <!-- Emergency fallback to hide loading after 15 seconds -->
    <script>
        setTimeout(function() {
            const loading = document.getElementById('loading');
            const loadingText = document.getElementById('loading-text');
            if (loading && loading.style.display !== 'none') {
                console.error('Loading took too long - forcing hide');
                loadingText.textContent = 'Помилка завантаження. Оновіть сторінку.';
                loadingText.style.color = '#ef4444';
                setTimeout(function() {
                    loading.style.display = 'none';
                    alert('Помилка завантаження застосунку. Перевірте консоль браузера (F12) для деталей.');
                }, 3000);
            }
        }, 15000);
    </script>

    <!-- Toast Notifications -->
    <div class="toast-container" id="toast-container"></div>

    <!-- Help Modal -->
    <div class="modal" id="help-modal" style="display: none;">
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Довідка - Civilization Sphere</h2>
                <button class="close-btn" id="close-help-modal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <section>
                    <h3>🗺️ Навігація по Карті</h3>
                    <ul>
                        <li>Клацніть та перетягніть для переміщення</li>
                        <li>Прокрутка для масштабування</li>
                        <li>Клацніть на маркері для перегляду деталей події</li>
                        <li>Використовуйте кнопки + / - для масштабування</li>
                    </ul>
                </section>
                <section>
                    <h3>🔍 Фільтрація</h3>
                    <ul>
                        <li>Використовуйте пошук для швидкого знаходження подій</li>
                        <li>Швидкі фільтри для популярних критеріїв</li>
                        <li>Виберіть категорії, регіони та канали</li>
                        <li>Встановіть діапазон дат</li>
                    </ul>
                </section>
                <section>
                    <h3>⏱️ Часова Шкала</h3>
                    <ul>
                        <li>Натисніть ▶ для відтворення подій у часі</li>
                        <li>Виберіть швидкість відтворення</li>
                        <li>Перетягніть повзунок для навігації</li>
                        <li>Натисніть ↻ для скидання</li>
                    </ul>
                </section>
                <section>
                    <h3>📊 Аналітика</h3>
                    <ul>
                        <li>Діаграми оновлюються автоматично при фільтрації</li>
                        <li>Наведіть курсор для деталей</li>
                        <li>Клацніть на легенді для приховання категорій</li>
                    </ul>
                </section>
                <section>
                    <h3>💾 Експорт</h3>
                    <ul>
                        <li>Експортуйте відфільтровані дані у CSV або JSON</li>
                        <li>Файли завантажуються автоматично</li>
                    </ul>
                </section>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" 
            crossorigin=""></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
    <!-- Main Application (data already embedded above) -->
    <script src="app.js"></script>
</body>
</html>
