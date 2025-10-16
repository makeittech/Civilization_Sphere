/**
 * Cache Manager for Civilization Sphere
 * Provides intelligent caching for external API calls and data
 */

class CacheManager {
    constructor(config = {}) {
        this.config = {
            maxSize: 1000, // Maximum number of cached items
            defaultTTL: 300000, // 5 minutes default TTL
            cleanupInterval: 60000, // 1 minute cleanup interval
            enableLocalStorage: true,
            enableIndexedDB: false, // For future use
            ...config
        };
        
        this.memoryCache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            cleanups: 0
        };
        
        this.cleanupTimer = null;
        this.startCleanupTimer();
    }

    async get(key, options = {}) {
        const cacheKey = this.buildCacheKey(key, options);
        
        // Try memory cache first
        const memoryResult = this.getFromMemory(cacheKey);
        if (memoryResult !== null) {
            this.stats.hits++;
            return memoryResult;
        }
        
        // Try localStorage if enabled
        if (this.config.enableLocalStorage) {
            const localResult = this.getFromLocalStorage(cacheKey);
            if (localResult !== null) {
                // Store in memory cache for faster access
                this.setInMemory(cacheKey, localResult, options.ttl);
                this.stats.hits++;
                return localResult;
            }
        }
        
        this.stats.misses++;
        return null;
    }

    async set(key, value, options = {}) {
        const cacheKey = this.buildCacheKey(key, options);
        const ttl = options.ttl || this.config.defaultTTL;
        const timestamp = Date.now();
        
        const cacheItem = {
            value,
            timestamp,
            ttl,
            expiresAt: timestamp + ttl,
            accessCount: 0,
            lastAccessed: timestamp
        };
        
        // Store in memory cache
        this.setInMemory(cacheKey, cacheItem, ttl);
        
        // Store in localStorage if enabled
        if (this.config.enableLocalStorage) {
            this.setInLocalStorage(cacheKey, cacheItem);
        }
        
        this.stats.sets++;
        
        // Cleanup if cache is too large
        if (this.memoryCache.size > this.config.maxSize) {
            this.cleanup();
        }
    }

    async delete(key, options = {}) {
        const cacheKey = this.buildCacheKey(key, options);
        
        this.memoryCache.delete(cacheKey);
        
        if (this.config.enableLocalStorage) {
            this.deleteFromLocalStorage(cacheKey);
        }
        
        this.stats.deletes++;
    }

    async clear() {
        this.memoryCache.clear();
        
        if (this.config.enableLocalStorage) {
            this.clearLocalStorage();
        }
        
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            cleanups: 0
        };
    }

    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;
        
        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            memorySize: this.memoryCache.size,
            totalRequests: total
        };
    }

    // Memory cache methods
    getFromMemory(key) {
        const item = this.memoryCache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }
        
        item.accessCount++;
        item.lastAccessed = Date.now();
        return item.value;
    }

    setInMemory(key, value, ttl) {
        const timestamp = Date.now();
        this.memoryCache.set(key, {
            value,
            timestamp,
            ttl,
            expiresAt: timestamp + ttl,
            accessCount: 0,
            lastAccessed: timestamp
        });
    }

    // LocalStorage methods
    getFromLocalStorage(key) {
        try {
            const item = localStorage.getItem(`cs_cache_${key}`);
            if (!item) return null;
            
            const parsed = JSON.parse(item);
            if (Date.now() > parsed.expiresAt) {
                localStorage.removeItem(`cs_cache_${key}`);
                return null;
            }
            
            return parsed.value;
        } catch (error) {
            console.warn('Failed to get from localStorage:', error);
            return null;
        }
    }

    setInLocalStorage(key, cacheItem) {
        try {
            localStorage.setItem(`cs_cache_${key}`, JSON.stringify(cacheItem));
        } catch (error) {
            console.warn('Failed to set in localStorage:', error);
            // If localStorage is full, try to clean up old items
            this.cleanupLocalStorage();
        }
    }

    deleteFromLocalStorage(key) {
        try {
            localStorage.removeItem(`cs_cache_${key}`);
        } catch (error) {
            console.warn('Failed to delete from localStorage:', error);
        }
    }

    clearLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cs_cache_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }

    cleanupLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(key => key.startsWith('cs_cache_'));
            
            // Remove oldest items if we have too many
            if (cacheKeys.length > this.config.maxSize) {
                const items = cacheKeys.map(key => {
                    const item = localStorage.getItem(key);
                    const parsed = JSON.parse(item);
                    return { key, timestamp: parsed.timestamp };
                });
                
                items.sort((a, b) => a.timestamp - b.timestamp);
                
                const toRemove = items.slice(0, cacheKeys.length - this.config.maxSize);
                toRemove.forEach(item => localStorage.removeItem(item.key));
            }
        } catch (error) {
            console.warn('Failed to cleanup localStorage:', error);
        }
    }

    // Utility methods
    buildCacheKey(key, options = {}) {
        const prefix = options.prefix || 'default';
        const version = options.version || '1.0';
        return `${prefix}:${version}:${key}`;
    }

    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }

    stopCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }

    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        // Clean memory cache
        for (const [key, item] of this.memoryCache.entries()) {
            if (now > item.expiresAt) {
                this.memoryCache.delete(key);
                cleaned++;
            }
        }
        
        // Clean localStorage
        if (this.config.enableLocalStorage) {
            this.cleanupLocalStorage();
        }
        
        this.stats.cleanups++;
        
        if (cleaned > 0) {
            console.log(`Cache cleanup: removed ${cleaned} expired items`);
        }
    }

    // Cache warming methods
    async warmCache(keys, fetcher, options = {}) {
        const results = {};
        const uncachedKeys = [];
        
        // Check which keys are not cached
        for (const key of keys) {
            const cached = await this.get(key, options);
            if (cached !== null) {
                results[key] = cached;
            } else {
                uncachedKeys.push(key);
            }
        }
        
        // Fetch uncached keys
        if (uncachedKeys.length > 0) {
            const fetched = await fetcher(uncachedKeys);
            
            // Cache the fetched results
            for (const key of uncachedKeys) {
                if (fetched[key] !== undefined) {
                    await this.set(key, fetched[key], options);
                    results[key] = fetched[key];
                }
            }
        }
        
        return results;
    }

    // Cache invalidation methods
    async invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        let invalidated = 0;
        
        // Invalidate memory cache
        for (const key of this.memoryCache.keys()) {
            if (regex.test(key)) {
                this.memoryCache.delete(key);
                invalidated++;
            }
        }
        
        // Invalidate localStorage
        if (this.config.enableLocalStorage) {
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(key => key.startsWith('cs_cache_'));
            
            for (const key of cacheKeys) {
                const cacheKey = key.replace('cs_cache_', '');
                if (regex.test(cacheKey)) {
                    localStorage.removeItem(key);
                    invalidated++;
                }
            }
        }
        
        return invalidated;
    }

    // Cache analytics
    getCacheAnalytics() {
        const memoryItems = Array.from(this.memoryCache.values());
        const now = Date.now();
        
        const analytics = {
            totalItems: memoryItems.length,
            expiredItems: memoryItems.filter(item => now > item.expiresAt).length,
            averageAccessCount: memoryItems.reduce((sum, item) => sum + item.accessCount, 0) / memoryItems.length || 0,
            oldestItem: Math.min(...memoryItems.map(item => item.timestamp)),
            newestItem: Math.max(...memoryItems.map(item => item.timestamp)),
            memoryUsage: this.estimateMemoryUsage(),
            ...this.getStats()
        };
        
        return analytics;
    }

    estimateMemoryUsage() {
        let totalSize = 0;
        
        for (const [key, item] of this.memoryCache.entries()) {
            totalSize += key.length * 2; // Unicode characters
            totalSize += JSON.stringify(item).length * 2;
        }
        
        return {
            bytes: totalSize,
            kb: Math.round(totalSize / 1024 * 100) / 100,
            mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
        };
    }

    // Cache preloading
    async preloadCache(preloadConfig) {
        const { sources, ttl = this.config.defaultTTL } = preloadConfig;
        const results = {};
        
        for (const source of sources) {
            try {
                const data = await source.fetcher();
                const key = source.key;
                
                await this.set(key, data, { ttl });
                results[key] = { success: true, data };
            } catch (error) {
                results[source.key] = { success: false, error: error.message };
            }
        }
        
        return results;
    }
}

// Cache strategies
class CacheStrategy {
    static LRU(maxSize = 100) {
        return {
            evict: (cache) => {
                const entries = Array.from(cache.entries());
                entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
                return entries.slice(0, Math.floor(maxSize * 0.2)).map(([key]) => key);
            }
        };
    }
    
    static LFU(maxSize = 100) {
        return {
            evict: (cache) => {
                const entries = Array.from(cache.entries());
                entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
                return entries.slice(0, Math.floor(maxSize * 0.2)).map(([key]) => key);
            }
        };
    }
    
    static TTL() {
        return {
            evict: (cache) => {
                const now = Date.now();
                const expired = [];
                
                for (const [key, item] of cache.entries()) {
                    if (now > item.expiresAt) {
                        expired.push(key);
                    }
                }
                
                return expired;
            }
        };
    }
}

// Export for use in main app
window.CacheManager = CacheManager;
window.CacheStrategy = CacheStrategy;