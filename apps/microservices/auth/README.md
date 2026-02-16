# Auth Microservice - Template

Este é um template de exemplo para microservice de autenticação.

## Estrutura

```
auth/
├── README.md
├── package.json
├── src/
│   └── index.js
└── config.example.json
```

## Como Usar

1. Copiar para instância:
```bash
cd instances/empresa-a
mkdir -p microservices
cp -r ../../microservices/auth microservices/
```

2. Configurar:
```bash
cp microservices/auth/config.example.json microservices/auth/config.json
# Editar config.json
```

3. Usar no código:
```javascript
import { authenticate } from './microservices/auth/src/index.js';
```

## Compartilhamento

Para compartilhar com outras empresas:
```javascript
import { shareComponent } from './scripts/orchestrator/sharing_engine.js';
await shareComponent('auth', 'empresa-a', 'empresa-b');
```






























