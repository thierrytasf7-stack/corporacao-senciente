import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

// Try to load local env if present (for local dev)
if (process.env.NODE_ENV !== 'production') {
    if (fs.existsSync('.env')) config({ path: '.env' });
    else if (fs.existsSync('env.local')) config({ path: 'env.local' });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials missing in backend/src_api/supabase.js');
}

export const supabase = createClient(
    supabaseUrl || "https://ffdszaiarxstxbafvedi.supabase.co",
    supabaseKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZHN6YWlhcnhzdHhiYWZ2ZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA3MTYsImV4cCI6MjA4MDk3NjcxNn0.pD36vrlixzGi7P9MYaTbOGE9MG8yfZCQx0uRNN0Ez6A"
);

export default supabase;
