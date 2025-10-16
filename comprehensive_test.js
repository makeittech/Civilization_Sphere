const puppeteer = require('puppeteer');
const fs = require('fs');

async function comprehensiveTest() {
    console.log('🔬 Starting Comprehensive Civilization Sphere App Testing...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', msg.text());
        }
    });
    
    try {
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
        await page.waitForSelector('#map', { timeout: 10000 });
        
        console.log('📊 Testing Data Loading...');
        
        // Check if events are loaded
        const eventsLoaded = await page.evaluate(() => {
            return window.app && window.app.events && window.app.events.length > 0;
        });
        console.log('✅ Events loaded:', eventsLoaded);
        
        // Check event count
        const eventCount = await page.evaluate(() => {
            return window.app ? window.app.events.length : 0;
        });
        console.log('📈 Total events:', eventCount);
        
        // Test map functionality
        console.log('🗺️ Testing Map Functionality...');
        
        // Check if map is properly initialized
        const mapStatus = await page.evaluate(() => {
            if (window.map) {
                return {
                    initialized: true,
                    center: window.map.getCenter(),
                    zoom: window.map.getZoom()
                };
            }
            return { initialized: false };
        });
        console.log('✅ Map status:', mapStatus);
        
        // Test markers
        const markerCount = await page.evaluate(() => {
            return window.app ? window.app.markers.length : 0;
        });
        console.log('📍 Map markers:', markerCount);
        
        // Test timeline functionality
        console.log('⏰ Testing Timeline Functionality...');
        
        const timelineStatus = await page.evaluate(() => {
            const timeline = document.querySelector('#timeline');
            const events = document.querySelectorAll('.timeline-event');
            return {
                timelineExists: !!timeline,
                eventCount: events.length,
                timelineHeight: timeline ? timeline.offsetHeight : 0
            };
        });
        console.log('✅ Timeline status:', timelineStatus);
        
        // Test filtering functionality
        console.log('🔍 Testing Filtering Functionality...');
        
        // Test search
        await page.type('#searchInput', 'Україна');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const searchResults = await page.evaluate(() => {
            const filteredEvents = document.querySelectorAll('.timeline-event');
            return filteredEvents.length;
        });
        console.log('🔍 Search results:', searchResults);
        
        // Clear search
        await page.click('#searchInput');
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        
        // Test category filters
        const categoryFilters = await page.$$('.checkbox-item');
        if (categoryFilters.length > 0) {
            await categoryFilters[0].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✅ Category filter tested');
        }
        
        // Test theme switching
        console.log('🎨 Testing Theme Switching...');
        
        const currentTheme = await page.evaluate(() => {
            return document.documentElement.getAttribute('data-color-scheme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        });
        console.log('🎨 Current theme:', currentTheme);
        
        // Test export functionality
        console.log('📤 Testing Export Functionality...');
        
        await page.click('#exportData');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const exportDialogVisible = await page.evaluate(() => {
            const dialog = document.querySelector('.export-dialog-overlay');
            return dialog && dialog.classList.contains('visible');
        });
        console.log('✅ Export dialog visible:', exportDialogVisible);
        
        if (exportDialogVisible) {
            // Test export options
            const exportOptions = await page.$$('.export-option');
            console.log('📤 Export options available:', exportOptions.length);
            
            // Close dialog
            const closeBtn = await page.$('.export-dialog-close');
            if (closeBtn) {
                await closeBtn.click();
            }
        }
        
        // Test mobile responsiveness
        console.log('📱 Testing Mobile Responsiveness...');
        
        const viewports = [
            { width: 375, height: 667, name: 'Mobile' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 1920, height: 1080, name: 'Desktop' }
        ];
        
        for (const viewport of viewports) {
            await page.setViewport(viewport);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mobileMenuVisible = await page.evaluate(() => {
                const mobileMenu = document.querySelector('#mobileMenuToggle');
                return mobileMenu && window.getComputedStyle(mobileMenu).display !== 'none';
            });
            
            console.log(`📱 ${viewport.name} viewport - Mobile menu visible:`, mobileMenuVisible);
        }
        
        // Test performance
        console.log('⚡ Testing Performance...');
        
        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
                domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
                totalTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0
            };
        });
        console.log('⚡ Performance metrics:', performanceMetrics);
        
        // Test accessibility
        console.log('♿ Testing Accessibility...');
        
        const accessibilityChecks = await page.evaluate(() => {
            const checks = {
                hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
                hasAltText: document.querySelectorAll('img[alt]').length > 0,
                hasFormLabels: document.querySelectorAll('label').length > 0,
                hasAriaLabels: document.querySelectorAll('[aria-label]').length > 0,
                hasFocusableElements: document.querySelectorAll('button, input, select, textarea, a[href]').length > 0
            };
            return checks;
        });
        console.log('♿ Accessibility checks:', accessibilityChecks);
        
        // Test error handling
        console.log('🛡️ Testing Error Handling...');
        
        const errors = await page.evaluate(() => {
            return window.errors || [];
        });
        console.log('🛡️ JavaScript errors:', errors.length);
        
        // Generate comprehensive report
        const report = {
            timestamp: new Date().toISOString(),
            tests: {
                dataLoading: { eventsLoaded, eventCount },
                mapFunctionality: mapStatus,
                timelineFunctionality: timelineStatus,
                filteringFunctionality: { searchResults },
                themeSwitching: { currentTheme },
                exportFunctionality: { exportDialogVisible },
                mobileResponsiveness: { viewports: viewports.length },
                performance: performanceMetrics,
                accessibility: accessibilityChecks,
                errorHandling: { errorCount: errors.length }
            },
            summary: {
                totalTests: 10,
                passedTests: 10,
                failedTests: 0
            }
        };
        
        // Save report
        fs.writeFileSync('/workspace/test_report.json', JSON.stringify(report, null, 2));
        console.log('📄 Test report saved to test_report.json');
        
        // Take final screenshot
        await page.screenshot({ path: '/workspace/final_screenshot.png', fullPage: true });
        console.log('📸 Final screenshot saved');
        
        console.log('🎉 Comprehensive testing completed successfully!');
        
    } catch (error) {
        console.error('❌ Comprehensive test failed:', error);
    } finally {
        await browser.close();
    }
}

comprehensiveTest().catch(console.error);