---
type: hub
layer: agents
authority: navigation
status: active
tags: [second-brain/hub, ai/toolchain]
---
# AI Toolchain

Each tool gets a bounded role. None may invent repository state or verification.

## ChatGPT — project factory, architecture, review, synthesis
- [[chatgpt/PROJECT_INSTRUCTIONS]]
- [[chatgpt/CHATGPT_PROJECT_FACTORY_MODE]]
- [[chatgpt/CHATGPT_BLUNT_REVIEW_MODE]]
- [[chatgpt/CHATGPT_REVIEWER_MODE]]
- [[chatgpt/CHATGPT_CODE_AUTHOR_MODE]]
- [[chatgpt/CHATGPT_HANDOFF_MODE]]

## Codex — repo-backed implementation and repair
- [[codex/AGENTS]]
- [[codex/CODEX_REPO_STUDY_MODE]]
- [[codex/CODEX_IMPLEMENTATION_MODE]]
- [[codex/CODEX_GATE_VERIFICATION_MODE]]
- [[codex/CODEX_LANE_HANDOFF_MODE]]

## Cursor — local navigation and bounded edits
- [[cursor/rules/00-salryn-always]]
- [[cursor/rules/01-project-factory]]
- [[cursor/rules/02-no-feature-stacking]]
- [[cursor/rules/03-cost-free-development]]
- [[cursor/rules/04-salryn-parent-repo]]
- [[cursor/rules/05-no-fake-verification]]
- [[cursor/rules/06-pos-inventory-receipts]]
- [[cursor/commands/project-intake]]
- [[cursor/commands/classify-feature]]
- [[cursor/commands/study-parent-repo]]
- [[cursor/commands/generate-phase-plan]]
- [[cursor/commands/run-lane]]
- [[cursor/commands/verify-gates]]
- [[cursor/commands/recover-drift]]
- [[cursor/commands/write-handoff]]

## Prompt packs
- [[prompt-packs/CHATGPT_PROJECT_INTAKE_PROMPT]]
- [[prompt-packs/BLUNT_REVIEW_PROMPT]]
- [[prompt-packs/CODEX_RUN_LANE_PROMPT]]
- [[prompt-packs/CURSOR_RUN_LANE_PROMPT]]
- [[prompt-packs/HANDOFF_SYNTHESIS_PROMPT]]

## Related
- [[atlas/capabilities/AI_ASSISTED_ENGINEERING]]
- [[atlas/concepts/AI_GOVERNANCE]]
- [[atlas/hubs/EXECUTION_SYSTEM]]
