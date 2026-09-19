---
type: concept
domain: performance
status: ACTIVE
authority: knowledge
---
# Measurement Overhead

Every measurement consumes some of the resource it measures. Measurement overhead is the cost — in latency, CPU, memory, storage, and money — of the instrumentation itself, and it must be budgeted like any other consumer of capacity.

The failure this concept prevents is specific and common: instrumentation added during a performance investigation becomes the dominant cost, and the team optimises against a distorted picture.

## Where the cost accumulates

**Per-operation cost.** A span, a log line, or a counter increment on a hot path executes as many times as the hot path does. Work that is negligible at 100 requests/second is not negligible at 100,000.

**Serialisation and allocation.** Structured logging that builds an object and serialises it per call often costs more than the work being measured. String interpolation performed before a level check is the classic instance — the cost is paid even when the log is discarded.

**Cardinality.** High-cardinality labels (user ID, request ID, full URL path) multiply time series in the metrics backend. This cost lands downstream, on ingestion and storage, and is usually invisible to the team that added the label until the bill or the query latency arrives.

**Egress and retention.** Telemetry volume is a recurring operational cost, and it is one of the few costs that grows automatically with success.

## Observer effect

Instrumentation can change the behaviour under study, not merely the cost of studying it. A profiler that adds a lock, a tracer that forces synchronous flushes, or debug logging that serialises a previously concurrent path can move the bottleneck. When a performance problem disappears under instrumentation, treat the instrumentation as a suspect rather than the measurement as a success.

## Managing it

- Declare a measurement budget as a fraction of the latency budget — a single-digit percentage is a defensible default — and measure the instrumentation against it.
- Prefer sampling on high-volume paths, and record the sampling rate alongside the data so the numbers remain interpretable.
- Guard expensive log construction behind a level check, or use lazy/deferred formatting.
- Constrain label cardinality at the point of emission, not at query time.
- Measure with instrumentation both on and off at least once, so the overhead is a known quantity rather than an assumption.

## Local neighborhood
- [[mesh/performance/Performance Engineering System]]
- [[mesh/performance/Latency Budget]]
- [[mesh/performance/Capacity Budget]]
- [[mesh/performance/Hot Path]]
- [[mesh/performance/Performance Regression]]

## Bridge corridor
- [[mesh/operations/Telemetry Contract]]
- [[mesh/operations/Logging Strategy]]
- [[mesh/sre/Telemetry Cardinality]]
- [[mesh/sre/Telemetry Sampling]]
- [[mesh/delivery/Operational Cost Model]]
