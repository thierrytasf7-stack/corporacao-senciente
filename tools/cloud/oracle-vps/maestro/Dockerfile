# ==============================================================================
# CORPORACAO SENCIENTE - Maestro API
# FastAPI + Socket.IO + Heartbeat System
# ==============================================================================

FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar codigo
COPY . .

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Rodar servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
