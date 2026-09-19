# /verify-gates

Run verification for the current lane.

1. Show branch and git status.
2. Run git diff --check.
3. Run dotnet build Salryn.sln.
4. Run full CoreSmoke if available.
5. Run focused milestone CoreSmoke target if provided.
6. Run web build if frontend changed.
7. Report PASSED / FAILED / NOT RUN / BLOCKED / N/A.
