#!/usr/bin/env node
/**
 * CORREÇÃO DAS FUNÇÕES RPC DO SUPABASE
 *
 * Executa SQL para corrigir dimensões dos vetores nas funções RPC
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixSupabaseVectors() {
    console.log('🔧 CORRIGINDO FUNÇÕES RPC DO SUPABASE...\n');

    // Carregar SQL
    const sqlPath = path.join(__dirname, '../supabase/fix_vector_dimensions.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL a ser executado:');
    console.log('='.repeat(50));
    console.log(sqlContent);
    console.log('='.repeat(50));
    console.log('');

    // IMPORTANTE: Esta operação requer privilégios administrativos no Supabase
    // Não pode ser executada via cliente JavaScript normal

    console.log('⚠️  AVISO IMPORTANTE:');
    console.log('Esta correção precisa ser executada MANUALMENTE no painel do Supabase:');
    console.log('');
    console.log('1. Acesse: https://supabase.com/dashboard/project/[project-id]/sql');
    console.log('2. Execute o SQL acima na aba "SQL Editor"');
    console.log('3. Clique em "Run"');
    console.log('');
    console.log('Após executar o SQL, teste novamente com:');
    console.log('node scripts/test_vector_search.js');
    console.log('');

    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. Executar SQL no Supabase Dashboard');
    console.log('2. Testar busca vetorial');
    console.log('3. Confirmar que memórias são encontradas');

    // Salvar instruções em arquivo para facilitar
    const instructionsPath = path.join(__dirname, '../SUPABASE_FIX_INSTRUCTIONS.md');
    const instructions = `# 🔧 CORREÇÃO DE DIMENSÕES DE VETORES NO SUPABASE

## 🚨 PROBLEMA IDENTIFICADO
- Sistema gera embeddings de **384 dimensões** (Xenova bge-small)
- Funções RPC esperam **768 dimensões**
- Resultado: Buscas vetoriais falham

## ✅ SOLUÇÃO
Executar o SQL abaixo no Supabase Dashboard:

\`\`\`sql
${sqlContent}
\`\`\`

## 📍 ONDE EXECUTAR
1. Acesse: [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para: **SQL Editor**
4. Cole o SQL acima
5. Clique: **Run**

## 🧪 COMO TESTAR
Após executar o SQL:
\`\`\`bash
cd "C:\\Users\\Ryzen\\Desktop\\GITHUB\\Coorporacao autonoma"
node scripts/test_vector_search.js
\`\`\`

## ✅ RESULTADO ESPERADO
- Buscas por "Reestruturação Completa" devem retornar ID 286
- Buscas por "AUDITORIA FINAL" devem retornar ID 285
- Similaridade deve ser > 80% para textos exatos

## 📞 SUPORTE
Se houver problemas, verificar:
- Privilégios administrativos no projeto
- Sintaxe SQL correta
- Logs de erro no Supabase
`;

    fs.writeFileSync(instructionsPath, instructions);
    console.log(`📝 Instruções salvas em: ${instructionsPath}`);
}

// Executar
fixSupabaseVectors();

