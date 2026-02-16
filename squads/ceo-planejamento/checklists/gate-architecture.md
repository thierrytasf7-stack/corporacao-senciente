# Quality Gate: Architecture Phase

## Mandatory (all must pass)
- [ ] Tech stack selected with justification
- [ ] System overview documented
- [ ] API contracts defined (endpoints, methods, payloads)
- [ ] Security considerations addressed
- [ ] Complexity assessment complete (fibonacci estimates)

## Performance Checks (3+ must pass)
- [ ] Caching strategy defined
- [ ] Query optimization addressed
- [ ] Lazy loading / code splitting planned
- [ ] CDN strategy (for static assets)
- [ ] Bundle size targets set

## Scalability Checks (3+ must pass)
- [ ] Stateless service design
- [ ] Horizontal scaling path
- [ ] Database scaling strategy
- [ ] Rate limiting planned
- [ ] Connection pooling

## Security Checks (all must pass)
- [ ] Auth strategy (JWT, session, OAuth)
- [ ] Authorization model (RBAC/ABAC)
- [ ] Input validation at boundaries
- [ ] XSS, CSRF, SQL injection prevention
- [ ] Data encryption (at rest + transit)

## Constitution Compliance
- [ ] CLI First principle respected
- [ ] Ports in 21300-21399 range (if new services)
- [ ] Absolute imports (@synkra/ or @/)
- [ ] TypeScript strict mode

## Gate Decision
- **PASS**: All mandatory + security + constitution checks pass
- **ITERATE**: Ask @architect to address gaps
- **ESCALATE**: Architecture trade-off needs user decision
