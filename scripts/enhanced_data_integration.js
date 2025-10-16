#!/usr/bin/env node

// Enhanced Data Integration System for Civilization Sphere
// Prioritizes data quality and source credibility over AI features

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const DATA_DIR = path.join(WORKSPACE_DIR, 'data');
const EVENTS_JSON_PATH = path.join(DATA_DIR, 'events.json');
const GOVERNANCE_JSON_PATH = path.join(DATA_DIR, 'data_governance.json');
const QUALITY_REPORT_PATH = path.join(DATA_DIR, 'quality_report.json');

class EnhancedDataIntegration {
    constructor() {
        this.governance = this.loadGovernance();
        this.events = this.loadEvents();
        this.qualityThresholds = this.governance.qualityThresholds;
        this.sourceCredibility = this.governance.sourceCredibility;
    }

    loadGovernance() {
        try {
            return JSON.parse(fs.readFileSync(GOVERNANCE_JSON_PATH, 'utf8'));
        } catch (error) {
            console.error('Error loading governance data:', error.message);
            return this.getDefaultGovernance();
        }
    }

    loadEvents() {
        try {
            const raw = fs.readFileSync(EVENTS_JSON_PATH, 'utf8');
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : (parsed.events || []);
        } catch (error) {
            console.error('Error loading events data:', error.message);
            return [];
        }
    }

    getDefaultGovernance() {
        return {
            qualityThresholds: {
                minimumConfidence: 0.7,
                minimumCompleteness: 0.85,
                maximumAge: 30,
                requiredFields: ['title', 'date', 'location', 'category', 'source_url', 'channel_name']
            },
            sourceCredibility: {
                tier1: { sources: [] },
                tier2: { sources: [] },
                tier3: { sources: [] }
            }
        };
    }

    // Enhanced YouTube API integration with quality focus
    async fetchHighQualityYouTubeData(channelId, maxResults = 20) {
        const YT_API_KEY = process.env.YT_API_KEY || process.env.YOUTUBE_API_KEY;
        
        if (!YT_API_KEY) {
            throw new Error('YouTube API key not provided');
        }

        try {
            // Fetch videos with enhanced metadata
            const videosResponse = await this.youtubeApi('search', {
                part: 'snippet',
                channelId: channelId,
                type: 'video',
                order: 'date',
                maxResults: String(maxResults)
            });

            const videos = videosResponse.items || [];
            
            // Enrich with detailed video information
            const enrichedVideos = await this.enrichVideoData(videos, YT_API_KEY);
            
            // Filter for high-quality content
            const highQualityVideos = enrichedVideos.filter(video => 
                this.isHighQualityVideo(video)
            );

            return highQualityVideos;
        } catch (error) {
            console.error('Error fetching YouTube data:', error.message);
            return [];
        }
    }

