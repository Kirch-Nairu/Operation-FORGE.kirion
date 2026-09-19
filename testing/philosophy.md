# Validation Philosophy

Validation should answer specific claims against an identifiable candidate.

A passing build does not prove runtime behavior. A passing unit suite does not prove integration. Browser evidence does not prove device behavior. Deployment evidence does not prove long-term operational correctness.

Forge therefore records both evidence **level** (E0-E7) and evidence **type**.

Select the smallest set of gates that adequately addresses the change risk. More gates are not automatically better; irrelevant checks create cost without information.

Failures are information. Classify before editing production code.
