import { PinnacleAPIClient } from '../services/pinnacle/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from current directory or parent
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testAuth() {
  const username = process.env.PINNACLE_USERNAME;
  const password = process.env.PINNACLE_PASSWORD;
  const apiUrl = process.env.PINNACLE_API_URL;

  if (!username || !password) {
    console.error('❌ Credentials not found in .env');
    process.exit(1);
  }

  console.log(`🔐 Testing Auth for User: ${username}`);
  console.log(`🌐 Target API: ${apiUrl || 'Default (PS3838)'}`);

  const client = new PinnacleAPIClient({ username, password, apiUrl });

  try {
    console.log('📡 Sending request to /v2/sports...');
    const sports = await client.getSports();
    console.log('✅ SUCCESS! Authentication working.');
    console.log(`📊 Found ${sports.length} active sports.`);
    console.log('Sample Sport:', sports[0]);
  } catch (error: any) {
    console.error('❌ FAILURE: Authentication or Connection failed.');
    console.error('Error Details:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAuth();
