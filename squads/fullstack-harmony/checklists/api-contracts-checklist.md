# API Contracts Checklist

## Endpoint Coverage
- [ ] Todo endpoint do backend tem pelo menos um consumer no frontend
- [ ] Toda chamada do frontend aponta para endpoint existente no backend
- [ ] Zero endpoints fantasma (chamados mas inexistentes)

## Method Alignment
- [ ] HTTP methods coincidem (frontend envia = backend aceita)
- [ ] OPTIONS preflight tratado para PUT/DELETE/PATCH

## URL Patterns
- [ ] Base URL consistente (/api prefix)
- [ ] Path params formatados corretamente
- [ ] Query params nomeados identicamente

## Payload Alignment
- [ ] Request body do frontend bate com o que backend espera
- [ ] Todos os campos required sao enviados pelo frontend
- [ ] Content-Type header correto (application/json, multipart, etc)

## Response Alignment
- [ ] Campos consumidos pelo frontend existem no response do backend
- [ ] Response format consistente (envelope pattern)
- [ ] Pagination meta fields alinham entre camadas

## Documentation
- [ ] API documentada (OpenAPI/Swagger, ou inline)
- [ ] Mudancas de API documentadas (changelog)
