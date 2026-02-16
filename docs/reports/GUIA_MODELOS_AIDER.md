# 🤖 GUIA DE MODELOS LLM - AIDER

**Data:** 2026-02-03  
**Configuração:** Diana Corporação Senciente

---

## 📊 MODELOS DISPONÍVEIS (EM ORDEM DE PRIORIDADE)

### 1. 🥇 Arcee AI: Trinity Large Preview (127B)
**Identificador:** `openrouter/arcee-ai/trinity-large-preview`

**Características:**
- 127 bilhões de parâmetros
- Modelo mais poderoso disponível
- Excelente para raciocínio complexo
- Ótimo para arquitetura de software

**Uso Recomendado:**
- ✅ Decisões arquiteturais complexas
- ✅ Refatoração de código legado
- ✅ Análise de sistemas distribuídos
- ✅ Otimização de performance crítica
- ✅ Design patterns avançados

**Custo:** Médio-Alto (modelo pago)

**Como usar:**
```bash
# Padrão (já configurado em .aider.conf.yml)
aider

# Ou explicitamente
aider --model openrouter/arcee-ai/trinity-large-preview

# Via script PowerShell
.\USAR_MODELOS_AIDER.ps1 -Modelo trinity
```

---

### 2. 🥈 DeepSeek R1
**Identificador:** `openrouter/deepseek/deepseek-r1`

**Características:**
- Modelo rápido e eficiente
- Ótima relação custo/benefício
- Especializado em raciocínio (R1 = Reasoning)
- Bom para implementação rápida

**Uso Recomendado:**
- ✅ Implementação de features simples
- ✅ Código repetitivo (CRUD, APIs REST)
- ✅ Testes unitários
- ✅ Documentação de código
- ✅ Tarefas auxiliares (weak model)

**Custo:** Baixo (modelo gratuito/barato)

**Como usar:**
```bash
aider --model openrouter/deepseek/deepseek-r1

# Via script PowerShell
.\USAR_MODELOS_AIDER.ps1 -Modelo deepseek
```

---

### 3. 🥉 T2 Chimera
**Identificador:** `openrouter/t2-ai/chimera`

**Características:**
- Modelo híbrido balanceado
- Combina múltiplos modelos internamente
- Boa versatilidade
- Custo-benefício equilibrado

**Uso Recomendado:**
- ✅ Tarefas gerais de desenvolvimento
- ✅ Integração de sistemas
- ✅ APIs e microserviços
- ✅ Frontend + Backend
- ✅ Quando não sabe qual modelo usar

**Custo:** Médio

**Como usar:**
```bash
aider --model openrouter/t2-ai/chimera

# Via script PowerShell
.\USAR_MODELOS_AIDER.ps1 -Modelo chimera
```

---

### 4. 🏆 Qwen3 Coder 480B
**Identificador:** `openrouter/qwen/qwen-3-coder-480b`

**Características:**
- 480 bilhões de parâmetros
- **ESPECIALISTA EM CÓDIGO**
- Treinado especificamente para programação
- Suporta 92+ linguagens de programação

**Uso Recomendado:**
- ✅ Código complexo e otimizado
- ✅ Algoritmos avançados
- ✅ Refatoração profunda
- ✅ Performance crítica
- ✅ Múltiplas linguagens no mesmo projeto

**Custo:** Alto (modelo pago, maior que Trinity)

**Como usar:**
```bash
aider --model openrouter/qwen/qwen-3-coder-480b

# Via script PowerShell
.\USAR_MODELOS_AIDER.ps1 -Modelo qwen
```

---

## 🎯 QUANDO USAR CADA MODELO?

### Cenário 1: Arquitetura e Design
**Modelo:** Trinity Large Preview (127B)
```bash
.\USAR_MODELOS_AIDER.ps1 -Modelo trinity
```
**Exemplo:** "Refatore o sistema de autenticação para usar OAuth2 + JWT"

---

### Cenário 2: Implementação Rápida
**Modelo:** DeepSeek R1
```bash
.\USAR_MODELOS_AIDER.ps1 -Modelo deepseek
```
**Exemplo:** "Crie um CRUD completo para a entidade User"

---

### Cenário 3: Projeto Full-Stack
**Modelo:** T2 Chimera
```bash
.\USAR_MODELOS_AIDER.ps1 -Modelo chimera
```
**Exemplo:** "Integre o frontend React com o backend Express"

---

### Cenário 4: Código Complexo
**Modelo:** Qwen3 Coder 480B
```bash
.\USAR_MODELOS_AIDER.ps1 -Modelo qwen
```
**Exemplo:** "Otimize este algoritmo de busca para O(log n)"

---

## ⚙️ CONFIGURAÇÃO ATUAL

### Arquivo: `.aider.conf.yml`

```yaml
# Modelo principal (padrão)
model: openrouter/arcee-ai/trinity-large-preview

# Modelo weak (tarefas auxiliares)
weak-model: openrouter/deepseek/deepseek-r1

# API Key
api-key: env:OPENROUTER_API_KEY
```

### Variáveis de Ambiente

