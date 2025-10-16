/**
 * External API Services for Civilization Sphere
 * Provides integration with various external data sources
 */

class APIServiceBase {
    constructor(config = {}) {
        this.config = {
            timeout: 10000,
            retries: 3,
            cacheTimeout: 300000, // 5 minutes
            ...config
        };
        this.cache = new Map();
        this.rateLimits = new Map();
    }

    async makeRequest(url, options = {}) {
        const cacheKey = this.getCacheKey(url, options);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const requestOptions = {
            timeout: this.config.timeout,
            ...options
        };

        for (let attempt = 0; attempt < this.config.retries; attempt++) {
            try {
                const response = await fetch(url, requestOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                this.setCache(cacheKey, data);
                return data;
            } catch (error) {
                if (attempt === this.config.retries - 1) throw error;
                await this.delay(1000 * Math.pow(2, attempt)); // Exponential backoff
            }
        }
    }

    getCacheKey(url, options) {
        return `${url}:${JSON.stringify(options)}`;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    checkRateLimit(service) {
        const now = Date.now();
        const limit = this.rateLimits.get(service);
        if (limit && now - limit.lastRequest < limit.interval) {
            throw new Error(`Rate limit exceeded for ${service}`);
        }
        this.rateLimits.set(service, { lastRequest: now, interval: limit?.interval || 1000 });
    }
}

class NewsAPIService extends APIServiceBase {
    constructor(apiKey, config = {}) {
        super(config);
        this.apiKey = apiKey;
        this.baseUrl = 'https://newsapi.org/v2';
    }

    async getEverything(query, options = {}) {
        this.checkRateLimit('newsapi');
        
        const params = new URLSearchParams({
            q: query,
            apiKey: this.apiKey,
            language: 'en',
            pageSize: 100,
            sortBy: 'publishedAt',
            ...options
        });

        const url = `${this.baseUrl}/everything?${params}`;
        const data = await this.makeRequest(url);
        
        return this.normalizeArticles(data.articles || []);
    }

    async getTopHeadlines(category = 'general', country = 'us', options = {}) {
        this.checkRateLimit('newsapi');
        
        const params = new URLSearchParams({
            apiKey: this.apiKey,
            category,
            country,
            pageSize: 100,
            ...options
        });

        const url = `${this.baseUrl}/top-headlines?${params}`;
        const data = await this.makeRequest(url);
        
        return this.normalizeArticles(data.articles || []);
    }

    normalizeArticles(articles) {
        return articles.map(article => ({
            id: `newsapi_${article.url?.split('/').pop() || Date.now()}`,
            title: article.title,
            description: article.description || article.content || '',
            date: article.publishedAt,
            category: this.categorizeContent(article.title, article.description),
            region: this.extractRegion(article.title, article.description),
            country: article.source?.name || 'Unknown',
            lat: this.extractCoordinates(article.title, article.description)?.lat,
            lng: this.extractCoordinates(article.title, article.description)?.lng,
            importance: this.calculateImportance(article),
            sources: [article.url],
            participants: this.extractParticipants(article.title, article.description),
            impact: this.assessImpact(article),
            channel_name: 'NewsAPI',
            source: 'NewsAPI',
            url: article.url,
            tags: this.extractTags(article.title, article.description)
        }));
    }

    categorizeContent(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        
        if (text.includes('war') || text.includes('conflict') || text.includes('military')) {
            return 'Війни та конфлікти';
        }
        if (text.includes('election') || text.includes('government') || text.includes('political')) {
            return 'Політичні зміни';
        }
        if (text.includes('economy') || text.includes('economic') || text.includes('trade')) {
            return 'Економічні зміни';
        }
        if (text.includes('technology') || text.includes('tech') || text.includes('digital')) {
            return 'Технологічні зміни';
        }
        if (text.includes('crisis') || text.includes('emergency') || text.includes('disaster')) {
            return 'Глобальні кризи';
        }
        
        return 'Політичні зміни'; // Default category
    }

    extractRegion(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        
        if (text.includes('europe') || text.includes('eu') || text.includes('european')) {
            return 'Європа';
        }
        if (text.includes('asia') || text.includes('asian') || text.includes('china') || text.includes('japan')) {
            return 'Азія';
        }
        if (text.includes('middle east') || text.includes('syria') || text.includes('iran') || text.includes('israel')) {
            return 'Близький Схід';
        }
        if (text.includes('africa') || text.includes('african')) {
            return 'Африка';
        }
        if (text.includes('america') || text.includes('usa') || text.includes('united states')) {
            return 'Північна Америка';
        }
        if (text.includes('ukraine') || text.includes('russia') || text.includes('ukrainian') || text.includes('russian')) {
            return 'Ukraine';
        }
        
        return 'Глобально';
    }

    extractCoordinates(title, description) {
        // Simple coordinate extraction - could be enhanced with NLP
        const text = `${title} ${description}`;
        const latMatch = text.match(/(\d+\.?\d*)\s*[°]?\s*[NS]/i);
        const lngMatch = text.match(/(\d+\.?\d*)\s*[°]?\s*[EW]/i);
        
        if (latMatch && lngMatch) {
            return {
                lat: parseFloat(latMatch[1]),
                lng: parseFloat(lngMatch[1])
            };
        }
        
        return null;
    }

    calculateImportance(article) {
        let importance = 5; // Base importance
        
        // Increase importance based on source reputation
        const source = article.source?.name?.toLowerCase() || '';
        if (source.includes('bbc') || source.includes('reuters') || source.includes('ap')) {
            importance += 2;
        }
        
        // Increase importance based on content keywords
        const text = `${article.title} ${article.description}`.toLowerCase();
        if (text.includes('breaking') || text.includes('urgent') || text.includes('crisis')) {
            importance += 2;
        }
        if (text.includes('war') || text.includes('conflict') || text.includes('attack')) {
            importance += 1;
        }
        
        return Math.min(importance, 10);
    }

    extractParticipants(title, description) {
        const text = `${title} ${description}`;
        const participants = [];
        
        // Common geopolitical entities
        const entities = [
            'USA', 'United States', 'US', 'America',
            'Russia', 'Russian', 'Moscow',
            'China', 'Chinese', 'Beijing',
            'EU', 'European Union', 'Europe',
            'Ukraine', 'Ukrainian', 'Kyiv',
            'NATO', 'UN', 'United Nations'
        ];
        
        entities.forEach(entity => {
            if (text.toLowerCase().includes(entity.toLowerCase())) {
                participants.push(entity);
            }
        });
        
        return [...new Set(participants)];
    }

    assessImpact(article) {
        const text = `${article.title} ${article.description}`.toLowerCase();
        
        if (text.includes('global') || text.includes('worldwide') || text.includes('international')) {
            return 'Глобальний вплив';
        }
        if (text.includes('regional') || text.includes('continent')) {
            return 'Регіональний вплив';
        }
        if (text.includes('national') || text.includes('country')) {
            return 'Національний вплив';
        }
        
        return 'Локальний вплив';
    }

    extractTags(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        const tags = [];
        
        const keywords = [
            'geopolitics', 'politics', 'war', 'conflict', 'economy',
            'technology', 'crisis', 'election', 'government', 'military',
            'trade', 'diplomacy', 'security', 'energy', 'climate'
        ];
        
        keywords.forEach(keyword => {
            if (text.includes(keyword)) {
                tags.push(keyword);
            }
        });
        
        return tags;
    }
}

class HistoricalEventsAPIService extends APIServiceBase {
    constructor(config = {}) {
        super(config);
        this.baseUrl = 'https://api.onthisday.com';
    }

    async getEventsByDate(month, day) {
        const url = `${this.baseUrl}/events/${month}/${day}`;
        const data = await this.makeRequest(url);
        
        return this.normalizeHistoricalEvents(data.events || []);
    }

    async getEventsByYear(year) {
        const url = `${this.baseUrl}/events/${year}`;
        const data = await this.makeRequest(url);
        
        return this.normalizeHistoricalEvents(data.events || []);
    }

    normalizeHistoricalEvents(events) {
        return events.map(event => ({
            id: `historical_${event.year}_${event.text?.substring(0, 20).replace(/\s+/g, '_')}`,
            title: event.text,
            description: event.text,
            date: `${event.year}-01-01`,
            category: this.categorizeHistoricalEvent(event.text),
            region: this.extractHistoricalRegion(event.text),
            country: this.extractHistoricalCountry(event.text),
            lat: this.extractHistoricalCoordinates(event.text)?.lat,
            lng: this.extractHistoricalCoordinates(event.text)?.lng,
            importance: this.calculateHistoricalImportance(event),
            sources: [`https://onthisday.com/events/${event.year}`],
            participants: this.extractHistoricalParticipants(event.text),
            impact: this.assessHistoricalImpact(event),
            channel_name: 'Historical Events',
            source: 'Historical',
            url: `https://onthisday.com/events/${event.year}`,
            tags: this.extractHistoricalTags(event.text)
        }));
    }

    categorizeHistoricalEvent(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('war') || lowerText.includes('battle') || lowerText.includes('conflict')) {
            return 'Війни та конфлікти';
        }
        if (lowerText.includes('treaty') || lowerText.includes('agreement') || lowerText.includes('alliance')) {
            return 'Союзи та договори';
        }
        if (lowerText.includes('revolution') || lowerText.includes('independence') || lowerText.includes('republic')) {
            return 'Політичні зміни';
        }
        if (lowerText.includes('crisis') || lowerText.includes('pandemic') || lowerText.includes('disaster')) {
            return 'Глобальні кризи';
        }
        
        return 'Політичні зміни';
    }

    extractHistoricalRegion(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('europe') || lowerText.includes('european')) {
            return 'Європа';
        }
        if (lowerText.includes('asia') || lowerText.includes('asian')) {
            return 'Азія';
        }
        if (lowerText.includes('america') || lowerText.includes('american')) {
            return 'Північна Америка';
        }
        if (lowerText.includes('africa') || lowerText.includes('african')) {
            return 'Африка';
        }
        
        return 'Глобально';
    }

