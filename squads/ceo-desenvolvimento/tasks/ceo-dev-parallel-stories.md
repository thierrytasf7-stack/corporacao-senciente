# Task: Execute Stories in Parallel

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*parallel`

## Execution
1. Use @dev `*waves` to analyze parallelizability
2. Identify independent story groups (no shared files, no deps)
3. Create worktrees via @devops for each parallel story
4. Execute story-pipeline for each in parallel
5. Merge worktrees after all complete
6. Run integration tests post-merge
7. Resolve conflicts if any
