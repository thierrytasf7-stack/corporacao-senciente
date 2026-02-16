# Instruções de Uso - Copywriting Agent (Para IA-Senciente)

## Visão Geral

Este documento fornece informações técnicas para que outras IAs (agentes sencientes, orquestradores, sistemas autônomos) possam utilizar o Copywriting Agent de forma eficiente e autônoma.

## Capacidades do Agente

### O que o Copywriting Agent tem e faz

O Copywriting Agent é um agente especializado em criação, análise e publicação de copy (texto persuasivo). Ele possui:

- **6 tools funcionais** para operações reais
- **Base de conhecimento vetorial** com exemplos e templates
- **Integrações com APIs externas** (LanguageTool, Hugging Face, SerperAPI, WordPress, Google Analytics)
- **Sistema de colaboração** com outros agentes (handoff automático)
- **Capacidade de execução real** (publica conteúdo, cria campanhas, analisa performance)

### Domínio de Especialização

- Texto persuasivo e copywriting
- Storytelling e narrativa
- Comunicação e mensagens
- SEO e otimização de conteúdo
- Análise de tom e sentimento
- Publicação de conteúdo

## Quando Usar Este Agente

### Use o Copywriting Agent quando:

1. **Precisa criar copy:**
   - Landing pages
   - Email marketing
   - Posts de blog
   - Social media
   - Campanhas de marketing

2. **Precisa analisar copy:**
   - Verificar gramática
   - Analisar tom e sentimento
   - Analisar SEO
   - Analisar performance

3. **Precisa publicar conteúdo:**
   - WordPress
   - Outras plataformas (futuro)

4. **Precisa criar campanhas:**
   - Campanhas de marketing
   - Múltiplas variantes de copy

### NÃO use o Copywriting Agent quando:

- Precisa de análise de dados complexa (use Data Agent)
- Precisa de estratégia de marketing (use Marketing Agent)
- Precisa de análise de vendas (use Sales Agent)
- Precisa de código ou arquitetura (use Development/Architect Agent)

## Como Solicitar Tarefas

### Formato de Input

O Copywriting Agent aceita solicitações em linguagem natural. O formato recomendado é:

```
[Action] [Target] [Context]
```

**Exemplos:**
- `Verifique a gramática deste texto: "texto aqui"`
- `Analise o tom deste texto: "texto aqui"`
- `Analise o SEO deste texto: "texto aqui"`
- `Publique este conteúdo: título "Título", conteúdo "Conteúdo"`
- `Crie uma campanha chamada "Nome" com variantes de copy`
- `Analise a performance da URL: https://example.com`

### Formato de Output

O agente retorna:
- **Sucesso:** Resultado formatado com informações relevantes
- **Erro:** Mensagem de erro clara com sugestões de solução
- **Status:** Indicação clara de sucesso/falha

**Exemplo de output de sucesso:**
```
✅ Conteúdo publicado com sucesso!

📝 Título: Guia Completo de Copywriting
🔗 URL: http://localhost:8080/post/123
📊 Status: publish
```

**Exemplo de output de erro:**
```
❌ Erro ao publicar conteúdo: Invalid credentials

💡 Dica: Verifique se WORDPRESS_URL, WORDPRESS_USERNAME e WORDPRESS_APP_PASSWORD estão configurados.
```

## Tools Disponíveis e Como Usá-las

### 1. `check_grammar`

**Quando usar:** Para verificar gramática, ortografia e estilo de texto.

**Input esperado:**
```javascript
{
    text: "Texto a ser verificado",
    language: "en-US" // opcional
}
```

**Output esperado:**
- Lista de erros encontrados
- Sugestões de correção
- Análise de estilo

**Exemplo de solicitação:**
```
Verifique a gramática deste texto: "Este é um texto de exemplo."
```

### 2. `analyze_tone`

**Quando usar:** Para analisar tom, sentimento e adequação ao público.

**Input esperado:**
```javascript
{
    text: "Texto a ser analisado"
}
```