    async youtubeApi(endpoint, params) {
        const YT_API_KEY = process.env.YT_API_KEY || process.env.YOUTUBE_API_KEY;
        const q = new URLSearchParams({ key: YT_API_KEY, ...params });
        const url = `https://www.googleapis.com/youtube/v3/${endpoint}?${q.toString()}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`YouTube API ${endpoint} failed: ${response.status} ${response.statusText} - ${text}`);
        }
        
        return response.json();
    }

    async enrichVideoData(videos, apiKey) {
        const videoIds = videos.map(v => v.id.videoId);
        const batches = [];
        
        // Process in batches of 50 (API limit)
        for (let i = 0; i < videoIds.length; i += 50) {
            batches.push(videoIds.slice(i, i + 50));
        }

        const enrichedVideos = [];
        
        for (const batch of batches) {
            try {
                const details = await this.youtubeApi('videos', {
                    part: 'snippet,statistics,contentDetails,recordingDetails',
                    id: batch.join(','),
                    maxResults: '50'
                });

                for (const video of videos) {
                    const detail = details.items?.find(d => d.id === video.id.videoId);
                    if (detail) {
                        enrichedVideos.push({
                            ...video,
                            ...detail,
                            // Add quality indicators
                            qualityScore: this.calculateVideoQualityScore(detail),
                            hasTranscript: this.checkTranscriptAvailability(detail),
                            engagementScore: this.calculateEngagementScore(detail.statistics),
                            duration: this.parseDuration(detail.contentDetails?.duration)
                        });
                    }
                }
            } catch (error) {
                console.error('Error enriching video batch:', error.message);
            }
        }

        return enrichedVideos;
    }

    isHighQualityVideo(video) {
        const qualityScore = video.qualityScore || 0;
        const hasTranscript = video.hasTranscript || false;
        const engagementScore = video.engagementScore || 0;
        const duration = video.duration || 0;

        // Quality criteria
        const hasGoodTitle = video.snippet?.title && video.snippet.title.length > 10;
        const hasDescription = video.snippet?.description && video.snippet.description.length > 50;
        const hasReasonableDuration = duration > 60 && duration < 3600; // 1 min to 1 hour
        const hasGoodEngagement = engagementScore > 0.1;
        const hasHighQualityScore = qualityScore > 0.6;

        return hasGoodTitle && hasDescription && hasReasonableDuration && 
               (hasGoodEngagement || hasHighQualityScore || hasTranscript);
    }

    calculateVideoQualityScore(videoDetail) {
        let score = 0.5; // Base score

        // Title quality
        if (videoDetail.snippet?.title) {
            const title = videoDetail.snippet.title;
            if (title.length > 20) score += 0.1;
            if (title.length > 50) score += 0.1;
            if (!title.includes('...') && !title.includes('...')) score += 0.1;
        }

        // Description quality
        if (videoDetail.snippet?.description) {
            const desc = videoDetail.snippet.description;
            if (desc.length > 100) score += 0.1;
            if (desc.length > 500) score += 0.1;
            if (desc.includes('http') || desc.includes('www')) score += 0.05; // Has links
        }

        // Thumbnail quality
        if (videoDetail.snippet?.thumbnails?.high) score += 0.05;

        // Channel verification
        if (videoDetail.snippet?.channelTitle) {
            const channelTier = this.findSourceTier(videoDetail.snippet.channelTitle);
            if (channelTier) {
                score += (channelTier.reliabilityScore / 100) * 0.2;
            }
        }

        return Math.min(1, score);
    }

    calculateEngagementScore(statistics) {
        if (!statistics) return 0;

        const views = parseInt(statistics.viewCount) || 0;
        const likes = parseInt(statistics.likeCount) || 0;
        const comments = parseInt(statistics.commentCount) || 0;

        if (views === 0) return 0;

        const likeRatio = likes / views;
        const commentRatio = comments / views;

        return (likeRatio * 0.7 + commentRatio * 0.3);
    }

    checkTranscriptAvailability(videoDetail) {
        // This would need to be implemented with actual transcript checking
        // For now, return false as we don't have transcript data
        return false;
    }

    parseDuration(duration) {
        if (!duration) return 0;
        
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;

        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;

        return hours * 3600 + minutes * 60 + seconds;
    }

    findSourceTier(sourceName) {
        for (const tier of ['tier1', 'tier2', 'tier3']) {
            const sources = this.sourceCredibility[tier]?.sources || [];
            const source = sources.find(s => 
                s.name.toLowerCase().includes(sourceName.toLowerCase()) ||
                sourceName.toLowerCase().includes(s.name.toLowerCase())
            );
            if (source) {
                return { ...source, tier };
            }
        }
        return null;
    }

    // Enhanced News API integration
    async fetchHighQualityNewsData(query, language = 'uk', maxResults = 20) {
        const NEWS_API_KEY = process.env.NEWS_API_KEY;
        
        if (!NEWS_API_KEY) {
            console.warn('News API key not provided, skipping news integration');
            return [];
        }

        try {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${language}&sortBy=publishedAt&pageSize=${maxResults}&apiKey=${NEWS_API_KEY}`);
            
