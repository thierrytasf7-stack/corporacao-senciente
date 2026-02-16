# Instruções de Uso - Architect Agent (Para Humanos)

## Visão Geral

Este guia explica como usar o Architect Agent. **Nota:** O agente está em estado inicial (V.1) com funcionalidades básicas.

## Como Usar o Agente

### Método Básico

```javascript
// Import removido - função não usada neste script

const resultado = await executeSpecializedAgent(
    'architect',
    'Sua solicitação aqui'
);
```

## Tools Disponíveis

### ✅ Tools Funcionais

#### 1. `search_memory`
**O que faz:** Busca na memória corporativa.

**Como usar:**
```
Busque na memória: "sua consulta"
```

#### 2. `search_knowledge`
**O que faz:** Busca no conhecimento especializado de Arquitetura, segurança, escalabilidade.

**Como usar:**
```
Busque conhecimento sobre: "sua consulta"
```

## Limitações Atuais

1. **Tools Limitadas:** Apenas tools básicas de busca disponíveis
2. **Sem Execução Real:** Não executa ações reais no domínio
3. **Base de Conhecimento:** Base ainda não populada especificamente

## Configuração

Atualmente não há configurações específicas necessárias. O agente usa:
- Supabase (já configurado)
- LLM Client (já configurado)

## Próximos Passos

Consulte `proximas-tasks-evolucao.md` para ver o roadmap de evolução.

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** ⚠️ Básico - Em Desenvolvimento
