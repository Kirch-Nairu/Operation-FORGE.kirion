# KIRION Forge Authority

## Human technical authority

Kirch Ivan Balite

## Repository

`Kirch-Nairu/KIRION-FORGE`

## Default / current authority branch

`main`

## Genesis root

`a1f7c0414b06729256cd4a9664bb723aa3eaa1cf`

## Current authority rule

The directly observed `main` HEAD is the current accepted repository authority unless a later explicit Forge handoff establishes a candidate/integration branch for bounded work.

Exact Git state outranks SHA text in documentation.

## Self-reference note

A commit cannot reliably contain its own final SHA in a tracked file because modifying the file changes the commit identity. Forge therefore distinguishes:

- durable historical anchors recorded in files; and
- current exact authority read directly from Git.

Do not create endless follow-up commits solely to make a tracked file claim to contain its own commit SHA.

## Mutation policy

During Genesis:

- use coherent, reviewable commits;
- verify expected parent/source authority before each substantial wave;
- preserve candidate branches as immutable evidence after writer return;
- move `main` only through authorized non-force promotion;
- preserve Genesis history;
- do not claim NEST-3/NEST-4 or stable release maturity without the required evidence.

## Candidate / acceptance / promotion model

Routine substantial Forge development now follows:

```text
MAIN AUTHORITY
→ BOUNDED HANDOFF
→ CANDIDATE BRANCH
→ WRITER REPORT
→ INDEPENDENT MAINTAINER / ACCEPTANCE REVIEW
→ PROMOTION AUTHORIZATION
→ AUTHORITY PRECHECK
→ NON-FORCE PROMOTION
→ REMOTE VERIFICATION
→ DURABLE-MEMORY UPDATE
```

The Code Writer does not promote its own candidate.

Acceptance and promotion may be performed by the same Maintainer instance only as an explicit role transition after independent candidate inspection.

## First demonstrated promotion under this model

Operational-hardening writer candidate:

`2d348335a0620bf6ddfdd567a8be2868f982ab66`

Maintainer acceptance commit:

`6c93fe67764009ed1b397f9b8ee1ccbfe496d9f3`

The promotion precondition required `main` to remain at:

`206f411c87b0a3125336ec601b7f4e115e95fdfc`

before the non-force transition.

The exact current `main` authority after subsequent governance-memory updates must still be read directly from Git/GitHub.

## Force-push rule

Force pushes remain prohibited by default. Exceptional recovery requires explicit human/Maintainer authority plus evidence-preserving recovery rationale.
