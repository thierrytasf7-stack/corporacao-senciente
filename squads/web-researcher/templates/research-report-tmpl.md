# 📊 Relatório de Pesquisa: {{title}}

**Data:** {{date}}
**Pesquisador:** Scout — Web Research Specialist
**Fontes consultadas:** {{sources_count}}
**Plataformas:** {{platforms}}

---

## Sumário Executivo

{{executive_summary}}

---

## Resultados da Pesquisa

{{#each sections}}
### {{section_title}}

{{content}}

{{/each}}

---

## 🎯 Recomendações

| Decisão | Recomendação | Confiança | Motivo |
|---------|-------------|-----------|--------|
{{#each recommendations}}
| {{decision}} | {{recommendation}} | {{confidence}} | {{reason}} |
{{/each}}

---

## ⚠️ Riscos e Ressalvas

{{risks}}

---

## 📚 Fontes

{{#each sources}}
{{index}}. [{{title}}]({{url}}) — {{date}} — {{credibility}}
{{/each}}

---

*Gerado por Scout (web-researcher) — Diana Corporação Senciente*
