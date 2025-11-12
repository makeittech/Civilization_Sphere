# Civilization Sphere - RSS Collector Project Plan

**Project Name:** Civilization Sphere  
**Version:** 2.0.0  
**Technology Stack:** HTML5, Vanilla JavaScript (ES6+), SQLite  
**Last Updated:** December 2024

---

## Executive Summary

**Civilization Sphere** is a lightweight, client-side RSS feed collector and aggregator application built with pure HTML and JavaScript. The application enables users to subscribe to multiple RSS feeds, automatically fetch and store articles in a local SQLite database, and browse content through an intuitive web interface.

### Key Characteristics
- **Zero Dependencies:** Pure HTML/CSS/JavaScript - no frameworks or build tools
- **Local-First:** All data stored locally in SQLite database
- **Offline Capable:** Works without internet connection after initial feed fetch
- **Privacy-Focused:** No external services, no data collection, fully client-side
- **Lightweight:** Minimal resource footprint, fast performance

---

## 1. Core Functionalities

### 1.1 RSS Feed Management

#### Intuitive Feed Subscription
- **Add RSS Feed:** Users can add RSS feed URLs manually with one-click validation
- **Feed Validation:** Real-time validation of RSS/Atom feed format before adding
- **Bulk Feed Import:** Import multiple feeds at once via OPML or CSV
- **Feed Preview:** Preview feed content and recent articles before subscribing
- **Feed Metadata:** Store feed title, description, language, last update time, favicon
- **Feed Status:** Track feed health (active, error, disabled) with visual indicators
- **Feed Organization:** Drag-and-drop reordering of feeds in sidebar
- **Quick Actions:** Context menu with quick actions (update, edit, delete, disable)

#### Feed Categorization and Tagging
- **Feed Categories:** Organize feeds into custom categories (e.g., "News", "Technology", "Politics")
- **Multiple Categories:** Assign feeds to multiple categories for flexible organization
- **Feed Tags:** Tag feeds with custom tags for advanced filtering (e.g., "daily", "breaking", "analysis")
- **Category Colors:** Assign color codes to categories for visual organization
- **Category Icons:** Custom icons for categories and feeds
- **Nested Categories:** Support for hierarchical category structure
- **Smart Categorization:** Auto-suggest categories based on feed content
- **Tag Management:** Create, edit, and delete tags with usage statistics

#### Feed Discovery
- **OPML Import:** Import feed lists from OPML files with category preservation
- **OPML Export:** Export feed subscriptions for backup/transfer with all metadata
- **Feed Recommendations:** Suggest popular feeds by category (optional, local list)
- **Auto-Detection:** Detect RSS feeds from website URLs automatically
- **Feed Search:** Search for feeds by name, URL, or category

### 1.2 Article Collection & Storage

#### Smart Automatic Fetching
- **Custom Update Intervals:** Per-feed configurable update intervals (minutes, hours, days, weeks)
- **Smart Refresh Scheduling:** Intelligent scheduling based on feed update patterns
- **Adaptive Intervals:** Automatically adjust update frequency based on feed activity
- **Time-Based Scheduling:** Schedule updates for specific times of day
- **Priority-Based Updates:** Update high-priority feeds more frequently
- **Background Sync:** Fetch feeds in background without blocking UI using Web Workers
- **Incremental Updates:** Only fetch new articles since last update using ETags and Last-Modified headers
- **Error Handling:** Retry failed feeds with exponential backoff and smart retry logic
- **Rate Limiting:** Respect feed server rate limits and implement request throttling
- **Update Notifications:** Notify users when feeds are updated with new article counts

#### Article Processing
- **Content Extraction:** Extract title, description, content, author, date
- **Media Handling:** Download and store images locally (optional)
- **HTML Sanitization:** Clean HTML content for safe display
- **Duplicate Detection:** Prevent storing duplicate articles
- **Full-Text Indexing:** Enable fast search across all articles

### 1.3 Content Browsing & Reading

#### Article List View
- **Chronological Feed:** Display articles sorted by publication date (newest/oldest)
- **Advanced Filtering:** Multi-criteria filtering system:
  - Filter by specific feed or multiple feeds
  - Filter by category or multiple categories
  - Filter by feed tags
  - Filter by article tags
  - Filter by date range (absolute or relative)
  - Filter by read/unread status
  - Filter by bookmarked/saved status
  - Filter by author
  - Filter by importance/priority
