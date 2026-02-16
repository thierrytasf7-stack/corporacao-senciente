# Limitação: Control+V via Browser do Cursor

## Problema

O atalho **Control+V** (colar) não está funcionando através do browser do Cursor quando usado com monitor-tools.

## Tentativas Realizadas

1. ✅ `browser_press_key({ key: "Control+v" })` - Não funcionou
2. ✅ `browser_press_key({ key: "v", modifiers: ["Control"] })` - Não funcionou
3. ✅ `browser_press_key({ key: "Shift+Insert" })` - Não funcionou
4. ✅ Menu de contexto (botão direito) - Não apareceu no snapshot

## Soluções Alternativas

### ✅ Solução que Funciona: browser_type()

Para textos grandes, usar `browser_type()` diretamente:

```javascript
// Funciona para textos grandes
browser_type({
  element: "Campo de entrada",
  ref: "ref-abc",
  text: "texto grande aqui...",
  slowly: false  // ou true para caractere por caractere
})
```

**Vantagens:**
- ✅ Funciona perfeitamente
- ✅ Suporta textos grandes (já testado com 2000+ caracteres)
- ✅ Não depende do clipboard do sistema

**Desvantagens:**
- ❌ Digita caractere por caractere (mas é rápido)

### ⚠️ Limitação Atual

O `browser_press_key` com Control+V não consegue colar do clipboard do sistema quando usado através do monitor-tools. Isso pode ser uma limitação de:
- Como o monitor-tools processa eventos de teclado
- Como o browser do Cursor envia atalhos de teclado
- Compatibilidade entre WebSocket do monitor-tools e atalhos complexos

## Recomendação

**Para enviar prompts grandes:**
- Use `browser_type()` com o texto completo
- Ou use a API REST do monitor-tools (`/api/action` com `type: "type"`)

**Não use:**
- Control+V via browser (não funciona)
- Tentativas de copiar/colar via browser

## Status

- ✅ Digitação funciona: `browser_type()` ou `browser_press_key` caractere por caractere
- ✅ Cliques funcionam: `browser_click()`
- ❌ Colar não funciona: `Control+V` via browser
- ✅ Envio funciona: `Enter` após digitar

---

**Última atualização:** Testado em 2024 - Control+V via browser não funciona com monitor-tools.

