/**
 * Teste Final WordPress - Tudo em um
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const PORT = 8080;
const POSTS_DIR = path.join(process.cwd(), 'wordpress_posts');
if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
}

const DB_FILE = path.join(POSTS_DIR, 'posts.json');

function loadDB() {
    if (fs.existsSync(DB_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        } catch {
            return { posts: [] };
        }
    }
    return { posts: [] };
}

function saveDB(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const app = express();
app.use(express.json());

app.get('/wp-json/wp/v2', (req, res) => {
    res.json({ name: 'WordPress Server (Node.js)', version: '1.0.0' });
});

app.get('/wp-json/wp/v2/posts', (req, res) => {
    const db = loadDB();
    res.json(db.posts.map(p => ({
        id: p.id,
        title: { rendered: p.title },
        content: { rendered: p.content },
        status: p.status,
        link: `http://localhost:${PORT}/post/${p.id}`,
    })));
});

app.post('/wp-json/wp/v2/posts', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const creds = Buffer.from(auth.substring(6), 'base64').toString('utf-8');
    const [user, pass] = creds.split(':');
    
    if (user !== process.env.WORDPRESS_USERNAME || pass !== process.env.WORDPRESS_APP_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { title, content, status = 'draft' } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content required' });
    }
    
    const db = loadDB();
    const post = {
        id: db.posts.length > 0 ? Math.max(...db.posts.map(p => p.id)) + 1 : 1,
        title,
        content,
        status,
        date: new Date().toISOString(),
    };
    
    db.posts.push(post);
    saveDB(db);
    
    res.status(201).json({
        id: post.id,
        title: { rendered: post.title },
        content: { rendered: post.content },
        status: post.status,
        link: `http://localhost:${PORT}/post/${post.id}`,
    });
});

app.get('/', (req, res) => {
    const db = loadDB();
    const posts = db.posts.filter(p => p.status === 'publish');
    res.send(`
<!DOCTYPE html>
<html>
<head><title>WordPress Server</title></head>
<body>
    <h1>WordPress Server - Copywriting Agent</h1>
    <p>Posts: ${posts.length}</p>
    ${posts.map(p => `<div><h2>${p.title}</h2><p>${p.content}</p></div>`).join('')}
    <p><a href="/wp-json/wp/v2">API</a></p>
</body>
</html>
    `);
});

const server = app.listen(PORT, async () => {
    console.log(`\n✅ WordPress Server rodando: http://localhost:${PORT}\n`);
    
    // Testar
    await new Promise(r => setTimeout(r, 1000));
    
    try {
        const res = await fetch(`http://localhost:${PORT}/wp-json/wp/v2`);
        const data = await res.json();
        console.log('✅ API OK:', data.name);
        
        const creds = Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64');
        const postRes = await fetch(`http://localhost:${PORT}/wp-json/wp/v2/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${creds}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Teste Autônomo - ' + new Date().toLocaleString('pt-BR'),
                content: '<p>Post criado automaticamente.</p>',
                status: 'publish',
            }),
        });
        
        if (postRes.ok) {
            const post = await postRes.json();
            console.log('✅ Post criado:', post.id, post.link);
        }
        
        console.log('\n🌐 Acesse: http://localhost:8080\n');
        console.log('⚠️  Ctrl+C para parar\n');
        
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
});

process.on('SIGINT', () => {
    server.close(() => process.exit(0));
});


























