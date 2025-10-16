/**
 * Error Handler and Fallback System for Civilization Sphere
 * Provides robust error handling and fallback mechanisms for API failures
 */

class ErrorHandler {
    constructor(config = {}) {
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            exponentialBackoff: true,
            fallbackEnabled: true,
            loggingEnabled: true,
            ...config
        };
        
        this.errorCounts = new Map();
        this.circuitBreakers = new Map();
        this.fallbackData = new Map();
        this.logs = [];
    }

    async executeWithRetry(operation, context = {}) {
        let lastError;
        
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                const result = await operation();
                this.resetErrorCount(context.service);
                return result;
            } catch (error) {
                lastError = error;
                this.incrementErrorCount(context.service);
                
                if (this.isCircuitOpen(context.service)) {
                    throw new Error(`Circuit breaker open for ${context.service}`);
                }
                
                if (attempt < this.config.maxRetries - 1) {
                    const delay = this.calculateRetryDelay(attempt);
                    await this.delay(delay);
                }
            }
        }
        
        this.logError(lastError, context);
        throw lastError;
    }

    async executeWithFallback(operation, fallbackOperation, context = {}) {
        try {
            return await this.executeWithRetry(operation, context);
        } catch (error) {
            this.logError(error, context);
            
            if (this.config.fallbackEnabled && fallbackOperation) {
                try {
                    const fallbackResult = await fallbackOperation();
                    this.logFallback(context.service, 'success');
                    return fallbackResult;
                } catch (fallbackError) {
                    this.logError(fallbackError, { ...context, isFallback: true });
                    throw new Error(`Both primary and fallback operations failed: ${error.message}`);
                }
            }
            
            throw error;
        }
    }

    async executeWithCaching(operation, cacheKey, cacheManager, context = {}) {
        try {
            // Try to get from cache first
            const cached = await cacheManager.get(cacheKey);
            if (cached !== null) {
                return cached;
            }
            
            // Execute operation and cache result
            const result = await this.executeWithRetry(operation, context);
            await cacheManager.set(cacheKey, result);
            return result;
        } catch (error) {
            // Try to get stale data from cache as fallback
            const staleData = await cacheManager.get(cacheKey, { allowStale: true });
            if (staleData !== null) {
                this.logFallback(context.service, 'stale_cache');
                return staleData;
            }
            
            throw error;
        }
    }

    // Circuit breaker implementation
    isCircuitOpen(service) {
        const breaker = this.circuitBreakers.get(service);
        if (!breaker) return false;
        
        const now = Date.now();
        if (now - breaker.lastFailureTime > breaker.timeout) {
            breaker.state = 'half-open';
            breaker.failureCount = 0;
        }
        
        return breaker.state === 'open';
    }

    openCircuit(service) {
        const breaker = this.circuitBreakers.get(service) || {
            state: 'closed',
            failureCount: 0,
            lastFailureTime: 0,
            timeout: 60000 // 1 minute
        };
        
        breaker.state = 'open';
        breaker.lastFailureTime = Date.now();
        this.circuitBreakers.set(service, breaker);
    }

    closeCircuit(service) {
        const breaker = this.circuitBreakers.get(service);
        if (breaker) {
            breaker.state = 'closed';
            breaker.failureCount = 0;
        }
    }

    // Error counting and tracking
    incrementErrorCount(service) {
        const count = this.errorCounts.get(service) || 0;
        this.errorCounts.set(service, count + 1);
        
        // Open circuit breaker if error threshold reached
        if (count >= 5) { // Threshold of 5 errors
            this.openCircuit(service);
        }
    }

    resetErrorCount(service) {
        this.errorCounts.set(service, 0);
        this.closeCircuit(service);
    }

    // Retry delay calculation
    calculateRetryDelay(attempt) {
        if (this.config.exponentialBackoff) {
            return this.config.retryDelay * Math.pow(2, attempt);
        }
        return this.config.retryDelay;
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Logging
    logError(error, context = {}) {
        if (!this.config.loggingEnabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: error.message,
            stack: error.stack,
            service: context.service || 'unknown',
            isFallback: context.isFallback || false,
            retryAttempt: context.retryAttempt || 0
        };
        
        this.logs.push(logEntry);
        
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
        
        console.error('API Error:', logEntry);
    }

    logFallback(service, type) {
        if (!this.config.loggingEnabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Fallback executed for ${service}: ${type}`,
            service,
            type
        };
        
        this.logs.push(logEntry);
        console.info('Fallback executed:', logEntry);
    }

    getErrorStats() {
        const stats = {};
        
        for (const [service, count] of this.errorCounts.entries()) {
            stats[service] = {
                errorCount: count,
                circuitState: this.circuitBreakers.get(service)?.state || 'closed'
            };
        }
        
        return stats;
    }

    getLogs(level = null, service = null) {
        let filteredLogs = this.logs;
        
        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }
        
        if (service) {
            filteredLogs = filteredLogs.filter(log => log.service === service);
        }
        
        return filteredLogs.slice(-100); // Return last 100 logs
    }
}

// Fallback data providers
class FallbackDataProvider {
    constructor() {
        this.providers = new Map();
    }

    registerProvider(service, provider) {
        this.providers.set(service, provider);
    }

    async getFallbackData(service, query = {}) {
        const provider = this.providers.get(service);
        if (!provider) {
            throw new Error(`No fallback provider for service: ${service}`);
        }
        
        return await provider(query);
    }
}

// Specific fallback providers
class NewsAPIFallbackProvider {
    async getFallbackData(query) {
        // Return cached or static news data
        const fallbackNews = [
            {
                title: "Geopolitical Analysis: Current Global Trends",
                description: "Analysis of current geopolitical developments and their implications.",
                date: new Date().toISOString(),
                category: "Політичні зміни",
                region: "Глобально",
                country: "Unknown",
                importance: 5,
                sources: ["Fallback Data"],
                participants: [],
                impact: "Локальний вплив",
                channel_name: "Fallback News",
                source: "Fallback",
                url: "",
                tags: ["geopolitics", "analysis"]
            }
        ];
        
        return fallbackNews;
    }
}

class HistoricalEventsFallbackProvider {
    async getFallbackData(query) {
        // Return static historical events
        const fallbackEvents = [
            {
                title: "Historical Geopolitical Event",
                description: "A significant historical event that shaped global politics.",
                date: "1900-01-01T00:00:00.000Z",
                category: "Політичні зміни",
                region: "Глобально",
                country: "Unknown",
                importance: 7,
                sources: ["Historical Records"],
                participants: [],
                impact: "Глобальний вплив",
                channel_name: "Historical Events",
                source: "Historical",
                url: "",
                tags: ["history", "geopolitics"]
            }
        ];
        
        return fallbackEvents;
    }
}

// API wrapper with error handling
class ResilientAPIClient {
    constructor(apiClient, errorHandler, fallbackProvider) {
        this.apiClient = apiClient;
        this.errorHandler = errorHandler;
        this.fallbackProvider = fallbackProvider;
    }

    async get(url, options = {}) {
        const operation = () => this.apiClient.get(url, options);
        const fallbackOperation = () => this.fallbackProvider.getFallbackData('api', { url });
        
        return await this.errorHandler.executeWithFallback(
            operation,
            fallbackOperation,
            { service: 'api', url }
        );
    }

    async post(url, data, options = {}) {
        const operation = () => this.apiClient.post(url, data, options);
        
        return await this.errorHandler.executeWithRetry(
            operation,
            { service: 'api', url, method: 'POST' }
        );
    }
}

// Health check system
class HealthChecker {
    constructor() {
        this.checks = new Map();
        this.status = new Map();
    }

    registerCheck(name, checkFunction, interval = 60000) {
        this.checks.set(name, {
            function: checkFunction,
            interval,
            lastCheck: 0,
            status: 'unknown'
        });
    }

    async runCheck(name) {
        const check = this.checks.get(name);
        if (!check) return false;
        
        try {
            const result = await check.function();
            check.status = result ? 'healthy' : 'unhealthy';
            check.lastCheck = Date.now();
            this.status.set(name, check.status);
            return result;
        } catch (error) {
            check.status = 'unhealthy';
            check.lastCheck = Date.now();
            this.status.set(name, 'unhealthy');
            return false;
        }
    }

    async runAllChecks() {
        const results = {};
        
        for (const [name, check] of this.checks.entries()) {
            const now = Date.now();
            if (now - check.lastCheck > check.interval) {
                results[name] = await this.runCheck(name);
            } else {
                results[name] = check.status === 'healthy';
            }
        }
        
        return results;
    }

    getStatus() {
        return Object.fromEntries(this.status.entries());
    }
}

// Export for use in main app
window.ErrorHandler = ErrorHandler;
window.FallbackDataProvider = FallbackDataProvider;
window.NewsAPIFallbackProvider = NewsAPIFallbackProvider;
window.HistoricalEventsFallbackProvider = HistoricalEventsFallbackProvider;
window.ResilientAPIClient = ResilientAPIClient;
window.HealthChecker = HealthChecker;