    extractHistoricalCountry(text) {
        // Simple country extraction - could be enhanced
        const countries = [
            'United States', 'USA', 'America',
            'Russia', 'Soviet Union', 'USSR',
            'China', 'Germany', 'France', 'Britain',
            'Japan', 'Italy', 'Spain', 'Canada'
        ];
        
        for (const country of countries) {
            if (text.toLowerCase().includes(country.toLowerCase())) {
                return country;
            }
        }
        
        return 'Unknown';
    }

    extractHistoricalCoordinates(text) {
        // Enhanced coordinate extraction for historical events
        // This would typically use a geocoding service
        return null;
    }

    calculateHistoricalImportance(event) {
        let importance = 5;
        
        // Increase importance for major historical events
        const text = event.text.toLowerCase();
        if (text.includes('world war') || text.includes('revolution') || text.includes('independence')) {
            importance += 3;
        }
        if (text.includes('treaty') || text.includes('agreement') || text.includes('alliance')) {
            importance += 2;
        }
        if (text.includes('crisis') || text.includes('pandemic') || text.includes('disaster')) {
            importance += 2;
        }
        
        return Math.min(importance, 10);
    }

    extractHistoricalParticipants(text) {
        const participants = [];
        const entities = [
            'United States', 'USA', 'America',
            'Russia', 'Soviet Union', 'USSR',
            'China', 'Germany', 'France', 'Britain',
            'Japan', 'Italy', 'Spain', 'Canada',
            'NATO', 'UN', 'United Nations'
        ];
        
        entities.forEach(entity => {
            if (text.toLowerCase().includes(entity.toLowerCase())) {
                participants.push(entity);
            }
        });
        
        return [...new Set(participants)];
    }

