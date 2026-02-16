# API Design Checklist

## HTTP Methods
- [ ] GET para leitura (sem side effects)
- [ ] POST para criacao
- [ ] PUT/PATCH para update
- [ ] DELETE para remocao
- [ ] Sem GET que modifica dados

## Status Codes
- [ ] 200 para success com body
- [ ] 201 para resource criado
- [ ] 204 para success sem body
- [ ] 400 para input invalido
- [ ] 401 para nao autenticado
- [ ] 403 para nao autorizado
- [ ] 404 para resource nao encontrado
- [ ] 409 para conflito/duplicate
- [ ] 422 para validation error
- [ ] 429 para rate limited
- [ ] 500 apenas para server errors reais

## Response Format
- [ ] Envelope pattern consistente ({success, data, error, meta})
- [ ] Error format padronizado ({code, message, details})
- [ ] Pagination meta em list responses ({page, perPage, total})
- [ ] Sem responses inconsistentes entre endpoints

## Input Validation
- [ ] Schema validation em todo input (body, query, params)
- [ ] Sanitizacao de strings (trim, escape)
- [ ] Limites em campos numericos
- [ ] Validacao de formatos (email, UUID, date)

## Pagination
- [ ] Todo list endpoint paginado
- [ ] Limite maximo de items por pagina
- [ ] Cursor-based para datasets grandes
- [ ] Total count disponivel

## Security
- [ ] Rate limiting por endpoint
- [ ] CORS configurado corretamente
- [ ] Idempotency keys em mutations criticas
- [ ] Request size limits configurados

## Versioning
- [ ] Estrategia de versioning definida
- [ ] Deprecation policy clara
- [ ] Sem breaking changes sem aviso
