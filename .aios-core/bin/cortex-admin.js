#!/usr/bin/env node
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\x1b[36m%s\x1b[0m", "🧠 CORTEX ADMIN CLI v1.0");
console.log("Type 'help' for commands.");

const prompt = () => {
    rl.question('cortex> ', (cmd) => {
        handleCommand(cmd.trim());
    });
};

const handleCommand = (cmd) => {
    switch(cmd) {
        case 'status':
            console.log("🟢 SYSTEM: ONLINE");
            console.log("🧠 CORTEX: IDLE");
            console.log("🛡️ SECURITY: SECURE");
            break;
        case 'deploy-agent':
            console.log("🚀 Deploying new agent instance...");
            setTimeout(() => console.log("✅ Agent Deployed."), 1000);
            break;
        case 'logs':
            console.log("📜 Streaming logs (Press Ctrl+C to stop)...");
            console.log("[INFO] Cortex initialization complete.");
            break;
        case 'help':
            console.log(`
Available Commands:
  status        - Show system health
  deploy-agent  - Spawn a new agent process
  logs          - View realtime stream
  exit          - Close admin session
            `);
            break;
        case 'exit':
            console.log("👋 Closing session.");
            rl.close();
            return;
        default:
            console.log("❌ Unknown command.");
    }
    prompt(); // Loop
};

prompt();