    assessHistoricalImpact(event) {
        const text = event.text.toLowerCase();
        
        if (text.includes('world') || text.includes('global') || text.includes('international')) {
            return 'Глобальний вплив';
        }
        if (text.includes('regional') || text.includes('continent')) {
            return 'Регіональний вплив';
        }
        
        return 'Національний вплив';
    }

    extractHistoricalTags(text) {
        const tags = [];
        const keywords = [
            'war', 'conflict', 'politics', 'revolution', 'independence',
            'treaty', 'agreement', 'crisis', 'pandemic', 'disaster',
            'military', 'government', 'economy', 'technology'
        ];
        
        keywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                tags.push(keyword);
            }
        });
        
        return tags;
    }
}

class GeopoliticalDataAPIService extends APIServiceBase {
    constructor(config = {}) {
        super(config);
        this.baseUrl = 'https://api.restcountries.com/v3.1';
    }

    async getCountryData(countryCode) {
        const url = `${this.baseUrl}/alpha/${countryCode}`;
        const data = await this.makeRequest(url);
        
        return this.normalizeCountryData(data[0]);
    }

    async getAllCountries() {
        const url = `${this.baseUrl}/all`;
        const data = await this.makeRequest(url);
        
        return data.map(country => this.normalizeCountryData(country));
    }

