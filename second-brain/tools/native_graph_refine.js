const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const REPORT = path.join(ROOT, 'reports', 'NATIVE_GRAPH_REFINEMENT.md');
const JSON_REPORT = path.join(ROOT, 'reports', 'NATIVE_GRAPH_REFINEMENT.json');
const IGNORE_DIRS = new Set(['.git', '.obsidian', 'archive', 'templates', 'templates-v2']);
const GRAPH_PREFIXES = [
  'mesh/', 'cognitive-os/', 'planning/', 'decision-engine/', 'assurance/',
  'risk/', 'scenario/', 'incident/', 'knowledge/', 'truth/', 'atlas/projects/'
];
const LINK_RE = /\[\[([^\]]+)\]\]/g;
const FENCE_SPLIT_RE = /(```[\s\S]*?```)/g;

const SECTOR_HUBS = new Set([
  'cognitive-os/hubs/ARCHITECTURE_SECTOR.md',
  'cognitive-os/hubs/DATA_SECTOR.md',
  'cognitive-os/hubs/PLATFORM_RELIABILITY_SECTOR.md',
  'cognitive-os/hubs/SECURITY_SECTOR.md',
  'cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR.md',
  'cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR.md',
  'cognitive-os/hubs/AI_AUTOMATION_SECTOR.md',
  'cognitive-os/hubs/PROJECTS_SECTOR.md',
]);

