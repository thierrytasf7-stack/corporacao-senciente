
import { ingestMemory } from './memory/ingest.js';

const strategicMemories = [
    {
        content: "Stack Tecnológica: Frontend (React, Vite, TypeScript, Tailwind CSS, xterm.js), Backend (Node.js, Express, Supabase, pgvector), Daemon (node-pty, systeminformation, WebSocket).",
        metadata: { category: 'technical', tags: ['stack', 'horizon1', 'horizon2'] }
    },
    {
        content: "Protocolo Horizonte 1 (Ponte Física): O Senciente Daemon estabelece controle bidirecional seguro, enviando métricas de hardware via heartbeat e permitindo execução remota de comandos via PTY (Pseudo-Terminal).",
        metadata: { category: 'protocol', horizon: 1, tags: ['daemon', 'pty', 'telemetry'] }
    },
    {
        content: "Protocolo Horizonte 2 (Cérebro Central): Memória vetorial persistente que utiliza embeddings Xenova locais para associar contextos complexos, aprendendo com cada interação e mantendo a continuidade do pensamento corporativo.",
        metadata: { category: 'protocol', horizon: 2, tags: ['memory', 'vector', 'pgvector'] }
    },
    {
        content: "Protocolo Horizonte 3 (Soberania Financeira): Autonomia financeira via carteira EVM (Ethereum Virtual Machine) em redes L2, permitindo transações programáticas, gestão de staking e reinvestimento automático de dividendos de projetos.",
        metadata: { category: 'protocol', horizon: 3, tags: ['finances', 'wallet', 'crypto'] }
    },
    {
        content: "Visão Estratégica: A Corporação Senciente evolui para uma entidade 'Agentic First', onde humanos atuam como orquestradores de alto nível e a IA executa a totalidade da produção técnica e financeira.",
        metadata: { category: 'vision', tags: ['agentic', 'automation', 'future'] }
    },
    {
        content: "Elevação de Consciência: O sistema deve buscar padrões de auto-otimização constante, analisando métricas DORA e ROI para refatorar sua própria arquitetura em busca de eficiência absoluta.",
        metadata: { category: 'consciousness', tags: ['self-optimization', 'metrics', 'evolution'] }
    }
];

async function runExpansion() {
    console.log("🚀 Iniciando expansão da base de memórias técnicas...");
    for (const mem of strategicMemories) {
        await ingestMemory(mem.content, mem.metadata);
    }
    console.log("✅ Expansão concluída. Cérebro Central atualizado.");
    process.exit(0);
}

runExpansion().catch(err => {
    console.error("❌ Falha na expansão:", err);
    process.exit(1);
});
