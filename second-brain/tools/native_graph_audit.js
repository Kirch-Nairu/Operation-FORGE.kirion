const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'reports', 'NATIVE_GRAPH_AUDIT.md');
const JSON_REPORT = path.join(ROOT, 'reports', 'NATIVE_GRAPH_AUDIT.json');
const IGNORE_DIRS = new Set(['.git', '.obsidian', 'archive', 'templates', 'templates-v2']);
const GRAPH_PREFIXES = [
  'mesh/', 'cognitive-os/', 'planning/', 'decision-engine/', 'assurance/',
  'risk/', 'scenario/', 'incident/', 'knowledge/', 'truth/', 'atlas/projects/'
];
const CENTRAL = 'cognitive-os/CENTRAL_BRAIN.md';
const LINK_RE = /\[\[([^\]]+)\]\]/g;
const FENCE_RE = /```[\s\S]*?```/g;

function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }
function ignored(r) { return r.split('/').some(p => IGNORE_DIRS.has(p)); }
function graphScoped(r) { return GRAPH_PREFIXES.some(p => r.startsWith(p)); }

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
  const lines = text.split(/\r?\n/);
  if (!lines.length || lines[0].trim() !== '---') return { frontmatter: '', body: text };
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      return {
        frontmatter: lines.slice(0, i + 1).join('\n'),
        body: lines.slice(i + 1).join('\n')
      };
    }
  }
  return { frontmatter: '', body: text };
}

function targets(text) {
  const clean = text.replace(FENCE_RE, '');
  const result = [];
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(clean)) !== null) {
    let target = m[1].split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
    if (target) result.push(target);
  }
  return result;
}

function classify(r) {
  if (r === CENTRAL) return { kind: 'central', domain: 'central' };
  if (r.startsWith('cognitive-os/hubs/')) {
    const name = path.basename(r, '.md').toUpperCase();
    let domain = 'other';
    if (name.includes('ARCHITECTURE')) domain = 'architecture';
    else if (name.includes('SECURITY')) domain = 'security';
    else if (name.includes('DATA')) domain = 'data';
    else if (name.includes('PLATFORM')) domain = 'operations';
    else if (name.includes('ASSURANCE')) domain = 'assurance';
    else if (name.includes('DECISION')) domain = 'governance';
    else if (name.includes('AI')) domain = 'ai';
    else if (name.includes('PROJECT')) domain = 'projects';
    return { kind: 'sector', domain };
  }
  if (r.startsWith('atlas/projects/')) return { kind: 'project', domain: 'projects' };
  if (r.startsWith('cognitive-os/')) return { kind: 'core', domain: 'core' };
  for (const [prefix, domain] of [
    ['mesh/architecture/', 'architecture'], ['mesh/security/', 'security'], ['mesh/data/', 'data'],
    ['mesh/operations/', 'operations'], ['mesh/reliability/', 'reliability'], ['mesh/governance/', 'governance'],
    ['mesh/ai/', 'ai']
  ]) if (r.startsWith(prefix)) return { kind: 'atomic', domain };
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

function componentSizes(adj) {
  const seen = new Set();
  const sizes = [];
  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const q = [start];
    seen.add(start);
    let size = 0;
    while (q.length) {
      const cur = q.pop();
      size++;
      for (const nxt of adj.get(cur)) if (!seen.has(nxt)) { seen.add(nxt); q.push(nxt); }
    }
    sizes.push(size);
  }
  return sizes.sort((a, b) => b - a);
}

