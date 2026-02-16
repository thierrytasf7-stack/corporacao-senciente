# Agent Structure Checklist (AIOS 2.1 Standard)

## Required Sections
- [ ] ACTIVATION-NOTICE present
- [ ] YAML block with full agent definition
- [ ] IDE-FILE-RESOLUTION section
- [ ] REQUEST-RESOLUTION section
- [ ] activation-instructions (STEP 1-5)
- [ ] agent section (name, id, title, icon, whenToUse)
- [ ] persona_profile (archetype, zodiac, communication)
- [ ] persona (role, style, identity, focus)
- [ ] core_principles array
- [ ] commands array
- [ ] dependencies section
- [ ] autoClaude section

## Agent Section
- [ ] name: String unico, memoravel
- [ ] id: kebab-case, unico
- [ ] title: Role + especialidade
- [ ] icon: Unicode emoji relevante
- [ ] whenToUse: QUANDO USAR + O QUE FAZ + EXEMPLO + ENTREGA
- [ ] customization: null ou object

## Persona Profile
- [ ] archetype: Alinha com role
- [ ] zodiac: Presente
- [ ] communication.tone: Alinha com archetype
- [ ] communication.emoji_frequency: low/medium/high
- [ ] communication.vocabulary: 5+ termos de dominio
- [ ] communication.greeting_levels: minimal, named, archetypal
- [ ] communication.signature_closing: Presente

## Commands
- [ ] *help presente (visibility: [full, quick, key])
- [ ] *exit presente (visibility: [full, quick, key])
- [ ] Todos com visibility metadata
- [ ] Descriptions claras
- [ ] Naming kebab-case

## Post-YAML Sections
- [ ] Quick Commands section
- [ ] Agent Collaboration section
- [ ] Footer com versao da squad/framework
