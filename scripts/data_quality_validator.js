#!/usr/bin/env node

// Enhanced Data Quality Validator for Civilization Sphere
// Implements comprehensive quality checks and source credibility validation

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const DATA_DIR = path.join(WORKSPACE_DIR, 'data');
const EVENTS_JSON_PATH = path.join(DATA_DIR, 'events.json');
const GOVERNANCE_JSON_PATH = path.join(DATA_DIR, 'data_governance.json');
const QUALITY_REPORT_PATH = path.join(DATA_DIR, 'quality_report.json');

class DataQualityValidator {
    constructor() {
        this.governance = this.loadGovernance();
        this.events = this.loadEvents();
        this.qualityThresholds = this.governance.qualityThresholds;
        this.sourceCredibility = this.governance.sourceCredibility;
    }

    loadGovernance() {
        try {
            const governance = JSON.parse(fs.readFileSync(GOVERNANCE_JSON_PATH, 'utf8'));
            // Extract quality thresholds from the governance framework
            return {
                qualityThresholds: governance.governanceFramework?.qualityThresholds || this.getDefaultGovernance().qualityThresholds,
                sourceCredibility: governance.sourceCredibility || this.getDefaultGovernance().sourceCredibility
            };
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

    validateEvent(event) {
        const issues = [];
        const warnings = [];
        const score = { overall: 0, completeness: 0, accuracy: 0, credibility: 0 };

        // Completeness validation
        const completeness = this.validateCompleteness(event);
        score.completeness = completeness.score;
        issues.push(...completeness.issues);
        warnings.push(...completeness.warnings);

        // Accuracy validation
        const accuracy = this.validateAccuracy(event);
        score.accuracy = accuracy.score;
        issues.push(...accuracy.issues);
        warnings.push(...accuracy.warnings);

        // Credibility validation
        const credibility = this.validateCredibility(event);
        score.credibility = credibility.score;
        issues.push(...credibility.issues);
        warnings.push(...credibility.warnings);

        // Calculate overall score
        score.overall = (score.completeness * 0.4 + score.accuracy * 0.3 + score.credibility * 0.3);

        return {
            eventId: event.id || event.event_id,
            score,
            issues,
            warnings,
            passed: score.overall >= this.qualityThresholds.minimumConfidence,
            recommendations: this.generateRecommendations(event, issues, warnings)
        };
    }

    validateCompleteness(event) {
        const issues = [];
        const warnings = [];
        let completedFields = 0;
        const totalFields = this.qualityThresholds.requiredFields.length;

        for (const field of this.qualityThresholds.requiredFields) {
            if (event[field] && event[field].toString().trim() !== '') {
                completedFields++;
            } else {
                issues.push(`Missing required field: ${field}`);
            }
        }

        // Check for additional important fields
        if (!event.lat || !event.lng) {
            warnings.push('Missing geographic coordinates');
        }

        if (!event.description || event.description.length < 10) {
            warnings.push('Description too short or missing');
        }

        if (!event.region || event.region === 'Unspecified') {
            warnings.push('Region not specified');
        }

        const score = completedFields / totalFields;
        return { score, issues, warnings };
    }

    validateAccuracy(event) {
        const issues = [];
        const warnings = [];
        let score = 1.0;

        // Date validation
        if (event.date) {
            const eventDate = new Date(event.date);
            const now = new Date();
            const daysDiff = (now - eventDate) / (1000 * 60 * 60 * 24);

            if (isNaN(eventDate.getTime())) {
                issues.push('Invalid date format');
                score -= 0.3;
            } else if (daysDiff > this.qualityThresholds.maximumAge) {
                warnings.push(`Event is ${Math.round(daysDiff)} days old`);
                score -= 0.1;
            }
        }

        // Location validation
        if (event.lat && event.lng) {
            if (event.lat < -90 || event.lat > 90) {
                issues.push('Invalid latitude');
                score -= 0.2;
            }
            if (event.lng < -180 || event.lng > 180) {
                issues.push('Invalid longitude');
                score -= 0.2;
            }
        }

        // Title validation
        if (event.title) {
            if (event.title.length < 5) {
                issues.push('Title too short');
                score -= 0.2;
            }
            if (event.title.length > 200) {
                warnings.push('Title very long');
                score -= 0.1;
            }
        }

        return { score: Math.max(0, score), issues, warnings };
    }

    validateCredibility(event) {
        const issues = [];
        const warnings = [];
        let score = 0.5; // Default score

        // Find source credibility
        const sourceName = event.channel_name || event.source || 'Unknown';
        const sourceTier = this.findSourceTier(sourceName);

        if (sourceTier) {
            score = sourceTier.reliabilityScore / 100;
            
            if (sourceTier.verificationStatus === 'verified') {
                score += 0.1;
            } else if (sourceTier.verificationStatus === 'unverified') {
                score -= 0.2;
                warnings.push(`Source ${sourceName} is unverified`);
            }

            if (sourceTier.biasRating && sourceTier.biasRating !== 'neutral') {
                warnings.push(`Source ${sourceName} has ${sourceTier.biasRating} bias`);
            }
        } else {
            issues.push(`Unknown source: ${sourceName}`);
            score = 0.3;
        }

        // Check for source URL
        if (!event.source_url || event.source_url === '') {
            issues.push('Missing source URL');
            score -= 0.2;
        } else if (event.source_url && !this.isValidUrl(event.source_url)) {
            issues.push('Invalid source URL format');
            score -= 0.1;
        }

        return { score: Math.max(0, Math.min(1, score)), issues, warnings };
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

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    generateRecommendations(event, issues, warnings) {
        const recommendations = [];

        if (issues.some(i => i.includes('Missing required field'))) {
            recommendations.push('Complete all required fields before publishing');
        }

        if (warnings.some(w => w.includes('geographic coordinates'))) {
            recommendations.push('Add precise geographic coordinates for better mapping');
        }

        if (warnings.some(w => w.includes('unverified'))) {
            recommendations.push('Verify source credibility through fact-checking');
        }

        if (issues.some(i => i.includes('source URL'))) {
            recommendations.push('Add valid source URL for transparency');
        }

        if (warnings.some(w => w.includes('bias'))) {
            recommendations.push('Consider bias when interpreting this information');
        }

        return recommendations;
    }

    generateQualityReport() {
        const results = this.events.map(event => this.validateEvent(event));
        
        const summary = {
            totalEvents: this.events.length,
            passedValidation: results.filter(r => r.passed).length,
            failedValidation: results.filter(r => !r.passed).length,
            averageScore: results.reduce((sum, r) => sum + r.score.overall, 0) / results.length,
            qualityDistribution: {
                excellent: results.filter(r => r.score.overall >= 0.9).length,
                good: results.filter(r => r.score.overall >= 0.7 && r.score.overall < 0.9).length,
                fair: results.filter(r => r.score.overall >= 0.5 && r.score.overall < 0.7).length,
                poor: results.filter(r => r.score.overall < 0.5).length
            },
            commonIssues: this.analyzeCommonIssues(results),
            sourceCredibilityBreakdown: this.analyzeSourceCredibility(results),
            recommendations: this.generateSystemRecommendations(results)
        };

        return {
            timestamp: new Date().toISOString(),
            summary,
            detailedResults: results,
            governanceVersion: this.governance.version || '1.0.0'
        };
    }

    analyzeCommonIssues(results) {
        const issueCounts = {};
        results.forEach(result => {
            result.issues.forEach(issue => {
                const key = issue.split(':')[0]; // Get issue category
                issueCounts[key] = (issueCounts[key] || 0) + 1;
            });
        });

        return Object.entries(issueCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([issue, count]) => ({ issue, count, percentage: (count / results.length * 100).toFixed(1) }));
    }

    analyzeSourceCredibility(results) {
        const credibilityBreakdown = { tier1: 0, tier2: 0, tier3: 0, unknown: 0 };
        
        results.forEach(result => {
            const event = this.events.find(e => (e.id || e.event_id) === result.eventId);
            if (event) {
                const sourceTier = this.findSourceTier(event.channel_name || event.source || 'Unknown');
                if (sourceTier) {
                    credibilityBreakdown[sourceTier.tier]++;
                } else {
                    credibilityBreakdown.unknown++;
                }
            }
        });

        return credibilityBreakdown;
    }

    generateSystemRecommendations(results) {
        const recommendations = [];
        const failedCount = results.filter(r => !r.passed).length;
        const totalCount = results.length;

        if (failedCount / totalCount > 0.3) {
            recommendations.push('High failure rate detected - consider lowering quality thresholds or improving data sources');
        }

        const avgScore = results.reduce((sum, r) => sum + r.score.overall, 0) / results.length;
        if (avgScore < 0.6) {
            recommendations.push('Overall quality score is low - implement comprehensive data improvement plan');
        }

        const unknownSources = results.filter(r => 
            r.issues.some(i => i.includes('Unknown source'))
        ).length;
        if (unknownSources / totalCount > 0.2) {
            recommendations.push('Many unknown sources - expand source credibility database');
        }

        return recommendations;
    }

    saveQualityReport(report) {
        fs.writeFileSync(QUALITY_REPORT_PATH, JSON.stringify(report, null, 2));
        console.log(`Quality report saved to ${QUALITY_REPORT_PATH}`);
    }

    filterHighQualityEvents() {
        const results = this.events.map(event => this.validateEvent(event));
        const highQualityEvents = results
            .filter(result => result.passed)
            .map(result => this.events.find(e => (e.id || e.event_id) === result.eventId))
            .filter(Boolean);

        return highQualityEvents;
    }

    generateFilteredDataset() {
        const highQualityEvents = this.filterHighQualityEvents();
        const filteredPath = path.join(DATA_DIR, 'events_filtered.json');
        
        fs.writeFileSync(filteredPath, JSON.stringify(highQualityEvents, null, 2));
        console.log(`Filtered dataset saved to ${filteredPath}`);
        console.log(`Filtered ${this.events.length} events down to ${highQualityEvents.length} high-quality events`);
        
        return highQualityEvents;
    }
}

// Main execution
async function main() {
    const validator = new DataQualityValidator();
    
    console.log('Starting data quality validation...');
    const report = validator.generateQualityReport();
    
    console.log('\n=== QUALITY SUMMARY ===');
    console.log(`Total Events: ${report.summary.totalEvents}`);
    console.log(`Passed Validation: ${report.summary.passedValidation}`);
    console.log(`Failed Validation: ${report.summary.failedValidation}`);
    console.log(`Average Score: ${(report.summary.averageScore * 100).toFixed(1)}%`);
    
    console.log('\n=== QUALITY DISTRIBUTION ===');
    console.log(`Excellent (90%+): ${report.summary.qualityDistribution.excellent}`);
    console.log(`Good (70-89%): ${report.summary.qualityDistribution.good}`);
    console.log(`Fair (50-69%): ${report.summary.qualityDistribution.fair}`);
    console.log(`Poor (<50%): ${report.summary.qualityDistribution.poor}`);
    
    console.log('\n=== COMMON ISSUES ===');
    report.summary.commonIssues.slice(0, 5).forEach(issue => {
        console.log(`${issue.issue}: ${issue.count} (${issue.percentage}%)`);
    });
    
    console.log('\n=== SOURCE CREDIBILITY ===');
    Object.entries(report.summary.sourceCredibilityBreakdown).forEach(([tier, count]) => {
        console.log(`${tier}: ${count}`);
    });
    
    console.log('\n=== SYSTEM RECOMMENDATIONS ===');
    report.summary.recommendations.forEach(rec => {
        console.log(`- ${rec}`);
    });
    
    // Save quality report
    validator.saveQualityReport(report);
    
    // Generate filtered dataset
    console.log('\n=== GENERATING FILTERED DATASET ===');
    validator.generateFilteredDataset();
    
    console.log('\nData quality validation completed!');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = DataQualityValidator;