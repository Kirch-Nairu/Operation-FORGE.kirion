---
type: concept
domain: performance
status: ACTIVE
authority: knowledge
---
# Capacity Budget

A capacity budget is a declared ceiling on the load a component is designed to absorb, paired with the behaviour it is required to exhibit once that ceiling is reached. It is not a forecast and not a hope. It is a commitment that makes overload a designed state rather than an emergent one.

A budget is only meaningful if it names four things.

**The governed resource.** Concurrent requests, open connections, queue depth, memory working set, storage growth per day, tokens per minute against a paid API. "Traffic" is not a resource; it is an aggregate that hides which resource actually runs out first.

**The ceiling and its unit.** A number with a unit and a time window: 400 concurrent requests, 2 GB resident, 50 GB/month of object storage, 120 writes/second sustained. Ceilings without windows are unenforceable because burst and sustained load fail differently.

**The behaviour at the ceiling.** This is the part most often left undefined, and it is the part that determines whether overload degrades or cascades. The options are shed (reject cheaply and early), queue (accept with bounded wait and an explicit drop policy), degrade (serve a reduced response), or scale (add capacity, with its own lead time). Choosing none of these means the runtime chooses for you, usually by exhausting memory.

**The observation that proves the current position.** A budget with no telemetry measuring against it is documentation. The signal must be emitted continuously, not sampled during incidents.

## Relationship to latency

Capacity and latency budgets constrain each other and are frequently confused. A latency budget is a promise about a single request's path. A capacity budget is a promise about how many such paths can be in flight before the latency promise breaks. Under queueing, latency degrades non-linearly as utilisation approaches the capacity ceiling — a system at 85% of its capacity budget may already be violating its latency budget. Set capacity ceilings below the saturation knee, not at it.

## Failure modes

- **Implicit budgets.** The ceiling exists — it is whatever the connection pool, thread count, or container memory limit happens to be — but nobody chose it and nobody knows what happens when it is hit.
- **Budgets without shedding.** Unbounded queues convert an overload into a memory exhaustion and turn a partial failure into a total one.
- **Aggregate budgets on shared resources.** If several tenants or callers draw on one ceiling with no per-caller allocation, one caller consumes the budget and every other caller experiences it as an outage.
- **Budgets that are never re-derived.** Capacity assumptions decay as data volume, feature scope, and dependency latency change. An unrevisited budget is a stale claim.

## Evidence

A capacity budget claim reaches `TESTED` under load testing against the declared ceiling, and `OBSERVED` only when the declared behaviour at the ceiling has been seen in a real environment — typically via a load test against production-equivalent infrastructure or a real saturation event with telemetry to prove which resource bound first. See [[EVIDENCE_CROSSWALK]].

## Local neighborhood
- [[mesh/performance/Performance Engineering System]]
- [[mesh/performance/Latency Budget]]
- [[mesh/performance/Throughput Budget]]
- [[mesh/performance/Resource Saturation]]
- [[mesh/performance/Queue Depth]]
- [[mesh/performance/Backpressure]]
- [[mesh/performance/Measurement Overhead]]

## Bridge corridor
- [[mesh/reliability/Capacity Boundary]]
- [[mesh/reliability/Capacity Model]]
- [[mesh/reliability/Degradation Policy]]
- [[mesh/sre/Capacity Forecast]]
- [[mesh/delivery/Operational Cost Model]]
