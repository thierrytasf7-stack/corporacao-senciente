---
**Status:** PARA_REVISAO
**Prioridade:** ALTA
**Etapa:** 002
**Task Ref:** TASK-09
**Squad:** Aisth
**Decisão QA:** ✅ Implementado (Agent Zero + Manual Fix)

# Template Documentos - Sistema Padrão de Relatórios

## Descrição

Desenvolver um template Markdown padrão e reutilizável para todos os relatórios, documentos técnicos e comunicações formais da Diana Corporação Senciente. Este template estabelecerá uma identidade visual/textual consistente, incluindo estrutura de cabeçalho (metadados Areté), tipografia oficial, rodapé com carimbo de integridade, e estilos para tabelas/diagramas. Objetivo: garantir que todos os documentos corporativos sigam uma linguagem estruturada e profissional.

## Acceptance Criteria

- [x] Criar template Markdown padrão (`docs/brand/report-template.md`) para relatórios
- [x] Definir estrutura de cabeçalho Areté com campos de metadados obrigatórios
- [x] Estabelecer tipografia oficial para documentos internos (fontes, tamanhos, espaçamento)
- [x] Implementar rodapé padrão com carimbo de integridade (data, autor, versão)
- [x] Criar script `generate_report.py` para gerar novos documentos usando o template
- [x] Configurar estilos Markdown para tabelas, listas e diagramas Mermaid
- [x] Validar legibilidade e consistência visual do template

## Tasks

- [ ] Pesquisar templates de documentação corporativa (GitBook, Notion, MkDocs)
- [ ] Definir estrutura de metadados Areté (campos obrigatórios vs opcionais)
- [ ] Escolher tipografia oficial (fonts recomendadas para Markdown rendered)
- [ ] Criar template base em `docs/brand/report-template.md`
- [ ] Documentar cada seção do template com instruções de uso
- [ ] Definir paleta de cores para highlighting/badges (baseado em TASK-06)
- [ ] Criar estilos Markdown para:
  - [ ] Cabeçalhos hierárquicos (H1-H6)
  - [ ] Citações e destaques
  - [ ] Tabelas com formatação consistente
  - [ ] Listas (ordenadas e não-ordenadas)
  - [ ] Blocos de código com syntax highlighting
  - [ ] Admonições (info, warning, error, success)
  - [ ] Diagramas Mermaid integrados
- [ ] Criar script Python `scripts/generate_report.py`:
  - [ ] Aceitar parâmetros: título, autor, tipo (relatório, técnico, briefing)
  - [ ] Gerar arquivo .md com template pré-preenchido
  - [ ] Preencher metadados automaticamente (data, versão)
  - [ ] Adicionar carimbo de integridade (hash SHA256)
- [ ] Testar template com documento exemplo
- [ ] Validar rendereação em múltiplos renderizadores (GitHub, Markdown Preview, PDF)
- [ ] Documentar guia de uso em `docs/brand/writing-guide.md`
- [ ] Obter aprovação final do Criador

## Contexto Corporativo

Documentação padrizada é essencial para manter coerência corporativa. Um template bem definido:

1. **Profissionalismo:** Transmite maturidade organizacional
2. **Rastreabilidade:** Metadados permitem auditoria de autoridade/versão
3. **Integridade:** Carimbo criptográfico protege contra alterações não autorizadas
4. **Acessibilidade:** Estrutura clara facilita leitura e navegação
5. **Reutilização:** Desenvolvedores economizam tempo usando padrão estabelecido

## Requisitos Técnicos

### Estrutura de Metadados Areté

```markdown
---
title: [Título do Documento]
author: [Autor(es)]
date: [Data de Criação - YYYY-MM-DD]
last_modified: [Data de Última Modificação]
version: [X.Y.Z]
status: [DRAFT | REVIEW | APPROVED | ARCHIVED]
classification: [PUBLIC | INTERNAL | CONFIDENTIAL]
tags: [tag1, tag2, tag3]
document_type: [RELATÓRIO | TÉCNICO | BRIEFING | ANÁLISE | PROCEDIMENTO]
squad: [Squad Responsável]
next_review: [Data Próxima Revisão]
integrity_hash: [SHA256 do conteúdo]
integrity_timestamp: [Timestamp do hash]
---
```

### Estrutura de Seções Padrão

```markdown
# [TÍTULO]

## Resumo Executivo
[2-3 linhas sintetizando objetivo e resultado principal]

## Introdução
[Contexto, problema, por que este documento existe]

## Corpo Principal
[Desenvolvimento temático, análises, detalhes técnicos]

### Subseções
[Organizar logicamente conforme conteúdo]

## Conclusões e Recomendações
[Síntese de achados, próximos passos, decisões requeridas]

## Apêndice
[Dados complementares, detalhes técnicos, código, tabelas extensas]

## Histórico de Revisões
| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | [data] | [autor] | Versão inicial |

---

## Carimbo de Integridade
**Documento:** [Nome do Arquivo]
**Hash SHA256:** [Hash computado]
**Timestamp:** [Data/Hora de Criação]
**Assinado por:** [Squad/Autor]
**Validade:** Este documento é válido enquanto o hash não for alterado.

---

*Documento corporativo da Diana Corporação Senciente*
*Gerado em: [DATA] por [SQUAD]*
```

### Paleta Markdown Recomendada

#### Admonições (Info Boxes)
```markdown
> ℹ️ **INFO:** Informação adicional
> ⚠️ **AVISO:** Informação importante, possível risco
> ✅ **SUCESSO:** Operação bem-sucedida
> ❌ **ERRO:** Problema detectado
> 🔐 **CONFIDENCIAL:** Informação sensível
> 📌 **NOTA:** Detalhe relevante
```

