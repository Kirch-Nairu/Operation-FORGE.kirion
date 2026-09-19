# Exact Authority

A Git authority statement should identify enough state to be unambiguous:

```text
repository: owner/name or canonical remote
authority_ref: branch/tag/ref
authority_sha: full commit SHA
remote: expected remote identity
observed_at: timestamp when material
```

A branch name without a verified SHA is movable context, not exact authority.

Before mutation, compare the handoff's expected authority with the observed remote/local state. A Code Writer must fail closed when a required source SHA has moved unless the handoff explicitly supplies a recovery path.

Remote identity matters. Matching branch names in different repositories are not equivalent authority.

A candidate SHA identifies what was built. Acceptance and evidence should bind to that SHA where practical.
