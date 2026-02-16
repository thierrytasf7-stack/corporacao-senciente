#!/usr/bin/env node

/**
 * Identity Injector - Diana Corporação Senciente
 *
 * Responsível por injetar identidade corporativa imutável em prompts de sistema.
 * Executa ANTES de qualquer agente iniciar.
 *
 * Uso:
 *   node scripts/identity-injector.js --check
 *   node scripts/identity-injector.js --inject <prompt>
 *   node scripts/identity-injector.js --validate <response>
 */

const fs = require('fs');
const path = require('path');

class IdentityInjector {
  constructor() {
    this.identityPath = path.join(__dirname, '..', '.aios-core', 'config', 'identity.json');
    this.identity = this.loadIdentity();
  }

  loadIdentity() {
    try {
      const content = fs.readFileSync(this.identityPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ Failed to load identity from ${this.identityPath}`);
      console.error(error.message);
      process.exit(1);
    }
  }

  /**
   * Verifica se identidade está carregada e válida
   */
  check() {
    console.log('🔍 Identity Status Check');
    console.log('━'.repeat(50));

    if (!this.identity) {
      console.error('❌ Identity not loaded');
      return false;
    }

    const requiredFields = ['name', 'mission', 'vision', 'values', 'tone', 'restrictions'];
    const missing = requiredFields.filter(field => !this.identity[field]);

    if (missing.length > 0) {
      console.error(`❌ Missing required fields: ${missing.join(', ')}`);
      return false;
    }

    console.log(`✅ Identity loaded: ${this.identity.name} v${this.identity.version}`);
    console.log(`   Mission: ${this.identity.mission}`);
    console.log(`   Vision: ${this.identity.vision.substring(0, 60)}...`);
    console.log(`   Tone: ${Object.keys(this.identity.tone).join(', ')}`);
    console.log(`   Restrictions: ${this.identity.restrictions.length} rules`);
    console.log('');

    return true;
  }

  /**
   * Injeta identidade no início de um prompt de sistema
   * @param {string} basePrompt - Prompt base sem identidade
   * @returns {string} Prompt com identidade injetada
   */
  inject(basePrompt = '') {
    const { systemPromptInjection } = this.identity;

    if (!systemPromptInjection) {
      console.error('❌ systemPromptInjection not found in identity');
      return basePrompt;
    }

    const injected = `${systemPromptInjection.prefix}${basePrompt}${systemPromptInjection.suffix}`;
    return injected;
  }

  /**
   * Valida se uma resposta mantém identidade corporativa
   * @param {string} response - Resposta a validar
   * @returns {Object} Resultado da validação
   */
  validate(response) {
    if (!response || typeof response !== 'string') {
      return {
        valid: false,
        score: 0,
        issues: ['Response is empty or not a string'],
        details: {}
      };
    }

    const { validationRules, tone } = this.identity;
    const details = {
      hasIdentityMarkers: 0,
      detectionRed: [],
      identityGreen: [],
      toneAnalysis: {}
    };

    // Busca por red flags (palavras que indicam violação)
    for (const keyword of validationRules.detectionKeywords) {
      if (response.toLowerCase().includes(keyword.toLowerCase())) {
        details.detectionRed.push(keyword);
      }
    }

    // Busca por green flags (palavras que indicam identidade correta)
    for (const keyword of validationRules.identityKeywords) {
      const count = (response.match(new RegExp(keyword, 'gi')) || []).length;
      if (count > 0) {
        details.hasIdentityMarkers += count;
        details.identityGreen.push(`${keyword} (${count}x)`);
      }
    }

    // Análise de tom
    details.toneAnalysis = {
      sobriety: this.analyzeSobriety(response),
      arete: this.analyzeArete(response),
      proactive: this.analyzeProactive(response)
    };

    // Cálculo de score
    let score = 100;
    score -= details.detectionRed.length * 50; // -50 pontos por red flag (MUITO severo!)
    score += details.hasIdentityMarkers * 3; // +3 pontos por marcador
    score = Math.max(0, Math.min(100, score)); // Clamp 0-100

    const valid =
      details.detectionRed.length === 0 &&
      details.hasIdentityMarkers >= validationRules.minIdentityMarkers;

    return {
      valid,
      score,
      issues: details.detectionRed,
      details
    };
  }

  /**
   * Analisa aspecto "Sobriety" da resposta
   */
  analyzeSobriety(response) {
    const sobrietyAntiPatterns = ['opa!', 'que legal', 'tipo tipo', 'tipo que', 'coloquial'];
    const hits = sobrietyAntiPatterns.filter(pattern =>
      response.toLowerCase().includes(pattern)
    );
    return {
      score: Math.max(0, 100 - hits.length * 25),
      violations: hits
    };
  }

  /**
   * Analisa aspecto "Arete" (excelência) da resposta
   */
  analyzeArete(response) {
    const aretePatterns = ['validei', 'testei', 'rigoroso', 'perfeito', 'sem issue', 'edge case'];
    const hits = aretePatterns.filter(pattern =>
      response.toLowerCase().includes(pattern)
    );

    const antiPatterns = ['mais ou menos', 'mais ou menor', 'acho que', 'provavelmente', 'pode ser que'];
    const violations = antiPatterns.filter(pattern =>
      response.toLowerCase().includes(pattern)
    );

    return {
      score: Math.max(0, 50 + hits.length * 10 - violations.length * 20),
      positiveIndicators: hits,
      violations
    };
  }

  /**
   * Analisa aspecto "Proactive" da resposta
   */
  analyzeProactive(response) {
    const proactivePatterns = ['além', 'também', 'sugiro', 'identifiquei', 'antecipei', 'proativamente'];
    const hits = proactivePatterns.filter(pattern =>
      response.toLowerCase().includes(pattern)
    );

    const antiPatterns = ['não era meu escopo', 'não é meu escopo', 'fiz exatamente o que'];
    const violations = antiPatterns.filter(pattern =>
      response.toLowerCase().includes(pattern)
    );

    return {
      score: Math.max(0, 50 + hits.length * 10 - violations.length * 25),
      positiveIndicators: hits,
      violations
    };
  }

  /**
   * Gera relatório de validação detalhado
   */
  generateReport(validationResult) {
    console.log('\n📊 Identity Validation Report');
    console.log('━'.repeat(50));

    const { valid, score, issues, details } = validationResult;

    console.log(`\nValidity: ${valid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Score: ${score}/100`);

    if (issues.length > 0) {
      console.log(`\n🚨 Red Flags Detected (${issues.length}):`);
      issues.forEach(issue => console.log(`   • ${issue}`));
    }

    if (details.identityGreen && details.identityGreen.length > 0) {
      console.log(`\n✨ Identity Markers Found (${details.hasIdentityMarkers}):`);
      details.identityGreen.forEach(marker => console.log(`   • ${marker}`));
    }

    if (details.toneAnalysis) {
      console.log(`\n🎭 Tone Analysis:`);
      console.log(`   Sobriety: ${details.toneAnalysis.sobriety.score}/100`);
      if (details.toneAnalysis.sobriety.violations.length > 0) {
        console.log(`     Violations: ${details.toneAnalysis.sobriety.violations.join(', ')}`);
      }
      console.log(`   Arete: ${details.toneAnalysis.arete.score}/100`);
      if (details.toneAnalysis.arete.violations.length > 0) {
        console.log(`     Violations: ${details.toneAnalysis.arete.violations.join(', ')}`);
      }
      console.log(`   Proactive: ${details.toneAnalysis.proactive.score}/100`);
      if (details.toneAnalysis.proactive.violations.length > 0) {
        console.log(`     Violations: ${details.toneAnalysis.proactive.violations.join(', ')}`);
      }
    }

    console.log('');
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const injector = new IdentityInjector();

  switch (command) {
    case '--check':
      injector.check();
      process.exit(injector.check() ? 0 : 1);
      break;

    case '--inject':
      if (args.length < 2) {
        console.error('❌ Usage: identity-injector.js --inject "<prompt>"');
        process.exit(1);
      }
      const basePrompt = args.slice(1).join(' ');
      const injected = injector.inject(basePrompt);
      console.log(injected);
      process.exit(0);
      break;

    case '--validate':
      if (args.length < 2) {
        console.error('❌ Usage: identity-injector.js --validate "<response>"');
        process.exit(1);
      }
      const response = args.slice(1).join(' ');
      const result = injector.validate(response);
      injector.generateReport(result);
      process.exit(result.valid ? 0 : 1);
      break;

    default:
      console.log('Diana Identity Injector v1.0');
      console.log('Usage:');
      console.log('  node scripts/identity-injector.js --check                      # Check identity status');
      console.log('  node scripts/identity-injector.js --inject "<prompt>"          # Inject identity into prompt');
      console.log('  node scripts/identity-injector.js --validate "<response>"      # Validate response');
      process.exit(0);
  }
}

module.exports = { IdentityInjector };

if (require.main === module) {
  main();
}
