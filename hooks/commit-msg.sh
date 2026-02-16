#!/usr/bin/env bash
# Valida mensagem de commit: requer tag [PRD-XXX] ou [SEC]/[OBS]/[TASK-123].

msg_file="$1"
msg="$(cat "$msg_file")"
pattern='\[(PRD-[A-Za-z0-9]+|SEC|OBS|TASK-[0-9]+|ISSUE-[0-9]+)\]'

if [[ ! $msg =~ $pattern ]]; then
  echo "Commit message must contain a reference tag like [PRD-XYZ] or [SEC]/[OBS]/[TASK-123]."
  exit 1
fi
exit 0





































