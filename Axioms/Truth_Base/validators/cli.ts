#!/usr/bin/env node
/**
 * CLI para Validação de Consistência da Truth Base
 *
 * Uso:
 *   npx tsx validators/cli.ts validate "proposta aqui"
 *   npx tsx validators/cli.ts validate --file proposta.txt
 */

import { ConsistencyValidator, InputSource } from './consistency-validator';
import { readFile } from 'fs/promises';

const USAGE = `
Truth Base Consistency Validator CLI

USAGE:
  npx tsx validators/cli.ts validate <text>         # Validar texto direto
  npx tsx validators/cli.ts validate --file <path>  # Validar arquivo
  npx tsx validators/cli.ts --help                  # Mostrar ajuda

EXEMPLOS:
  npx tsx validators/cli.ts validate "usar docker para deploy"
  npx tsx validators/cli.ts validate --file proposal.txt

OPTIONS:
  --source <creator|ai|system>  # Fonte do input (default: ai)
  --save-log                    # Salvar log de validação
  --verbose                     # Output detalhado
`;

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(USAGE);
    process.exit(0);
  }

  const command = args[0];

  if (command !== 'validate') {
    console.error(`Erro: comando desconhecido "${command}"`);
    console.log(USAGE);
    process.exit(1);
  }

  // Parse options
  let inputText = '';
  let source: InputSource = InputSource.AI;
  let saveLog = false;
  let verbose = false;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--file') {
      const filePath = args[i + 1];
      if (!filePath) {
        console.error('Erro: --file requer caminho do arquivo');
        process.exit(1);
      }
      inputText = await readFile(filePath, 'utf-8');
      i++;
    } else if (arg === '--source') {
      const sourceStr = args[i + 1]?.toUpperCase();
      if (sourceStr === 'CREATOR' || sourceStr === 'AI' || sourceStr === 'SYSTEM') {
        source = InputSource[sourceStr as keyof typeof InputSource];
      } else {
        console.error('Erro: --source deve ser CREATOR, AI ou SYSTEM');
        process.exit(1);
      }
      i++;
    } else if (arg === '--save-log') {
      saveLog = true;
    } else if (arg === '--verbose') {
      verbose = true;
    } else if (!arg.startsWith('--')) {
      inputText = arg;
    }
  }

  if (!inputText) {
    console.error('Erro: nenhum texto para validar');
    console.log(USAGE);
    process.exit(1);
  }

  // Executar validação
  console.log('🔍 Validando input contra Truth Base...\n');

  const validator = new ConsistencyValidator();
  await validator.initialize();

  const result = await validator.validate(inputText, source);

  // Output formatado
  console.log(validator.formatResult(result));

  // Salvar log se solicitado
  if (saveLog) {
    await validator.saveValidationLog(result, 'CLI validation');
    console.log('\n💾 Log salvo em validators/logs/');
  }

  // Verbose output
  if (verbose) {
    console.log('\n=== DETALHES ===');
    console.log(JSON.stringify(result, null, 2));
  }

  // Exit code
  if (!result.valid) {
    console.log('\n❌ VALIDAÇÃO FALHOU');
    process.exit(1);
  } else {
    console.log('\n✅ VALIDAÇÃO PASSOU');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
