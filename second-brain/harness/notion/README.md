# Notion Semantic Control Plane

Project Second Brain can use Notion as its preferred semantic control plane without making live network search part of a cognition run.

## Authority boundary

- Notion owns semantic/project cognition: doctrine, decisions, requirements, risks, incidents, evidence, and learning.
- Git owns exact executable/source reality and the provenance of imported knowledge.
- The harness owns deterministic routing and lifecycle gates.
- Runtime observation owns claims about what actually happened.

Notion never replaces Git or runtime truth.

## Why a snapshot

Live semantic search is useful for exploration but is not deterministic enough to sit inside a lifecycle gate. The runtime therefore consumes an immutable local snapshot produced by an explicit sync:

```text
Notion Knowledge database
        ↓ authenticated sync
Accepted + Imported corpus only
        ↓ source-path + Git-blob validation
.harness/notion/semantic-snapshot.json
        ↓ snapshot/content hashes
cognition harness
```

The snapshot directory is already ignored by Git. Tokens and snapshot contents are not committed.

`Origin=Imported` is intentional: the snapshot is the Git-backed operating corpus. Native project learning, incident learning, research, and other governed Notion state remain queryable in their proper Notion surfaces instead of being accidentally treated as repository doctrine.

## One-command Windows live verification

From the integration branch, run:

```powershell
.\tools\harness\notion\verify-live.ps1
```

The script:

- requires `KIRCH-NOTION-SEMANTIC-CONTROL-PLANE-V1`;
- blocks a dirty working tree by default;
- securely prompts for the Notion integration token if `PSB_NOTION_API_KEY` is not already set;
- keeps the prompted token only in the current PowerShell process and clears it afterward;
- forces the `NOTION_SNAPSHOT` provider for the verification run;
- performs semantic sync, harness doctor, the full harness tests, semantic-provider adversarial tests, and a representative bootstrap;
- verifies that repository HEAD did not move during verification.

Use `-AllowDirty` only for an intentional diagnostic run. `-KeepToken` leaves a token that the script itself prompted for in the current shell; the safer default is to clear it.

## Manual sync

Create a Notion integration with read access to the Project Second Brain workspace and set the token only in the environment:

```text
PSB_NOTION_API_KEY=<secret>
```

Then run:

```text
node tools/harness/notion/sync.mjs
```

The sync uses the Notion `2026-03-11` API and native page-Markdown retrieval. It fails closed when an Accepted Imported Knowledge record has an invalid `Source SHA`, when its Git source path is missing, when the Notion provenance no longer matches the current working Git blob, or when Notion reports truncated/unknown Markdown content.

## Use

The preferred provider is `NOTION_SNAPSHOT`. After sync:

```text
node tools/harness/cli.js doctor
node tools/harness/cli.js bootstrap --task <task.json>
```

For explicit fallback/recovery only:

```text
PSB_SEMANTIC_PROVIDER=GIT node tools/harness/cli.js doctor
```

The Git fallback preserves the original graph compiler. It should be explicit so an agent cannot silently downgrade from the preferred semantic provider.

## Drift and tamper rules

The harness blocks a Notion snapshot when:

- the snapshot file is missing;
- the snapshot envelope hash is invalid;
- a page content hash is invalid;
- the control-plane or route-pack configuration changed after sync;
- a required routed source is absent;
- a Notion `Source SHA` no longer matches the current Git blob;
- the required semantic pack exceeds the configured context budget.

A blocked snapshot must be re-synced or the semantic/source discrepancy must be resolved. Do not edit the snapshot by hand.
