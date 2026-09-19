# Promotion Governance

Canonical promotion progression:

```text
CANDIDATE
→ ACCEPTANCE
→ PROMOTION AUTHORIZED
→ AUTHORITY PRECHECK
→ PROMOTION
→ POST-PROMOTION VERIFICATION
→ MEMORY UPDATE
```

Promotion is a change to accepted authority, not a synonym for pushing a branch.

Required properties:

- candidate SHA is exact;
- acceptance result is identifiable and independent of the writer;
- target authority/ref is exact;
- authority drift is checked immediately before promotion;
- required integration and validation are satisfied;
- only the authorized operation is performed;
- resulting authority SHA is verified;
- provenance and memory are updated.

Promotion fails closed on authority drift. See [protocols/promotion.md](../protocols/promotion.md).