- **Advanced Search Functionality:**
  - Full-text search across titles, content, and descriptions
  - Boolean operators (AND, OR, NOT)
  - Phrase search with quotes
  - Search history and saved searches
  - Search suggestions and autocomplete
  - Search within specific feeds or categories
  - Search by date range
- **Tag System:** Auto-generate or manually assign tags to articles
- **Read/Unread Status:** Track reading progress with visual indicators
- **Article Bookmarking:** Save articles for later reading with custom collections
- **Article Saving:** Save articles locally for offline access

#### Customizable Article Reading
- **Reading View:** Clean, distraction-free reading interface with multiple layout options
- **Reading Layouts:**
  - Single column (narrow, comfortable, wide)
  - Two column (article + sidebar)
  - Full-width immersive reading
  - Magazine-style multi-column
- **Customizable Reading Experience:**
  - **Theme Selection:** Light mode, dark mode, sepia mode, high contrast
  - **Font Size:** Adjustable font size (small, medium, large, extra-large)
  - **Font Family:** Choose from multiple font families (serif, sans-serif, monospace)
  - **Line Height:** Adjustable line spacing for comfortable reading
  - **Column Width:** Adjustable text column width
  - **Margin Settings:** Customizable page margins
  - **Reading Preferences:** Save reading preferences per user
- **Article Metadata:** Display source, date, author, tags, reading time estimate
- **Related Articles:** Show articles from same feed, category, or with similar tags
- **Navigation:** Previous/Next article navigation with keyboard shortcuts
- **Share Functionality:** Copy article link or export as text/HTML/PDF
- **Article Actions:**
  - Bookmark article
  - Save article for offline reading
  - Mark as read/unread
  - Share article
  - Print article

### 1.4 Offline Reading Capability

#### Offline Content Management
- **Article Caching:** Automatically cache articles for offline reading
- **Selective Downloading:** Choose which articles to save for offline access
- **Offline Collections:** Create collections of articles for offline reading
- **Sync Management:** Manage which feeds sync when online
- **Offline Indicators:** Visual indicators showing which articles are available offline
- **Storage Management:** Monitor and manage offline storage usage
- **Auto-Sync:** Automatically sync articles when connection is restored
- **Offline Reading Mode:** Dedicated offline reading interface
- **Content Preloading:** Preload articles from selected feeds for offline access
- **Media Caching:** Cache images and media content for offline viewing

### 1.5 Article Bookmarking and Saving

#### Bookmark Management
- **Article Bookmarks:** Save articles to bookmarks for quick access
- **Bookmark Collections:** Organize bookmarks into custom collections
- **Bookmark Tags:** Tag bookmarks for better organization
- **Bookmark Notes:** Add personal notes to bookmarked articles
- **Bookmark Search:** Search within bookmarked articles
- **Bookmark Export:** Export bookmarks as HTML, JSON, or CSV
- **Smart Bookmarks:** Auto-bookmark articles based on keywords or rules

#### Article Saving
- **Save Articles:** Save articles locally for permanent access
- **Saved Articles Library:** Browse and manage all saved articles
- **Save Formats:** Save articles as HTML, plain text, or PDF
- **Archive Management:** Archive old saved articles
- **Save Metadata:** Preserve article metadata when saving
- **Bulk Operations:** Save multiple articles at once

### 1.6 Data Management

#### Database Operations
- **SQLite Storage:** All data stored in local SQLite database
- **Database Schema:** Structured tables for feeds, articles, categories, tags
- **Data Integrity:** Foreign key constraints, data validation
- **Backup/Restore:** Export database for backup, import for restore
- **Database Maintenance:** Vacuum, optimize, and clean old data

#### Data Export
- **Export Formats:** JSON, CSV, HTML
- **Selective Export:** Export by feed, category, date range
- **Article Archiving:** Archive old articles to reduce database size

### 1.7 Settings & Configuration

#### Application Settings
- **Update Frequency:** Configure automatic update intervals (global and per-feed)
- **Smart Refresh Settings:** Configure adaptive refresh behavior
- **Storage Limits:** Set maximum articles per feed and total storage limits
- **Theme:** Light/dark/sepia/high contrast mode toggle with custom themes
- **Reading Preferences:** Configure default reading experience (font, layout, spacing)
- **Language:** UI language selection (if multi-language support)
- **Notifications:** Browser notifications for new articles (optional)
- **Offline Settings:** Configure offline reading and caching preferences
- **Search Settings:** Configure search behavior and default filters

