# Threat Model: {feature_name}

**Data:** {date}
**Autor:** Sentinel (Security Engineer)
**Escopo:** {scope}
**Status:** {status}

---

## 1. System Description

**Feature/Sistema:** {description}

**Dados Sensiveis:**
- {sensitive_data_1}
- {sensitive_data_2}

**Interfaces Externas:**
- {interface_1}
- {interface_2}

---

## 2. Data Flow Diagram

```
{data_flow_ascii_diagram}

Exemplo:
  [User] --HTTPS--> [Frontend :21300]
    |                    |
    |                    v
    |              [API :21301] --SQL--> [PostgreSQL :5432]
    |                    |
    |                    v
    |              [External API]
```

---

## 3. Trust Boundaries

| Boundary | From | To | Protection |
|----------|------|----|------------|
| {boundary_1} | {from} | {to} | {protection} |
| {boundary_2} | {from} | {to} | {protection} |

---

## 4. STRIDE Analysis

### Spoofing (Identidade)

| # | Ameaca | Likelihood | Impact | Risk | Mitigacao |
|---|--------|-----------|--------|------|-----------|
| S1 | {threat} | {likelihood} | {impact} | {risk} | {mitigation} |

### Tampering (Integridade)

| # | Ameaca | Likelihood | Impact | Risk | Mitigacao |
|---|--------|-----------|--------|------|-----------|
| T1 | {threat} | {likelihood} | {impact} | {risk} | {mitigation} |

### Repudiation (Nao-repudio)

| # | Ameaca | Likelihood | Impact | Risk | Mitigacao |
|---|--------|-----------|--------|------|-----------|
| R1 | {threat} | {likelihood} | {impact} | {risk} | {mitigation} |

### Information Disclosure (Confidencialidade)

| # | Ameaca | Likelihood | Impact | Risk | Mitigacao |
|---|--------|-----------|--------|------|-----------|
| I1 | {threat} | {likelihood} | {impact} | {risk} | {mitigation} |

### Denial of Service (Disponibilidade)

| # | Ameaca | Likelihood | Impact | Risk | Mitigacao |
|---|--------|-----------|--------|------|-----------|
| D1 | {threat} | {likelihood} | {impact} | {risk} | {mitigation} |

### Elevation of Privilege (Autorizacao)

| # | Ameaca | Likelihood | Impact | Risk | Mitigacao |
|---|--------|-----------|--------|------|-----------|
| E1 | {threat} | {likelihood} | {impact} | {risk} | {mitigation} |

---

## 5. Risk Summary

| Risk Level | Count | Top Threats |
|------------|-------|-------------|
| Critical | {count} | {threats} |
| High | {count} | {threats} |
| Medium | {count} | {threats} |
| Low | {count} | {threats} |

---

## 6. Mitigation Plan

| Priority | Mitigacao | Owner | Status | Deadline |
|----------|-----------|-------|--------|----------|
| 1 | {mitigation} | {owner} | {status} | {deadline} |

---

## 7. Residual Risk

Apos implementacao de todas as mitigacoes:

| Ameaca | Risk Original | Risk Residual | Aceito? |
|--------|--------------|---------------|---------|
| {threat} | {original} | {residual} | {accepted} |

---

## 8. Review Schedule

- Proximo review: {next_review_date}
- Trigger para review imediato: {trigger}

---

*Threat Model by Sentinel, Security Engineer*
