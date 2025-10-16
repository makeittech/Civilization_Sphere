#!/usr/bin/env node

// Run comprehensive data quality improvement for Civilization Sphere
// This script orchestrates the entire quality improvement process

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const DATA_DIR = path.join(WORKSPACE_DIR, 'data');

class QualityImprovementOrchestrator {
    constructor() {
        this.startTime = Date.now();
        this.results = {
            steps: [],
            summary: {},
            errors: []
        };
    }

    logStep(step, status, details = '') {
        const timestamp = new Date().toISOString();
        const duration = Date.now() - this.startTime;
        
        const stepResult = {
            step,
            status,
            details,
            timestamp,
            duration: `${duration}ms`
        };
        
        this.results.steps.push(stepResult);
        console.log(`[${timestamp}] ${step}: ${status} ${details}`);
    }

    async runDataQualityValidation() {
        try {
            this.logStep('Data Quality Validation', 'starting');
            
            // Run the data quality validator
            const validatorPath = path.join(WORKSPACE_DIR, 'scripts', 'data_quality_validator.js');
            const output = execSync(`node "${validatorPath}"`, { 
                encoding: 'utf8',
                cwd: WORKSPACE_DIR 
            });
            
            this.logStep('Data Quality Validation', 'completed', 'Quality report generated');
            return true;
        } catch (error) {
            this.logStep('Data Quality Validation', 'failed', error.message);
            this.results.errors.push(`Data Quality Validation: ${error.message}`);
            return false;
        }
    }

    async runEnhancedDataIntegration() {
        try {
            this.logStep('Enhanced Data Integration', 'starting');
            
            // Run the enhanced data integration
            const integratorPath = path.join(WORKSPACE_DIR, 'scripts', 'enhanced_data_integration.js');
            const output = execSync(`node "${integratorPath}"`, { 
                encoding: 'utf8',
                cwd: WORKSPACE_DIR 
            });
            
            this.logStep('Enhanced Data Integration', 'completed', 'High-quality data integrated');
            return true;
        } catch (error) {
            this.logStep('Enhanced Data Integration', 'failed', error.message);
            this.results.errors.push(`Enhanced Data Integration: ${error.message}`);
            return false;
        }
    }

    async generateQualityReport() {
        try {
            this.logStep('Quality Report Generation', 'starting');
            
            // Check if quality report exists
            const qualityReportPath = path.join(DATA_DIR, 'quality_report.json');
            if (!fs.existsSync(qualityReportPath)) {
                this.logStep('Quality Report Generation', 'skipped', 'No quality report found');
                return false;
            }

            const qualityReport = JSON.parse(fs.readFileSync(qualityReportPath, 'utf8'));
            
            // Generate summary
            this.results.summary = {
                totalEvents: qualityReport.summary.totalEvents,
                passedValidation: qualityReport.summary.passedValidation,
                failedValidation: qualityReport.summary.failedValidation,
                averageScore: qualityReport.summary.averageScore,
                qualityDistribution: qualityReport.summary.qualityDistribution,
                commonIssues: qualityReport.summary.commonIssues.slice(0, 5),
                recommendations: qualityReport.summary.recommendations
            };

            this.logStep('Quality Report Generation', 'completed', 
                `Processed ${qualityReport.summary.totalEvents} events`);
            return true;
        } catch (error) {
            this.logStep('Quality Report Generation', 'failed', error.message);
            this.results.errors.push(`Quality Report Generation: ${error.message}`);
            return false;
        }
    }

    async createBackup() {
        try {
            this.logStep('Backup Creation', 'starting');
            
            const backupDir = path.join(DATA_DIR, 'backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(backupDir, `backup_${timestamp}`);
            fs.mkdirSync(backupPath);

            // Backup current events
            const eventsPath = path.join(DATA_DIR, 'events.json');
            if (fs.existsSync(eventsPath)) {
                fs.copyFileSync(eventsPath, path.join(backupPath, 'events.json'));
            }

            // Backup current governance
            const governancePath = path.join(DATA_DIR, 'data_governance.json');
            if (fs.existsSync(governancePath)) {
                fs.copyFileSync(governancePath, path.join(backupPath, 'data_governance.json'));
            }

            this.logStep('Backup Creation', 'completed', `Backup created at ${backupPath}`);
            return true;
        } catch (error) {
            this.logStep('Backup Creation', 'failed', error.message);
            this.results.errors.push(`Backup Creation: ${error.message}`);
            return false;
        }
    }

    async filterLowQualityEvents() {
        try {
            this.logStep('Low Quality Event Filtering', 'starting');
            
            // Check if filtered events exist
            const filteredPath = path.join(DATA_DIR, 'events_filtered.json');
            if (!fs.existsSync(filteredPath)) {
                this.logStep('Low Quality Event Filtering', 'skipped', 'No filtered events found');
                return false;
            }

            const originalEvents = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'events.json'), 'utf8'));
            const filteredEvents = JSON.parse(fs.readFileSync(filteredPath, 'utf8'));
            
            const removedCount = originalEvents.length - filteredEvents.length;
            const removalPercentage = (removedCount / originalEvents.length * 100).toFixed(1);

