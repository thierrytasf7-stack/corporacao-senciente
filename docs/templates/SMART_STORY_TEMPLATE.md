# Story: [VERBO DE AÇÃO] [Objeto Direto]
ID: [EVO/FIX]-[TIMESTAMP]
Epic: [Nome do Épico]
Status: TODO
subStatus: pending_worker
Revisions: 0

## 1. Contexto e Objetivo
*Explique POR QUE isso precisa ser feito. Dê contexto breve.*
Ex: O sistema de login está falhando quando o usuário usa caracteres especiais.

## 2. Entregáveis Obrigatórios (Artifacts)
*Liste exatamente quais arquivos devem ser criados ou modificados.*
- [ ] Código fonte modificado em `src/...`
- [ ] Arquivo de relatório `REPORTS/RELATORIO_XYZ.md` (Se for auditoria)
- [ ] Teste unitário `tests/test_xyz.js`

## 3. Critérios de Aceitação (Definition of Done)
*Como o QA vai saber que acabou?*
- [ ] O comando `npm test` passa.
- [ ] O arquivo de relatório existe e não está vazio.
- [ ] Nenhuma nova dependência foi adicionada sem aprovação.

## 🤖 Aider Prompt (INSTRUÇÃO DE EXECUÇÃO)
> ```text
> [INSTRUÇÃO DIRETA PARA O AGENTE]
> Aja como um [Papel: Desenvolvedor Sênior/Auditor de Segurança].
> Sua tarefa é: [Descrever a tarefa de forma atômica].
>
> REGRAS DE OURO:
> 1. Você DEVE criar/editar os arquivos listados nos Entregáveis.
> 2. NÃO termine a conversa sem salvar os arquivos.
> 3. Se for uma análise, escreva o resultado em [NOME_DO_ARQUIVO_RELATORIO].
>
> Contexto Técnico:
> - Use as libs já instaladas.
> - Siga o style guide do projeto.
> ```
