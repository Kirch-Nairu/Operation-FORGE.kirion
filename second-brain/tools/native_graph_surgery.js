const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const REPORT = path.join(ROOT, 'reports', 'NATIVE_GRAPH_SURGERY.md');
const JSON_REPORT = path.join(ROOT, 'reports', 'NATIVE_GRAPH_SURGERY.json');
const IGNORE_DIRS = new Set(['.git', '.obsidian', 'archive', 'templates', 'templates-v2']);
const GRAPH_PREFIXES = [
  'mesh/', 'cognitive-os/', 'planning/', 'decision-engine/', 'assurance/',
  'risk/', 'scenario/', 'incident/', 'knowledge/', 'truth/', 'atlas/projects/'
];
const CENTRAL = 'cognitive-os/CENTRAL_BRAIN.md';
const LINK_RE = /\[\[([^\]]+)\]\]/g;
const FENCE_RE = /```[\s\S]*?```/g;

const SECTORS = {
  architecture: 'cognitive-os/hubs/ARCHITECTURE_SECTOR.md',
  data: 'cognitive-os/hubs/DATA_SECTOR.md',
  operations: 'cognitive-os/hubs/PLATFORM_RELIABILITY_SECTOR.md',
  reliability: 'cognitive-os/hubs/PLATFORM_RELIABILITY_SECTOR.md',
  security: 'cognitive-os/hubs/SECURITY_SECTOR.md',
  assurance: 'cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR.md',
  governance: 'cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR.md',
  ai: 'cognitive-os/hubs/AI_AUTOMATION_SECTOR.md',
  projects: 'cognitive-os/hubs/PROJECTS_SECTOR.md',
};
const SECTOR_RING = [
  SECTORS.architecture,
  SECTORS.data,
  SECTORS.operations,
  SECTORS.security,
  SECTORS.assurance,
  SECTORS.governance,
  SECTORS.ai,
  SECTORS.projects,
];
const DOMAIN_PARENTS = {
  architecture: 'planning/ARCHITECTURE_PLANNING_HUB.md',
  security: 'planning/SECURITY_PLANNING_HUB.md',
  data: 'planning/DATA_PLANNING_HUB.md',
  operations: 'planning/PLATFORM_OPERATIONS_PLANNING_HUB.md',
  reliability: 'planning/PLATFORM_OPERATIONS_PLANNING_HUB.md',
  governance: 'decision-engine/DECISION_ENGINE.md',
  assurance: 'assurance/ASSURANCE_HUB.md',
  ai: SECTORS.ai,
  projects: SECTORS.projects,
};
const INNER_CORE = new Set([
  'cognitive-os/NOW.md',
  'cognitive-os/00_CONSTITUTION.md',
  'cognitive-os/05_AUTHORITY_AND_TRUTH.md',
]);
const BRIDGE_PATTERNS = [
  /Boundary/i, /Data Flow/i, /Recovery/i, /Evidence/i, /Audit/i,
  /Source of Truth/i, /Interface Contract/i, /Reversibility/i, /Deployment/i,
  /Authority/i, /Risk Acceptance/i, /Drift/i, /Verification/i,
];

