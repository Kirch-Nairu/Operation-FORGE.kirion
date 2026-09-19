param(
    [string]$ExpectedBranch = "",
    [string]$ExpectedSha = "",
    [string]$Remote = "origin"
)

$ErrorActionPreference = "Stop"

try { $repo = (git rev-parse --show-toplevel).Trim() } catch { Write-Output "repository: UNAVAILABLE"; exit 2 }
$branch = (git symbolic-ref --quiet --short HEAD 2>$null)
if (-not $branch) { $branch = "DETACHED" }
$head = (git rev-parse HEAD).Trim()
$dirtyLines = @(git status --porcelain)
$dirty = if ($dirtyLines.Count -gt 0) { "DIRTY" } else { "CLEAN" }

$defaultRef = (git symbolic-ref --quiet --short "refs/remotes/$Remote/HEAD" 2>$null)
if (-not $defaultRef) { $defaultRef = "UNKNOWN" }
$remoteTarget = (git remote get-url $Remote 2>$null)
if (-not $remoteTarget) { $remoteTarget = "UNKNOWN" }

$aheadBehind = "UNAVAILABLE"
git rev-parse --verify "$Remote/$branch" *> $null
if ($LASTEXITCODE -eq 0) {
    $aheadBehind = (git rev-list --left-right --count "$Remote/$branch...HEAD").Trim()
}

Write-Output "repository: $repo"
Write-Output "current_branch: $branch"
Write-Output "HEAD: $head"
Write-Output "origin/default_branch: $defaultRef"
Write-Output "dirty_state: $dirty"
Write-Output "ahead_behind(remote,local): $aheadBehind"
Write-Output "remote_target: $remoteTarget"

$status = 0
if ($ExpectedBranch -and $branch -ne $ExpectedBranch) {
    Write-Output "MISMATCH: expected branch $ExpectedBranch"
    $status = 1
}
if ($ExpectedSha -and $head -ne $ExpectedSha) {
    Write-Output "MISMATCH: expected SHA $ExpectedSha"
    $status = 1
}
exit $status
