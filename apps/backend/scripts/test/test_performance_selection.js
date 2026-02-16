import { performance } from 'perf_hooks';
import { getRouter } from '../swarm/router.js';

const TASKS = [
    "Criar endpoint API para login de usuários",
    "Otimizar query SQL que está lenta no dashboard",
    "Escrever copy para email de boas-vindas",
    "Configurar pipeline CI/CD no GitHub Actions",
    "Atualizar documentação da API de pagamentos",
    "Debugar erro de CORS no frontend",
    "Criar estratégia de SEO para blog",
    "Calcular ROI da campanha de marketing",
    "Monitorar uso de CPU nos servidores",
    "Refatorar componente React de tabela"
];

async function runPerformanceTest() {
    console.log("🚀 Iniciando Teste de Performance: Seleção de Agentes");

    const router = getRouter();
    const ITERATIONS = 5; // Reduzido para teste rápido de cache
    const results = [];

    // Warmup
    console.log("🔥 Aquecendo cache...");
    await router.findBestAgent("Task de aquecimento");

    console.log(`⏱️ Executando ${ITERATIONS} roteamentos...`);

    const startTotal = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
        const task = TASKS[Math.floor(Math.random() * TASKS.length)];

        const t0 = performance.now();
        const route = await router.findBestAgent(task);
        const t1 = performance.now();

        results.push({
            time: t1 - t0,
            task: task,
            agent: route.primaryAgent
        });

        if (i % 10 === 0) process.stdout.write('.');
    }

    const endTotal = performance.now();
    console.log("\n✅ Teste concluído.");

    // Análise
    const times = results.map(r => r.time);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);
    const totalTime = (endTotal - startTotal) / 1000; // segundos
    const throughput = ITERATIONS / totalTime;

    console.log("\n📊 Resultados:");
    console.log(`- Total Tasks: ${ITERATIONS}`);
    console.log(`- Tempo Total: ${totalTime.toFixed(2)}s`);
    console.log(`- Throughput: ${throughput.toFixed(2)} tasks/seg`);
    console.log(`- Tempo Médio por Task: ${avg.toFixed(2)}ms`);
    console.log(`- Tempo Mínimo: ${min.toFixed(2)}ms`);
    console.log(`- Tempo Máximo: ${max.toFixed(2)}ms`);

    if (avg > 1000) {
        console.warn("⚠️ ALERTA: Tempo médio de roteamento > 1s. Considere otimizar cache ou embedding.");
    } else {
        console.log("✨ Performance aceitável.");
    }
}

runPerformanceTest();
