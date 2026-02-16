# Microservices - Componentes LEGO Reutilizáveis

## Conceito

Microservices são componentes reutilizáveis (como LEGOs) que podem ser compartilhados entre diferentes empresas:

- **Código compartilhado** - Uma implementação, múltiplos usos
- **Configuração por empresa** - Cada empresa configura conforme necessidade
- **Dados isolados** - Dados permanecem isolados por empresa

## Estrutura

```
microservices/
├── _catalog.json          # Catálogo central
├── auth/
│   ├── README.md          # Documentação
│   ├── package.json       # Dependências
│   ├── src/
│   │   └── index.js       # Código principal
│   └── config.example.json # Template de configuração
├── payment/
│   └── ...
└── notification/
    └── ...

instances/
├── empresa-a/
│   ├── microservices/     # Links/cópias dos microservices usados
│   │   ├── auth/ -> ../../microservices/auth
│   │   └── payment/ -> ../../microservices/payment
│   └── ...
```

## Como Criar um Microservice

### 1. Criar Estrutura

```bash
mkdir -p microservices/auth/src
cd microservices/auth
```

### 2. Criar package.json

```json
{
  "name": "@corp/auth",
  "version": "1.0.0",
  "description": "Microservice de autenticação",
  "main": "src/index.js",
  "dependencies": {
    "jsonwebtoken": "^9.0.0"
  }
}
```

### 3. Implementar Código

```javascript
// src/index.js
export function authenticate(token, secret) {
  // Implementação...
}

export function generateToken(user, secret) {
  // Implementação...
}
```

### 4. Documentar

```markdown
# Auth Microservice

Microservice de autenticação JWT reutilizável.

## Uso

```javascript
import { authenticate, generateToken } from './auth';

const token = generateToken(user, secret);
const user = authenticate(token, secret);
```

## Configuração

Copiar `config.example.json` para `config.json` e ajustar.
```

### 5. Registrar no Catálogo

```javascript
import { addComponent } from './scripts/orchestrator/component_catalog.js';

addComponent({
  name: 'auth',
  description: 'Autenticação JWT',
  version: '1.0.0',
  sourceInstance: 'empresa-a',
  category: 'auth',
  path: 'microservices/auth',
});
```

## Como Usar um Microservice

### 1. Adicionar à Instância

```bash
cd instances/empresa-b
mkdir -p microservices
ln -s ../../microservices/auth microservices/auth
```

### 2. Configurar

```bash
cp microservices/auth/config.example.json microservices/auth/config.json
# Editar config.json com configurações da empresa
```

### 3. Usar no Código

```javascript
import { authenticate } from './microservices/auth/src/index.js';

// Usar...
```

## Compartilhamento Automático

O coordenador pode detectar e sugerir compartilhamento:

```javascript
import { shareComponent } from './scripts/orchestrator/sharing_engine.js';

// Compartilhar componente
await shareComponent('auth', 'empresa-a', 'empresa-b');
```

## Catálogo

O catálogo é armazenado em `microservices/_catalog.json`:

```json
{
  "components": [
    {
      "name": "auth",
      "description": "Autenticação JWT",
      "version": "1.0.0",
      "sourceInstance": "empresa-a",
      "category": "auth",
      "path": "microservices/auth",
      "usageCount": 3,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "lastUpdated": "2025-01-01T00:00:00Z"
}
```

## Boas Práticas

1. **Isolar configurações** - Não hardcode valores, use config.json
2. **Documentar bem** - README claro e exemplos
3. **Versionar** - Usar semver
4. **Testar** - Testes unitários por microservice
5. **Isolar dados** - Não compartilhar estado entre empresas

## Categorias Sugeridas

- `auth` - Autenticação/autorização
- `payment` - Pagamentos
- `notification` - Notificações
- `analytics` - Analytics
- `storage` - Armazenamento
- `ai-agent` - Agentes IA
- `api` - APIs externas
- `utils` - Utilitários

## Versionamento

- **Major** - Breaking changes
- **Minor** - Novas funcionalidades compatíveis
- **Patch** - Correções

Ao atualizar, o coordenador pode sugerir atualização para outras empresas.

---

**Referências:**
- [ORQUESTRADOR_CENTRAL.md](ORQUESTRADOR_CENTRAL.md)
- [COMPARTILHAMENTO_COMPONENTES.md](COMPARTILHAMENTO_COMPONENTES.md)

























