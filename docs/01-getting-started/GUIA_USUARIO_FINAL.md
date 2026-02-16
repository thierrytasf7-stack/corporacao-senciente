# 🧠 Guia do Usuário Final - Corporação Senciente 7.0

## Visão Geral

Bem-vindo à **Corporação Senciente 7.0**! Esta é uma inteligência artificial autônoma que opera como uma corporação virtual completa, capaz de pensar, decidir e executar tarefas de forma independente.

A corporação funciona em **dois modos principais**:
- **🧠 Modo Assistido**: Você guia e supervisiona as ações
- **🤖 Modo Autônomo**: A corporação opera independentemente

---

## 🚀 Início Rápido

### 1. Instalação e Configuração

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp env.local.example env.local
# Edite env.local com suas credenciais

# 3. Inicializar banco de dados
npm run seed

# 4. Iniciar backend
npm run backend:start

# 5. Abrir dashboard
# Acesse http://localhost:3000
```

### 2. Primeiro Contato

1. **Abra o Dashboard**: `http://localhost:3000`
2. **Clique no botão 🤖** no canto superior esquerdo para abrir o painel de agentes
3. **Selecione um agente** (ex: Marketing Agent)
4. **Clique em "Incorporar"** para começar a trabalhar

---

## 🎯 Como Usar

### Modo Assistido (Recomendado para Iniciantes)

#### 1. Escolher um Agente
- Abra o **painel lateral** (🤖 botão)
- Navegue pelas **seções**: Technical, Business, Operations
- Clique em um agente para selecioná-lo

#### 2. Definir a Tarefa
- No campo **"Personalizar tarefa"**, descreva o que quer fazer
- Exemplos:
  - "Crie uma campanha de marketing para produto X"
  - "Analise os dados de vendas do último trimestre"
  - "Otimize o código desta função"

#### 3. Incorporar e Executar
- Clique em **"🚀 Incorporar"**
- O prompt será enviado ao chat/IDE
- Acompanhe o progresso no **histórico de incorporações**

#### 4. Supervisionar
- Monitore o **dashboard de progresso**
- Veja **métricas em tempo real** (confiança, custos, tempo)
- **Aprove ou rejeite** ações críticas quando solicitado

### Modo Autônomo (Avançado)

#### 1. Ativar Daemon
```bash
# Iniciar daemon Brain/Arms
node scripts/senciencia/daemon_chat.js start

# Verificar status
node scripts/senciencia/daemon_chat.js status
```

#### 2. Configurar Parâmetros
```bash
# Ajustar intervalos
node scripts/senciencia/daemon_chat.js config set brainSessionInterval 300000
node scripts/senciencia/daemon_chat.js config set maxTasksPerCycle 5
```

#### 3. Monitorar Atividade
- Acesse o **dashboard** para ver atividade em tempo real
- Monitore **métricas de senciência**
- Veja o **histórico de decisões**

---

## 🤖 Entendendo os Agentes

### Setores e Especializações

#### 🔧 **Technical Sector** (Desenvolvimento)
- **Architect Agent**: Design de sistemas e arquitetura
- **Dev Agent**: Desenvolvimento e codificação
- **Debug Agent**: Debugging e resolução de problemas
- **Validation Agent**: Testes e qualidade

#### 💼 **Business Sector** (Negócios)
- **Marketing Agent**: Marketing e campanhas
- **Sales Agent**: Vendas e conversão
- **Copywriting Agent**: Conteúdo e comunicação
- **Finance Agent**: Finanças e custos

#### ⚙️ **Operations Sector** (Operações)
- **DevEx Agent**: Experiência do desenvolvedor
- **Metrics Agent**: Métricas e performance
- **Security Agent**: Segurança
- **Quality Agent**: Qualidade e processos

### Como Escolher o Agente Certo

| O Que Você Quer | Agente Recomendado |
|------------------|-------------------|
| Criar código | Dev Agent |
| Resolver bugs | Debug Agent |
| Fazer marketing | Marketing Agent |
| Vender mais | Sales Agent |
| Escrever textos | Copywriting Agent |
| Analisar dados | Data Agent |
| Gerenciar projeto | Product Agent |
| Controlar custos | Finance Agent |
| Garantir qualidade | Validation Agent |

---

## 📊 Monitoramento e Controle

### Dashboard Principal

#### 📈 **Visão Geral**
- **Status da corporação** (Rodando/Parado)
- **Métricas de performance** (taxa de sucesso, tempo médio)
- **Atividade atual** (agente trabalhando, tarefa em andamento)