#### Feed Settings
- **Per-Feed Update Frequency:** Different update intervals per feed
- **Article Retention:** Days to keep articles per feed
- **Content Filters:** Filter articles by keywords or patterns
- **Auto-Delete:** Automatically delete old articles

---

## 2. UI Components

### 2.1 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header Bar                                              │
│ [Logo] [Title] [Search] [Settings] [Theme Toggle]      │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │         Main Content Area                    │
│          │                                              │
│ - Feeds  │  - Article List / Reading View              │
│ - Tags   │  - Feed Management                          │
│ - Search │  - Settings Panel                           │
│ - Stats  │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 2.2 Core UI Components

#### Header Component
- **Application Logo/Title:** "Civilization Sphere"
- **Global Search Bar:** Quick search across all articles
- **Settings Button:** Access application settings
- **Theme Toggle:** Switch between light/dark mode
- **Update Status Indicator:** Show last update time and status

#### Sidebar Navigation
- **Feed List:**
  - Expandable feed groups by category with color coding
  - Unread count badges
  - Feed status indicators (active/error/disabled)
  - Feed tags display
  - Drag-and-drop reordering
  - Context menu (edit, delete, update now, categorize, tag)
  - Quick filter by feed tag
- **Categories Panel:**
  - Hierarchical category tree
  - Category color indicators
  - Article counts per category
  - Quick category management
- **Tags Panel:**
  - List of all article tags with counts
  - List of all feed tags with counts
  - Click to filter articles by tag
  - Tag cloud visualization
  - Tag management (create, edit, delete, merge)
- **Search Panel:**
  - Advanced search interface
  - Recent searches
  - Saved search queries
  - Search filters sidebar
  - Search suggestions
- **Bookmarks Panel:**
  - Bookmark collections
  - Saved articles library
  - Quick access to bookmarked content
- **Statistics Panel:**
  - Total articles count
  - Unread articles count
  - Feeds count
  - Storage usage
  - Offline storage usage
  - Reading statistics

#### Main Content Area

**Feed Management View:**
- **Add Feed Form:**
  - URL input field with validation
  - Category selector (multi-select)
  - Feed tag selector (multi-select)
  - Auto-fetch metadata button
  - Feed preview panel
  - Update interval selector
  - Priority selector
  - Add button
- **Feed List Table/Grid:**
  - Feed name, category, tags, last update, article count, status
  - Visual status indicators
  - Color-coded categories
  - Drag-and-drop reordering
  - Bulk actions (update, delete, categorize, tag)
  - Actions: Edit, Delete, Update Now, View Articles, Disable/Enable
  - Filter and sort options
- **OPML Import/Export:**
  - File picker for OPML import
  - Export button for OPML export
  - Bulk feed import from CSV
  - Feed backup/restore

**Article List View:**
- **Advanced Filter Bar:**
  - Feed selector (multi-select with search)
  - Category selector (multi-select)
  - Feed tag selector
  - Article tag selector
  - Date range picker (absolute and relative)
  - Read/Unread toggle
  - Bookmarked toggle
  - Saved articles toggle
  - Author filter
  - Search within results
  - Save filter presets
  - Clear all filters
- **Article Cards:**
  - Feed name badge with category color
  - Article title (link)
  - Publication date with relative time
  - Excerpt/preview
  - Article tags
  - Feed tags
  - Read/Unread indicator
  - Bookmark button
  - Save button
  - Star button
  - Offline indicator
  - Actions menu (read, bookmark, save, share, delete)
- **View Options:**
  - List view / Grid view / Compact view
  - Sort options (date, title, feed, relevance)
  - Items per page selector
- **Pagination:**
  - Page numbers
  - Infinite scroll option
  - Total count display
  - Jump to page

**Article Reading View:**
- **Reading Controls Toolbar:**
  - Theme toggle (light/dark/sepia/high contrast)
  - Font size controls (- / + / reset)
  - Font family selector
  - Line height adjuster
  - Column width adjuster
  - Layout selector (single column, two column, full-width)
  - Reading preferences save button
- **Article Header:**
  - Title
  - Feed name and link with category badge
  - Publication date and author
  - Reading time estimate
  - Tags (article and feed tags)
  - Bookmark button
  - Save button
  - Star/Unstar button
  - Offline indicator
- **Article Content:**
  - Full article HTML content with customizable styling
  - Embedded images (with offline support)
  - Links (open in new tab)
  - Responsive images
  - Syntax highlighting for code blocks
- **Article Footer:**
  - Original article link
  - Previous/Next navigation with keyboard shortcuts
  - Share button (multiple formats)
  - Mark as read/unread
  - Related articles section
  - Print button
  - Export button (HTML, PDF, text)

