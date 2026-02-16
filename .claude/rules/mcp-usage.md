# MCP Server Usage Rules - AIOS Architecture

## MCP Governance

**IMPORTANT:** All MCP infrastructure management is handled EXCLUSIVELY by the **DevOps Agent (@devops / Gage)**.

| Operation | Agent | Command |
|-----------|-------|---------|
| Search MCP catalog | DevOps | `*search-mcp` |
| Add MCP server | DevOps | `*add-mcp` |
| List enabled MCPs | DevOps | `*list-mcps` |
| Remove MCP server | DevOps | `*remove-mcp` |

Other agents (Dev, Architect, etc.) are MCP **consumers**, not administrators. If MCP management is needed, delegate to @devops.

---

## Architecture: Native First (No Docker)

Diana operates on **native Windows** architecture. Docker has been fully abandoned. All MCP servers run natively or via direct API calls.

## CRITICAL: Tool Selection Priority

ALWAYS prefer native Claude Code tools over MCP servers:

| Task | USE THIS | NOT THIS |
|------|----------|----------|
| Read files | `Read` tool | Any MCP |
| Write files | `Write` / `Edit` tools | Any MCP |
| Run commands | `Bash` tool | Any MCP |
| Search files | `Glob` tool | Any MCP |
| Search content | `Grep` tool | Any MCP |
| List directories | `Bash(ls)` or `Glob` | Any MCP |

## Available MCP Servers

### playwright (Direct - Native)
Use for browser automation, screenshots, web testing.

**Use when:**
1. User explicitly asks for browser automation
2. User wants to take screenshots of web pages
3. Task requires web scraping or testing

**Never use for:**
- General file operations
- Running commands
- Anything not related to web browsers

### Web Search (Native Claude Code)
Use `WebSearch` tool for current information lookups.

### Web Fetch (Native Claude Code)
Use `WebFetch` tool for fetching and analyzing web content.

---

## Rationale

- **Native tools** execute on the LOCAL Windows system
- Native tools are faster and more reliable for local operations
- No Docker dependency - everything runs natively
- playwright runs directly for better browser integration with host system
