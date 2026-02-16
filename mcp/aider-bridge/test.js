/**
 * Teste do Aider MCP Bridge
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testAiderInstallation() {
  console.log('🧪 Testando instalação do Aider...\n');
  
  try {
    const { stdout } = await execAsync('aider --version');
    console.log('✅ Aider instalado:');
    console.log(`   ${stdout.trim()}\n`);
    return true;
  } catch (error) {
    console.log('❌ Aider não encontrado');
    console.log('   Instale com: pip install aider-chat\n');
    return false;
  }
}

async function testMCPDependencies() {
  console.log('🧪 Testando dependências MCP...\n');
  
  try {
    await import('@modelcontextprotocol/sdk/server/index.js');
    console.log('✅ @modelcontextprotocol/sdk instalado\n');
    return true;
  } catch (error) {
    console.log('❌ @modelcontextprotocol/sdk não encontrado');
    console.log('   Instale com: npm install\n');
    return false;
  }
}

async function testSquadContext() {
  console.log('🧪 Testando criação de squad context...\n');
  
  const testContext = {
    worker_id: 'test_worker_001',
    squad_type: 'developer',
    description: 'Test squad context',
    tools: ['aider', 'git', 'python'],
    preferred_model: 'claude-sonnet-4',
    auto_commit: true,
    created_at: new Date().toISOString(),
  };
  
  console.log('✅ Squad context de teste criado:');
  console.log(JSON.stringify(testContext, null, 2));
  console.log();
  
  return true;
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║        AIDER MCP BRIDGE - TESTE DE INSTALAÇÃO           ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  const results = {
    aider: await testAiderInstallation(),
    mcp: await testMCPDependencies(),
    squad: await testSquadContext(),
  };
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 RESULTADO DOS TESTES:\n');
  console.log(`   Aider:         ${results.aider ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`   MCP SDK:       ${results.mcp ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`   Squad Context: ${results.squad ? '✅ OK' : '❌ FALHOU'}`);
  console.log();
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES PASSARAM!\n');
    console.log('Próximos passos:');
    console.log('1. Configure o MCP no Kiro: copie mcp-config.json para .kiro/settings/');
    console.log('2. Reinicie o Kiro para carregar o servidor MCP');
    console.log('3. Use os comandos: aider_execute, aider_squad_execute, etc.\n');
  } else {
    console.log('⚠️  ALGUNS TESTES FALHARAM\n');
    console.log('Corrija os problemas acima antes de usar o bridge.\n');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runTests().catch(console.error);
