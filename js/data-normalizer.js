/**
 * Data Normalization Layer for Civilization Sphere
 * Standardizes external API responses into consistent event format
 */

class DataNormalizer {
    constructor() {
        this.standardFields = [
            'id', 'title', 'description', 'date', 'category', 'region', 'country',
            'lat', 'lng', 'importance', 'sources', 'participants', 'impact',
            'channel_name', 'source', 'url', 'tags'
        ];
        
        this.categoryMapping = {
            'war': 'Війни та конфлікти',
            'conflict': 'Війни та конфлікти',
            'military': 'Війни та конфлікти',
            'battle': 'Війни та конфлікти',
            'politics': 'Політичні зміни',
            'political': 'Політичні зміни',
            'election': 'Політичні зміни',
            'government': 'Політичні зміни',
            'economy': 'Економічні зміни',
            'economic': 'Економічні зміни',
            'trade': 'Економічні зміни',
            'technology': 'Технологічні зміни',
            'tech': 'Технологічні зміни',
            'digital': 'Технологічні зміни',
            'crisis': 'Глобальні кризи',
            'emergency': 'Глобальні кризи',
            'disaster': 'Глобальні кризи',
            'pandemic': 'Глобальні кризи',
            'treaty': 'Союзи та договори',
            'agreement': 'Союзи та договори',
            'alliance': 'Союзи та договори',
            'terrorism': 'Тероризм',
            'terrorist': 'Тероризм'
        };

        this.regionMapping = {
            'europe': 'Європа',
            'european': 'Європа',
            'eu': 'Європа',
            'asia': 'Азія',
            'asian': 'Азія',
            'middle east': 'Близький Схід',
            'africa': 'Африка',
            'african': 'Африка',
            'america': 'Північна Америка',
            'american': 'Північна Америка',
            'usa': 'Північна Америка',
            'united states': 'Північна Америка',
            'ukraine': 'Ukraine',
            'ukrainian': 'Ukraine',
            'russia': 'Ukraine',
            'russian': 'Ukraine'
        };
    }

    normalizeEvent(rawEvent, source = 'unknown') {
        const normalized = {
            id: this.generateId(rawEvent, source),
            title: this.normalizeTitle(rawEvent),
            description: this.normalizeDescription(rawEvent),
            date: this.normalizeDate(rawEvent),
            category: this.normalizeCategory(rawEvent),
            region: this.normalizeRegion(rawEvent),
            country: this.normalizeCountry(rawEvent),
            lat: this.normalizeLatitude(rawEvent),
            lng: this.normalizeLongitude(rawEvent),
            importance: this.normalizeImportance(rawEvent),
            sources: this.normalizeSources(rawEvent),
            participants: this.normalizeParticipants(rawEvent),
            impact: this.normalizeImpact(rawEvent),
            channel_name: this.normalizeChannelName(rawEvent, source),
            source: source,
            url: this.normalizeUrl(rawEvent),
            tags: this.normalizeTags(rawEvent)
        };

        return this.validateAndClean(normalized);
    }

