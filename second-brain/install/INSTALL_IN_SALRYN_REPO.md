# Install in Salryn Repo

The Salryn product repo should receive only the active instruction layer.

Recommended structure:

```text
Salryn/
├─ AGENTS.md
├─ .cursor/
│  ├─ rules/
│  └─ commands/
└─ docs/
   ├─ ai-maintainer/
   └─ ai-handoffs/
```

Do not copy the whole second brain into the product repo. Keep the full doctrine here.

## Minimum copy set

- `install/SALRYN_REPO_AGENTS_MINIMAL.md` → `Salryn/AGENTS.md`
- `cursor/rules/*.mdc` → `Salryn/.cursor/rules/`
- `cursor/commands/*.md` → `Salryn/.cursor/commands/`
- `templates/HANDOFF.md` → `Salryn/docs/ai-maintainer/HANDOFF_TEMPLATE.md`
