# Secret Handling

Secrets are operational inputs, not durable Forge memory.

Do not place secret values in:

- handoffs;
- evidence manifests;
- sandbox capsules;
- logs committed to Git;
- templates or example data;
- issues, pull requests, or CI output.

Record only what is needed to reason about the secret, such as its identifier, source class, required scope, rotation status, or whether access was available.

If a secret is exposed in a candidate, stop further propagation, preserve enough evidence to identify the exposure without copying the value, and return authority for containment/rotation decisions.

Redaction must not be represented as erasure of Git history. History rewriting remains a separately authorized destructive action.
