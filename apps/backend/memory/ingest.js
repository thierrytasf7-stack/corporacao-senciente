
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from current working directory (backend root)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Using Anon Key or Service Role if available, usually Anon is enough if RLS allows or Service Rule for backend

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateEmbedding(text) {
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

async function ingestMemory(content, metadata = {}) {
    console.log(`🧠 Ingesting: "${content.substring(0, 50)}..."`);

    try {
        const embedding = await generateEmbedding(content);

        const { data, error } = await supabase
            .from('memory_bank')
            .insert({
                content,
                metadata,
                embedding
            })
            .select();

        if (error) throw error;
        console.log(`✅ Saved memory ID: ${data[0].id}`);
        return data[0];
    } catch (err) {
        console.error("❌ Error ingesting memory:", err);
    }
}

// Example Usage (If run directly)
if (process.argv[1] === __filename) {
    const text = process.argv[2] || "O sistema de deploy falhou.";
    let metadata = { source: 'cli_direct', type: 'manual_ingest' };

    if (process.argv[3]) {
        try {
            metadata = { ...metadata, ...JSON.parse(process.argv[3]) };
        } catch (e) {
            console.warn("⚠️  Failed to parse metadata JSON, using defaults.");
        }
    }

    ingestMemory(text, metadata);
}

export { generateEmbedding, ingestMemory };

