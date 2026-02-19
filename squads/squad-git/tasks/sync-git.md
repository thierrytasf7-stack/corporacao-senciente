# Task: Sincronizar Git entre PCs

**Agente:** @sync-master (Orion)  
**Prioridade:** Alta  
**Timeout:** 300s

---

## 🎯 **Objetivo**

Sincronizar código e configurações entre múltiplos PCs usando Git.

---

## 📋 **Pré-requisitos**

- [ ] Git instalado em todos os PCs
- [ ] Remote configurado (GitHub/GitLab)
- [ ] SSH keys configuradas
- [ ] .gitignore configurado

---

## 🔧 **Execução**

### **1. Verificar Status**
```bash
git status
git remote -v
git branch -a
```

### **2. PC Principal**
```bash
# Commit automático
git add .
git commit -m "chore: auto-sync $(date)"
git push origin main

# Notificar secundários
echo "SYNC_PUSHED:$(date +%s)" > .sync-status
```

### **3. PCs Secundários**
```bash
# Pull automático
git fetch origin
git pull origin main

# Verificar status
git status
```

### **4. Resolver Conflitos**
```bash
# Se houver conflitos
git mergetool
# OU
git checkout --ours {file}
git checkout --theirs {file}

# Após resolver
git add .
git commit -m "fix: resolve conflicts"
git push origin main
```

---

## 📊 **Status Report**

```json
{
  "sync_status": "success|failed|conflicts",
  "pc_role": "principal|secundario",
  "last_sync": "2026-02-17T02:30:00Z",
  "commits_synced": 5,
  "conflicts_resolved": 0,
  "pcs_connected": ["PC-Principal", "PC-Secundario"]
}
```

---

## ⚠️ **Fallbacks**

- **Git offline:** Aguardar reconexão (max 5min)
- **Conflitos:** Auto-resolver se seguro, senão escalar
- **PC offline:** Retry em 1min (max 3 retries)

---

## ✅ **Completion**

- [ ] Todos PCs sincronizados
- [ ] Sem conflitos pendentes
- [ ] Status report enviado
- [ ] Logs atualizados

---

*— Squad-GIT | Sincronização Automática 🔄*
