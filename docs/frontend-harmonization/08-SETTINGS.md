# 🏛️ Harmonização Frontend: SETTINGS
**Rota:** `/settings` | **Componente:** `src/pages/Settings/Settings.tsx`

Este documento consolida a análise técnica e funcional para a harmonização da aba **Configurações**.

---

## 1. 🧱 Data Engineering (Schema & Dados)
**Estado Atual:**
Maioria dos controles são visuais (`defaultValue={45}`, lista estática de integrações).
`BridgeService` é a única integração real visível.

### Schema Proposto (Configuração Global)
Endpoint `/api/config/system` (GET/POST).
```typescript
interface SystemConfigDTO {
  autonomy: {
    level: number; // 0-100
    risk_heuristic: 'Balanced' | 'Conservative' | 'Aggressive';
    auto_approval_budget: number;
  };
  automations: {
    sync_crm: boolean;
    predictive_analysis: boolean;
    sec_scan: boolean;
  };
  integrations: {
    openai: { active: boolean; model: string };
    gemini: { active: boolean; model: string };
    github: { active: boolean; synced_repos: number };
  };
}
```
**Ação:** Criar tabela `system_config` no banco de dados para persistir essas escolhas. Hoje elas morrem no reload.

---

## 2. 📝 Product Owner (Histórias de Usuário)

### Story 1: Ajuste de Autonomia
**Como** Controlador Humano,
**Quero** definir o nível de autonomia da IA (Passivo vs Autônomo),
**Para** controlar o risco de operações indesejadas.

**Critérios de Aceite:**
- [ ] O Slider deve persistir o valor no Backend.
- [ ] Mudar para "Aggressive" deve exigir confirmação (Modal).

### Story 2: Gestão de Chaves de API
**Como** Admin,
**Quero** ver quais serviços estão conectados (Verde/Cinza),
**Para** depurar problemas de conexão.

---

## 3. 🎨 Product Manager (Design Atômico)

### Organismos
-   `AutomationPanel`: Seção de controles deslizantes e toggles.
-   `IntegrationGrid`: Grid de cards de serviços externos.
-   `BridgeTable`: Tabela de hardware conectado.

### Componentes
-   `RangeSlider`: Estilizar o input range padrão do HTML para o tema Cyberpunk.
-   `IntegrationCard`: Card com toggle (Check) e status.

**Instrução:**
-   Extrair `BridgeStatus` para `src/components/organisms/BridgeStatus.tsx`.
-   Fazer o botão "Save Changes" ficar habilitado apenas quando houver mudanças não salvas (Dirty State).

---

## 4. 🛠️ Developer (Instruções Técnicas)

1.  **Formulário:** Envelopar os inputs em um `FormProvider` (React Hook Form) para gerenciar o estado do formulário de forma eficiente.
2.  **Mock vs Real:** As integrações (OpenAI, Gemini) estão hardcoded como `active: true/false`. Ligar isso a um endpoint de `/api/integrations/status` que testa a chave de API real.
3.  **Bridge:** O `BridgeService` parece funcional. Garantir que ele trata timeout se o Daemon local não responder.

---

## 5. 🖌️ UX Design (Refinamento)

-   **Feedback:** Ao salvar, mostrar toast de sucesso "System Reconfigured".
-   **Segurança:** Campos sensíveis (como chaves de API, se forem adicionadas) devem ser mascarados (`••••`).
-   **Responsividade:** A tabela de Hardware (`BridgeStatus`) precisa de scroll horizontal em mobile.
