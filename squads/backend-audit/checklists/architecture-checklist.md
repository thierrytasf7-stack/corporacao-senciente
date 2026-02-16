# Architecture Checklist

## Layering
- [ ] Separacao clara entre routes/controllers, services, repositories
- [ ] Business logic NUNCA em routes/controllers
- [ ] Data access NUNCA em services (via repository)
- [ ] Sem layer violations (controller acessando DB direto)

## SOLID
- [ ] SRP: Cada modulo tem uma unica responsabilidade
- [ ] OCP: Extensivel sem modificar codigo existente
- [ ] LSP: Subtipos substituiveis por tipos base
- [ ] ISP: Interfaces pequenas e focadas
- [ ] DIP: Dependencias injetadas, nao instanciadas

## Coupling & Cohesion
- [ ] Low coupling entre modulos
- [ ] High cohesion dentro de modulos
- [ ] Zero circular dependencies
- [ ] Interfaces/contracts entre camadas

## Patterns
- [ ] Dependency injection utilizado
- [ ] Repository pattern para data access
- [ ] Service layer para business logic
- [ ] Middleware pattern para cross-cutting concerns
- [ ] Event-driven onde cabivel (notificacoes, side effects)

## Organization
- [ ] Zero god objects (> 500 linhas, > 15 metodos)
- [ ] Nomes de modulos descritivos (nao "Utils", "Helper", "Manager")
- [ ] Feature-based ou domain-based organization
- [ ] Shared code em modulos comuns bem definidos

## Scalability
- [ ] Stateless handlers (sem estado em memoria entre requests)
- [ ] Config externalizada (env vars)
- [ ] Preparado para horizontal scaling
- [ ] Sem tight coupling com infra especifica
