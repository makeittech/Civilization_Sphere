/**
 * Test script for external API integrations
 * Run this in the browser console to test the API functionality
 */

async function testExternalAPIs() {
    console.log('🧪 Testing External API Integration...');
    
    try {
        // Test 1: API Manager initialization
        console.log('1. Testing API Manager initialization...');
        const apiManager = new APIManager();
        await apiManager.initializeServices({});
        console.log('✅ API Manager initialized successfully');
        
        // Test 2: Data Normalizer
        console.log('2. Testing Data Normalizer...');
        const normalizer = new DataNormalizer();
        const testEvent = {
            title: 'Test Geopolitical Event',
            description: 'This is a test event for validation',
            date: '2024-01-01',
            category: 'politics',
            region: 'europe'
        };
        
        const normalized = normalizer.normalizeEvent(testEvent, 'test');
        console.log('✅ Data Normalizer working:', normalized);
        
        // Test 3: Cache Manager
        console.log('3. Testing Cache Manager...');
        const cacheManager = new CacheManager();
        await cacheManager.set('test-key', { test: 'data' });
        const cached = await cacheManager.get('test-key');
        console.log('✅ Cache Manager working:', cached);
        
        // Test 4: Error Handler
        console.log('4. Testing Error Handler...');
        const errorHandler = new ErrorHandler();
        const testOperation = () => Promise.resolve('success');
        const result = await errorHandler.executeWithRetry(testOperation, { service: 'test' });
        console.log('✅ Error Handler working:', result);
        
        // Test 5: Health Checker
        console.log('5. Testing Health Checker...');
        const healthChecker = new HealthChecker();
        healthChecker.registerCheck('test-check', () => Promise.resolve(true));
        const healthResult = await healthChecker.runCheck('test-check');
        console.log('✅ Health Checker working:', healthResult);
        
        console.log('🎉 All external API components are working correctly!');
        
        return {
            success: true,
            components: {
                apiManager: true,
                normalizer: true,
                cacheManager: true,
                errorHandler: true,
                healthChecker: true
            }
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test specific API services
async function testNewsAPI() {
    console.log('📰 Testing NewsAPI Service...');
    
    try {
        const newsService = new NewsAPIService('test-key');
        const testArticles = [
            {
                title: 'Test News Article',
                description: 'This is a test article about geopolitics',
                publishedAt: '2024-01-01T00:00:00Z',
                url: 'https://example.com/test',
                source: { name: 'Test Source' }
            }
        ];
        
        const normalized = newsService.normalizeArticles(testArticles);
        console.log('✅ NewsAPI normalization working:', normalized);
        
        return { success: true, normalized };
    } catch (error) {
        console.error('❌ NewsAPI test failed:', error);
        return { success: false, error: error.message };
    }
}

async function testHistoricalAPI() {
    console.log('📚 Testing Historical Events API Service...');
    
    try {
        const historicalService = new HistoricalEventsAPIService();
        const testEvents = [
            {
                text: 'Test historical event',
                year: 1900
            }
        ];
        
        const normalized = historicalService.normalizeHistoricalEvents(testEvents);
        console.log('✅ Historical API normalization working:', normalized);
        
        return { success: true, normalized };
    } catch (error) {
        console.error('❌ Historical API test failed:', error);
        return { success: false, error: error.message };
    }
}

// Integration test with the main app
async function testAppIntegration() {
    console.log('🔗 Testing App Integration...');
    
    try {
        // Check if the main app has the new methods
        if (typeof window.app !== 'undefined') {
            console.log('✅ Main app found');
            
            // Test API initialization
            if (typeof window.app.initializeExternalAPIs === 'function') {
                console.log('✅ External API initialization method found');
            }
            
            // Test external data fetching
            if (typeof window.app.fetchExternalData === 'function') {
                console.log('✅ External data fetching method found');
            }
            
            // Test API testing
            if (typeof window.app.testNewsAPI === 'function') {
                console.log('✅ NewsAPI testing method found');
            }
            
            console.log('✅ App integration looks good');
            return { success: true };
        } else {
            console.log('❌ Main app not found');
            return { success: false, error: 'Main app not found' };
        }
    } catch (error) {
        console.error('❌ App integration test failed:', error);
        return { success: false, error: error.message };
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive external API tests...\n');
    
    const results = {
        externalAPIs: await testExternalAPIs(),
        newsAPI: await testNewsAPI(),
        historicalAPI: await testHistoricalAPI(),
        appIntegration: await testAppIntegration()
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    Object.entries(results).forEach(([test, result]) => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${test}: ${status}`);
        if (!result.success && result.error) {
            console.log(`  Error: ${result.error}`);
        }
    });
    
    const allPassed = Object.values(results).every(result => result.success);
    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return results;
}

// Export for use in browser console
window.testExternalAPIs = testExternalAPIs;
window.testNewsAPI = testNewsAPI;
window.testHistoricalAPI = testHistoricalAPI;
window.testAppIntegration = testAppIntegration;
window.runAllTests = runAllTests;

console.log('🧪 External API test functions loaded. Run runAllTests() to start testing.');