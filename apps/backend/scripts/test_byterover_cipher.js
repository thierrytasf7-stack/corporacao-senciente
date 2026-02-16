/**
 * Testes do ByteRover Cipher - Self-Hosted Code Interface
 */

import { ByteRoverCipher, createByteRoverInstance } from './byterover/byterover_cipher.js';

async function testByteRoverCipher() {
  console.log('🔐 Testando ByteRover Cipher...\n');

  let cipher;

  try {
    // Teste 1: Inicialização
    console.log('🚀 Teste 1: Inicialização do Cipher...');
    cipher = await createByteRoverInstance({
      projectRoot: process.cwd(),
      encryptionKey: 'test-key-123'
    });

    console.log('✅ ByteRover Cipher inicializado com sucesso');

    // Teste 2: Injeção de contexto
    console.log('\n💉 Teste 2: Injeção de contexto...');
    const context = await cipher.injectContext('test_context', {
      includeNodeModules: false,
      maxFiles: 100
    });

    console.log(`✅ Contexto injetado: ${context.id}`);
    console.log(`   Arquivos rastreados: ${context.trackedFiles.length}`);

    // Teste 3: Busca inteligente
    console.log('\n🔍 Teste 3: Busca inteligente...');
    const searchResults = await cipher.intelligentSearch('function|class|const', {
      maxResults: 10
    });

    console.log(`✅ Busca realizada:`);
    console.log(`   Total de matches: ${searchResults.totalMatches}`);
    console.log(`   Sugestões: ${searchResults.suggestions.slice(0, 5).join(', ')}`);

    // Teste 4: Análise de dependências
    console.log('\n🔗 Teste 4: Análise de dependências...');
    const mainFile = 'package.json'; // Arquivo que deve existir
    const dependencyMap = await cipher.analyzeDependencies(mainFile);

    console.log(`✅ Análise de dependências:`);
    console.log(`   Arquivo: ${dependencyMap.file}`);
    console.log(`   Dependências diretas: ${dependencyMap.direct.length}`);

    // Teste 5: Mapeamento visual de impacto
    console.log('\n🎨 Teste 5: Mapeamento visual de impacto...');
    const mockChanges = [
      {
        file: 'src/app.js',
        lines: 15,
        content: 'export function newFeature() { return true; }'
      },
      {
        file: 'package.json',
        lines: 2,
        content: '"version": "2.0.0"'
      }
    ];

    const impactMap = await cipher.mapVisualImpact(mockChanges);
    console.log(`✅ Mapeamento visual:`);
    console.log(`   Arquivos afetados: ${impactMap.affectedFiles.length}`);
    console.log(`   Mudanças breaking: ${impactMap.breakingChanges.length}`);
    console.log(`   Nível de risco: ${impactMap.riskLevel}`);

    // Teste 6: Gerenciamento de timeline
    console.log('\n⏰ Teste 6: Gerenciamento de timeline...');

    // Criar snapshot
    const snapshot = await cipher.manageTimeline('snapshot', {
      message: 'Teste de timeline'
    });
    console.log(`✅ Snapshot criado: ${snapshot.id}`);

    // Criar branch
    const branch = await cipher.manageTimeline('branch', {
      name: 'feature-test',
      purpose: 'teste'
    });
    console.log(`✅ Branch criado: ${branch.name}`);

    // Análise de evolução
    const evolution = await cipher.manageTimeline('analyze', {});
    console.log(`✅ Análise de evolução:`);
    console.log(`   Total de eventos: ${evolution.totalEvents}`);
    console.log(`   Branches criados: ${evolution.branchesCreated}`);

    // Teste 7: Análise de diff inteligente
    console.log('\n🔍 Teste 7: Análise de diff inteligente...');
    try {
      const diffAnalysis = await cipher.analyzeDiff('HEAD~1', 'HEAD');
      console.log(`✅ Análise de diff:`);
      console.log(`   Arquivos modificados: ${diffAnalysis.modifiedFiles.length}`);
      console.log(`   Adições: ${diffAnalysis.additions}`);
      console.log(`   Remoções: ${diffAnalysis.deletions}`);
    } catch (error) {
      console.log(`ℹ️ Diff não disponível (repositório novo): ${error.message}`);
    }

    // Teste 8: Snapshot encriptado
    console.log('\n🔒 Teste 8: Snapshot encriptado...');
    const encryptedSnapshot = await cipher.createEncryptedSnapshot('Teste de encriptação');
    console.log(`✅ Snapshot encriptado: ${encryptedSnapshot.id}`);

    // Teste 9: Estatísticas do sistema
    console.log('\n📊 Teste 9: Estatísticas do sistema...');
    const stats = cipher.getStats();
    console.log(`✅ Estatísticas:`);
    console.log(`   Contextos ativos: ${stats.contextsActive}`);
    console.log(`   Tamanho do cache: ${stats.cacheSize}`);
    console.log(`   Status do Git:`, stats.gitStatus);

    // Teste 10: Limpeza
    console.log('\n🧹 Teste 10: Limpeza do sistema...');
    cipher.cleanup();
    const statsAfterCleanup = cipher.getStats();
    console.log(`✅ Após limpeza:`);
    console.log(`   Contextos ativos: ${statsAfterCleanup.contextsActive}`);
    console.log(`   Cache: ${statsAfterCleanup.cacheSize}`);

    console.log('\n🎉 Todos os testes do ByteRover Cipher passaram!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error(error.stack);
  }
}

// Teste da CLI
async function testCLI() {
  console.log('\n💻 Testando interface CLI...');

  try {
    // Executar comando status
    const { spawn } = await import('child_process');
    const child = spawn('node', ['scripts/byterover/byterover_cipher.js', 'status'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ CLI status funcionou');
        console.log('📄 Output preview:', output.substring(0, 100) + '...');
      } else {
        console.log('❌ CLI falhou');
      }
    });

  } catch (error) {
    console.log('❌ Erro no teste CLI:', error.message);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testByteRoverCipher().then(() => {
    // Pequeno delay antes do teste CLI
    setTimeout(testCLI, 1000);
  });
}

export { testByteRoverCipher };





