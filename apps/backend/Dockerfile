# =============================================================================
# CORPORACAO SENCIENTE - Backend Dockerfile
# Industry 7.0 Ready - Node.js + Express API
# =============================================================================

FROM node:20-bullseye-slim

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files

COPY package.json ./



# Install dependencies

RUN npm install --omit=dev --ignore-scripts && \
    npm rebuild sharp --platform=linux --arch=x64 || true

# Copy source files
COPY . .

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs senciente && \
    chown -R senciente:nodejs /app

USER senciente

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Start server
CMD ["node", "server.js"]
