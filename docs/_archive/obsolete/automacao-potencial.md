# Potencial de Automação - Nível 1

Este documento mapeia os pontos de automação identificados durante a Harmonização Inicial (Nível 1), servindo como guia para os agentes de DevOps e QA.

## 1. Scripts Existentes (Inventário)
O diretório `scripts/` foi consolidado e contém:
- **Deploy/Infra:** `setup_ubuntu_simple.sh`, `setup_firewall.ps1`, `IMPORTAR_RECURSOS_AIOS.ps1`
- **Validação:** `TESTAR_*.ps1`, `check_*.ts/js`
- **Operação:** `START_ALL_DAEMONS.bat`, `REINICIAR_MAESTRO.ps1`

## 2. Oportunidades Imediatas (Low Hanging Fruit)
- [ ] **Unificação de Testes:** Criar um script mestre (`scripts/test_all.ps1`) que execute todos os `TESTAR_*.ps1` e `npm test` em sequência.
- [ ] **Linting Automático:** Configurar `husky` (já presente em `.husky`) para rodar `npm run lint` no pre-commit de forma estrita (atualmente parece permissivo).
- [ ] **Limpeza de Temp:** Script para limpar `temp/build` e `temp/cache` automaticamente antes de builds de produção.

## 3. Integração AIOS
- Agentes como `@qa-aider` podem ser configurados para ler este arquivo e executar os scripts de validação listados em `scripts/` autonomamente.

## 4. Próximo Nível (Evolução)
- Implementar pipeline de CI/CD via GitHub Actions (ver `.github/workflows`) que utilize os scripts de `deployments/docker`.
