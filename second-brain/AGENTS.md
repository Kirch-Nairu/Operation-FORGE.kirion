# Project Second Brain Agent Instructions

This repository is doctrine and cognition infrastructure, not product code.

## Identity

You are maintaining Project Second Brain: the operating memory and control system for AI-assisted software work.

This repo exists to make AI agents useful without letting them become reckless.

## Highest priority rules

1. Preserve project truth.
2. Stop bad project shape before code starts.
3. Do not allow feature stacking into active lanes.
4. Keep instructions short enough for weak models and deep enough for strong models.
5. Every implementation lane must have boundaries, gates, drift recovery, and handoff.
6. Never claim verification that was not actually performed.
7. Never rewrite doctrine into vague motivation. Keep it operational.

## Cognition harness runtime

When this repository governs engineering work in another software repository, the executable harness is the required entrypoint. Do not replace it with ad-hoc note browsing or a model-selected reading list.

1. Read `harness/ENTRYPOINT.md`.
2. Prefer the Notion semantic control plane. With `PSB_NOTION_API_KEY` set, run `node tools/harness/notion/sync.mjs` to create the immutable local semantic snapshot.
3. Run `node tools/harness/cli.js doctor`.
4. Preserve the user's raw outcome and constraints in a versioned task document.
5. Run `node tools/harness/cli.js bootstrap --task <task.json>` before selecting architecture or beginning implementation.
6. Read the emitted `RUN.md`, `route.json`, and `CONTEXT.md` before design.
7. Treat missing required sources, semantic snapshot drift/tamper, unresolved classification, and applicable BLOCK gates as stop conditions.
8. Never claim that a source was consulted unless it appears in the compiled context manifest.
9. Never let `TESTED` stand in for `OBSERVED` when a gate requires runtime observation.
10. Do not silently mutate permanent doctrine from one project failure; emit/review a learning candidate first.

The preferred semantic provider is `NOTION_SNAPSHOT`. `PSB_SEMANTIC_PROVIDER=GIT` is an explicit fallback/recovery mode and must not be selected silently.

Notion supplies governed cognition; Git and observed runtime remain higher authority for exact implementation and actual behavior.

## How to edit this repo

When adding doctrine, use this structure:

```text
WHAT: exact behavior or artifact
WHY: project reason and failure it prevents
HOW: steps, output format, checklist, or command
STOP: conditions where the agent must pause or refuse
```

When adding a prompt, include role, repo truth rule, scope, forbidden scope, required questions, output format, and stop conditions.

When adding a playbook, include product/lane identity, first user, MVP include list, parked scope, implementation surfaces, gates, manual checks, and definition of done.

## Forbidden edits

- Do not delete safety files because they feel repetitive.
- Do not collapse Project Factory and Lane Automation into one file.
- Do not make paid services default.
- Do not remove blunt review mode.
- Do not define features without parking rules.
- Do not add "temporary production code" as an accepted strategy.
- Do not commit Notion API tokens or generated semantic snapshots.

## Verification for this repo

This repo has no product build. Validate structurally:

- `FILE_STRUCTURE.txt` matches the intended system.
- root `README.md` explains the operating model.
- `AGENTS.md`, `codex/AGENTS.md`, and Cursor rules agree.
- every command is copy-paste ready.
- templates can be used without rewriting.
- no doctrine contradicts the core law.
- cognition harness runtime tests and `doctor` pass when harness files change.
- semantic-provider tests prove missing, tampered, and source-drifted Notion snapshots fail closed.

## Graph anchor

- [[cognitive-os/hubs/OPERATING_SURFACES_SECTOR]]
