# CI/CD Evidence

CI is automated evidence only for the workflow and candidate it actually ran.

Record:

- workflow/job identity;
- candidate SHA;
- trigger;
- checks executed;
- result;
- run URL/identifier when available;
- artifacts;
- known skips or conditional paths.

A green CI workflow does not imply deployment or runtime acceptance unless those stages are explicitly part of the workflow and their targets are identified.

A broken workflow can be Class J rather than a product defect.
