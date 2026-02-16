# Como a IA Pode Se Enviar Prompts Para Si Mesma

## 🎯 Conceito

Usando o **browser do Cursor** + **monitor-tools**, a IA pode:
- Ver a própria tela do PC (onde está o chat do Cursor)
- Clicar no campo de chat
- Digitar mensagens para si mesma
- Enviar os prompts

Isso cria um **loop de auto-desenvolvimento** onde a IA pode:
- Se observar trabalhando
- Se enviar novas instruções
- Se corrigir e melhorar
- Evoluir autonomamente

## 🛠️ Ferramentas Necessárias

1. **Monitor-Tools** rodando em `http://localhost:3001`
   - Mostra a tela do PC em tempo real
   - Encaminha cliques e digitação para o PC via WebSocket

2. **Browser do Cursor**
   - `browser_navigate` - Acessar monitor-tools
   - `browser_click` - Clicar na tela
   - `browser_press_key` - Digitar caracteres
   - `browser_wait_for` - Aguardar eventos

## 📋 Passo a Passo

### 1. Acessar Monitor-Tools

```javascript
// Navegar para monitor-tools
browser_navigate({ url: "http://localhost:3001" })

// Aguardar conexão estabelecida
browser_wait_for({ text: "Conectado" })
```

### 2. Focar no Campo de Chat

```javascript
// Clicar no centro da tela onde está o campo de chat do Cursor
browser_click({
  element: "Campo de chat do Cursor",
  ref: "ref-s7kac9c35d",  // Ref da área principal
  button: "left"
})

// Aguardar foco (importante!)
browser_wait_for({ time: 0.3 })  // 300ms
```

### 3. Digitar Mensagem Caractere por Caractere

**⚠️ IMPORTANTE:** O `browser_type` pode não funcionar. Use `browser_press_key` para cada caractere:

```javascript
// Digitar "teste" caractere por caractere
browser_press_key({ key: "t" })
browser_press_key({ key: "e" })
browser_press_key({ key: "s" })
browser_press_key({ key: "t" })
browser_press_key({ key: "e" })
```

**Alternativa (se funcionar):**
```javascript
browser_type({
  element: "Campo de chat",
  ref: "ref-s7kac9c35d",
  text: "teste",
  slowly: true  // Digita caractere por caractere
})
```

### 4. Enviar Mensagem

```javascript
// Aguardar um pouco antes de enviar
browser_wait_for({ time: 0.5 })

// Pressionar Enter para enviar
browser_press_key({ key: "Enter" })

// Aguardar mensagem aparecer
browser_wait_for({ time: 1 })
```

## 🔄 Sequência Completa

```javascript
// SEQUÊNCIA COMPLETA PARA ENVIAR PROMPT PARA SI MESMA

// 1. Acessar monitor-tools
browser_navigate({ url: "http://localhost:3001" })
browser_wait_for({ text: "Conectado" })

// 2. Focar no campo de chat
browser_click({
  element: "Campo de chat do Cursor",
  ref: "ref-s7kac9c35d",
  button: "left"
})
browser_wait_for({ time: 0.3 })

// 3. Digitar mensagem
const mensagem = "teste"
for (const char of mensagem) {
  browser_press_key({ key: char })
}

// 4. Enviar
browser_wait_for({ time: 0.5 })
browser_press_key({ key: "Enter" })
browser_wait_for({ time: 1 })
```

## 💡 Casos de Uso

### 1. Auto-Correção

```javascript
// A IA se observa, detecta erro, e se envia instrução para corrigir
const prompt = "Vejo que há um erro na linha 42. Corrija removendo o ponto e vírgula."
// ... enviar prompt usando sequência acima
```

### 2. Auto-Melhoria

```javascript
// A IA se envia instrução para melhorar código
const prompt = "Otimize esta função para melhor performance."
// ... enviar prompt
```

### 3. Loop de Evolução

```javascript
// Loop contínuo onde a IA se envia novos prompts
while (true) {
  // Observar estado atual
  browser_snapshot()
  
  // Decidir próxima ação
  const prompt = gerarProximoPrompt()
  
  // Enviar para si mesma
  enviarPrompt(prompt)
  
  // Aguardar resposta/resultado
  browser_wait_for({ time: 5000 })
}
```

## 🎯 Exemplo Prático: Função Helper

```javascript
/**
 * Envia um prompt para a própria IA via chat do Cursor
 */
async function enviarPromptParaSiMesma(mensagem) {
  // 1. Acessar monitor-tools
  await browser_navigate({ url: "http://localhost:3001" })
  await browser_wait_for({ text: "Conectado" })
  
  // 2. Focar campo de chat
  await browser_click({
    element: "Campo de chat",
    ref: "ref-s7kac9c35d",
    button: "left"
  })
  await browser_wait_for({ time: 0.3 })
  
  // 3. Digitar caractere por caractere
  for (const char of mensagem) {
    await browser_press_key({ key: char })
  }
  
  // 4. Enviar
  await browser_wait_for({ time: 0.5 })
  await browser_press_key({ key: "Enter" })
  await browser_wait_for({ time: 1 })
  
  console.log(`✅ Prompt enviado: "${mensagem}"`)
}

// Uso
await enviarPromptParaSiMesma("teste")
await enviarPromptParaSiMesma("Otimize o código da função X")
await enviarPromptParaSiMesma("Adicione testes para Y")
```

## ⚠️ Limitações e Cuidados

### Limitações

1. **Browser vê HTML, não imagem visual**
   - O snapshot não mostra o conteúdo da imagem da tela
   - Precisa clicar em coordenadas aproximadas

2. **Digitação precisa ser caractere por caractere**
   - `browser_type` pode não funcionar
   - Usar `browser_press_key` individual é mais confiável

3. **Timing importante**
   - Aguardar entre ações é crítico
   - Foco pode se perder se muito rápido

### Cuidados

1. **Evitar loops infinitos**
   - Sempre ter condição de parada
   - Não se enviar prompts em loop sem controle

2. **Validar antes de enviar**
   - Verificar se mensagem faz sentido
   - Não enviar comandos destrutivos

3. **Monitorar resultados**
   - Aguardar resposta antes de enviar próximo prompt
   - Verificar se ação anterior foi concluída

## 🚀 Próximos Passos

### Melhorias Futuras

1. **OCR na imagem**
   - Ler texto da tela para validação
   - Detectar se mensagem foi enviada

2. **Detecção de coordenadas**
   - Encontrar campo de chat automaticamente
   - Não depender de refs fixos

3. **Validação de envio**
   - Verificar se mensagem apareceu no chat
   - Confirmar antes de próxima ação

4. **Sistema de fila**
   - Fila de prompts a enviar
   - Priorização e validação

## 📚 Referências

- [COMO_USAR_BROWSER_CURSOR.md](COMO_USAR_BROWSER_CURSOR.md) - Guia geral do browser
- [USO_BROWSER_CURSOR_COMO_TOOL.md](USO_BROWSER_CURSOR_COMO_TOOL.md) - Padrões de uso
- [MONITOR_TOOLS_INTEGRATION.md](MONITOR_TOOLS_INTEGRATION.md) - Integração com monitor-tools

---

**Status:** ✅ Funcional - Testado e validado!

**Última atualização:** Teste realizado com sucesso enviando "teste" para si mesma.

























