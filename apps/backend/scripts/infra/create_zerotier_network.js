#!/usr/bin/env node

/**
 * Criador de Rede ZeroTier - Corporação Senciente
 * Fase 0.5 - Comunicação Multi-PC
 *
 * Cria e configura rede ZeroTier automaticamente para swarm distribuído
 * Usa ZeroTier Central API para gerenciamento programático
 */

import { writeFileSync } from 'fs';
import fetch from 'node-fetch';

// Configurações - ALTERE CONFORME NECESSÁRIO
const ZEROTIER_API_TOKEN = process.env.ZEROTIER_API_TOKEN || 'your-zerotier-api-token';
const ZEROTIER_API_BASE = 'https://api.zerotier.com/api/v1';

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
 * Criar rede ZeroTier
 */
async function createNetwork() {
    try {
        info('Criando nova rede ZeroTier para Corporação Senciente...');

        const networkConfig = {
            name: `Corporação Senciente - Swarm ${Date.now()}`,
            description: 'Rede privada para swarm distribuído de PCs da Corporação Senciente',
            private: true,
            enableBroadcast: true,
            v4AssignMode: { zt: true },
            v6AssignMode: { '6plane': false, rfc4193: false, zt: false },
            rules: [
                // Regras básicas de firewall
                {
                    type: 'ACTION_ACCEPT',
                    not: false
                }
            ],
            ipAssignmentPools: [
                {
                    ipRangeStart: '10.0.0.1',
                    ipRangeEnd: '10.0.0.254'
                }
            ],
            routes: [
                {
                    target: '10.0.0.0/24',
                    via: null
                }
            ]
        };

        const response = await fetch(`${ZEROTIER_API_BASE}/network`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ZEROTIER_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(networkConfig)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
        }

        const network = await response.json();

        success(`Rede ZeroTier criada: ${network.id}`);
        info(`Nome: ${network.name}`);
        info(`IP Range: 10.0.0.0/24`);

        return network;

    } catch (err) {
        error(`Erro ao criar rede: ${err.message}`);

        // Fallback: instruções manuais
        console.log('\n' + '='.repeat(60));
        warning('CRIAÇÃO MANUAL NECESSÁRIA');
        console.log('='.repeat(60));
        console.log('1. Acesse: https://my.zerotier.com');
        console.log('2. Faça login na sua conta');
        console.log('3. Clique em "Create Network"');
        console.log('4. Configure:');
        console.log('   - Name: Corporação Senciente - Swarm');
        console.log('   - Private: ON');
        console.log('   - IPv4 Auto-Assign: ON');
        console.log('   - IP Range: 10.0.0.0/24');
        console.log('5. Anote o Network ID (ex: 1234567890abcdef)');
        console.log('6. Execute: node create_zerotier_network.js <network-id>');
        console.log('='.repeat(60));

        return null;
    }
}

/**
 * Configurar rede existente
 */
async function configureNetwork(networkId) {
    try {
        info(`Configurando rede existente: ${networkId}`);

        // Verificar se rede existe
        const response = await fetch(`${ZEROTIER_API_BASE}/network/${networkId}`, {
            headers: {
                'Authorization': `Bearer ${ZEROTIER_API_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`Rede ${networkId} não encontrada ou sem permissão`);
        }

        const network = await response.json();

        // Atualizar configuração se necessário
        const updates = {
            name: network.name.includes('Corporação') ? network.name : `Corporação Senciente - ${network.name}`,
            description: 'Rede privada para swarm distribuído de PCs da Corporação Senciente'
        };

        const updateResponse = await fetch(`${ZEROTIER_API_BASE}/network/${networkId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ZEROTIER_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (updateResponse.ok) {
            success(`Rede ${networkId} configurada para Corporação Senciente`);
        }

        return network;

    } catch (err) {
        error(`Erro ao configurar rede: ${err.message}`);
        return null;
    }
}

/**
 * Salvar configuração local
 */
function saveLocalConfig(network) {
    const config = {
        zerotier: {
            network_id: network.id,
            name: network.name,
            ip_range: '10.0.0.0/24',
            created_at: new Date().toISOString(),
            status: 'active'
        },
        corporation: {
            name: 'corporacao-senciente',
            version: '7.0'
        }
    };

    writeFileSync('zerotier_network_config.json', JSON.stringify(config, null, 2));
    success('Configuração salva em zerotier_network_config.json');

    // Salvar apenas Network ID para uso fácil
    writeFileSync('ZEROTIER_NETWORK_ID.txt', network.id);
    info(`Network ID salvo em ZEROTIER_NETWORK_ID.txt: ${network.id}`);
}

/**
 * Mostrar informações da rede
 */
function showNetworkInfo(network) {
    console.log('\n' + '='.repeat(60));
    success('REDE ZEROTIER CONFIGURADA');
    console.log('='.repeat(60));
    console.log(`Network ID: ${network.id}`);
    console.log(`Nome: ${network.name}`);
    console.log(`Status: ${network.onlineMemberCount}/${network.authorizedMemberCount} membros online`);
    console.log(`IP Range: 10.0.0.0/24`);
    console.log(`Private: ${network.private ? 'Sim' : 'Não'}`);
    console.log('');
    console.log('COMANDO PARA CONECTAR PCs:');
    console.log(`sudo zerotier-cli join ${network.id}`);
    console.log('');
    console.log('AUTORIZAR PCs EM: https://my.zerotier.com');
    console.log('='.repeat(60));
}

/**
 * Função principal
 */
async function main() {
    console.log('='.repeat(60));
    console.log('🔐 CRIADOR DE REDE ZEROTIER - Corporação Senciente');
    console.log('='.repeat(60));

    const networkId = process.argv[2];

    let network;

    if (networkId) {
        // Configurar rede existente
        network = await configureNetwork(networkId);
    } else {
        // Criar nova rede
        network = await createNetwork();
    }

    if (network) {
        saveLocalConfig(network);
        showNetworkInfo(network);

        console.log('\n' + '='.repeat(60));
        success('CONFIGURAÇÃO CONCLUÍDA!');
        console.log('='.repeat(60));
        console.log('Agora você pode:');
        console.log('1. Conectar PCs: ./setup_zerotier.sh');
        console.log('2. Testar conectividade: ./test_zerotier_connectivity.sh');
        console.log('3. Monitorar rede: https://my.zerotier.com');
        console.log('='.repeat(60));
    } else {
        error('Falha na configuração da rede ZeroTier');
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
}

export { configureNetwork, createNetwork };








