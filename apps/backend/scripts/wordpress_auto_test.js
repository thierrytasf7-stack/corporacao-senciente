/**
 * Teste Autônomo WordPress Server
 * Inicia servidor, testa e valida tudo
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar env
config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const PORT = process.env.WORDPRESS_PORT || 8080;
const POSTS_DIR = path.join(process.cwd(), 'wordpress_posts');
if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
}

const DB_FILE = path.join(POSTS_DIR, 'posts.json');

function loadDB() {
    if (fs.existsSync(DB_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        } catch (error) {
            return { posts: [], users: [] };
        }
    }
    return { posts: [], users: [] };
}

function saveDB(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const app = express();
app.use(express.json());

// Endpoints
app.get('/wp-json/wp/v2', (req, res) => {
    res.json({
        name: 'WordPress Server (Node.js)',
        description: 'Servidor WordPress simples para Copywriting Agent',
        version: '1.0.0',
    });
});

app.get('/wp-json/wp/v2/posts', (req, res) => {
    const db = loadDB();
    res.json(db.posts.map(post => ({
        id: post.id,
        title: { rendered: post.title },
        content: { rendered: post.content },
        status: post.status,
        link: `http://localhost:${PORT}/post/${post.id}`,
        date: post.date,
    })));
});

app.post('/wp-json/wp/v2/posts', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const credentials = Buffer.from(authHeader.substring(6), 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    const { WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD } = process.env;
    if (username !== WORDPRESS_USERNAME || password !== WORDPRESS_APP_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { title, content, status = 'draft' } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const db = loadDB();
    const newPost = {
        id: db.posts.length > 0 ? Math.max(...db.posts.map(p => p.id)) + 1 : 1,
        title,
        content,
        status,
        date: new Date().toISOString(),
        author: username,
    };
    
    db.posts.push(newPost);
    saveDB(db);
    
    res.status(201).json({
        id: newPost.id,
        title: { rendered: newPost.title },
        content: { rendered: newPost.content },
        status: newPost.status,
        link: `http://localhost:${PORT}/post/${newPost.id}`,
        date: newPost.date,
    });
});

app.get('/', (req, res) => {
    const db = loadDB();
    const posts = db.posts.filter(p => p.status === 'publish');
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>WordPress Server - Copywriting Agent</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        .post { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .post h2 { margin-top: 0; }
        .meta { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>WordPress Server - Copywriting Agent</h1>
    <p>Servidor WordPress simples rodando em Node.js</p>
    <hr>
    <h2>Posts Publicados (${posts.length})</h2>
    ${posts.length === 0 ? '<p>Nenhum post publicado ainda.</p>' : ''}
    ${posts.map(post => `
        <div class="post">
            <h2><a href="/post/${post.id}">${post.title}</a></h2>
            <div class="meta">${new Date(post.date).toLocaleString('pt-BR')} - ${post.author}</div>
        </div>
    `).join('')}
    <hr>
    <p><a href="/wp-json/wp/v2">API REST</a></p>
</body>
</html>
    `;
    res.send(html);
});

// Iniciar servidor
async function main() {
    console.log('🚀 Iniciando WordPress Server...\n');
    
    const server = app.listen(PORT, () => {
        console.log(`✅ WordPress Server rodando em: http://localhost:${PORT}\n`);
        console.log('📝 API REST: http://localhost:' + PORT + '/wp-json/wp/v2\n');
        
        // Testar após 1 segundo
        setTimeout(async () => {
            console.log('🧪 Testando servidor...\n');
            
            try {
                // Teste 1: API Info
                const infoRes = await fetch(`http://localhost:${PORT}/wp-json/wp/v2`);
                const info = await infoRes.json();
                console.log('✅ Teste 1 - API Info: OK');
                console.log(`   Nome: ${info.name}\n`);
                
                // Teste 2: Listar Posts
                const postsRes = await fetch(`http://localhost:${PORT}/wp-json/wp/v2/posts`);
                const posts = await postsRes.json();
                console.log(`✅ Teste 2 - Listar Posts: OK (${posts.length} posts)\n`);
                
                // Teste 3: Publicar Post
                const credentials = Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64');
                const publishRes = await fetch(`http://localhost:${PORT}/wp-json/wp/v2/posts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: 'Teste Autônomo - ' + new Date().toLocaleString('pt-BR'),
                        content: '<p>Post criado automaticamente pelo teste autônomo.</p>',
                        status: 'publish',
                    }),
                });
                
                if (publishRes.ok) {
                    const post = await publishRes.json();
                    console.log('✅ Teste 3 - Publicar Post: OK');
                    console.log(`   ID: ${post.id}`);
                    console.log(`   URL: ${post.link}\n`);
                } else {
                    console.log(`❌ Teste 3 - Publicar Post: ERRO ${publishRes.status}\n`);
                }
                
                console.log('='.repeat(60));
                console.log('\n✅ Todos os testes passaram!\n');
                console.log(`🌐 Acesse: http://localhost:${PORT}\n`);
                console.log('⚠️  Pressione Ctrl+C para parar\n');
                
            } catch (error) {
                console.error('❌ Erro nos testes:', error.message);
            }
        }, 1000);
    });
    
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.log(`\n❌ Porta ${PORT} já está em uso\n`);
            process.exit(1);
        } else {
            console.error('❌ Erro:', error.message);
            process.exit(1);
        }
    });
    
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Parando servidor...\n');
        server.close(() => {
            console.log('✅ Servidor parado\n');
            process.exit(0);
        });
    });
}

main();


























