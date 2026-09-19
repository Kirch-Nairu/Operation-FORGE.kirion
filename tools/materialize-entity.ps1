$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$ForgeSha = "44eb57e5b45b343be0033bf22a7a5e74d543c01a"
$PsbSha = "f3d371d989ddb1e3dbbea7c671d3c6a393b712c7"
$Overlay = Join-Path $Root "overlays/claude-2026-09-19"

git submodule update --init --recursive
if ($LASTEXITCODE -ne 0) { throw "submodule init failed" }

$ActualForge = (git -C forge-core rev-parse HEAD).Trim()
$ActualPsb = (git -C second-brain rev-parse HEAD).Trim()
if ($ActualForge -ne $ForgeSha) { throw "FORGE BASE MISMATCH: $ActualForge" }
if ($ActualPsb -ne $PsbSha) { throw "SECOND BRAIN BASE MISMATCH: $ActualPsb" }

$Tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("forge-entity-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $Tmp | Out-Null
try {
    $ForgeB64 = Get-Content (Join-Path $Overlay "forge.patch.xz.b64") -Raw
    [IO.File]::WriteAllBytes((Join-Path $Tmp "forge.patch.xz"), [Convert]::FromBase64String($ForgeB64.Trim()))

    $PsbB64 = (Get-ChildItem (Join-Path $Overlay "psb.patch.xz.b64.part*") | Sort-Object Name | ForEach-Object { Get-Content $_.FullName -Raw }) -join ""
    [IO.File]::WriteAllBytes((Join-Path $Tmp "psb.patch.xz"), [Convert]::FromBase64String($PsbB64.Trim()))

    $ForgeHash = (Get-FileHash (Join-Path $Tmp "forge.patch.xz") -Algorithm SHA256).Hash.ToLower()
    $PsbHash = (Get-FileHash (Join-Path $Tmp "psb.patch.xz") -Algorithm SHA256).Hash.ToLower()
    if ($ForgeHash -ne "6f76a995fc40bab8106a972d28166694e0c368685bdc8569b31a2d37ffccdb1f") { throw "Forge overlay hash mismatch" }
    if ($PsbHash -ne "e79d1fbaa199c1235dd140d5a9293d19827bf07339be0a94685cdb24c8a9c6e7") { throw "Second Brain overlay hash mismatch" }

    git -C forge-core reset --hard $ForgeSha
    git -C second-brain reset --hard $PsbSha
    git -C forge-core clean -fd
    git -C second-brain clean -fd

    xz -dc (Join-Path $Tmp "forge.patch.xz") | Set-Content -NoNewline -Encoding utf8 (Join-Path $Tmp "forge.patch")
    xz -dc (Join-Path $Tmp "psb.patch.xz") | Set-Content -NoNewline -Encoding utf8 (Join-Path $Tmp "psb.patch")

    git -C forge-core apply --check (Join-Path $Tmp "forge.patch")
    if ($LASTEXITCODE -ne 0) { throw "Forge overlay check failed" }
    git -C second-brain apply --check (Join-Path $Tmp "psb.patch")
    if ($LASTEXITCODE -ne 0) { throw "Second Brain overlay check failed" }

    git -C forge-core apply (Join-Path $Tmp "forge.patch")
    git -C second-brain apply (Join-Path $Tmp "psb.patch")

    python tools/verify-entity.py
    if ($LASTEXITCODE -ne 0) { throw "entity verification failed" }
}
finally {
    Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
}
