
import { describe, it, expect, beforeAll } from 'vitest';

// We will simulate the flow by mocking the NextRequest/NextResponse if possible, 
// OR we can write a script that assumes the server is running on localhost:3000.
// Given this is an "Integration" test in the context of a running app, let's write a script 
// that the user can run to verify the endpoints against their local server.

// usage: npx tsx tests/integration/verify-android-auth.ts

async function main() {
    const BASE_URL = 'http://localhost:3000/api';
    const TEST_EMAIL = 'test_android@example.com';
    const TEST_PASSWORD = 'password123';

    console.log('🚀 Starting Android Auth Verification...');

    // 1. REGISTER (Ensure user exists)
    console.log('\n1️⃣  Registering/Ensuring User...');
    try {
        await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                username: 'android_test_user',
                phone: '9999999999'
            })
        });
    } catch (e) {
        // Ignore if already exists
    }

    // 2. LOGIN (Get Tokens)
    console.log('\n2️⃣  Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        })
    });

    const loginData = await loginRes.json();

    if (!loginData.success || !loginData.accessToken) {
        console.error('❌ Login Failed:', loginData);
        process.exit(1);
    }

    const token = loginData.accessToken;
    console.log('✅ Login Successful! Token received.');
    console.log(`🔑 Token: ${token.substring(0, 15)}...`);

    // 3. ACCESS WALLET (With Bearer Token)
    console.log('\n3️⃣  Accessing Wallet API with Bearer Token...');
    const walletRes = await fetch(`${BASE_URL}/member/wallet`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const walletData = await walletRes.json();

    if (walletRes.status === 200 && walletData.success) {
        console.log('✅ Wallet Access Successful!');
        console.log(`💰 Balance: ${walletData.wallet.balance} ${walletData.wallet.currency}`);
    } else {
        console.error('❌ Wallet Access Failed:', walletRes.status, walletData);
        process.exit(1);
    }

    // 4. ACCESS REFERRALS (With Bearer Token)
    console.log('\n4️⃣  Accessing Referrals API with Bearer Token...');
    const refRes = await fetch(`${BASE_URL}/member/referrals`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const refData = await refRes.json();

    if (refRes.status === 200 && refData.success) {
        console.log('✅ Referrals Access Successful!');
        console.log(`👥 Total Referrals: ${refData.stats.total}`);
    } else {
        console.error('❌ Referrals Access Failed:', refRes.status, refData);
        process.exit(1);
    }

    console.log('\n🎉 All Android Auth tests passed!');
}

main().catch(console.error);
