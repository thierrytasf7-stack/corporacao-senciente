# Instruções de Uso - Copywriting Agent (Para Humanos)

## Visão Geral

Este guia explica como usar o Copywriting Agent de forma eficiente. O agente está pronto para uso em produção e oferece 6 tools funcionais para criação, análise e publicação de copy.

## Como Usar o Agente

### Método Básico

O Copywriting Agent pode ser chamado através do sistema de execução de agentes especializados:

```javascript
import { executeSpecializedAgent } from './scripts/cerebro/agent_executor.js';

const resultado = await executeSpecializedAgent(
    'copywriting',
    'Sua solicitação aqui'
);
```

### Via Terminal/CLI

```bash
npm run test:copywriting
```

## Tools Disponíveis

### 1. Verificação de Gramática (`check_grammar`)

**O que faz:** Verifica gramática, ortografia e estilo de um texto.

**Como usar:**
```
Verifique a gramática deste texto: "Seu texto aqui"
```

**Exemplo prático:**
```
Verifique a gramática deste texto: "Este é um texto de exemplo com alguns erros gramaticais."
```

**Parâmetros:**
- `text` (obrigatório): Texto a ser verificado
- `language` (opcional): Idioma (padrão: 'en-US')

**Resultado esperado:**
- Lista de erros encontrados
- Sugestões de correção
- Análise de estilo básica

### 2. Análise de Tom (`analyze_tone`)

**O que faz:** Analisa o tom, sentimento e adequação do texto ao público-alvo.

**Como usar:**
```
Analise o tom deste texto: "Seu texto aqui"
```

**Exemplo prático:**
```
Analise o tom deste texto: "Nossa solução é incrível e vai transformar seu negócio!"
```

**Resultado esperado:**
- Análise de sentimento (positivo/negativo/neutro)
- Análise de tom detalhada (formalidade, emoção, estilo)
- Sugestões de melhoria

### 3. Análise de SEO (`analyze_seo`)

**O que faz:** Analisa SEO do texto, extrai keywords e analisa competidores.

**Como usar:**
```
Analise o SEO deste texto: "Seu texto aqui"
```

**Exemplo prático:**
```
Analise o SEO deste texto: "SaaS para empresas que querem automatizar processos e aumentar produtividade"
```

**Parâmetros:**
- `text` (obrigatório): Texto a ser analisado
- `url` (opcional): URL relacionada ao texto

**Resultado esperado:**
- Lista de keywords encontradas
- Volume de busca para cada keyword
- Análise de competidores
- Sugestões de otimização

### 4. Publicação de Conteúdo (`publish_content`)

**O que faz:** Publica conteúdo no WordPress.

**Como usar:**
```
Publique este conteúdo no WordPress: título "Título do Post", conteúdo "Conteúdo do post aqui"
```

**Exemplo prático:**
```
Publique este conteúdo: título "Guia Completo de Copywriting", conteúdo "<h2>Introdução</h2><p>Este é um guia completo...</p>", status "publish"
```

**Parâmetros:**
- `title` (obrigatório): Título do post
- `content` (obrigatório): Conteúdo do post (HTML suportado)
- `status` (opcional): Status do post (draft, publish, private) - padrão: 'draft'
- `metadata` (opcional): Metadados adicionais

