# 🚀 Configuração de Portas Únicas - Sistema AURA

## ✅ Status: FUNCIONANDO

O sistema AURA foi configurado com portas únicas para evitar conflitos com outros projetos Vite.

## 📍 Portas Configuradas

### Frontend AURA
- **Porta:** 13000
- **URL:** http://localhost:13000
- **Status:** ✅ Funcionando
- **Container:** aura-frontend

### Backend AURA
- **Porta:** 13001
- **URL:** http://localhost:13001
- **Health Check:** http://localhost:13001/health
- **Status:** ✅ Funcionando
- **Container:** aura-backend

## 🔧 Configurações Implementadas

### 1. Vite Configuration
- **Arquivo:** `frontend/vite.config.ts`
- **Porta fixa:** 13000
- **Host:** 0.0.0.0
- **strictPort:** true (força uso da porta específica)

### 2. Package.json Scripts
- **Script padrão:** `npm run dev`
- **Script específico:** `npm run dev:13000` (porta 13000)

### 3. Docker Configuration
- **Dockerfile:** `frontend/Dockerfile.simple`
- **Mapeamento:** 13000:13000
- **Comando:** `npm run dev:13000`

### 4. Docker Compose
- **Frontend:** 13000:13000
- **Backend:** 13001:3001

## 🎯 Benefícios da Configuração

1. **Sem Conflitos:** Portas únicas evitam conflitos com outros projetos
2. **Consistência:** Mesma porta interna e externa
3. **Facilidade:** URLs fixas e previsíveis
4. **Isolamento:** Cada projeto tem suas próprias portas

## 🚀 Como Acessar

### Frontend
```bash
# URL do frontend
http://localhost:13000
```

### Backend
```bash
# Health check
http://localhost:13001/health

# API base
http://localhost:13001/api/
```

## 📋 Comandos Úteis

### Verificar Status
```bash
# Status dos containers
docker ps

# Logs do frontend
docker logs aura-frontend

# Logs do backend
docker logs aura-backend
```

### Reiniciar Serviços
```bash
# Reconstruir e reiniciar frontend
docker-compose up -d --build frontend

# Reconstruir e reiniciar backend
docker-compose up -d --build backend

# Reiniciar tudo
docker-compose up -d --build
```

### Desenvolvimento Local
```bash
# Frontend local (porta 13000)
cd frontend
npm run dev:13000

# Backend local (porta 13001)
cd backend
npm run dev
```

## 🔍 Troubleshooting

### Se a porta 13000 estiver ocupada:
```bash
# Verificar processos na porta
netstat -ano | findstr :13000

# Matar processo se necessário
taskkill /PID <PID> /F
```

### Se o container não iniciar:
```bash
# Verificar logs
docker logs aura-frontend

# Reconstruir container
docker-compose up -d --build frontend
```

## 📝 Notas Importantes

- ✅ Frontend funcionando na porta 13000
- ✅ Backend funcionando na porta 13001
- ✅ Sem conflitos com outros projetos Vite
- ✅ Configuração persistente e estável
- ✅ URLs fixas para desenvolvimento

## 🎉 Conclusão

O sistema AURA está configurado com portas únicas e funcionando corretamente. O frontend está acessível em `http://localhost:13000` e o backend em `http://localhost:13001`.
