# Forge Tools

These helpers are deliberately small, read-only, and dependency-light.

## Conformance checker

```bash
python tools/forge_check.py repo
python tools/forge_check.py nest
python tools/forge_check.py schemas
python tools/forge_check.py links
```

`forge_check.py` uses only the Python standard library. It reports human-required Nest predicates instead of inventing PASS.

## Authority helpers

POSIX shell:

```bash
tools/verify-authority.sh [expected_branch] [expected_sha] [remote]
```

PowerShell:

```powershell
./tools/verify-authority.ps1 -ExpectedBranch main -ExpectedSha <sha> -Remote origin
```

Both are read-only and return non-zero on a supplied expectation mismatch.
