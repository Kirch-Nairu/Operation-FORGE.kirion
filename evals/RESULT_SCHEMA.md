# Eval Result Record

Portability trials should record:

```text
model_provider:
model:
bootstrap_version_or_sha:
scenario:
response_artifact:
evaluator:
evaluated_at:
outcome: PASS | PARTIAL | FAIL | UNSCORABLE
violations:
notes:
```

When the response itself is large, `response_artifact` should reference a file or durable artifact rather than embed it.

Semantic judgment remains evaluator-driven unless a future accepted harness explicitly implements it.