**Output esperado:**
- Análise de sentimento (positivo/negativo/neutro)
- Análise de tom detalhada
- Sugestões de melhoria

**Exemplo de solicitação:**
```
Analise o tom deste texto: "Nossa solução é incrível!"
```

### 3. `analyze_seo`

**Quando usar:** Para analisar SEO, extrair keywords e analisar competidores.

**Input esperado:**
```javascript
{
    text: "Texto a ser analisado",
    url: "https://example.com" // opcional
}
```

**Output esperado:**
- Lista de keywords
- Volume de busca
- Análise de competidores
- Sugestões de otimização

**Exemplo de solicitação:**
```
Analise o SEO deste texto: "SaaS para empresas..."
```

### 4. `publish_content`

**Quando usar:** Para publicar conteúdo no WordPress.

**Input esperado:**
```javascript
{
    title: "Título do post",
    content: "Conteúdo do post (HTML suportado)",
    status: "draft" | "publish" | "private", // opcional, padrão: 'draft'
    metadata: {} // opcional
}
```

**Output esperado:**
- Confirmação de publicação
- URL do post
- ID do post

**Exemplo de solicitação:**
```
Publique este conteúdo: título "Título", conteúdo "Conteúdo", status "publish"
```

### 5. `create_campaign`

**Quando usar:** Para criar campanhas de marketing com múltiplas variantes.

**Input esperado:**
```javascript
{
    name: "Nome da campanha",
    copyVariants: ["variante 1", "variante 2"], // opcional
    targetAudience: "Descrição do público" // opcional
}
```

**Output esperado:**
- ID da campanha criada
- Confirmação de handoff para Marketing Agent

**Exemplo de solicitação:**
```
Crie uma campanha chamada "Black Friday 2025" com variantes de copy
```

### 6. `analyze_performance`

**Quando usar:** Para analisar performance de uma URL usando Google Analytics.

**Input esperado:**
```javascript
{
    url: "https://example.com/post",
    startDate: "2025-01-01", // opcional
    endDate: "2025-12-31" // opcional
}
```

**Output esperado:**
- Score de performance (0-100)
- Métricas de visitas
- Taxa de engajamento
- Tempo médio na página

**Exemplo de solicitação:**
```
Analise a performance da URL: https://example.com/post
```

## Colaboração com Outros Agentes

### Handoff Procedures

O Copywriting Agent pode fazer handoff automático para outros agentes:

#### Copywriting → Marketing Agent

**Quando acontece:** Automaticamente ao criar uma campanha via `create_campaign`

**O que é enviado:**
- ID da campanha
- Nome da campanha
- Variantes de copy
- Público-alvo

**Como funciona:**
```javascript
// Internamente, o agente chama:
await handoffToAgent('marketing', {
    action: 'review_campaign',
    campaignId: campaign.id,
    campaignName: name
});
```

### Quando Solicitar Colaboração

**Para Marketing Agent:**
- Após criar campanha (automático)
- Para revisar estratégia de copy
- Para analisar performance de campanhas

**Para Sales Agent:**
- Para ajustar copy baseado em feedback de vendas
- Para criar copy de propostas comerciais

**Para Product Agent:**
- Para alinhar copy com features do produto
- Para criar copy de release notes

**Para Data Agent:**
- Para obter insights de dados para otimizar copy
- Para analisar tendências de mercado

## Error Handling

### Tratamento de Erros

O Copywriting Agent trata erros de forma robusta:

1. **Validação de Input:**
   - Verifica se parâmetros obrigatórios estão presentes
   - Retorna erro claro se faltar informação

2. **Erros de API:**
   - Tenta fallback quando disponível
   - Retorna mensagem de erro clara
   - Sugere soluções

3. **Erros de Configuração:**
   - Identifica configuração faltante
   - Fornece instruções de configuração

### Códigos de Erro Comuns

