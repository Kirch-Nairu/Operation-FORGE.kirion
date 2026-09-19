$ErrorActionPreference = 'Stop'

$VaultRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ObsidianDir = Join-Path $VaultRoot '.obsidian'
$SnippetDir = Join-Path $ObsidianDir 'snippets'
$PluginDir = Join-Path $ObsidianDir 'plugins'

$GraphTarget = Join-Path $ObsidianDir 'graph.json'
$GraphSource = Join-Path $PSScriptRoot 'graph.json'
$SnippetSource = Join-Path $PSScriptRoot 'second-brain-graph.css'
$SnippetTarget = Join-Path $SnippetDir 'second-brain-graph.css'

$PluginId = 'second-brain-saturn'
$PluginSource = Join-Path $VaultRoot 'obsidian-plugin\second-brain-saturn'
$PluginTarget = Join-Path $PluginDir $PluginId
$CommunityPluginsPath = Join-Path $ObsidianDir 'community-plugins.json'
$VerifyScript = Join-Path $PSScriptRoot 'verify-saturn.ps1'

New-Item -ItemType Directory -Force -Path $ObsidianDir | Out-Null
New-Item -ItemType Directory -Force -Path $SnippetDir | Out-Null
New-Item -ItemType Directory -Force -Path $PluginDir | Out-Null

if (Test-Path $GraphTarget) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    Copy-Item $GraphTarget "$GraphTarget.backup-$stamp" -Force
    Write-Host "Backed up existing graph.json to graph.json.backup-$stamp"
}

Copy-Item $GraphSource $GraphTarget -Force
Copy-Item $SnippetSource $SnippetTarget -Force

if (-not (Test-Path $PluginSource)) {
    throw "Saturn plugin source not found: $PluginSource"
}

New-Item -ItemType Directory -Force -Path $PluginTarget | Out-Null
Copy-Item (Join-Path $PluginSource 'manifest.json') (Join-Path $PluginTarget 'manifest.json') -Force
Copy-Item (Join-Path $PluginSource 'main.js') (Join-Path $PluginTarget 'main.js') -Force
Copy-Item (Join-Path $PluginSource 'styles.css') (Join-Path $PluginTarget 'styles.css') -Force

$canUpdateCommunityPlugins = $true
$enabledPlugins = @()

if (Test-Path $CommunityPluginsPath) {
    try {
        $raw = Get-Content $CommunityPluginsPath -Raw
        if ($raw.Trim().Length -gt 0) {
            $parsed = $raw | ConvertFrom-Json
            $enabledPlugins = @($parsed)
        }
    }
    catch {
        $canUpdateCommunityPlugins = $false
        Write-Warning 'Could not parse .obsidian/community-plugins.json; Saturn plugin was installed but not auto-enabled.'
    }
}

if ($canUpdateCommunityPlugins) {
    if ($enabledPlugins -notcontains $PluginId) {
        $enabledPlugins += $PluginId
    }
    # Windows PowerShell 5.1 writes UTF-8 with BOM. Obsidian accepts JSON with BOM, but
    # write explicitly through .NET without BOM to avoid parser differences across versions.
    $json = ConvertTo-Json -InputObject @($enabledPlugins)
    [System.IO.File]::WriteAllText($CommunityPluginsPath, $json, (New-Object System.Text.UTF8Encoding($false)))
}

Write-Host ''
Write-Host 'Project Second Brain Obsidian integration installed.'
Write-Host ''
Write-Host 'Native Global Graph:'
Write-Host '  - close and reopen Graph View to load the graph preset.'
Write-Host '  - Settings -> Appearance -> CSS snippets -> enable second-brain-graph.'
Write-Host ''
Write-Host 'Saturn Brain:'
Write-Host '  - FULLY EXIT Obsidian, then reopen the vault.'
Write-Host '  - Settings -> Community plugins -> confirm Second Brain Saturn is enabled.'
Write-Host '  - Command Palette -> Open Saturn Brain.'
Write-Host '  - if Restricted Mode is enabled, turn on community plugins first.'
Write-Host ''
Write-Host 'The Saturn view is deterministic and read-only: it does not rewrite notes or create decorative links.'

if (Test-Path $VerifyScript) {
    Write-Host ''
    & $VerifyScript
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Saturn diagnostics returned exit code $LASTEXITCODE. Read the diagnostics above before reopening Obsidian."
    }
}