**Settings View:**
- **General Settings:**
  - Update frequency selector (global default)
  - Smart refresh settings (adaptive intervals, priority-based)
  - Storage limits (per feed and total)
  - Theme selector (light/dark/sepia/high contrast)
  - Language selector
  - Notification preferences
- **Reading Preferences:**
  - Default font size
  - Default font family
  - Default line height
  - Default column width
  - Default layout
  - Default theme for reading
  - Reading time estimates
- **Feed Settings:**
  - Per-feed configuration table with inline editing
  - Update intervals per feed
  - Priority settings
  - Category and tag management
  - Bulk actions (update, delete, categorize, tag)
- **Offline Settings:**
  - Offline storage limits
  - Auto-sync preferences
  - Offline collection management
  - Cache management
- **Search Settings:**
  - Default search behavior
  - Search result preferences
  - Saved searches management
- **Data Management:**
  - Database statistics
  - Storage usage breakdown
  - Backup database button
  - Restore database button
  - Clean old articles button
  - Export data (JSON, CSV, HTML)
  - Import data

### 2.3 Interactive Elements

#### Modals/Dialogs
- **Add Feed Modal:** Feed URL input and validation
- **Edit Feed Modal:** Modify feed settings
- **Article Details Modal:** Quick preview without leaving list
- **Settings Modal:** Application configuration
- **Confirmation Dialogs:** Delete confirmations, etc.

#### Notifications
- **Toast Notifications:** Success/error messages
- **Update Progress:** Show feed update progress
- **New Articles Alert:** Notify when new articles arrive

#### Loading States
- **Skeleton Loaders:** For article list
- **Progress Indicators:** For feed updates
- **Spinner:** For async operations

---

## 3. Architectural Overview

### 3.1 Technology Stack

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  HTML5 + CSS3 + Vanilla JavaScript      │
│  (No frameworks, no build tools)        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Application Logic Layer          │
│  - Feed Manager (RSS parsing)           │
│  - Article Manager (CRUD operations)     │
│  - Database Manager (SQLite wrapper)     │
│  - UI Controller (DOM manipulation)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Data Storage Layer               │
│  SQLite Database (sql.js or better-sqlite3)│
│  - feeds table                           │
│  - articles table                         │
│  - categories table                       │
│  - tags table                             │
│  - article_tags junction table            │
└─────────────────────────────────────────┘
```

### 3.2 File Structure

```
civilization-sphere-rss/
├── index.html                 # Main HTML file
├── css/
│   ├── styles.css            # Main stylesheet
│   ├── themes.css            # Light/dark theme styles
│   └── components.css        # Component-specific styles
├── js/
│   ├── app.js                # Main application entry point
│   ├── database.js           # SQLite database wrapper
│   ├── feed-manager.js       # RSS feed fetching and parsing
│   ├── article-manager.js    # Article CRUD operations
│   ├── ui-controller.js      # DOM manipulation and UI logic
│   ├── storage.js            # Local storage utilities
│   └── utils.js              # Utility functions
├── lib/
│   └── sql.js                # SQLite compiled to WebAssembly (or better-sqlite3)
├── data/
│   └── database.db           # SQLite database file (generated)
└── assets/
    ├── icons/                 # Application icons
    └── images/                # Static images
