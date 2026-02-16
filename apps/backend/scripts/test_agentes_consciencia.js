/**
 * Script de teste para agentes com consciência corporativa
 */

import { criarTodosAgentes, obterConscienciaCompleta } from './agents/index.js';

async function testarConsciencia() {
  console.log('\n🧠 Testando Consciência Corporativa...\n');

  try {
    const consciencia = await obterConscienciaCompleta('implementar login social sem senha');
    
    console.log('✅ Consciência obtida com sucesso!\n');
    console.log('📋 Missão (primeiros 300 chars):');
    console.log(consciencia.missao.substring(0, 300) + '...\n');
    
    console.log('💎 Valores (primeiros 400 chars):');
    console.log(consciencia.valores.substring(0, 400) + '...\n');
    
    console.log(`📊 Memórias relevantes encontradas: ${consciencia.memoriasRelevantes.length}\n`);
    
    if (consciencia.memoriasRelevantes.length > 0) {
      console.log('Top 3 memórias relevantes:');
      consciencia.memoriasRelevantes.slice(0, 3).forEach((m, idx) => {
        console.log(`  ${idx + 1}. [${m.categoria}] ${m.label}`);
        console.log(`     Similaridade: ${(m.similaridade * 100).toFixed(1)}%`);
        console.log(`     Conteúdo: ${m.conteudo.substring(0, 150)}...\n`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao testar consciência:', error.message);
    console.error(error);
    return false;
  }
}

async function testarAgentes() {
  console.log('\n🤖 Testando Agentes...\n');

  const topic = 'Implementar sistema de autocura de código (self-healing)';

  try {
    const agentes = criarTodosAgentes();
    
    console.log(`Tópico: "${topic}"\n`);
    console.log('Solicitando opiniões dos agentes...\n');

    // Testar apenas Architect e Product por enquanto (mais rápido)
    const [architect, product] = await Promise.all([
      agentes.architect.analisarERegistrar(topic),
      agentes.product.analisarERegistrar(topic),
    ]);

    console.log('='.repeat(60));
    console.log('🏛️  ARCHITECT:');
    console.log('='.repeat(60));
    console.log(architect.opiniao);
    console.log(`\n✅ Alinhamento: ${architect.validacao.alinhado ? 'SIM' : 'NÃO'} (${(architect.validacao.similaridade * 100).toFixed(1)}%)`);
    if (architect.validacao.aviso) {
      console.log(`⚠️  ${architect.validacao.aviso}`);
    }
    console.log('\n');

    console.log('='.repeat(60));
    console.log('💡 PRODUCT:');
    console.log('='.repeat(60));
    console.log(product.opiniao);
    console.log(`\n✅ Alinhamento: ${product.validacao.alinhado ? 'SIM' : 'NÃO'} (${(product.validacao.similaridade * 100).toFixed(1)}%)`);
    if (product.validacao.aviso) {
      console.log(`⚠️  ${product.validacao.aviso}`);
    }
    console.log('\n');

    return true;
  } catch (error) {
    console.error('❌ Erro ao testar agentes:', error.message);
    console.error(error);
    return false;
  }
}

async function main() {
  console.log('🚀 TESTE DE AGENTES COM CONSCIÊNCIA CORPORATIVA');
  console.log('='.repeat(60));

  const conscienciaOk = await testarConsciencia();
  
  if (!conscienciaOk) {
    console.log('\n⚠️  Consciência falhou, pulando teste de agentes');
    return;
  }

  // Só testar agentes se tiver chaves LLM configuradas
  const { GEMINI_API_KEY, GROK_API_KEY } = process.env;
  if (!GEMINI_API_KEY && !GROK_API_KEY) {
    console.log('\n⚠️  GEMINI_API_KEY ou GROK_API_KEY não configuradas, pulando teste de agentes');
    console.log('   Configure no env.local para testar opiniões dos agentes');
    return;
  }

  await testarAgentes();

  console.log('='.repeat(60));
  console.log('✅ Teste concluído!');
  console.log('='.repeat(60));
}

main().catch(console.error);






























