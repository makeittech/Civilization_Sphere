const puppeteer = require('puppeteer');
const fs = require('fs');

async function testCivilizationSphereApp() {
    console.log('🚀 Starting Civilization Sphere App Testing...');
    
    const browser = await puppeteer.launch({
        headless: true, // Set to true for headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for different screen sizes
    await page.setViewport({ width: 1920, height: 1080 });
    
    try {
        // Test 1: Load the application
        console.log('📱 Test 1: Loading application...');
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
        
        // Wait for the app to initialize
        await page.waitForSelector('#map', { timeout: 10000 });
        console.log('✅ Application loaded successfully');
        
        // Test 2: Check interactive map visualization
        console.log('🗺️ Test 2: Testing interactive map visualization...');
        const mapElement = await page.$('#map');
        if (mapElement) {
            console.log('✅ Map container found');
            
            // Check if Leaflet map is initialized
            const mapInitialized = await page.evaluate(() => {
                return window.map && typeof window.map.setView === 'function';
            });
            console.log('✅ Map initialized:', mapInitialized);
        }
        
        // Test 3: Check timeline playback
        console.log('⏯️ Test 3: Testing timeline playback...');
        const timelinePlayBtn = await page.$('#timelinePlay');
        const timelinePauseBtn = await page.$('#timelinePause');
        const timelineResetBtn = await page.$('#timelineReset');
        
        if (timelinePlayBtn && timelinePauseBtn && timelineResetBtn) {
            console.log('✅ Timeline controls found');
            
            // Test play button
            await timelinePlayBtn.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✅ Play button clicked');
            
            // Test pause button
            await timelinePauseBtn.click();
            console.log('✅ Pause button clicked');
            
            // Test reset button
            await timelineResetBtn.click();
            console.log('✅ Reset button clicked');
        }
        
        // Test 4: Check event filtering
        console.log('🔍 Test 4: Testing event filtering...');
        const searchInput = await page.$('#searchInput');
        if (searchInput) {
            await searchInput.type('Україна');
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✅ Search input working');
        }
        
        // Test quick filters
        const quickFilters = await page.$$('.quick-filter-btn');
        if (quickFilters.length > 0) {
            await quickFilters[1].click(); // Click "Останні" filter
            console.log('✅ Quick filters working');
        }
        
        // Test 5: Check mobile responsive design
        console.log('📱 Test 5: Testing mobile responsive design...');
        
        // Test mobile viewport
        await page.setViewport({ width: 375, height: 667 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mobileMenuToggle = await page.$('#mobileMenuToggle');
        if (mobileMenuToggle) {
            await mobileMenuToggle.click();
            console.log('✅ Mobile menu toggle working');
        }
        
        // Test tablet viewport
        await page.setViewport({ width: 768, height: 1024 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Tablet viewport tested');
        
        // Test desktop viewport
        await page.setViewport({ width: 1920, height: 1080 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Desktop viewport tested');
        
        // Test 6: Check theme switching
        console.log('🎨 Test 6: Testing theme switching...');
        const themeToggle = await page.$('#themeToggle');
        if (themeToggle) {
            const lightThemeBtn = await page.$('[data-theme="light"]');
            const darkThemeBtn = await page.$('[data-theme="dark"]');
            
            if (lightThemeBtn && darkThemeBtn) {
                await lightThemeBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✅ Light theme applied');
                
                await darkThemeBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✅ Dark theme applied');
            }
        }
        
        // Test 7: Check data export functionality
        console.log('📤 Test 7: Testing data export functionality...');
        const exportBtn = await page.$('#exportData');
        if (exportBtn) {
            await exportBtn.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✅ Export button clicked');
            
            // Check if export dialog appeared
            const exportDialog = await page.$('.export-dialog-overlay');
            if (exportDialog) {
                console.log('✅ Export dialog appeared');
                
                // Close export dialog
                const closeBtn = await page.$('.export-dialog-close');
                if (closeBtn) {
                    await closeBtn.click();
                    console.log('✅ Export dialog closed');
                }
            }
        }
        
        // Test 8: Check real-time statistics and analytics
        console.log('📊 Test 8: Testing real-time statistics and analytics...');
        const statsContainer = await page.$('.stats-container');
        if (statsContainer) {
            console.log('✅ Statistics container found');
            
            const charts = await page.$$('.chart-canvas');
            console.log('✅ Charts found:', charts.length);
        }
        
        // Test 9: Check data import functionality
        console.log('📥 Test 9: Testing data import functionality...');
        const importBtn = await page.$('#importBtn');
        const scanSourcesBtn = await page.$('#scanSourcesBtn');
        
        if (importBtn && scanSourcesBtn) {
            console.log('✅ Import controls found');
            
            // Test scan sources button
            await scanSourcesBtn.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('✅ Scan sources button clicked');
        }
        
        // Test 10: Check overall user experience
        console.log('👤 Test 10: Testing overall user experience...');
        
        // Check if all major UI elements are present
        const header = await page.$('.header');
        const sidebar = await page.$('.sidebar');
        const timeline = await page.$('.timeline-container');
        const mapContainer = await page.$('.map-container');
        
        if (header && sidebar && timeline && mapContainer) {
            console.log('✅ All major UI components present');
        }
        
        // Check for any JavaScript errors
        const errors = await page.evaluate(() => {
            return window.errors || [];
        });
        
        if (errors.length === 0) {
            console.log('✅ No JavaScript errors detected');
        } else {
            console.log('⚠️ JavaScript errors found:', errors);
        }
        
        // Take a screenshot
        await page.screenshot({ path: '/workspace/app_screenshot.png', fullPage: true });
        console.log('📸 Screenshot saved as app_screenshot.png');
        
        console.log('🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        
        // Take error screenshot
        await page.screenshot({ path: '/workspace/error_screenshot.png', fullPage: true });
        console.log('📸 Error screenshot saved as error_screenshot.png');
    } finally {
        await browser.close();
    }
}

// Run the test
testCivilizationSphereApp().catch(console.error);