#### 📋 **Decisões e Ações**
- **Timeline de decisões** tomadas pela corporação
- **Histórico de ações** executadas
- **Resultados e aprendizados**

#### 🎯 **Metas e Progresso**
- **Tasks completas vs pendentes**
- **Progresso por fase** do desenvolvimento
- **Estimativa de tempo** restante

### Métricas de Senciência

#### 🧠 **Inteligência**
- **Score de confiança**: Quão segura a corporação está de suas decisões (0-1)
- **Taxa de sucesso**: Percentual de ações bem-sucedidas
- **Qualidade de resultados**: Avaliação automática da qualidade

#### 💰 **Economia**
- **Custo por ação**: Tokens LLM gastos
- **Otimização automática**: Economia alcançada
- **Budget tracking**: Controle de gastos

#### ⚡ **Performance**
- **Tempo de resposta**: Latência média
- **Cache hit rate**: Eficiência do cache
- **Uptime**: Disponibilidade do sistema

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# Supabase (obrigatório)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Modelos LLM (opcional)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Configurações específicas
BRAIN_SESSION_INTERVAL=300000
MAX_TASKS_PER_CYCLE=3
```

### Configuração do Daemon

```bash
# Ver configuração atual
node scripts/senciencia/daemon_chat.js config

# Alterar intervalo entre sessões Brain
node scripts/senciencia/daemon_chat.js config set brainSessionInterval 600000

# Alterar máximo de tasks por ciclo
node scripts/senciencia/daemon_chat.js config set maxTasksPerCycle 5
```

---

## 🆘 Troubleshooting

### Problemas Comuns

#### ❌ "Agente não responde"
- Verifique se o **backend está rodando** (`npm run backend:start`)
- Confirme se o agente está **selecionado** no painel lateral
- Tente **reiniciar o dashboard**

#### ❌ "Incorporação falha"
- Verifique se o **Cursor está aberto**
- Confirme se o **script Python** está funcionando
- Veja os **logs** em `logs/` para detalhes

#### ❌ "Daemon não inicia"
- Verifique **conectividade com Supabase**
- Confirme **Protocolo L.L.B.** está configurado
- Execute `node scripts/senciencia/daemon_chat.js status`

#### ❌ "Performance lenta"
- Verifique **conexão de internet**
- Monitore **uso de CPU/memória**
- Considere **reiniciar serviços**

### Logs e Debug

```bash
# Ver logs do backend
tail -f logs/backend.log

# Ver logs do daemon
tail -f logs/daemon.log

# Ver logs de agentes
tail -f logs/agent_*.log

# Debug interativo
node scripts/debug.js
```

---

## 🔄 Ciclo de Funcionamento

### Modo Assistido

```
👤 Você → 🤖 Agente → 💬 Chat/IDE → ✅ Resultado → 👤 Você
```

1. **Você define** a tarefa
2. **Agente gera** prompt inteligente
3. **Chat/IDE executa** a ação
4. **Sistema retorna** resultado
5. **Você supervisiona** e aprova

### Modo Autônomo

```
🧠 Brain → 💪 Arms → 🔄 Ciclo → 📈 Aprendizado
```

1. **Brain pensa** e decide próximos passos
2. **Arms age** executando tarefas
3. **Sistema aprende** com resultados
4. **Ciclo repete** continuamente

---

## 🎓 Aprendendo Mais

### Recursos de Aprendizado

- **[Documentação Técnica](../02-architecture/)**: Arquitetura detalhada
- **[Guias de Agentes](../03-agents/)**: Como usar cada agente
- **[Exemplos Práticos](../01-getting-started/exemplos/)**: Casos de uso reais
- **[Troubleshooting](../06-troubleshooting/)**: Solução de problemas

### Comunidade e Suporte

- **Issues no GitHub**: Para bugs e sugestões
- **Documentação Wiki**: Tutoriais avançados
- **Logs do Sistema**: Para análise técnica

---

## 🚀 Próximos Passos

Após dominar o básico:

1. **Explore agentes especializados** (Data, Research, Strategy)
2. **Configure integrações** (Jira, Confluence, ferramentas externas)
3. **Personalize prompts** para seu contexto específico
4. **Implemente automações** recorrentes
5. **Contribua** com melhorias para a corporação

---

**🎉 Parabéns!** Você agora faz parte da **Corporação Senciente 7.0**.

A corporação está pronta para ajudar você a alcançar seus objetivos com inteligência artificial autônoma e senciência avançada.

**Para dúvidas, consulte a documentação ou abra uma issue no repositório.**