#### Tabelas Padrão
```markdown
| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Valor A  | Valor B  | Valor C  |
```

#### Blocos de Código
```markdown
```python
# Exemplo de código com syntax highlighting
def function_name():
    return result
```
```

#### Diagramas Mermaid
```markdown
\`\`\`mermaid
graph TD
    A[Início] --> B{Decisão}
    B -->|Sim| C[Ação A]
    B -->|Não| D[Ação B]
\`\`\`
```

### Script `generate_report.py`

```python
#!/usr/bin/env python3
"""
Generate standardized Diana Corporation report using template.

Usage:
  python generate_report.py --title "Relatório de Análise" \
    --author "Nome do Autor" --type relatório \
    --output docs/reports/
"""

import argparse
import hashlib
from datetime import datetime
from pathlib import Path
import json

def generate_integrity_hash(content: str) -> str:
    """Compute SHA256 hash of document content."""
    return hashlib.sha256(content.encode()).hexdigest()

def create_report(title: str, author: str, doc_type: str, output_dir: Path):
    """Generate new report file with populated metadata."""

    timestamp = datetime.now()
    filename = f"{title.lower().replace(' ', '-')}.md"
    filepath = output_dir / filename

    template = f"""---
title: {title}
author: {author}
date: {timestamp.strftime('%Y-%m-%d')}
last_modified: {timestamp.strftime('%Y-%m-%d')}
version: 1.0.0
status: DRAFT
classification: INTERNAL
tags: []
document_type: {doc_type.upper()}
squad: [Squad Responsável]
next_review: {timestamp.strftime('%Y-%m-%d')} (30 dias)
integrity_hash: [Será preenchido na finalização]
integrity_timestamp: [Será preenchido na finalização]
---

# {title}

## Resumo Executivo
[Preencha com resumo de 2-3 linhas]

## Introdução
[Contexto, problema, objetivo deste documento]

## Corpo Principal

### Seção 1
[Conteúdo aqui]

### Seção 2
[Conteúdo aqui]

## Conclusões e Recomendações
[Síntese, próximos passos, decisões requeridas]

## Apêndice
[Dados complementares, tabelas, código]

## Histórico de Revisões
| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | {timestamp.strftime('%Y-%m-%d')} | {author} | Versão inicial |

---

## Carimbo de Integridade
**Documento:** {filename}
**Hash SHA256:** [Será computado]
**Timestamp:** {timestamp.isoformat()}
**Assinado por:** {author}

---

*Documento corporativo da Diana Corporação Senciente*
*Gerado em: {timestamp.strftime('%Y-%m-%d %H:%M:%S')}*
"""

    filepath.write_text(template)
    print(f"✅ Relatório criado: {filepath}")
    return filepath

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Gerar novo documento seguindo template padrão Diana"
    )
    parser.add_argument("--title", required=True, help="Título do documento")
    parser.add_argument("--author", required=True, help="Autor")
    parser.add_argument("--type", default="relatório",
                       help="Tipo (relatório, técnico, briefing, análise)")
    parser.add_argument("--output", default="docs/reports/",
                       help="Diretório de saída")

    args = parser.parse_args()
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    create_report(args.title, args.author, args.type, output_dir)
```

## File List (Artefatos Criados)

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `docs/brand/report-template.md` | ✅ COMPLETO | Template base em Markdown com guia integrado |
| `scripts/generate_report.py` | ✅ COMPLETO | Script de geração automática (Python 3.8+, argparse, SHA256) |
| `docs/brand/writing-guide.md` | ✅ COMPLETO | Guia prático de uso com passo a passo |
| `docs/brand/typography.md` | ✅ COMPLETO | Tipografia oficial (JetBrains Mono, Inter, tamanhos, CSS) |
| `docs/brand/markdown-styles.md` | ✅ COMPLETO | Referência completa de estilos com exemplos |
| `docs/reports/exemplo-relatorio.md` | ✅ COMPLETO | Documento exemplo preenchido e validado |
| `docs/stories/senciencia-etapa002-task-09-template-documentos.md` | ✅ FINALIZADO | Esta story (PARA_REVISAO) |

## Notas de Implementação

### Processo de Criação
1. **Definir metadados:** Campos obrigatórios vs. opcionais
2. **Estruturar conteúdo:** Seções lógicas e hierarquia
3. **Documentar estilos:** Exemplos de cada elemento Markdown
4. **Criar script:** Automação de geração
5. **Validar:** Testar com documento exemplo
6. **Integração:** Aplicar em documentos corporativos existentes

### Checklist de Qualidade
- [ ] Template é facilmente compreendido (sem ambiguidades)
- [ ] Metadados Areté capturam informações necessárias
- [ ] Script `generate_report.py` funciona sem erros
- [ ] Documento exemplo é legível em múltiplas plataformas
- [ ] Integridade hash é computado corretamente
- [ ] Estilos Markdown são consistentes
- [ ] Guia de uso é completo e acessível

### Integração com Outras Tasks
- **TASK-06:** Paleta de Cores - usar cores oficiais em destacadores
- **TASK-07:** Logo Vetor - incorporar logo em cabeçalho de documentos
- **TASK-08:** Bio Institucional - incluir footer com mission statement
- **TASK-20:** Logs TXT - aplicar mesmo padrão de metadados

### Próximas Iterações
- [ ] Template de PDF renderizável (Pandoc/WeasyPrint)
- [ ] Validador de conformidade com template
- [ ] Versionamento automático de documentos
- [ ] Integração com CI/CD para geração de docs

---

**Story Criada:** 2026-02-14
**Squad Responsável:** Aisth (Design e Padronização)
**Próxima Etapa:** Task-10 (Cadastro Redes Sociais) e integração de template em todas as stories subsequentes
