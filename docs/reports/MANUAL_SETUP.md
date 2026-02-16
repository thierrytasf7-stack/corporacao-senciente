# 🛠️ Configuração Manual Necessária

Devido a restrições de permissão e rede, algumas etapas precisam ser finalizadas manualmente.

## 1. Banco de Dados (Supabase) - Horizonte 2 (Memória)

O sistema não teve permissão para rodar o SQL de configuração do `pgvector`.
**Ação:**

1. Vá ao painel do seu projeto Supabase: [SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Crie uma **New Query**.
3. Copie e cole o conteúdo do arquivo: `backend/memory/setup.sql`.
4. Clique em **Run**.

Isso habilitará a memória vetorial da corporação.

## 2. Ingestão de Memória (Inicialização)

Após configurar o SQL, rode o script de ingestão para testar a memória:

```bash
cd backend
node memory/ingest.js "Inicializando memoria da Corporacao Senciente"
```

*Nota: Se houver erro de rede (SocketError), verifique sua conexão ou proxy, pois o script baixa modelos do Hugging Face.*

## 3. Daemon & Terminal - Horizonte 1 (Ponte Física)

O Daemon já está configurado. Para rodá-lo:

```powershell
cd backend/daemon
node index.js
```

O Terminal Web estará acessível em `http://localhost:5173/monitoring` na seção "DIRECT LINK ACCESS".

## 4. Wallet (Horizonte 3) - Opcional

A instalação da biblioteca `ethers` falhou devido a erros de SSL/Node v22.
Se desejar ativar a carteira de cripto no futuro, tente instalar manualmente com outra versão do Node ou gerenciador de pacotes:

```bash
cd backend
npm install ethers
node wallet/generate.js
```
