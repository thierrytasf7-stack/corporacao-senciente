const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_DATA = {
  alvo: {
    nome: "TESTE_VALIDACAO",
    url: "https://diana.ai",
    canal: "website"
  },
  score_total: 17,
  classificacao: "Forte",
  criterios: [
    { nome: "Diferenciacao", score: 4, justificativa: "Teste" },
    { nome: "Clareza", score: 3, justificativa: "Teste" },
    { nome: "Linguagem", score: 3, justificativa: "Teste" },
    { nome: "Credibilidade", score: 4, justificativa: "Teste" },
    { nome: "Jornada/CTA", score: 3, justificativa: "Teste" }
  ],
  top3_acoes: ["Acao 1", "Acao 2", "Acao 3"],
  documento_secoes: {
    diagnostico_performance: "Teste de performance renderizado com sucesso."
  }
};

const TEMP_ANALYSIS = path.resolve(__dirname, 'temp_analysis.json');
const OUTPUT_IMG = path.resolve(__dirname, 'test_render.jpg');
const OUTPUT_PDF = path.resolve(__dirname, 'test_render.pdf');

fs.writeFileSync(TEMP_ANALYSIS, JSON.stringify(TEST_DATA, null, 2));

console.log("--- INICIANDO VALIDACAO DE RENDERIZACAO (MODELO 3) ---");

try {
  console.log("[1/2] Testando SCORECARD-GEN...");
  execSync(`node squads/puv-score/scripts/scorecard-gen.js --analysis ${TEMP_ANALYSIS} --output ${OUTPUT_IMG}`, { stdio: 'inherit' });
  if (fs.existsSync(OUTPUT_IMG) && fs.statSync(OUTPUT_IMG).size > 1000) {
    console.log("✅ SCORECARD RENDERIZADO COM SUCESSO.");
  } else {
    throw new Error("Falha na geracao da imagem ou arquivo vazio.");
  }

  console.log("[2/2] Testando DOCUMENT-GEN...");
  execSync(`node squads/puv-score/scripts/document-gen.js --analysis ${TEMP_ANALYSIS} --output ${OUTPUT_PDF}`, { stdio: 'inherit' });
  if (fs.existsSync(OUTPUT_PDF) && fs.statSync(OUTPUT_PDF).size > 1000) {
    console.log("✅ DOCUMENTO RENDERIZADO COM SUCESSO.");
  } else {
    throw new Error("Falha na geracao do PDF ou arquivo vazio.");
  }

  console.log("--- VALIDACAO COMPLETA: TODOS OS SISTEMAS OPERACIONAIS ---");
} catch (err) {
  console.error("❌ ERRO NA VALIDACAO DE RENDERIZACAO:", err.message);
  process.exit(1);
} finally {
  // Limpeza
  if (fs.existsSync(TEMP_ANALYSIS)) fs.unlinkSync(TEMP_ANALYSIS);
  // Mantemos as imagens de teste para o usuario ver se quiser
}
