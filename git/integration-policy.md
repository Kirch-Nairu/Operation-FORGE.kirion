# Integration Policy

Integration combines states; acceptance decides whether a resulting candidate satisfies criteria; promotion changes authority. These are separate.

An integration assignment should define:

- source candidates and exact SHAs;
- target integration branch and source SHA;
- expected integration order;
- file/semantic precedence;
- permitted conflict resolution;
- integration validation;
- stop conditions.

Integration fixes must be explainable as integration work rather than disguised feature expansion.

If one candidate invalidates another's source assumptions, stop and return the dependency conflict unless explicit rebasing/rework authority exists.
