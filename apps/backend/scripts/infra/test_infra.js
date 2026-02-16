#!/usr/bin/env node

/**
 * Teste Básico da Infraestrutura Multi-PC
 * Corporação Senciente - Fase 0.5
 */

import { promises as fs } from 'fs';
import os from 'os';

console.log('🧪 TESTANDO INFRAESTRUTURA MULTI-PC');
console.log('=====================================');

// Teste 1: Verificar arquivos necessários
async function testFiles() {
    console.log('\n📁 Teste 1: Verificando arquivos...');

    const requiredFiles = [
        'setup_pc_template.sh',
        'register_pc.sh',
        'pc_specializations.json',
        'pc_registry.js',
        'pc_discovery.js',
        'pc_monitor.js',
        'README.md'
    ];

    let passed = 0;
    for (const file of requiredFiles) {
        try {
            await fs.access(file);
            console.log(`  ✅ ${file}`);
            passed++;
        } catch {
            console.log(`  ❌ ${file} - ARQUIVO NÃO ENCONTRADO`);
        }
    }

    console.log(`  Resultado: ${passed}/${requiredFiles.length} arquivos encontrados`);
    return passed === requiredFiles.length;
}

// Teste 2: Verificar configurações JSON
async function testConfigurations() {
    console.log('\n⚙️  Teste 2: Verificando configurações...');

    try {
        const specializations = await fs.readFile('pc_specializations.json', 'utf8');
        const config = JSON.parse(specializations);

        if (config.specializations && config.specializations.brain && config.specializations.business) {
            console.log('  ✅ pc_specializations.json - válido');
            return true;
        } else {
            console.log('  ❌ pc_specializations.json - estrutura inválida');
            return false;
        }
    } catch (error) {
        console.log(`  ❌ pc_specializations.json - erro: ${error.message}`);
        return false;
    }
}

// Teste 3: Verificar sistema operacional
function testSystem() {
    console.log('\n💻 Teste 3: Verificando sistema...');

    const platform = os.platform();
    const arch = os.arch();
    const nodeVersion = process.version;

    console.log(`  Sistema: ${platform} ${arch}`);
    console.log(`  Node.js: ${nodeVersion}`);

    // Verificar se é Windows (necessário para WSL2)
    if (platform === 'win32') {
        console.log('  ✅ Sistema Windows - compatível com WSL2');
        return true;
    } else {
        console.log('  ⚠️  Sistema não-Windows - WSL2 não disponível');
        return false;
    }
}

// Teste 4: Verificar permissões de execução (simulado)
async function testPermissions() {
    console.log('\n🔐 Teste 4: Verificando scripts...');

    const scripts = ['setup_pc_template.sh', 'register_pc.sh'];

    let executable = 0;
    for (const script of scripts) {
        try {
            const stats = await fs.stat(script);
            // No Windows, não há bit de execução, então apenas verificamos se existe
            console.log(`  ✅ ${script} - acessível`);
            executable++;
        } catch {
            console.log(`  ❌ ${script} - não acessível`);
        }
    }

    console.log(`  Resultado: ${executable}/${scripts.length} scripts acessíveis`);
    return executable === scripts.length;
}

// Teste 5: Testar descoberta de rede
async function testNetworkDiscovery() {
    console.log('\n🌐 Teste 5: Testando descoberta de rede...');

    try {
        // Importar dinamicamente para testar
        const { default: PCDiscovery } = await import('./pc_discovery.js');
        const discovery = new PCDiscovery();

        console.log('  ✅ Módulo PCDiscovery importado');

        const interfaces = await discovery.getNetworkInterfaces();
        console.log(`  ✅ Encontradas ${interfaces.length} interfaces de rede`);

        if (interfaces.length > 0) {
            console.log('  Interfaces encontradas:');
            interfaces.forEach(iface => {
                console.log(`    - ${iface.Name}: ${iface.IPAddress}`);
            });
        }

        return interfaces.length > 0;
    } catch (error) {
        console.log(`  ❌ Erro na descoberta de rede: ${error.message}`);
        return false;
    }
}

// Função principal
async function main() {
    const results = [];

    results.push(await testFiles());
    results.push(await testConfigurations());
    results.push(testSystem());
    results.push(await testPermissions());
    results.push(await testNetworkDiscovery());

    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log('\n=====================================');
    console.log(`📊 RESULTADO FINAL: ${passed}/${total} testes passaram`);

    if (passed === total) {
        console.log('🎉 INFRAESTRUTURA VALIDADA COM SUCESSO!');
        console.log('\n✅ Pronto para implementar comunicação entre PCs');
        process.exit(0);
    } else {
        console.log('⚠️  Alguns testes falharam. Verifique os erros acima.');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Erro fatal no teste:', error);
    process.exit(1);
});






