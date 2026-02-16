
import { config } from 'dotenv';
config();
console.log('SUPABASE_REF:', process.env.SUPABASE_URL.split('.')[0].split('//')[1]);
