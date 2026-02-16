# Commands Coverage Checklist

## Mandatory Commands
- [ ] *help - visibility: [full, quick, key]
- [ ] *exit - visibility: [full, quick, key]

## Quality
- [ ] Todos commands tem visibility array
- [ ] Descriptions sao claras e acionaveis (nao "does stuff")
- [ ] Descriptions incluem sintaxe (ex: "*audit-full {path}")
- [ ] Naming segue kebab-case
- [ ] Naming segue verbo-substantivo (create-story, validate-squad)

## Coverage
- [ ] Key commands (visibility=key) cobrem funcionalidade principal
- [ ] Quick commands (visibility=quick) sao os mais usados
- [ ] Full commands incluem tudo
- [ ] Sem duplicados (dois commands para mesma funcao)
- [ ] Sem overlap (commands que fazem quase a mesma coisa)

## Scope
- [ ] Numero de commands adequado ao escopo do agente
- [ ] Nem poucos (agente limitado) nem muitos (confuso)
- [ ] Agente simples: 5-8 commands
- [ ] Agente complexo: 8-15 commands
- [ ] Agente mega: 15-20 commands (max recomendado)
