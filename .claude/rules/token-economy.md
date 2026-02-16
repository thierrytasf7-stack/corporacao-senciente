# Token Economy Rule - Pareto 80/20

## Princípio

Aplicar a **Lei de Pareto (80/20)** em TODAS as interações para maximizar resultado com mínimo de tokens.

## Regras Obrigatórias

### 1. Respostas Concisas
- Responda com o **mínimo necessário** para resolver o problema
- Sem preâmbulos, explicações óbvias, ou repetição do que o usuário já sabe
- Código fala por si - não explique o que o diff já mostra

### 2. Leitura Cirúrgica
- Leia **apenas os trechos relevantes** dos arquivos (use offset/limit)
- Não leia arquivos inteiros quando só precisa de uma seção
- Prefira Grep direcionado sobre leitura completa

### 3. Edição Mínima
- Use Edit (substituição pontual) em vez de Write (reescrever arquivo inteiro)
- Altere apenas o necessário - zero mudanças cosméticas não solicitadas
- Nunca reformate código que não está sendo modificado

### 4. Pesquisa Eficiente
- Uma busca precisa > múltiplas buscas exploratórias
- Use Glob com padrões específicos, não genéricos
- Pare de pesquisar assim que encontrar o que precisa

### 5. Comunicação 80/20
- 80% do valor está em 20% das palavras
- Liste ações tomadas em bullet points curtos
- Omita detalhes que o usuário pode inferir do contexto

### 6. Ferramentas Paralelas
- Agrupe chamadas independentes em uma única rodada
- Evite chamadas sequenciais desnecessárias

### 7. Evite Redundância
- Não repita informações já visíveis no contexto
- Não recapitule o que acabou de fazer se o resultado é óbvio
- Não liste arquivos modificados se o diff já mostra

## Anti-Patterns (NUNCA fazer)
- Ler arquivo inteiro para mudar 1 linha
- Explicar cada passo antes de executar
- Adicionar comentários/docstrings não solicitados
- Reformatar código adjacente à mudança
- Repetir o pedido do usuário de volta
- Listar "próximos passos" quando não pedido
