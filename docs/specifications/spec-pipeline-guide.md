# Spec Pipeline Guide

## Overview
The Spec Pipeline is an automated system that transforms story acceptance criteria into comprehensive documentation through a structured workflow. It consists of two main phases: PRD generation and Architecture generation.

## Workflow

### Phase 1: PRD Generation
1. **Trigger**: `@devops spec-generate-prd STORY-123`
2. **Input**: Story with acceptance criteria
3. **Process**: Aider generates PRD from story content
4. **Output**: `docs/prd/STORY-123.md`
5. **Validation**: Structure and completeness checks

### Phase 2: Architecture Generation
1. **Trigger**: `@devops spec-generate-architecture docs/prd/STORY-123.md`
2. **Input**: Complete PRD
3. **Process**: Aider generates architecture from PRD
4. **Output**: `docs/architecture/STORY-123.md`
5. **Validation**: Technical completeness and consistency checks

## Integration with Story System

### Story Status Flow
```
Backlog → In Progress → PRD Generated → Architecture Generated → Ready for Review
```

### Automatic Triggers
- When story moves to "In Progress": PRD generation becomes available
- When PRD is complete: Architecture generation becomes available
- When architecture is complete: Story moves to "Ready for Review"

## Configuration Steps

### 1. Enable Spec Pipeline
```yaml
# .aios-core/core-config.yaml
autoClaude:
  specPipeline:
    enabled: true
```

### 2. Verify Aider Setup
```bash
@devops aider-setup-check
```

### 3. Configure Documentation Paths
```yaml
# .aios-core/core-config.yaml
prd:
  prdFile: docs/prd.md
  prdVersion: v4
  prdSharded: true
  prdShardedLocation: docs/prd
  epicFilePattern: "epic-{n}*.md"

architecture:
  architectureFile: docs/architecture.md
  architectureVersion: v4
  architectureSharded: true
  architectureShardedLocation: docs/architecture
```

## Validation Gates

### PRD Generation Gates
- **BLOCK**: Story not found or not in progress
- **BLOCK**: No acceptance criteria in story
- **BLOCK**: Aider execution failed
- **WARN**: PRD generation took > 2 minutes
- **WARN**: PRD size < 100 words

### Architecture Generation Gates
- **BLOCK**: PRD not found or incomplete
- **BLOCK**: Aider execution failed
- **WARN**: Architecture generation took > 3 minutes
- **WARN**: Architecture size < 200 words

## Example Outputs

### PRD Structure
```markdown
# Product Requirements Document - STORY-123

## Overview
- **Story ID:** STORY-123
- **Title:** Implement OAuth Login
- **Status:** In Progress

## Business Requirements
- [ ] Users can authenticate via OAuth providers
- [ ] Support Google, GitHub, and Microsoft providers
- [ ] Fallback to email/password authentication

## Technical Requirements
- [ ] OAuth flow implementation
- [ ] Token management and refresh
- [ ] Session persistence

## Acceptance Criteria
- [ ] User can click "Login with Google"
- [ ] User is redirected to provider for authentication
- [ ] User is redirected back with access token
- [ ] User session is established
```

### Architecture Structure
```markdown
# System Architecture - STORY-123

## Overview
- **PRD Reference:** docs/prd/STORY-123.md
- **Status:** Architecture Complete

## System Components
- **Authentication Service:** OAuth flow implementation
- **Token Service:** JWT token management
- **Session Service:** User session persistence

## Data Flow
1. User initiates OAuth flow
2. Authentication service redirects to provider
3. Provider returns authorization code
4. Token service exchanges code for access token
5. Session service creates user session

## Technical Decisions
- **Technology:** Next.js with Auth.js
- **Database:** PostgreSQL for session storage
- **Cache:** Redis for token caching
```

## Best Practices

### PRD Generation
- Ensure acceptance criteria are specific and measurable
- Include both functional and non-functional requirements
- Add constraints and assumptions
- Consider edge cases and error scenarios

### Architecture Generation
- Map all PRD requirements to architectural components
- Consider scalability and performance requirements
- Document technical decisions and trade-offs
- Include integration points with existing systems

## Troubleshooting

### Common Issues
1. **Aider not responding**: Check Aider configuration and availability
2. **Incomplete PRD**: Verify story has complete acceptance criteria
3. **Architecture gaps**: Ensure PRD covers all technical requirements
4. **Validation failures**: Check documentation structure and content

### Debug Commands
```bash
# Check Aider status
@devops aider-status

# Validate PRD structure
@devops validate-prd docs/prd/STORY-123.md

# Validate architecture structure
@devops validate-architecture docs/architecture/STORY-123.md
```

## Performance Considerations

### Generation Time
- PRD generation: Typically 1-2 minutes
- Architecture generation: Typically 2-3 minutes
- Total pipeline: 3-5 minutes for complete flow

### Resource Usage
- Aider token consumption: ~50-100 tokens per generation
- File I/O: Minimal, only documentation files
- Memory usage: Low, primarily text processing

## Future Enhancements

### Planned Features
- Automated PRD validation against business rules
- Architecture pattern suggestions based on requirements
- Integration with design tools for visual architecture
- Automated test case generation from architecture

### Roadmap
- **Phase 1**: Basic PRD and architecture generation (Complete)
- **Phase 2**: Automated validation and quality gates
- **Phase 3**: Integration with design and testing tools
- **Phase 4**: AI-powered optimization suggestions
