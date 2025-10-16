# External API Integration Documentation

## Overview

The Civilization Sphere app now includes comprehensive external API integration for enriching the geopolitical events database with real-time news, historical events, and geopolitical data from various sources.

## Architecture

### Core Components

1. **APIManager** - Central manager for all external API services
2. **DataNormalizer** - Standardizes external API responses into consistent event format
3. **CacheManager** - Intelligent caching system for API calls
4. **ErrorHandler** - Robust error handling and fallback mechanisms
5. **HealthChecker** - Monitors API service health and availability

### API Services

#### NewsAPI Service
- **Provider**: NewsAPI.org
- **Purpose**: Real-time news and geopolitical events
- **Features**:
  - Everything endpoint for comprehensive news search
  - Top headlines by category and country
  - Automatic content categorization
  - Geographic region extraction
  - Importance scoring based on content analysis

#### Historical Events API Service
- **Provider**: OnThisDay.com API
- **Purpose**: Historical geopolitical events
- **Features**:
  - Events by specific date
  - Events by year
  - Historical context and categorization
  - Participant extraction from historical text

#### Geopolitical Data API Service
- **Provider**: REST Countries API
- **Purpose**: Country and geopolitical data
- **Features**:
  - Country information and statistics
  - Geographic coordinates
  - Regional classifications
  - Border and relationship data

## Usage

### Basic Integration

```javascript
// Initialize the API manager
const apiManager = new APIManager();
await apiManager.initializeServices({
    newsAPI: 'your-api-key-here'
});

// Fetch events from all sources
const events = await apiManager.fetchEventsFromAllSources('geopolitics');
```

### Individual Service Usage

```javascript
// NewsAPI
const newsService = apiManager.getService('news');
const newsEvents = await newsService.getEverything('geopolitics');

// Historical Events
const historicalService = apiManager.getService('historical');
const todayEvents = await historicalService.getEventsByDate(12, 25);

// Geopolitical Data
const geoService = apiManager.getService('geopolitical');
const countryData = await geoService.getCountryData('US');
```

### Data Normalization

```javascript
const normalizer = new DataNormalizer();
const rawEvent = {
    title: 'Breaking: Geopolitical Event',
    description: 'Important development in global politics',
    publishedAt: '2024-01-01T00:00:00Z'
};

const normalizedEvent = normalizer.normalizeEvent(rawEvent, 'NewsAPI');
```

### Caching

```javascript
const cacheManager = new CacheManager({
    maxSize: 1000,
    defaultTTL: 300000, // 5 minutes
    enableLocalStorage: true
});

// Cache with TTL
await cacheManager.set('news-geopolitics', events, { ttl: 600000 });

// Retrieve from cache
const cached = await cacheManager.get('news-geopolitics');
```

### Error Handling

```javascript
const errorHandler = new ErrorHandler({
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    fallbackEnabled: true
});

// Execute with retry and fallback
const result = await errorHandler.executeWithFallback(
    () => apiCall(),
    () => fallbackCall(),
    { service: 'news' }
);
```

## Configuration

### API Keys

Store API keys in localStorage or environment variables:

```javascript
// Store API key
localStorage.setItem('api_key_newsAPI', 'your-key-here');

// Retrieve API key
const apiKey = localStorage.getItem('api_key_newsAPI');
```

### Service Configuration

```javascript
const config = {
    newsAPI: {
        apiKey: 'your-key',
        enabled: true,
        rateLimit: 1000 // requests per day
    },
    historicalEvents: {
        enabled: true
    },
    geopoliticalData: {
        enabled: true
    }
};
```

## UI Integration

### Data Import Panel

The app includes an enhanced Data Import panel with:

- **API Configuration**: Input fields for API keys and settings
- **Service Toggles**: Enable/disable specific services
- **Test Buttons**: Test API connectivity
- **Import Preview**: Preview external data before import
- **Batch Import**: Import multiple sources at once

### Usage in UI

