# Quarantine Protocol

Quarantine removes a state from active authority while preserving it for evidence and auditability.

## Use quarantine when

- a branch was polluted by an accidental commit;
- candidate provenance is uncertain;
- history contains an invalid mutation that should not be promoted;
- a recovery branch must supersede a compromised candidate;
- evidence would be lost by destructive cleanup.

## Procedure

1. identify quarantined branch/SHA;
2. document why it is not authoritative;
3. identify the last trusted parent/base;
4. establish a clean replacement authority when needed;
5. prohibit accidental promotion of the quarantined state;
6. retain links/evidence for future reconstruction.

Quarantine is not punishment. It is evidence-preserving containment.