    generateId(rawEvent, source) {
        // Try to extract ID from various fields
        if (rawEvent.id) return `${source}_${rawEvent.id}`;
        if (rawEvent.url) return `${source}_${rawEvent.url.split('/').pop()}`;
        if (rawEvent.title) return `${source}_${this.hashString(rawEvent.title)}`;
        
        return `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    normalizeTitle(rawEvent) {
        const title = rawEvent.title || rawEvent.headline || rawEvent.name || '';
        return this.cleanText(title);
    }

    normalizeDescription(rawEvent) {
        const description = rawEvent.description || rawEvent.content || rawEvent.summary || rawEvent.text || '';
        return this.cleanText(description);
    }

    normalizeDate(rawEvent) {
        const dateFields = ['date', 'publishedAt', 'created_at', 'timestamp', 'time'];
        
        for (const field of dateFields) {
            if (rawEvent[field]) {
                const date = new Date(rawEvent[field]);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }
        }
        
        return new Date().toISOString();
    }

    normalizeCategory(rawEvent) {
        const text = `${rawEvent.title || ''} ${rawEvent.description || ''}`.toLowerCase();
        
        // Check for exact matches first
        for (const [keyword, category] of Object.entries(this.categoryMapping)) {
            if (text.includes(keyword)) {
                return category;
            }
        }
        
        // Default category based on source
        if (rawEvent.source === 'NewsAPI') return 'Політичні зміни';
        if (rawEvent.source === 'Historical') return 'Політичні зміни';
        
        return 'Політичні зміни';
    }

    normalizeRegion(rawEvent) {
        const text = `${rawEvent.title || ''} ${rawEvent.description || ''}`.toLowerCase();
        
        // Check for exact matches
        for (const [keyword, region] of Object.entries(this.regionMapping)) {
            if (text.includes(keyword)) {
                return region;
            }
        }
        
        // Try to extract from location fields
        if (rawEvent.region) return this.mapRegion(rawEvent.region);
        if (rawEvent.country) return this.mapCountryToRegion(rawEvent.country);
        if (rawEvent.location) return this.mapLocationToRegion(rawEvent.location);
        
        return 'Глобально';
    }

    normalizeCountry(rawEvent) {
        if (rawEvent.country) return rawEvent.country;
        if (rawEvent.source?.name) return rawEvent.source.name;
        if (rawEvent.location) return this.extractCountryFromLocation(rawEvent.location);
        
        return 'Unknown';
    }

    normalizeLatitude(rawEvent) {
        if (rawEvent.lat !== undefined) return parseFloat(rawEvent.lat);
        if (rawEvent.latitude !== undefined) return parseFloat(rawEvent.latitude);
        if (rawEvent.coordinates?.lat !== undefined) return parseFloat(rawEvent.coordinates.lat);
        if (rawEvent.location?.lat !== undefined) return parseFloat(rawEvent.location.lat);
        
        return this.extractCoordinates(rawEvent).lat;
    }

    normalizeLongitude(rawEvent) {
        if (rawEvent.lng !== undefined) return parseFloat(rawEvent.lng);
        if (rawEvent.longitude !== undefined) return parseFloat(rawEvent.longitude);
        if (rawEvent.coordinates?.lng !== undefined) return parseFloat(rawEvent.coordinates.lng);
        if (rawEvent.location?.lng !== undefined) return parseFloat(rawEvent.location.lng);
        
        return this.extractCoordinates(rawEvent).lng;
    }

    normalizeImportance(rawEvent) {
        if (rawEvent.importance !== undefined) return Math.max(1, Math.min(10, parseInt(rawEvent.importance)));
        if (rawEvent.priority !== undefined) return Math.max(1, Math.min(10, parseInt(rawEvent.priority)));
        
        // Calculate based on content analysis
        return this.calculateImportance(rawEvent);
    }

    normalizeSources(rawEvent) {
        const sources = [];
        
        if (rawEvent.url) sources.push(rawEvent.url);
        if (rawEvent.source_url) sources.push(rawEvent.source_url);
        if (rawEvent.link) sources.push(rawEvent.link);
        if (rawEvent.sources && Array.isArray(rawEvent.sources)) {
            sources.push(...rawEvent.sources);
        }
        
        return [...new Set(sources.filter(Boolean))];
    }

    normalizeParticipants(rawEvent) {
        if (rawEvent.participants && Array.isArray(rawEvent.participants)) {
            return rawEvent.participants;
        }
        
        // Extract participants from text
        return this.extractParticipantsFromText(rawEvent);
    }

    normalizeImpact(rawEvent) {
        if (rawEvent.impact) return rawEvent.impact;
        
        const text = `${rawEvent.title || ''} ${rawEvent.description || ''}`.toLowerCase();
        
        if (text.includes('global') || text.includes('worldwide')) {
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

    normalizeChannelName(rawEvent, source) {
        if (rawEvent.channel_name) return rawEvent.channel_name;
        if (rawEvent.channel) return rawEvent.channel;
        if (rawEvent.source?.name) return rawEvent.source.name;
        
        return this.mapSourceToChannel(source);
    }

    normalizeUrl(rawEvent) {
        return rawEvent.url || rawEvent.source_url || rawEvent.link || '';
    }

    normalizeTags(rawEvent) {
        if (rawEvent.tags && Array.isArray(rawEvent.tags)) {
            return rawEvent.tags;
        }
        
        return this.extractTagsFromText(rawEvent);
    }

    // Helper methods
    cleanText(text) {
        if (!text) return '';
        return text.toString().trim().replace(/\s+/g, ' ');
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    mapRegion(region) {
        const lowerRegion = region.toLowerCase();
        for (const [keyword, mappedRegion] of Object.entries(this.regionMapping)) {
            if (lowerRegion.includes(keyword)) {
                return mappedRegion;
            }
        }
        return region;
    }

    mapCountryToRegion(country) {
        const countryRegionMap = {
            'USA': 'Північна Америка',
            'United States': 'Північна Америка',
            'Russia': 'Ukraine',
            'China': 'Азія',
            'Germany': 'Європа',
            'France': 'Європа',
            'UK': 'Європа',
            'United Kingdom': 'Європа',
            'Japan': 'Азія',
            'India': 'Азія',
            'Brazil': 'Латинська Америка',
            'Canada': 'Північна Америка',
            'Australia': 'Океанія'
        };
        
        return countryRegionMap[country] || 'Глобально';
    }

    mapLocationToRegion(location) {
        if (typeof location === 'string') {
            return this.mapRegion(location);
        }
        if (location.region) return this.mapRegion(location.region);
        if (location.country) return this.mapCountryToRegion(location.country);
        
        return 'Глобально';
    }

    extractCountryFromLocation(location) {
        if (typeof location === 'string') {
            // Simple country extraction - could be enhanced with NLP
            const countries = ['USA', 'United States', 'Russia', 'China', 'Germany', 'France', 'UK', 'Japan'];
            for (const country of countries) {
                if (location.toLowerCase().includes(country.toLowerCase())) {
                    return country;
                }
            }
        }
        return location.country || 'Unknown';
    }

    extractCoordinates(rawEvent) {
        const text = `${rawEvent.title || ''} ${rawEvent.description || ''}`;
        
        // Simple coordinate extraction
        const latMatch = text.match(/(\d+\.?\d*)\s*[°]?\s*[NS]/i);
        const lngMatch = text.match(/(\d+\.?\d*)\s*[°]?\s*[EW]/i);
        
        if (latMatch && lngMatch) {
            return {
                lat: parseFloat(latMatch[1]),
                lng: parseFloat(lngMatch[1])
            };
        }
        
        return { lat: null, lng: null };
    }

    calculateImportance(rawEvent) {
        let importance = 5; // Base importance
        
        const text = `${rawEvent.title || ''} ${rawEvent.description || ''}`.toLowerCase();
        
        // Increase importance based on keywords
        if (text.includes('breaking') || text.includes('urgent') || text.includes('crisis')) {
            importance += 2;
        }
        if (text.includes('war') || text.includes('conflict') || text.includes('attack')) {
            importance += 1;
        }
        if (text.includes('global') || text.includes('worldwide')) {
            importance += 1;
        }
        
        // Increase importance based on source reputation
        const source = rawEvent.source?.name?.toLowerCase() || '';
        if (source.includes('bbc') || source.includes('reuters') || source.includes('ap')) {
            importance += 1;
        }
        
        return Math.max(1, Math.min(10, importance));
    }

    extractParticipantsFromText(rawEvent) {
        const text = `${rawEvent.title || ''} ${rawEvent.description || ''}`;
        const participants = [];
        
        const entities = [
            'USA', 'United States', 'US', 'America',
            'Russia', 'Russian', 'Moscow',
            'China', 'Chinese', 'Beijing',
            'EU', 'European Union', 'Europe',
            'Ukraine', 'Ukrainian', 'Kyiv',
            'NATO', 'UN', 'United Nations',
            'Germany', 'France', 'UK', 'Japan'
        ];
        
        entities.forEach(entity => {
            if (text.toLowerCase().includes(entity.toLowerCase())) {
                participants.push(entity);
            }
        });
        
        return [...new Set(participants)];
    }

    mapSourceToChannel(source) {
        const sourceChannelMap = {
            'NewsAPI': 'NewsAPI',
            'Historical': 'Historical Events',
            'YouTube': 'YouTube',
            'RSS': 'RSS Feed'
        };
        
        return sourceChannelMap[source] || source;
    }

    extractTagsFromText(rawEvent) {
        const text = `${rawEvent.title || ''} ${rawEvent.description || ''}`.toLowerCase();
        const tags = [];
        
        const keywords = [
            'geopolitics', 'politics', 'war', 'conflict', 'economy',
            'technology', 'crisis', 'election', 'government', 'military',
            'trade', 'diplomacy', 'security', 'energy', 'climate',
            'revolution', 'independence', 'treaty', 'alliance'
        ];
        
        keywords.forEach(keyword => {
            if (text.includes(keyword)) {
                tags.push(keyword);
            }
        });
        
        return [...new Set(tags)];
    }

    validateAndClean(normalizedEvent) {
        // Ensure all required fields are present
        for (const field of this.standardFields) {
            if (normalizedEvent[field] === undefined) {
                normalizedEvent[field] = this.getDefaultValue(field);
            }
        }
        
        // Validate data types and ranges
        if (typeof normalizedEvent.importance !== 'number' || 
            normalizedEvent.importance < 1 || normalizedEvent.importance > 10) {
            normalizedEvent.importance = 5;
        }
        
        if (normalizedEvent.lat !== null && (isNaN(normalizedEvent.lat) || 
            normalizedEvent.lat < -90 || normalizedEvent.lat > 90)) {
            normalizedEvent.lat = null;
        }
        
        if (normalizedEvent.lng !== null && (isNaN(normalizedEvent.lng) || 
            normalizedEvent.lng < -180 || normalizedEvent.lng > 180)) {
            normalizedEvent.lng = null;
        }
        
        return normalizedEvent;
    }

    getDefaultValue(field) {
        const defaults = {
            id: '',
            title: 'Untitled Event',
            description: '',
            date: new Date().toISOString(),
            category: 'Політичні зміни',
            region: 'Глобально',
            country: 'Unknown',
            lat: null,
            lng: null,
            importance: 5,
            sources: [],
            participants: [],
            impact: 'Локальний вплив',
            channel_name: 'Unknown',
            source: 'Unknown',
            url: '',
            tags: []
        };
        
        return defaults[field] || '';
    }

    // Batch normalization
    normalizeEvents(rawEvents, source = 'unknown') {
        if (!Array.isArray(rawEvents)) {
            return [this.normalizeEvent(rawEvents, source)];
        }
        
        return rawEvents.map(event => this.normalizeEvent(event, source));
    }

    // Deduplication
    deduplicateEvents(events) {
        const seen = new Set();
        const unique = [];
        
        for (const event of events) {
            const key = `${event.title}_${event.date}_${event.lat}_${event.lng}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(event);
            }
        }
        
        return unique;
    }
}

// Export for use in main app
window.DataNormalizer = DataNormalizer;