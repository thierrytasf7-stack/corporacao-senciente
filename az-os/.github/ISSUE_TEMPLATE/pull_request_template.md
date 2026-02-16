---
name: Pull Request Template
description: Standard template for pull requests
labels: [pr, needs-review]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for your pull request! Please provide the following information to help us review your changes.
        
        **Please ensure you have read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.**
  - type: textarea
    id: description
    attributes:
      label: Description
      description: Describe your changes in detail.
      placeholder: |
        This PR adds/improves/fixes ...
    validations:
      required: true
  - type: textarea
    id: motivation
    attributes:
      label: Motivation
      description: Why is this change required? What problem does it solve?
      placeholder: |
        This change addresses ... by ...
    validations:
      required: true
  - type: textarea
    id: changes
    attributes:
      label: Changes
      description: Describe the changes you made.
      placeholder: |
        - Added ...
        - Modified ...
        - Removed ...
    validations:
      required: true
  - type: textarea
    id: testing
    attributes:
      label: Testing
      description: Describe how you tested your changes.
      placeholder: |
        - Unit tests added/modified
        - Manual testing performed
        - Integration tests added
    validations:
      required: true
  - type: textarea
    id: breaking-changes
    attributes:
      label: Breaking Changes
      description: Does this PR introduce any breaking changes?
      placeholder: |
        - [ ] No breaking changes
        - [ ] Yes, breaking changes (please describe below)
    validations:
      required: true
  - type: textarea
    id: breaking-changes-details
    attributes:
      label: Breaking Changes Details
      description: If applicable, describe the breaking changes and migration steps.
      placeholder: |
        - Old behavior: ...
        - New behavior: ...
        - Migration steps: ...
    validations:
      required: false
  - type: input
    id: issue-reference
    attributes:
      label: Issue Reference
      description: Reference any related issues (e.g., "Closes #123", "Fixes #456")
      placeholder: Closes #123
    validations:
      required: false
  - type: checkboxes
    id: checklist
    attributes:
      label: PR Checklist
      options:
        - label: I have read the [Contributing Guidelines](CONTRIBUTING.md)
          required: true
        - label: I have added tests for my changes
          required: true
        - label: I have updated the documentation if necessary
          required: true
        - label: I have run the test suite and all tests pass
          required: true
        - label: I have formatted my code with Black and sorted imports with isort
          required: true
        - label: I have checked my code with mypy and flake8
          required: true
        - label: I have squashed my commits into logical units
          required: true
        - label: I have written a clear and descriptive commit message
          required: true
  - type: checkboxes
    id: terms
    attributes:
      label: Code of Conduct
      description: By submitting this pull request, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md)
      options:
        - label: I agree to follow this project's Code of Conduct
          required: true