**Arquivo:** `.env`
```env
# Key principal (com créditos)
OPENROUTER_API_KEY=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

# Keys gratuitas (pool de expansão)
OPENROUTER_FREE_KEYS=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,...
```

---

## 🚀 COMO USAR

### Opção 1: Configuração Padrão (Recomendado)
```bash
# Usa Trinity Large Preview (configurado em .aider.conf.yml)
aider
```

### Opção 2: Script PowerShell (Fácil)
```powershell
# Modelo padrão (Trinity)
.\USAR_MODELOS_AIDER.ps1

# Modelo específico
.\USAR_MODELOS_AIDER.ps1 -Modelo trinity
.\USAR_MODELOS_AIDER.ps1 -Modelo deepseek
.\USAR_MODELOS_AIDER.ps1 -Modelo chimera
.\USAR_MODELOS_AIDER.ps1 -Modelo qwen
```

### Opção 3: Linha de Comando (Avançado)
```bash
# Trinity Large Preview (127B)
aider --model openrouter/arcee-ai/trinity-large-preview

# DeepSeek R1
aider --model openrouter/deepseek/deepseek-r1

# T2 Chimera
aider --model openrouter/t2-ai/chimera

# Qwen3 Coder 480B
aider --model openrouter/qwen/qwen-3-coder-480b
```

---

## 💰 ESTIMATIVA DE CUSTOS

| Modelo | Custo/1M tokens | Uso Recomendado | Orçamento |
|--------|-----------------|-----------------|-----------|
| Trinity Large (127B) | ~$5-10 | Arquitetura, design | Médio |
| DeepSeek R1 | GRÁTIS | Implementação rápida | Ilimitado |
| T2 Chimera | ~$3-5 | Tarefas gerais | Médio |
| Qwen3 Coder (480B) | ~$15-20 | Código complexo | Alto |

**Estratégia de Custo:**
1. Use **DeepSeek R1** para 80% das tarefas (grátis)
2. Use **Trinity** para decisões arquiteturais (10%)
3. Use **Qwen3** para código crítico (5%)
4. Use **Chimera** para tarefas gerais (5%)

---

## 📝 EXEMPLOS DE USO

### Exemplo 1: Criar API REST
```bash
# Modelo: DeepSeek R1 (rápido e barato)
.\USAR_MODELOS_AIDER.ps1 -Modelo deepseek

# No Aider:
> /add backend/api/users.js
> Crie um CRUD completo para usuários com Express.js
```

### Exemplo 2: Refatorar Arquitetura
```bash
# Modelo: Trinity Large Preview (poderoso)
.\USAR_MODELOS_AIDER.ps1 -Modelo trinity

# No Aider:
> /add backend/
> Refatore para arquitetura hexagonal com DDD
```

### Exemplo 3: Otimizar Algoritmo
```bash
# Modelo: Qwen3 Coder 480B (especialista)
.\USAR_MODELOS_AIDER.ps1 -Modelo qwen

# No Aider:
> /add src/algorithms/search.js
> Otimize este algoritmo de busca para O(log n)
```

### Exemplo 4: Integração Full-Stack
```bash
# Modelo: T2 Chimera (balanceado)
.\USAR_MODELOS_AIDER.ps1 -Modelo chimera

# No Aider:
> /add frontend/src/api/ backend/routes/
> Integre o frontend React com o backend Express
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Model not found"
**Solução:** Verifique se o identificador está correto:
```bash
# Correto
aider --model openrouter/arcee-ai/trinity-large-preview

# Errado
aider --model arcee-ai/trinity-large-preview
```

### Erro: "API key not found"
**Solução:** Verifique se a variável de ambiente está configurada:
```powershell
# Verificar
echo $env:OPENROUTER_API_KEY

# Configurar (se necessário)
$env:OPENROUTER_API_KEY = "sk-or-v1-..."
```

### Erro: "Rate limit exceeded"
**Solução:** Use modelo gratuito (DeepSeek R1) ou aguarde:
```bash
.\USAR_MODELOS_AIDER.ps1 -Modelo deepseek
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **Aider Docs:** https://aider.chat/docs/
- **OpenRouter Models:** https://openrouter.ai/models
- **Configuração Aider:** https://aider.chat/docs/config.html

---

## ✅ RESUMO

**Configuração Padrão:**
- Modelo Principal: Trinity Large Preview (127B)
- Modelo Weak: DeepSeek R1
- API Key: Configurada via `.env`

**Como Usar:**
```powershell
# Padrão (Trinity)
aider

# Ou via script
.\USAR_MODELOS_AIDER.ps1 -Modelo trinity
.\USAR_MODELOS_AIDER.ps1 -Modelo deepseek
.\USAR_MODELOS_AIDER.ps1 -Modelo chimera
.\USAR_MODELOS_AIDER.ps1 -Modelo qwen
```

**Recomendação:**
- 80% das tarefas: DeepSeek R1 (grátis)
- 10% arquitetura: Trinity (médio custo)
- 5% código crítico: Qwen3 (alto custo)
- 5% tarefas gerais: Chimera (médio custo)

---

**Pronto para usar!** 🚀
