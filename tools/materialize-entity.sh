#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

FORGE_SHA="44eb57e5b45b343be0033bf22a7a5e74d543c01a"
PSB_SHA="f3d371d989ddb1e3dbbea7c671d3c6a393b712c7"
OVERLAY="$ROOT/overlays/claude-2026-09-19"

git submodule update --init --recursive

actual_forge="$(git -C forge-core rev-parse HEAD)"
actual_psb="$(git -C second-brain rev-parse HEAD)"
[[ "$actual_forge" == "$FORGE_SHA" ]] || { echo "FORGE BASE MISMATCH: $actual_forge"; exit 1; }
[[ "$actual_psb" == "$PSB_SHA" ]] || { echo "SECOND BRAIN BASE MISMATCH: $actual_psb"; exit 1; }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

base64 -d "$OVERLAY/forge.patch.xz.b64" > "$tmp/forge.patch.xz"
cat "$OVERLAY"/psb.patch.xz.b64.part* | base64 -d > "$tmp/psb.patch.xz"

echo "6f76a995fc40bab8106a972d28166694e0c368685bdc8569b31a2d37ffccdb1f  $tmp/forge.patch.xz" | sha256sum -c -
echo "e79d1fbaa199c1235dd140d5a9293d19827bf07339be0a94685cdb24c8a9c6e7  $tmp/psb.patch.xz" | sha256sum -c -

xz -dc "$tmp/forge.patch.xz" > "$tmp/forge.patch"
xz -dc "$tmp/psb.patch.xz" > "$tmp/psb.patch"

git -C forge-core reset --hard "$FORGE_SHA"
git -C second-brain reset --hard "$PSB_SHA"
git -C forge-core clean -fd
git -C second-brain clean -fd

git -C forge-core apply --check "$tmp/forge.patch"
git -C second-brain apply --check "$tmp/psb.patch"
git -C forge-core apply "$tmp/forge.patch"
git -C second-brain apply "$tmp/psb.patch"

python tools/verify-entity.py
