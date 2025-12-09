const fs = require('fs');
const path = require('path');

// Generate Standard JSON Input for BSCScan verification
const standardJsonInput = {
    language: "Solidity",
    sources: {},
    settings: {
        optimizer: {
            enabled: true,
            runs: 200,
            details: {
                yul: true,
                yulDetails: {
                    stackAllocation: true,
                    optimizerSteps: "dhfoDgvulfnTUtnIf"
                }
            }
        },
        evmVersion: "shanghai",
        outputSelection: {
            "*": {
                "*": [
                    "abi",
                    "evm.bytecode",
                    "evm.deployedBytecode",
                    "evm.methodIdentifiers",
                    "metadata"
                ],
                "": ["ast"]
            }
        },
        libraries: {
            "contracts/libraries/WalletManager.sol": {
                "WalletManager": "0xa2406B88002caD138a9d5BBcf22D3638efE9F819"
            }
        }
    }
};

// Read all contract files
const contractsDir = path.join(__dirname, '../contracts');

function readContractFiles(dir, baseDir = contractsDir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            readContractFiles(filePath, baseDir);
        } else if (file.endsWith('.sol')) {
            const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
            const content = fs.readFileSync(filePath, 'utf8');
            standardJsonInput.sources[`contracts/${relativePath}`] = {
                content: content
            };
        }
    });
}

// Read OpenZeppelin contracts
const nodeModulesPath = path.join(__dirname, '../node_modules/@openzeppelin/contracts');
function readOpenZeppelinFiles(dir, baseDir = nodeModulesPath) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            readOpenZeppelinFiles(filePath, baseDir);
        } else if (file.endsWith('.sol')) {
            const relativePath = path.relative(nodeModulesPath, filePath).replace(/\\/g, '/');
            const content = fs.readFileSync(filePath, 'utf8');
            standardJsonInput.sources[`@openzeppelin/contracts/${relativePath}`] = {
                content: content
            };
        }
    });
}

console.log('📝 Generating Standard JSON Input...\n');

// Read all contracts
readContractFiles(contractsDir);
readOpenZeppelinFiles(nodeModulesPath);

console.log('✅ Found', Object.keys(standardJsonInput.sources).length, 'source files');

// Save to file
const outputPath = path.join(__dirname, '../standard-input.json');
fs.writeFileSync(outputPath, JSON.stringify(standardJsonInput, null, 2));

console.log('✅ Standard JSON Input saved to:', outputPath);
console.log('\n📋 Next Steps:');
console.log('1. Go to: https://bscscan.com/verifyContract?a=0xc66404C3fa3E01378027b4A4411812D3a8D458F5');
console.log('2. Select "Solidity (Standard-Json-Input)"');
console.log('3. Upload the file: standard-input.json');
console.log('4. Click "Verify and Publish"');