```

### 3.3 Core Modules

#### 3.3.1 Database Module (`database.js`)

**Responsibilities:**
- Initialize SQLite database
- Create database schema
- Provide query interface
- Handle transactions
- Database backup/restore

**Key Functions:**
```javascript
class Database {
    async init()
    async createSchema()
    async query(sql, params)
    async execute(sql, params)
    async transaction(callback)
    async backup(filePath)
    async restore(filePath)
    async vacuum()
}
```

#### 3.3.2 Feed Manager Module (`feed-manager.js`)

**Responsibilities:**
- Fetch RSS/Atom feeds from URLs
- Parse XML feed content
- Extract feed metadata
- Validate feed format
- Handle feed errors and retries
- Manage feed categories and tags
- Smart refresh scheduling
- Priority-based update queue

**Key Functions:**
```javascript
class FeedManager {
    async fetchFeed(url)
    async parseFeed(xmlContent)
    async validateFeed(feedData)
    async extractArticles(feedData)
    async updateFeed(feedId)
    async updateAllFeeds()
    async scheduleSmartRefresh(feedId)
    async getFeedsByCategory(categoryId)
    async getFeedsByTag(tagId)
    async assignCategory(feedId, categoryId)
    async assignTag(feedId, tagId)
    async removeCategory(feedId, categoryId)
    async removeTag(feedId, tagId)
}
```

#### 3.3.3 Article Manager Module (`article-manager.js`)

**Responsibilities:**
- CRUD operations for articles
- Advanced article search and filtering
- Tag management
- Read/unread status
- Article bookmarking and saving
- Offline content management
- Article relationships

**Key Functions:**
```javascript
class ArticleManager {
    async createArticle(articleData)
    async getArticle(articleId)
    async updateArticle(articleId, updates)
    async deleteArticle(articleId)
    async searchArticles(query, filters)
    async getArticlesByFeed(feedId, filters)
    async getArticlesByCategory(categoryId, filters)
    async getArticlesByTag(tagId, filters)
    async markAsRead(articleId)
    async starArticle(articleId)
    async bookmarkArticle(articleId, collectionId, notes)
    async unbookmarkArticle(articleId)
    async saveArticle(articleId, format)
    async unsaveArticle(articleId)
    async prepareForOffline(articleId)
    async getBookmarkedArticles(filters)
    async getSavedArticles(filters)
    async getOfflineArticles()
    async estimateReadingTime(articleId)
}
```

#### 3.3.4 UI Controller Module (`ui-controller.js`)

**Responsibilities:**
- DOM manipulation
- Event handling
- View rendering
- User interaction management
- State management
- Reading experience customization
- Theme management

**Key Functions:**
```javascript
class UIController {
    renderFeedList(feeds)
    renderArticleList(articles)
    renderArticle(article)
    showModal(modalType, data)
    updateSidebar()
    handleSearch(query)
    handleFilterChange(filters)
    applyReadingPreferences(preferences)
    changeTheme(theme)
    adjustFontSize(size)
    changeLayout(layout)
    renderBookmarks(bookmarks)
    renderSavedArticles(articles)
    showOfflineIndicator(articleId)
}
```

#### 3.3.5 Reading Preferences Module (`reading-preferences.js`)

**Responsibilities:**
- Manage reading preferences
- Apply reading settings
- Persist user preferences
- Theme management

**Key Functions:**
```javascript
class ReadingPreferences {
    async loadPreferences()
    async savePreferences(preferences)
    applyTheme(theme)
    applyFontSettings(fontSize, fontFamily, lineHeight)
    applyLayout(layout, columnWidth)
    resetToDefaults()
}
```

#### 3.3.6 Offline Manager Module (`offline-manager.js`)

**Responsibilities:**
- Manage offline content
- Cache articles for offline reading
- Sync management
- Storage management

**Key Functions:**
```javascript
class OfflineManager {
    async cacheArticle(articleId)
    async removeCachedArticle(articleId)
    async getOfflineArticles()
    async syncWhenOnline()
    async getStorageUsage()
    async clearCache()
    async preloadFeed(feedId)
}
```

### 3.4 Data Flow

#### Feed Update Flow
```
User Action / Scheduled Task
    ↓
FeedManager.fetchFeed(url)
    ↓
Parse XML → Extract Articles
    ↓
ArticleManager.checkDuplicates()
    ↓
ArticleManager.createArticle() (if new)
    ↓
Database.insert()
    ↓
UIController.updateUI()
    ↓
Show Notification
```

#### Article Reading Flow
```
User Clicks Article
    ↓
ArticleManager.getArticle(id)
    ↓
Database.query()
    ↓
UIController.renderArticle()
    ↓
ArticleManager.markAsRead(id)
    ↓
Database.update()
    ↓
UIController.updateSidebar()
```

### 3.5 Database Schema

#### Feeds Table
```sql
CREATE TABLE feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    description TEXT,
    link TEXT,
    language TEXT,
    favicon_url TEXT,
    update_frequency INTEGER DEFAULT 3600, -- seconds
    priority INTEGER DEFAULT 0, -- higher priority = more frequent updates
    last_update TIMESTAMP,
    last_successful_update TIMESTAMP,
    next_update TIMESTAMP, -- calculated next update time
    error_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, error, disabled
    auto_update INTEGER DEFAULT 1, -- enable/disable auto-updates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feed_categories (
    feed_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (feed_id, category_id),
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_feeds_status ON feeds(status);
CREATE INDEX idx_feeds_next_update ON feeds(next_update);
CREATE INDEX idx_feeds_priority ON feeds(priority);
CREATE INDEX idx_feed_categories_feed ON feed_categories(feed_id);
CREATE INDEX idx_feed_categories_category ON feed_categories(category_id);
```

#### Articles Table
```sql
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id INTEGER NOT NULL,
    guid TEXT UNIQUE,
    title TEXT NOT NULL,
    link TEXT,
    description TEXT,
    content TEXT,
    author TEXT,
    pub_date TIMESTAMP,
    is_read INTEGER DEFAULT 0,
    is_starred INTEGER DEFAULT 0,
    is_bookmarked INTEGER DEFAULT 0,
    is_saved INTEGER DEFAULT 0,
    is_offline INTEGER DEFAULT 0,
    reading_time INTEGER, -- estimated reading time in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE
);