1. **Configure APIs**: Enter API keys in the Data Import panel
2. **Test Connectivity**: Use the "Test" button to verify API access
3. **Fetch External Data**: Click "Завантажити зовнішні дані" to load data
4. **Review Data**: Preview the imported events in the preview panel
5. **Import to App**: Click "Імпортувати знайдені" to add to the main dataset

## Data Flow

```
External APIs → Data Normalization → Caching → Error Handling → UI Integration
     ↓                ↓                ↓            ↓              ↓
  Raw Data    →  Standardized   →  Cached    →  Fallback    →  User Review
               →  Event Format  →  Results   →  Handling    →  & Import
```

## Error Handling & Fallbacks

### Circuit Breaker Pattern
- Automatically opens circuit after 5 consecutive failures
- Prevents cascading failures
- Auto-recovery after timeout period

### Fallback Data
- Static fallback data for each service
- Graceful degradation when APIs are unavailable
- User notification of fallback usage

### Retry Logic
- Exponential backoff for retries
- Configurable retry count and delays
- Service-specific retry policies

## Performance Optimization

### Caching Strategy
- **Memory Cache**: Fast access for frequently used data
- **LocalStorage**: Persistent cache across sessions
- **TTL Management**: Automatic expiration of stale data
- **Cache Warming**: Preload frequently accessed data

### Rate Limiting
- Respects API rate limits
- Automatic throttling when limits approached
- Queue management for high-volume requests

## Monitoring & Health Checks

### Health Monitoring
```javascript
const healthChecker = new HealthChecker();
healthChecker.registerCheck('newsAPI', () => checkNewsAPIHealth());
const status = await healthChecker.runAllChecks();
```

### Error Tracking
```javascript
const errorStats = errorHandler.getErrorStats();
const logs = errorHandler.getLogs('error', 'newsAPI');
```

### Cache Analytics
```javascript
const analytics = cacheManager.getCacheAnalytics();
console.log(`Hit Rate: ${analytics.hitRate}`);
console.log(`Memory Usage: ${analytics.memoryUsage.mb} MB`);
```

## Testing

### Automated Tests
Run the test suite in the browser console:

```javascript
// Run all tests
await runAllTests();

// Test specific components
await testExternalAPIs();
await testNewsAPI();
await testHistoricalAPI();
await testAppIntegration();
```

### Manual Testing
1. Open browser console
2. Load the test script: `test-external-apis.js`
3. Run `runAllTests()` to execute all tests
4. Check console output for test results

## Security Considerations

### API Key Management
- Store keys securely in localStorage
- Never expose keys in client-side code
- Use environment variables in production

### CORS Handling
- Use CORS proxy for cross-origin requests
- Implement proper error handling for CORS failures
- Fallback to server-side proxy when needed

### Data Validation
- Validate all incoming data
- Sanitize user inputs
- Implement content filtering

## Future Enhancements

### Planned Features
- **Twitter API Integration**: Social media sentiment analysis
- **YouTube Data API**: Video content analysis
- **Wikipedia API**: Historical context enrichment
- **Real-time Updates**: WebSocket connections for live data
- **Machine Learning**: AI-powered content categorization

### Extensibility
- Plugin architecture for new API services
- Custom data processors
- Configurable normalization rules
- Advanced caching strategies

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify key is correct and active
   - Check API service status
   - Ensure proper permissions

2. **CORS Errors**
   - Use CORS proxy
   - Check browser security settings
   - Verify API endpoint accessibility

3. **Rate Limiting**
   - Implement proper delays between requests
   - Use caching to reduce API calls
   - Monitor usage against limits

4. **Data Quality Issues**
   - Review normalization rules
   - Check source data format
   - Validate required fields

### Debug Mode
Enable debug logging:

```javascript
const errorHandler = new ErrorHandler({ loggingEnabled: true });
const cacheManager = new CacheManager({ debug: true });
```

## Support

For issues or questions regarding external API integration:

1. Check the browser console for error messages
2. Run the test suite to identify specific failures
3. Review API service documentation
4. Check network connectivity and CORS settings

## License

External API integration follows the same license as the main Civilization Sphere project. Individual API services have their own terms of service and usage policies.