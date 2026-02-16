FROM node:20-slim

# Instalar dependências do sistema para o Puppeteer/Chrome (necessário para Baileys)
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libfreetype6 \
    libfreetype6-dev \
    libharfbuzz-bin \
    ca-certificates \
    fonts-freefont-ttf \
    nodejs \
    npm \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Configurar Timezone para São Paulo
ENV TZ=America/Sao_Paulo

WORKDIR /app

# Copiar package.json e instalar deps
COPY package*.json ./
RUN npm install

# Copiar o restante do código
COPY . .

# Expor portas (3005 para QR Web)
EXPOSE 3005

# Rodar o bridge
CMD ["node", "index.js"]
