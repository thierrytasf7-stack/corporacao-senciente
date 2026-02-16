# Guia de Início Rápido (Quick Start)

Bem-vindo à **Corporação Senciente**. Este guia irá ajudá-lo a colocar seu sistema autônomo em execução em 5 minutos.

## 1. Instalação e Configuração

### Pré-requisitos

- Node.js v18+
- Chave de API Supabase (URL e Service Role) no `.env`
- Chaves de API de Modelos (OpenAI, Anthropic, xAI, Gemini)

### Passos

1. **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-repo/senciencia.git
    cd senciencia
    ```

2. **Instale as dependências:**

    ```bash
    npm install
    ```

3. **Configure o ambiente:**
    Copie o exemplo e preencha suas chaves:

    ```bash
    cp .env.example .env
    # Edite o .env com suas chaves
    ```

## 2. Seu Primeiro Comando

Use o CLI unificado `senc` (ou `s`) para interagir com o sistema.

Verifique o status da corporação:

```bash
npm run s -- status
# ou se configurou o alias:
senc status
```

Você verá o logo da Senciência e o estado atual dos módulos (Brain, Arms, Memory).

## 3. Modo Assistido: Trabalhando com o Brain

Para tarefas complexas, consulte o Brain. Ele planejará e delegará para agentes especializados.

**Incorporar o Brain no seu Chat/IDE:**

```bash
senc incorporar brain "Preciso criar uma landing page para o produto X"
```

Isso gera um prompt otimizado e (se configurado) o envia diretamente para seu cursor/IDE.

**Fluxo Típico:**

1. Você pede ao Brain.
2. Brain gera um plano e escolhe um agente (ex: `dev_frontend`).
3. Brain te dá o prompt desse agente.
4. Você (ou o sistema) executa o prompt do agente.

## 4. Modo Autônomo: O Daemon

Para deixar a corporação trabalhando em segundo plano (enquanto você toma café ☕).

**Iniciar o Daemon:**

```bash
senc daemon start
```

O Daemon entrará no ciclo **Brain → Arms**:

1. **Brain Phase**: Analisa inbox e prioridades.
2. **Arms Phase**: Executa as 3 tarefas mais prioritárias.
3. **Learning**: Aprende com os resultados.

**Monitorar:**

```bash
senc daemon status
```

## 5. Comandos Úteis

| Ação | Comando |
|---|---|
| **Listar Agentes** | `senc agentes listar` |
| **Mesa Redonda** | `senc avaliar "Devo migrar para Next.js 14?"` |
| **Criar Projeto** | `senc projeto criar "Novo App"` |
| **Chat Direto** | `senc chat` |

## Próximos Passos

- Leia o [Guia de Comandos](COMANDOS.md) para lista completa.
- Entenda a [Arquitetura](../02-architecture/SWARM_ARCHITECTURE.md).
