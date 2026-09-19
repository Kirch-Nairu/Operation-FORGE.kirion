# Authority Model

Forge distinguishes information from authority. A statement may be useful without being authorized to control project state.

## Project-state precedence

For implementation truth, use this general precedence:

```text
DIRECTLY OBSERVED REPOSITORY / RUNTIME STATE
            ↓
CURRENT PROJECT FORGE AUTHORITY
            ↓
CURRENT PROJECT DURABLE MEMORY
            ↓
CURRENT HANDOFF
            ↓
FORGE DOCTRINE
            ↓
ACCOUNT / USER MEMORY
            ↓
MODEL ASSUMPTIONS
```

Explicit current user instruction may change authority, but the agent must not interpret vague conversational wording as permission for destructive or high-impact actions.

## Exact-state anchoring

Important work should identify:

- repository;
- branch or ref;
- exact starting SHA;
- target branch if different;
- owned surface;
- expected validation.

If expected authority and observed authority differ, classify the mismatch before writing.

## Authority drift

Authority drift occurs when observable state no longer matches the state under which a handoff was issued.

Examples:

- branch HEAD changed;
- another writer modified owned files;
- integration already occurred;
- the target branch was rewritten;
- required architecture was superseded.

A writer normally stops and reports authority drift rather than silently rebasing its understanding.

## Human technical authority

Forge does not remove human authority. It makes delegation explicit. The technical authority may authorize the Maintainer to decompose and govern work, but delegation remains bounded by current instructions and repository policy.

## Promotion authority

Candidate existence never implies promotion authority. Promotion belongs to the role or human explicitly responsible for acceptance and integration.