#!/usr/bin/env node

/**
 * Data Quality Check Utility for Civilization Sphere
 * 
 * This script analyzes event data for quality issues:
 * - Missing coordinates (lat/lng)
 * - Missing dates or invalid date formats
 * - Missing categories or regions
 * - Events with low importance scores
 * - Duplicate events
 * - Missing sources
 * 
 * Usage: node scripts/data_quality_check.js [--fix] [--geocode]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    eventsPath: path.join(__dirname, '../data/events.json'),
    outputPath: path.join(__dirname, '../data/quality_report.json'),
    minImportance: 1,
    maxImportance: 10,
    requiredFields: ['id', 'title', 'date', 'category', 'region'],
    optionalButImportant: ['lat', 'lng', 'country', 'description', 'sources']
};

// Load events
function loadEvents() {
    try {
        const data = fs.readFileSync(CONFIG.eventsPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading events:', err.message);
        process.exit(1);
    }
}

// Save events
function saveEvents(events) {
    try {
        fs.writeFileSync(CONFIG.eventsPath, JSON.stringify(events, null, 2), 'utf8');
        console.log('✓ Events saved successfully');
    } catch (err) {
        console.error('Error saving events:', err.message);
    }
}

// Save quality report
function saveReport(report) {
    try {
        fs.writeFileSync(CONFIG.outputPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`✓ Quality report saved to ${CONFIG.outputPath}`);
    } catch (err) {
        console.error('Error saving report:', err.message);
    }
}

// Quality checks
class QualityChecker {
    constructor(events) {
        this.events = events;
        this.issues = {
            missingCoordinates: [],
            invalidDates: [],
            missingCategories: [],
            missingRegions: [],
            missingCountries: [],
            missingSources: [],
            lowImportance: [],
            invalidImportance: [],
            duplicateTitles: [],
            missingDescriptions: []
        };
        this.stats = {
            total: events.length,
            withCoordinates: 0,
            withDates: 0,
            withCategories: 0,
            withRegions: 0,
            withSources: 0,
            avgImportance: 0
        };
    }

    run() {
        console.log('\n🔍 Running data quality checks...\n');
        
        this.checkCoordinates();
        this.checkDates();
        this.checkCategories();
        this.checkRegions();
        this.checkSources();
        this.checkImportance();
        this.checkDuplicates();
        this.checkDescriptions();
        this.calculateStats();
        
        return this.generateReport();
    }

    checkCoordinates() {
        this.events.forEach((event, idx) => {
            const hasLat = typeof event.lat === 'number' && !isNaN(event.lat);
            const hasLng = typeof event.lng === 'number' && !isNaN(event.lng);
            
            if (!hasLat || !hasLng || event.lat === 0 && event.lng === 0) {
                this.issues.missingCoordinates.push({
                    index: idx,
                    id: event.id,
                    title: event.title,
                    country: event.country,
                    location: event.location || event.place
                });
            } else {
                this.stats.withCoordinates++;
            }
        });
    }

    checkDates() {
        this.events.forEach((event, idx) => {
            if (!event.date) {
                this.issues.invalidDates.push({
                    index: idx,
                    id: event.id,
                    title: event.title,
                    issue: 'Missing date'
                });
            } else {
                const date = new Date(event.date);
                if (isNaN(date.getTime())) {
                    this.issues.invalidDates.push({
                        index: idx,
                        id: event.id,
                        title: event.title,
                        date: event.date,
                        issue: 'Invalid date format'
                    });
                } else {
                    this.stats.withDates++;
                }
            }
        });
    }

    checkCategories() {
        this.events.forEach((event, idx) => {
            if (!event.category || event.category.trim() === '') {
                this.issues.missingCategories.push({
                    index: idx,
                    id: event.id,
                    title: event.title
                });
            } else {
                this.stats.withCategories++;
            }
        });
    }

    checkRegions() {
        this.events.forEach((event, idx) => {
            if (!event.region || event.region.trim() === '') {
                this.issues.missingRegions.push({
                    index: idx,
                    id: event.id,
                    title: event.title,
                    country: event.country
                });
            } else {
                this.stats.withRegions++;
            }
            
            if (!event.country || event.country.trim() === '') {
                this.issues.missingCountries.push({
                    index: idx,
                    id: event.id,
                    title: event.title
                });
            }
        });
    }

    checkSources() {
        this.events.forEach((event, idx) => {
            const hasSources = Array.isArray(event.sources) && event.sources.length > 0;
            const hasUrl = event.url || event.source_url;
            
            if (!hasSources && !hasUrl) {
                this.issues.missingSources.push({
                    index: idx,
                    id: event.id,
                    title: event.title
                });
            } else {
                this.stats.withSources++;
            }
        });
    }

    checkImportance() {
        let totalImportance = 0;
        let countWithImportance = 0;
        
        this.events.forEach((event, idx) => {
            const importance = event.importance;
            
            if (importance === undefined || importance === null) {
                this.issues.lowImportance.push({
                    index: idx,
                    id: event.id,
                    title: event.title,
                    issue: 'Missing importance score'
                });
            } else if (typeof importance !== 'number' || isNaN(importance)) {
                this.issues.invalidImportance.push({
                    index: idx,
                    id: event.id,
                    title: event.title,
                    importance: importance
                });
            } else if (importance < CONFIG.minImportance || importance > CONFIG.maxImportance) {
                this.issues.invalidImportance.push({
                    index: idx,
                    id: event.id,
                    title: event.title,
                    importance: importance,
                    issue: `Out of range (${CONFIG.minImportance}-${CONFIG.maxImportance})`
                });
            } else {
                totalImportance += importance;
                countWithImportance++;
                
                if (importance <= 3) {
                    this.issues.lowImportance.push({
                        index: idx,
                        id: event.id,
                        title: event.title,
                        importance: importance
                    });
                }
            }
        });
        
        this.stats.avgImportance = countWithImportance > 0 
            ? (totalImportance / countWithImportance).toFixed(2) 
            : 0;
    }

    checkDuplicates() {
        const titleMap = new Map();
        
        this.events.forEach((event, idx) => {
            const normalizedTitle = event.title?.toLowerCase().trim();
            if (!normalizedTitle) return;
            
            if (titleMap.has(normalizedTitle)) {
                const existing = titleMap.get(normalizedTitle);
                this.issues.duplicateTitles.push({
                    indices: [existing.index, idx],
                    ids: [existing.id, event.id],
                    title: event.title,
                    dates: [existing.date, event.date]
                });
            } else {
                titleMap.set(normalizedTitle, {
                    index: idx,
                    id: event.id,
                    date: event.date
                });
            }
        });
    }

    checkDescriptions() {
        this.events.forEach((event, idx) => {
            if (!event.description || event.description.trim().length < 20) {
                this.issues.missingDescriptions.push({
                    index: idx,
                    id: event.id,
                    title: event.title,
                    descLength: event.description?.length || 0
                });
            }
        });
    }

    calculateStats() {
        this.stats.completenessScore = (
            (this.stats.withCoordinates / this.stats.total) * 0.25 +
            (this.stats.withDates / this.stats.total) * 0.25 +
            (this.stats.withCategories / this.stats.total) * 0.15 +
            (this.stats.withRegions / this.stats.total) * 0.15 +
            (this.stats.withSources / this.stats.total) * 0.20
        ) * 100;
    }

    generateReport() {
        const totalIssues = Object.values(this.issues).reduce((sum, arr) => sum + arr.length, 0);
        
        return {
            timestamp: new Date().toISOString(),
            summary: {
                totalEvents: this.stats.total,
                totalIssues: totalIssues,
                completenessScore: this.stats.completenessScore.toFixed(2) + '%',
                avgImportance: this.stats.avgImportance
            },
            stats: this.stats,
            issues: this.issues,
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recs = [];
        
        if (this.issues.missingCoordinates.length > 0) {
            recs.push(`🗺️ ${this.issues.missingCoordinates.length} events missing coordinates - consider geocoding service`);
        }
        if (this.issues.invalidDates.length > 0) {
            recs.push(`📅 ${this.issues.invalidDates.length} events with invalid dates - needs manual review`);
        }
        if (this.issues.missingCategories.length > 0) {
            recs.push(`📂 ${this.issues.missingCategories.length} events missing categories - use ML classification`);
        }
        if (this.issues.missingSources.length > 0) {
            recs.push(`🔗 ${this.issues.missingSources.length} events missing sources - add provenance tracking`);
        }
        if (this.issues.duplicateTitles.length > 0) {
            recs.push(`⚠️ ${this.issues.duplicateTitles.length} potential duplicate events - review and merge`);
        }
        if (this.stats.completenessScore < 75) {
            recs.push(`📊 Overall completeness score is ${this.stats.completenessScore.toFixed(1)}% - target is 80%+`);
        }
        
        return recs;
    }
}

// Auto-fix utilities
class DataFixer {
    constructor(events, report) {
        this.events = events;
        this.report = report;
        this.fixes = 0;
    }

    async fixAll() {
        console.log('\n🔧 Attempting auto-fixes...\n');
        
        this.fixImportanceDefaults();
        this.fixDateFormats();
        this.fixEmptyStrings();
        
        console.log(`\n✓ Applied ${this.fixes} automatic fixes`);
        return this.events;
    }

    fixImportanceDefaults() {
        this.report.issues.lowImportance.forEach(issue => {
            const event = this.events[issue.index];
            if (!event.importance) {
                event.importance = 5; // Default to medium importance
                this.fixes++;
            }
        });
    }

    fixDateFormats() {
        this.report.issues.invalidDates.forEach(issue => {
            const event = this.events[issue.index];
            if (event.date && typeof event.date === 'string') {
                // Try to fix common date format issues
                const cleaned = event.date.trim();
                const date = new Date(cleaned);
                if (!isNaN(date.getTime())) {
                    event.date = date.toISOString();
                    this.fixes++;
                }
            }
        });
    }

    fixEmptyStrings() {
        this.events.forEach(event => {
            // Convert empty strings to null for optional fields
            ['description', 'country', 'location'].forEach(field => {
                if (event[field] === '') {
                    event[field] = null;
                    this.fixes++;
                }
            });
        });
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const shouldFix = args.includes('--fix');
    const shouldGeocode = args.includes('--geocode');

    console.log('╔════════════════════════════════════════╗');
    console.log('║  Civilization Sphere - Data Quality   ║');
    console.log('╚════════════════════════════════════════╝');

    const events = loadEvents();
    console.log(`\nLoaded ${events.length} events from ${CONFIG.eventsPath}`);

    const checker = new QualityChecker(events);
    const report = checker.run();

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('QUALITY REPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Events: ${report.summary.totalEvents}`);
    console.log(`Total Issues: ${report.summary.totalIssues}`);
    console.log(`Completeness Score: ${report.summary.completenessScore}`);
    console.log(`Average Importance: ${report.summary.avgImportance}`);
    console.log('='.repeat(50));

    console.log('\nISSUE BREAKDOWN:');
    Object.entries(report.issues).forEach(([type, issues]) => {
        if (issues.length > 0) {
            console.log(`  • ${type}: ${issues.length}`);
        }
    });

    if (report.recommendations.length > 0) {
        console.log('\nRECOMMENDATIONS:');
        report.recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    saveReport(report);

    // Auto-fix if requested
    if (shouldFix) {
        const fixer = new DataFixer(events, report);
        const fixedEvents = await fixer.fixAll();
        saveEvents(fixedEvents);
    }

    if (shouldGeocode) {
        console.log('\n⚠️ Geocoding feature requires online service - implement separately');
    }

    console.log('\n✓ Quality check complete!\n');
}

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}

module.exports = { QualityChecker, DataFixer };
