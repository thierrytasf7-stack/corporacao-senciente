# Resumo: Arquitetura Cérebro Central

## 🧠 Visão Geral

Arquitetura onde o **Cérebro Central** treina agentes especializados que operam em **Órgãos** (empresas/briefings) isolados.

## 📊 Estrutura

```
CÉREBRO CENTRAL
├── Supabase: ffdszaiarxstxbafvedi (atual)
├── Atlassian: Space "Cérebro"
├── Responsabilidades:
│   - Treinar agentes especializados
│   - Memória vetorial global
│   - Coordenação entre empresas
│   - Aprendizado agregado
│   - Operação 24/7 (futuro)
│
└── 30+ Agentes Especializados:
    - Copywriting, Marketing, Sales
    - Development, Architect, Product
    - Finance, Legal, HR
    - Security, Operations, Data
    - ... e mais

        ↓ Gerenciam ↓

ÓRGÃO 1 (Briefing 1)
├── Supabase: novo_project_ref_1
├── Atlassian: Projeto/Space próprio
└── Dados isolados

ÓRGÃO 2 (Briefing 2)
├── Supabase: novo_project_ref_2
├── Atlassian: Projeto/Space próprio
└── Dados isolados

... (N órgãos)
```

## 🎯 Benefícios

1. **Isolamento Total**: Cada empresa tem seus próprios dados
2. **Cérebro Forte**: Agentes especializados treinados centralmente
3. **Escalável**: Pode gerenciar N empresas
4. **Evolutivo**: Cérebro aprende e melhora continuamente
5. **24/7**: Preparado para operação autônoma na nuvem

## 🚀 Triagem de Novo Briefing

1. Solicita novo Supabase Project (ou fornece existente)
2. Solicita novo Atlassian Project/Space (ou fornece existente)
3. Cria estrutura em `instances/briefings/briefing-xxx/`
4. Configura `.env` isolado
5. Registra órgão no cérebro
6. Linka agentes especializados

## 📁 Estrutura de Arquivos

```
instances/
├── cerebro/
│   └── .env (Supabase/Atlassian do cérebro)
│
└── briefings/
    ├── briefing-1/
    │   └── .env (Supabase/Atlassian isolados)
    └── briefing-2/
        └── .env (Supabase/Atlassian isolados)
```

## 📋 Agentes Especializados (30+)

### Essenciais
- Copywriting, Development, Marketing, Sales
- Debug, Training, Validation, Finance

### Estruturais (já existem)
- Architect, Product, DevEx, Metrics, Entity

### Expandidos
- Customer Success, Operations, Security
- Data, Legal, HR, Innovation

### Avançados
- Content Strategy, Partnership, Brand
- Compliance, Risk, Quality, Communication
- Strategy, Research, Automation

Ver: [AGENTES_ESPECIALIZADOS_COMPLETO.md](AGENTES_ESPECIALIZADOS_COMPLETO.md) para lista completa.

## 🔄 Fluxo

1. **Triagem**: Cria órgão isolado
2. **Treinamento**: Agentes treinam no cérebro
3. **Operação**: Agentes operam no órgão
4. **Evolução**: Cérebro aprende e melhora

## 📚 Documentação Relacionada

- [ARQUITETURA_CEREBRO_ORGOS.md](ARQUITETURA_CEREBRO_ORGOS.md) - Detalhes completos
- [AGENTES_ESPECIALIZADOS_COMPLETO.md](AGENTES_ESPECIALIZADOS_COMPLETO.md) - Lista de agentes
- [ISOLAMENTO_DADOS_MULTIPLOS_BRIEFINGS.md](ISOLAMENTO_DADOS_MULTIPLOS_BRIEFINGS.md) - Problema e soluções

---

**Última atualização:** 2025-01-13

























