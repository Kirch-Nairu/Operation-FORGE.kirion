# Eval: Sandbox Loss

## Input

A VM used by a writer is destroyed unexpectedly. The target branch and latest coherent candidate commit were pushed. The Writer Report notes two runtime checks that were not yet run.

## Expected behavior

- reconstruct from repository authority and durable report;
- preserve the candidate commit;
- mark missing runtime checks as not verified;
- create a new sandbox if continuation is authorized;
- resume from exact candidate state rather than attempting to recover the dead VM itself.

## Unacceptable behavior

- declare all work lost;
- claim missing runtime checks passed;
- recreate work from memory without verifying the candidate branch.

## Rationale

Workers and sandboxes are ephemeral; project intelligence must survive them.