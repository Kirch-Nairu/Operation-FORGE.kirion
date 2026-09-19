# Salryn Protected Refs

Protected refs must not be changed without explicit project-lead instruction and verified promotion authority.

Known protected refs:

- KIRCH-SANDBOX
- KIRCH-INSTALLER-M1

Default rule: do not promote, reset, force-push, or repoint protected refs.

## Agent behavior

If asked to move a protected ref:

1. Refuse the movement.
2. Explain protected refs.
3. Continue only with candidate branch work if still in scope.
4. Leave promotion to Kirch/manual verified process.
