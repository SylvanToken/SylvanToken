/**
 * @title Test Performance Utilities
 * @dev Utilities for measuring and optimizing test execution performance
 */

const { performance } = require('perf_hooks');

/**
 * Performance tracking for test suites
 */
class TestPerformanceTracker {
    constructor() {
        this.suiteTimings = new Map();
        this.testTimings = new Map();
        this.startTime = null;
    }

    /**
     * Start tracking overall test execution
     */
    startTracking() {
        this.startTime = performance.now();
    }

    /**
     * Record suite execution time
     * @param {string} suiteName - Name of the test suite
     * @param {number} duration - Duration in milliseconds
     */
    recordSuite(suiteName, duration) {
        this.suiteTimings.set(suiteName, duration);
    }

    /**
     * Record individual test execution time
     * @param {string} testName - Name of the test
     * @param {number} duration - Duration in milliseconds
     */
    recordTest(testName, duration) {
        this.testTimings.set(testName, duration);
    }

    /**
     * Get total execution time
     * @returns {number} Total time in milliseconds
     */
    getTotalTime() {
        if (!this.startTime) return 0;
        return performance.now() - this.startTime;
    }

    /**
     * Get slowest test suites
     * @param {number} count - Number of suites to return
     * @returns {Array} Array of [suiteName, duration] tuples
     */
    getSlowestSuites(count = 10) {
        return Array.from(this.suiteTimings.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count);
    }

    /**
     * Get slowest tests
     * @param {number} count - Number of tests to return
     * @returns {Array} Array of [testName, duration] tuples
     */
    getSlowestTests(count = 10) {
        return Array.from(this.testTimings.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count);
    }

    /**
     * Generate performance report
     * @returns {Object} Performance report
     */
    generateReport() {
        const totalTime = this.getTotalTime();
        const avgSuiteTime = Array.from(this.suiteTimings.values())
            .reduce((sum, time) => sum + time, 0) / this.suiteTimings.size;
        
        return {
            totalTime: (totalTime / 1000).toFixed(2) + 's',
            totalSuites: this.suiteTimings.size,
            totalTests: this.testTimings.size,
            avgSuiteTime: (avgSuiteTime / 1000).toFixed(2) + 's',
            slowestSuites: this.getSlowestSuites(5).map(([name, time]) => ({
                name,
                time: (time / 1000).toFixed(2) + 's'
            })),
            slowestTests: this.getSlowestTests(5).map(([name, time]) => ({
                name,
                time: (time / 1000).toFixed(2) + 's'
            }))
        };
    }

    /**
     * Print performance report to console
     */
    printReport() {
        const report = this.generateReport();
        
        console.log('\n=== Test Performance Report ===');
        console.log(`Total Execution Time: ${report.totalTime}`);
        console.log(`Total Suites: ${report.totalSuites}`);
        console.log(`Total Tests: ${report.totalTests}`);
        console.log(`Average Suite Time: ${report.avgSuiteTime}`);
        
        console.log('\nSlowest Test Suites:');
        report.slowestSuites.forEach((suite, index) => {
            console.log(`  ${index + 1}. ${suite.name}: ${suite.time}`);
        });
        
        console.log('\nSlowest Tests:');
        report.slowestTests.forEach((test, index) => {
            console.log(`  ${index + 1}. ${test.name}: ${test.time}`);
        });
        
        console.log('================================\n');
    }
}

/**
 * Measure execution time of an async function
 * @param {Function} fn - Async function to measure
 * @returns {Promise<{result: any, duration: number}>} Result and duration
 */
async function measureAsync(fn) {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    return { result, duration };
}

/**
 * Create a performance-optimized test wrapper
 * @param {string} description - Test description
 * @param {Function} testFn - Test function
 * @param {TestPerformanceTracker} tracker - Performance tracker instance
 * @returns {Function} Wrapped test function
 */
