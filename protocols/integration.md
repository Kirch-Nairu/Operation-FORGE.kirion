# Integration Protocol

Integration proves whether independently produced candidates form a coherent system.

## Required handoff fields

- integration branch;
- exact starting SHA;
- candidate branches/SHAs;
- required order;
- strategy;
- ownership precedence;
- expected collisions;
- integration-fix authority;
- validation gates;
- stop conditions.

## Procedure

1. verify integration branch authority;
2. verify each candidate SHA;
3. integrate in specified order;
4. preserve required history;
5. classify conflicts as mechanical, ownership, architecture, or product conflicts;
6. resolve only authorized conflicts;
7. commit integration-specific fixes distinctly where practical;
8. run integration validation;
9. report final candidate SHA and unresolved risks.

## Rule

Individual writer success does not prove combined-system success.

Integration itself is engineering work.