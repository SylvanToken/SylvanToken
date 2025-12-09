const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function verifyContract() {
    console.log('\n🔍 BSCScan Contract Verification via API\n');

    const contractAddress = '0xc66404C3fa3E01378027b4A4411812D3a8D458F5';
    const apiKey = process.env.BSCSCAN_API_KEY;

    if (!apiKey) {
        console.error('❌ Error: BSCSCAN_API_KEY not found in environment variables');
        process.exit(1);
    }

    // Read the standard input JSON
    const standardInputPath = path.join(__dirname, '../standard-input.json');
    const standardInput = JSON.parse(fs.readFileSync(standardInputPath, 'utf8'));

    // Constructor arguments
    const constructorArguments = '00000000000000000000000046a4af3bdad67d3855af42ba0bbe9248b54f7915000000000000000000000000a697645fdfa5d9399ed18a6575256f81343d4e17000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000040000000000000000000000f949f50b3c32bd4cda7d2192ff8f51dd9db4a46900000000000000000000000046a4af3bdad67d3855af42ba0bbe9248b54f7915000000000000000000000000a697645fdfa5d9399ed18a6575256f81343d4e17000000000000000000000000000000000000000000000000000000000000dead';

    const params = {
        apikey: apiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: contractAddress,
        sourceCode: JSON.stringify(standardInput),
        codeformat: 'solidity-standard-json-input',
        contractname: 'contracts/SylvanToken.sol:SylvanToken',
        compilerversion: 'v0.8.24+commit.e11b9ed9',
        optimizationUsed: 1,
        runs: 200,
        constructorArguements: constructorArguments,
        evmversion: 'shanghai',
        licenseType: 3 // MIT
    };

    console.log('📋 Verification Parameters:');
    console.log('Contract Address:', contractAddress);
    console.log('Compiler Version:', params.compilerversion);
    console.log('Optimization:', params.optimizationUsed ? 'Yes' : 'No');
    console.log('Runs:', params.runs);
    console.log('EVM Version:', params.evmversion);
    console.log('License:', 'MIT (3)');
    console.log();

    try {
        console.log('📤 Submitting verification request to BSCScan...');
        
        const response = await axios.post(
            'https://api.bscscan.com/api',
            new URLSearchParams(params),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('\n📥 Response from BSCScan:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.status === '1') {
            const guid = response.data.result;
            console.log('\n✅ Verification submitted successfully!');
            console.log('GUID:', guid);
            console.log('\n⏳ Checking verification status...');

            // Wait a bit before checking status
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Check status
            const statusResponse = await axios.get('https://api.bscscan.com/api', {
                params: {
                    apikey: apiKey,
                    module: 'contract',
                    action: 'checkverifystatus',
                    guid: guid
                }
            });

            console.log('\n📊 Verification Status:');
            console.log(JSON.stringify(statusResponse.data, null, 2));

            if (statusResponse.data.status === '1') {
                console.log('\n🎉 Contract verified successfully!');
                console.log('🔗 View on BSCScan:', `https://bscscan.com/address/${contractAddress}#code`);
            } else {
                console.log('\n⏳ Verification is pending. Please check BSCScan in a few minutes.');
                console.log('🔗 Check status:', `https://bscscan.com/address/${contractAddress}#code`);
            }
        } else {
            console.error('\n❌ Verification failed:');
            console.error('Message:', response.data.result);
            
            if (response.data.result.includes('already verified')) {
                console.log('\n✅ Contract is already verified!');
                console.log('🔗 View on BSCScan:', `https://bscscan.com/address/${contractAddress}#code`);
            }
        }

    } catch (error) {
        console.error('\n❌ Error during verification:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

verifyContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