function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }
function graphScoped(r) { return GRAPH_PREFIXES.some(p => r.startsWith(p)); }
function ignored(r) { return r.split('/').some(p => IGNORE_DIRS.has(p)); }
function edgeKey(a, b) { return a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`; }
function stem(r) { return path.basename(r, '.md'); }
function displayFromRaw(raw) {
  const [left, alias] = raw.split('|', 2);
  if (alias) return alias.trim();
  const target = left.split('#', 1)[0].trim().replace(/\\/g, '/');
  return path.basename(target).replace(/\.md$/i, '');
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const r = rel(full);
    if (ent.isDirectory()) {
      if (!ignored(r)) walk(full, out);
    } else if (ent.isFile() && ent.name.endsWith('.md') && !ignored(r)) out.push(full);
  }
  return out;
}

function splitFrontmatter(text) {
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  if (!text.startsWith(`---${nl}`) && text !== '---') return { fm: '', body: text, nl };
  const marker = `${nl}---${nl}`;
  const idx = text.indexOf(marker, 4);
  if (idx < 0) return { fm: '', body: text, nl };
  return { fm: text.slice(0, idx + marker.length), body: text.slice(idx + marker.length), nl };
}

function extractTargets(text) {
  const cleaned = text.replace(FENCE_RE, '');
  const out = [];
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(cleaned))) {
    const raw = m[1];
    const target = raw.split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
    if (target) out.push({ raw, target });
  }
  return out;
}

function buildIndex(files) {
  const exact = new Map();
  const stems = new Map();
  for (const f of files) {
    const r = rel(f);
    exact.set(r, r);
    exact.set(r.replace(/\.md$/i, ''), r);
    const s = stem(r);
    if (!stems.has(s)) stems.set(s, []);
    stems.get(s).push(r);
  }
  return { exact, stems };
}

function resolveTarget(target, index) {
  if (index.exact.has(target)) return index.exact.get(target);
  if (!target.endsWith('.md') && index.exact.has(`${target}.md`)) return index.exact.get(`${target}.md`);
  if (!target.includes('/')) {
    const arr = index.stems.get(path.basename(target).replace(/\.md$/i, '')) || [];
    if (arr.length === 1) return arr[0];
  }
  return null;
}

function classify(r) {
  if (r === CENTRAL) return { kind: 'central', domain: 'central' };
  if (r.startsWith('cognitive-os/hubs/')) {
    if (r.includes('ARCHITECTURE')) return { kind: 'sector', domain: 'architecture' };
    if (r.includes('DATA_')) return { kind: 'sector', domain: 'data' };
    if (r.includes('PLATFORM')) return { kind: 'sector', domain: 'operations' };
    if (r.includes('SECURITY')) return { kind: 'sector', domain: 'security' };
    if (r.includes('ASSURANCE')) return { kind: 'sector', domain: 'assurance' };
    if (r.includes('DECISION')) return { kind: 'sector', domain: 'governance' };
    if (r.includes('AI_')) return { kind: 'sector', domain: 'ai' };
    if (r.includes('PROJECT')) return { kind: 'sector', domain: 'projects' };
    return { kind: 'sector', domain: 'other' };
  }
  if (r.startsWith('atlas/projects/')) return { kind: 'project', domain: 'projects' };
  if (r.startsWith('mesh/architecture/')) return { kind: 'atomic', domain: 'architecture' };
  if (r.startsWith('mesh/security/')) return { kind: 'atomic', domain: 'security' };
  if (r.startsWith('mesh/data/')) return { kind: 'atomic', domain: 'data' };
  if (r.startsWith('mesh/operations/')) return { kind: 'atomic', domain: 'operations' };
  if (r.startsWith('mesh/reliability/')) return { kind: 'atomic', domain: 'reliability' };
  if (r.startsWith('mesh/governance/')) return { kind: 'atomic', domain: 'governance' };
  if (r.startsWith('mesh/ai/')) return { kind: 'atomic', domain: 'ai' };
  if (r.startsWith('cognitive-os/')) return { kind: 'core', domain: 'core' };
  if (r.startsWith('planning/ARCHITECTURE_') || r.startsWith('planning/UX_FRONTEND_')) return { kind: 'subhub', domain: 'architecture' };
  if (r.startsWith('planning/SECURITY_')) return { kind: 'subhub', domain: 'security' };
  if (r.startsWith('planning/DATA_')) return { kind: 'subhub', domain: 'data' };
  if (r.startsWith('planning/PLATFORM_')) return { kind: 'subhub', domain: 'operations' };
  if (r.startsWith('planning/RESEARCH_')) return { kind: 'subhub', domain: 'assurance' };
  if (r.startsWith('planning/DELIVERY_')) return { kind: 'subhub', domain: 'governance' };
  if (r.startsWith('decision-engine/') || r.startsWith('truth/')) return { kind: 'subhub', domain: 'governance' };
  if (r.startsWith('risk/')) return { kind: 'subhub', domain: 'security' };
  if (r.startsWith('scenario/') || r.startsWith('assurance/') || r.startsWith('incident/') || r.startsWith('knowledge/')) return { kind: 'subhub', domain: 'assurance' };
  return { kind: 'subhub', domain: 'other' };
}

function commonNeighbors(a, b, adj) {
  let n = 0;
  for (const x of adj.get(a) || []) if ((adj.get(b) || new Set()).has(x)) n++;
  return n;
}

function buildCurrentGraph(scoped, contents, index) {
  const edges = new Set();
  const directed = new Set();
  for (const src of scoped) {
    const { fm, body } = splitFrontmatter(contents.get(src));
    for (const chunk of [fm, body]) {
      for (const { target } of extractTargets(chunk)) {
        const dst = resolveTarget(target, index);
        if (!dst || !scoped.has(dst) || dst === src) continue;
        edges.add(edgeKey(src, dst));
        directed.add(`${src}\u0000${dst}`);
      }
    }
  }
  const adj = new Map([...scoped].map(x => [x, new Set()]));
  for (const e of edges) {
    const [a, b] = e.split('\u0000');
    adj.get(a).add(b); adj.get(b).add(a);
  }
  return { edges, directed, adj };
}

function buildAllowed(scoped, nodes, current) {
  const allowed = new Set();
  const add = (a, b) => {
    if (!a || !b || a === b || !scoped.has(a) || !scoped.has(b)) return;
    allowed.add(edgeKey(a, b));
  };

  // Root: small inner core plus exactly the eight major sectors.
  for (const n of INNER_CORE) add(CENTRAL, n);
  for (const s of SECTOR_RING) add(CENTRAL, s);

  // Sector ring: creates high-level continuity without making every leaf a root child.
  for (let i = 0; i < SECTOR_RING.length; i++) {
    add(SECTOR_RING[i], SECTOR_RING[(i + 1) % SECTOR_RING.length]);
  }

  // Every subhub belongs to one sector. Keep at most two existing same-domain subhub peers.
  for (const [r, meta] of nodes) {
    if (meta.kind !== 'subhub') continue;
    const sector = SECTORS[meta.domain];
    add(r, sector);
    const peers = [...(current.adj.get(r) || [])]
      .filter(x => nodes.get(x)?.kind === 'subhub' && nodes.get(x)?.domain === meta.domain)
      .sort((a, b) => commonNeighbors(r, b, current.adj) - commonNeighbors(r, a, current.adj) || a.localeCompare(b))
      .slice(0, 2);
    peers.forEach(p => add(r, p));
  }

  // Atomic concepts: parent MOC/subhub + a sparse local peer mesh.
  for (const [r, meta] of nodes) {
    if (meta.kind !== 'atomic') continue;
    const preferred = DOMAIN_PARENTS[meta.domain];
    add(r, scoped.has(preferred) ? preferred : SECTORS[meta.domain]);
  }

  // Greedy same-domain atomic edges, max two peer edges per atomic.
  const atomicPeerDegree = new Map([...nodes].filter(([,m]) => m.kind === 'atomic').map(([r]) => [r, 0]));
  const peerCandidates = [];
  for (const e of current.edges) {
    const [a, b] = e.split('\u0000');
    const ma = nodes.get(a), mb = nodes.get(b);
    if (!ma || !mb || ma.kind !== 'atomic' || mb.kind !== 'atomic' || ma.domain !== mb.domain) continue;
    const reciprocal = current.directed.has(`${a}\u0000${b}`) && current.directed.has(`${b}\u0000${a}`) ? 3 : 0;
    peerCandidates.push({ a, b, score: reciprocal + commonNeighbors(a, b, current.adj) });
  }
  peerCandidates.sort((x, y) => y.score - x.score || x.a.localeCompare(y.a) || x.b.localeCompare(y.b));
  for (const c of peerCandidates) {
    if ((atomicPeerDegree.get(c.a) || 0) >= 2 || (atomicPeerDegree.get(c.b) || 0) >= 2) continue;
    add(c.a, c.b);
    atomicPeerDegree.set(c.a, (atomicPeerDegree.get(c.a) || 0) + 1);
    atomicPeerDegree.set(c.b, (atomicPeerDegree.get(c.b) || 0) + 1);
  }

  // Cross-domain bridges are rare and must look like boundary/recovery/evidence concepts.
  const bridgeDegree = new Map();
  const domainPairCount = new Map();
  const bridgeCandidates = [];
  const bridgeLike = r => BRIDGE_PATTERNS.some(rx => rx.test(stem(r)));
  for (const e of current.edges) {
    const [a, b] = e.split('\u0000');
    const ma = nodes.get(a), mb = nodes.get(b);
    if (!ma || !mb || ma.kind !== 'atomic' || mb.kind !== 'atomic' || ma.domain === mb.domain) continue;
    if (!bridgeLike(a) && !bridgeLike(b)) continue;
    const reciprocal = current.directed.has(`${a}\u0000${b}`) && current.directed.has(`${b}\u0000${a}`) ? 4 : 0;
    bridgeCandidates.push({ a, b, score: reciprocal + commonNeighbors(a, b, current.adj) });
  }
  bridgeCandidates.sort((x, y) => y.score - x.score || x.a.localeCompare(y.a) || x.b.localeCompare(y.b));
  for (const c of bridgeCandidates) {
    if ((bridgeDegree.get(c.a) || 0) >= 1 || (bridgeDegree.get(c.b) || 0) >= 1) continue;
    const pair = [nodes.get(c.a).domain, nodes.get(c.b).domain].sort().join('|');
    if ((domainPairCount.get(pair) || 0) >= 2) continue;
    add(c.a, c.b);
    bridgeDegree.set(c.a, 1); bridgeDegree.set(c.b, 1);
    domainPairCount.set(pair, (domainPairCount.get(pair) || 0) + 1);
  }

  // Projects become satellites: Projects MOC + up to three existing concept/subhub anchors.
  for (const [r, meta] of nodes) {
    if (meta.kind !== 'project') continue;
    add(r, SECTORS.projects);
    const candidates = [...(current.adj.get(r) || [])]
      .filter(x => {
        const k = nodes.get(x)?.kind;
        return k === 'atomic' || k === 'subhub' || k === 'sector';
      })
      .filter(x => x !== CENTRAL && x !== SECTORS.projects)
      .sort((a, b) => {
        const ka = nodes.get(a)?.kind === 'atomic' ? 0 : 1;
        const kb = nodes.get(b)?.kind === 'atomic' ? 0 : 1;
        return ka - kb || commonNeighbors(r, b, current.adj) - commonNeighbors(r, a, current.adj) || a.localeCompare(b);
      })
      .slice(0, 3);
    candidates.forEach(x => add(r, x));
  }

  // Other cognitive core notes keep a restrained internal neighborhood.
  for (const [r, meta] of nodes) {
    if (meta.kind !== 'core') continue;
    if (INNER_CORE.has(r)) { add(r, CENTRAL); continue; }
    const candidates = [...(current.adj.get(r) || [])]
      .filter(x => nodes.get(x)?.kind === 'core' || nodes.get(x)?.kind === 'subhub' || nodes.get(x)?.kind === 'sector')
      .filter(x => x !== CENTRAL)
      .sort((a, b) => commonNeighbors(r, b, current.adj) - commonNeighbors(r, a, current.adj) || a.localeCompare(b))
      .slice(0, 4);
    candidates.forEach(x => add(r, x));
  }

  return allowed;
}

function metrics(scoped, nodes, edges) {
  const deg = new Map([...scoped].map(x => [x, 0]));
  let intra = 0, cross = 0;
  for (const e of edges) {
    const [a, b] = e.split('\u0000');
    deg.set(a, (deg.get(a) || 0) + 1); deg.set(b, (deg.get(b) || 0) + 1);
    if (nodes.get(a)?.domain === nodes.get(b)?.domain) intra++; else cross++;
  }
  const n = scoped.size, e = edges.size;
  const avg = n ? (2 * e / n) : 0;
  const density = n > 1 ? e / (n * (n - 1) / 2) : 0;
  return { nodes: n, edges: e, average_degree: avg, density, locality: e ? intra / e : 0, intra_edges: intra, cross_edges: cross, degrees: Object.fromEntries([...deg].sort((a,b)=>b[1]-a[1])) };
}

function removeExistingGeneratedFields(fm, nl) {
  if (!fm) return fm;
  const lines = fm.split(nl);
  const out = [];
  let skipping = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^graph_nonvisual_relations:\s*$/.test(line)) { skipping = true; continue; }
    if (skipping) {
      if (/^\s+-\s+/.test(line) || /^\s*$/.test(line)) continue;
      skipping = false;
    }
    out.push(line);
  }
  return out.join(nl);
}

function stripFrontmatterWikiLinks(fm, src, scoped, index) {
  if (!fm) return fm;
  return fm.replace(LINK_RE, (whole, raw) => {
    const target = raw.split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
    const dst = resolveTarget(target, index);
    if (!dst || !scoped.has(dst) || dst === src) return whole;
    return dst.replace(/\.md$/i, '');
  });
}

function replaceGraphLinksInBody(body, src, scoped, index, allowed, removed) {
  // Remove an old generated neighborhood if the tool is re-run.
  body = body.replace(/(?:\r?\n)?## Graph neighborhood\r?\n[\s\S]*?(?=\r?\n## |$)/g, '');
  return body.replace(LINK_RE, (whole, raw) => {
    const target = raw.split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
    const dst = resolveTarget(target, index);
    if (!dst || !scoped.has(dst) || dst === src) return whole;
    if (allowed.has(edgeKey(src, dst))) return whole;
    removed.add(dst);
    return displayFromRaw(raw);
  });
}

function injectNonvisualField(fm, removed, nl) {
  if (!fm || removed.size === 0) return fm;
  const close = `${nl}---${nl}`;
  const idx = fm.lastIndexOf(close);
  if (idx < 0) return fm;
  const block = [
    'graph_nonvisual_relations:',
    ...[...removed].sort().map(r => `  - "${r.replace(/\.md$/i, '')}"`),
  ].join(nl) + nl;
  return fm.slice(0, idx + nl.length) + block + fm.slice(idx + nl.length);
}

function graphNeighborhood(src, allowed, nl) {
  const neighbors = [];
  for (const e of allowed) {
    const [a, b] = e.split('\u0000');
    if (a === src) neighbors.push(b);
    else if (b === src) neighbors.push(a);
  }
  if (!neighbors.length) return '';
  neighbors.sort((a, b) => {
    const ma = classify(a), mb = classify(b);
    const rank = { central: 0, sector: 1, subhub: 2, core: 3, atomic: 4, project: 5 };
    return (rank[ma.kind] ?? 9) - (rank[mb.kind] ?? 9) || a.localeCompare(b);
  });
  return `${nl}${nl}## Graph neighborhood${nl}${nl}` + neighbors.map(n => `- [[${n.replace(/\.md$/i, '')}]]`).join(nl) + nl;
}

