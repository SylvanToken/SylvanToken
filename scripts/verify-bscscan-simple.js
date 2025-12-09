const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function verifyContractSimple() {
    console.log('\n🔍 BSCScan Contract Verification (Simplified Approach)\n');

    const contractAddress = '0xc66404C3fa3E01378027b4A4411812D3a8D458F5';
    const apiKey = process.env.BSCSCAN_API_KEY;

    if (!apiKey) {
        console.error('❌ Error: BSCSCAN_API_KEY not found');
        process.exit(1);
    }

    // Read flattened contract
    const flattenedPath = path.join(__dirname, '../SylvanToken-flattened.sol');
    let sourceCode = fs.readFileSync(flattenedPath, 'utf8');

    // Constructor arguments (without 0x prefix)
    const constructorArgs = '00000000000000000000000046a4af3bdad67d3855af42ba0bbe9248b54f7915000000000000000000000000a697645fdfa5d9399ed18a6575256f81343d4e17000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000040000000000000000000000f949f50b3c32bd4cda7d2192ff8f51dd9db4a46900000000000000000000000046a4af3bdad67d3855af42ba0bbe9248b54f7915000000000000000000000000a697645fdfa5d9399ed18a6575256f81343d4e17000000000000000000000000000000000000000000000000000000000000dead';

    console.log('📋 Parameters:');
    console.log('Contract:', contractAddress);
    console.log('Compiler: v0.8.24+commit.e11b9ed9');
    console.log('Optimization: Yes (200 runs)');
    console.log('EVM: shanghai');
    console.log();

    // Try with minimal parameters first
    const formData = new URLSearchParams({
        apikey: apiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: contractAddress,
        sourceCode: sourceCode,
        codeformat: 'solidity-single-file',
        contractname: 'SylvanToken',
        compilerversion: 'v0.8.24+commit.e11b9ed9',
        optimizationUsed: '1',
        runs: '200',
        constructorArguements: constructorArgs,
        evmversion: 'shanghai',
        licenseType: '3'
    });

    try {
        console.log('📤 Attempting verification...');
        
        const response = await axios.post(
            'https://api.bscscan.com/api',
            formData.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 60000
            }
        );

        console.log('\n📥 Response:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.status === '1') {
            console.log('\n✅ Verification request submitted!');
            console.log('GUID:', response.data.result);
            console.log('\n⏳ Waiting 15 seconds before checking status...');
            
            await new Promise(resolve => setTimeout(resolve, 15000));

            // Check status
            const statusResp = await axios.get('https://api.bscscan.com/api', {
                params: {
                    apikey: apiKey,
                    module: 'contract',
                    action: 'checkverifystatus',
                    guid: response.data.result
                }
            });

            console.log('\n📊 Status:');
            console.log(JSON.stringify(statusResp.data, null, 2));

            if (statusResp.data.status === '1') {
                console.log('\n🎉 SUCCESS! Contract verified!');
                console.log('🔗', `https://bscscan.com/address/${contractAddress}#code`);
            } else {
                console.log('\n⏳ Still processing. Check BSCScan in a few minutes.');
                console.log('🔗', `https://bscscan.com/address/${contractAddress}#code`);
            }
        } else {
            console.error('\n❌ Failed:', response.data.result);
            
            if (response.data.result.includes('already verified')) {
                console.log('\n✅ Already verified!');
                console.log('🔗', `https://bscscan.com/address/${contractAddress}#code`);
            } else if (response.data.result.includes('deprecated')) {
                console.log('\n⚠️  API V1 is deprecated.');
                console.log('BSCScan is migrating to API V2.');
                console.log('\n📋 Options:');
                console.log('1. Wait for API V2 to be fully available');
                console.log('2. Contact BSCScan support for manual verification');
                console.log('3. Contract works fine without verification');
            }
        }

    } catch (error) {
        console.error('\n❌ Error:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Message:', error.response.statusText);
            if (error.response.data) {
                console.error('Data:', typeof error.response.data === 'string' ? 
                    error.response.data.substring(0, 200) : 
                    JSON.stringify(error.response.data, null, 2));
            }
        } else {
            console.error(error.message);
        }
    }
}

verifyContractSimple()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
