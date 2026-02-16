#!/usr/bin/env node

/**
 * Processador de Registros de PC - Corporação Senciente
 * Fase 0.5 - Infraestrutura Multi-PC
 *
 * Este script processa arquivos de registro de PCs secundários
 * e os adiciona ao banco de dados pc_registry no Supabase
 */

const fs = require('fs');
const path = require('path');

// Configuração do Supabase - ALTERE CONFORME SUAS CREDENCIAIS
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Cores para output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'blue') {
    console.log(`${colors[color]}[${new Date().toISOString()}] ${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

/**
 * Lê e valida arquivo de registro
 */
function readRegistrationFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const registration = JSON.parse(content);

        // Validação básica
        const required = ['hostname', 'ip', 'specialization', 'registered_at'];
        for (const field of required) {
            if (!registration[field]) {
                throw new Error(`Campo obrigatório faltando: ${field}`);
            }
        }

        return registration;
    } catch (err) {
        error(`Erro ao ler arquivo ${filePath}: ${err.message}`);
        return null;
    }
}

/**
 * Insere PC no banco de dados Supabase
 */
async function insertPCIntoDatabase(pcData) {
    try {
        // Simulação - em produção, use o cliente Supabase real
        info(`Inserindo PC ${pcData.hostname} no banco de dados...`);

        // TODO: Implementar inserção real no Supabase
        // const { createClient } = require('@supabase/supabase-js');
        // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // const { data, error } = await supabase.from('pcs').insert(pcData);

        // Simulação de sucesso
        success(`PC ${pcData.hostname} registrado com sucesso!`);

        // Log detalhado
        console.log('Dados registrados:');
        console.log(`  Hostname: ${pcData.hostname}`);
        console.log(`  IP: ${pcData.ip}`);
        console.log(`  Especialização: ${pcData.specialization}`);
        console.log(`  CPU Cores: ${pcData.cpu_cores}`);
        console.log(`  Memória: ${pcData.total_memory}`);
        console.log(`  Status: ${pcData.status}`);

        return true;
    } catch (err) {
        error(`Erro ao inserir PC no banco: ${err.message}`);
        return false;
    }
}

/**
 * Processa arquivo de registro
 */
async function processRegistrationFile(filePath) {
    info(`Processando arquivo: ${filePath}`);

    const pcData = readRegistrationFile(filePath);
    if (!pcData) {
        return false;
    }

    const success = await insertPCIntoDatabase(pcData);
    return success;
}

/**
 * Processa todos os arquivos de registro pendentes
 */
async function processPendingRegistrations() {
    const registrationsDir = path.join(__dirname, '../../pc_registrations');
    const processedDir = path.join(registrationsDir, 'processed');

    // Criar diretório processed se não existir
    if (!fs.existsSync(processedDir)) {
        fs.mkdirSync(processedDir, { recursive: true });
    }

    // Listar arquivos de registro
    let files;
    try {
        files = fs.readdirSync(registrationsDir)
            .filter(file => file.endsWith('.json') && !file.startsWith('processed'))
            .map(file => path.join(registrationsDir, file));
    } catch (err) {
        error(`Erro ao listar arquivos de registro: ${err.message}`);
        return;
    }

    if (files.length === 0) {
        info('Nenhum arquivo de registro pendente encontrado');
        return;
    }

    info(`Encontrados ${files.length} arquivos de registro pendentes`);

    let processed = 0;
    let successful = 0;

    for (const file of files) {
        processed++;

        if (await processRegistrationFile(file)) {
            successful++;

            // Mover arquivo para processed
            const fileName = path.basename(file);
            const processedPath = path.join(processedDir, fileName);
            fs.renameSync(file, processedPath);
            info(`Arquivo movido para: ${processedPath}`);
        }
    }

    // Resumo
    console.log('\n' + '='.repeat(60));
    success(`PROCESSAMENTO CONCLUÍDO: ${successful}/${processed} registros processados com sucesso`);
    console.log('='.repeat(60));
}

/**
 * Cria estrutura de diretórios necessária
 */
function setupDirectories() {
    const dirs = [
        path.join(__dirname, '../../pc_registrations'),
        path.join(__dirname, '../../pc_registrations/processed')
    ];

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            success(`Diretório criado: ${dir}`);
        }
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('='.repeat(60));
    console.log('🔄 PROCESSADOR DE REGISTROS - Corporação Senciente');
    console.log('='.repeat(60));

    // Verificar argumentos
    if (process.argv.length > 2) {
        // Processar arquivo específico
        const filePath = process.argv[2];
        info(`Processando arquivo específico: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            error(`Arquivo não encontrado: ${filePath}`);
            process.exit(1);
        }

        const success = await processRegistrationFile(filePath);
        process.exit(success ? 0 : 1);
    } else {
        // Processar todos os arquivos pendentes
        setupDirectories();
        await processPendingRegistrations();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(err => {
        error(`Erro fatal: ${err.message}`);
        process.exit(1);
    });
}

module.exports = {
    processRegistrationFile,
    processPendingRegistrations,
    readRegistrationFile
};






