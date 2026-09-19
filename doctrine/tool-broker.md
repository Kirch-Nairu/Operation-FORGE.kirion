# Tool Broker — Narrow Waist

Forge runtime side effects should pass through one small enforcement boundary rather than asking every tool implementation to remember governance independently.

```text
model/tool selection
      ↓
Tool Broker
      ├─ tool exists?
      ├─ capability granted?
      ├─ path inside owned scope?
      ├─ sensitive action?
      │    ├─ exact proposal matches?
      │    ├─ HMAC approval valid?
      │    └─ approval not previously consumed?
      ↓
handler invocation
```

Tool discovery and visibility are presentation decisions. The broker separately evaluates authority immediately before execution.

## Sensitive-action ordering

For a sensitive effect, the approval token is consumed immediately before invoking the handler. This is intentional. If the handler fails after an ambiguous partial side effect, the runtime must reconcile observable target state rather than replay the same authorization and risk duplicating the effect.

## Scope

The experimental broker is transport-neutral. It does not implement shell, GitHub, deployment, or filesystem tools itself. Those become adapters behind this narrow waist.

Runtime reference: `tools/forge_tool_broker.py`.
