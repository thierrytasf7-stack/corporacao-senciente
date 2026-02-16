# Instruções de Uso - Customer Success Agent (Para IA-Senciente)

## Visão Geral

Este documento fornece informações técnicas para que outras IAs possam utilizar o Customer Success Agent. **Nota:** O agente está em estado inicial (V.1).

## Capacidades do Agente

### O que o Customer Success Agent tem e faz

O Customer Success Agent é um agente especializado em Sucesso do cliente, suporte, satisfação. Atualmente possui:

- **2 tools funcionais** (search_memory, search_knowledge)
- **Tools específicas do domínio:** Ainda não implementadas

### Domínio de Especialização

- Sucesso do cliente, suporte, satisfação

## Quando Usar Este Agente

### Use o Customer Success Agent quando:

- Precisa de conhecimento sobre Sucesso do cliente, suporte, satisfação
- Precisa buscar informações na memória corporativa relacionadas ao domínio
- Precisa de insights básicos sobre o domínio

### NÃO use o Customer Success Agent quando:

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
    agentName: "customer_success"
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
    'customer_success',
    'Sua solicitação aqui'
);
```

## Conclusão

O Customer Success Agent está em estado inicial. Use para busca de conhecimento básico. Para funcionalidades avançadas, aguarde implementação.

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** ⚠️ Básico - Em Desenvolvimento
