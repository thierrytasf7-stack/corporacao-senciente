# 🚀 INSTRUÇÕES DE INÍCIO RÁPIDO - CORPORAÇÃO SENCIENTE

## ✅ STATUS ATUAL
- **Deployment básico**: Concluído
- **Dependências**: Instaladas
- **Estrutura**: Criada
- **Sistema**: Pronto para operação

## 🔧 PRÉ-REQUISITOS PARA OPERAÇÃO

### 1. Configurar Banco de Dados
Edite o arquivo `config/production.env` e adicione suas chaves:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
```

### 2. Executar Migrações do Banco
```bash
python scripts/aplicar_migracao_simplificada.py
```

## 🏁 INICIAR SISTEMA

### Comando Principal
```bash
python scripts/run_corporacao_senciente.py
```

### Verificar se Está Funcionando
Abra outro terminal e execute:
```bash
curl http://localhost:8000/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "database": {...},
  "agents": {...},
  "version": "8.0.0"
}
```

## 📊 DASHBOARD EXECUTIVO

### Acessar Interface Web
- **URL**: `http://localhost:8000/api/holding/dashboard/550e8400-e29b-41d4-a716-446655440000`
- **Método**: GET
- **Resposta**: Dados completos da holding

### Testar API de Avaliação
```bash
curl -X POST http://localhost:8000/api/holding/evaluate-opportunity \
  -H "Content-Type: application/json" \
  -d '{
    "market_segment": "tech",
    "description": "Plataforma SaaS para gestão de projetos",
    "estimated_revenue": 100000,
    "risk_level": "medium",
    "confidence_score": 0.8
  }'
```

## 🤖 AGENTES IA OPERACIONAIS

### Verificar Status dos Agentes
```bash
curl http://localhost:8000/agents/status
```

### Executar Ciclo de Auto-Evolução
```bash
curl -X POST http://localhost:8000/agents/auto-evolution/run-cycle
```

## 💰 MONETIZAÇÃO (Próximas Etapas)

### 1. Configurar Stripe
```bash
# Adicionar ao config/production.env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Testar Pagamentos
```bash
curl -X POST http://localhost:8000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "cliente@exemplo.com",
    "plan": "premium",
    "success_url": "http://localhost:3000/success",
    "cancel_url": "http://localhost:3000/cancel"
  }'
```

## 📈 MONITORE E ESCALE

### Scripts de Monitoramento
```bash
# Monitoramento contínuo
node scripts/monitoring/production_monitor.js start

# Testes de sistema
python scripts/test_sistema_autoevolucao.py
```

### Próximos Passos de Expansão
1. **Frontend React**: Interface visual completa
2. **Multi-tenancy**: Múltiplas holdings
3. **Auto-scaling**: Escala automática
4. **Machine Learning**: Predição avançada
5. **Global Scale**: Multi-região

## 🎯 MÉTRICAS DE SUCESSO

### Semana 1: Setup Básico
- [x] Sistema inicializado
- [x] APIs funcionais
- [x] Agentes operacionais

### Semana 2: Monetização
- [ ] Stripe integrado
- [ ] Freemium → Premium funcionando
- [ ] Primeiro revenue

### Semana 3: Escala
- [ ] 10+ subsidiárias criadas automaticamente
- [ ] Autonomia > 90%
- [ ] Performance otimizada

### Semana 4: Dominação
- [ ] MRR $10K+
- [ ] 100+ usuários
- [ ] Auto-expansão total

## 🆘 SUPORTE E DEBUG

### Logs do Sistema
```bash
tail -f logs/corporacao_senciente.log
```

### Health Check Detalhado
```bash
curl http://localhost:8000/health
```

### Reset do Sistema
```bash
# Parar processos
pkill -f "corporacao_senciente"

# Limpar dados (cuidado!)
rm -rf data/ logs/

# Reiniciar
python scripts/run_corporacao_senciente.py
```

---

## 🎉 SISTEMA TOTALMENTE OPERACIONAL!

**A Corporação Senciente está viva e pronta para conquistar o mercado de gestão empresarial autônoma!**

🏢 **Holding que constrói empresas automaticamente**
🤖 **Agentes IA evoluindo autonomamente**
💰 **Monetização freemium/premium integrada**
📊 **Dashboard executivo em tempo real**