# Isolamento de Dados: Múltiplos Briefings

## 🚨 Problema: Mistura de Dados

### O que acontece hoje

Quando você cria 5+ briefings na **instância principal** (Opção A), todos os dados vão para o mesmo lugar:

```
Supabase (mesmo projeto):
├── corporate_memory
│   ├── Briefing 1: "Plataforma de tarefas com IA"
│   ├── Briefing 2: "E-commerce B2B"
│   ├── Briefing 3: "SaaS de gestão financeira"
│   ├── Briefing 4: "App de fitness"
│   └── Briefing 5: "Marketplace de serviços"
│
├── task_context
│   ├── Tasks do Briefing 1
│   ├── Tasks do Briefing 2
│   ├── Tasks do Briefing 3
│   └── ... todos misturados
│
├── agent_logs
│   └── Decisões de TODOS os briefings misturadas
│
└── episodic_memory
    └── Eventos de TODOS os briefings misturados
```

### Problemas Reais

#### 1. **Busca Vetorial Contaminada** ⚠️ CRÍTICO

Quando você busca na `corporate_memory`:
```sql
SELECT * FROM corporate_memory 
WHERE embedding <=> (embedding da pergunta) < 0.3
ORDER BY embedding <=> (embedding da pergunta)
LIMIT 5;
```

**Resultado:** Mistura resultados de TODOS os briefings!
- Você pergunta sobre "Briefing 1" e recebe informações do "Briefing 3"
- Busca vetorial fica confusa e menos precisa
- Similaridade semântica fica comprometida

#### 2. **Agentes Confusos** ⚠️ CRÍTICO

Quando o boardroom roda:
- Agentes buscam memória corporativa
- Recebem contexto de MÚLTIPLOS projetos diferentes
- Decisões ficam contaminadas
- Alinhamento estratégico quebrado

Exemplo:
```
Briefing 1: "Gestão de tarefas pessoais" (LGPD, dados pessoais)
Briefing 2: "E-commerce B2B" (PCI-DSS, pagamentos)

Agente Architect busca guardrails...
Recebe: Guardrails de LGPD (Briefing 1) + PCI-DSS (Briefing 2)
Resultado: Confusão e decisões erradas
```

#### 3. **Memória Episódica Misturada**

`episodic_memory` registra eventos de todos os briefings:
- Narrativas temporais ficam confusas
- Causa-efeito fica incorreto
- Aprendizado fica contaminado

#### 4. **Jira/Confluence Bagunçado**

- Tasks de 5 briefings diferentes no mesmo projeto
- Difícil filtrar por briefing
- Confluence mistura documentação
- Métricas DORA calculadas incorretamente (mistura projetos)

#### 5. **Orquestrador Confuso**

O orquestrador central busca memória global:
- Recebe aprendizados de TODOS os briefings
- Padrões cross-briefing podem ser falsos positivos
- Compartilhamento de componentes errado

## ✅ Soluções

### Solução 1: Campo `briefing_id` (QUICK WIN - 1 dia) ⭐

**Implementação rápida:**
```sql
-- Adicionar campo briefing_id em todas tabelas
ALTER TABLE corporate_memory ADD COLUMN briefing_id TEXT;
ALTER TABLE task_context ADD COLUMN briefing_id TEXT;
ALTER TABLE agent_logs ADD COLUMN briefing_id TEXT;
ALTER TABLE episodic_memory ADD COLUMN briefing_id TEXT;

-- Criar índices
CREATE INDEX idx_corporate_memory_briefing ON corporate_memory(briefing_id);
CREATE INDEX idx_task_context_briefing ON task_context(briefing_id);
CREATE INDEX idx_agent_logs_briefing ON agent_logs(briefing_id);
CREATE INDEX idx_episodic_memory_briefing ON episodic_memory(briefing_id);
```

**Busca filtrada:**
```sql
SELECT * FROM corporate_memory 
WHERE briefing_id = 'briefing-1'
  AND embedding <=> (embedding) < 0.3
ORDER BY embedding <=> (embedding)
LIMIT 5;
```

