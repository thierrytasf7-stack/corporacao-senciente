import { config } from "dotenv";
import fs from "fs";

config({ path: fs.existsSync(".env") ? ".env" : "env.local" });

console.log("🔍 Verificando configuração do MCP...\n");

const requiredVars = [
  "ATLASSIAN_SITE",
  "ATLASSIAN_EMAIL", 
  "ATLASSIAN_API_TOKEN_ADMIN",
  "ATLASSIAN_CLOUD_ID"
];

console.log("✅ Variáveis de ambiente:");
requiredVars.forEach(v => {
  const value = process.env[v];
  if (value) {
    console.log(`   ${v}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`   ❌ ${v}: FALTANDO`);
  }
});

console.log("\n📋 Para o MCP jira-rovo-remote funcionar, você precisa:");
console.log("   1. Client ID do OAuth app (já temos: ddf7bd9f-24cb-4119-b6d9-3730eb3be971)");
console.log("   2. Client Secret do OAuth app (PRECISA SER ADICIONADO)");
console.log("   3. OAuth app configurado com redirect URI: http://localhost:1919/callback");
console.log("   4. Scopes: read:jira-work write:jira-work read:confluence-content.summary write:confluence-content");

console.log("\n💡 Para obter o Client Secret:");
console.log("   1. Acesse: https://developer.atlassian.com/console/myapps/");
console.log("   2. Encontre o app 'coordenadorautonomo' (ID: ddf7bd9f-24cb-4119-b6d9-3730eb3be971)");
console.log("   3. Vá em 'Settings' > 'OAuth 2.0 (3LO)'");
console.log("   4. Copie o 'Client secret'");
console.log("   5. Adicione no env.local como: ATLASSIAN_CLIENT_SECRET=seu_secret_aqui");
































