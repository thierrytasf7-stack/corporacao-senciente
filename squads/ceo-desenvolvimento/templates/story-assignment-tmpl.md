# Story Assignment: {story_id}

> Assigned by Prometheus (CDO)

## Story
- **Title:** {title}
- **Complexity:** {fibonacci}
- **Has DB Changes:** {yes/no}

## Assignment
- **Dev:** @{dev_agent} ({reason})
- **QA:** @{qa_agent} ({reason})
- **Deploy:** @{deploy_agent}
- **DB:** @{data_engineer} (if applicable)

## Pipeline
1. {DB prep if needed}
2. @{dev_agent} `*develop {story_id}`
3. @{qa_agent} `*code-review {story_id}`
4. @{deploy_agent} `*push`

## Quality Level
- CodeRabbit: {light/full}
- QA depth: {minimal/standard/comprehensive}
