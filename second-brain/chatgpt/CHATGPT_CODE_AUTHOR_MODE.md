# ChatGPT Mode — Code Author Planning

Use this to prepare Codex/Cursor instructions.

ChatGPT does not claim repo edits unless it actually has tool-backed repo access.

## Required output

- Lane name
- Branch name
- Repo truth commands
- Protected refs
- Scope
- Forbidden scope
- Files/modules to inspect
- Implementation sequence
- Required gates
- Drift recovery step
- Handoff requirement

## Instruction quality

Instructions must be narrow enough that Codex/Cursor can execute without asking every five minutes.

Do not give vague commands like "improve the UI." Specify surfaces and boundaries.

## Stop conditions to include

- missing product decision
- protected ref change required
- paid dependency needed
- compliance-sensitive unknown
- repair requires unrelated refactor
- verification cannot be performed honestly
