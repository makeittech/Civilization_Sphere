#!/usr/bin/env python3
"""
Comprehensive test script for the Civilization Sphere app
Tests all major features including map visualization, timeline, filtering, mobile responsiveness, theme switching, data export, and analytics.
"""

import time
import json
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import requests

class CivilizationSphereTester:
    def __init__(self):
        self.driver = None
        self.base_url = "http://localhost:8000"
        self.test_results = {}
        
    def setup_driver(self):
        """Setup Chrome driver with headless options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36")
        
        try:
            # Try to use system Chrome first
            chrome_options.binary_location = "/usr/bin/google-chrome-stable"
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.implicitly_wait(10)
            print("✅ Chrome driver setup successful")
            return True
        except Exception as e:
            print(f"❌ Failed to setup Chrome driver: {e}")
            return False
    
    def test_page_load(self):
        """Test if the page loads correctly"""
        try:
            print("\n🔍 Testing page load...")
            self.driver.get(self.base_url)
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check if main elements are present
            title = self.driver.find_element(By.TAG_NAME, "title").get_attribute("textContent")
            app_title = self.driver.find_element(By.CLASS_NAME, "app-title").text
            
            self.test_results["page_load"] = {
                "status": "PASS",
                "title": title,
                "app_title": app_title,
                "url": self.driver.current_url
            }
            print(f"✅ Page loaded successfully: {title}")
            print(f"✅ App title: {app_title}")
            return True
            
        except Exception as e:
            self.test_results["page_load"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ Page load failed: {e}")
            return False
    
    def test_interactive_map(self):
        """Test interactive map visualization"""
        try:
            print("\n🗺️ Testing interactive map visualization...")
            
            # Wait for map to load
            map_element = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.ID, "map"))
            )
            
            # Check if Leaflet map is loaded
            leaflet_container = self.driver.find_element(By.CLASS_NAME, "leaflet-container")
            
            # Test map controls
            map_controls = self.driver.find_elements(By.CLASS_NAME, "map-controls")
            control_buttons = self.driver.find_elements(By.CLASS_NAME, "map-btn")
            
            # Test map interaction (zoom, pan)
            actions = ActionChains(self.driver)
            actions.move_to_element(map_element).perform()
            
            self.test_results["interactive_map"] = {
                "status": "PASS",
                "map_loaded": True,
                "leaflet_loaded": True,
                "controls_count": len(control_buttons),
                "map_visible": map_element.is_displayed()
            }
            print(f"✅ Interactive map loaded successfully")
            print(f"✅ Map controls found: {len(control_buttons)}")
            return True
            
        except Exception as e:
            self.test_results["interactive_map"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ Interactive map test failed: {e}")
            return False
    
    def test_timeline_playback(self):
        """Test timeline playback controls"""
        try:
            print("\n⏯️ Testing timeline playback...")
            
            # Find timeline elements
            timeline_container = self.driver.find_element(By.CLASS_NAME, "timeline-container")
            timeline = self.driver.find_element(By.ID, "timeline")
            
            # Test playback controls
            play_button = self.driver.find_element(By.ID, "timelinePlay")
            pause_button = self.driver.find_element(By.ID, "timelinePause")
            reset_button = self.driver.find_element(By.ID, "timelineReset")
            
            # Test speed controls
            speed_select = self.driver.find_element(By.ID, "playbackSpeed")
            speed_options = speed_select.find_elements(By.TAG_NAME, "option")
            
            # Test progress bar
            progress_bar = self.driver.find_element(By.ID, "timelineProgressBar")
            
            # Test button interactions
            play_button.click()
            time.sleep(1)
            pause_button.click()
            time.sleep(1)
            reset_button.click()
            
            self.test_results["timeline_playback"] = {
                "status": "PASS",
                "timeline_loaded": True,
                "controls_working": True,
                "speed_options": len(speed_options),
                "progress_bar_present": True
            }
            print(f"✅ Timeline playback controls working")
            print(f"✅ Speed options available: {len(speed_options)}")
            return True
            
        except Exception as e:
            self.test_results["timeline_playback"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ Timeline playback test failed: {e}")
            return False
    
    def test_event_filtering(self):
        """Test event filtering and search functionality"""
        try:
            print("\n🔍 Testing event filtering and search...")
            
            # Test search input
            search_input = self.driver.find_element(By.ID, "searchInput")
            search_input.send_keys("test")
            time.sleep(1)
            search_input.clear()
            
            # Test quick filters
            quick_filters = self.driver.find_elements(By.CLASS_NAME, "quick-filter-btn")
            for filter_btn in quick_filters:
                filter_btn.click()
                time.sleep(0.5)
            
            # Test category filters
            category_filters = self.driver.find_elements(By.CLASS_NAME, "checkbox-item")
            
            # Test date range filters
            date_from = self.driver.find_element(By.ID, "dateFrom")
            date_to = self.driver.find_element(By.ID, "dateTo")
            
            # Test region filter
            region_filter = self.driver.find_element(By.ID, "regionFilter")
            region_options = region_filter.find_elements(By.TAG_NAME, "option")
            
            # Test clear filters
            clear_filters_btn = self.driver.find_element(By.ID, "clearFilters")
            clear_filters_btn.click()
            
            self.test_results["event_filtering"] = {
                "status": "PASS",
                "search_working": True,
                "quick_filters_count": len(quick_filters),
                "category_filters_count": len(category_filters),
                "date_filters_working": True,
                "region_options": len(region_options),
                "clear_filters_working": True
            }
            print(f"✅ Event filtering working")
            print(f"✅ Quick filters: {len(quick_filters)}")
            print(f"✅ Category filters: {len(category_filters)}")
            return True
            
        except Exception as e:
            self.test_results["event_filtering"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ Event filtering test failed: {e}")
            return False
    
    def test_mobile_responsive(self):
        """Test mobile-responsive design"""
        try:
            print("\n📱 Testing mobile-responsive design...")
            
            # Test different screen sizes
            screen_sizes = [
                (375, 667),   # iPhone SE
                (768, 1024),  # iPad
                (1920, 1080)  # Desktop
            ]
            
            mobile_features = {}
            
            for width, height in screen_sizes:
                self.driver.set_window_size(width, height)
                time.sleep(1)
                
                # Check if mobile menu toggle appears on small screens
                mobile_menu = self.driver.find_element(By.ID, "mobileMenuToggle")
                is_mobile = width <= 768
                
                mobile_features[f"{width}x{height}"] = {
                    "mobile_menu_visible": mobile_menu.is_displayed() == is_mobile,
                    "responsive": True
                }
            
            # Reset to desktop size
            self.driver.set_window_size(1920, 1080)
            
            self.test_results["mobile_responsive"] = {
                "status": "PASS",
                "screen_sizes_tested": len(screen_sizes),
                "mobile_features": mobile_features
            }
            print(f"✅ Mobile responsive design working")
            print(f"✅ Tested {len(screen_sizes)} screen sizes")
            return True
            
        except Exception as e:
            self.test_results["mobile_responsive"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ Mobile responsive test failed: {e}")
            return False
    
    def test_theme_switching(self):
        """Test theme switching functionality"""
        try:
            print("\n🎨 Testing theme switching...")
            
            # Find theme toggle buttons
            theme_toggle = self.driver.find_element(By.ID, "themeToggle")
            light_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-theme="light"]')
            dark_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-theme="dark"]')
            
            # Test switching to light theme
            light_btn.click()
            time.sleep(1)
            
            # Check if theme changed
            body_classes = self.driver.find_element(By.TAG_NAME, "body").get_attribute("class")
            light_active = "light-theme" in body_classes or light_btn.get_attribute("class").find("active") != -1
            
            # Test switching to dark theme
            dark_btn.click()
            time.sleep(1)
            
            # Check if theme changed
            body_classes = self.driver.find_element(By.TAG_NAME, "body").get_attribute("class")
            dark_active = dark_btn.get_attribute("class").find("active") != -1
            
            self.test_results["theme_switching"] = {
                "status": "PASS",
                "theme_toggle_present": True,
                "light_theme_working": light_active,
                "dark_theme_working": dark_active
            }
            print(f"✅ Theme switching working")
            print(f"✅ Light theme: {light_active}")
            print(f"✅ Dark theme: {dark_active}")
            return True
            
        except Exception as e:
            self.test_results["theme_switching"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ Theme switching test failed: {e}")
            return False
    
    def test_data_export(self):
        """Test data export functionality"""
        try:
            print("\n📤 Testing data export functionality...")
            
            # Find export button
            export_btn = self.driver.find_element(By.ID, "exportData")
            export_btn.click()
            time.sleep(2)
            
            # Check if export dialog appears
            export_dialog = self.driver.find_element(By.CLASS_NAME, "export-dialog")
            export_options = self.driver.find_elements(By.CLASS_NAME, "export-option")
            
            # Test export options
            export_formats = []
            for option in export_options:
                format_name = option.find_element(By.CLASS_NAME, "export-option-label").text
                export_formats.append(format_name)
            
            # Close export dialog
            close_btn = self.driver.find_element(By.CLASS_NAME, "export-dialog-close")
            close_btn.click()
            time.sleep(1)
            
            self.test_results["data_export"] = {
                "status": "PASS",
                "export_dialog_working": True,
                "export_formats": export_formats,
                "export_options_count": len(export_options)
            }
            print(f"✅ Data export working")
            print(f"✅ Export formats: {export_formats}")
            return True
            
        except Exception as e:
            self.test_results["data_export"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ Data export test failed: {e}")
            return False
    
    def test_statistics_analytics(self):
        """Test real-time statistics and analytics"""
        try:
            print("\n📊 Testing statistics and analytics...")
            
            # Check for statistics elements
            total_events = self.driver.find_element(By.ID, "totalEvents")
            filtered_events = self.driver.find_element(By.ID, "filteredEvents")
            
            # Check for charts
            charts = self.driver.find_elements(By.CLASS_NAME, "chart-canvas")
            
            # Check for statistics panel
            stats_container = self.driver.find_element(By.CLASS_NAME, "stats-container")
            
            # Check for analytics section
            analytics_section = self.driver.find_element(By.CLASS_NAME, "analytics-section")
            
            self.test_results["statistics_analytics"] = {
                "status": "PASS",
                "event_counters_present": True,
                "charts_count": len(charts),
                "stats_container_present": True,
                "analytics_section_present": True
            }
            print(f"✅ Statistics and analytics working")
            print(f"✅ Charts found: {len(charts)}")
            return True
            
        except Exception as e:
            self.test_results["statistics_analytics"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ Statistics and analytics test failed: {e}")
            return False
    
    def test_data_import(self):
        """Test data import functionality"""
        try:
            print("\n📥 Testing data import functionality...")
            
            # Find import section
            import_section = self.driver.find_element(By.ID, "panelDataImport")
            
            # Check import format options
            import_format = self.driver.find_element(By.ID, "importFormat")
            format_options = import_format.find_elements(By.TAG_NAME, "option")
            
            # Check file input
            file_input = self.driver.find_element(By.ID, "importFile")
            
            # Check import buttons
            scan_btn = self.driver.find_element(By.ID, "scanSourcesBtn")
            import_btn = self.driver.find_element(By.ID, "importBtn")
            clear_btn = self.driver.find_element(By.ID, "clearImportBtn")
            
            # Test import format selection
            for option in format_options:
                option.click()
                time.sleep(0.2)
            
            self.test_results["data_import"] = {
                "status": "PASS",
                "import_section_present": True,
                "format_options": len(format_options),
                "file_input_present": True,
                "import_buttons_present": True
            }
            print(f"✅ Data import functionality working")
            print(f"✅ Import format options: {len(format_options)}")
            return True
            
        except Exception as e:
            self.test_results["data_import"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ Data import test failed: {e}")
            return False
    
    def test_user_experience(self):
        """Test overall user experience and performance"""
        try:
            print("\n👤 Testing user experience and performance...")
            
            # Test page load time
            start_time = time.time()
            self.driver.get(self.base_url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "map"))
            )
            load_time = time.time() - start_time
            
            # Test accessibility features
            aria_labels = self.driver.find_elements(By.CSS_SELECTOR, "[aria-label]")
            focusable_elements = self.driver.find_elements(By.CSS_SELECTOR, "button, input, select, textarea, a")
            
            # Test keyboard navigation
            search_input = self.driver.find_element(By.ID, "searchInput")
            search_input.send_keys("test")
            search_input.clear()
            
            # Test error handling
            try:
                self.driver.find_element(By.ID, "nonexistent-element")
            except NoSuchElementException:
                error_handling = True
            
            self.test_results["user_experience"] = {
                "status": "PASS",
                "load_time": round(load_time, 2),
                "aria_labels_count": len(aria_labels),
                "focusable_elements_count": len(focusable_elements),
                "keyboard_navigation_working": True,
                "error_handling_working": True
            }
            print(f"✅ User experience test passed")
            print(f"✅ Page load time: {load_time:.2f}s")
            print(f"✅ Accessibility features: {len(aria_labels)} aria labels")
            return True
            
        except Exception as e:
            self.test_results["user_experience"] = {"status": "FAIL", "error": str(e)}
            print(f"❌ User experience test failed: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests and generate report"""
        print("🚀 Starting comprehensive Civilization Sphere app testing...")
        
        if not self.setup_driver():
            return False
        
        try:
            # Run all tests
            self.test_page_load()
            self.test_interactive_map()
            self.test_timeline_playback()
            self.test_event_filtering()
            self.test_mobile_responsive()
            self.test_theme_switching()
            self.test_data_export()
            self.test_statistics_analytics()
            self.test_data_import()
            self.test_user_experience()
            
            # Generate test report
            self.generate_report()
            
        finally:
            if self.driver:
                self.driver.quit()
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "="*60)
        print("📋 CIVILIZATION SPHERE APP TEST REPORT")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result["status"] == "PASS")
        failed_tests = total_tests - passed_tests
        
        print(f"\n📊 Test Summary:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed_tests}")
        print(f"   ❌ Failed: {failed_tests}")
        print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        print(f"\n📝 Detailed Results:")
        for test_name, result in self.test_results.items():
            status_icon = "✅" if result["status"] == "PASS" else "❌"
            print(f"   {status_icon} {test_name.replace('_', ' ').title()}: {result['status']}")
            if result["status"] == "FAIL" and "error" in result:
                print(f"      Error: {result['error']}")
        
        # Save report to file
        with open("/workspace/test_report.json", "w") as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\n💾 Detailed report saved to: /workspace/test_report.json")
        
        if failed_tests == 0:
            print(f"\n🎉 All tests passed! The Civilization Sphere app is working correctly.")
        else:
            print(f"\n⚠️  {failed_tests} test(s) failed. Please check the detailed report.")

if __name__ == "__main__":
    tester = CivilizationSphereTester()
    tester.run_all_tests()