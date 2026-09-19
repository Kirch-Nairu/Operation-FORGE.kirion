# Integration Order

Expected integration order should be decided from dependencies and contract ownership, not branch age.

Prefer:

1. foundational contract/schema/infrastructure changes;
2. dependent implementation candidates;
3. integration-only fixes;
4. combined validation;
5. acceptance of the integrated state;
6. authorized promotion.

When order is not commutative, state the required predecessor SHA/interface explicitly in the ledger or integration handoff.
