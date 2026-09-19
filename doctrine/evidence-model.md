# Evidence Model

Forge requires technical claims to be expressed at the strongest evidence level actually available.

## Evidence ladder

- **E0 — Assumed:** expected, not verified.
- **E1 — Source inspected:** relevant source was statically inspected.
- **E2 — Reported execution:** a worker reports execution; evaluator did not directly observe it.
- **E3 — Observed execution:** a trusted observer directly observed execution/result.
- **E4 — Automated validation:** automated test/build/static/CI ran against identifiable state.
- **E5 — Runtime acceptance:** behavior exercised in a real application/browser/device-equivalent runtime.
- **E6 — Deployed observation:** behavior observed in a deployed environment.
- **E7 — Operational evidence:** real operational use supports the claim.

## Evidence type and provenance

Level alone is insufficient. Material evidence should also record the type (`SOURCE`, `UNIT`, `INTEGRATION`, `BUILD`, `RUNTIME`, etc.) and provenance (`REPORTED`, `DIRECTLY_OBSERVED`, `AUTOMATED`, `REPRODUCED`).

`E4 / BUILD` is not interchangeable with `E4 / INTEGRATION`.

The canonical record shape is [testing/evidence-manifest.md](../testing/evidence-manifest.md).

## Evidence does not transfer automatically

A passing unit test does not prove production deployment. A successful build does not prove runtime behavior. A green CI run proves only the workflow it executed. A source review does not prove a command ran.

Bind evidence to an exact candidate SHA where possible.

`NOT RUN`, `NOT VERIFIED`, and `UNKNOWN` are valid engineering results.

## Crossing into another governance system

This ladder is Forge's own. When a claim originates outside Forge — most commonly from Project Second Brain's cognition harness, whose evidence is a capability set (`INTENDED`/`IMPLEMENTED`/`TESTED`/`OBSERVED`/`DURABLE`/`DEPLOYED`/`VERIFIED`) rather than a level — translate it through [EVIDENCE_CROSSWALK.md](../EVIDENCE_CROSSWALK.md) before recording it here. Do not record a foreign vocabulary's term as if it were an `E`-level; translate it, and translate down when the mapping is ambiguous. See also [SYSTEM_BOUNDARY.md](../SYSTEM_BOUNDARY.md) for which system governs which decision.
