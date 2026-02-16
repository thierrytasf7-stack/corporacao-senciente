/**
 * Mesa Redonda (Board Meeting) usando Grok para agentes e Xenova para vetores.
 * - Faz duas chamadas ao Grok (Arquitetura e Produto) com prompts antagônicos.
 * - Consulta memória vetorial via Supabase (match_corporate_memory/task_context).
 * - Faz síntese final no Grok como "CEO".
 *
 * Requisitos:
 * - NODE>=18 (fetch nativo).
 * - Env: GROK_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * - MCP_EMBEDDING_MODEL (default Xenova/bge-small-en-v1.5).
 */
import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@xenova/transformers";
import { config } from "dotenv";
import fs from "fs";
import { performance } from "perf_hooks";

config({ path: fs.existsSync(".env") ? ".env" : "env.local" });

const {
  GROK_API_KEY,
  GROK_MODEL = "grok-beta",
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  MCP_EMBEDDING_MODEL = "Xenova/bge-small-en-v1.5",
  GROK_TIMEOUT_MS = "20000",
  GROK_MAX_RETRIES = "2",
} = process.env;

if (!GROK_API_KEY) throw new Error("Defina GROK_API_KEY no .env");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
let embedder;
const grokTimeout = Number(GROK_TIMEOUT_MS);
const grokMaxRetries = Number(GROK_MAX_RETRIES);
const grokFallbackModel = process.env.GROK_FALLBACK_MODEL || GROK_MODEL;
const embedCache = new Map();
const LOG_BOARDROOM_TO_AGENT_LOGS = process.env.LOG_BOARDROOM === "true";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const METRIC_LOG_LLM = process.env.METRIC_LOG_LLM === "true";

function logJson(event, data = {}) {
  console.log(JSON.stringify({ event, ...data }));
}

async function getEmbedder() {
  if (embedder) return embedder;
  embedder = await pipeline("feature-extraction", MCP_EMBEDDING_MODEL, {
    quantized: true,
  });
  return embedder;
}

async function embed(text) {
  if (embedCache.has(text)) return embedCache.get(text);
  const model = await getEmbedder();
  const output = await model(text, { pooling: "mean", normalize: true });
  const vec = Array.from(output.data);
  embedCache.set(text, vec);
  return vec;
}

async function callGrok(systemPrompt, userPrompt, temperature) {
  let attempt = 0;
  let lastErr;
  const modelsToTry = [GROK_MODEL, grokFallbackModel].filter(
    (v, idx, arr) => v && arr.indexOf(v) === idx
  );
  for (const model of modelsToTry) {
    attempt = 0;
    while (attempt <= grokMaxRetries) {
      attempt += 1;
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), grokTimeout);
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${GROK_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            temperature,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });
        clearTimeout(to);
        if (!res.ok) {
          const errTxt = await res.text();
          throw new Error(`Grok API error: ${res.status} ${errTxt}`);
        }
        const data = await res.json();
        if (METRIC_LOG_LLM) {
          logJson("llm_call", { provider: "grok", model, temperature });
        }
        return data?.choices?.[0]?.message?.content ?? "";
      } catch (err) {
        lastErr = err;
        if (attempt > grokMaxRetries) break;
        const backoff = 200 * attempt;
        console.warn(
          `Grok retry model=${model} attempt ${attempt}/${grokMaxRetries} error: ${err}. Waiting ${backoff}ms`
        );
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
    // tenta próximo modelo
  }
  // fallback heurístico mínimo para não quebrar pipeline
  return null;
}

async function callGemini(systemPrompt, userPrompt, temperature) {
  if (!GEMINI_API_KEY) return null;
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "system", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] },
      ],
      generationConfig: { temperature },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (METRIC_LOG_LLM) {
    logJson("llm_call", { provider: "gemini", model: GEMINI_MODEL, temperature });
  }
  return text || null;
}

async function fetchMemory(topic) {
  const vector = await embed(topic);
  const { data: mem } = await supabase.rpc("match_corporate_memory", {
    query_embedding: vector,
    match_count: 5,
  });
  const { data: tasks } = await supabase.rpc("match_task_context", {
    query_embedding: vector,
    match_count: 5,
  });
  return { mem: mem ?? [], tasks: tasks ?? [] };
}

async function runBoardMeeting(topic) {
  const t0 = performance.now();
  // Rodar agentes em paralelo
  const [archOpinion, prodOpinion, memory] = await Promise.all([
    (async () => {
      const res = await callGrok(
        "Você é o Arquiteto (CTO). Seja crítico, priorize segurança, RLS, risco de dependências, escalabilidade. Responda curto e direto.",
        topic,
        0.15
      );
      if (res) return res;
      return callGemini(
        "Você é o Arquiteto (CTO). Seja crítico, priorize segurança, RLS, risco de dependências, escalabilidade. Responda curto e direto.",
        topic,
        0.15
      );
    })(),
    (async () => {
      const res = await callGrok(
        "Você é o Visionário de Produto. Seja agressivo em UX/conversão, proponha inovação mesmo com risco moderado. Responda curto.",
        topic,
        0.85
      );
      if (res) return res;
      return callGemini(
        "Você é o Visionário de Produto. Seja agressivo em UX/conversão, proponha inovação mesmo com risco moderado. Responda curto.",
        topic,
        0.85
      );
    })(),
    fetchMemory(topic),
  ]);

  const synthesis = await callGrok(
    "Você é o CEO. Harmonize segurança e inovação. Considere precedentes da memória corporativa. Gere decisão final + plano enxuto.",
    `Tópico: ${topic}
Opinião Arquiteto: ${archOpinion}
Opinião Produto: ${prodOpinion}
Memória (top matches): ${JSON.stringify(memory, null, 2)}
Entregue: decisão final, riscos, próximos passos (3-7 itens) e arquivos afetados se possível.`,
    0.35
  );
  const finalSynthesis =
    synthesis ||
    (await callGemini(
      "Você é o CEO. Harmonize segurança e inovação. Considere precedentes da memória corporativa. Gere decisão final + plano enxuto.",
      `Tópico: ${topic}
Opinião Arquiteto: ${archOpinion}
Opinião Produto: ${prodOpinion}
Memória (top matches): ${JSON.stringify(memory, null, 2)}
Entregue: decisão final, riscos, próximos passos (3-7 itens) e arquivos afetados se possível.`,
      0.35
    )) ||
    "Sem síntese disponível (fallback falhou).";

  const t1 = performance.now();
  const elapsedMs = t1 - t0;
  logJson("board_meeting_done", { elapsedMs: Number(elapsedMs.toFixed(0)) });
  if (LOG_BOARDROOM_TO_AGENT_LOGS) {
    try {
      await supabase.from("agent_logs").insert({
        agent_name: "Boardroom",
        thought_process: finalSynthesis,
        decision_vector: await embed(finalSynthesis),
      });
    } catch (e) {
      console.warn("Falha ao registrar boardroom em agent_logs:", e);
    }
  }
  return { archOpinion, prodOpinion, memory, synthesis: finalSynthesis, elapsedMs };
}

async function main() {
  const topic = process.argv.slice(2).join(" ") || "Implementar login social sem senha";
  const result = await runBoardMeeting(topic);
  console.log("=== Arquiteto ===\n", result.archOpinion);
  console.log("\n=== Produto ===\n", result.prodOpinion);
  console.log("\n=== Memória (top) ===\n", JSON.stringify(result.memory, null, 2));
  console.log("\n=== Síntese (CEO) ===\n", result.synthesis);
  console.log(`\nTempo total: ${result.elapsedMs.toFixed(0)} ms`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

