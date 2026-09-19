# Branch Lifecycle

Typical candidate lifecycle:

```text
CREATE FROM EXACT SOURCE
→ ACTIVE
→ CANDIDATE_READY
→ REVIEW / ACCEPTANCE
→ ACCEPTED or REWORK / REJECTED / QUARANTINED
→ INTEGRATED when required
→ PROMOTED when authorized
→ ARCHIVED / DELETED only under policy
```

Remote deletion is not a completion step by default. Keep branches needed for audit, recovery, or unresolved evidence.

Branch status should be represented in the Active Work Ledger when parallel work exists.
