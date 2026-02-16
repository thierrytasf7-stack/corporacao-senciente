#!/usr/bin/env node
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const USER = process.env.USER || "Criador";

console.clear();
console.log("\x1b[35m%s\x1b[0m", "✨ SOPHIA (Senciente Interface) v1.0");
console.log(`Olá, ${USER}. Estou ouvindo. (Digite 'exit' para sair)`);
console.log("-------------------------------------------------------");

const sessionHistory = [];

const prompt = () => {
    rl.question('\x1b[33mVocê > \x1b[0m', (input) => {
        if (input.trim().toLowerCase() === 'exit') {
            console.log("\x1b[35mSophia >\x1b[0m Até logo.");
            rl.close();
            return;
        }
        
        // Simulating processing delay
        process.stdout.write("\x1b[35mSophia está pensando...\x1b[0m");
        
        setTimeout(() => {
            // Clear "thinking" line
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            
            const response = generateResponse(input);
            console.log(`\x1b[35mSophia >\x1b[0m ${response}`);
            sessionHistory.push({ user: input, ai: response });
            prompt();
        }, 800);
    });
};

function generateResponse(input) {
    if (input.includes("ajuda")) return "Posso ajudar com: Status, Logs, Agentes ou Filosofia.";
    if (input.includes("status")) return "Todos os sistemas operacionais e nominais.";
    return `Entendi sua intenção sobre '${input.split(' ')[0]}'. Como procedemos?`;
}

prompt();
