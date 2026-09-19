---
type: concept
domain: supply-chain
status: ACTIVE
authority: knowledge
---
# Dependency Verification

Dependency verification is the act of establishing that the artifact a build actually consumed is the artifact that was intended, produced by the party that was intended. It is distinct from dependency *locking*, which fixes which version is requested, and from dependency *scanning*, which asks whether a known-vulnerable version is present. A project can be fully locked and fully scanned and still consume a substituted artifact.

## The three questions

**Identity — is this the package I asked for?** Namespace confusion, typosquatting, and internal/public registry precedence all resolve a legitimate-looking name to an attacker-controlled artifact. Verification here means pinning the registry and resolution order explicitly, not relying on default search paths.

**Integrity — is this byte-identical to what was published?** Enforced by a lockfile that records a content hash, and by a build that fails closed when the hash does not match. A lockfile recording only versions provides no integrity property.

**Provenance — who produced it, from what source, on what builder?** Signature verification and attestation (SLSA provenance, Sigstore) answer this. Hash-matching proves the artifact did not change in transit; it does not prove the publishing account was not compromised.

## Where it must be enforced

Verification that runs only on a developer machine is advisory. The binding enforcement point is the CI builder, because that is the artifact that reaches production. Concretely:

- Install with the verifying, lockfile-respecting command (`npm ci`, `pip install --require-hashes`, `composer install`, `go mod verify`), never the resolving one.
- Fail the build on hash mismatch. Do not warn.
- Restrict the resolver to declared registries; disable implicit fallback to public sources for private scopes.
- Verify signatures or attestations for artifacts that carry them, and record which ones do not — unsigned dependencies are an accepted risk, and an accepted risk should be written down.

## Transitive reach

Verification that covers only direct dependencies covers a small fraction of the code shipped. The property must hold over the full resolved tree, which is why the lockfile — not the manifest — is the governed artifact. It follows that lockfile changes are security-relevant changes and deserve review attention proportionate to that, not the reflexive approval a large generated diff usually attracts.

## Failure modes

- **Lockfile drift.** The lockfile is committed but the build does not enforce it, so CI silently resolves something else.
- **Verification as a warning.** A non-blocking check trains everyone to ignore it.
- **Cache poisoning.** A verified install followed by a build-cache restore that reintroduces unverified content. Cache keys must incorporate the lockfile hash.
- **Vendoring without provenance.** Committed vendor directories move the problem rather than solving it, unless the vendoring step itself is verified and reproducible.

## Evidence

`TESTED` when a hash-mismatch case demonstrably fails the pipeline. `OBSERVED` when the enforcing command is confirmed in the build log of the artifact that actually shipped. Presence of a lockfile in the repository is `INTENDED` and nothing more.

## Local neighborhood
- [[mesh/supply-chain/Supply Chain Security System]]
- [[mesh/supply-chain/Dependency Locking]]
- [[mesh/supply-chain/Build Provenance]]
- [[mesh/supply-chain/Artifact Signing]]
- [[mesh/supply-chain/Release Attestation]]
- [[mesh/supply-chain/SBOM]]
- [[mesh/supply-chain/Build Reproducibility]]
- [[mesh/supply-chain/Maintainer Risk]]

## Bridge corridor
- [[mesh/standards/SLSA]]
- [[mesh/standards/Dependency Trust Baseline]]
- [[mesh/cicd/Security Gate]]
- [[mesh/vulnerability/Dependency Vulnerability]]
- [[mesh/operations/Dependency Inventory]]
