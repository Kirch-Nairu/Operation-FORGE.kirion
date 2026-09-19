# Temporal Trust

Authority, actor identity, approvals, and active-work ownership must not remain valid forever merely because a signature once verified. Forge uses deterministic logical trust epochs for reproducible expiry and rotation tests. A rotated or revoked issuer invalidates older trust epochs; expiring authority and approvals fail closed after their declared logical epoch. These epochs are control-plane state, not model-selected time.
