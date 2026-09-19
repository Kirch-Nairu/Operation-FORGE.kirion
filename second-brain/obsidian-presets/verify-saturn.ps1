$ErrorActionPreference = 'Stop'

$VaultRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$PluginId = 'second-brain-saturn'
$PluginDir = Join-Path $VaultRoot ".obsidian\plugins\$PluginId"
$Manifest = Join-Path $PluginDir 'manifest.json'
$Main = Join-Path $PluginDir 'main.js'
$Styles = Join-Path $PluginDir 'styles.css'
$Community = Join-Path $VaultRoot '.obsidian\community-plugins.json'

Write-Host 'Second Brain Saturn diagnostics'
Write-Host '--------------------------------'

$required = @($Manifest, $Main, $Styles)
$missing = @($required | Where-Object { -not (Test-Path $_) })
if ($missing.Count -gt 0) {
    Write-Host 'STATUS: FAIL - plugin files missing' -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  missing: $_" }
    exit 1
}

$manifestData = Get-Content $Manifest -Raw | ConvertFrom-Json
if ($manifestData.id -ne $PluginId) {
    Write-Host "STATUS: FAIL - manifest id is '$($manifestData.id)', expected '$PluginId'" -ForegroundColor Red
    exit 1
}
Write-Host "Manifest: OK ($($manifestData.name) $($manifestData.version))"

$registered = $false
if (Test-Path $Community) {
    try {
        $plugins = @((Get-Content $Community -Raw | ConvertFrom-Json))
        $registered = $plugins -contains $PluginId
        Write-Host "community-plugins.json: $($(if ($registered) {'REGISTERED'} else {'NOT REGISTERED'}))"
    }
    catch {
        Write-Host 'community-plugins.json: INVALID JSON' -ForegroundColor Yellow
    }
}
else {
    Write-Host 'community-plugins.json: NOT FOUND' -ForegroundColor Yellow
}

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    & node --check $Main
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'STATUS: FAIL - main.js did not pass node --check' -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host 'main.js syntax: OK'
}
else {
    Write-Host 'main.js syntax: NOT CHECKED (node not found)' -ForegroundColor Yellow
}

if (-not $registered) {
    Write-Host ''
    Write-Host 'Plugin files are installed but Obsidian is not configured to enable this plugin.' -ForegroundColor Yellow
    Write-Host 'Run .\obsidian-presets\install.ps1 again with Obsidian closed, or enable Second Brain Saturn in Settings -> Community plugins.'
    exit 2
}

Write-Host ''
Write-Host 'FILES + REGISTRATION: OK' -ForegroundColor Green
Write-Host 'Now fully exit Obsidian, reopen the vault, then Ctrl+P -> Open Saturn Brain.'
Write-Host 'If the command is still absent, open Developer Tools (Ctrl+Shift+I) and search Console for: Second Brain Saturn'
