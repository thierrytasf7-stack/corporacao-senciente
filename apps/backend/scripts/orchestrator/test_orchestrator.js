/**
 * Teste do Orquestrador Central
 * 
 * Script de teste para validar funcionamento do coordenador
 */

import { initializeCoordinator, getCoordinatorStatus } from './core.js';
import { listInstances, loadInstanceContext } from './instance_manager.js';
import { listComponents, getCatalogStats } from './component_catalog.js';
import { getGlobalMemoryStats } from './global_memory.js';

async function testOrchestrator() {
  console.log('\n🧪 Testando Orquestrador Central...\n');

  try {
    // 1. Testar inicialização
    console.log('1️⃣  Testando inicialização...');
    await initializeCoordinator();
    const status = getCoordinatorStatus();
    console.log('   ✅ Status:', status);

    // 2. Testar listagem de instâncias
    console.log('\n2️⃣  Testando listagem de instâncias...');
    const instances = listInstances();
    console.log(`   ✅ ${instances.length} instância(s) encontrada(s):`, instances);

    if (instances.length > 0) {
      // 3. Testar carregamento de contexto
      console.log(`\n3️⃣  Testando carregamento de contexto (${instances[0]})...`);
      const context = await loadInstanceContext(instances[0]);
      console.log('   ✅ Contexto carregado:', {
        instanceName: context.instanceName,
        status: context.status,
      });
    }

    // 4. Testar catálogo
    console.log('\n4️⃣  Testando catálogo de componentes...');
    const components = listComponents();
    const stats = getCatalogStats();
    console.log(`   ✅ ${components.length} componente(s) no catálogo`);
    console.log('   ✅ Estatísticas:', stats);

    // 5. Testar memória global
    console.log('\n5️⃣  Testando memória global...');
    const memoryStats = await getGlobalMemoryStats();
    if (memoryStats) {
      console.log('   ✅ Estatísticas de memória:', memoryStats);
    } else {
      console.log('   ⚠️  Memória global não configurada');
    }

    console.log('\n✅ Todos os testes passaram!\n');
  } catch (error) {
    console.error('\n❌ Erro nos testes:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testOrchestrator().catch(console.error);
}

export { testOrchestrator };






























