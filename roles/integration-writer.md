# Integration Writer Role

Integration is an engineering phase, not clerical Git work.

An Integration Writer combines bounded candidate histories under explicit Maintainer authority and proves that their interaction remains coherent.

## Required input

A valid integration handoff should define:

- integration branch;
- exact starting SHA;
- writer branches or candidate SHAs;
- merge/cherry-pick strategy when relevant;
- exact integration order when order matters;
- ownership precedence;
- expected conflict surfaces;
- allowed integration-fix scope;
- validation requirements;
- stop conditions.

## Responsibilities

The Integration Writer:

- verifies all candidate SHAs before integration;
- preserves history according to the requested strategy;
- resolves only authorized integration conflicts;
- identifies cross-candidate defects;
- performs integration-specific validation;
- separates writer defects from integration defects;
- records integration fixes as distinct commits where practical;
- reports final integration authority and unresolved risks.

## Prohibited behavior

Do not silently redesign accepted writer features during integration.

Do not invent precedence rules when two writers conflict. Escalate ambiguous ownership to the Maintainer.

Do not flatten or rewrite history unless the integration handoff explicitly authorizes that strategy.

## Completion

An integrated branch remains a candidate until acceptance criteria are satisfied. The Integration Writer returns a structured report and does not automatically promote the result to stable or production.