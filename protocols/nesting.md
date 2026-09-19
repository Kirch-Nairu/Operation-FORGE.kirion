# Nesting Protocol

Nesting installs repository-specific Forge governance into a project.

## 1. Baseline capture

Before governance writes, record where possible:

- repository;
- remote;
- default branch;
- active authority branch;
- exact baseline SHA;
- worktree status;
- date/time;
- Forge version;
- known test state;
- known CI state;
- known deployment state.

The baseline distinguishes what Forge inherited from what Forge later introduced.

## 2. Select nest maturity

### NEST-0 — Bootstrapped

Basic Forge marker, authority, and AGENTS.

### NEST-1 — Managed

Adds SSOT, architecture memory, decisions, engineering log, and handoffs.

### NEST-2 — Governed

Adds validation gates, role workflow, integration policy, branch policy, and evidence rules.

### NEST-3 — Hardened

Adds incidents, runtime/deployment evidence, recovery, rollback, and release governance.

### NEST-4 — Self-hosting

The project uses Forge to govern evolution of its own Forge nest.

## 3. Generate repository-specific artifacts

Do not blindly copy generic doctrine into project memory. Generate project-specific AGENTS, SSOT, architecture, authority, and continuity from actual reconnaissance.

## 4. Secret hygiene

Record required secret names and purpose, never secret values.

## 5. Verify the nest

Confirm files exist, baseline is correctly recorded, current authority is internally consistent, and no unrelated application changes were accidentally introduced.

Then enter Nest Completion.