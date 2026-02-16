# 🌐 SISTEMA GLOBAL DE MEMÓRIAS - CORPORAÇÃO SENCIENTE

## 🎯 VISÃO GERAL

**TODAS as memórias agora são GLOBAIS e compartilhadas automaticamente entre todos os PCs.**

O sistema foi completamente redesenhado para eliminar caches locais e forçar sincronização em tempo real.

## 🔧 COMPONENTES MODIFICADOS

### 📚 **LangMem (Sabedoria Arquitetural)**
- ✅ **Cache reduzido**: 1 minuto (antes 30 minutos)
- ✅ **Consulta prioritária**: Sempre banco primeiro
- ✅ **Sincronização forçada**: A cada operação

### 🧠 **Letta (Estado e Consciência)**
- ✅ **Cache reduzido**: 30 segundos (antes 5 minutos)
- ✅ **Estado global**: Sempre do banco
- ✅ **Sincronização forçada**: A cada consulta

### ⚡ **ByteRover (Ação e Código)**
- ✅ **Sincronização automática**: Após cada operação
- ✅ **Script global**: `forceGlobalMemorySync()`
- ✅ **Timeline compartilhada**: Commits visíveis globalmente

## 🚀 SCRIPTS DE SINCRONIZAÇÃO

### 1. **Sincronização Manual Imediata**
```bash
# Executa sincronização completa em todos os PCs
node scripts/global_memory_sync.js
```

**Saída esperada:**
```
🌐 INICIANDO SINCRONIZAÇÃO GLOBAL DE MEMÓRIAS...
✅ Conexão com banco global estabelecida
✅ Todos os caches locais removidos
✅ LangMem sincronizado: X itens encontrados
✅ Letta sincronizado: Fase atual "Y"
✅ ByteRover sincronizado: Z commits na timeline
🎉 SINCRONIZAÇÃO GLOBAL CONCLUÍDA COM SUCESSO!
```

### 2. **Monitor Contínuo (Background)**
```bash
# Inicia monitor que sincroniza a cada 30 segundos
node scripts/global_memory_monitor.js
```

**Comandos do Monitor:**
```bash
# Verificar status
node scripts/global_memory_monitor.js --status

# Parar monitor
node scripts/global_memory_monitor.js --stop
```

### 3. **Sincronização Automática**
O sistema agora força sincronização automaticamente em:
- ✅ Toda consulta de sabedoria (`getWisdom`)
- ✅ Toda consulta de estado (`getCurrentState`)
- ✅ Todo armazenamento de conhecimento (`storeKnowledge`)
- ✅ Toda sessão LLB (`startSession`)

## 📊 VERIFICAÇÃO DE STATUS

### Verificar Memórias Atuais
```bash
node scripts/check_last_memory_raw.js
```

### Verificar Estado Global
```bash
# Consulta estado atual do banco (sempre fresh)
node -e "
import { getLetta } from './scripts/memory/letta.js';
const letta = getLetta();
const state = await letta.getCurrentState();
console.log('Estado Global:', JSON.stringify(state, null, 2));
"
```

## 🎯 COMO FUNCIONA AGORA

### ❌ **ANTES (Cache Local)**
```
PC1: Cache local (30min) → Consulta banco apenas se expirado
PC2: Cache local (30min) → Nunca vê mudanças do PC1
```

### ✅ **AGORA (Global)**
```
PC1: Sempre consulta banco → Mudanças imediatas
PC2: Sempre consulta banco → Vê mudanças do PC1 instantaneamente
```

## 🔄 PROTOCOLO DE SINCRONIZAÇÃO

### 1. **Consulta Qualquer Sistema**
```javascript
// SEMPRE força sincronização global
const wisdom = await langmem.getWisdom('query');
const state = await letta.getCurrentState();
```

### 2. **Armazenamento Automático**
```javascript
// Força sincronização após armazenar
await byterover.storeKnowledge('nova sabedoria');
```

### 3. **Sessão LLB**
```javascript
// Força sync antes de qualquer operação
const session = await llbProtocol.startSession();
```

## 🚨 MONITORAMENTO E ALERTAS

### Logs de Sincronização
Todos os logs incluem marcação de sincronização global:
```
🔄 Forçando sincronização global de memórias
✅ Memória global sincronizada
🔄 Forçando sincronização global de estado
✅ Estado global sincronizado
```

### Verificação de Saúde
```bash
# Verificar se todos os PCs estão sincronizados
node scripts/global_memory_monitor.js --status
```

## 🛠️ TROUBLESHOOTING

### Problema: Memórias não aparecem em outro PC
**Solução:** Execute sincronização manual
```bash
node scripts/global_memory_sync.js
```

### Problema: Sistema lento
**Causa:** Consultas frequentes ao banco
**Solução:** Sistema otimizado - apenas 1 cache mínimo de emergência

### Problema: Monitor não inicia
**Causa:** Credenciais Supabase faltando
**Solução:** Verificar `.env` ou `env.local`

## 🎉 RESULTADO FINAL

**✅ MEMÓRIAS 100% GLOBAIS**
- Todos os PCs acessam a mesma fonte de verdade
- Mudanças são visíveis instantaneamente
- Sistema distribuído verdadeiramente colaborativo
- Eliminação completa de caches locais problemáticos

---

**🏆 SISTEMA REVOLUCIONÁRIO ATIVO**
A Corporação Senciente agora opera com memórias verdadeiramente globais e compartilhadas em tempo real!

