/**
 * Code Quality Analysis
 * Task 8: Kod Kalitesi İyileştirme
 * 
 * Analyzes:
 * - Function complexity
 * - Code duplication
 * - Gas optimization opportunities
 * - Code quality metrics
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Code Quality Analysis\n');
console.log('Task 8: Kod Kalitesi İyileştirme\n');

// Read SylvanToken contract
const contractPath = path.join(process.cwd(), 'contracts/SylvanToken.sol');
const contractCode = fs.readFileSync(contractPath, 'utf8');

// Analyze contract
const analysis = {
    complexity: analyzeComplexity(contractCode),
    duplication: analyzeDuplication(contractCode),
    gasOptimization: analyzeGasOptimization(contractCode),
    codeQuality: analyzeCodeQuality(contractCode)
};

// Print results
printComplexityAnalysis(analysis.complexity);
printDuplicationAnalysis(analysis.duplication);
printGasOptimizationAnalysis(analysis.gasOptimization);
printCodeQualityAnalysis(analysis.codeQuality);

// Generate report
generateReport(analysis);

console.log('\n✅ Code Quality Analysis Complete!\n');

// Analysis Functions
function analyzeComplexity(code) {
    const functions = extractFunctions(code);
    const complexityScores = functions.map(func => ({
        name: func.name,
        lines: func.lines,
        complexity: calculateComplexity(func.code),
        rating: getComplexityRating(calculateComplexity(func.code))
    }));
    
    return {
        totalFunctions: functions.length,
        averageComplexity: complexityScores.reduce((sum, f) => sum + f.complexity, 0) / functions.length,
        highComplexity: complexityScores.filter(f => f.complexity > 10),
        functions: complexityScores.sort((a, b) => b.complexity - a.complexity).slice(0, 10)
    };
}

function analyzeDuplication(code) {
    // Simple duplication detection
    const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
    const duplicates = [];
    const seen = new Map();
    
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.length > 20) { // Only check substantial lines
            if (seen.has(trimmed)) {
                seen.get(trimmed).push(index + 1);
            } else {
                seen.set(trimmed, [index + 1]);
            }
        }
    });
    
    seen.forEach((lineNumbers, line) => {
        if (lineNumbers.length > 1) {
            duplicates.push({ line: line.substring(0, 60), count: lineNumbers.length, lines: lineNumbers });
        }
    });
    
    return {
        totalDuplicates: duplicates.length,
        duplicates: duplicates.sort((a, b) => b.count - a.count).slice(0, 5)
    };
}

function analyzeGasOptimization(code) {
    const opportunities = [];
    
    // Check for storage reads in loops
    if (code.match(/for\s*\([^)]+\)\s*\{[^}]*\.\w+\[/g)) {
        opportunities.push({
            type: 'Storage reads in loops',
            severity: 'MEDIUM',
            suggestion: 'Cache storage variables before loop'
        });
    }
    
    // Check for repeated external calls
    const externalCalls = code.match(/\w+\.\w+\([^)]*\)/g) || [];
    if (externalCalls.length > 50) {
        opportunities.push({
            type: 'Multiple external calls',
            severity: 'LOW',
            suggestion: 'Consider batching operations'
        });
    }
    
    // Check for string usage
    if (code.match(/string\s+\w+/g)) {
        opportunities.push({
            type: 'String usage detected',
            severity: 'LOW',
            suggestion: 'Consider using bytes32 for fixed strings'
        });
    }
    
    return {
        totalOpportunities: opportunities.length,
        opportunities: opportunities
    };
}

function analyzeCodeQuality(code) {
    const lines = code.split('\n');
    const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('//')).length;
    const commentLines = lines.filter(l => l.trim().startsWith('//')).length;
    const blankLines = lines.filter(l => !l.trim()).length;
    
    return {
        totalLines: lines.length,
        codeLines: codeLines,
        commentLines: commentLines,
        blankLines: blankLines,
        commentRatio: (commentLines / codeLines * 100).toFixed(2) + '%',
        functions: extractFunctions(code).length,
        averageFunctionLength: (codeLines / extractFunctions(code).length).toFixed(0)
    };
}

// Helper Functions
function extractFunctions(code) {
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)[^{]*\{/g;
    const functions = [];
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
        const startIndex = match.index;
        const endIndex = findClosingBrace(code, startIndex + match[0].length);
        const functionCode = code.substring(startIndex, endIndex);
        const lines = functionCode.split('\n').length;
        
        functions.push({
            name: match[1],
            code: functionCode,
            lines: lines
        });
    }
    
    return functions;
}

function findClosingBrace(code, startIndex) {
    let braceCount = 1;
    for (let i = startIndex; i < code.length; i++) {
        if (code[i] === '{') braceCount++;
        if (code[i] === '}') braceCount--;
        if (braceCount === 0) return i + 1;
    }
    return code.length;
}

function calculateComplexity(code) {
    // Simple cyclomatic complexity
    let complexity = 1;
    complexity += (code.match(/if\s*\(/g) || []).length;
    complexity += (code.match(/for\s*\(/g) || []).length;
    complexity += (code.match(/while\s*\(/g) || []).length;
    complexity += (code.match(/\&\&/g) || []).length;
    complexity += (code.match(/\|\|/g) || []).length;
    return complexity;
}

function getComplexityRating(complexity) {
    if (complexity <= 5) return 'LOW';
    if (complexity <= 10) return 'MEDIUM';
    return 'HIGH';
}

// Print Functions
function printComplexityAnalysis(analysis) {
    console.log('📊 Complexity Analysis\n');
    console.log(`   Total Functions: ${analysis.totalFunctions}`);
    console.log(`   Average Complexity: ${analysis.averageComplexity.toFixed(2)}`);
    console.log(`   High Complexity Functions: ${analysis.highComplexity.length}\n`);
    
    if (analysis.functions.length > 0) {
        console.log('   Top 5 Most Complex Functions:');
        analysis.functions.slice(0, 5).forEach((func, i) => {
            console.log(`   ${i + 1}. ${func.name} - Complexity: ${func.complexity} (${func.rating}) - ${func.lines} lines`);
        });
        console.log('');
    }
}

function printDuplicationAnalysis(analysis) {
    console.log('🔄 Code Duplication Analysis\n');
    console.log(`   Total Duplicate Lines: ${analysis.totalDuplicates}\n`);
    
    if (analysis.duplicates.length > 0) {
        console.log('   Top Duplicates:');
        analysis.duplicates.forEach((dup, i) => {
            console.log(`   ${i + 1}. "${dup.line}..." - ${dup.count} occurrences`);
        });
        console.log('');
    }
}

function printGasOptimizationAnalysis(analysis) {
    console.log('⛽ Gas Optimization Opportunities\n');
    console.log(`   Total Opportunities: ${analysis.totalOpportunities}\n`);
    
    if (analysis.opportunities.length > 0) {
        analysis.opportunities.forEach((opp, i) => {
            console.log(`   ${i + 1}. [${opp.severity}] ${opp.type}`);
            console.log(`      Suggestion: ${opp.suggestion}`);
        });
        console.log('');
    }
}

function printCodeQualityAnalysis(analysis) {
    console.log('✨ Code Quality Metrics\n');
    console.log(`   Total Lines: ${analysis.totalLines}`);
    console.log(`   Code Lines: ${analysis.codeLines}`);
    console.log(`   Comment Lines: ${analysis.commentLines}`);
    console.log(`   Comment Ratio: ${analysis.commentRatio}`);
    console.log(`   Total Functions: ${analysis.functions}`);
    console.log(`   Avg Function Length: ${analysis.averageFunctionLength} lines\n`);
}

function generateReport(analysis) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalFunctions: analysis.complexity.totalFunctions,
            averageComplexity: analysis.complexity.averageComplexity,
            highComplexityCount: analysis.complexity.highComplexity.length,
            duplicateLines: analysis.duplication.totalDuplicates,
            gasOpportunities: analysis.gasOptimization.totalOpportunities,
            commentRatio: analysis.codeQuality.commentRatio
        },
        details: analysis,
        recommendations: generateRecommendations(analysis)
    };
    
    // Save report
    const reportDir = path.join(process.cwd(), 'analysis-reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.join(reportDir, 'code-quality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Report saved: ${reportPath}\n`);
}

function generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.complexity.highComplexity.length > 0) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Complexity',
            message: `${analysis.complexity.highComplexity.length} functions have high complexity. Consider refactoring.`
        });
    }
    
    if (analysis.duplication.totalDuplicates > 10) {
        recommendations.push({
            priority: 'LOW',
            category: 'Duplication',
            message: 'Some code duplication detected. Consider extracting common patterns.'
        });
    }
    
    if (analysis.gasOptimization.totalOpportunities > 0) {
        recommendations.push({
            priority: 'LOW',
            category: 'Gas Optimization',
            message: `${analysis.gasOptimization.totalOpportunities} gas optimization opportunities found.`
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            priority: 'INFO',
            category: 'Quality',
            message: 'Code quality is good. No major issues detected.'
        });
    }
    
    return recommendations;
}

