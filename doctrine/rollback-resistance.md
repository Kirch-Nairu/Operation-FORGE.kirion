# Rollback Resistance

Integrity and freshness are separate properties. An old snapshot may be perfectly authentic and still be unsafe. Control-plane state that changes authority, consumption, ownership, or lifecycle position therefore carries a monotonic generation checked against a trusted high-water anchor outside the rollbackable snapshot. HMAC proves who signed the snapshot; the high-water proves it is not older than accepted state.
