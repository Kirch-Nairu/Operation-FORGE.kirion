# Sandbox Capsule

A Sandbox Capsule is a recovery artifact, not acceptance and not a promotion record.

Minimum fields:

```text
capsule_version
repository
remote
source_branch
source_sha
target_branch
candidate_head
worktree_status
staged_diff
unstaged_diff
untracked_manifest
environment
runtime_versions
dependency_state
commands_executed
tests_run
builds_run
runtime_checks
known_failures
known_unverified_claims
blocker
candidate_commits
remote_branch_state
artifacts
next_recommended_action
next_permitted_action
created_at
created_by_role
```

## Omission rules

Fields may be `NONE`, `NOT RUN`, `UNKNOWN`, or omitted only when the schema/template marks them optional and their absence cannot mislead a successor.

Do not embed secrets. Large binaries, logs, build outputs, screenshots, or dumps should be referenced by durable artifact path/URL/hash instead of embedded.

## Capsule versus checkpoint

A capsule answers: **what state existed in a disposable environment and how can it be recovered?**

An accepted checkpoint answers: **what state has passed the required authority and evidence gates?**

A capsule may contain broken or uncommitted work. It must never be described as accepted merely because it was preserved.
