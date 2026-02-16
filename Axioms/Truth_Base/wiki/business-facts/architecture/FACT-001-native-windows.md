---
id: FACT-001
title: Arquitetura 100% Nativa Windows
category: architecture
status: ESTABLISHED
version: 1.0.0
created: 2026-02-14
updated: 2026-02-14
source: CREATOR
axiom: AXIOM_02
---

# Arquitetura 100% Nativa Windows

## Contexto

A Diana Corporação Senciente foi inicialmente projetada com Docker, mas evoluiu para arquitetura nativa Windows após análise de complexidade, overhead e alinhamento com o ambiente de desenvolvimento do Criador.

## Definição

**A Diana opera exclusivamente em arquitetura nativa Windows, sem dependências de Docker ou virtualização.**

Tecnologias base:
- **PM2**: Gestão de processos e ciclo de vida
- **PowerShell**: Scripts de automação e controle
- **Rust**: Workers de alta performance
- **Node.js nativo**: Servidores e APIs
- **Git Bash**: Shell compatível Unix no Windows

## Implicações

### Para Desenvolvimento
- Todas as soluções devem rodar nativamente no Windows 10/11
- Scripts devem usar PowerShell ou Bash (Git for Windows)
- Paths devem considerar sintaxe Windows (`\` ou `/`)
- Permissões seguem modelo Windows (não Unix)

### Para Deploy
- PM2 gerencia todos os processos via `ecosystem.config.js`
- Startup via `.bat` ou `.ps1` scripts
- Logs nativos do PM2 (sem Docker logs)
- Windows Terminal para monitoramento multi-aba

### Para Dependências
- Pacotes devem ter binários Windows ou ser pure JavaScript
- Preferir soluções cross-platform quando possível
- Evitar dependências Unix-only
- Testar em ambiente Windows real

## Exemplos

### ✅ Correto
```bash
# PowerShell script
Start-Diana-Native.bat

# PM2 startup
pm2 start ecosystem.config.js

# Rust worker nativo
workers/claude-wrapper/target/release/wrapper.exe
```

### ❌ Incorreto
```bash
# Docker (ABANDONADO)
docker-compose up

# Unix-only paths
/var/run/diana.sock

# Shell scripts incompatíveis
#!/bin/bash com sintaxe Unix-only
```

## Relacionamentos

- **Deriva de**: [AXIOM_02] Arquitetura Nativa Windows
- **Fundamenta**:
  - [DECISION-001] Abandono do Docker
  - [DECISION-002] Adoção do PM2
- **Impacta**:
  - [FACT-010] Política de Startup
  - [FACT-015] Gestão de Logs

## Histórico

- **2026-02-14**: Estabelecido como fato formal
- **2026-02**: Docker abandonado, migração para nativo completa
- **2025-12**: Primeiros testes com PM2 nativo

---

**Autoridade**: CREATOR
**Imutável até**: Nova decisão explícita do CREATOR
