# TEST 2 — Operation FORGE.kirion Self-Evolution Sandbox

This experiment is intentionally isolated from `main`.

- baseline: `main@da4aacd036fc39bf6271874bd4508ed314dc0551`
- experiment branch: `KIRCH-FORGE-ENTITY-EVOLUTION-TEST-2`
- observer journal: existing KIRION Forge Benchmark Observer Notion page, TEST 2 section
- generation: `000`
- promotion authority: **none**

## Loop

`hypothesis -> scenario simulation -> failure classification -> bounded mutation -> regression replay -> keep/revert -> observer note`

Generation 0 first targets the missing meta-governance around self-modification itself. The branch may evolve; `main` may not.

Run:

```bash
python tools/evolution_test2.py
```

The simulator expands ten scenario families into 100 deterministic policy simulations and treats authority/evidence violations as hard failures.
