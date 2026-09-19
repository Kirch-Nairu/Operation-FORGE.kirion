---
type: subhub
domain: ai
status: ACTIVE
authority: knowledge
---
# AI Engineering System

AI engineering governs how an AI system's outputs enter a codebase, a decision, or a production system, and what evidence justifies trusting them once they do. Its central problem is that a fluent, confident output and a correct one are not reliably distinguishable by inspection — which is a different failure mode than traditional software, where a bug usually looks like a bug.

The consequence: authority over consequential decisions cannot be delegated to output confidence, because confidence is not correlated with correctness in the way it is for a human expert speaking on the record. Review has to target claims and their evidence, not tone. A design proposal that sounds certain and one that sounds tentative should be reviewed with equal scrutiny if neither cites a verifiable source for its factual claims.

Provenance is the load-bearing concept. When an AI-generated change enters a system, what was it actually shown, what did it actually do, and what proof exists of either? An agent that claims to have run a test suite and one that actually ran it are indistinguishable from the output text alone; the evidence has to be captured separately — a log, a run ID, a hash — and checked, not read off the agent's own narration.

This is why context provenance and agent authority boundaries are treated as first-class concerns rather than implementation detail: the properties that make AI assistance valuable — speed, breadth, fluency — are exactly the properties that make an ungrounded claim hard to catch by eye.

## Local neighborhood
- [[mesh/ai/Tool Authority]]
- [[mesh/ai/Context Boundary]]
- [[mesh/ai/Agent Review Gate]]
- [[mesh/ai/AI Generated Code Review]]
- [[mesh/ai/Tool Output Verification]]
- [[mesh/ai/Repository Grounding]]

## Bridge corridors
- [[mesh/governance/Automation Must Not Outrank Authority]]
- [[mesh/quality/Reviewability]]
- [[mesh/security/Prompt Injection Boundary]]
