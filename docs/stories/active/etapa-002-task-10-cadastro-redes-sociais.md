# Story: Cadastro Redes Sociais

**ID:** ETAPA-002-TASK-10  
**Título:** Cadastro Redes Sociais  
**Squad:** Hermes  
**F-score:** F3  
**Dependência:** Task 08

## Acceptance Criteria

- [ ] Handles @SencientCorp reservados em Twitter, LinkedIn e Instagram
- [ ] Avatares/banners configurados com branding Etapa 2 em todas plataformas
- [ ] Bios institucionais preenchidas com informações consistentes
- [ ] 2FA implementado e ativado em todas contas de redes sociais
- [ ] Arquivo `vault/social_accounts.json` criptografado criado e funcional
- [ ] Post manifesto fundacional publicado em todas plataformas
- [ ] Links das redes sociais validados no site e dashboard

## File List

```
├── vault/social_accounts.json
├── docs/branding/etapa-2-assets/
│   ├── avatar-twitter.png
│   ├── banner-linkedin.png
│   └── avatar-instagram.png
├── scripts/social-media/
│   ├── setup-accounts.ts
│   ├── post-manifesto.ts
│   └── validate-links.ts
├── docs/social-media/
│   └── handles-reserved.md
└── config/social-accounts.ts
```

## Subtasks

1. **Reservar handles** - Reservar @SencientCorp em Twitter, LinkedIn e Instagram
2. **Configurar branding** - Aplicar branding Etapa 2 em avatares e banners
3. **Implementar 2FA** - Configurar autenticação de dois fatores em todas contas
4. **Criar vault criptografado** - Gerar e proteger arquivo social_accounts.json

---

*Story ID: ETAPA-002-TASK-10 | F-score: F3 | Dependência: Task 08*