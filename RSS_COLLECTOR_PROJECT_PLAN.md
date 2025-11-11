# Civilization Sphere - RSS Collector Project Plan

**Project Name:** Civilization Sphere  
**Version:** 1.0.0  
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

#### Feed Subscription
- **Add RSS Feed:** Users can add RSS feed URLs manually
- **Feed Validation:** Validate RSS/Atom feed format before adding
- **Feed Categories:** Organize feeds into custom categories (e.g., "News", "Technology", "Politics")
- **Feed Metadata:** Store feed title, description, language, last update time
- **Feed Status:** Track feed health (active, error, disabled)

#### Feed Discovery
- **OPML Import:** Import feed lists from OPML files
- **OPML Export:** Export feed subscriptions for backup/transfer
- **Feed Recommendations:** Suggest popular feeds by category (optional, local list)
- **Auto-Detection:** Detect RSS feeds from website URLs

### 1.2 Article Collection & Storage

#### Automatic Fetching
- **Scheduled Updates:** Configurable update intervals (hourly, daily, weekly)
- **Background Sync:** Fetch feeds in background without blocking UI
- **Incremental Updates:** Only fetch new articles since last update
- **Error Handling:** Retry failed feeds with exponential backoff
- **Rate Limiting:** Respect feed server rate limits

#### Article Processing
- **Content Extraction:** Extract title, description, content, author, date
- **Media Handling:** Download and store images locally (optional)
- **HTML Sanitization:** Clean HTML content for safe display
- **Duplicate Detection:** Prevent storing duplicate articles
- **Full-Text Indexing:** Enable fast search across all articles

### 1.3 Content Browsing & Reading

#### Article List View
- **Chronological Feed:** Display articles sorted by publication date
- **Feed Filtering:** Filter articles by specific feed or category
- **Search Functionality:** Full-text search across titles and content
- **Tag System:** Auto-generate or manually assign tags
- **Read/Unread Status:** Track reading progress
- **Starred Articles:** Mark important articles for later

#### Article Reading
- **Reading View:** Clean, distraction-free reading interface
- **Article Metadata:** Display source, date, author, tags
- **Related Articles:** Show articles from same feed or category
- **Navigation:** Previous/Next article navigation
- **Share Functionality:** Copy article link or export as text

### 1.4 Data Management

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

### 1.5 Settings & Configuration

#### Application Settings
- **Update Frequency:** Configure automatic update intervals
- **Storage Limits:** Set maximum articles per feed
- **Theme:** Light/dark mode toggle
- **Language:** UI language selection (if multi-language support)
- **Notifications:** Browser notifications for new articles (optional)

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
  - Expandable feed groups by category
  - Unread count badges
  - Feed status indicators (active/error)
  - Context menu (edit, delete, update now)
- **Tags Panel:**
  - List of all tags with article counts
  - Click to filter articles by tag
- **Search Panel:**
  - Recent searches
  - Saved search queries
- **Statistics Panel:**
  - Total articles count
  - Unread articles count
  - Feeds count
  - Storage usage

#### Main Content Area

**Feed Management View:**
- **Add Feed Form:**
  - URL input field
  - Category selector
  - Auto-fetch metadata button
  - Add button
- **Feed List Table:**
  - Feed name, category, last update, article count
  - Actions: Edit, Delete, Update Now, View Articles
- **OPML Import/Export:**
  - File picker for OPML import
  - Export button for OPML export

**Article List View:**
- **Filter Bar:**
  - Feed selector
  - Category selector
  - Date range picker
  - Tag filter
  - Read/Unread toggle
- **Article Cards:**
  - Feed name badge
  - Article title (link)
  - Publication date
  - Excerpt/preview
  - Tags
  - Read/Unread indicator
  - Star button
  - Actions menu
- **Pagination:**
  - Page numbers
  - Items per page selector
  - Total count display

**Article Reading View:**
- **Article Header:**
  - Title
  - Feed name and link
  - Publication date and author
  - Tags
  - Star/Unstar button
- **Article Content:**
  - Full article HTML content
  - Embedded images
  - Links (open in new tab)
- **Article Footer:**
  - Original article link
  - Previous/Next navigation
  - Share button
  - Mark as read/unread

**Settings View:**
- **General Settings:**
  - Update frequency selector
  - Storage limits
  - Theme selector
  - Language selector
- **Feed Settings:**
  - Per-feed configuration table
  - Bulk actions
- **Data Management:**
  - Database statistics
  - Backup database button
  - Restore database button
  - Clean old articles button

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

**Key Functions:**
```javascript
class FeedManager {
    async fetchFeed(url)
    async parseFeed(xmlContent)
    async validateFeed(feedData)
    async extractArticles(feedData)
    async updateFeed(feedId)
    async updateAllFeeds()
}
```

#### 3.3.3 Article Manager Module (`article-manager.js`)

**Responsibilities:**
- CRUD operations for articles
- Article search and filtering
- Tag management
- Read/unread status
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
    async markAsRead(articleId)
    async starArticle(articleId)
}
```

#### 3.3.4 UI Controller Module (`ui-controller.js`)

**Responsibilities:**
- DOM manipulation
- Event handling
- View rendering
- User interaction management
- State management

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
    category_id INTEGER,
    update_frequency INTEGER DEFAULT 3600, -- seconds
    last_update TIMESTAMP,
    last_successful_update TIMESTAMP,
    error_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, error, disabled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_feeds_category ON feeds(category_id);
CREATE INDEX idx_feeds_status ON feeds(status);
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE
);

CREATE INDEX idx_articles_feed ON articles(feed_id);
CREATE INDEX idx_articles_pub_date ON articles(pub_date DESC);
CREATE INDEX idx_articles_read ON articles(is_read);
CREATE INDEX idx_articles_starred ON articles(is_starred);
CREATE INDEX idx_articles_guid ON articles(guid);
```

#### Categories Table
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
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
- Create database schema
- Build basic UI layout
- Implement feed CRUD operations

### Phase 2: RSS Integration (Week 2-3)
- Implement RSS/Atom feed parser
- Build feed fetching mechanism
- Add feed validation
- Implement automatic updates
- Error handling and retries

### Phase 3: Article Management (Week 3-4)
- Article CRUD operations
- Article list view
- Article reading view
- Search functionality
- Tag system

### Phase 4: UI/UX Polish (Week 4-5)
- Theme system (light/dark)
- Responsive design
- Loading states
- Notifications
- Settings panel

### Phase 5: Advanced Features (Week 5-6)
- OPML import/export
- Full-text search
- Statistics dashboard
- Backup/restore
- Performance optimization

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
- **IndexedDB:** For database storage (if using sql.js)
- **Service Worker:** For offline support (optional)
- **Web Workers:** For background feed updates
- **LocalStorage:** For application settings

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
- **Article Annotations:** Add notes to articles
- **Reading Lists:** Create custom reading lists
- **Article Clipping:** Save article excerpts
- **Offline Reading:** Download articles for offline

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

**Document Version:** 1.0  
**Created:** December 2024  
**Status:** Planning Complete - Ready for Implementation
