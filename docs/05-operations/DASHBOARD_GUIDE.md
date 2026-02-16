# Guia do Dashboard - Corporação Autônoma

## Visão Geral

O Dashboard é a interface visual para monitorar e controlar a evolução autônoma da corporação. Ele fornece visibilidade completa sobre decisões, metas, agentes e métricas.

## Acessar Dashboard

```bash
# Iniciar backend API
cd backend
node server.js

# Em outro terminal, iniciar frontend
cd frontend
npm run dev
```

Acesse: `http://localhost:3000` (ou porta configurada)

## Abas do Dashboard

### 📊 Overview

Visão geral do estado do sistema:

- **Métricas DORA**: Lead time, deploy frequency, MTTR, change fail rate
- **Latência**: Embeddings e boardroom (p95)
- **Custos**: Total acumulado de LLM
- **Iterações**: Contador do loop de evolução
- **Alertas**: Notificações importantes

### 📋 Decisões

Timeline de todas as decisões do boardroom:

- Opiniões dos agentes (Architect, Product, Dev)
- Síntese final
- Timestamp de cada decisão
- Ordenado por mais recente primeiro

### 🎯 Metas

Objetivos de longo prazo e progresso:

- Objetivos da memória corporativa
- Progresso percentual
- Próximos passos
- Status atual do sistema

### 🤖 Agentes

Status e opiniões de cada agente:

- **Architect**: Segurança, arquitetura, RLS
- **Product**: UX, valor, inovação
- **Dev**: Execução, qualidade, testes
- **DevEx**: Automação, onboarding
- **Metrics**: DORA, observabilidade
- **Entity**: Cadastros, compliance

Para cada agente:
- Última opinião registrada
- Alinhamento vetorial
- Total de opiniões

### 🔄 Evolução

Controles do loop de evolução:

- **Modo**: Automático ou Semi-automático
- **Controles**: Start/Stop/Pause
- **Status**: Iteração atual, último objetivo
- **Histórico**: Logs de evolução

## Funcionalidades

### Controle do Loop

No modo **Semi-automático**:

1. Loop executa boardroom
2. Apresenta decisão e opções
3. Você escolhe direção
4. Loop executa conforme escolha
5. Mostra feedback de progresso

No modo **Automático**:

1. Loop executa continuamente
2. Sem intervenção humana
3. Dashboard apenas para monitoramento
4. Pode pausar/parar quando necessário

### Painel de Opções

Quando em modo semi-automático e houver decisões pendentes, aparece um painel na parte inferior:

- Lista de opções disponíveis
- Descrição de cada opção
- Seleção por clique
- Confirmação antes de executar

## APIs Utilizadas

O dashboard consome as seguintes APIs:

- `GET /api/evolution/status` - Status do loop
- `POST /api/evolution/control` - Controlar loop
- `GET /api/decisions` - Timeline de decisões
- `GET /api/metrics` - Métricas gerais
- `GET /api/agents/opinions` - Opiniões dos agentes
- `GET /api/goals` - Metas e objetivos

## Atualização Automática

O dashboard atualiza automaticamente:

- Status do loop: a cada 5 segundos
- Métricas: a cada 10 segundos
- Decisões: a cada 5 segundos
- Agentes: a cada 10 segundos
- Metas: a cada 30 segundos

## Personalização

### Modificar Intervalos

Edite os componentes para ajustar intervalos de polling:

```javascript
useEffect(() => {
  loadData();
  const interval = setInterval(loadData, 5000); // 5 segundos
  return () => clearInterval(interval);
}, []);
```

### Adicionar Novas Métricas

1. Adicione endpoint em `backend/api/metrics.js`
2. Atualize componente `Overview.jsx`
3. Adicione visualização apropriada

## Troubleshooting

### Dashboard não carrega dados

- Verificar se backend está rodando
- Verificar URLs das APIs
- Verificar CORS configurado
- Verificar console do navegador

### Opções não aparecem (modo semi)

- Verificar se loop está rodando
- Verificar se boardroom gerou opções
- Verificar logs do backend
- Verificar estado do loop

### Métricas não atualizam

- Verificar se APIs estão respondendo
- Verificar intervalos de polling
- Verificar conexão com Supabase
- Verificar logs de erro

## Próximos Passos

1. Configurar backend e frontend
2. Acessar dashboard
3. Iniciar loop de evolução
4. Monitorar e intervir quando necessário

