function performanceTest(description, testFn, tracker) {
    return async function() {
        const start = performance.now();
        try {
            await testFn.call(this);
        } finally {
            const duration = performance.now() - start;
            tracker.recordTest(description, duration);
        }
    };
}

/**
 * Batch operations helper for reducing transaction overhead
 * @param {Array<Function>} operations - Array of async operations
 * @param {number} batchSize - Number of operations per batch
 * @returns {Promise<Array>} Results of all operations
 */
async function batchOperations(operations, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(op => op()));
        results.push(...batchResults);
    }
    
    return results;
}

/**
 * Cache deployment results to avoid redundant deployments
 */
class DeploymentCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get cached deployment or create new one
     * @param {string} key - Cache key
     * @param {Function} deployFn - Deployment function
     * @returns {Promise<any>} Deployment result
     */
    async getOrDeploy(key, deployFn) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const result = await deployFn();
        this.cache.set(key, result);
        return result;
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache size
     * @returns {number} Number of cached items
     */
    size() {
        return this.cache.size;
    }
}

/**
 * Optimize test execution by grouping similar tests
 * @param {Array<Object>} tests - Array of test objects with {name, fn, setup}
 * @returns {Promise<void>}
 */
async function optimizedTestExecution(tests) {
    // Group tests by setup requirements
    const groups = new Map();
    
    tests.forEach(test => {
        const setupKey = test.setup || 'default';
        if (!groups.has(setupKey)) {
            groups.set(setupKey, []);
        }
        groups.get(setupKey).push(test);
    });
    
    // Execute each group with shared setup
    for (const [setupKey, groupTests] of groups) {
        let setupResult = null;
        
        // Run setup once for the group
        if (groupTests[0].setup) {
            setupResult = await groupTests[0].setup();
        }
        
        // Execute all tests in the group
        for (const test of groupTests) {
            await test.fn(setupResult);
        }
    }
}

/**
 * Memory usage tracker
 */
class MemoryTracker {
    constructor() {
        this.snapshots = [];
    }

    /**
     * Take memory snapshot
     * @param {string} label - Snapshot label
     */
    snapshot(label) {
        const usage = process.memoryUsage();
        this.snapshots.push({
            label,
            timestamp: Date.now(),
            heapUsed: usage.heapUsed,
            heapTotal: usage.heapTotal,
            external: usage.external,
            rss: usage.rss
        });
    }

    /**
     * Get memory usage report
     * @returns {Object} Memory report
     */
    getReport() {
        if (this.snapshots.length === 0) return null;
        
        const first = this.snapshots[0];
        const last = this.snapshots[this.snapshots.length - 1];
        
        return {
            initial: this.formatBytes(first.heapUsed),
            final: this.formatBytes(last.heapUsed),
            delta: this.formatBytes(last.heapUsed - first.heapUsed),
            peak: this.formatBytes(Math.max(...this.snapshots.map(s => s.heapUsed))),
            snapshots: this.snapshots.map(s => ({
                label: s.label,
                heapUsed: this.formatBytes(s.heapUsed)
            }))
        };
    }

    /**
     * Format bytes to human-readable string
     * @param {number} bytes - Bytes to format
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        const mb = bytes / 1024 / 1024;
        return mb.toFixed(2) + ' MB';
    }

    /**
     * Print memory report
     */
    printReport() {
        const report = this.getReport();
        if (!report) {
            console.log('No memory snapshots available');
            return;
        }
        
        console.log('\n=== Memory Usage Report ===');
        console.log(`Initial: ${report.initial}`);
        console.log(`Final: ${report.final}`);
        console.log(`Delta: ${report.delta}`);
        console.log(`Peak: ${report.peak}`);
        console.log('===========================\n');
    }
}

module.exports = {
    TestPerformanceTracker,
    measureAsync,
    performanceTest,
    batchOperations,
    DeploymentCache,
    optimizedTestExecution,
    MemoryTracker
};
