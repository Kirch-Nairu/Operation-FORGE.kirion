# Ownership

Writer ownership is an authority boundary over files, modules, behaviors, or schemas for a specific handoff.

Good ownership is:

- explicit enough to detect collisions;
- narrow enough to keep writers independent;
- broad enough to complete a coherent change;
- tied to a source SHA and target branch.

Shared infrastructure may be owned by a dedicated writer or assigned with explicit coordination rules. "Everyone may edit it if necessary" is not a collision policy.
