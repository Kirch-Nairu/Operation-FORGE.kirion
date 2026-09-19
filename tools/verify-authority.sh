#!/usr/bin/env sh
set -eu

expected_branch="${1:-}"
expected_sha="${2:-}"
remote="${3:-origin}"

repo="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "repository: UNAVAILABLE"; exit 2; }
branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || echo DETACHED)"
head="$(git rev-parse HEAD)"
dirty="$(git status --porcelain)"
default_ref="$(git symbolic-ref --quiet --short "refs/remotes/$remote/HEAD" 2>/dev/null || true)"
remote_target="$(git remote get-url "$remote" 2>/dev/null || true)"

ahead_behind="UNAVAILABLE"
if git rev-parse --verify "$remote/$branch" >/dev/null 2>&1; then
  ahead_behind="$(git rev-list --left-right --count "$remote/$branch...HEAD")"
fi

printf '%s\n' \
  "repository: $repo" \
  "current_branch: $branch" \
  "HEAD: $head" \
  "origin/default_branch: ${default_ref:-UNKNOWN}" \
  "dirty_state: $( [ -n "$dirty" ] && echo DIRTY || echo CLEAN )" \
  "ahead_behind(remote,local): $ahead_behind" \
  "remote_target: ${remote_target:-UNKNOWN}"

status=0
[ -z "$expected_branch" ] || [ "$branch" = "$expected_branch" ] || { echo "MISMATCH: expected branch $expected_branch"; status=1; }
[ -z "$expected_sha" ] || [ "$head" = "$expected_sha" ] || { echo "MISMATCH: expected SHA $expected_sha"; status=1; }
exit "$status"
