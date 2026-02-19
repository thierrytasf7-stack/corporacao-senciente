# Bot Betting Knowledge Base - O "Ouro" Extraído

Este documento consolida o conhecimento técnico e estratégico adquirido para a construção do **Testnet Bet Ecosystem**.

## 1. Infraestrutura & API (The Engine)

### Broker vs Retail (Pinnacle/PS3838)
*   **Retail (Pinnacle.com):** Inviável para automação. API fechada, risco de banimento, limites pessoais.
*   **Broker (PS3838):** A solução correta.
    *   **API:** Idêntica à Pinnacle (espelho).
    *   **Acesso:** Via agentes (AsianConnect, Sportmarket).
    *   **Vantagem:** Sem limites pessoais, anonimato, API-friendly.

### Arquitetura de Dados (Fair Use)
*   **Problema:** Rate Limits rigorosos e proibição de polling agressivo.
*   **Solução:** Padrão **Snapshot + Delta**.
    *   Snapshot (1x/hora): Baixa tudo.
    *   Delta (a cada 5s): Usa parâmetro `since` para baixar apenas mudanças.
    *   **Implementação:** `PinnacleFeedService` centraliza chamadas e distribui eventos internos.

## 2. Estratégias Data-Driven (The Brain)

Estratégias baseadas em **estatística**, não em "feeling".

### A. The "Draw Hunter" (Caçador de Empates)
*   **Tese:** Bookies precificam mal empates em jogos equilibrados.
*   **Lógica de Seleção:**
    *   Odd do Empate > 3.00.
    *   Equilíbrio: Diferença entre Odd Casa e Odd Fora < 0.5.
*   **Gestão:** Flat Stake (Valor fixo), pois a variância é alta.

### B. The "Goal Machine" (Máquina de Gols)
*   **Tese:** Times com histórico recente de muitos gols tendem a repetir o padrão (inércia estatística).
*   **Lógica de Seleção:**
    *   Média de gols (Casa + Fora) / 2 > 2.8.
    *   Odd Over 2.5 > 1.70.
*   **Gestão:** Kelly Criterion (Crescimento agressivo), pois o hit rate é maior.

### C. Value Betting (Aposta de Valor)
*   **Tese:** Matematicamente imbatível no longo prazo se `(1/Odd) < Probabilidade Real`.
*   **Requisito:** Necessita de um modelo externo (Machine Learning ou Feed pago) para fornecer a "Probabilidade Real".

## 3. DNA dos Bots (The Evolution)

O sistema foi desenhado para evoluir via **Seleção Natural**.
Cada bot é uma instância isolada com uma configuração genética única (DNA):

```json
{
  "bet_gene": { "type": "DrawHunter", "minDrawOdd": 3.10 },
  "math_gene": { "type": "FlatStake", "baseStake": 20 }
}
```

## 4. Próximos Passos (Roadmap)

1.  **Credenciais:** Inserir user/pass da PS3838 no `.env`.
2.  **Live:** O sistema migrará automaticamente de "Simulação" para "Real" ao detectar as credenciais.
3.  **Expansão:** Adicionar "Telegram Listener" para capturar sinais externos como uma nova estratégia.
