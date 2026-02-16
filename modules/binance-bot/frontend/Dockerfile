FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port - Porta fixa para o frontend AURA
EXPOSE 13000

# Start the application in development mode - Porta fixa 13000 para consistência
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "13000"]