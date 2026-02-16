# Instruções de Uso - Risk Agent (Para IA-Senciente)

## Visão Geral

Este documento fornece informações técnicas para que outras IAs possam utilizar o Risk Agent. **Nota:** O agente está em estado inicial (V.1).

## Capacidades do Agente

### O que o Risk Agent tem e faz

O Risk Agent é um agente especializado em Gestão de riscos, mitigação. Atualmente possui:

- **2 tools funcionais** (search_memory, search_knowledge)
- **Tools específicas do domínio:** Ainda não implementadas

### Domínio de Especialização

- Gestão de riscos, mitigação

## Quando Usar Este Agente

### Use o Risk Agent quando:

- Precisa de conhecimento sobre Gestão de riscos, mitigação
- Precisa buscar informações na memória corporativa relacionadas ao domínio
- Precisa de insights básicos sobre o domínio

### NÃO use o Risk Agent quando:

- Precisa de execução real de ações (não implementado)
- Precisa de análise especializada profunda (não implementado)
- Precisa de integração com sistemas externos (não implementado)

## Como Solicitar Tarefas

### Formato de Input

```
[Action] [Target] [Context]
```

**Exemplos:**
- `Busque conhecimento sobre: "sua consulta"`
- `Busque na memória: "sua consulta"`

## Tools Disponíveis

### 1. `search_memory`

**Quando usar:** Para buscar na memória corporativa.

**Input:**
```javascript
{
    query: "sua consulta"
}
```

### 2. `search_knowledge`

**Quando usar:** Para buscar conhecimento especializado.

**Input:**
```javascript
{
    query: "sua consulta",
    agentName: "risk"
}
```

## Limitações Conhecidas

1. **Tools Limitadas:** Apenas 2 tools básicas
2. **Sem Execução Real:** Não executa ações reais
3. **Base de Conhecimento:** Base ainda não populada

## Integração Técnica

```javascript
// Import removido - função não usada neste script

const resultado = await executeSpecializedAgent(
    'risk',
    'Sua solicitação aqui'
);
```

## Conclusão

O Risk Agent está em estado inicial. Use para busca de conhecimento básico. Para funcionalidades avançadas, aguarde implementação.

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** ⚠️ Básico - Em Desenvolvimento