function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }
function ignored(r) { return r.split('/').some(p => IGNORE_DIRS.has(p)); }
function graphScoped(r) { return GRAPH_PREFIXES.some(p => r.startsWith(p)); }
function edgeKey(a, b) { return a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`; }

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const r = rel(full);
    if (ent.isDirectory()) {
      if (!ignored(r)) walk(full, out);
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md') && !ignored(r)) {
      out.push(full);
    }
  }
  return out;
}

function splitFrontmatter(text) {
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  if (!text.startsWith(`---${nl}`)) return { fm: '', body: text, nl };
  const marker = `${nl}---${nl}`;
  const idx = text.indexOf(marker, 4);
  if (idx < 0) return { fm: '', body: text, nl };
  return { fm: text.slice(0, idx + marker.length), body: text.slice(idx + marker.length), nl };
}

function classify(r) {
  if (r.startsWith('atlas/projects/')) return { kind: 'project', domain: 'projects' };
  if (SECTOR_HUBS.has(r)) {
    if (r.includes('ARCHITECTURE')) return { kind: 'sector', domain: 'architecture' };
    if (r.includes('DATA_')) return { kind: 'sector', domain: 'data' };
    if (r.includes('PLATFORM')) return { kind: 'sector', domain: 'operations' };
    if (r.includes('SECURITY')) return { kind: 'sector', domain: 'security' };
    if (r.includes('ASSURANCE')) return { kind: 'sector', domain: 'assurance' };
    if (r.includes('DECISION')) return { kind: 'sector', domain: 'governance' };
    if (r.includes('AI_')) return { kind: 'sector', domain: 'ai' };
    if (r.includes('PROJECT')) return { kind: 'sector', domain: 'projects' };
  }
  if (r.startsWith('mesh/architecture/')) return { kind: 'atomic', domain: 'architecture' };
  if (r.startsWith('mesh/security/')) return { kind: 'atomic', domain: 'security' };
  if (r.startsWith('mesh/data/')) return { kind: 'atomic', domain: 'data' };
  if (r.startsWith('mesh/operations/') || r.startsWith('mesh/reliability/')) return { kind: 'atomic', domain: 'operations' };
  if (r.startsWith('mesh/governance/')) return { kind: 'atomic', domain: 'governance' };
  if (r.startsWith('mesh/ai/')) return { kind: 'atomic', domain: 'ai' };
  if (r.startsWith('cognitive-os/')) return { kind: 'core', domain: 'core' };
  return { kind: 'other', domain: 'other' };
}

function buildIndex(files) {
  const exact = new Map();
  const stems = new Map();
  for (const f of files) {
    const r = rel(f);
    exact.set(r, r);
    exact.set(r.replace(/\.md$/i, ''), r);
    const s = path.basename(r, '.md');
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

function linksOutsideCode(text) {
  const out = [];
  const parts = text.split(FENCE_SPLIT_RE);
  for (let i = 0; i < parts.length; i += 2) {
    LINK_RE.lastIndex = 0;
    let m;
    while ((m = LINK_RE.exec(parts[i])) !== null) {
      const target = m[1].split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
      if (target) out.push(target);
    }
  }
  return out;
}

function buildGraph(scoped, contents, index) {
  const edges = new Set();
  for (const src of scoped) {
    const { fm, body } = splitFrontmatter(contents.get(src));
    for (const target of [...linksOutsideCode(fm), ...linksOutsideCode(body)]) {
      const dst = resolveTarget(target, index);
      if (!dst || !scoped.has(dst) || dst === src) continue;
      edges.add(edgeKey(src, dst));
    }
  }
  return edges;
}

function shouldRemove(a, b) {
  const ma = classify(a), mb = classify(b);
  if (SECTOR_HUBS.has(a) && SECTOR_HUBS.has(b)) return 'sector-ring';
  if ((ma.kind === 'project' && mb.kind === 'atomic') || (mb.kind === 'project' && ma.kind === 'atomic')) {
    return 'project-atomic';
  }
  return null;
}

function metrics(scoped, edges) {
  let intra = 0;
  for (const e of edges) {
    const [a, b] = e.split('\u0000');
    if (classify(a).domain === classify(b).domain) intra++;
  }
  const n = scoped.size, e = edges.size;
  return {
    nodes: n,
    edges: e,
    average_degree: n ? (2 * e / n) : 0,
    density: n > 1 ? e / (n * (n - 1) / 2) : 0,
    locality: e ? intra / e : 0,
  };
}

function removeGeneratedNeighborhood(body) {
  return body.replace(/(?:\r?\n)?## Graph neighborhood\r?\n[\s\S]*?(?=\r?\n## |$)/g, '').replace(/\s+$/, '');
}

function displayFromRaw(raw) {
  const parts = raw.split('|', 2);
  if (parts[1]) return parts[1].trim();
  const target = parts[0].split('#', 1)[0].trim().replace(/\\/g, '/');
  return path.basename(target).replace(/\.md$/i, '');
}

function transformBody(body, src, scoped, index, removedNeighbors) {
  const parts = removeGeneratedNeighborhood(body).split(FENCE_SPLIT_RE);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i].replace(LINK_RE, (whole, raw) => {
      const target = raw.split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
      const dst = resolveTarget(target, index);
      if (!dst || !scoped.has(dst) || dst === src) return whole;
      if (!removedNeighbors.has(dst)) return whole;
      return displayFromRaw(raw);
    });
  }
  return parts.join('').replace(/\s+$/, '');
}

function removeGeneratedRefinementField(fm, nl) {
  if (!fm) return fm;
  const lines = fm.split(nl);
  const out = [];
  let skip = false;
  for (const line of lines) {
    if (/^graph_refinement_nonvisual_relations:\s*$/.test(line)) { skip = true; continue; }
    if (skip && /^\s+-\s+/.test(line)) continue;
    if (skip) skip = false;
    out.push(line);
  }
  return out.join(nl);
}

function injectRefinementField(fm, removedNeighbors, nl) {
  if (!fm || removedNeighbors.size === 0) return fm;
  fm = removeGeneratedRefinementField(fm, nl);
  const marker = `${nl}---${nl}`;
  const idx = fm.lastIndexOf(marker);
  if (idx < 0) return fm;
  const block = [
    'graph_refinement_nonvisual_relations:',
    ...[...removedNeighbors].sort().map(r => `  - "${r.replace(/\.md$/i, '')}"`),
  ].join(nl) + nl;
  return fm.slice(0, idx + nl.length) + block + fm.slice(idx + nl.length);
}

function neighborhood(src, adjacency, nl) {
  const neighbors = [...(adjacency.get(src) || [])].sort((a, b) => {
    const rank = { sector: 0, core: 1, other: 2, atomic: 3, project: 4 };
    return (rank[classify(a).kind] ?? 9) - (rank[classify(b).kind] ?? 9) || a.localeCompare(b);
  });
  if (!neighbors.length) return '';
  return `${nl}${nl}## Graph neighborhood${nl}${nl}` +
    neighbors.map(n => `- [[${n.replace(/\.md$/i, '')}]]`).join(nl) + nl;
}

