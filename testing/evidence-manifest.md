# Evidence Manifest

Evidence records bind a claim to what was actually observed.

Minimum record:

```text
claim
evidence_level
evidence_type
provenance
candidate_sha
environment
command_or_scenario
result
artifact_reference
observed_at
limitations
```

Evidence types include:

`SOURCE`, `STATIC_ANALYSIS`, `UNIT`, `INTEGRATION`, `SYSTEM`, `BUILD`, `RUNTIME`, `BROWSER`, `DEVICE`, `DEPLOYMENT`, `OPERATIONAL`.

Provenance includes:

`REPORTED`, `DIRECTLY_OBSERVED`, `AUTOMATED`, `REPRODUCED`.

The E0-E7 ladder expresses strength/proximity. Evidence type expresses *what kind of thing was exercised*. Both are required for material claims.

`E4 / BUILD` and `E4 / INTEGRATION` are different claims even if both are automated.

Use [templates/EVIDENCE_MANIFEST.template.md](../templates/EVIDENCE_MANIFEST.template.md).
