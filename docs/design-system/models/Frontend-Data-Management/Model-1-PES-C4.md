# Model-1-PES-C4: Grade de Metatron (Data Management)

## 1. TECHNICAL SPECIFICATION (The Grid)

### 1.1 High-Density Tables
- **Rows:** Altura fixa de 40px (5x Grid). Separadores em `--color-blueprint`.
- **Headers:** ALL CAPS, Space Grotesk, 10px, tracking 0.2em.
- **Status Columns:** Usam Glifos I3 (Hexágonos, Cubos) para indicar estado.

### 1.2 Interactivity
- **Row Hover:** Background sutil em `rgba(255,255,255,0.03)` + Borda esquerda em `--color-data`.
- **Filtering:** Menu Radial (P2) reduzido para seleção de colunas.

## 2. IMPLEMENTATION GUIDE (React Table / Virtualization)

```javascript
const MetatronGrid = ({ data }) => {
  return (
    <table className="w-full border-collapse font-data text-xs">
      <thead>
        <tr className="border-b-[0.5px] border-blueprint text-blueprint tracking-widest">
          <th>ENTITY_ID</th>
          <th>TELEMETRY</th>
          <th>STATUS</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr className="hover:bg-white/5 border-b-[0.5px] border-blueprint/50">
            <td className="text-high-spec">{row.id}</td>
            <td className="text-data">{row.value}Hz</td>
            <td><StatusGlyph code={row.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** TODO dado numérico DEVE ser alinhado à direita.
- **REGRA 2:** NUNCA use scrolls horizontais em tabelas. Use "Zoom Semântico" ou colapso de colunas.
- **REGRA 3:** NUNCA use botões de "Deletar" com ícones de lixeira comuns. Use o Glifo I3 de "Desintegração de Vetor".

## 4. COMPLIANCE CHECKLIST
- [ ] A tabela utiliza virtualização para datasets grandes?
- [ ] Os cabeçalhos estão em ALL CAPS e fonte Interface?
- [ ] O hover das linhas ativa a borda esquerda em `--color-data`?

---
*Visual Arete: Management is the art of organizing entropy.*