    normalizeCountryData(country) {
        return {
            id: `country_${country.cca2}`,
            name: country.name.common,
            officialName: country.name.official,
            region: country.region,
            subregion: country.subregion,
            capital: country.capital?.[0],
            population: country.population,
            area: country.area,
            lat: country.latlng?.[0],
            lng: country.latlng?.[1],
            currencies: Object.keys(country.currencies || {}),
            languages: Object.values(country.languages || {}),
            borders: country.borders || [],
            flag: country.flags?.png,
            coatOfArms: country.coatOfArms?.png
        };
    }
}

class APIManager {
    constructor() {
        this.services = new Map();
        this.config = {
            newsAPI: {
                apiKey: null,
                enabled: false
            },
            historicalEvents: {
                enabled: true
            },
            geopoliticalData: {
                enabled: true
            }
        };
    }

    registerService(name, service) {
        this.services.set(name, service);
    }

    getService(name) {
        return this.services.get(name);
    }

    async initializeServices(apiKeys = {}) {
        if (apiKeys.newsAPI) {
            this.config.newsAPI.apiKey = apiKeys.newsAPI;
            this.config.newsAPI.enabled = true;
            this.registerService('news', new NewsAPIService(apiKeys.newsAPI));
        }

        if (this.config.historicalEvents.enabled) {
            this.registerService('historical', new HistoricalEventsAPIService());
        }

        if (this.config.geopoliticalData.enabled) {
            this.registerService('geopolitical', new GeopoliticalDataAPIService());
        }
    }

    async fetchEventsFromAllSources(query = 'geopolitics') {
        const allEvents = [];
        
        // Fetch from NewsAPI if available
        if (this.config.newsAPI.enabled) {
            try {
                const newsService = this.getService('news');
                const newsEvents = await newsService.getEverything(query);
                allEvents.push(...newsEvents);
            } catch (error) {
                console.warn('Failed to fetch from NewsAPI:', error);
            }
        }

        // Fetch historical events
        if (this.config.historicalEvents.enabled) {
            try {
                const historicalService = this.getService('historical');
                const today = new Date();
                const historicalEvents = await historicalService.getEventsByDate(
                    today.getMonth() + 1, 
                    today.getDate()
                );
                allEvents.push(...historicalEvents);
            } catch (error) {
                console.warn('Failed to fetch historical events:', error);
            }
        }

        return allEvents;
    }

    clearCache() {
        this.services.forEach(service => {
            if (service.cache) {
                service.cache.clear();
            }
        });
    }
}

// Export for use in main app
window.APIManager = APIManager;
window.NewsAPIService = NewsAPIService;
window.HistoricalEventsAPIService = HistoricalEventsAPIService;
window.GeopoliticalDataAPIService = GeopoliticalDataAPIService;