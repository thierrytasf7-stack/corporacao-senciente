# Performance Checklist

## Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] TTFB (Time to First Byte) < 800ms
- [ ] FCP (First Contentful Paint) < 1.8s

## Loading
- [ ] Pagina carrega em < 3s (3G simulado)
- [ ] Above-the-fold renderiza em < 1.5s
- [ ] Skeleton/loading states durante carregamento
- [ ] Lazy loading para imagens below-the-fold
- [ ] Code splitting por rota

## Assets
- [ ] Imagens otimizadas (WebP/AVIF quando possivel)
- [ ] Nenhuma imagem > 500KB
- [ ] CSS minificado
- [ ] JavaScript minificado e tree-shaken
- [ ] Fonts preloaded ou com font-display: swap

## Network
- [ ] Total requests < 50 por pagina
- [ ] Total transferred < 2MB por pagina
- [ ] Cache headers corretos (static assets)
- [ ] Sem requests duplicados
- [ ] Sem requests 4xx/5xx

## Rendering
- [ ] Sem layout thrashing (forced reflow)
- [ ] Animacoes usam transform/opacity (GPU)
- [ ] Sem memory leaks visiveis
- [ ] Virtual scrolling para listas longas (> 100 items)
