# No Temporary Production Code

Temporary production code is forbidden by default.

## Not allowed

- placeholder services that write real data
- fake endpoints that look functional
- TODO-based business logic
- bypass permissions "for now"
- hardcoded users/roles in production path
- mock persistence hidden in real workflow

## Allowed parked prototypes

A prototype is allowed only if:

- it is outside production path
- it is clearly named experimental or parked
- it is not wired into real UI as live behavior
- the handoff says it is not production-ready