            if (!response.ok) {
                throw new Error(`News API failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const articles = data.articles || [];

            // Filter for high-quality news sources
            const highQualityArticles = articles.filter(article => 
                this.isHighQualityNewsArticle(article)
            );

            return highQualityArticles.map(article => this.convertNewsToEvent(article));
        } catch (error) {
            console.error('Error fetching news data:', error.message);
            return [];
        }
    }

    isHighQualityNewsArticle(article) {
        // Check for required fields
        if (!article.title || !article.description || !article.url || !article.publishedAt) {
            return false;
        }

        // Check source credibility
        const sourceName = article.source?.name || '';
        const sourceTier = this.findSourceTier(sourceName);
        
        if (!sourceTier || sourceTier.tier === 'tier3') {
            return false;
        }

        // Check content quality
        const titleLength = article.title.length;
        const descLength = article.description.length;
        
        if (titleLength < 10 || descLength < 50) {
            return false;
        }

        // Check for recent publication
        const publishedDate = new Date(article.publishedAt);
        const now = new Date();
        const daysDiff = (now - publishedDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 7) { // Only recent news
            return false;
        }

        return true;
    }

    convertNewsToEvent(article) {
        return {
            id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: article.title,
            date: article.publishedAt,
            description: article.description,
            source_url: article.url,
            channel_name: article.source?.name || 'News Source',
            source: 'News API',
            category: this.categorizeNewsContent(article.title, article.description),
            region: this.extractRegionFromContent(article.title, article.description),
            lat: null,
            lng: null,
            tags: [],
            quality_score: this.calculateNewsQualityScore(article),
            credibility_score: this.calculateNewsCredibilityScore(article)
        };
    }

    categorizeNewsContent(title, description) {
        const content = `${title} ${description}`.toLowerCase();
        
        const categories = {
            'Війни та конфлікти': ['війна', 'конфлікт', 'атака', 'удар', 'обстріл', 'бойові дії'],
            'Політичні зміни': ['вибори', 'уряд', 'президент', 'парламент', 'реформи', 'санкції'],
            'Економічні зміни': ['економіка', 'інфляція', 'ВВП', 'експорт', 'імпорт', 'ринок'],
            'Технологічні зміни': ['технології', 'інновації', 'чіпи', 'ядерна', 'енергія'],
            'Глобальні кризи': ['криза', 'пандемія', 'рецесія', 'клімат']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => content.includes(keyword))) {
                return category;
            }
        }

        return 'Політичні зміни'; // Default category
    }

    extractRegionFromContent(title, description) {
        const content = `${title} ${description}`.toLowerCase();
        
        const regions = {
            'Європа': ['європа', 'єс', 'німеччина', 'франція', 'польща', 'україна'],
            'Азія': ['азія', 'китай', 'японія', 'південна корея', 'тайвань'],
            'Близький Схід': ['близький схід', 'ізраїль', 'палестина', 'сирія', 'іран'],
            'Північна Америка': ['америка', 'сша', 'канада', 'мексика'],
            'Глобально': ['глобальний', 'світовий', 'міжнародний']
        };

        for (const [region, keywords] of Object.entries(regions)) {
            if (keywords.some(keyword => content.includes(keyword))) {
                return region;
            }
        }

        return 'Глобально'; // Default region
    }

    calculateNewsQualityScore(article) {
        let score = 0.5;

        // Title quality
        if (article.title && article.title.length > 20) score += 0.1;
        
        // Description quality
        if (article.description && article.description.length > 100) score += 0.1;
        
        // Source credibility
        const sourceTier = this.findSourceTier(article.source?.name || '');
        if (sourceTier) {
            score += (sourceTier.reliabilityScore / 100) * 0.3;
        }

        return Math.min(1, score);
    }

    calculateNewsCredibilityScore(article) {
        const sourceTier = this.findSourceTier(article.source?.name || '');
        if (sourceTier) {
            return sourceTier.reliabilityScore / 100;
        }
        return 0.5; // Default for unknown sources
    }

    // Enhanced data validation and enrichment
    async enrichEventData(event) {
        const enriched = { ...event };

        // Add quality score if not present
        if (!enriched.quality_score) {
            enriched.quality_score = this.calculateEventQualityScore(event);
        }

        // Add credibility score if not present
        if (!enriched.credibility_score) {
            enriched.credibility_score = this.calculateEventCredibilityScore(event);
        }

        // Enrich location data if missing
        if (!enriched.lat || !enriched.lng) {
            const location = await this.geocodeLocation(event.location || event.region);
            if (location) {
                enriched.lat = location.lat;
                enriched.lng = location.lng;
            }
        }

        // Add timestamp
        enriched.last_updated = new Date().toISOString();

        return enriched;
    }

    calculateEventQualityScore(event) {
        let score = 0.5;

        // Check required fields
        const requiredFields = this.qualityThresholds.requiredFields;
        const completedFields = requiredFields.filter(field => 
            event[field] && event[field].toString().trim() !== ''
        ).length;
        score += (completedFields / requiredFields.length) * 0.3;

        // Check description quality
        if (event.description && event.description.length > 50) score += 0.1;

        // Check location data
        if (event.lat && event.lng) score += 0.1;

        return Math.min(1, score);
    }

    calculateEventCredibilityScore(event) {
        const sourceTier = this.findSourceTier(event.channel_name || event.source || '');
        if (sourceTier) {
            return sourceTier.reliabilityScore / 100;
        }
        return 0.5;
    }

    async geocodeLocation(location) {
        // This would integrate with a geocoding service
        // For now, return null as we don't have a geocoding API key
        return null;
    }

    // Main integration method
    async integrateHighQualityData() {
        console.log('Starting enhanced data integration...');
        
        const newEvents = [];
        
        // Fetch high-quality YouTube data
        console.log('Fetching high-quality YouTube data...');
        const youtubeChannels = this.getHighQualityYouTubeChannels();
        
        for (const channel of youtubeChannels) {
            try {
                const videos = await this.fetchHighQualityYouTubeData(channel.id, 10);
                const events = videos.map(video => this.convertVideoToEvent(video, channel));
                newEvents.push(...events);
            } catch (error) {
                console.error(`Error fetching data for channel ${channel.name}:`, error.message);
            }
        }

        // Fetch high-quality news data
        console.log('Fetching high-quality news data...');
        const newsQueries = ['Україна', 'геополітика', 'Європа', 'конфлікт'];
        
        for (const query of newsQueries) {
            try {
                const newsEvents = await this.fetchHighQualityNewsData(query, 'uk', 5);
                newEvents.push(...newsEvents);
            } catch (error) {
                console.error(`Error fetching news for query ${query}:`, error.message);
            }
        }

        // Enrich and validate all new events
        console.log('Enriching and validating new events...');
        const enrichedEvents = [];
        
        for (const event of newEvents) {
            try {
                const enriched = await this.enrichEventData(event);
                if (this.isEventHighQuality(enriched)) {
                    enrichedEvents.push(enriched);
                }
            } catch (error) {
                console.error(`Error enriching event ${event.id}:`, error.message);
            }
        }

        // Merge with existing events
        const existingEvents = this.events;
        const mergedEvents = [...existingEvents, ...enrichedEvents];

        // Remove duplicates
        const uniqueEvents = this.removeDuplicates(mergedEvents);

        // Save enhanced dataset
        this.saveEvents(uniqueEvents);

        console.log(`Integration complete. Added ${enrichedEvents.length} high-quality events.`);
        console.log(`Total events: ${uniqueEvents.length}`);

        return {
            newEvents: enrichedEvents,
            totalEvents: uniqueEvents.length,
            qualityImprovement: this.calculateQualityImprovement(existingEvents, uniqueEvents)
        };
    }

    getHighQualityYouTubeChannels() {
        // Return channels from tier 1 and tier 2 sources
        const channels = [];
        
        for (const tier of ['tier1', 'tier2']) {
            const sources = this.sourceCredibility[tier]?.sources || [];
            sources.forEach(source => {
                if (source.type === 'youtube_channel') {
                    channels.push({
                        id: source.channelId || '',
                        name: source.name,
                        tier: tier
                    });
                }
            });
        }

        return channels;
    }

    convertVideoToEvent(video, channel) {
        return {
            id: video.id?.videoId || `yt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: video.snippet?.title || '',
            date: video.snippet?.publishedAt || new Date().toISOString(),
            description: video.snippet?.description || '',
            source_url: `https://www.youtube.com/watch?v=${video.id?.videoId}`,
            channel_name: channel.name,
            source: 'YouTube',
            category: this.categorizeVideoContent(video.snippet?.title || '', video.snippet?.description || ''),
            region: this.extractRegionFromContent(video.snippet?.title || '', video.snippet?.description || ''),
            lat: video.recordingDetails?.location?.latitude || null,
            lng: video.recordingDetails?.location?.longitude || null,
            tags: video.snippet?.tags || [],
            quality_score: video.qualityScore || 0.5,
            credibility_score: this.calculateEventCredibilityScore({ channel_name: channel.name }),
            duration: video.duration || 0,
            engagement_score: video.engagementScore || 0
        };
    }