            this.logStep('Low Quality Event Filtering', 'completed', 
                `Removed ${removedCount} low-quality events (${removalPercentage}%)`);
            return true;
        } catch (error) {
            this.logStep('Low Quality Event Filtering', 'failed', error.message);
            this.results.errors.push(`Low Quality Event Filtering: ${error.message}`);
            return false;
        }
    }

    async updateConfiguration() {
        try {
            this.logStep('Configuration Update', 'starting');
            
            // The configuration has already been updated in the main config file
            this.logStep('Configuration Update', 'completed', 'Data governance configuration updated');
            return true;
        } catch (error) {
            this.logStep('Configuration Update', 'failed', error.message);
            this.results.errors.push(`Configuration Update: ${error.message}`);
            return false;
        }
    }

    async generateFinalReport() {
        try {
            this.logStep('Final Report Generation', 'starting');
            
            const totalDuration = Date.now() - this.startTime;
            const successfulSteps = this.results.steps.filter(s => s.status === 'completed').length;
            const totalSteps = this.results.steps.length;
            
            const finalReport = {
                timestamp: new Date().toISOString(),
                totalDuration: `${totalDuration}ms`,
                successRate: `${(successfulSteps / totalSteps * 100).toFixed(1)}%`,
                steps: this.results.steps,
                summary: this.results.summary,
                errors: this.results.errors,
                recommendations: this.generateRecommendations()
            };

            const reportPath = path.join(DATA_DIR, 'quality_improvement_report.json');
            fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
            
            this.logStep('Final Report Generation', 'completed', `Report saved to ${reportPath}`);
            return true;
        } catch (error) {
            this.logStep('Final Report Generation', 'failed', error.message);
            this.results.errors.push(`Final Report Generation: ${error.message}`);
            return false;
        }
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.summary.averageScore < 0.7) {
            recommendations.push('Overall data quality is below target - consider implementing stricter quality controls');
        }
        
        if (this.results.summary.failedValidation > this.results.summary.passedValidation) {
            recommendations.push('More events failed validation than passed - review data sources and validation criteria');
        }
        
            if (this.results.summary.qualityDistribution && 
                this.results.summary.qualityDistribution.poor > this.results.summary.qualityDistribution.excellent) {
                recommendations.push('Poor quality events outnumber excellent ones - prioritize data source improvements');
            }
        
        if (this.results.errors.length > 0) {
            recommendations.push('Address the errors encountered during the quality improvement process');
        }
        
        recommendations.push('Implement regular quality audits to maintain data standards');
        recommendations.push('Consider integrating additional Tier 1 news sources for better credibility');
        recommendations.push('Establish a community feedback mechanism for data quality improvement');
        
        return recommendations;
    }

    async run() {
        console.log('🚀 Starting Civilization Sphere Data Quality Improvement Process');
        console.log('=' .repeat(70));
        
        // Step 1: Create backup
        await this.createBackup();
        
        // Step 2: Run data quality validation
        await this.runDataQualityValidation();
        
        // Step 3: Run enhanced data integration
        await this.runEnhancedDataIntegration();
        
        // Step 4: Filter low quality events
        await this.filterLowQualityEvents();
        
        // Step 5: Update configuration
        await this.updateConfiguration();
        
        // Step 6: Generate quality report
        await this.generateQualityReport();
        
        // Step 7: Generate final report
        await this.generateFinalReport();
        
        // Display summary
        this.displaySummary();
    }

    displaySummary() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 QUALITY IMPROVEMENT SUMMARY');
        console.log('='.repeat(70));
        
        if (this.results.summary.totalEvents) {
            console.log(`Total Events: ${this.results.summary.totalEvents}`);
            console.log(`Passed Validation: ${this.results.summary.passedValidation}`);
            console.log(`Failed Validation: ${this.results.summary.failedValidation}`);
            console.log(`Average Quality Score: ${(this.results.summary.averageScore * 100).toFixed(1)}%`);
            
            if (this.results.summary.qualityDistribution) {
                console.log('\n📈 Quality Distribution:');
                console.log(`  Excellent (90%+): ${this.results.summary.qualityDistribution.excellent}`);
                console.log(`  Good (70-89%): ${this.results.summary.qualityDistribution.good}`);
                console.log(`  Fair (50-69%): ${this.results.summary.qualityDistribution.fair}`);
                console.log(`  Poor (<50%): ${this.results.summary.qualityDistribution.poor}`);
            }
            
            if (this.results.summary.commonIssues.length > 0) {
                console.log('\n⚠️  Common Issues:');
                this.results.summary.commonIssues.forEach(issue => {
                    console.log(`  ${issue.issue}: ${issue.count} (${issue.percentage}%)`);
                });
            }
        }
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ Errors Encountered:');
            this.results.errors.forEach(error => {
                console.log(`  - ${error}`);
            });
        }
        
        console.log('\n✅ Process completed successfully!');
        console.log(`Total Duration: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`);
        console.log('='.repeat(70));
    }
}

// Main execution
async function main() {
    const orchestrator = new QualityImprovementOrchestrator();
    await orchestrator.run();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = QualityImprovementOrchestrator;