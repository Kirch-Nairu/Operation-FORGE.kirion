# Reconnaissance Protocol

Reconnaissance is the read-only investigation of an existing project before Forge governance is installed or materially expanded.

## Default rule

Do not mutate repository governance during reconnaissance.

## Depth levels

### R0 — Quick Recon

Stack, structure, docs, branches, test presence.

### R1 — Engineering Recon

Adds architecture, dependencies, testing strategy, CI/CD, code quality, and major risks.

### R2 — Deep Recon

Adds domain workflows, schema/data, authorization, security boundaries, performance, failure modes, deployment assumptions, and integration risks.

### R3 — Runtime Recon

Adds actual builds, tests, runtime, browser/API/device behavior when environment access allows.

## Areas to map

- repository identity and Git state;
- topology and application boundaries;
- runtime and dependencies;
- architecture and domain structure;
- database, schema, migrations, caches, storage;
- authentication and authorization;
- secrets/configuration handling;
- testing and test quality;
- CI/CD and releases;
- observability and recovery;
- documentation accuracy;
- user interface/accessibility when applicable;
- deployment model and external integrations;
- technical debt and known TODOs.

## Evidence classes

Every material finding should be described as one of:

- **OBSERVED** — directly verified;
- **INFERRED** — strongly suggested but not directly proven;
- **UNKNOWN** — requires runtime evidence, additional access, or user clarification.

## Completion

Produce a Reconnaissance Report that explains current architecture, strengths, weaknesses, risks, test/CI maturity, gaps, unknowns, what Forge would preserve, and what Forge governance would introduce.

Then request Nest Authorization.