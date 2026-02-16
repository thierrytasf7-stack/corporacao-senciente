# Integração Monitor-Tools com Auto-Interação

## Visão Geral

O monitor-tools permite que a IA veja e controle a própria tela do PC, criando um sistema de auto-observação e auto-interação.

## Funcionalidades Adicionadas

### 1. API REST para IA

#### GET `/api/snapshot`
Retorna snapshot atual da tela em base64.

**Resposta:**
```json
{
  "image": "base64...",
  "format": "base64",
  "width": 1920,
  "height": 1080,
  "timestamp": 1234567890
}
```

#### POST `/api/action`
Executa ação na tela (click, type, key, scroll).

**Payload:**
```json
{
  "type": "click|type|key|scroll|double-click|right-click",
  "x": 100,
  "y": 200,
  "button": "left|right",
  "text": "texto para digitar",
  "key": "enter",
  "modifiers": ["control", "shift"],
  "deltaY": 3
}
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": 1234567890
}
```

### 2. Script de Auto-Interação

O arquivo `scripts/self_interaction_agent.js` fornece:

- `getScreenSnapshot()` - Captura snapshot da tela
- `executeScreenAction()` - Executa ação genérica
- `clickScreen(x, y)` - Clica em coordenada
- `typeOnScreen(text, x, y)` - Digita texto
- `pressKey(key, modifiers)` - Pressiona tecla
- `scrollScreen(x, y, deltaY)` - Faz scroll
- `selfInteractionLoop()` - Loop de observação → decisão → ação

## Como Usar

### Via Browser Cursor (Atual)

1. Abra `http://localhost:3001` no browser
2. Use `browser_snapshot` para ver elementos
3. Use `browser_click`, `browser_type` para interagir

**Limitação:** Browser vê HTML, não a imagem real da tela.

### Via API REST (Recomendado)

```javascript
import { getScreenSnapshot, clickScreen } from './scripts/self_interaction_agent.js';

// Capturar tela
const snapshot = await getScreenSnapshot();
console.log('Tela:', snapshot.width, 'x', snapshot.height);

// Clicar em coordenada
await clickScreen(500, 300);

// Digitar texto
await typeOnScreen('Olá mundo', 500, 400);
```

### Loop Automático

```javascript
import { selfInteractionLoop } from './scripts/self_interaction_agent.js';

await selfInteractionLoop({
  maxIterations: 10,
  interval: 5000,
  objective: 'Desenvolver funcionalidade X',
  onIteration: async ({ iteration, snapshot, decision }) => {
    console.log(`Iteração ${iteration}:`, decision);
  },
});
```

## Próximos Passos

### 1. Análise com LLM

Integrar análise de imagem com LLM (Claude/Grok):

```javascript
async function analyzeSnapshotWithLLM(snapshot) {
  // Enviar imagem base64 para LLM
  // Pedir: "O que você vê na tela? Qual próxima ação?"
  // Retornar decisão estruturada
}
```

### 2. Visão Computacional

Usar OCR para ler texto da tela:
- Detectar elementos (botões, campos, erros)
- Ler mensagens de erro
- Identificar contexto

### 3. Loop Inteligente

Criar sistema que:
- Observa tela continuamente
- Detecta mudanças relevantes
- Decide quando agir
- Aprende com resultados

### 4. Integração com Evolution Loop

Conectar auto-interação com `evolution_loop.js`:
- Observa resultado de ações do evolution loop
- Corrige problemas automaticamente
- Valida melhorias

## Casos de Uso

### 1. Auto-Correção de Erros

```javascript
// Vê erro no terminal
const snapshot = await getScreenSnapshot();
// Analisa com LLM: "Vejo erro de sintaxe"
// Decide: "Preciso corrigir linha 42"
// Executa: Abre arquivo, corrige, salva
```

### 2. Auto-Teste

```javascript
// Executa testes
await pressKey('f5'); // Run tests
// Aguarda resultado
// Analisa: "3 testes falharam"
// Decide: "Corrigir testes"
// Executa correções
```

### 3. Monitoramento de Desenvolvimento

```javascript
// Observa código sendo desenvolvido
// Detecta quando está pronto para commit
// Sugere criar PR
// Executa git commit + push
```

## Segurança

⚠️ **IMPORTANTE:**
- Sempre validar coordenadas antes de clicar
- Não executar ações destrutivas automaticamente
- Adicionar rate limiting
- Registrar todas as ações
- Permitir modo "dry-run"

## Exemplo Completo

```javascript
import { 
  getScreenSnapshot, 
  clickScreen, 
  typeOnScreen,
  selfInteractionLoop 
} from './scripts/self_interaction_agent.js';

// Exemplo: Observar e reagir a erro
async function watchForErrors() {
  while (true) {
    const snapshot = await getScreenSnapshot();
    
    // Analisar (em produção, usaria LLM/OCR)
    // Por enquanto, exemplo simples
    
    // Se detectar erro (exemplo hipotético)
    if (snapshot.containsError) {
      console.log('Erro detectado! Corrigindo...');
      await clickScreen(snapshot.errorLine.x, snapshot.errorLine.y);
      await typeOnScreen('// fix', snapshot.errorLine.x, snapshot.errorLine.y);
    }
    
    await sleep(5000);
  }
}
```

---

**Status:** API REST implementada, aguardando integração com LLM para análise visual.

