function main() {
  const files = walk(ROOT);
  const index = buildIndex(files);
  const scopedList = files.map(rel).filter(graphScoped).sort();
  const scoped = new Set(scopedList);
  const nodes = new Map(scopedList.map(r => [r, classify(r)]));
  const contents = new Map(scopedList.map(r => [r, fs.readFileSync(path.join(ROOT, r), 'utf8')]));
  const current = buildCurrentGraph(scoped, contents, index);
  const allowed = buildAllowed(scoped, nodes, current);
  const before = metrics(scoped, nodes, current.edges);
  const after = metrics(scoped, nodes, allowed);

  const removedEdges = [...current.edges].filter(e => !allowed.has(e));
  const addedEdges = [...allowed].filter(e => !current.edges.has(e));
  const changed = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.join(ROOT, '.git', 'native-graph-backups', timestamp);

  for (const src of scopedList) {
    const original = contents.get(src);
    const { fm: originalFm, body: originalBody, nl } = splitFrontmatter(original);
    const removed = new Set();
    let fm = removeExistingGeneratedFields(originalFm, nl);
    fm = stripFrontmatterWikiLinks(fm, src, scoped, index);
    let body = replaceGraphLinksInBody(originalBody, src, scoped, index, allowed, removed);
    fm = injectNonvisualField(fm, removed, nl);
    body = body.replace(/\s+$/, '');
    const rewritten = fm + body + graphNeighborhood(src, allowed, nl);
    if (rewritten !== original) {
      changed.push(src);
      if (APPLY) {
        const backup = path.join(backupRoot, src);
        fs.mkdirSync(path.dirname(backup), { recursive: true });
        fs.writeFileSync(backup, original, 'utf8');
        fs.writeFileSync(path.join(ROOT, src), rewritten, 'utf8');
      }
    }
  }

  const summary = {
    mode: APPLY ? 'APPLY' : 'DRY_RUN',
    before,
    after,
    changed_files: changed.length,
    removed_edges: removedEdges.length,
    added_edges: addedEdges.length,
    backup_root: APPLY ? path.relative(ROOT, backupRoot).split(path.sep).join('/') : null,
  };
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(JSON_REPORT, JSON.stringify({ ...summary, changed, removed_edges_detail: removedEdges, added_edges_detail: addedEdges }, null, 2));
  const lines = [
    '# Native Graph Surgery', '',
    `Mode: **${summary.mode}**`, '',
    '## Before', '',
    `- nodes: ${before.nodes}`,
    `- edges: ${before.edges}`,
    `- average degree: ${before.average_degree.toFixed(2)}`,
    `- density: ${(before.density * 100).toFixed(2)}%`,
    `- locality: ${(before.locality * 100).toFixed(1)}%`, '',
    '## Proposed / resulting topology', '',
    `- nodes: ${after.nodes}`,
    `- edges: ${after.edges}`,
    `- average degree: ${after.average_degree.toFixed(2)}`,
    `- density: ${(after.density * 100).toFixed(2)}%`,
    `- locality: ${(after.locality * 100).toFixed(1)}%`, '',
    '## Change surface', '',
    `- changed files: ${changed.length}`,
    `- visual edges removed: ${removedEdges.length}`,
    `- structural edges added: ${addedEdges.length}`,
    `- backup: ${summary.backup_root || 'not written in dry-run'}`, '',
    'Removed visual relationships are retained as plain `graph_nonvisual_relations` paths in frontmatter. Existing prose is preserved; removed wiki links are converted to readable text. The generated `Graph neighborhood` section contains only relationships intended to influence native Obsidian graph physics.', '',
    '## Highest proposed degrees', '',
    ...Object.entries(after.degrees).slice(0, 20).map(([r,d]) => `- ${d} — ${r}`), '',
  ];
  fs.writeFileSync(REPORT, lines.join('\n'), 'utf8');

  console.log('');
  console.log(`Native Graph Surgery (${summary.mode})`);
  console.log('-------------------------------');
  console.log(`Before: nodes=${before.nodes} edges=${before.edges} avg_degree=${before.average_degree.toFixed(2)} locality=${(before.locality*100).toFixed(1)}%`);
  console.log(`After:  nodes=${after.nodes} edges=${after.edges} avg_degree=${after.average_degree.toFixed(2)} locality=${(after.locality*100).toFixed(1)}%`);
  console.log(`Changed files: ${changed.length}`);
  console.log(`Visual edges removed: ${removedEdges.length}`);
  console.log(`Structural edges added: ${addedEdges.length}`);
  if (APPLY) console.log(`Backup: ${summary.backup_root}`);
  else console.log('Dry-run only. Re-run with --apply after reviewing reports/NATIVE_GRAPH_SURGERY.md');
  console.log(`Report: ${path.relative(ROOT, REPORT)}`);
  console.log('');
}

main();
