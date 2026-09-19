# Validation Protocol

Potential progression, when relevant:

```text
FORMAT / LINT
STATIC ANALYSIS
UNIT
INTEGRATION
SYSTEM
BUILD
RUNTIME
BROWSER
DEVICE
DEPLOYED
OPERATIONAL
```

Not every project or change needs every gate.

## Procedure

1. Identify exact candidate SHA/state.
2. Assign a risk class with Maintainer/handoff authority.
3. Select applicable gates using [validation-matrix.md](validation-matrix.md).
4. Record environment/runtime versions when they affect reproducibility.
5. Execute gates and preserve command/scenario plus result.
6. Classify failures using [failure-taxonomy.md](failure-taxonomy.md).
7. Re-run only the gates invalidated by subsequent changes plus required regression gates.
8. Produce an [evidence manifest](evidence-manifest.md).
9. Mark unexecuted gates `NOT RUN`, never implicitly passed.

The Maintainer may strengthen gates when the change has unusual blast radius.
