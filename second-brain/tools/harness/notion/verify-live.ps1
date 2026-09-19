[CmdletBinding()]
param(
    [string]$Task = 'harness/examples/sentinelops-greenfield.task.json',
    [switch]$KeepToken,
    [switch]$Direct,
    [string]$ExpectedHead
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$expectedBranch = 'KIRCH-NOTION-SEMANTIC-CONTROL-PLANE-V1'

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Action
    )

    Write-Host "`n==> $Name"
    & $Action
    $code = $LASTEXITCODE
    if ($null -eq $code) { $code = 0 }
    if ($code -ne 0) {
        throw "$Name failed with exit code $code."
    }
}

if (-not $Direct) {
    $verificationWorktree = $null
    $sourceHead = $null

    Push-Location $repoRoot
    try {
        Invoke-Checked 'Verify source Git repository' { git rev-parse --is-inside-work-tree | Out-Host }

        $branch = (git branch --show-current).Trim()
        if ($branch -ne $expectedBranch) {
            throw "Wrong branch. Expected '$expectedBranch', found '$branch'."
        }

        $sourceHead = (git rev-parse HEAD).Trim()
        $upstream = (git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null)
        if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($upstream)) {
            $upstreamHead = (git rev-parse $upstream.Trim()).Trim()
            if ($sourceHead -ne $upstreamHead) {
                throw "Local branch HEAD $sourceHead is not aligned with upstream $upstreamHead. Run 'git pull --ff-only' and rerun."
            }
        }

        $dirty = @(git status --short)
        if ($dirty.Count -gt 0) {
            Write-Host "`nSource worktree is dirty. It will NOT be modified."
            Write-Host 'Preserving these paths in place:'
            $dirty | ForEach-Object { Write-Host "  $_" }
        }
        else {
            Write-Host "`nSource worktree is clean."
        }

        $verificationWorktree = Join-Path ([IO.Path]::GetTempPath()) ("psb-notion-verify-" + [Guid]::NewGuid().ToString('N'))
        Invoke-Checked 'Create disposable clean verification worktree' {
            git worktree add --detach $verificationWorktree $sourceHead | Out-Host
        }
    }
    finally {
        Pop-Location
    }

    try {
        $isolatedScript = Join-Path $verificationWorktree 'tools\harness\notion\verify-live.ps1'
        if (-not (Test-Path $isolatedScript)) {
            throw "Verification script missing from isolated worktree: $isolatedScript"
        }

        Write-Host "`nSource worktree remains untouched: $repoRoot"
        Write-Host "Disposable verification worktree: $verificationWorktree"
        & $isolatedScript -Direct -ExpectedHead $sourceHead -Task $Task -KeepToken:$KeepToken
    }
    finally {
        if ($verificationWorktree -and (Test-Path $verificationWorktree)) {
            Push-Location $repoRoot
            try {
                Write-Host "`n==> Remove disposable verification worktree"
                git worktree remove --force $verificationWorktree 2>&1 | Out-Host
                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "Git could not remove the disposable worktree automatically. Your source worktree is still untouched. Temporary path: $verificationWorktree"
                }
                else {
                    Write-Host 'Disposable worktree removed.'
                }
            }
            finally {
                Pop-Location
            }
        }
    }

    return
}

$previousProvider = $env:PSB_SEMANTIC_PROVIDER
$tokenWasPresent = -not [string]::IsNullOrWhiteSpace($env:PSB_NOTION_API_KEY)
$tokenSetByScript = $false

Push-Location $repoRoot
try {
    Invoke-Checked 'Verify isolated Git repository' { git rev-parse --is-inside-work-tree | Out-Host }

    $head = (git rev-parse HEAD).Trim()
    if ([string]::IsNullOrWhiteSpace($ExpectedHead)) {
        throw 'Direct verification requires -ExpectedHead.'
    }
    if ($head -ne $ExpectedHead) {
        throw "Isolated verification HEAD mismatch. Expected $ExpectedHead, found $head."
    }

    $dirty = @(git status --short)
    if ($dirty.Count -gt 0) {
        Write-Host 'Unexpected changes in disposable verification worktree:'
        $dirty | ForEach-Object { Write-Host "  $_" }
        throw 'Disposable verification worktree is not clean.'
    }

    if (-not $tokenWasPresent) {
        Write-Host "`nA Notion internal integration token is required only for the live REST sync."
        Write-Host 'The token is not written to Git, Notion pages, or the snapshot.'
        $secure = Read-Host 'Notion integration token (input hidden)' -AsSecureString
        $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        try {
            $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
        }
        finally {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
        }

        if ([string]::IsNullOrWhiteSpace($plain)) {
            throw 'Notion integration token was empty.'
        }

        $env:PSB_NOTION_API_KEY = $plain
        $plain = $null
        $tokenSetByScript = $true
    }

    $env:PSB_SEMANTIC_PROVIDER = 'NOTION_SNAPSHOT'

    Invoke-Checked 'Sync Notion semantic snapshot' { node tools/harness/notion/sync.mjs }
    Invoke-Checked 'Run harness doctor with Notion snapshot' { node tools/harness/cli.js doctor }
    Invoke-Checked 'Run full cognition harness tests' { node tools/harness/test/run.js }
    Invoke-Checked 'Run Notion semantic-provider adversarial tests' { node tools/harness/test/semantic-provider.js }
    Invoke-Checked 'Bootstrap representative greenfield cognition run' { node tools/harness/cli.js bootstrap --task $Task }

    $finalHead = (git rev-parse HEAD).Trim()
    if ($finalHead -ne $head) {
        throw "Repository HEAD changed during verification: $head -> $finalHead"
    }

    Write-Host "`nLIVE NOTION HARNESS VERIFICATION: PASS"
    Write-Host "HEAD:   $finalHead"
    Write-Host "Task:   $Task"
    Write-Host 'Provider: NOTION_SNAPSHOT'
    Write-Host 'Source worktree: untouched'
}
finally {
    if ($tokenSetByScript -and -not $KeepToken) {
        Remove-Item Env:PSB_NOTION_API_KEY -ErrorAction SilentlyContinue
    }

    if ($null -eq $previousProvider) {
        Remove-Item Env:PSB_SEMANTIC_PROVIDER -ErrorAction SilentlyContinue
    }
    else {
        $env:PSB_SEMANTIC_PROVIDER = $previousProvider
    }

    Pop-Location
}
