# Sandbox Recovery

Successor procedure:

1. verify project/remote identity;
2. read the capsule and current authority;
3. verify source/candidate refs still exist;
4. detect authority drift before applying preserved diff;
5. recreate the environment as closely as practical using the fingerprint;
6. restore candidate commits first;
7. restore staged/unstaged/untracked state only when it still applies;
8. rerun the last reliable validation needed to establish a working baseline;
9. reclassify known failures if environment or authority changed;
10. continue only within the capsule's `next_permitted_action` and active handoff.

If the current authority no longer matches the capsule assumptions, preserve the capsule and return for reconciliation.
