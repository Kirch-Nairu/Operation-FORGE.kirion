# KIRION Forge Memory Seed

This file describes stable high-level context that may be carried into a new agent/account. It is not project authority.

KIRION Forge is a maintainer-governed engineering operating model built around:

- Maintainer / Code Writer separation;
- exact repository/ref/SHA authority;
- bounded handoffs and ownership;
- repository-local durable memory;
- sandbox-first implementation and recoverability;
- independent acceptance and controlled promotion;
- evidence-limited technical claims;
- progressive loading and context renewal;
- Decision Surface Compression without suppressing local writer judgment.

Changing facts such as current SHAs, branch heads, active incidents, test results, deployments, and accepted maturity must be reconstructed from repository/runtime state.

A fresh Forge session should use [BOOTSTRAP.md](BOOTSTRAP.md), establish role/capabilities/authority, then load only current project memory and relevant subsystem doctrine.

Persistent product memory is optional. Repository-local memory is sufficient and remains the source for durable project-specific continuity.
