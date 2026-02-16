FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for ts-node)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose port
EXPOSE 3001

# Start the REAL Binance Testnet server using compiled JavaScript
CMD ["node", "dist/real-server.js"]