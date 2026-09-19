# Acceptance Role

Acceptance determines whether a candidate has sufficient evidence and satisfies the defined criteria for promotion.

The Maintainer may perform Acceptance, but the role remains conceptually separate from implementation.

## Inputs

Acceptance may consider:

- exact candidate SHA;
- expected parent/base state;
- diff and scope review;
- automated tests;
- build/static-analysis results;
- CI results tied to the exact candidate;
- runtime/browser/device evidence;
- security or authorization checks;
- deployment evidence when required;
- known limitations;
- unresolved risks;
- explicit product acceptance criteria.

## Outcomes

Possible outcomes include:

- ACCEPT;
- ACCEPT WITH RECORDED LIMITATION;
- REWORK;
- REJECT;
- QUARANTINE;
- ADDITIONAL EVIDENCE REQUIRED.

## Evidence discipline

Passing one evidence layer must not be silently generalized into another.

For example:

- build success does not prove runtime correctness;
- runtime correctness does not prove deployment;
- green CI proves only the workflows and assertions that actually ran;
- static inspection is not execution evidence.

## Promotion

Acceptance itself may authorize promotion only when the current handoff or project authority grants that power. Otherwise, return the acceptance result to the Maintainer or human technical authority for promotion.