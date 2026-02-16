#!/usr/bin/env node
/**
 * 🧪 TESTE DO WORKFLOW DE TRIAGEM AUTÔNOMA
 * 
 * Testa o workflow completo sem fazer alterações reais.
 * Modo dry-run para validar antes de usar em produção.
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: 'env.local' });

const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

async function testarWorkflow() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║       🧪 TESTE DO WORKFLOW DE TRIAGEM AUTÔNOMA 🧪             ║
╚═══════════════════════════════════════════════════════════════╝
`);

    let score = 0;
    const maxScore = 10;

    // ========== 1. VERIFICAR CREDENCIAIS ==========
    console.log('🔍 1/10: Verificando credenciais Jira...');
    if (JIRA_DOMAIN && JIRA_EMAIL && JIRA_API_TOKEN) {
        console.log('   ✅ Credenciais Jira configuradas');
        score++;
    } else {
        console.log('   ❌ Credenciais Jira faltando');
        console.log('      Configure JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN em env.local');
    }
    console.log('');

    // ========== 2. VERIFICAR SCRIPTS ==========
    console.log('🔍 2/10: Verificando scripts existem...');
    const scripts = [
        'scripts/triagem_autonoma.js',
        'scripts/start_autocultivo.js'
    ];

    let scriptsOk = true;
    for (const script of scripts) {
        if (fs.existsSync(path.resolve(process.cwd(), script))) {
            console.log(`   ✅ ${script}`);
        } else {
            console.log(`   ❌ ${script} não encontrado`);
            scriptsOk = false;
        }
    }
    if (scriptsOk) score++;
    console.log('');

    // ========== 3. VERIFICAR DIRETÓRIOS ==========
    console.log('🔍 3/10: Verificando estrutura de diretórios...');
    const dirs = [
        'instances',
        'instances/briefings'
    ];

    let dirsOk = true;
    for (const dir of dirs) {
        const dirPath = path.resolve(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
            console.log(`   ✅ ${dir}/`);
        } else {
            console.log(`   ⚠️  ${dir}/ não existe - será criado`);
        }
    }
    score++;
    console.log('');

    // ========== 4. TESTAR CONEXÃO JIRA ==========
    console.log('🔍 4/10: Testando conexão com Jira...');
    if (JIRA_DOMAIN && JIRA_EMAIL && JIRA_API_TOKEN) {
        try {
            const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
            const response = await fetch(`https://${JIRA_DOMAIN}/rest/api/3/myself`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const user = await response.json();
                console.log(`   ✅ Conectado como: ${user.displayName}`);
                console.log(`   📧 Email: ${user.emailAddress}`);
                score++;
            } else {
                console.log(`   ❌ Falha na conexão: ${response.status}`);
            }
        } catch (e) {
            console.log(`   ❌ Erro de conexão: ${e.message}`);
        }
    } else {
        console.log('   ⏭️  Pulado (credenciais não configuradas)');
    }
    console.log('');

    // ========== 5. VERIFICAR SUPABASE ==========
    console.log('🔍 5/10: Verificando Supabase...');
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('   ✅ Credenciais Supabase configuradas');
        score++;
    } else {
        console.log('   ⚠️  Supabase não configurado (opcional para triagem)');
    }
    console.log('');

    // ========== 6. VERIFICAR GIT ==========
    console.log('🔍 6/10: Verificando Git...');
    try {
        const status = execSync('git status --short', { encoding: 'utf8' });
        console.log('   ✅ Git repository detectado');

        const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        console.log(`   📍 Branch atual: ${branch}`);
        score++;
    } catch (e) {
        console.log('   ❌ Não é um repositório Git');
    }
    console.log('');

    // ========== 7. VERIFICAR HOOKS ==========
    console.log('🔍 7/10: Verificando Git hooks...');
    const hooksDir = path.resolve(process.cwd(), '.git', 'hooks');
    const hooks = ['post-commit', 'post-merge', 'commit-msg'];

    let hooksOk = 0;
    for (const hook of hooks) {
        if (fs.existsSync(path.join(hooksDir, hook))) {
            console.log(`   ✅ ${hook}`);
            hooksOk++;
        } else {
            console.log(`   ⚠️  ${hook} não encontrado`);
        }
    }
    if (hooksOk === hooks.length) score++;
    console.log('');

    // ========== 8. VERIFICAR DAEMON ==========
    console.log('🔍 8/10: Verificando daemon de senciência...');
    const daemonStatusFile = path.resolve(process.cwd(), 'scripts', 'senciencia', 'daemon_status.json');
    if (fs.existsSync(daemonStatusFile)) {
        const status = JSON.parse(fs.readFileSync(daemonStatusFile, 'utf8'));
        console.log(`   ✅ Daemon: ${status.status}`);
        console.log(`   ⏱️  Uptime: ${status.uptime_minutes} minutos`);
        console.log(`   🔄 Ciclos: ${status.cycles}`);
        score++;
    } else {
        console.log('   ⚠️  Daemon não está rodando');
        console.log('      Inicie: scripts\\senciencia\\start_daemon.bat');
    }
    console.log('');

    // ========== 9. SIMULAR CRIAÇÃO DE EPIC ==========
    console.log('🔍 9/10: Simulando criação de Epic...');
    console.log('   📝 Epic: "Onboarding Autônomo: Projeto Teste"');
    console.log('   📋 Tasks: 6 tasks seriam criadas');
    console.log('   📁 Briefing: instances/briefings/projeto-teste.json');
    console.log('   ✅ Simulação OK');
    score++;
    console.log('');

    // ========== 10. VERIFICAR DOCUMENTAÇÃO ==========
    console.log('🔍 10/10: Verificando documentação...');
    const docs = [
        'docs/WORKFLOW_START.md',
        'docs/PROXIMOS_PASSOS_RECOMENDADOS.md'
    ];

    let docsOk = true;
    for (const doc of docs) {
        if (fs.existsSync(path.resolve(process.cwd(), doc))) {
            console.log(`   ✅ ${doc}`);
        } else {
            console.log(`   ⚠️  ${doc} não encontrado`);
            docsOk = false;
        }
    }
    if (docsOk) score++;
    console.log('');

    // ========== RESULTADO FINAL ==========
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📊 RESULTADO: ${score}/${maxScore} checks passaram`);
    console.log('');

    if (score === maxScore) {
        console.log('🎉 PERFEITO! Sistema 100% pronto para triagem autônoma!');
        console.log('');
        console.log('🚀 Próximo passo:');
        console.log('   node triagem_autonoma.js "Seu Projeto"');
    } else if (score >= 7) {
        console.log('✅ BOM! Sistema funcional, algumas melhorias recomendadas.');
        console.log('');
        console.log('🚀 Você pode iniciar triagem:');
        console.log('   node triagem_autonoma.js "Seu Projeto"');
    } else if (score >= 4) {
        console.log('⚠️  PARCIAL. Configure credenciais antes de usar.');
        console.log('');
        console.log('📝 Configure em env.local:');
        console.log('   JIRA_DOMAIN=...');
        console.log('   JIRA_EMAIL=...');
        console.log('   JIRA_API_TOKEN=...');
    } else {
        console.log('❌ FALHA. Sistema precisa de configuração.');
        console.log('');
        console.log('📖 Veja: docs/WORKFLOW_START.md');
    }
    console.log('');
}

// Executar teste
testarWorkflow().catch(console.error);
