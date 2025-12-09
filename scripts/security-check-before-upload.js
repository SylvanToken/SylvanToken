/**
 * Security Check Script - GitHub Upload Öncesi Kontrol
 * Bu script, hassas bilgilerin kodda olmadığını doğrular
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔒 GitHub Upload Güvenlik Kontrolü Başlatılıyor...\n');

// Hassas pattern'ler
const sensitivePatterns = [
    {
        pattern: /DEPLOYER_PRIVATE_KEY\s*=\s*["'](?!YOUR_|TEST_|0x0+)[a-fA-F0-9]{64}["']/g,
        name: 'Gerçek Private Key',
        severity: 'CRITICAL'
    },
    {
        pattern: /private.*key.*["'][a-fA-F0-9]{64}["']/gi,
        name: 'Private Key Pattern',
        severity: 'CRITICAL'
    },
    {
        pattern: /BSCSCAN_API_KEY\s*=\s*["'](?!YOUR_|TEST_)[A-Z0-9]{34}["']/g,
        name: 'BSCScan API Key',
        severity: 'HIGH'
    },
    {
        pattern: /mnemonic.*["'][a-z\s]{95,}["']/gi,
        name: 'Mnemonic Phrase',
        severity: 'CRITICAL'
    },
    {
        pattern: /seed.*phrase.*["'][a-z\s]{95,}["']/gi,
        name: 'Seed Phrase',
        severity: 'CRITICAL'
    }
];

// Kontrol edilecek dosya uzantıları
const fileExtensions = ['.js', '.ts', '.json', '.md', '.sol', '.txt'];

// Kontrol edilmeyecek klasörler
const excludedDirs = [
    'node_modules',
    'artifacts',
    'cache',
    'coverage',
    '.git',
    '.kiro',
    'logs',
    'deployments'
];

// Kontrol edilmeyecek dosyalar
const excludedFiles = [
    '.env',
    '.env.local',
    '.env.production',
    'package-lock.json',
    'yarn.lock'
];

let totalFiles = 0;
let scannedFiles = 0;
let issues = [];

function shouldScanFile(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);
    
    // Excluded files
    if (excludedFiles.includes(fileName)) {
        return false;
    }
    
    // Check extension
    if (!fileExtensions.includes(ext)) {
        return false;
    }
    
    // Check excluded directories
    const parts = filePath.split(path.sep);
    for (const dir of excludedDirs) {
        if (parts.includes(dir)) {
            return false;
        }
    }
    
    return true;
}

function scanFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.relative(process.cwd(), filePath);
        
        for (const { pattern, name, severity } of sensitivePatterns) {
            const matches = content.match(pattern);
            if (matches) {
                issues.push({
                    file: fileName,
                    issue: name,
                    severity: severity,
                    matches: matches.length
                });
            }
        }
        
        scannedFiles++;
    } catch (error) {
        console.warn(`⚠️  Dosya okunamadı: ${filePath}`);
    }
}

function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            const dirName = path.basename(fullPath);
            if (!excludedDirs.includes(dirName)) {
                scanDirectory(fullPath);
            }
        } else if (stat.isFile()) {
            totalFiles++;
            if (shouldScanFile(fullPath)) {
                scanFile(fullPath);
            }
        }
    }
}

// Ana kontrol
console.log('📁 Dosyalar taranıyor...\n');
scanDirectory(process.cwd());

console.log(`✅ Tarama tamamlandı: ${scannedFiles}/${totalFiles} dosya kontrol edildi\n`);

// Sonuçları göster
if (issues.length === 0) {
    console.log('✅ ✅ ✅ GÜVENLIK KONTROLÜ BAŞARILI! ✅ ✅ ✅\n');
    console.log('Hassas bilgi tespit edilmedi. GitHub\'a yükleme güvenli.\n');
    process.exit(0);
} else {
    console.log('❌ ❌ ❌ GÜVENLIK UYARISI! ❌ ❌ ❌\n');
    console.log(`${issues.length} potansiyel güvenlik sorunu tespit edildi:\n`);
    
    // Severity'ye göre grupla
    const critical = issues.filter(i => i.severity === 'CRITICAL');
    const high = issues.filter(i => i.severity === 'HIGH');
    
    if (critical.length > 0) {
        console.log('🔴 KRİTİK SORUNLAR:');
        critical.forEach(issue => {
            console.log(`   - ${issue.file}`);
            console.log(`     Sorun: ${issue.issue}`);
            console.log(`     Eşleşme: ${issue.matches} adet\n`);
        });
    }
    
    if (high.length > 0) {
        console.log('🟡 YÜKSEK ÖNCELİKLİ SORUNLAR:');
        high.forEach(issue => {
            console.log(`   - ${issue.file}`);
            console.log(`     Sorun: ${issue.issue}`);
            console.log(`     Eşleşme: ${issue.matches} adet\n`);
        });
    }
    
    console.log('⚠️  BU DOSYALARI GITHUB\'A YÜKLEMEDEN ÖNCE TEMİZLEYİN!\n');
    console.log('Çözüm önerileri:');
    console.log('1. Hassas bilgileri .env dosyasına taşıyın');
    console.log('2. process.env kullanarak environment variable\'lardan okuyun');
    console.log('3. .gitignore dosyasını kontrol edin');
    console.log('4. Gerçek key\'leri test key\'leriyle değiştirin\n');
    
    process.exit(1);
}
