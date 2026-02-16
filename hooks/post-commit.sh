#!/usr/bin/env bash
# Hook de exemplo: registra o último commit no Supabase (history)
# Copie para .git/hooks/post-commit e torne executável (chmod +x).

node scripts/_archive/commit_to_supabase.js

# Opcional: se alterar seeds/PRDs, rode também:
# npm run seed





































