# Task: Delegate to Specific Agent

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*delegate @agent task`

## Agent → Skill Mapping
| Agent | Skill | When |
|-------|-------|------|
| @dev | `Desenvolvimento:Dev-AIOS` | Implementation |
| @qa | `Desenvolvimento:QA-AIOS` | Review, testing |
| @data-engineer | `Desenvolvimento:DataEngineer-AIOS` | Database |
| @devops | `Operacoes:DevOps-AIOS` | Push, release |
| @dev-aider | `Aider:Dev-Aider` | Simple implementation |
| @qa-aider | `Aider:QA-Aider` | Basic validation |
| @deploy-aider | `Aider:Deploy-Aider` | Simple git ops |

## Protocol
1. Parse target agent and task from command
2. Activate via corresponding Skill
3. Brief with context (current sprint, story, constraints)
4. Collect output and validate
5. Report result