**Prós:**
- ✅ Implementação rápida (1 dia)
- ✅ Não precisa criar novas infraestruturas
- ✅ Filtro simples nas queries

**Contras:**
- ⚠️ Ainda compartilha mesmo banco (risco de vazamento)
- ⚠️ Precisa passar `briefing_id` em TODAS as queries

### Solução 2: Schema Separation (Médio Prazo - 1 semana)

**Um Supabase, múltiplos schemas:**
```sql
-- Criar schemas separados
CREATE SCHEMA briefing_1;
CREATE SCHEMA briefing_2;
CREATE SCHEMA briefing_3;

-- Tabelas isoladas por schema
briefing_1.corporate_memory
briefing_2.corporate_memory
briefing_3.corporate_memory
```

**Prós:**
- ✅ Isolamento real no banco
- ✅ Queries mais simples (sem filtros)
- ✅ Mais econômico que múltiplos projetos

**Contras:**
- ⚠️ Gerenciamento de schemas complexo
- ⚠️ Migrations precisam rodar em todos schemas

### Solução 3: Instâncias Completas (Recomendado para produção)

**Um Supabase Project por briefing:**
```
Briefing 1: ffdszaiarxstxbafvedi.supabase.co
Briefing 2: novo_project_ref.supabase.co
Briefing 3: outro_project_ref.supabase.co
```

**Prós:**
- ✅ Isolamento TOTAL
- ✅ Pode pausar/deletar sem afetar outros
- ✅ Métricas separadas
- ✅ Custo controlado (pausar projetos não usados)

**Contras:**
- ⚠️ Custo (mas pode pausar)
- ⚠️ Setup inicial mais complexo

## 📊 Comparação: 5 Briefings

| Aspecto | Opção A (Misturado) | Campo briefing_id | Schema Sep. | Instâncias |
|---------|---------------------|-------------------|-------------|------------|
| **Isolamento** | ❌ Nenhum | ⚠️ Parcial | ✅ Bom | ✅ Total |
| **Busca Vetorial** | ❌ Contaminada | ✅ OK (com filtro) | ✅ OK | ✅ Perfeita |
| **Agentes** | ❌ Confusos | ✅ OK (com filtro) | ✅ OK | ✅ Perfeitos |
| **Implementação** | ✅ Já funciona | ✅ 1 dia | ⚠️ 1 semana | ⚠️ Setup por briefing |
| **Custo** | ✅ Baixo | ✅ Baixo | ✅ Baixo | ⚠️ Médio (pausável) |
| **Manutenção** | ❌ Difícil | ⚠️ Média | ⚠️ Média | ✅ Fácil |

## 🎯 Recomendação: Arquitetura Cérebro/Órgão ✅ ADOTADA

### Arquitetura Final Escolhida

✅ **Cérebro Central (Instância Principal)**
- Supabase/Atlassian atual = Cérebro
- Treina agentes especializados
- Memória vetorial global
- Coordenação entre empresas

✅ **Órgãos (Empresas/Briefings)**
- Cada briefing = Novo Supabase + Novo Atlassian
- Isolamento TOTAL de dados
- Operação independente
- Gerenciado pelo cérebro

**Vantagens:**
- ✅ Isolamento completo (sem contaminação)
- ✅ Cérebro forte e evolutivo
- ✅ Agentes especializados treinados
- ✅ Escalável para N empresas
- ✅ Base para operação 24/7 na nuvem

Ver: [ARQUITETURA_CEREBRO_ORGOS.md](ARQUITETURA_CEREBRO_ORGOS.md) para detalhes completos.

## 🚀 Implementação Imediata Recomendada

**Adicionar `briefing_id` AGORA (1 dia de trabalho):**
1. Migração SQL (5 min)
2. Atualizar scripts para passar `briefing_id` (2 horas)
3. Atualizar queries de busca (2 horas)
4. Testar com 2 briefings (1 hora)

**Isso resolve 80% do problema imediatamente!**

---

**Última atualização:** 2025-01-13

