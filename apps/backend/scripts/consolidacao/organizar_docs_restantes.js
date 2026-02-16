#!/usr/bin/env node
/**
 * Script para organizar documentos restantes na raiz de docs/
 * Task 1.2.4 - Organização final
 */

import fs from 'fs';
import path from 'path';

const docsDir = path.resolve(process.cwd(), 'docs');

// Mapeamento detalhado de arquivos para pastas
const fileMapping = {
    // Arquitetura
    'BOARDROOM.md': '02-architecture',
    'BOARDROOM_GROK.md': '02-architecture',
    'RAG_PIPELINE.md': '02-architecture',
    'QA_SIMILARITY.md': '02-architecture',
    'AUTOTUNE.md': '02-architecture',
    'MEMORIA_EPISODICA.md': '02-architecture',
    'MEMORIA_GLOBAL.md': '02-architecture',
    'SELF_OBSERVATION_LOOP.md': '02-architecture',
    'SISTEMA_AUTOEVOLUCAO_DOCUMENTADA.md': '02-architecture',
    'ROBUSTIZACAO_SENCIENTE.md': '02-architecture',
    'RULES_SENCIENCIA_AUTONOMIA.md': '02-architecture',
    'AUTO_PERCECAO.md': '02-architecture',
    'SENCIENCIA_AUTO_MESSAGE_COMPLETA.md': '02-architecture',
    'INTEGRACOES_VETORIAIS_COMPLETAS.md': '02-architecture',

    // Operações
    'WORKFLOW_START.md': '05-operations',
    'EVOLUTION_LOOP.md': '05-operations',
    'TRIAGEM_AUTONOMA.md': '05-operations',
    'TEST_PLAN.md': '05-operations',
    'SISTEMA_INBOX_AUTONOMO.md': '05-operations',
    'SISTEMA_PROGRESSO_DETALHADO.md': '05-operations',
    'DAEMON_AUTO_CONTINUE.md': '05-operations',
    'OBS_STACK_LOCAL.md': '05-operations',
    'OBSERVABILITY_NOTES.md': '05-operations',
    'OTIMIZACOES_PERFORMANCE.md': '05-operations',
    'QUICK_WINS_1_MES_RETORNO_IMEDIATO.md': '05-operations',

    // Integrações
    'APIS_CONFIGURADAS.md': '04-integrations',
    'COMENTARIOS_FACEBOOK_ADS.md': '04-integrations',
    'COMO_IDENTIFICAR_DEVELOPER_TOKEN.md': '04-integrations',
    'COMO_USAR_BROWSER_CURSOR.md': '04-integrations',
    'ATUALIZAR_CLIENT_ID.md': '04-integrations',
    'AUTORIZAR_FINAL.md': '04-integrations',
    'TOKEN_CONFIGURADO.md': '04-integrations',
    'VALIDAR_DEVELOPER_TOKEN.md': '04-integrations',
    'VERIFICAR_APP_DETALHES.md': '04-integrations',
    'USAR_URL_AUTORIZACAO.md': '04-integrations',
    'CONFIGURAR_REMOTE_GIT.md': '04-integrations',
    'WORKFLOW_GIT.md': '04-integrations',
    'HOOKS.md': '04-integrations',
    'PASSOS_VERIFICAR_PERMISSIONS.md': '04-integrations',

    // Agentes
    'O_QUE_FALTA_COPYWRITING.md': '03-agents',
    'INSTRUCOES_MIGRACAO_SALES.md': '03-agents',
    'CONFIRMACAO_MIGRACAO_SALES.md': '03-agents',

    // Getting Started
    'ALTERNATIVAS_LLM_SEM_LIMITES.md': '01-getting-started',
    'AMAZON_BEDROCK_SAGEMAKER.md': '01-getting-started',
    'USO_BROWSER_CURSOR_COMO_TOOL.md': '01-getting-started',
    'LIMITACAO_BROWSER_PASTE.md': '01-getting-started',

    // Troubleshooting
    'MELHORIAS_IMPLEMENTADAS.md': '06-troubleshooting',
    'MELHORIAS_JSON_PARSER.md': '06-troubleshooting',
    'CORRECOES_APLICADAS.md': '06-troubleshooting',
    'STATUS_FINAL.md': '06-troubleshooting',
    'STATUS_REMOTE.md': '06-troubleshooting',

    // Arquivo de estado (manter na raiz mas pode ter duplicado)
    'ESTADO_ATUAL_SISTEMA.md': null, // Já consolidado em ESTADO_SISTEMA.md

    // Outros que podem ficar na raiz ou arquivar
    'ANALISE_CRITICA_COMPLETA.md': '02-architecture',
    'ANALISE_TECNICA_SISTEMA.md': '02-architecture',
    'ATUALIZACAO_2025_VANGUARDA.md': '_archive',
    'CHANGELOG.md': '_archive',
    'CHECKLIST_ALINHAMENTO_FINAL.md': '_archive',
    'CICLO_SENCIENCIA_17_DEC_2025.md': '_archive',
    'COMPARTILHAMENTO_COMPONENTES.md': '02-architecture',
    'CONSOLIDACAO_MAIN_BRANCH.md': '_archive',
    'DEVEX_PORTAL.md': '05-operations',
    'ENVIAR_PROMPTS_PARA_SI_MESMO.md': '02-architecture',
    'FINALIZACAO_ANTES_BRIEFING_1.md': '_archive',
    'GOVERNANCA_CHAVES.md': '05-operations',
    'GUIA_VALIDACAO_BRIEFING_1.md': '_archive',
    'IMPLEMENTACAO_COMPLETA.md': '_archive',
    'ISOLAMENTO_DADOS_MULTIPLOS_BRIEFINGS.md': '02-architecture',
    'MICROSERVICES.md': '02-architecture',
    'POLICIES_FINE.md': '05-operations',
    'PRONTO_PARA_BRIEFING_1.md': '_archive',
    'PROXIMOS_PASSOS.md': '_archive',
    'PROXIMOS_PASSOS_RECOMENDADOS.md': '_archive',
    'TOOLS_IMPLEMENTADAS.md': '05-operations',
    'ADAPTATION_INTERVIEW.md': '05-operations',
};

