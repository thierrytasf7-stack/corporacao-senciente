# Agentes, Vetores e Decisão

## Camadas vetoriais
- Alma da Empresa (`corporate_memory`): missão/valores/estilo imutáveis. Sempre consultada antes de agir.
- Personas (`agent_logs` como histórico; embeddings externos carregados pelo orquestrador): Architect, Product, Dev.
- Vetor de Planejamento (`task_context`): alvo técnico de cada PRD/issue; relacionar arquivos.

## Personas sugeridas
- Architect: prioriza segurança, escalabilidade, padrões de arquitetura.
- Product: prioriza valor para usuário, clareza de UX, impacto de negócio.
- Dev: prioriza execução rápida, qualidade de código, performance e testes.

## Mecanismo de decisão (mesa redonda)
1) Cada agente gera opinião vetorial sobre a tarefa atual (baseado em sua persona).
2) Calcular média ponderada; se divergência alta, Architect tem peso maior (segurança).
3) Gerar plano com passos curtos, rastreáveis e alinhados ao vetor da tarefa.

## Prevenção de drift
- Comparar código atual (embedding de diffs/PRDs) com `task_context.requirements_vector`.
- Se distância aumentar, replanejar antes de codar mais.

## Memória operacional
- Após commits ou incidentes, registrar `agent_logs` com vetor da decisão e raciocínio.
- Atualizar `corporate_memory` com aprendizados que devem virar “DNA” da empresa.