function main() {
  const notes = walk(ROOT);
  const exact = new Map();
  const stems = new Map();
  for (const file of notes) {
    const r = rel(file);
    exact.set(r, r);
    exact.set(r.replace(/\.md$/i, ''), r);
    const stem = path.basename(r, '.md');
    if (!stems.has(stem)) stems.set(stem, []);
    stems.get(stem).push(r);
  }
  function resolve(target) {
    if (exact.has(target)) return exact.get(target);
    if (!target.toLowerCase().endsWith('.md') && exact.has(target + '.md')) return exact.get(target + '.md');
    if (!target.includes('/')) {
      const stem = path.basename(target, '.md');
      const matches = stems.get(stem) || [];
      if (matches.length === 1) return matches[0];
    }
    return null;
  }

  const scoped = notes.map(rel).filter(graphScoped).sort();
  const nodes = new Map(scoped.map(r => [r, classify(r)]));
  const edgeChannels = new Map();
  const unresolved = [];

  for (const r of scoped) {
    const text = fs.readFileSync(path.join(ROOT, ...r.split('/')), 'utf8');
    const { frontmatter, body } = splitFrontmatter(text);
    for (const [channel, chunk] of [['frontmatter', frontmatter], ['body', body]]) {
      for (const target of targets(chunk)) {
        const resolved = resolve(target);
        if (!resolved) { unresolved.push({ source: r, target, channel }); continue; }
        if (!nodes.has(resolved) || resolved === r) continue;
        const [a, b] = [r, resolved].sort();
        const key = `${a}\t${b}`;
        if (!edgeChannels.has(key)) edgeChannels.set(key, new Set());
        edgeChannels.get(key).add(channel);
      }
    }
  }

  const adj = new Map(scoped.map(r => [r, new Set()]));
  for (const key of edgeChannels.keys()) {
    const [a, b] = key.split('\t');
    adj.get(a).add(b); adj.get(b).add(a);
  }

  const n = scoped.length, e = edgeChannels.size;
  const avgDegree = n ? (2 * e / n) : 0;
  const density = n > 1 ? e / (n * (n - 1) / 2) : 0;
  const degrees = new Map(scoped.map(r => [r, adj.get(r).size]));
  const crossDegree = new Map(scoped.map(r => [r, 0]));
  let bodyOnly = 0, fmOnly = 0, both = 0, intra = 0, cross = 0;

  for (const [key, channels] of edgeChannels.entries()) {
    const [a, b] = key.split('\t');
    if (channels.size === 1 && channels.has('body')) bodyOnly++;
    else if (channels.size === 1 && channels.has('frontmatter')) fmOnly++;
    else both++;
    if (nodes.get(a).domain === nodes.get(b).domain) intra++;
    else { cross++; crossDegree.set(a, crossDegree.get(a) + 1); crossDegree.set(b, crossDegree.get(b) + 1); }
  }

  const locality = e ? intra / e : 0;
  const comps = componentSizes(adj);
  const atomicCount = scoped.filter(r => nodes.get(r).kind === 'atomic').length;
  const crossHeavyAtomic = scoped
    .filter(r => nodes.get(r).kind === 'atomic' && crossDegree.get(r) > 1)
    .map(r => ({ path: r, degree: degrees.get(r), cross_degree: crossDegree.get(r), domain: nodes.get(r).domain }))
    .sort((a, b) => b.cross_degree - a.cross_degree || b.degree - a.degree || a.path.localeCompare(b.path));

  const topHubs = scoped
    .map(r => ({ path: r, degree: degrees.get(r), cross_degree: crossDegree.get(r), kind: nodes.get(r).kind, domain: nodes.get(r).domain }))
    .sort((a, b) => b.degree - a.degree || a.path.localeCompare(b.path))
    .slice(0, 25);

  const centralLeafEdges = adj.has(CENTRAL)
    ? [...adj.get(CENTRAL)].filter(r => ['atomic', 'project'].includes(nodes.get(r).kind)).sort()
    : [];

  const reasons = [];
  if (avgDegree > 8) reasons.push('average degree is high enough to collapse domain separation');
  if (locality < 0.65) reasons.push('cross-domain edges are too common relative to local-domain edges');
  if (crossHeavyAtomic.length > Math.max(4, Math.floor(atomicCount / 4))) reasons.push('too many atomic notes behave as cross-domain bridges');
  if (fmOnly > Math.max(5, Math.floor(e / 10))) reasons.push('frontmatter-only links materially influence native graph physics');
  const verdict = reasons.length ? 'OVERCONNECTED' : 'STRUCTURALLY PLAUSIBLE';

  const report = [
    '# Native Obsidian Graph Topology Audit', '',
    '> Node.js audit of the native Obsidian wiki-link topology. Read-only: no notes are rewritten.', '',
    `- Verdict: **${verdict}**`,
    `- Nodes: **${n}**`,
    `- Unique graph edges: **${e}**`,
    `- Average degree: **${avgDegree.toFixed(2)}**`,
    `- Graph density: **${(density * 100).toFixed(2)}%**`,
    `- Connected components: **${comps.length}**`,
    `- Largest component: **${comps[0] || 0}**`,
    `- Intra-domain edge locality: **${(locality * 100).toFixed(1)}%**`,
    `- Body-only edges: **${bodyOnly}**`,
    `- Frontmatter-only edges: **${fmOnly}**`,
    `- Body + frontmatter edges: **${both}**`,
    `- Cross-domain edges: **${cross}**`,
    `- Unresolved scoped links: **${unresolved.length}**`, '',
    '## Verdict reasons',
    ...(reasons.length ? reasons.map(x => `- ${x}`) : ['- None']), '',
    '## Highest-degree nodes',
    ...topHubs.map(x => `- ${x.path} — degree ${x.degree}, cross-domain ${x.cross_degree}, ${x.kind}/${x.domain}`), '',
    '## Atomic cross-domain bridge pressure',
    ...(crossHeavyAtomic.length ? crossHeavyAtomic.slice(0, 50).map(x => `- ${x.path} — degree ${x.degree}, cross-domain ${x.cross_degree}`) : ['- None']), '',
    '## Central Brain leaf edges',
    ...(centralLeafEdges.length ? centralLeafEdges.map(x => `- ${x}`) : ['- None']), ''
  ].join('\n');

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, report, 'utf8');
  const json = {
    verdict, reasons, nodes: n, edges: e,
    average_degree: Number(avgDegree.toFixed(4)), density: Number(density.toFixed(6)),
    components: comps.length, largest_component: comps[0] || 0,
    locality: Number(locality.toFixed(6)), body_only_edges: bodyOnly,
    frontmatter_only_edges: fmOnly, both_channel_edges: both,
    cross_domain_edges: cross, unresolved_scoped_links: unresolved.length,
    top_hubs: topHubs, cross_heavy_atomic: crossHeavyAtomic, central_leaf_edges: centralLeafEdges
  };
  fs.writeFileSync(JSON_REPORT, JSON.stringify(json, null, 2) + '\n', 'utf8');

  console.log('');
  console.log('Native Graph Audit (Node.js)');
  console.log('----------------------------');
  console.log(`Verdict: ${verdict}`);
  console.log(`Nodes: ${n}`);
  console.log(`Edges: ${e}`);
  console.log(`Average degree: ${avgDegree.toFixed(2)}`);
  console.log(`Density: ${(density * 100).toFixed(2)}%`);
  console.log(`Locality: ${(locality * 100).toFixed(1)}%`);
  console.log(`Frontmatter-only edges: ${fmOnly}`);
  console.log(`Cross-heavy atomic notes: ${crossHeavyAtomic.length}`);
  console.log(`Central Brain leaf edges: ${centralLeafEdges.length}`);
  console.log('');
  console.log('Report: reports\\NATIVE_GRAPH_AUDIT.md');
  console.log('JSON:   reports\\NATIVE_GRAPH_AUDIT.json');
  console.log('');
}

main();
