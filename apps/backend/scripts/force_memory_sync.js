
import { getLangMem } from './memory/langmem.js';

async function forceResetMemory() {
    const langmem = getLangMem();

    // 1. Gravar de Dados Mestre da Auditoria
    console.log('Forçando gravação da memória mestre...');

    const masterStatus = `
    STATUS ATUAL DO PROJETO: GOLD MASTER 1.0 (24/12/2025)
    
    FASE ATUAL: Concluída (Fase 6)
    
    COMPONENTES ENTREGUES:
    - CLI Unificado (senc)
    - Modo Autônomo (Daemon)
    - Frontend/Dashboard (Porta 3002)
    - Arquitetura Swarm (L.L.B.)
    - Documentação Completa (docs/)
    
    PRÓXIMOS PASSOS:
    - Limpeza de scripts obsoletos (1.3.1)
    - Refinamento visual do CLI (3.1.3)
    - Monitoramento avançado (4.2.3)
    `;

    await langmem.storeWisdom(masterStatus, 'architecture', { type: 'master_status' });

    // 2. Tentar recuperar imediatamente sem cache
    console.log('Tentando recuperação imediata...');

    // Burlar cache local
    langmem.cache.clear();

    const result = await langmem.getWisdom('status atual', 'architecture');
    console.log('Resultado:', result.length > 0 ? result[0].content : 'FALHA NA RECUPERAÇÃO');
}

forceResetMemory();