CREATE INDEX idx_articles_feed ON articles(feed_id);
CREATE INDEX idx_articles_pub_date ON articles(pub_date DESC);
CREATE INDEX idx_articles_read ON articles(is_read);
CREATE INDEX idx_articles_starred ON articles(is_starred);
CREATE INDEX idx_articles_bookmarked ON articles(is_bookmarked);
CREATE INDEX idx_articles_saved ON articles(is_saved);
CREATE INDEX idx_articles_offline ON articles(is_offline);
CREATE INDEX idx_articles_guid ON articles(guid);
```

#### Bookmarks Table
```sql
CREATE TABLE bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    collection_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES bookmark_collections(id) ON DELETE SET NULL
);

CREATE INDEX idx_bookmarks_article ON bookmarks(article_id);
CREATE INDEX idx_bookmarks_collection ON bookmarks(collection_id);
```

#### Bookmark Collections Table
```sql
CREATE TABLE bookmark_collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Saved Articles Table
```sql
CREATE TABLE saved_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    format TEXT DEFAULT 'html', -- html, text, pdf
    saved_content TEXT, -- full content saved locally
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_articles_article ON saved_articles(article_id);
```

#### Reading Preferences Table
```sql
CREATE TABLE reading_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'default',
    theme TEXT DEFAULT 'light',
    font_size TEXT DEFAULT 'medium',
    font_family TEXT DEFAULT 'sans-serif',
    line_height REAL DEFAULT 1.5,
    column_width INTEGER DEFAULT 800,
    layout TEXT DEFAULT 'single-column',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Saved Searches Table
```sql
CREATE TABLE saved_searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    query TEXT NOT NULL,
    filters TEXT, -- JSON string of filter criteria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Categories Table
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    icon TEXT,
    parent_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
```

#### Feed Tags Table
```sql
CREATE TABLE feed_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Feed Tag Junction Table
```sql
CREATE TABLE feed_tag_assignments (
    feed_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (feed_id, tag_id),
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES feed_tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_feed_tag_assignments_feed ON feed_tag_assignments(feed_id);
CREATE INDEX idx_feed_tag_assignments_tag ON feed_tag_assignments(tag_id);
```

#### Tags Table
```sql
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Article Tags Junction Table
```sql
CREATE TABLE article_tags (
    article_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);
