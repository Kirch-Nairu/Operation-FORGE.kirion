$ErrorActionPreference = 'Stop'

$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ReportPath = Join-Path $Root 'reports\NATIVE_GRAPH_AUDIT.md'
$JsonPath = Join-Path $Root 'reports\NATIVE_GRAPH_AUDIT.json'

$GraphPrefixes = @(
    'mesh/',
    'cognitive-os/',
    'planning/',
    'decision-engine/',
    'assurance/',
    'risk/',
    'scenario/',
    'incident/',
    'knowledge/',
    'truth/',
    'atlas/projects/'
)

$IgnoredParts = @('.git', '.obsidian', 'archive', 'templates', 'templates-v2')
$Central = 'cognitive-os/CENTRAL_BRAIN.md'
$WikiLinkRegex = '\[\[([^\]]+)\]\]'

function To-RelPath([string]$Path) {
    $full = [System.IO.Path]::GetFullPath($Path)
    $rootFull = [System.IO.Path]::GetFullPath($Root)
    $rel = $full.Substring($rootFull.Length).TrimStart('\','/')
    return ($rel -replace '\\','/')
}

function Test-Ignored([string]$Rel) {
    $parts = $Rel -split '/'
    foreach ($p in $parts) {
        if ($IgnoredParts -contains $p) { return $true }
    }
    return $false
}

function Test-GraphScoped([string]$Rel) {
    foreach ($prefix in $GraphPrefixes) {
        if ($Rel.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) { return $true }
    }
    return $false
}

function Split-Frontmatter([string]$Text) {
    if (-not $Text.StartsWith('---')) {
        return @{ frontmatter = ''; body = $Text }
    }
    $lines = $Text -split "`r?`n", 0, 'RegexMatch'
    if ($lines.Count -lt 2 -or $lines[0].Trim() -ne '---') {
        return @{ frontmatter = ''; body = $Text }
    }
    for ($i = 1; $i -lt $lines.Count; $i++) {
        if ($lines[$i].Trim() -eq '---') {
            $fm = ($lines[0..$i] -join "`n")
            $body = if ($i + 1 -lt $lines.Count) { ($lines[($i+1)..($lines.Count-1)] -join "`n") } else { '' }
            return @{ frontmatter = $fm; body = $body }
        }
    }
    return @{ frontmatter = ''; body = $Text }
}

function Strip-CodeFences([string]$Text) {
    return [regex]::Replace($Text, '```.*?```', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

function Get-LinkTargets([string]$Text) {
    $clean = Strip-CodeFences $Text
    $out = New-Object System.Collections.Generic.List[string]
    foreach ($m in [regex]::Matches($clean, $WikiLinkRegex)) {
        $target = $m.Groups[1].Value
        if ($target.Contains('|')) { $target = $target.Split('|')[0] }
        if ($target.Contains('#')) { $target = $target.Split('#')[0] }
        $target = ($target.Trim() -replace '\\','/')
        if ($target) { [void]$out.Add($target) }
    }
    return $out
}

function Get-NodeMeta([string]$Rel) {
    if ($Rel -eq $Central) { return @{ kind='central'; domain='central' } }
    if ($Rel.StartsWith('cognitive-os/hubs/')) {
        $name = [System.IO.Path]::GetFileNameWithoutExtension($Rel)
        $domain = 'other'
        if ($name -match 'ARCHITECTURE') { $domain = 'architecture' }
        elseif ($name -match 'SECURITY') { $domain = 'security' }
        elseif ($name -match 'DATA') { $domain = 'data' }
        elseif ($name -match 'PLATFORM') { $domain = 'operations' }
        elseif ($name -match 'ASSURANCE') { $domain = 'assurance' }
        elseif ($name -match 'DECISION') { $domain = 'governance' }
        elseif ($name -match 'AI') { $domain = 'ai' }
        elseif ($name -match 'PROJECT') { $domain = 'projects' }
        return @{ kind='sector'; domain=$domain }
    }
    if ($Rel.StartsWith('atlas/projects/')) { return @{ kind='project'; domain='projects' } }
    if ($Rel.StartsWith('cognitive-os/')) { return @{ kind='core'; domain='core' } }
    if ($Rel.StartsWith('mesh/architecture/')) { return @{ kind='atomic'; domain='architecture' } }
    if ($Rel.StartsWith('mesh/security/')) { return @{ kind='atomic'; domain='security' } }
    if ($Rel.StartsWith('mesh/data/')) { return @{ kind='atomic'; domain='data' } }
    if ($Rel.StartsWith('mesh/operations/')) { return @{ kind='atomic'; domain='operations' } }
    if ($Rel.StartsWith('mesh/reliability/')) { return @{ kind='atomic'; domain='reliability' } }
    if ($Rel.StartsWith('mesh/governance/')) { return @{ kind='atomic'; domain='governance' } }
    if ($Rel.StartsWith('mesh/ai/')) { return @{ kind='atomic'; domain='ai' } }
    if ($Rel.StartsWith('planning/ARCHITECTURE_') -or $Rel.StartsWith('planning/UX_FRONTEND_')) { return @{ kind='subhub'; domain='architecture' } }
    if ($Rel.StartsWith('planning/SECURITY_')) { return @{ kind='subhub'; domain='security' } }
    if ($Rel.StartsWith('planning/DATA_')) { return @{ kind='subhub'; domain='data' } }
    if ($Rel.StartsWith('planning/PLATFORM_')) { return @{ kind='subhub'; domain='operations' } }
    if ($Rel.StartsWith('planning/RESEARCH_')) { return @{ kind='subhub'; domain='assurance' } }
    if ($Rel.StartsWith('planning/DELIVERY_')) { return @{ kind='subhub'; domain='governance' } }
    if ($Rel.StartsWith('decision-engine/') -or $Rel.StartsWith('truth/')) { return @{ kind='subhub'; domain='governance' } }
    if ($Rel.StartsWith('risk/')) { return @{ kind='subhub'; domain='security' } }
    if ($Rel.StartsWith('scenario/') -or $Rel.StartsWith('assurance/') -or $Rel.StartsWith('incident/') -or $Rel.StartsWith('knowledge/')) { return @{ kind='subhub'; domain='assurance' } }
    return @{ kind='subhub'; domain='other' }
}

$AllNotes = Get-ChildItem -Path $Root -Recurse -File -Filter *.md | Where-Object {
    $rel = To-RelPath $_.FullName
    -not (Test-Ignored $rel)
}

$Exact = @{}
$StemMap = @{}
foreach ($file in $AllNotes) {
    $rel = To-RelPath $file.FullName
    $noExt = [System.IO.Path]::ChangeExtension($rel, $null) -replace '\\','/'
    $Exact[$rel] = $rel
    $Exact[$noExt] = $rel
    $stem = [System.IO.Path]::GetFileNameWithoutExtension($rel)
    if (-not $StemMap.ContainsKey($stem)) { $StemMap[$stem] = New-Object System.Collections.Generic.List[string] }
    [void]$StemMap[$stem].Add($rel)
}

function Resolve-Target([string]$Target) {
    if ($Exact.ContainsKey($Target)) { return $Exact[$Target] }
    if (-not $Target.EndsWith('.md') -and $Exact.ContainsKey($Target + '.md')) { return $Exact[$Target + '.md'] }
    if (-not $Target.Contains('/')) {
        $stem = [System.IO.Path]::GetFileNameWithoutExtension($Target)
        if ($StemMap.ContainsKey($stem) -and $StemMap[$stem].Count -eq 1) { return $StemMap[$stem][0] }
    }
    return $null
}

$Scoped = @($AllNotes | ForEach-Object { To-RelPath $_.FullName } | Where-Object { Test-GraphScoped $_ } | Sort-Object)
$Nodes = @{}
foreach ($rel in $Scoped) { $Nodes[$rel] = Get-NodeMeta $rel }

$EdgeChannels = @{}
$Unresolved = New-Object System.Collections.Generic.List[object]

foreach ($rel in $Scoped) {
    $text = Get-Content (Join-Path $Root ($rel -replace '/','\')) -Raw
    $split = Split-Frontmatter $text
    foreach ($pair in @(@('frontmatter',$split.frontmatter), @('body',$split.body))) {
        $channel = $pair[0]
        $chunk = [string]$pair[1]
        foreach ($target in Get-LinkTargets $chunk) {
            $resolved = Resolve-Target $target
            if (-not $resolved) {
                [void]$Unresolved.Add([pscustomobject]@{source=$rel; target=$target; channel=$channel})
                continue
            }
            if (-not $Nodes.ContainsKey($resolved) -or $resolved -eq $rel) { continue }
            $a, $b = @($rel, $resolved) | Sort-Object
            $key = "$a`t$b"
            if (-not $EdgeChannels.ContainsKey($key)) { $EdgeChannels[$key] = New-Object System.Collections.Generic.HashSet[string] }
            [void]$EdgeChannels[$key].Add($channel)
        }
    }
}

$Adj = @{}
foreach ($rel in $Scoped) { $Adj[$rel] = New-Object System.Collections.Generic.HashSet[string] }
foreach ($key in $EdgeChannels.Keys) {
    $parts = $key -split "`t", 2
    [void]$Adj[$parts[0]].Add($parts[1])
    [void]$Adj[$parts[1]].Add($parts[0])
}

$n = $Scoped.Count
$e = $EdgeChannels.Count
$avgDegree = if ($n) { (2.0 * $e / $n) } else { 0 }
$density = if ($n -gt 1) { $e / (($n * ($n - 1)) / 2.0) } else { 0 }

$Degrees = @{}
foreach ($rel in $Scoped) { $Degrees[$rel] = $Adj[$rel].Count }

$bodyOnly = 0; $fmOnly = 0; $both = 0; $intra = 0; $cross = 0
$CrossDegree = @{}; $IntraDegree = @{}
foreach ($rel in $Scoped) { $CrossDegree[$rel] = 0; $IntraDegree[$rel] = 0 }

foreach ($key in $EdgeChannels.Keys) {
    $parts = $key -split "`t", 2
    $channels = $EdgeChannels[$key]
    if ($channels.Count -eq 1 -and $channels.Contains('body')) { $bodyOnly++ }
    elseif ($channels.Count -eq 1 -and $channels.Contains('frontmatter')) { $fmOnly++ }
    else { $both++ }

    $da = $Nodes[$parts[0]].domain
    $db = $Nodes[$parts[1]].domain
    if ($da -eq $db) {
        $intra++
        $IntraDegree[$parts[0]]++
        $IntraDegree[$parts[1]]++
    } else {
        $cross++
        $CrossDegree[$parts[0]]++
        $CrossDegree[$parts[1]]++
    }
}

$locality = if ($e) { $intra / [double]$e } else { 0 }

# Connected components
$seen = New-Object System.Collections.Generic.HashSet[string]
$components = New-Object System.Collections.Generic.List[object]
foreach ($start in $Scoped) {
    if ($seen.Contains($start)) { continue }
    $queue = New-Object System.Collections.Generic.Queue[string]
    $group = New-Object System.Collections.Generic.List[string]
    $queue.Enqueue($start); [void]$seen.Add($start)
    while ($queue.Count -gt 0) {
        $cur = $queue.Dequeue(); [void]$group.Add($cur)
        foreach ($next in $Adj[$cur]) {
            if (-not $seen.Contains($next)) { [void]$seen.Add($next); $queue.Enqueue($next) }
        }
    }
    [void]$components.Add($group)
}
$largestComponent = if ($components.Count) { ($components | ForEach-Object { $_.Count } | Measure-Object -Maximum).Maximum } else { 0 }

$TopHubs = @($Degrees.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 25 | ForEach-Object {
    [pscustomobject]@{ path=$_.Key; degree=$_.Value; kind=$Nodes[$_.Key].kind; domain=$Nodes[$_.Key].domain; cross_degree=$CrossDegree[$_.Key] }
})

$CrossHeavyAtomic = @($Scoped | Where-Object { $Nodes[$_].kind -eq 'atomic' -and $CrossDegree[$_] -gt 1 } | ForEach-Object {
    [pscustomobject]@{ path=$_; degree=$Degrees[$_]; cross_degree=$CrossDegree[$_]; domain=$Nodes[$_].domain }
} | Sort-Object cross_degree, degree -Descending)

$CentralLeafEdges = @()
if ($Adj.ContainsKey($Central)) {
    $CentralLeafEdges = @($Adj[$Central] | Where-Object { $Nodes[$_].kind -in @('atomic','project') } | Sort-Object)
}

$reasons = New-Object System.Collections.Generic.List[string]
if ($avgDegree -gt 8) { [void]$reasons.Add('average degree is high enough to collapse domain separation') }
if ($locality -lt 0.65) { [void]$reasons.Add('cross-domain edges are too common relative to local-domain edges') }
$atomicCount = @($Scoped | Where-Object { $Nodes[$_].kind -eq 'atomic' }).Count
if ($CrossHeavyAtomic.Count -gt [Math]::Max(4, [Math]::Floor($atomicCount / 4))) { [void]$reasons.Add('too many atomic notes behave as cross-domain bridges') }
if ($fmOnly -gt [Math]::Max(5, [Math]::Floor($e / 10))) { [void]$reasons.Add('frontmatter-only links materially influence native graph physics') }
$verdict = if ($reasons.Count) { 'OVERCONNECTED' } else { 'STRUCTURALLY PLAUSIBLE' }

$reportDir = Split-Path $ReportPath -Parent
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

$lines = New-Object System.Collections.Generic.List[string]
[void]$lines.Add('# Native Obsidian Graph Topology Audit')
[void]$lines.Add('')
[void]$lines.Add('> PowerShell-native audit of the wiki-link topology seen by Obsidian Graph View. Read-only: no notes are rewritten.')
[void]$lines.Add('')
[void]$lines.Add("- Verdict: **$verdict**")
[void]$lines.Add("- Nodes: **$n**")
[void]$lines.Add("- Unique graph edges: **$e**")
[void]$lines.Add(('- Average degree: **{0:N2}**' -f $avgDegree))
[void]$lines.Add(('- Graph density: **{0:P2}**' -f $density))
[void]$lines.Add("- Connected components: **$($components.Count)**")
[void]$lines.Add("- Largest component: **$largestComponent**")
[void]$lines.Add(('- Intra-domain edge locality: **{0:P1}**' -f $locality))
[void]$lines.Add("- Body-only edges: **$bodyOnly**")
[void]$lines.Add("- Frontmatter-only edges: **$fmOnly**")
[void]$lines.Add("- Body + frontmatter edges: **$both**")
[void]$lines.Add("- Cross-domain edges: **$cross**")
[void]$lines.Add("- Unresolved scoped links: **$($Unresolved.Count)**")
[void]$lines.Add('')
[void]$lines.Add('## Verdict reasons')
if ($reasons.Count) { foreach ($r in $reasons) { [void]$lines.Add("- $r") } } else { [void]$lines.Add('- None') }
[void]$lines.Add('')
[void]$lines.Add('## Highest-degree nodes')
foreach ($x in $TopHubs) { [void]$lines.Add("- $($x.path) — degree $($x.degree), cross-domain $($x.cross_degree), $($x.kind)/$($x.domain)") }
[void]$lines.Add('')
[void]$lines.Add('## Atomic cross-domain bridge pressure')
if ($CrossHeavyAtomic.Count) {
    foreach ($x in ($CrossHeavyAtomic | Select-Object -First 50)) { [void]$lines.Add("- $($x.path) — degree $($x.degree), cross-domain $($x.cross_degree)") }
} else { [void]$lines.Add('- None') }
[void]$lines.Add('')
[void]$lines.Add('## Central Brain leaf edges')
if ($CentralLeafEdges.Count) { foreach ($x in $CentralLeafEdges) { [void]$lines.Add("- $x") } } else { [void]$lines.Add('- None') }

[System.IO.File]::WriteAllText($ReportPath, ($lines -join "`n") + "`n", (New-Object System.Text.UTF8Encoding($false)))

$json = [ordered]@{
    verdict = $verdict
    reasons = @($reasons)
    nodes = $n
    edges = $e
    average_degree = [Math]::Round($avgDegree, 4)
    density = [Math]::Round($density, 6)
    components = $components.Count
    largest_component = $largestComponent
    locality = [Math]::Round($locality, 6)
    body_only_edges = $bodyOnly
    frontmatter_only_edges = $fmOnly
    both_channel_edges = $both
    cross_domain_edges = $cross
    unresolved_scoped_links = $Unresolved.Count
    top_hubs = $TopHubs
    cross_heavy_atomic = $CrossHeavyAtomic
    central_leaf_edges = $CentralLeafEdges
}
[System.IO.File]::WriteAllText($JsonPath, ($json | ConvertTo-Json -Depth 8), (New-Object System.Text.UTF8Encoding($false)))

Write-Host ''
Write-Host 'Native Graph Audit (PowerShell)' -ForegroundColor Cyan
Write-Host '--------------------------------'
Write-Host ("Verdict: {0}" -f $verdict)
Write-Host ("Nodes: {0}" -f $n)
Write-Host ("Edges: {0}" -f $e)
Write-Host ("Average degree: {0:N2}" -f $avgDegree)
Write-Host ("Density: {0:P2}" -f $density)
Write-Host ("Locality: {0:P1}" -f $locality)
Write-Host ("Frontmatter-only edges: {0}" -f $fmOnly)
Write-Host ("Cross-heavy atomic notes: {0}" -f $CrossHeavyAtomic.Count)
Write-Host ("Central Brain leaf edges: {0}" -f $CentralLeafEdges.Count)
Write-Host ''
Write-Host "Report: reports\NATIVE_GRAPH_AUDIT.md"
Write-Host "JSON:   reports\NATIVE_GRAPH_AUDIT.json"
Write-Host ''