**Configuração necessária:**
- `WORDPRESS_URL`: URL do WordPress (ex: http://localhost:8080)
- `WORDPRESS_USERNAME`: Usuário WordPress
- `WORDPRESS_APP_PASSWORD`: Application Password

**Resultado esperado:**
- Confirmação de publicação
- URL do post publicado
- ID do post

### 5. Criação de Campanha (`create_campaign`)

**O que faz:** Cria uma campanha de marketing com múltiplas variantes de copy.

**Como usar:**
```
Crie uma campanha chamada "Nome da Campanha" com variantes de copy para [público-alvo]
```

**Exemplo prático:**
```
Crie uma campanha chamada "Black Friday 2025" com uma variante de copy para pequenas empresas
```

**Parâmetros:**
- `name` (obrigatório): Nome da campanha
- `copyVariants` (opcional): Array de variantes de copy
- `targetAudience` (opcional): Descrição do público-alvo

**Resultado esperado:**
- Campanha criada no Supabase
- ID da campanha
- Handoff automático para Marketing Agent

### 6. Análise de Performance (`analyze_performance`)

**O que faz:** Analisa performance de uma URL usando Google Analytics.

**Como usar:**
```
Analise a performance da URL: https://example.com/post
```

**Exemplo prático:**
```
Analise a performance da URL: https://meusite.com/blog/guia-copywriting
```

**Parâmetros:**
- `url` (obrigatório): URL a ser analisada
- `startDate` (opcional): Data inicial (formato: YYYY-MM-DD)
- `endDate` (opcional): Data final (formato: YYYY-MM-DD)

**Configuração necessária:**
- Google Analytics 4 configurado
- OAuth 2.0 credentials (em configuração)

**Resultado esperado:**
- Score de performance (0-100)
- Métricas de visitas
- Taxa de engajamento
- Tempo médio na página

## Casos de Uso Comuns

### Caso 1: Criar e Publicar um Post de Blog

```
1. Analise o SEO deste texto: "Título e conteúdo do post"
2. Verifique a gramática deste texto: "Conteúdo do post"
3. Analise o tom deste texto: "Conteúdo do post"
4. Publique este conteúdo: título "Título", conteúdo "Conteúdo revisado"
```

### Caso 2: Criar uma Campanha de Marketing

```
1. Crie uma campanha chamada "Campanha X" com variantes de copy para público Y
2. [O agente cria a campanha e faz handoff para Marketing Agent]
```

### Caso 3: Otimizar Copy Existente

```
1. Analise a performance da URL: https://meusite.com/landing-page
2. Analise o SEO deste texto: "Copy atual da landing page"
3. Analise o tom deste texto: "Copy atual da landing page"
4. [Use os insights para melhorar o copy]
```

## Configuração

### Variáveis de Ambiente Necessárias

Adicione ao seu `env.local`:

```bash
# LanguageTool (Grammar Checking)
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check

# Hugging Face (Sentiment Analysis)
HUGGINGFACE_API_KEY=seu_token_aqui

# SerperAPI (SEO Analysis)
SERPER_API_KEY=sua_chave_aqui

# WordPress (Content Publishing)
WORDPRESS_URL=http://localhost:8080
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=sua_senha_aqui

# Google Analytics (Performance Analysis)
GOOGLE_ANALYTICS_PROPERTY_ID=seu_property_id
GOOGLE_ANALYTICS_CLIENT_ID=seu_client_id
```

### Verificar Configuração

Execute o teste do agente para verificar se tudo está configurado:

```bash
npm run test:copywriting
```

## Troubleshooting

### Problema: "WordPress não está disponível"

**Solução:**
1. Verifique se o servidor WordPress está rodando
2. Confirme a URL em `WORDPRESS_URL`
3. Verifique credenciais em `WORDPRESS_USERNAME` e `WORDPRESS_APP_PASSWORD`

**Iniciar servidor WordPress:**
```bash
npm run wordpress:start
```

### Problema: "Erro ao verificar gramática"

**Solução:**
1. Verifique se `LANGUAGETOOL_API_URL` está configurado
2. Verifique limites de rate (20 req/min no free tier)
3. Considere usar servidor local se exceder limites

### Problema: "Erro ao analisar sentimento"

**Solução:**
1. Verifique se `HUGGINGFACE_API_KEY` está configurado
2. Verifique se o token é válido
3. O agente usará fallback local se API não disponível

### Problema: "Erro ao analisar SEO"

**Solução:**
1. Verifique se `SERPER_API_KEY` está configurado
2. Verifique se a chave é válida
3. Verifique limites de API

### Problema: "Ollama tem dificuldade com formato ReAct"

**Solução:**
1. Isso é conhecido e está sendo monitorado
2. O sistema usa fallback automático para Gemini quando necessário
3. Prompts estão sendo otimizados continuamente

## Integrações Disponíveis

### WordPress
- ✅ Publicação de posts
- ✅ Suporte para HTML
- ✅ Metadados customizados
- ✅ Status de publicação

### Supabase
- ✅ Armazenamento de campanhas
- ✅ Base de conhecimento vetorial
- ✅ Métricas de performance

### Google Analytics
- ⚠️ Em configuração (OAuth)
- ✅ Preparado para análise completa

### APIs Externas
- ✅ LanguageTool (gramática)
- ✅ Hugging Face (sentimento)
- ✅ SerperAPI (SEO)

## Dicas de Uso

1. **Seja Específico:** Quanto mais específica sua solicitação, melhor o resultado
2. **Use Sequência:** Combine múltiplas tools para resultados melhores
3. **Revise Resultados:** Sempre revise o output antes de publicar
4. **Teste Diferentes Tomos:** Use `analyze_tone` para testar diferentes abordagens
5. **Monitore Performance:** Use `analyze_performance` regularmente para otimizar

## Exemplos Avançados

### Exemplo 1: Workflow Completo de Criação de Post

```
1. "Analise o SEO deste texto para post de blog: [seu texto]"
2. "Verifique a gramática deste texto: [texto otimizado]"
3. "Analise o tom deste texto: [texto revisado]"
4. "Publique este conteúdo: título '[título]', conteúdo '[conteúdo final]', status 'publish'"
5. "Analise a performance da URL: [URL do post publicado]"
```

### Exemplo 2: Otimização de Landing Page

```
1. "Analise a performance da URL: [URL da landing page]"
2. "Analise o SEO deste texto: [copy atual]"
3. "Analise o tom deste texto: [copy atual]"
4. [Use insights para criar versão melhorada]
5. "Analise o SEO deste texto: [copy melhorado]"
```

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs do sistema
2. Execute `npm run test:copywriting` para diagnóstico
3. Consulte a documentação técnica completa

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** ✅ Documentação Atualizada

























