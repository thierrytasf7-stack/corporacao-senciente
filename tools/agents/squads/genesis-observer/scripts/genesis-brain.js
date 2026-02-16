import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { SystemScanner } from './system_scanner.js';

const MAX_BATCH_SIZE = 10;

class GenesisBrain {
    constructor() {
        this.projectRoot = process.cwd();
        this.storiesDir = path.join(this.projectRoot, 'docs', 'stories');
        this.isWindows = os.platform() === 'win32';
        this.scanner = new SystemScanner();
    }

    async execute() {
        this.logInfo('🧠 GENESIS BRAIN 3.1: Iniciando Protocolo de Isolamento de Contexto...');

        // 1. Discovery & Inventory Update
        const { inventory, report } = await this.scanner.scan();
        
        // 2. Dependency Safety Check (Locking)
        const lockedComponents = await this.getLockedComponents();
        this.logInfo(`🔒 Componentes bloqueados (já em evolução): ${lockedComponents.size > 0 ? Array.from(lockedComponents).join(', ') : 'Nenhum'}`);

        // 3. Batch Selection
        const batch = [];
        
        // Prioridade 1: Onboarding
        for (const newId of report.new) {
            if (batch.length >= MAX_BATCH_SIZE) break;
            if (lockedComponents.has(newId)) continue;
            const component = inventory.components[newId];
            batch.push({ type: 'onboarding', component });
            lockedComponents.add(newId);
        }

        // Prioridade 2: Evolução
        if (batch.length < MAX_BATCH_SIZE) {
            const candidates = this.selectCandidatesToEvolve(inventory, lockedComponents, MAX_BATCH_SIZE - batch.length);
            for (const comp of candidates) {
                batch.push({ type: 'evolution', component: comp });
            }
        }

        // 4. Execution
        if (batch.length === 0) {
            this.logInfo('💤 Nenhum trabalho seguro disponível.');
            return;
        }

        this.logInfo(`⚡ Lote Gerado: ${batch.length} tarefas. Disparando trabalhadores...`);
        
        for (const task of batch) {
            if (task.type === 'onboarding') {
                await this.generateOnboardingStory(task.component);
            } else {
                await this.generateEvolutionStory(task.component);
            }
        }

        this.logInfo(`🏁 Ciclo Genesis 3.1 concluído.`);
    }

        async getLockedComponents() {
            const locked = new Set();
            try {
                const files = await fs.readdir(this.storiesDir);
                for (const file of files) {
                    if (!file.endsWith('.md')) continue;
                    if (file.startsWith('activate_')) continue;
                    
                    // LÊ O CONTEÚDO PARA VERIFICAR SE JÁ FOI CONCLUÍDO
                    const content = await fs.readFile(path.join(this.storiesDir, file), 'utf8');
                    if (content.toUpperCase().includes('STATUS: COMPLETED')) {
                        continue; // Story concluída não bloqueia o componente para novas evoluções
                    }
    
                    let id = null;
                    if (file.startsWith('onboarding_')) id = file.replace('onboarding_', '').replace('.md', '');
                    else if (file.startsWith('evolution_')) {
                        const parts = file.split('_');
                        if (parts.length >= 2) id = parts[1];
                    }
                    if (id) locked.add(id);
                }
            } catch (e) {}
            return locked;
        }
    selectCandidatesToEvolve(inventory, lockedSet, limit) {
        const candidates = [];
        const components = Object.values(inventory.components).filter(c => c.status !== 'archived');
        components.sort((a, b) => {
            const majorA = parseInt(a.version.split('.')[0]);
            const majorB = parseInt(b.version.split('.')[0]);
            if (majorA !== majorB) return majorA - majorB;
            const dateA = a.last_evolution ? new Date(a.last_evolution.date).getTime() : 0;
            const dateB = b.last_evolution ? new Date(b.last_evolution.date).getTime() : 0;
            return dateA - dateB;
        });
        for (const comp of components) {
            if (candidates.length >= limit) break;
            if (lockedSet.has(comp.id)) continue;
            candidates.push(comp);
            lockedSet.add(comp.id);
        }
        return candidates;
    }

    async generateOnboardingStory(component) {
        const storyId = `GEN-ONB-${component.id.toUpperCase()}`;
        const filename = `onboarding_${component.id}.md`;
        const content = `# Story: Onboarding do Componente ${component.id}
ID: ${storyId}
Epic: System-Discovery-Onboarding
Status: TODO
subStatus: pending_worker
Revisions: 0

## Contexto
Novo componente detectado em \`${component.path}\`.
Caminho: \`${component.path}\`

## Objetivos
- [ ] Criar README.md técnico.
- [ ] Verificar integridade do manifesto.
- [ ] Registrar "active" no inventário.

## 🤖 Aider Prompt
> \`\`\`text
> Onboarding do componente "${component.id}".
> 1. ANALISE: \`${component.path}\`.
> 2. PADRONIZE: Garanta README e testes mínimos.
> 3. REGISTRE: Atualize ".aios/component_inventory.json".
> \`\`\`
`;
        await this.writeStory(filename, content);
    }

    async generateEvolutionStory(component) {
        const parts = component.version.split('.').map(Number);
        const nextPatch = `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
        const storyId = `GEN-EVO-${component.id.toUpperCase()}-v${nextPatch}`;
        const filename = `evolution_${component.id}_v${nextPatch}.md`;
        const agent = component.path.includes('infra') ? '@devops-aider' : '@dev-aider';
        const historyContext = component.evolution_history 
            ? component.evolution_history.slice(-3).map(h => `- v${h.version}: ${h.changes}`).join('\n')
            : 'Nenhuma evolução registrada anteriormente.';

        const content = `# Story: Evolução ${component.id} (v${component.version} -> v${nextPatch})
ID: ${storyId}
Epic: Continuous-Evolution
Status: TODO
subStatus: pending_worker
Revisions: 0

## Contexto
Componente: **${component.id}** | Versão Atual: **${component.version}**
Caminho: \`${component.path}\`

## 🔗 Cadeia de Contexto (Memória Evolutiva)
${historyContext}

## Critérios
- [ ] Análise do histórico via \`git log -p ${component.path}\`.
- [ ] Melhoria segura em \`${component.path}\`.
- [ ] **SemVer Atualizado**.

## 🤖 Aider Prompt
> \`\`\`text
> Olá ${agent}. Evolua "${component.id}" em "${component.path}" para v${nextPatch}.
> 🧠 CONTEXTO:
> ${historyContext}
> 1. INVESTIGUE: \`git log -p ${component.path}\`.
> 2. IMPLEMENTE: Melhoria incremental.
> 3. VERSIONAMENTO: Atualize ".aios/component_inventory.json".
> \`\`\`
`;
        await this.writeStory(filename, content);
    }

    async writeStory(filename, content) {
        const filePath = path.join(this.storiesDir, filename);
        try {
            await fs.mkdir(this.storiesDir, { recursive: true });
            await fs.writeFile(filePath, content, 'utf8');
            this.logSuccess(`[GENESIS] Story Gerada: ${filename}`);
        } catch (error) { this.logError(`Erro ao gravar story: ${error.message}`); }
    }

    logInfo(msg) { console.log(this.isWindows ? msg : `\x1b[36m${msg}\x1b[0m`); }
    logSuccess(msg) { console.log(this.isWindows ? msg : `\x1b[32m${msg}\x1b[0m`); }
    logError(msg) { console.error(this.isWindows ? msg : `\x1b[31m${msg}\x1b[0m`); }
}

new GenesisBrain().execute().catch(console.error);
