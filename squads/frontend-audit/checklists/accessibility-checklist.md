# Accessibility Checklist (WCAG 2.1 AA)

## Perceivable
- [ ] Todas as imagens tem alt text descritivo
- [ ] Videos tem captions/legendas
- [ ] Contraste de texto >= 4.5:1 (normal) ou >= 3:1 (large)
- [ ] Informacao nao e transmitida apenas por cor
- [ ] Conteudo pode ser apresentado de diferentes formas sem perda
- [ ] Texto pode ser redimensionado ate 200% sem perda de funcionalidade

## Operable
- [ ] Toda funcionalidade acessivel via teclado
- [ ] Focus indicator visivel em todos os elementos interativos
- [ ] Sem armadilhas de teclado (usuario pode sair de qualquer area)
- [ ] Skip navigation link no topo da pagina
- [ ] Titulos de pagina descritivos e unicos
- [ ] Foco nao se move inesperadamente
- [ ] Touch targets >= 44x44px em mobile
- [ ] Nenhum conteudo pisca mais de 3x por segundo

## Understandable
- [ ] Idioma da pagina declarado (lang attribute)
- [ ] Labels associados a todos os form controls
- [ ] Mensagens de erro identificam o campo e descrevem o problema
- [ ] Navegacao consistente entre paginas
- [ ] Componentes que tem mesma funcionalidade sao identificados consistentemente

## Robust
- [ ] HTML valido e bem-formado
- [ ] ARIA roles usados corretamente
- [ ] Custom components tem roles e states apropriados
- [ ] Compativel com screen readers (VoiceOver, NVDA)
- [ ] Semantic HTML usado (nav, main, header, footer, article, section)
- [ ] Heading hierarchy correta (h1 > h2 > h3, sem pular niveis)
