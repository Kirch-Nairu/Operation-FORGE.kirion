param(
    [ValidateSet('research', 'atlas', 'balanced', 'dense', 'wide')]
    [string]$Profile = 'research'
)

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VaultRoot = Split-Path -Parent $ScriptDir
$ObsidianDir = Join-Path $VaultRoot '.obsidian'
$SnippetDir = Join-Path $ObsidianDir 'snippets'
$GraphTarget = Join-Path $ObsidianDir 'graph.json'
$CssSource = Join-Path $ScriptDir 'second-brain-graph.css'
$CssTarget = Join-Path $SnippetDir 'second-brain-graph.css'

$ProfileFiles = @{
    research = 'graph.research-spread.json'
    atlas    = 'graph.engineering-atlas.json'
    balanced = 'graph.balanced-atlas.json'
    dense    = 'graph.dense-cognition.json'
    wide     = 'graph.wide-systems.json'
}

$GraphSource = Join-Path $ScriptDir $ProfileFiles[$Profile]

if (-not (Test-Path $GraphSource)) {
    throw "Missing native graph profile '$Profile': $GraphSource"
}

New-Item -ItemType Directory -Force -Path $ObsidianDir | Out-Null
New-Item -ItemType Directory -Force -Path $SnippetDir | Out-Null

if (Test-Path $GraphTarget) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backup = Join-Path $ObsidianDir "graph.json.backup-$stamp"
    Copy-Item $GraphTarget $backup -Force
    Write-Host "Backed up existing graph.json to $(Split-Path -Leaf $backup)"
}

Copy-Item $GraphSource $GraphTarget -Force

if (Test-Path $CssSource) {
    Copy-Item $CssSource $CssTarget -Force
}

$config = Get-Content $GraphSource -Raw | ConvertFrom-Json

Write-Host ''
Write-Host "Native Obsidian graph profile applied: $Profile"
Write-Host "Source: $(Split-Path -Leaf $GraphSource)"
Write-Host 'No community plugin files or settings were changed.'
Write-Host ''
Write-Host 'Physics / display:'
Write-Host "  Center force:   $($config.centerStrength)"
Write-Host "  Repel force:    $($config.repelStrength)"
Write-Host "  Link force:     $($config.linkStrength)"
Write-Host "  Link distance:  $($config.linkDistance)"
Write-Host "  Line size:      $($config.lineSizeMultiplier)"
Write-Host "  Node size:      $($config.nodeSizeMultiplier)"
Write-Host "  Initial scale:  $($config.scale)"
Write-Host ''
Write-Host 'Profiles:'
Write-Host '  research = default; community-documented spread recipe with native filters/colors'
Write-Host '  atlas    = earlier stronger territorial separation calibration'
Write-Host '  balanced = earlier midpoint calibration'
Write-Host '  dense    = compact relationship inspection'
Write-Host '  wide     = maximum whitespace / architecture presentation'
Write-Host ''
Write-Host 'Close and reopen the native Graph View so Obsidian reloads graph.json.'
Write-Host 'If needed: Settings -> Appearance -> CSS snippets -> enable second-brain-graph.'