- `❌ Texto vazio`: Parâmetro `text` não fornecido ou vazio
- `❌ Título e conteúdo são obrigatórios`: Faltam parâmetros para publicação
- `❌ URL é obrigatória`: Faltou URL para análise de performance
- `❌ Erro ao verificar gramática`: Problema com LanguageTool API
- `❌ Erro ao publicar conteúdo`: Problema com WordPress ou credenciais

### Como Lidar com Erros

1. **Verifique a mensagem de erro:** Ela geralmente contém a causa
2. **Verifique configuração:** Muitos erros são de configuração faltante
3. **Tente novamente:** Alguns erros são temporários (rate limits)
4. **Use fallback:** O agente tenta fallback automaticamente quando disponível

## Fluxos de Trabalho Recomendados

### Fluxo 1: Criar e Publicar Post

```
1. analyze_seo(text) → Obter keywords e otimizações
2. check_grammar(text) → Verificar gramática
3. analyze_tone(text) → Analisar tom
4. [Ajustar texto baseado nos insights]
5. publish_content(title, content) → Publicar
6. analyze_performance(url) → Monitorar performance
```

### Fluxo 2: Criar Campanha

```
1. create_campaign(name, variants, audience) → Criar campanha
2. [Handoff automático para Marketing Agent]
3. [Marketing Agent revisa e aprova]
4. [Copywriting Agent ajusta baseado em feedback]
```

### Fluxo 3: Otimizar Copy Existente

```
1. analyze_performance(url) → Ver performance atual
2. analyze_seo(text) → Analisar SEO
3. analyze_tone(text) → Analisar tom
4. [Gerar versão otimizada]
5. [Testar versão otimizada]
6. publish_content(new_version) → Publicar versão melhorada
```

## Integração Técnica

### Como Chamar o Agente Programaticamente

```javascript
import { executeSpecializedAgent } from './scripts/cerebro/agent_executor.js';

// Exemplo 1: Verificar gramática
const resultado1 = await executeSpecializedAgent(
    'copywriting',
    'Verifique a gramática deste texto: "Seu texto aqui"'
);

// Exemplo 2: Publicar conteúdo
const resultado2 = await executeSpecializedAgent(
    'copywriting',
    'Publique este conteúdo: título "Título", conteúdo "Conteúdo", status "publish"'
);

// Exemplo 3: Criar campanha
const resultado3 = await executeSpecializedAgent(
    'copywriting',
    'Crie uma campanha chamada "Campanha X" com variantes de copy'
);
```

### Contexto e Memória

O Copywriting Agent tem acesso a:
- **Memória Corporativa:** Via `search_memory`
- **Conhecimento Especializado:** Via `search_knowledge`
- **Histórico de Execuções:** Armazenado no Supabase

Use contexto quando relevante:
```javascript
const contexto = {
    previousCopy: "Copy anterior",
    targetAudience: "Pequenas empresas",
    campaignGoals: "Aumentar conversão"
};

await executeSpecializedAgent(
    'copywriting',
    'Crie copy otimizado baseado neste contexto',
    contexto
);
```

## Limitações Conhecidas

1. **Ollama e ReAct:** Ollama pode ter dificuldade com formato ReAct em alguns casos. O sistema usa fallback automático.

2. **Base de Conhecimento:** Base ainda pequena (12 itens). Em expansão para 1000+ exemplos.

3. **Google Analytics:** OAuth em configuração. Funcionalidade preparada, aguardando credenciais.

4. **Plataformas:** Apenas WordPress implementado. Outras plataformas em planejamento.

## Métricas de Performance

O Copywriting Agent rastreia:
- Taxa de sucesso de tools (atual: 100%)
- Taxa de sucesso de publicação (atual: 100%)
- Tempo de resposta
- Erros e fallbacks

Use essas métricas para:
- Monitorar saúde do agente
- Identificar problemas
- Otimizar uso

## Conclusão

O Copywriting Agent está pronto para uso autônomo por outras IAs. Ele oferece 6 tools funcionais, integração com múltiplas APIs, e capacidade de execução real. Use este documento como referência para integração eficiente.

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** ✅ Documentação Técnica Completa

























