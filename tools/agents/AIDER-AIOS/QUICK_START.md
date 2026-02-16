# ⚡ Quick Start - AIOS + Aider

## 30 Segundos para Começar

### 1. Abrir Terminal

```bash
cd aios-core
```

### 2. Configurar Chave (se não tiver feito)

**Windows:**
```batch
set OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
```

**macOS/Linux:**
```bash
export OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
```

Obter chave gratuita em: https://openrouter.ai

### 3. Iniciar

```batch
start-aios-aider.bat
```

### 4. Explorar

```
/agents              ← Ver agentes disponíveis
/1                   ← Ativar primeiro agente
/agent dev           ← Ativar agente específico
/help                ← Ajuda
```

## Comandos Essenciais

```
/agents              # Listar agentes
/agent <nome>        # Ativar agente
/add arquivo.py      # Adicionar arquivo
/drop arquivo.py     # Remover arquivo
/diff                # Ver mudanças
/commit              # Salvar
/undo                # Desfazer
```

## Exemplo Prático

```
> /agent dev
> /add hello.py
> "Crie função que printa 'hello world'"
> /diff
> /commit
> /drop hello.py
```

## Próximos Passos

- Ler `STARTUP.md` para guia completo
- Ler `../README.md` para visão geral
- Explorar `squads/aider-squad/` para otimização

## Troubleshooting

**Erro "Aider not found":**
```bash
pip install aider-chat
```

**Agentes não aparecem:**
```bash
npm install
```

**Chave API inválida:**
- Regenerar em https://openrouter.ai
- Verificar valor em `start-aios-aider.bat`

---

**Versão**: 1.0.0
**Status**: ✅ Pronto para usar
