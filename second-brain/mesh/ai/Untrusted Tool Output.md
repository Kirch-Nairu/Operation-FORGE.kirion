---
type: threat-model
domain: ai
status: ACTIVE
authority: knowledge
---
# Untrusted Tool Output

Tool output may contain attacker-controlled text, malformed structure, stale state, partial results, or misleading instructions. The model treats output as evidence to interpret rather than executable policy and validates consequential fields independently.

## Local neighborhood
- [[mesh/ai/AI Engineering System]]
- [[mesh/ai/Prompt Injection Boundary]]
- [[mesh/ai/Tool Permission Model]]
- [[mesh/ai/Tool Output Verification]]
- [[mesh/ai/Context Boundary]]

## Bridge corridor
- [[mesh/quality/Boundary Validation]]
- [[mesh/security/Input Validation Boundary]]
