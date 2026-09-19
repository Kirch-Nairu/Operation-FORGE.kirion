# Project Second Brain — Cognition Harness MCP

Tool-only MCP adapter for the machine-enforced cognition harness runtime.

This is deliberately **not** an Obsidian automation dependency. Obsidian remains the human editing/visualization surface; the Markdown/Git repository is cognition truth; this server exposes deterministic routing, context compilation, lifecycle gates, target-reality checkpoints, and failure-learning candidates to an MCP-capable agent.

## Security model

The MCP process owns lifecycle state. Agents receive `session_id`, not authority to rewrite the persisted lifecycle envelope.

Lifecycle files are stored outside the vault by default:

```text
~/.project-second-brain/harness-state
```

Override with `PSB_HARNESS_STATE_DIR`.

Set a server-held signing key before starting:

```text
PSB_HARNESS_SESSION_KEY=<high-entropy-secret>
```

Without it the server refuses to start unless `PSB_MCP_INSECURE_DEV=1` is explicitly set for disposable local testing.

If tasks refer to target repositories, configure an allowlist using the platform path delimiter:

```text
PSB_HARNESS_ALLOWED_REPO_ROOTS=<allowed-root-1><delimiter><allowed-root-2>
```

A task cannot probe a repository outside those roots.

HTTP binds to `127.0.0.1` by default. A non-loopback bind additionally requires:

```text
PSB_MCP_BEARER_TOKEN=<secret>
PSB_MCP_ALLOWED_HOSTS=example.internal,another.example
```

For an Internet-facing production deployment, terminate TLS and use a proper OAuth/auth gateway rather than treating the static bearer option as the final identity architecture.

## Install

From this directory:

```text
npm install
```

The package pins the MCP v2 server/node adapters and Zod. MCP v2 implements protocol revision `2026-07-28`.

## Run locally over stdio

```text
PSB_HARNESS_SESSION_KEY=<secret> npm run stdio
```

The protocol owns stdout. Server diagnostics go to stderr only.

## Run local Streamable HTTP

```text
PSB_HARNESS_SESSION_KEY=<secret> npm start
```

Default endpoints:

```text
GET  http://127.0.0.1:4318/health
MCP  http://127.0.0.1:4318/mcp
```

Override the port with `PSB_MCP_PORT` or `PORT`.

## Canonical agent flow

```text
second_brain_doctor
        ↓
second_brain_intake
        ↓
second_brain_bootstrap
        ↓
agent reads compiled routed context
        ↓
second_brain_session_create
        ↓
BOOTSTRAP
        ↓
second_brain_session_advance → PRE_DESIGN
        ↓
second_brain_session_advance → PRE_IMPLEMENTATION
        ↓
implementation changes target repository
        ↓
commit + clean intended target state
        ↓
second_brain_session_refresh_target
        ↓
verification evidence
        ↓
second_brain_session_advance → PRE_DELIVERY
        ↓
POST_DEPLOY / POST_VERIFY when applicable
```

The server rejects:

- ambiguous task classification;
- missing required Second Brain sources;
- inaccessible target Git reality;
- out-of-allowlist repository paths;
- lifecycle stage skipping;
- stale task/runtime/context fingerprints;
- tampered lifecycle envelopes or event chains;
- unacknowledged target-repository drift;
- adoption of a dirty target worktree;
- missing required evidence capabilities;
- primary user journeys without observed runtime PASS;
- deployment claims without exact-state observation.

## Exposed tools

- `second_brain_doctor`
- `second_brain_intake`
- `second_brain_bootstrap`
- `second_brain_evaluate`
- `second_brain_session_create`
- `second_brain_session_status`
- `second_brain_session_advance`
- `second_brain_session_refresh_target`
- `second_brain_learning_candidate`

There is intentionally no MCP `reset_session` tool. Resetting an authoritative lifecycle is an operator action, not an agent convenience.

## ChatGPT integration boundary

ChatGPT connects to remote MCP servers rather than a raw local endpoint. For supported OpenAI products, a private/local deployment can be exposed through Secure MCP Tunnel instead of publishing this server directly to the public Internet.

The server is transport-compatible infrastructure; ChatGPT plan/workspace eligibility is a separate product constraint and should not be confused with harness correctness.

## Current verification status

Source is on the isolated harness runtime branch. Do not call the MCP adapter proven until dependencies install, syntax checks run, the MCP Inspector can list/call the tools, lifecycle adversarial tests execute, and a real target repository is driven through the full state machine.
