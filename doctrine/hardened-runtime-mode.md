# Hardened Runtime Mode

The model-facing runtime should instantiate Forge execution surfaces with externally held trust material. In hardened mode the Tool Broker and Active Work Registry require authenticated authority envelopes; sensitive broker effects may require a trusted approval-consumption anchor; worker and verifier identities are authenticated before independence claims are accepted. Legacy unsigned mode remains available only for compatibility/testing and is not equivalent evidence of hardened operation.
