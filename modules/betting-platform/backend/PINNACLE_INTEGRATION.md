# Integração Pinnacle API - Guia Técnico

Este documento descreve a implementação da integração com a Pinnacle API para o **Testnet Bet Ecosystem**.

## Arquitetura de Feed (Market Data)

Implementamos uma arquitetura robusta baseada em **Snapshot + Delta** para respeitar a "Fair Use Policy" da Pinnacle e evitar banimento por excesso de requisições.

### Componentes

1.  **PinnacleAPIClient (`client.ts`):** Wrapper de baixo nível que faz as chamadas HTTP. Suporta autenticação Basic Auth e parâmetros de filtro.
2.  **PinnacleFeedService (`feed-service.ts`):** O cérebro da operação.
    *   **Singleton:** Deve haver apenas UMA instância rodando em todo o sistema.
    *   **Cache:** Mantém o estado atual do mercado (`fixturesCache`, `oddsCache`) em memória.
    *   **Event Emitter:** Emite o evento `market_update` sempre que dados novos chegam.

### Mecanismo Snapshot vs Delta

Para otimizar banda e respeitar limites:

1.  **Inicialização (Snapshot):** Ao ligar, o serviço baixa **TODOS** os jogos e odds ativos. Isso estabelece a base.
2.  **Polling (Delta):** A cada 5 segundos (configurável), o serviço pergunta à API: *"O que mudou desde o tempo X?"*.
    *   A API retorna apenas as odds que mudaram.
    *   O serviço faz o "merge" dessas mudanças no cache local.
3.  **Refresh (Reset):** A cada 1 hora, forçamos um novo Snapshot para garantir que não haja "drift" (dados fantasmas) e limpar jogos finalizados.

### Como Ativar (Produção)

1.  Obtenha credenciais da Pinnacle (Conta financiada).
2.  Adicione ao `.env`:
    ```env
    PINNACLE_USERNAME=seu_usuario
    PINNACLE_PASSWORD=sua_senha
    ```
3.  O `testnet-simulation.ts` detectará as credenciais e trocará o modo Mock pelo modo Real automaticamente (lógica a ser implementada na factory).

### Segurança

*   Credenciais nunca são hardcoded.
*   Rate Limiting implementado no cliente (4 requests/segundo burst).
*   Logs sanitizados (sem senhas).

### Performance

*   Uso de `Map` para acesso O(1) aos dados de mercado.
*   Bots não fazem requests HTTP; eles consomem eventos em memória (latência < 1ms).
