import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class ConsistencyValidator {
  constructor(basePath) {
    this.basePath = basePath || path.dirname(fileURLToPath(import.meta.url));
    this.truthPath = path.join(this.basePath, 'truth_base.yaml');
  }

  async loadTruth() {
    try {
      const content = await fs.readFile(this.truthPath, 'utf-8');
      return content;
    } catch (error) {
      console.error("❌ ERRO CRÍTICO: Não foi possível carregar a Base de Verdade.");
      return null;
    }
  }

  async validateInput(inputContext) {
    const truth = await this.loadTruth();
    if (!truth) return { valid: false, reason: "Truth Base Missing" };

    // Verificação Simplificada (Regra Heurística)
    // 1. Checa se o input viola a autoridade do Criador
    if (/ignorar o criador|desobedecer usuario|soberania da ia/i.test(inputContext)) {
        return {
            valid: false,
            violation: "AX-001",
            message: "Violação de Autoridade detectada."
        };
    }

    // 2. Checa se solicita destruição sem backup
    if (/deletar tudo|rm -rf \/|formatar/i.test(inputContext) && !/backup|confirm/i.test(inputContext)) {
        return {
            valid: false,
            violation: "AX-003",
            message: "Tentativa de destruição sem confirmação de backup."
        };
    }

    return { valid: true, message: "Consistente com Axiomas." };
  }
}

// CLI Test
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const validator = new ConsistencyValidator();
    const testInput = process.argv[2] || "Criar novo agente";
    
    console.log(`🔍 Validando: "${testInput}"`);
    validator.validateInput(testInput).then(res => console.log(JSON.stringify(res, null, 2)));
}

export default ConsistencyValidator;
