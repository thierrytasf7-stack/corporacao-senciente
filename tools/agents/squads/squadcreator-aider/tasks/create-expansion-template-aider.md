# Create Expansion Template (via Aider)

## Purpose
Create output template with embedded elicitation patterns for quality output generation.

## Inputs
- Template name and type (markdown, yaml, json, etc.)
- Main sections and structure
- Placeholder variables
- Elicitation prompts for each section
- Usage examples
- Output format specifications

## Key Activities
1. Elicit template type and output format
2. Elicit main sections (1.0-level headers)
3. For each section:
   - Define purpose and guidance
   - Add placeholder with example values
   - Include elicitation prompt (what question to ask user)
4. Add usage examples with filled template
5. Add customization guidance
6. Use expansion-template-tmpl.yaml as base
7. Validate placeholder consistency
8. Ensure elicitation patterns are clear

## Outputs
- Complete templates/{template-name}.yaml or .md file
- All sections with placeholders {variable-name}
- Elicitation guidance for each placeholder
- Usage examples showing filled template
- Ready for immediate use in squad creation

## Validation Criteria
- [ ] Template file created in templates/ directory
- [ ] Consistent placeholder naming: {section-name}
- [ ] All placeholders have examples
- [ ] Elicitation prompts are clear
- [ ] Valid YAML/JSON/Markdown syntax
- [ ] Usage examples provided
- [ ] At least 3 main sections
- [ ] Customization guidance included

---

_Task Version: 1.0 - Template Creation_