    categorizeVideoContent(title, description) {
        // Similar to news categorization but adapted for video content
        return this.categorizeNewsContent(title, description);
    }

    isEventHighQuality(event) {
        const qualityScore = event.quality_score || 0;
        const credibilityScore = event.credibility_score || 0;
        
        return qualityScore >= 0.6 && credibilityScore >= 0.5;
    }

    removeDuplicates(events) {
        const seen = new Set();
        return events.filter(event => {
            const key = event.id || `${event.title}_${event.date}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    saveEvents(events) {
        fs.writeFileSync(EVENTS_JSON_PATH, JSON.stringify(events, null, 2));
        console.log(`Events saved to ${EVENTS_JSON_PATH}`);
    }

    calculateQualityImprovement(oldEvents, newEvents) {
        const oldAvgQuality = oldEvents.reduce((sum, e) => sum + (e.quality_score || 0.5), 0) / oldEvents.length;
        const newAvgQuality = newEvents.reduce((sum, e) => sum + (e.quality_score || 0.5), 0) / newEvents.length;
        
        return {
            qualityImprovement: newAvgQuality - oldAvgQuality,
            oldAverageQuality: oldAvgQuality,
            newAverageQuality: newAvgQuality
        };
    }
}

// Main execution
async function main() {
    const integrator = new EnhancedDataIntegration();
    
    try {
        const result = await integrator.integrateHighQualityData();
        
        console.log('\n=== INTEGRATION SUMMARY ===');
        console.log(`New Events Added: ${result.newEvents.length}`);
        console.log(`Total Events: ${result.totalEvents}`);
        console.log(`Quality Improvement: ${(result.qualityImprovement.qualityImprovement * 100).toFixed(1)}%`);
        console.log(`Old Average Quality: ${(result.qualityImprovement.oldAverageQuality * 100).toFixed(1)}%`);
        console.log(`New Average Quality: ${(result.qualityImprovement.newAverageQuality * 100).toFixed(1)}%`);
        
    } catch (error) {
        console.error('Integration failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = EnhancedDataIntegration;