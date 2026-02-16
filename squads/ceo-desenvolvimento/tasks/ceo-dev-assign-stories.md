# Task: Assign Stories to Team

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*assign`

## Routing Table
| Complexity | Dev Agent | QA Agent | Deploy Agent |
|-----------|-----------|----------|-------------|
| 1-2 | dev-aider | qa-aider | deploy-aider |
| 3 | dev-aider → Dex | qa-aider | deploy-aider |
| 5 | Dex | Quinn (light) | Gage |
| 8 | Dex (*build-autonomous) | Quinn (full) | Gage |
| 13+ | Dex (worktree) | Quinn (full+NFR+security) | Gage (release) |

## Special Rules
- **DB changes** → @data-engineer BEFORE any dev agent
- **Security-sensitive** → Quinn ALWAYS (never qa-aider)
- **Performance-critical** → Dex ALWAYS (never dev-aider)
- **Infrastructure** → Gage manages directly
