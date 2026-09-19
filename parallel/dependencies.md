# Dependencies

Represent dependencies explicitly:

- writer/candidate depended upon;
- required candidate SHA or interface/contract;
- hard vs soft dependency;
- integration order;
- what invalidates the dependency.

If Writer B requires Writer A's accepted output, B should not quietly begin from a different base and assume semantic compatibility.

When a dependency moves, update the ledger and determine whether re-authorization or integration work is required.
