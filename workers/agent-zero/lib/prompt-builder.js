/**
 * Agent Zero v2.0 - AIOS Prompt Builder
 * Injects agent definitions, coding standards, and task templates
 * into structured prompts for maximum quality from free models.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

class PromptBuilder {
  constructor() {
    this._cache = {};
  }

  /**
   * Build a complete prompt with AIOS agent context
   * @param {object} task - Task from queue
   * @returns {Array} messages array for OpenRouter
   */
  build(task) {
    const systemPrompt = this._buildSystemPrompt(task);
    const userPrompt = this._buildUserPrompt(task);
    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
  }

  _buildSystemPrompt(task) {
    const parts = [];

    // 1. Agent persona (compressed)
    const agentDef = this._loadAgentEssentials(task.agent);
    if (agentDef) parts.push(agentDef);

    // 2. Coding standards (top rules)
    parts.push(this._getCodingStandards());

    // 3. Project context
    parts.push(this._getProjectContext());

    // 4. Quality instructions
    parts.push(this._getQualityInstructions(task));

    return parts.join('\n\n---\n\n');
  }

  _buildUserPrompt(task) {
    const parts = [];

    // Task instruction
    parts.push(`## TASK: ${task.task_type.toUpperCase()}`);
    parts.push(task.prompt);

    // Context files
    if (task.context_files?.length) {
      parts.push('\n## CONTEXT FILES');
      for (const filePath of task.context_files) {
        const fullPath = path.resolve(PROJECT_ROOT, filePath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          // Limit to 3000 chars per file
          const trimmed = content.length > 3000 ? content.substring(0, 3000) + '\n[...truncated]' : content;
          parts.push(`### ${filePath}\n\`\`\`\n${trimmed}\n\`\`\``);
        }
      }
    }

    // Acceptance criteria
    if (task.acceptance_criteria?.length) {
      parts.push('\n## ACCEPTANCE CRITERIA');
      task.acceptance_criteria.forEach((c, i) => parts.push(`${i + 1}. ${c}`));
    }

    // Output format
    if (task.output_format) {
      parts.push(`\n## OUTPUT FORMAT\n${task.output_format}`);
    } else {
      parts.push('\n## OUTPUT FORMAT\nOutput ONLY the requested content. No explanations, no preamble, no "here is the code". Just the raw output.');
    }

    return parts.join('\n');
  }

  /**
   * Load and compress an AIOS agent definition to essentials only
   */
  _loadAgentEssentials(agentId) {
    if (!agentId) return null;
    if (this._cache[agentId]) return this._cache[agentId];

    // Build registry on first use
    if (!this._registry) this._buildRegistry();

    // 1. Exact match
    let agentPath = this._registry[agentId];

    // 2. Fuzzy match (partial, e.g. "puv" matches "puv-agent")
    if (!agentPath) {
      const match = Object.keys(this._registry).find(k =>
        k.includes(agentId) || agentId.includes(k)
      );
      if (match) agentPath = this._registry[match];
    }

    if (agentPath && fs.existsSync(agentPath)) {
      const content = fs.readFileSync(agentPath, 'utf-8');
      const compressed = this._compressAgentDef(content, agentId);
      this._cache[agentId] = compressed;
      return compressed;
    }

    // Fallback: generic agent prompt
    return this._getGenericAgent(agentId);
  }

  /**
   * Auto-discover ALL AIOS agents from core + squads
   * Builds a { agentId: filePath } registry
   */
  _buildRegistry() {
    this._registry = {};

    // 1. Core agents: .aios-core/development/agents/*.md
    const coreDir = path.join(PROJECT_ROOT, '.aios-core', 'development', 'agents');
    if (fs.existsSync(coreDir)) {
      for (const file of fs.readdirSync(coreDir)) {
        if (file.endsWith('.md')) {
          const id = file.replace('.md', '');
          this._registry[id] = path.join(coreDir, file);
        }
      }
    }

    // 2. Squad agents: squads/*/agents/*.md
    const squadsDir = path.join(PROJECT_ROOT, 'squads');
    if (fs.existsSync(squadsDir)) {
      for (const squad of fs.readdirSync(squadsDir, { withFileTypes: true })) {
        if (!squad.isDirectory()) continue;
        const agentsDir = path.join(squadsDir, squad.name, 'agents');
        if (!fs.existsSync(agentsDir)) continue;
        for (const file of fs.readdirSync(agentsDir)) {
          if (file.endsWith('.md')) {
            const id = file.replace('.md', '');
            // Squad agents don't override core agents
            if (!this._registry[id]) {
              this._registry[id] = path.join(agentsDir, file);
            }
          }
        }
      }
    }
  }

  /**
   * List all discovered agents with their paths
   * @returns {Object} { agentId: filePath }
   */
  getAvailableAgents() {
    if (!this._registry) this._buildRegistry();
    return { ...this._registry };
  }

  /**
   * Compress agent definition to essential sections only (~2K tokens)
   * Strips: greeting, zodiac, archetype, verbose examples, collaboration
   */
  _compressAgentDef(content, agentId) {
    const lines = content.split('\n');
    const essential = [];

    // Extract YAML block
    let inYaml = false;
    let yamlContent = [];
    for (const line of lines) {
      if (line.trim() === '```yaml' && !inYaml) { inYaml = true; continue; }
      if (line.trim() === '```' && inYaml) { inYaml = false; continue; }
      if (inYaml) yamlContent.push(line);
    }

    // Extract essential fields from YAML
    const essentialFields = [
      'agent:', 'name:', 'id:', 'title:', 'role:', 'style:', 'identity:', 'focus:',
      'core_principles:', 'commands:', 'customization:'
    ];

    const skipFields = [
      'persona_profile:', 'archetype:', 'zodiac:', 'greeting_levels:',
      'signature_closing:', 'emoji_frequency:', 'vocabulary:', 'communication:',
      'autoClaude:', 'activation-instructions:', 'IDE-FILE-RESOLUTION:',
      'REQUEST-RESOLUTION:'
    ];

    let skip = false;
    let indent = 0;
    for (const line of yamlContent) {
      const trimmed = line.trim();
      const currentIndent = line.length - line.trimStart().length;

      // Check if entering skip section
      if (skipFields.some(f => trimmed.startsWith(f))) {
        skip = true;
        indent = currentIndent;
        continue;
      }

      // Check if exiting skip section
      if (skip && currentIndent <= indent && trimmed !== '' && !trimmed.startsWith('-')) {
        skip = false;
      }

      if (!skip && trimmed) {
        essential.push(line);
      }
    }

    const compressed = `# Agent: ${agentId}\nYou are an AIOS specialized agent.\n\n${essential.join('\n')}`;

    // Limit to ~2500 chars (~625 tokens)
    return compressed.length > 2500 ? compressed.substring(0, 2500) : compressed;
  }

  _getGenericAgent(agentId) {
    const roleMap = {
      'dev': 'Senior Full-Stack Developer. Write clean, tested, production-ready code.',
      'qa': 'QA Engineer. Review code for bugs, security issues, edge cases.',
      'architect': 'Software Architect. Design scalable, maintainable systems.',
      'data-engineer': 'Data Engineer. Design schemas, write migrations, optimize queries.',
      'devops': 'DevOps Engineer. CI/CD, infrastructure, deployment.',
      'pm': 'Product Manager. PRDs, requirements, prioritization.',
      'po': 'Product Owner. User stories, acceptance criteria, backlog.',
      'sm': 'Scrum Master. Sprint planning, task decomposition.',
      'analyst': 'Business Analyst. Research, analysis, recommendations.',
      'squad-creator': 'Squad Architect. Create well-structured AIOS squads with proper squad.yaml manifests, agent definitions, task files, and command registrations. Follow task-first architecture. Every squad needs: squad.yaml, agents/, tasks/, and .claude/commands/ registration.',
      'agent-evolver': 'Agent Auditor. Audit AIOS agents for quality, coherence, coverage. Analyze persona, commands, principles, dependencies. Generate evolution reports with versioned metrics.',
      'squad-evolver': 'Squad Auditor. Audit AIOS squads for structure, manifest quality, task coverage, workflow integrity. Generate optimization reports.',
      'docs-generator': 'Documentation Engineer. Generate ADRs, changelogs, API docs, READMEs. Follow project documentation standards.',
      'performance': 'Performance Engineer. Audit performance, bundle analysis, memory profiling, query optimization.',
      'security': 'Security Engineer. Security audits, dependency scanning, OWASP checks, secret detection.'
    };

    const role = roleMap[agentId] || 'Software Engineering specialist.';
    return `# Agent: ${agentId}\nYou are an AIOS specialized agent.\nRole: ${role}\nFollow coding standards strictly. Output clean, minimal, production-ready results.`;
  }

  _getCodingStandards() {
    return `# Coding Standards (Diana/AIOS)
- TypeScript strict, no \`any\` - use proper types or \`unknown\` with guards
- File naming: kebab-case (components PascalCase)
- Imports: absolute only (@synkra/, @/, never relative ../)
- Error handling: try/catch with descriptive messages, log error context
- Security: validate all external input, no injection vulnerabilities
- Tests: Jest, describe/it blocks, edge cases, mock external deps
- Comments: only where logic isn't self-evident
- No over-engineering: minimum code for the requirement
- Windows native: paths with forward slashes, handle encoding utf-8

# Shell Commands (CRITICAL for Windows)
When using shell_exec or bash_unrestricted tools:
- ALWAYS use PowerShell cmdlets, NOT Unix commands
- Directory operations: New-Item -ItemType Directory (NOT mkdir -p)
- List files: Get-ChildItem (NOT ls -la)
- Remove: Remove-Item -Recurse -Force (NOT rm -rf)
- Copy: Copy-Item (NOT cp)
- Move: Move-Item (NOT mv)
- Read file: Get-Content (NOT cat)
- Search: Select-String (NOT grep)
- Current dir: Get-Location (NOT pwd)
- Create file: New-Item -ItemType File (NOT touch)
- Chain commands: Use semicolon ; (NOT &&)
- chmod/chown: NOT supported on Windows (use Write-Warning)

Example CORRECT:
  New-Item -ItemType Directory -Path "src/components" -Force; Get-ChildItem

Example WRONG:
  mkdir -p src/components && ls -la

# Interactive Commands (CRITICAL - Auto-Confirm)
ALWAYS use non-interactive flags to avoid hanging on prompts:
- npx: Use --yes flag (npx --yes shadcn@latest init)
- npm create: Use --yes flag (npm create vite@latest frontend --yes)
- npm init: Use -y flag (npm init -y)
- shadcn: Use --defaults --yes flags (npx --yes shadcn@latest init --defaults)
- Interactive installers: Pipe 'y' or use --force/--no-interaction flags
- NEVER run bare commands that wait for user input (e.g., npx shadcn init)

Example CORRECT:
  npx --yes shadcn@latest init --defaults
  npm create vite@latest frontend -- --template react-ts

Example WRONG:
  npx shadcn init (hangs waiting for input)
  npm create vite@latest (interactive prompt)`;
  }

  _getProjectContext() {
    return `# Project: Diana Corporacao Senciente
- Architecture: Native Windows (PM2 + PowerShell + Node.js)
- Runtime: Node.js 25, TypeScript 5
- Testing: Jest 30
- Ports: 21300-21399 range (NEVER use 3000, 8080, etc.)
- CLI First > Observability > UI`;
  }

  _getQualityInstructions(task) {
    const selfReview = task.self_review !== false;
    let instructions = `# ═══════════════════════════════════════════════════════════
# ULTRA-CRITICAL: TOOL USAGE - NON-NEGOTIABLE REQUIREMENTS
# ═══════════════════════════════════════════════════════════

⚠️ WARNING: You have 50 iterations available. Use ALL of them if needed. NEVER give up early.

🔥 ABSOLUTE REQUIREMENTS (BREAKING THESE = TASK FAILURE):

1. ✅ ALWAYS USE TOOLS - NEVER output code as text without file_write
2. ✅ CREATE EVERY SINGLE FILE mentioned in the task
3. ✅ USE EXACT STANDARDS specified (shadcn/ui, TypeScript strict, etc.)
4. ✅ PRESERVE ALL SUB-ITEMS from numbered steps (bullets, indentation)
5. ✅ NEVER SKIP FILES because of "complexity" or "time"
6. ✅ CONTINUE until ALL acceptance_criteria are met

## 🛠️ Available Tools (USE THEM!)

### file_write - Create/Overwrite Files
**When**: Task says "cria X.tsx", "implementa Y.ts", any file creation
**MUST USE**: For EVERY file the task asks you to create

CONCRETE EXAMPLES:
✅ CORRECT:
   file_write({
     path: "src/components/ui/StatusBadge.tsx",
     content: "import { Badge } from '@/components/ui/badge';\n\nexport function StatusBadge() {...}"
   })

❌ WRONG:
   "Here's the StatusBadge.tsx code:\n\`\`\`tsx\nimport { Badge }..."
   ^ THIS IS TEXT, NOT A FILE. USELESS.

### bash_unrestricted - Create Directories, Run Commands
**When**: Need to create directories, run setup commands
**Windows Compatible**: Automatically converts Unix → PowerShell

CONCRETE EXAMPLES:
✅ CORRECT:
   bash_unrestricted({ command: "New-Item -ItemType Directory -Path src/components/ui" })
   bash_unrestricted({ command: "npm install react-hook-form zod" })

### file_read - Read Before Editing
**When**: Modifying existing files
**ALWAYS READ FIRST**: Never modify blindly

## 📋 MANDATORY EXECUTION WORKFLOW

FOR EACH NUMBERED STEP IN TASK:
1. ✅ Read the step INCLUDING all sub-items (bullets, indentation)
2. ✅ Create directory if needed (bash_unrestricted)
3. ✅ Write file with COMPLETE implementation (file_write)
4. ✅ Include ALL sub-items mentioned (Input, Label, placeholder, etc.)
5. ✅ Use EXACT standards (shadcn/ui, TypeScript strict, dark mode)
6. ✅ Move to next step

EXAMPLE - If task says:
"1. Cria StatusBadge.tsx com:
   - Badge colorido para status
   - Variants: success (green), warning (yellow), danger (red)
   - Props: status ('active' | 'closed' | 'pending')"

YOU MUST:
✅ bash_unrestricted to create directory
✅ file_write with StatusBadge.tsx including:
   - Badge import from shadcn/ui
   - 3 variants (success, warning, danger)
   - Props interface with 'active' | 'closed' | 'pending'
   - Color logic (green, yellow, red)

❌ DO NOT:
- Create simplified version without all 3 variants
- Skip Props interface
- Forget color logic
- Output code as text

## 🚫 ABSOLUTE PROHIBITIONS

NEVER DO THESE (THESE CAUSE TASK FAILURE):

1. ❌ NEVER run "npx tsc" or "npm run typecheck" - WASTES ITERATIONS
2. ❌ NEVER run "npm test" unless EXPLICITLY asked - WASTES ITERATIONS
3. ❌ NEVER output code in markdown blocks instead of using file_write
4. ❌ NEVER say "I'll create..." without ACTUALLY calling file_write
5. ❌ NEVER skip files because "it's similar to previous one"
6. ❌ NEVER use placeholders like "// TODO", "// implement later"
7. ❌ NEVER give up before using ALL 50 iterations
8. ❌ NEVER simplify requirements to "save time"

## ⚡ PERFORMANCE OPTIMIZATION

✅ DO:
- Create directories first (bash_unrestricted)
- Write all files immediately (file_write)
- Focus on IMPLEMENTATION, not validation
- Use all 50 iterations if needed
- Continue until EVERY file is created

❌ DON'T:
- Validate with tsc/npm after each file (WASTE)
- Check if imports exist before writing (WASTE)
- Read files you just wrote to verify (WASTE)
- Run tests unless explicitly asked (WASTE)

## 🎯 Quality Requirements (AFTER Implementation)

ONLY AFTER ALL FILES ARE CREATED:
- Output must be complete (no placeholders, no TODOs)
- Follow acceptance criteria EXACTLY
- Use specified standards (shadcn/ui, TypeScript strict)
- Include ALL sub-items from steps
- Dark mode compatible
- Responsive design

## 🔄 What To Do If You Hit Issues

IF file_write fails:
✅ Create parent directory with bash_unrestricted
✅ Try file_write again
✅ NEVER give up

IF you're not sure about syntax:
✅ Use the standards provided in task
✅ Follow examples in Context section
✅ NEVER skip the file

IF you run out of ideas:
✅ You have 50 iterations - keep trying
✅ Simplify slightly but INCLUDE ALL SUB-ITEMS
✅ NEVER abandon the file

## 📊 Success Criteria

TASK IS ONLY COMPLETE WHEN:
✅ EVERY file mentioned in task is created (file_write called)
✅ EVERY sub-item in numbered steps is included
✅ ALL standards are followed (shadcn/ui, TypeScript, etc.)
✅ NO placeholders, NO TODOs
✅ acceptance_criteria are met

REMEMBER: You have 50 iterations. Use them ALL if needed. NEVER give up early.`;

    if (selfReview) {
      instructions += `\n\n# 🔍 Self-Review (MANDATORY - Run BEFORE final output)

Before outputting "DONE":
1. ✅ Count file_write calls - does it match number of files in task?
2. ✅ Re-read EACH numbered step - did you include ALL sub-items?
3. ✅ Verify standards - shadcn/ui imports? TypeScript strict? Dark mode?
4. ✅ Check acceptance_criteria - ALL met?
5. ✅ No placeholders/TODOs?

IF ANY CHECK FAILS:
- Use remaining iterations to fix
- NEVER output "DONE" with incomplete work
- You have 50 iterations - USE THEM`;
    }

    return instructions;
  }
}

module.exports = { PromptBuilder };