```

#### Full-Text Search (FTS5 Virtual Table)
```sql
CREATE VIRTUAL TABLE articles_fts USING fts5(
    title,
    description,
    content,
    content=articles,
    content_rowid=id
);
```

### 3.6 Browser Compatibility

**SQLite in Browser Options:**

1. **sql.js (Recommended for Pure Client-Side)**
   - SQLite compiled to WebAssembly
   - Runs entirely in browser
   - No server required
   - File-based database stored in IndexedDB or Memory

2. **better-sqlite3 (For Node.js Backend)**
   - Requires Node.js server
   - Better performance
   - More features
   - Not pure client-side

**For this project (pure HTML/JS):**
- Use **sql.js** for client-side SQLite
- Store database in IndexedDB or as binary file
- Load database on app start
- Save database periodically

### 3.7 Performance Considerations

#### Optimization Strategies
- **Lazy Loading:** Load articles in batches (pagination)
- **Virtual Scrolling:** Render only visible articles
- **Debounced Search:** Delay search until user stops typing
- **Cached Queries:** Cache frequent queries
- **Indexed Queries:** Use database indexes for fast lookups
- **Background Updates:** Update feeds in Web Worker
- **Database Compression:** Periodically vacuum database

#### Memory Management
- **Article Limits:** Limit articles per feed (configurable)
- **Old Article Cleanup:** Auto-delete articles older than X days
- **Image Optimization:** Resize/compress images before storage
- **Database Size Limits:** Warn user when database exceeds threshold

---

## 4. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up project structure
- Implement SQLite database layer
- Create enhanced database schema (feeds, articles, categories, tags, bookmarks, saved articles, reading preferences)
- Build basic UI layout
- Implement feed CRUD operations
- Implement category and tag management

### Phase 2: RSS Integration & Feed Management (Week 2-3)
- Implement RSS/Atom feed parser
- Build feed fetching mechanism
- Add feed validation
- Implement intuitive feed management UI
- Feed categorization and tagging system
- Feed drag-and-drop organization
- Smart refresh scheduling system
- Error handling and retries

### Phase 3: Article Management & Search (Week 3-4)
- Article CRUD operations
- Article list view with multiple layouts
- Advanced filtering system
- Advanced search functionality (full-text, boolean operators, saved searches)
- Tag system for articles
- Article bookmarking and saving
- Bookmark collections
- Saved articles library

### Phase 4: Reading Experience & Offline (Week 4-5)
- Customizable reading view
- Reading preferences system (theme, font, layout, spacing)
- Multiple reading layouts (single column, two column, full-width, magazine)
- Theme system (light/dark/sepia/high contrast)
- Offline reading capability
- Article caching for offline access
- Offline collections management
- Sync management

### Phase 5: UI/UX Polish & Advanced Features (Week 5-6)
- Responsive design
- Loading states and skeleton loaders
- Notifications system
- Enhanced settings panel
- OPML import/export
- Statistics dashboard
- Backup/restore
- Performance optimization
- Keyboard shortcuts

---

## 5. Technical Specifications

### 5.1 RSS/Atom Parsing

**Supported Formats:**
- RSS 2.0
- Atom 1.0
- RSS 1.0 (RDF)

**Parsing Library:**
- Use native JavaScript DOMParser for XML parsing
- No external dependencies
- Custom RSS parser implementation

### 5.2 SQLite Integration

**Library Choice:** sql.js
- Pure JavaScript/WebAssembly
- No server required
- File-based database
- Full SQL support

**Database Storage:**
- Store database binary in IndexedDB
- Or download/upload as file
- Automatic backup on changes

### 5.3 Browser APIs Used

- **Fetch API:** For RSS feed fetching
- **DOMParser:** For XML/RSS parsing
- **IndexedDB:** For database storage (if using sql.js) and offline content caching
- **Service Worker:** For offline support and caching
- **Web Workers:** For background feed updates and processing
- **LocalStorage:** For application settings and reading preferences
- **Cache API:** For offline article and media caching
- **File System Access API:** For saving articles as files (optional, Chrome/Edge)
- **Clipboard API:** For copying article content and links

### 5.4 Security Considerations

- **CORS Handling:** Handle CORS errors gracefully
- **Content Sanitization:** Sanitize HTML content before display
- **XSS Prevention:** Escape user input
- **SQL Injection Prevention:** Use parameterized queries
- **Feed Validation:** Validate feed URLs and content

---

## 6. User Experience Flow

### 6.1 First-Time User

1. **Welcome Screen:**
   - Application introduction
   - Quick start guide
   - Sample feed suggestions

2. **Add First Feed:**
   - Simple URL input
   - Auto-detect feed format
   - Fetch and display feed info
   - Confirm and add

3. **View Articles:**
   - Auto-fetch articles from added feed
   - Display in article list
   - Click to read

### 6.2 Daily Usage

1. **Open Application:**
   - Load database
   - Check for updates
   - Display unread count

2. **Browse Articles:**
   - Filter by feed/category
   - Search for specific topics
   - Read articles
   - Mark as read/star

3. **Manage Feeds:**
   - Add new feeds
   - Update existing feeds
   - Organize by category
   - Remove unused feeds

---

## 7. Success Metrics

### 7.1 Performance Targets
- **Initial Load:** < 1 second
- **Feed Update:** < 5 seconds per feed
- **Article Search:** < 100ms
- **Database Size:** < 50MB for 10,000 articles

### 7.2 Functionality Targets
- **Feed Support:** 100+ feeds
- **Article Storage:** 10,000+ articles
- **Search Accuracy:** 100% relevant results
- **Uptime:** 99% (local application)

### 7.3 User Experience Targets
- **Ease of Use:** Add feed in < 30 seconds
- **Reading Experience:** Clean, distraction-free
- **Responsiveness:** All interactions < 100ms
- **Accessibility:** WCAG 2.1 AA compliance

---

## 8. Future Enhancements (Optional)

### 8.1 Advanced Features
- **AI Summarization:** Auto-summarize articles
- **Sentiment Analysis:** Analyze article sentiment
- **Related Articles:** ML-based article recommendations
- **Export to PDF:** Generate PDF from articles
- **Email Digest:** Send daily/weekly email summaries

### 8.2 Integration Features
- **Browser Extension:** Quick add feed from browser
- **Mobile App:** Native mobile application
- **Sync Across Devices:** Cloud sync (optional)
- **Social Sharing:** Share articles to social media

### 8.3 Content Features
- **Article Annotations:** Add notes and highlights to articles
- **Reading Lists:** Create custom reading lists (already implemented as bookmark collections)
- **Article Clipping:** Save article excerpts
- **Offline Reading:** Download articles for offline (already implemented)
- **Article Sharing:** Share articles to social media platforms
- **Export to E-reader:** Export articles in EPUB format

---

## 9. Development Guidelines

### 9.1 Code Style
- **JavaScript:** ES6+ syntax, no transpilation
- **Naming:** camelCase for variables/functions, PascalCase for classes
- **Comments:** JSDoc for functions, inline comments for complex logic
- **Formatting:** Consistent indentation (2 spaces)

### 9.2 File Organization
- **Modular Structure:** One class/functionality per file
- **Clear Separation:** UI, logic, and data layers separate
- **Reusable Components:** Extract common functionality

### 9.3 Error Handling
- **Try-Catch Blocks:** Wrap async operations
- **User-Friendly Messages:** Display clear error messages
- **Logging:** Console logging for debugging
- **Graceful Degradation:** Fallback for unsupported features

### 9.4 Testing Strategy
- **Manual Testing:** Test all features manually
- **Browser Testing:** Test in Chrome, Firefox, Safari, Edge
- **Performance Testing:** Monitor load times and memory usage
- **Edge Case Testing:** Test with invalid feeds, large datasets

---

## 10. Deployment & Distribution

### 10.1 Distribution Methods
- **Static Hosting:** Deploy to GitHub Pages, Netlify, Vercel
- **Local File:** Run from file:// protocol (limited)
- **Self-Hosted:** Serve from any web server

### 10.2 Browser Requirements
- **Modern Browsers:** Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **WebAssembly Support:** Required for sql.js
- **IndexedDB Support:** Required for database storage
- **Fetch API Support:** Required for RSS fetching

### 10.3 Installation
- **No Installation:** Pure web application
- **Bookmark:** Users can bookmark the application
- **PWA:** Optional Progressive Web App for app-like experience

---

## Conclusion

This project plan outlines a comprehensive RSS collector application built with pure HTML, JavaScript, and SQLite. The architecture is designed to be lightweight, privacy-focused, and fully functional without external dependencies or server requirements.

The modular design allows for incremental development and easy maintenance, while the SQLite database provides robust data storage and querying capabilities.

**Next Steps:**
1. Review and approve project plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterate based on feedback

---

**Document Version:** 2.0  
**Created:** December 2024  
**Last Updated:** December 2024  
**Status:** Enhanced Planning Complete - Ready for Implementation

---

## 11. New Features Summary

This version (2.0) includes the following major enhancements:

### 11.1 Intuitive Feed Management
- Drag-and-drop feed organization
- Bulk feed operations
- Feed preview before subscribing
- Visual status indicators
- Quick actions context menu
- Feed search and filtering

### 11.2 Feed Categorization and Tagging
- Multiple categories per feed
- Hierarchical category structure
- Feed tagging system
- Category colors and icons
- Smart categorization suggestions

### 11.3 Offline Reading Capability
- Automatic article caching
- Selective offline downloading
- Offline collections
- Offline reading mode
- Media caching
- Storage management

### 11.4 Advanced Filtering and Search
- Multi-criteria filtering
- Boolean search operators
- Saved searches
- Search history
- Search suggestions
- Filter presets

### 11.5 Customizable Reading Experience
- Multiple reading layouts
- Theme selection (light/dark/sepia/high contrast)
- Adjustable font size and family
- Customizable line height and column width
- Reading preferences persistence
- Responsive reading view

### 11.6 Smart Refreshing
- Custom update intervals per feed
- Adaptive refresh scheduling
- Priority-based updates
- Time-based scheduling
- Smart retry logic

### 11.7 Article Bookmarking and Saving
- Article bookmarks
- Bookmark collections
- Bookmark notes
- Article saving (HTML, text, PDF)
- Saved articles library
- Smart bookmarking rules
