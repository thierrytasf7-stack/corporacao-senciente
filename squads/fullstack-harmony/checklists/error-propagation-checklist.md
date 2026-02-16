# Error Propagation Checklist

## Status Code Handling
- [ ] 400 -> Frontend mostra mensagem de input invalido
- [ ] 401 -> Frontend redireciona para login ou refresh token
- [ ] 403 -> Frontend mostra "sem permissao"
- [ ] 404 -> Frontend mostra "nao encontrado"
- [ ] 409 -> Frontend mostra conflito/duplicata
- [ ] 422 -> Frontend mostra erros por campo
- [ ] 429 -> Frontend mostra rate limit com tempo de espera
- [ ] 500 -> Frontend mostra erro generico amigavel

## Network Errors
- [ ] Connection refused -> Frontend mostra "offline"
- [ ] Timeout -> Frontend mostra timeout com retry
- [ ] DNS failure -> Frontend trata gracefully

## Error Format
- [ ] Backend retorna formato consistente em todos endpoints
- [ ] Frontend parseia o formato corretamente
- [ ] Field-level errors mapeados para campos de formulario
- [ ] Error codes utilizados (nao apenas messages)

## User Experience
- [ ] Toda falha tem feedback visual para o usuario
- [ ] Zero JSON cru exibido ao usuario
- [ ] Zero stack traces em producao
- [ ] Retry option disponivel para erros recuperaveis
