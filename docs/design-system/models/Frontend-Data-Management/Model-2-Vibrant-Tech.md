# Model-2-Vibrant-Tech: Grades de Dados e Tabelas (Data Management)

## 1. TECHNICAL SPECIFICATION (Complex Tables)

### 1.1 Table Structure
- **Header:** Background `#1E1E1E`, Texto Montserrat SemiBold, Cor Verde Vibrante.
- **Rows:** Zebra striping leve (Cinza 800 / Cinza 900).
- **Radius:** 12px no container externo da tabela.

### 1.2 Components
- **Pagination:** Botões minimalistas com hover em Verde Vibrante.
- **Status Tags:** Pills com background opacidade 10% da cor de status (ex: Verde para 'Ativo').

## 2. IMPLEMENTATION GUIDE (React / Tailwind)

```jsx
const DataTable = ({ columns, data }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-700">
      <table className="min-w-full divide-y divide-neutral-700">
        <thead className="bg-neutral-800">
          <tr>
            {columns.map(col => (
              <th className="px-6 py-3 text-left font-header text-vibrant text-xs uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-neutral-900 divide-y divide-neutral-800">
          {/* Rows */}
        </tbody>
      </table>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use tabelas sem paginação para mais de 50 registros.
- **REGRA 2:** A ordenação de colunas deve ter feedback visual imediato (ícone duotone).
- **REGRA 3:** Acessibilidade WCAG AAA: Linhas selecionáveis devem ter borda de foco pronunciada.

## 4. COMPLIANCE CHECKLIST
- [ ] A tabela é responsiva (scroll horizontal em mobile)?
- [ ] Os cabeçalhos utilizam a fonte Montserrat?
- [ ] O sistema de zebra striping está ativo?

---
*Eutaxia: Structure is the discipline of data.*
