# Monitor Tools - Auto-Interação da IA

## 🎯 Conceito

Sistema que permite à **IA observar a própria tela do PC** e interagir com ela através do monitor-tools, criando um **loop de auto-desenvolvimento** onde a IA pode:

- 👁️ **Ver** o que está acontecendo na tela
- 🧠 **Analisar** o que vê
- ⚙️ **Decidir** qual ação tomar
- 🖱️ **Interagir** (clicar, digitar, pressionar teclas)
- 🔄 **Loop** contínuo de observação → decisão → ação

## 🚀 Início Rápido

### 1. Iniciar Monitor-Tools

```bash
cd monitor-tools
npm install
npm start
```

O servidor inicia em `http://localhost:3001`

### 2. 🎯 Usar Browser Cursor como Ferramenta Principal (RECOMENDADO)

**O browser do Cursor é sua ferramenta principal para:**
- ✅ **Decisão** - Ver o que está na tela e decidir ações
- ✅ **Validação** - Verificar resultados das ações
- ✅ **Testes** - Testar funcionalidades interagindo
- ✅ **Controle do PC** - Interagir com a tela via monitor-tools

**Como usar:**
1. `browser_navigate({ url: "http://localhost:3001" })` - Acessar monitor-tools
2. `browser_snapshot()` - Ver elementos visíveis
3. `browser_click()`, `browser_type()`, etc. - Interagir
4. `browser_wait_for()` - Aguardar resultados
5. Loop: Observar → Decidir → Agir → Validar

**Veja:** [docs/USO_BROWSER_CURSOR_COMO_TOOL.md](docs/USO_BROWSER_CURSOR_COMO_TOOL.md)

**Limitação:** Browser vê HTML, não processa a imagem da tela diretamente (mas pode clicar nela!).

### 3. Usar API REST (Recomendado)

Adicionei APIs REST ao monitor-tools:

#### Capturar Tela

```bash
curl http://localhost:3001/api/snapshot
```

Retorna JSON com imagem em base64:
```json
{
  "image": "iVBORw0KGgoAAAANS...",
  "width": 1920,
  "height": 1080,
  "timestamp": 1234567890
}
```

#### Executar Ação

```bash
# Clicar em (500, 300)
curl -X POST http://localhost:3001/api/action \
  -H "Content-Type: application/json" \
  -d '{"type": "click", "x": 500, "y": 300}'

# Digitar texto
curl -X POST http://localhost:3001/api/action \
  -H "Content-Type: application/json" \
  -d '{"type": "type", "text": "Olá mundo", "x": 500, "y": 400}'

# Pressionar tecla
curl -X POST http://localhost:3001/api/action \
  -H "Content-Type: application/json" \
  -d '{"type": "key", "key": "enter"}'
```

### 4. Usar Script de Auto-Interação

```javascript
import { 
  getScreenSnapshot, 
  clickScreen, 
  typeOnScreen,
  selfInteractionLoop 
} from './scripts/self_interaction_agent.js';

// Capturar tela
const snapshot = await getScreenSnapshot();
console.log('Tela:', snapshot.width, 'x', snapshot.height);

// Clicar
await clickScreen(500, 300);

// Digitar
await typeOnScreen('Olá mundo', 500, 400);

// Loop automático
await selfInteractionLoop({
  maxIterations: 10,
  interval: 5000,
  objective: 'Desenvolver funcionalidade X',
});
```

## 📖 Como Funciona

### Fluxo Básico

```
1. IA observa tela (GET /api/snapshot)
   ↓
2. Analisa imagem (via LLM ou OCR)
   ↓
3. Decide ação baseada no que vê
   ↓
4. Executa ação (POST /api/action)
   ↓
5. Observa resultado
   ↓
6. Loop (volta ao passo 1)
```

### Exemplo Prático

**Cenário:** IA está desenvolvendo e vê erro no terminal

1. **Observa:** Captura snapshot da tela
2. **Analisa:** "Vejo mensagem de erro vermelha na linha 42"
3. **Decide:** "Preciso corrigir o código"
4. **Ação:** Clica no arquivo, rola até linha 42, digita correção
5. **Observa:** Captura novo snapshot, vê que erro desapareceu
6. **Decide:** "Continuar desenvolvimento"

## 🔧 APIs Disponíveis

### GET `/api/snapshot`

Retorna snapshot atual da tela.

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

### POST `/api/action`

Executa ação na tela.

**Tipos de ação:**
- `click` - Clicar em coordenada
- `double-click` - Duplo clique
- `right-click` - Clique direito
- `type` - Digitar texto
- `key` - Pressionar tecla
- `scroll` - Fazer scroll

**Exemplo:**
```json
{
  "type": "click",
  "x": 500,
  "y": 300,
  "button": "left"
}
```

## 🎯 Enviar Prompts Para Si Mesma

A IA pode se enviar prompts usando o browser do Cursor! Veja:
- [ENVIAR_PROMPTS_PARA_SI_MESMA.md](docs/ENVIAR_PROMPTS_PARA_SI_MESMA.md) - Guia completo
- [scripts/enviar_prompt_para_si_mesma.js](scripts/enviar_prompt_para_si_mesma.js) - Helper e templates

**Sequência rápida:**
1. Acessar monitor-tools
2. Clicar no campo de chat
3. Digitar caractere por caractere (`browser_press_key`)
4. Pressionar Enter

✅ **Testado e funcionando!**

## 🎯 Próximos Passos

### 1. Análise com LLM

Integrar análise de imagem com LLM (Claude/Grok):

```javascript
async function analyzeSnapshotWithLLM(snapshot) {
  // Enviar imagem base64 para LLM
  const response = await llm.analyzeImage({
    image: snapshot.image,
    prompt: "O que você vê na tela? Qual próxima ação?"
  });
  return response.decision;
}
```

### 2. Visão Computacional

Usar OCR e detecção de elementos:
- Ler texto da tela
- Detectar botões, campos, erros
- Identificar contexto visual

### 3. Integração com Evolution Loop

Conectar com `evolution_loop.js`:
- Observa resultado de ações
- Corrige problemas automaticamente
- Valida melhorias

## ⚠️ Segurança

- ✅ Sempre validar coordenadas antes de clicar
- ✅ Não executar ações destrutivas automaticamente
- ✅ Adicionar rate limiting
- ✅ Registrar todas as ações
- ✅ Permitir modo "dry-run"

## 📚 Documentação

- [MONITOR_TOOLS_INTEGRATION.md](docs/MONITOR_TOOLS_INTEGRATION.md) - Detalhes técnicos
- [SELF_OBSERVATION_LOOP.md](docs/SELF_OBSERVATION_LOOP.md) - Conceitos e arquitetura

---

**Status:** ✅ APIs REST implementadas, pronto para integração com LLM para análise visual.

