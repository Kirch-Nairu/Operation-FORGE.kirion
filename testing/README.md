# Testing, Validation, and Evidence

## What is this?

This subsystem selects validation gates by risk, classifies failures, and records evidence without inflating claims.

## When do I load it?

Load [validation-protocol.md](validation-protocol.md) when planning or executing validation. Load [failure-taxonomy.md](failure-taxonomy.md) before changing code in response to a red test. Load evidence/acceptance documents when reporting or accepting.

## What is canonical?

- [validation-protocol.md](validation-protocol.md)
- [validation-matrix.md](validation-matrix.md)
- [failure-taxonomy.md](failure-taxonomy.md)
- [evidence-manifest.md](evidence-manifest.md)
- [acceptance-gates.md](acceptance-gates.md)

Portable evidence levels remain in [doctrine/evidence-model.md](../doctrine/evidence-model.md).

## Dependencies

Validation depends on exact candidate state, environment identity, and the handoff's selected risk class/gates.
