# Como Usar Browser Cursor como Ferramenta Principal

## 🎯 Objetivo

Usar o **browser do Cursor** diretamente para:
- ✅ Tomar decisões baseadas no que vê
- ✅ Validar resultados de ações
- ✅ Testar funcionalidades
- ✅ Controlar o computador através do monitor-tools

## 📋 Passo a Passo Prático

### 1. Acessar Monitor-Tools

```javascript
// Navegar para monitor-tools
browser_navigate({ url: "http://localhost:3001" })

// Aguardar conexão ser estabelecida
browser_wait_for({ text: "Conectado" })

// Ver o que está na tela
browser_snapshot()
```

### 2. Observar e Decidir

Depois de `browser_snapshot()`, você verá:
- Elementos visíveis na página
- Botões, campos, textos
- Status da conexão
- A imagem da tela do PC (dentro de um `<img>`)

**Decisão baseada em:**
- Se vejo erro → decidir corrigir
- Se vejo botão "Executar" → decidir clicar
- Se vejo campo vazio → decidir preencher

### 3. Agir

```javascript
// Clicar em um elemento
browser_click({
  element: "Nome descritivo do elemento",
  ref: "ref-abc123"  // Do snapshot
})

// Digitar texto
browser_type({
  element: "Campo de entrada",
  ref: "ref-xyz789",
  text: "Texto a digitar"
})

// Pressionar tecla
browser_press_key({ key: "Enter" })
// ou
browser_press_key({ key: "Control+s" })
```

### 4. Validar

```javascript
// Aguardar algo aparecer
browser_wait_for({ text: "Sucesso!" })

// Aguardar algo desaparecer
browser_wait_for({ textGone: "Carregando..." })

// Aguardar tempo específico
browser_wait_for({ time: 2000 }) // 2 segundos

// Ver novo estado
browser_snapshot()

// Verificar se ação funcionou
// (análise manual do snapshot retornado)
```

## 🔄 Loop Completo

```
┌─────────────────┐
│   OBSERVAR      │ browser_snapshot()
│  (Ver tela)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    DECIDIR      │ Analisar elementos
│  (O que fazer?) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     AGIR        │ browser_click(), browser_type()
│  (Executar)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   VALIDAR       │ browser_wait_for() + browser_snapshot()
│  (Funcionou?)   │
└────────┬────────┘
         │
         └───────► LOOP
```

## 💡 Exemplos Práticos

### Exemplo 1: Detectar e Corrigir Erro

```javascript
// 1. OBSERVAR
browser_navigate({ url: "http://localhost:3000" })
const snapshot = browser_snapshot()

// 2. DECIDIR: Vejo erro na tela?
if (snapshot.contains("Error") || snapshot.contains("Falha")) {
  // 3. AGIR: Clicar no erro para ver detalhes
  browser_click({ element: "Erro", ref: "error-ref" })
  
  // Aguardar detalhes aparecerem
  browser_wait_for({ text: "linha" })
  
  // Ver detalhes
  const details = browser_snapshot()
  
  // Decidir: Qual correção fazer?
  // (análise do erro)
  
  // Agir: Fazer correção
  browser_click({ element: "Editor", ref: "editor-ref" })
  browser_type({ text: "// correção aqui" })
  browser_press_key({ key: "Control+s" })
  
  // 4. VALIDAR
  browser_wait_for({ textGone: "Error" })
  const final = browser_snapshot()
  if (!final.contains("Error")) {
    console.log("✅ Erro corrigido!")
  }
}
```

### Exemplo 2: Testar Funcionalidade

```javascript
// 1. OBSERVAR
browser_navigate({ url: "http://localhost:3000/test" })
const page = browser_snapshot()

// 2. DECIDIR: Encontrar botão de teste
// (análise do snapshot)

// 3. AGIR: Clicar no botão
browser_click({ 
  element: "Botão Executar Testes",
  ref: "test-button-ref"
})

// 4. VALIDAR: Aguardar resultado
browser_wait_for({ text: "Testes concluídos" })
const result = browser_snapshot()

if (result.contains("3 testes passaram")) {
  console.log("✅ Testes OK!")
} else if (result.contains("falhou")) {
  console.log("❌ Algum teste falhou")
  // Decidir próxima ação: investigar, corrigir, etc.
}
```

### Exemplo 3: Monitorar Desenvolvimento

```javascript
// Loop contínuo de observação
while (true) {
  // 1. OBSERVAR: Ver estado atual do projeto
  browser_navigate({ url: "http://localhost:3000/dashboard" })
  const dashboard = browser_snapshot()
  
  // 2. DECIDIR: Há algo que precisa atenção?
  if (dashboard.contains("Erro")) {
    // Agir: Investigar erro
    browser_click({ element: "Ver Erro", ref: "error-link-ref" })
    browser_wait_for({ text: "Detalhes" })
    // ... investigar e corrigir
  } else if (dashboard.contains("Pronto para commit")) {
    // Agir: Fazer commit
    browser_click({ element: "Commit", ref: "commit-btn-ref" })
    browser_wait_for({ text: "Commit realizado" })
  } else {
    // Continuar desenvolvimento
    console.log("Tudo OK, continuando...")
  }
  
  // 4. VALIDAR
  // (já feito acima)
  
  // Aguardar antes do próximo ciclo
  browser_wait_for({ time: 5000 }) // 5 segundos
}
```

## 🖥️ Integração com Monitor-Tools

### Ver e Controlar Tela do PC

```javascript
// 1. Acessar monitor-tools
browser_navigate({ url: "http://localhost:3001" })

// 2. Aguardar conexão
browser_wait_for({ text: "Conectado" })

// 3. Ver snapshot (a imagem da tela está na página)
const snapshot = browser_snapshot()
// A tela do PC está sendo exibida em um <img>

// 4. Interagir com a tela do PC
// Cliques na imagem são encaminhados para o PC via WebSocket
browser_click({
  element: "Tela do PC",
  ref: "remoteScreen-ref"  // ID do elemento <img>
})

// Digitar na tela do PC
browser_type({
  element: "Tela do PC",
  ref: "remoteScreen-ref",
  text: "Olá mundo"
})

// 5. Validar ação
browser_wait_for({ time: 1000 })
const newSnapshot = browser_snapshot()
// Verificar se algo mudou na tela
```

**⚠️ Nota:** O browser vê HTML, não processa a imagem visualmente.
Mas cliques e digitação funcionam porque o monitor-tools encaminha via WebSocket.

## 🎯 Vantagens

✅ **Simples** - Usa tools nativos do Cursor  
✅ **Direto** - Interage como humano  
✅ **Flexível** - Funciona com qualquer página  
✅ **Visual** - Vê exatamente o que está na tela  
✅ **Integrado** - Não precisa instalar nada  

## 📚 Recursos

- [USO_BROWSER_CURSOR_COMO_TOOL.md](USO_BROWSER_CURSOR_COMO_TOOL.md) - Guia detalhado
- [scripts/browser_decision_loop.js](../scripts/browser_decision_loop.js) - Padrões e helpers

---

**Uso Principal:** Decisão, Validação, Testes e Controle do PC através do browser do Cursor.

























