# Role Transitions

One human or agent instance may perform different Forge roles at different times, but authority must transition explicitly.

Examples:

- Maintainer → Code Writer requires a writer handoff or explicit bounded assignment.
- Code Writer → Maintainer does not happen automatically at completion; authority is returned.
- Reviewer → Acceptance may be combined only if project policy allows, but implementation evidence remains distinct.
- Acceptance → Promotion requires promotion authority; acceptance alone does not grant Git mutation rights.

Record a role transition when the permitted actions materially change.
