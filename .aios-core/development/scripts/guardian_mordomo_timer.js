const fs = require('fs');
const path = require('path');

// Configurações de Caminhos e IDs
const STORY_FILENAME = '_00_mordomo_harvest_cycle.md';
const STORY_PATH = path.join(process.cwd(), 'docs/stories', STORY_FILENAME);
const AGENT_STATUS_PATH = 'C:/AIOS/agents/Mordomo_Guardian_Harvest_Cycle.json';
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

function isMordomoActive() {
    // 1. Verificar se o arquivo da Story já indica atividade ou pendência
    if (fs.existsSync(STORY_PATH)) {
        const content = fs.readFileSync(STORY_PATH, 'utf8');
        // Se estiver trabalhando, aguardando revisão, pendente no worker ou em erro
        if (content.includes('subStatus: working') || 
            content.includes('Status: WAITING_REVIEW') || 
            content.includes('subStatus: pending_worker') ||
            content.includes('subStatus: error')) {
            return true;
        }
    }

    // 2. Verificar se existe um worker registrado no diretório de agentes do AIOS
    if (fs.existsSync(AGENT_STATUS_PATH)) {
        try {
            const status = JSON.parse(fs.readFileSync(AGENT_STATUS_PATH, 'utf8'));
            // Aqui poderíamos verificar se o PID ainda é válido, mas o Guardian Rust 
            // já limpa agentes órfãos. Se o arquivo está lá, assumimos que está rodando.
            return true;
        } catch (e) {
            return false;
        }
    }

    return false;
}

function createHarvestStory() {
    const timestamp = new Date().toISOString();

    if (isMordomoActive()) {
        console.log(`[${new Date().toLocaleTimeString()}] Mordomo já está ativo ou aguardando revisão. Pulando ciclo.`);
        return;
    }

    const content = `# Story: Mordomo Guardian Harvest Cycle
Status: TODO
subStatus: pending_worker
Revisions: 0

## Contexto
[PRIORIDADE MÁXIMA] Ciclo automático de extração de conhecimento e auto-recuperação (Self-Healing).
Gerado em: ${timestamp}

## Critérios
- [ ] Extrair "ouro" dos logs dos últimos 5 minutos.
- [ ] Verificar saúde dos terminais (FROZEN/LOOP).
- [ ] Mover tasks travadas para o backlog com contexto.
- [ ] Finalizar processos zumbis.

## Aider Prompt
> \`\`\`text
> *run-workflow mordomo-guardian-extraction
> \`\`\`
`;

    try {
        fs.writeFileSync(STORY_PATH, content);
        console.log(`[${new Date().toLocaleTimeString()}] Mordomo Harvest Story criada com Prioridade.`);
    } catch (err) {
        console.error('Erro ao criar story do Mordomo:', err);
    }
}

console.log('Iniciando Mordomo Guardian Timer (5 min) com Check de Concorrência...');

// Executa imediatamente na primeira vez
createHarvestStory();

// Inicia o intervalo
setInterval(createHarvestStory, INTERVAL_MS);