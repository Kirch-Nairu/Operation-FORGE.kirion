# Writer Execution Protocol

## Preconditions

A Code Writer should have:

- Forge source;
- target repository;
- active handoff;
- branch and exact starting SHA;
- owned scope;
- accepted decisions;
- stop conditions;
- validation requirements.

## Preflight

Verify remote/local authority before writing. If the expected starting state is wrong, classify authority drift and stop unless the handoff explicitly grants a safe resolution path.

## Execution

1. load only relevant project memory and neighboring contracts;
2. implement within owned scope;
3. preserve out-of-scope behavior;
4. test while building;
5. classify failures before broad fixes;
6. make coherent commits when appropriate;
7. avoid history rewriting by default;
8. verify pushed remote state when remote publication is part of the assignment.

## Completion

Return a structured Writer Report containing exact candidate identity, changes, validation, failures, unverified claims, blockers, and integration requirements.

Then return authority and stop.