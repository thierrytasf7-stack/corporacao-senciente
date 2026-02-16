FROM node:18-alpine

WORKDIR /app

# Copiar package.json, package-lock.json e tsconfig.json
COPY package*.json ./
COPY backend/tsconfig.json ./

# Instalar dependências (incluindo dev para TypeScript)
RUN npm install

# Copiar apenas o arquivo necessário
COPY backend/src/trigger-monitor.ts ./src/
COPY backend/src/trigger-logger.ts ./src/
COPY backend/src/trigger-binance-service.ts ./src/

# Criar diretório de logs
RUN mkdir -p logs

# Expor porta (opcional, para health checks)
EXPOSE 3002

# Comando para executar o monitor de gatilhos
CMD ["npx", "ts-node", "src/trigger-monitor.ts"]