function main() {
  const files = walk(ROOT);
  const index = buildIndex(files);
  const scopedList = files.map(rel).filter(graphScoped).sort();
  const scoped = new Set(scopedList);
  const contents = new Map(scopedList.map(r => [r, fs.readFileSync(path.join(ROOT, r), 'utf8')]));
  const beforeEdges = buildGraph(scoped, contents, index);

  const removed = [];
  const allowed = new Set();
  const reasons = { 'sector-ring': 0, 'project-atomic': 0 };
  for (const e of beforeEdges) {
    const [a, b] = e.split('\u0000');
    const reason = shouldRemove(a, b);
    if (reason) {
      removed.push({ a, b, reason });
      reasons[reason]++;
    } else {
      allowed.add(e);
    }
  }

  const adjacency = new Map(scopedList.map(r => [r, new Set()]));
  for (const e of allowed) {
    const [a, b] = e.split('\u0000');
    adjacency.get(a).add(b);
    adjacency.get(b).add(a);
  }

  const removedByNode = new Map();
  for (const { a, b } of removed) {
    if (!removedByNode.has(a)) removedByNode.set(a, new Set());
    if (!removedByNode.has(b)) removedByNode.set(b, new Set());
    removedByNode.get(a).add(b);
    removedByNode.get(b).add(a);
  }

  const before = metrics(scoped, beforeEdges);
  const after = metrics(scoped, allowed);
  const changed = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.join(ROOT, '.git', 'native-graph-refine-backups', timestamp);

  for (const src of removedByNode.keys()) {
    const original = contents.get(src);
    const { fm: originalFm, body: originalBody, nl } = splitFrontmatter(original);
    const removedNeighbors = removedByNode.get(src);
    let fm = injectRefinementField(originalFm, removedNeighbors, nl);
    let body = transformBody(originalBody, src, scoped, index, removedNeighbors);
    const rewritten = fm + body + neighborhood(src, adjacency, nl);
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

  const result = {
    mode: APPLY ? 'APPLY' : 'DRY RUN',
    before,
    after,
    removed_edges: removed.length,
    removed_sector_ring_edges: reasons['sector-ring'],
    removed_project_atomic_edges: reasons['project-atomic'],
    changed_files: changed.length,
    changed,
  };

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  const md = [
    '# Native Graph Refinement', '',
    `Mode: **${result.mode}**`, '',
    `- Before edges: **${before.edges}**`,
    `- After edges: **${after.edges}**`,
    `- Before average degree: **${before.average_degree.toFixed(2)}**`,
    `- After average degree: **${after.average_degree.toFixed(2)}**`,
    `- Before locality: **${(before.locality * 100).toFixed(1)}%**`,
    `- After locality: **${(after.locality * 100).toFixed(1)}%**`,
    `- Removed sector-ring edges: **${reasons['sector-ring']}**`,
    `- Removed project-to-atomic edges: **${reasons['project-atomic']}**`,
    `- Changed files: **${changed.length}**`, '',
    '## Boundary', '',
    'This pass removes only two topology artifacts: old sector-to-sector ring edges and project-to-atomic springs. It adds no decorative edges and preserves every removed relationship as a plain non-visual repository path on both endpoints.', '',
    '## Changed files',
    ...changed.map(x => `- ${x}`), ''
  ].join('\n');
  fs.writeFileSync(REPORT, md, 'utf8');
  fs.writeFileSync(JSON_REPORT, JSON.stringify(result, null, 2) + '\n', 'utf8');

  console.log('');
  console.log(`Native Graph Refinement (${result.mode})`);
  console.log('--------------------------------');
  console.log(`Before: nodes=${before.nodes} edges=${before.edges} avg_degree=${before.average_degree.toFixed(2)} locality=${(before.locality * 100).toFixed(1)}%`);
  console.log(`After:  nodes=${after.nodes} edges=${after.edges} avg_degree=${after.average_degree.toFixed(2)} locality=${(after.locality * 100).toFixed(1)}%`);
  console.log(`Sector-ring edges removed: ${reasons['sector-ring']}`);
  console.log(`Project-atomic edges removed: ${reasons['project-atomic']}`);
  console.log(`Changed files: ${changed.length}`);
  if (APPLY) console.log(`Backup: ${path.relative(ROOT, backupRoot)}`);
  console.log('Report: reports\\NATIVE_GRAPH_REFINEMENT.md');
  console.log('');
}

main();