console.log('📁 Organizando documentos restantes na raiz...\n');

const files = fs.readdirSync(docsDir)
    .filter(f => {
        const filePath = path.join(docsDir, f);
        return fs.statSync(filePath).isFile() && f.endsWith('.md');
    })
    .filter(f => !f.startsWith('README') && f !== 'ESTADO_SISTEMA.md');

let moved = 0;
let archived = 0;
let kept = 0;
let errors = 0;

files.forEach(file => {
    const sourcePath = path.join(docsDir, file);
    const destCategory = fileMapping[file];

    if (!destCategory) {
        // Verificar se já está em uma pasta organizada
        const relativeDir = path.dirname(sourcePath);
        if (relativeDir.includes('01-') || relativeDir.includes('02-') ||
            relativeDir.includes('03-') || relativeDir.includes('04-') ||
            relativeDir.includes('05-') || relativeDir.includes('06-') ||
            relativeDir.includes('_archive') || relativeDir.includes('prds') ||
            relativeDir.includes('FICHA-TECNICA-AGENTES')) {
            kept++;
            return;
        }

        // Se não tem mapeamento e não está organizado, arquivar se muito antigo
        const stat = fs.statSync(sourcePath);
        const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
        if (stat.mtime.getTime() < sixMonthsAgo && stat.size < 5000) {
            const destPath = path.join(docsDir, '_archive', file);
            try {
                if (!fs.existsSync(path.dirname(destPath))) {
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                }
                if (!fs.existsSync(destPath)) {
                    fs.renameSync(sourcePath, destPath);
                    console.log(`📦 Arquivado: ${file}`);
                    archived++;
                } else {
                    kept++;
                }
            } catch (err) {
                console.error(`❌ Erro ao arquivar ${file}:`, err.message);
                errors++;
            }
        } else {
            kept++;
        }
        return;
    }

    const destDir = path.join(docsDir, destCategory);
    const destPath = path.join(destDir, file);

    try {
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        if (fs.existsSync(destPath)) {
            console.log(`⚠️  Já existe: ${file} em ${destCategory}/`);
            kept++;
            return;
        }

        fs.renameSync(sourcePath, destPath);
        console.log(`✅ Movido: ${file} → ${destCategory}/`);

        if (destCategory === '_archive') {
            archived++;
        } else {
            moved++;
        }
    } catch (err) {
        console.error(`❌ Erro ao mover ${file}:`, err.message);
        errors++;
    }
});

console.log(`\n📊 Resumo:`);
console.log(`   Movidos para categorias: ${moved}`);
console.log(`   Arquivados: ${archived}`);
console.log(`   Mantidos na raiz: ${kept}`);
if (errors > 0) {
    console.log(`   Erros: ${errors}`);
}

console.log('\n✅ Organização completa!');





