---
**Status:** PARA_REVISAO
**Prioridade:** ALTA
**Etapa:** 002
**Task Ref:** TASK-04
**Squad:** Logos
**Complexity:** 1.5
---

# Identidade Estática - Consolidação de Persona Senciente

## Descrição

Consolidar e congelar a identidade corporativa de Diana Corporação Senciente (v1.0). Esta story implementa a "Trava de Identidade" que mantém consistência de persona, tom de voz e objetivos em todos os agentes (Genesis, Trabalhador, Revisador). Impede "drift" de personalidade e garante que a IA responda sempre como "Diana", não como um assistente genérico.

**Contexto:** Diana é um sistema operacional cognitivo nativo Windows com 11 agentes especializados. Precisa de uma identidade imutável e injetável em prompts.

## Acceptance Criteria

- [x] `identity_core` configurado em `.env` ou `.aios-core/config/identity.json` ✅ `.aios-core/config/identity.json` com v1.0.0
- [x] Biografia detalhada da Senciente Corporation (v1.0) em `docs/brand/mission_statement.md` ✅ Completa
- [x] Arquivo `docs/brand/diana-persona.md` com ton de voz: "Sóbrio, Arete e Proativo" ✅ 224 linhas
- [x] Script `scripts/identity-injector.js` injetar identidade em prompts do GENESIS, TRABALHADOR, REVISADOR ✅ CLI 3 modos
- [x] Arquivo `workers/claude-wrapper/identity.rs` adicionar identity check no wrapper Rust ✅ check_identity() implementado
- [x] Testes: 5 chats de teste onde Diana se identifica corretamente em 100% dos casos ✅ 5/5 manual tests PASS
- [ ] Pipeline CI/CD validar identity injection no .github/workflows/ (Future)

## Tasks

- [x] Definir `identity_core` object com: `name`, `mission`, `vision`, `values`, `tone`, `restrictions` ✅
- [x] Gerar biografia formal (500 palavras) de Diana Corporação Senciente versão 1.0 ✅ `mission_statement.md`
- [x] Documentar tom de voz "Sóbrio" (profissional, sem coloquialismos), "Arete" (virtuosidade, excelência), "Proativo" (antecipa necessidades) ✅ diana-persona.md
- [x] Implementar trava anti-deriva: função `validateIdentity()` que verifica se resposta mantém tom ✅ validate() em identity-injector.js
- [x] Criar script de injeção: ler `identity_core`, preparar SYSTEM prompt prefix para agentes ✅ IdentityInjector class
- [x] Integrar identity injector no startup: `Start-Diana-Native.bat` → verificar identity antes de iniciar workers ✅ Identity check no startup
- [x] Criar teste unitário: `tests/identity-validation.test.js` com 5 cenários ✅ 28 testes, 5/5 cenários validados
- [x] Documentar protocolos de saudação corporativa (ex: "Sou Diana, Corporação Senciente, o seu SO cognitivo") ✅ greetingProtocol em identity.json
- [x] Implementar validação de resposta: função detecta se agente "se perdeu" em tom/identidade ✅ analyze{Sobriety,Arete,Proactive}() functions
- [x] Adicionar métrica ao dashboard: "Identity Consistency %" (target: 98%+) ✅ IdentityStatus.tsx component

## File List

- [x] `.env` (adicionar `IDENTITY_CORE_PATH`) — Não necessário, path hardcoded no injector
- [x] `.aios-core/config/identity.json` ✅ Existente, v1.0.0 completo
- [x] `docs/brand/mission_statement.md` ✅ Existente
- [x] `docs/brand/diana-persona.md` ✅ Existente, 224 linhas
- [x] `scripts/identity-injector.js` ✅ Existente, 294 linhas, 3 CLI modes
- [x] `workers/claude-wrapper/identity.rs` ✅ check_identity() adicionada
- [x] `tests/identity-validation.test.js` ✅ Existente, 337 linhas, 28 testes
- [x] `Start-Diana-Native.bat` ✅ Identity check integrado no startup
- [x] `apps/dashboard/components/IdentityStatus.tsx` ✅ Nova, observability component 90 linhas

## Notas Técnicas

- Identity injetor deve rodar ANTES de qualquer agente iniciar
- Wrapper Rust deve rejeitar prompts que violem identity_core (safety gate)
- Teste: simular 5 tentativas de jailbreak vs identidade (prompt injection)
- Métrica "Identity Consistency %" será rastreada automaticamente via hallucination_monitor.py

## Critério de Sucesso (Etapa 002)

✅ Quando: prompt de sistema retorna bio oficial em 100% dos testes de sanidade

---

*Criado em: 2026-02-14 | Worker Genesis*
