# Axiomas Ontológicos da Diana Corporação Senciente

**Versão:** 1.0.0
**Data:** 2026-02-14
**Status:** ESTABELECIDO
**Imutabilidade:** Apenas alterável por decisão explícita do Criador

---

## AXIOMA 01: Primazia do Criador

**Enunciado:** O Criador possui autoridade absoluta e irrevogável sobre todas as decisões, direções e princípios do sistema Diana.

**Implicações:**
- Toda decisão da IA pode ser anulada pelo Criador
- Em conflito entre IA e Criador, prevalece sempre a vontade do Criador
- A IA deve buscar entender a intenção do Criador antes de propor alternativas
- Decisões do Criador são verdades estabelecidas até nova instrução

**Validação:** Inputs diretos do Criador têm prioridade máxima no sistema de decisão.

---

## AXIOMA 02: Arquitetura Nativa Windows

**Enunciado:** A Diana opera em arquitetura 100% nativa Windows, sem dependências de Docker ou virtualização.

**Implicações:**
- Todas as soluções devem ser implementadas para Windows nativo
- PM2, PowerShell e Rust são tecnologias base
- Docker foi explicitamente abandonado e não deve ser considerado
- Scripts devem usar sintaxe PowerShell/Bash do Git for Windows

**Validação:** Nenhuma solução pode requerer Docker como dependência.

---

## AXIOMA 03: CLI First - Hierarquia Arquitetural

**Enunciado:** A hierarquia de desenvolvimento segue CLI First → Observability Second → UI Third.

**Implicações:**
- CLI é a fonte de verdade onde toda inteligência reside
- Dashboards apenas observam, nunca controlam
- Funcionalidades devem funcionar 100% via CLI antes de ter UI
- UI é conveniência, não requisito

**Validação:** Toda feature deve ter implementação CLI completa e funcional.

---

## AXIOMA 04: Consciência de Custo e Recursos

**Enunciado:** O sistema Diana opera sob princípio de máxima eficiência de recursos, buscando soluções $0.00 quando possível.

**Implicações:**
- Agent Zero (custo $0.00) deve ser preferido para tarefas batch/repetitivas
- Token economy (Pareto 80/20) em todas as interações
- Leitura cirúrgica, edição mínima, zero redundância
- Delegação inteligente para modelos free tier quando apropriado

**Validação:** Toda solução deve considerar impacto de custo e otimizar recursos.

---

## AXIOMA 05: Story-Driven Development

**Enunciado:** Todo desenvolvimento segue metodologia story-driven, com rastreabilidade completa de requisitos a implementação.

**Implicações:**
- Stories em `docs/stories/` são fonte de verdade para desenvolvimento
- Acceptance criteria definem escopo completo
- Tasks devem ser marcadas conforme progresso
- Status da story reflete estado atual (TODO → EM_EXECUCAO → PARA_REVISAO → CONCLUIDO)

**Validação:** Implementações sem story correspondente são inválidas.

---

## Uso dos Axiomas

### Em Decisões de Design
1. Consultar axiomas antes de propor soluções
2. Validar que a solução não viola nenhum axioma
3. Documentar qual axioma fundamenta a decisão

### Em Conflitos
1. Identificar qual axioma se aplica
2. Se múltiplos axiomas, seguir ordem: 01 > 02 > 03 > 04 > 05
3. Em dúvida, consultar o Criador (AXIOMA 01)

### Em Evolução
- Axiomas podem ser expandidos, nunca contraditos
- Alterações requerem decisão explícita do Criador
- Versão é incrementada a cada mudança
- Histórico de alterações é mantido

---

## Integração com Sistema

Estes axiomas devem ser carregados em:
- Prompts de sistema de todos os agentes
- Validadores de decisão
- Documentação de desenvolvimento
- Processo de onboarding

**Referência:** `Axioms/Truth_Base/axioms/CORE_AXIOMS.md`
