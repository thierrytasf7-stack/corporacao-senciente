# Guia de Instalação e Configuração do Ollama

## 🎯 Por que usar Ollama?

Ollama permite executar modelos LLM **localmente**, sem rate limits e sem custos por requisição. É ideal para:
- **Treinamento massivo** de agentes
- **Geração de exemplos sintéticos** em grande volume
- **Evolução de prompts** com muitas iterações
- **Análise competitiva** extensiva

### Vantagens:
- ✅ **Sem rate limits** - Execute quantas requisições precisar
- ✅ **Sem custos** - Gratuito após instalação
- ✅ **Privacidade** - Dados não saem da sua máquina
- ✅ **Velocidade** - Sem latência de rede (após primeira carga)
- ✅ **Offline** - Funciona sem internet

### Desvantagens:
- ⚠️ Requer GPU/CPU potente (recomendado: 8GB+ RAM, GPU opcional)
- ⚠️ Primeira execução baixa o modelo (pode ser grande)
- ⚠️ Qualidade pode ser menor que Grok/Gemini (depende do modelo)

---

## 📥 Instalação

### Windows

1. **Baixar Ollama:**
   - Acesse: https://ollama.com/download
   - Baixe o instalador para Windows
   - Execute e instale

2. **Verificar instalação:**
   ```powershell
   ollama --version
   ```

3. **Baixar um modelo:**
   ```powershell
   # Modelo recomendado para treinamento (equilíbrio qualidade/velocidade)
   ollama pull llama3.2
   
   # Ou modelos maiores (melhor qualidade, mais lento)
   ollama pull llama3.1:8b
   ollama pull mistral
   ollama pull qwen2.5
   ```

4. **Testar:**
   ```powershell
   ollama run llama3.2 "Olá, como você está?"
   ```

### Linux/Mac

```bash
# Instalar via script oficial
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo
ollama pull llama3.2

# Testar
ollama run llama3.2 "Hello!"
```

---

## ⚙️ Configuração no Projeto

### 1. Atualizar `env.local`

Adicione as seguintes variáveis:

```env
# Ollama (Modelo Local)
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Configuração de Fallback
USE_LOCAL_FOR_TRAINING=true  # Usar Ollama automaticamente para treinamento
```

### 2. Modelos Recomendados

| Modelo | Tamanho | RAM Mínima | Qualidade | Velocidade | Uso |
|--------|---------|------------|-----------|------------|-----|
| `llama3.2` | 3B | 4GB | ⭐⭐⭐ | ⚡⚡⚡ | Treinamento rápido |
| `llama3.1:8b` | 8B | 8GB | ⭐⭐⭐⭐ | ⚡⚡ | Treinamento balanceado |
| `mistral` | 7B | 8GB | ⭐⭐⭐⭐ | ⚡⚡ | Qualidade/velocidade |
| `qwen2.5:7b` | 7B | 8GB | ⭐⭐⭐⭐ | ⚡⚡ | Multilíngue |
| `llama3.1:70b` | 70B | 48GB | ⭐⭐⭐⭐⭐ | ⚡ | Máxima qualidade |

**Recomendação inicial:** `llama3.2` para começar rápido, depois migrar para `llama3.1:8b` se tiver RAM suficiente.

### 3. Verificar se está funcionando

Execute:

```bash
node -e "
import('./scripts/utils/llm_client.js').then(async ({ checkOllamaAvailable }) => {
  const available = await checkOllamaAvailable();
  console.log(available ? '✅ Ollama está disponível' : '❌ Ollama não está disponível');
});
"
```

---

## 🚀 Uso Automático

O sistema **automaticamente** usa Ollama quando:

1. **Treinamento** (`isTraining: true`):
   - Geração de exemplos sintéticos
   - Evolução de prompts
   - Análise competitiva

2. **Rate limit do Grok**:
   - Se Grok retornar 429, o sistema tenta Ollama automaticamente

3. **Fallback final**:
   - Se Grok e Gemini falharem, tenta Ollama como último recurso

---

## 🔧 Troubleshooting

### Ollama não está respondendo

```powershell
# Verificar se está rodando
ollama list

# Reiniciar serviço (Windows)
# Abra o Task Manager e finalize "Ollama", depois reinicie o app

# Verificar porta
netstat -an | findstr 11434
```

### Modelo não encontrado

```powershell
# Listar modelos instalados
ollama list

# Baixar modelo novamente
ollama pull llama3.2
```

### Muito lento

- Use modelo menor (`llama3.2` ao invés de `llama3.1:8b`)
- Feche outros aplicativos pesados
- Considere usar GPU (se disponível)

### Erro de memória

- Use modelo menor
- Feche outros aplicativos
- Considere aumentar RAM ou usar modelo quantizado

---

## 📊 Comparação de Performance

### Grok (Cloud)
- ✅ Melhor qualidade
- ✅ Muito rápido
- ❌ Rate limits
- ❌ Custo por requisição

### Ollama (Local)
- ✅ Sem rate limits
- ✅ Gratuito
- ✅ Privacidade
- ⚠️ Qualidade menor (depende do modelo)
- ⚠️ Pode ser mais lento (sem GPU)

### Gemini (Cloud)
- ✅ Boa qualidade
- ✅ Generoso rate limit
- ⚠️ Pode ter limites em uso intenso

---

## 🎯 Estratégia Recomendada

1. **Treinamento massivo**: Use Ollama (`USE_LOCAL_FOR_TRAINING=true`)
2. **Produção/Decisões críticas**: Use Grok (melhor qualidade)
3. **Fallback automático**: Sistema tenta Grok → Ollama → Gemini → Together

---

## 📚 Recursos

- **Documentação oficial**: https://ollama.com/docs
- **Modelos disponíveis**: https://ollama.com/library
- **API Reference**: https://github.com/ollama/ollama/blob/main/docs/api.md

---

## ✅ Checklist de Setup

- [ ] Ollama instalado
- [ ] Modelo baixado (`ollama pull llama3.2`)
- [ ] Teste manual funcionando (`ollama run llama3.2 "test"`)
- [ ] Variáveis adicionadas ao `env.local`
- [ ] `OLLAMA_ENABLED=true`
- [ ] `USE_LOCAL_FOR_TRAINING=true`
- [ ] Teste de integração passou

---

## 🔄 Próximos Passos

Após configurar Ollama:

1. Execute o treinamento novamente:
   ```bash
   node scripts/cerebro/self_improvement_orchestrator.js --phase=synthetic --agents=copywriting
   ```

2. Monitore o uso:
   - Ollama será usado automaticamente para treinamento
   - Grok será usado para produção (se disponível)

3. Ajuste conforme necessário:
   - Mude `OLLAMA_MODEL` se quiser outro modelo
   - Ajuste `USE_LOCAL_FOR_TRAINING` se preferir sempre Grok























