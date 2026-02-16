import BrainArmsDaemon from '../daemon/brain_arms_daemon.js';
import { logger } from '../utils/logger.js';

// Silencia logs para o teste
logger.level = 'error';

async function test() {
    console.log("🧪 Testando inicialização do Daemon...");
    const daemon = new BrainArmsDaemon();

    // Configura intervalo curto para teste
    daemon.thinkInterval = 1000;

    try {
        await daemon.start();
        console.log("✅ Daemon iniciou com sucesso.");

        console.log("⏳ Aguardando ciclo...");
        await new Promise(r => setTimeout(r, 1500));

        const status = daemon.getStatus();
        console.log("📊 Status capturado:", status.state);

        await daemon.stop();
        console.log("✅ Daemon parou com sucesso.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Falha no teste do daemon:", e);
        process.exit(1);
    }
}

test();
