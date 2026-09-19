const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'reports', 'TOPOLOGY_PRESSURE_AUDIT.md');
const JSON_REPORT = path.join(ROOT, 'reports', 'TOPOLOGY_PRESSURE_AUDIT.json');
const IGNORE = new Set(['.git', '.obsidian', 'archive', 'templates', 'templates-v2', 'node_modules']);
const PREFIXES = ['mesh/', 'cognitive-os/', 'planning/', 'decision-engine/', 'assurance/', 'risk/', 'scenario/', 'incident/', 'knowledge/', 'truth/', 'atlas/projects/'];
const LINK_RE = /\[\[([^\]]+)\]\]/g;
const FENCE_RE = /```[\s\S]*?```/g;

const MACRO = {
  architecture: 'design', planning: 'design', product: 'design', api: 'design', frontend: 'design', quality: 'design',
  decision: 'governance', governance: 'governance', documentation: 'governance', delivery: 'governance', standards: 'governance', commercial: 'governance',
  security: 'security', appsec: 'security', identity: 'security', privacy: 'security', network: 'security', 'supply-chain': 'security', host: 'security', vulnerability: 'security', crypto: 'security',
  data: 'data', database: 'data',
  operations: 'platform', reliability: 'platform', sre: 'platform', deployment: 'platform', cicd: 'platform', performance: 'platform', distributed: 'platform', container: 'platform', cloud: 'platform',
  testing: 'assurance', incident: 'assurance', assurance: 'assurance',
  ai: 'ai', projects: 'projects', control: 'control', truth: 'governance', risk: 'security', scenario: 'platform', knowledge: 'governance', other: 'other'
};

function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }
function ignored(r) { return r.split('/').some(p => IGNORE.has(p)); }
function scoped(r) { return PREFIXES.some(p => r.startsWith(p)); }
function avg(a) { return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0; }
function pct(x) { return `${(x * 100).toFixed(1)}%`; }
function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const r = rel(full);
    if (ent.isDirectory()) {
      if (!ignored(r)) walk(full, out);
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md') && !ignored(r)) out.push(full);
  }
  return out;
}
function splitFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (!lines.length || lines[0].trim() !== '---') return { frontmatter: '', body: text };
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') return { frontmatter: lines.slice(0, i + 1).join('\n'), body: lines.slice(i + 1).join('\n') };
  }
  return { frontmatter: '', body: text };
}
function targets(text) {
  const clean = text.replace(FENCE_RE, '');
  const out = [];
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(clean))) {
    const t = m[1].split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
    if (t) out.push(t);
  }
  return out;
}
function classify(r) {
  if (r.startsWith('mesh/families/')) return { role: 'family', domain: 'semantic-family', macro: 'integration' };
  if (r.startsWith('mesh/lanes/')) return { role: 'lane', domain: 'semantic-lane', macro: 'integration' };
  if (r.startsWith('mesh/corridors/')) return { role: 'corridor', domain: 'semantic-corridor', macro: 'integration' };
  if (r.startsWith('atlas/projects/packets/')) return { role: 'project-packet', domain: 'project-packet', macro: 'integration' };
  if (r.startsWith('mesh/')) {
    const domain = r.split('/')[1] || 'other';
    return { role: 'core', domain, macro: MACRO[domain] || domain };
  }
  if (r.startsWith('atlas/projects/')) return { role: 'core', domain: 'projects', macro: 'projects' };
  if (r.startsWith('planning/')) return { role: 'core', domain: 'planning', macro: 'design' };
  if (r.startsWith('decision-engine/')) return { role: 'core', domain: 'decision', macro: 'governance' };
  if (r.startsWith('assurance/')) return { role: 'core', domain: 'assurance', macro: 'assurance' };
  if (r.startsWith('risk/')) return { role: 'core', domain: 'risk', macro: 'security' };
  if (r.startsWith('scenario/')) return { role: 'core', domain: 'scenario', macro: 'platform' };
  if (r.startsWith('incident/')) return { role: 'core', domain: 'incident', macro: 'assurance' };
  if (r.startsWith('knowledge/')) return { role: 'core', domain: 'knowledge', macro: 'governance' };
  if (r.startsWith('truth/')) return { role: 'core', domain: 'truth', macro: 'governance' };
  if (r.startsWith('cognitive-os/')) return { role: 'core', domain: 'control', macro: 'control' };
  return { role: 'core', domain: 'other', macro: 'other' };
}
function clustering(node, adj) {
  const nbrs = [...(adj.get(node) || [])];
  const k = nbrs.length;
  if (k < 2) return 0;
  let links = 0;
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) if ((adj.get(nbrs[i]) || new Set()).has(nbrs[j])) links++;
  return links / (k * (k - 1) / 2);
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
  function resolve(t) {
    if (exact.has(t)) return exact.get(t);
    if (!/\.md$/i.test(t) && exact.has(`${t}.md`)) return exact.get(`${t}.md`);
    if (!t.includes('/')) {
      const matches = stems.get(path.basename(t, '.md')) || [];
      if (matches.length === 1) return matches[0];
    }
    return null;
  }

  const nodes = notes.map(rel).filter(scoped).sort();
  const meta = new Map(nodes.map(r => [r, classify(r)]));
  const edgeMap = new Map();
  const unresolved = [];
  for (const src of nodes) {
    const text = fs.readFileSync(path.join(ROOT, ...src.split('/')), 'utf8');
    const { frontmatter, body } = splitFrontmatter(text);
    for (const [channel, chunk] of [['frontmatter', frontmatter], ['body', body]]) {
      for (const target of targets(chunk)) {
        const dst = resolve(target);
        if (!dst) {
          if (meta.get(src).role !== 'core') unresolved.push({ source: src, target, channel });
          continue;
        }
        if (!meta.has(dst) || dst === src) continue;
        const [a, b] = [src, dst].sort();
        edgeMap.set(`${a}\t${b}`, true);
      }
    }
  }

  const edges = [...edgeMap.keys()].map(k => k.split('\t'));
  const adj = new Map(nodes.map(n => [n, new Set()]));
  for (const [a, b] of edges) { adj.get(a).add(b); adj.get(b).add(a); }

  const coreNodes = nodes.filter(n => meta.get(n).role === 'core');
  const integrationNodes = nodes.filter(n => meta.get(n).role !== 'core');
  const coreSet = new Set(coreNodes);
  const integrationSet = new Set(integrationNodes);
  const coreEdges = edges.filter(([a, b]) => coreSet.has(a) && coreSet.has(b));
  const integrationCoreEdges = edges.filter(([a, b]) => (integrationSet.has(a) && coreSet.has(b)) || (coreSet.has(a) && integrationSet.has(b)));
  const integrationInternalEdges = edges.filter(([a, b]) => integrationSet.has(a) && integrationSet.has(b));
  const integrationTouchEdges = edges.filter(([a, b]) => integrationSet.has(a) || integrationSet.has(b));

  let coreDistrictIntra = 0;
  let coreMacroIntra = 0;
  for (const [a, b] of coreEdges) {
    const ma = meta.get(a), mb = meta.get(b);
    if (ma.domain === mb.domain) coreDistrictIntra++;
    if (ma.macro === mb.macro) coreMacroIntra++;
  }
  const coreAdj = new Map(coreNodes.map(n => [n, new Set()]));
  for (const [a, b] of coreEdges) { coreAdj.get(a).add(b); coreAdj.get(b).add(a); }

  const fullAvgDegree = nodes.length ? (2 * edges.length) / nodes.length : 0;
  const coreAvgDegree = coreNodes.length ? (2 * coreEdges.length) / coreNodes.length : 0;
  const coreDistrictLocality = coreEdges.length ? coreDistrictIntra / coreEdges.length : 0;
  const coreMacroLocality = coreEdges.length ? coreMacroIntra / coreEdges.length : 0;
  const coreClustering = avg(coreNodes.map(n => clustering(n, coreAdj)));
  const pressureRatio = edges.length ? integrationTouchEdges.length / edges.length : 0;

  const pressureNodes = integrationNodes.map(n => {
    const neighbors = [...adj.get(n)];
    const coreNeighbors = neighbors.filter(x => coreSet.has(x));
    const domains = [...new Set(coreNeighbors.map(x => meta.get(x).domain))].sort();
    const macros = [...new Set(coreNeighbors.map(x => meta.get(x).macro))].sort();
    return {
      path: n,
      role: meta.get(n).role,
      degree: neighbors.length,
      core_neighbors: coreNeighbors.length,
      integration_neighbors: neighbors.length - coreNeighbors.length,
      core_domains: domains,
      core_macros: macros,
      domain_spread: domains.length,
      macro_spread: macros.length
    };
  }).sort((a, b) => b.macro_spread - a.macro_spread || b.core_neighbors - a.core_neighbors || b.degree - a.degree || a.path.localeCompare(b.path));

  const roles = ['family', 'lane', 'corridor', 'project-packet'];
  const roleStats = roles.map(role => {
    const members = pressureNodes.filter(x => x.role === role);
    return {
      role,
      nodes: members.length,
      avg_degree: avg(members.map(x => x.degree)),
      avg_core_neighbors: avg(members.map(x => x.core_neighbors)),
      avg_domain_spread: avg(members.map(x => x.domain_spread)),
      avg_macro_spread: avg(members.map(x => x.macro_spread)),
      max_macro_spread: members.length ? Math.max(...members.map(x => x.macro_spread)) : 0
    };
  });

  const warnings = [];
  if (coreAvgDegree > 9.5) warnings.push('Core cognition graph remains highly connected even after integration-layer nodes are excluded.');
  if (coreMacroLocality < 0.68) warnings.push('Core macro locality remains weak after integration-layer nodes are excluded.');
  if (coreClustering < 0.20) warnings.push('Core clustering is low; districts may still form branches instead of constellations.');
  if (pressureRatio > 0.14) warnings.push('Integration-layer edges exceed 14% of physical graph edges and may visibly pull native Obsidian districts together.');
  const overWide = pressureNodes.filter(x => x.macro_spread > 4);
  if (overWide.length) warnings.push(`${overWide.length} integration nodes touch more than four core macro families and may behave as visual black holes.`);
  const lanes = pressureNodes.filter(x => x.role === 'lane');
  const badLanes = lanes.filter(x => x.core_neighbors < 2 || x.macro_spread > 2);
  if (badLanes.length) warnings.push(`${badLanes.length} semantic lanes are either under-anchored or too broad.`);
  if (unresolved.length) warnings.push(`${unresolved.length} unresolved links originate from integration-layer nodes.`);

  const verdict = warnings.length === 0 ? 'PRESSURE_PLAUSIBLE' : (pressureRatio > 0.14 || overWide.length > 3 ? 'INTEGRATION_PRESSURE_HIGH' : 'PRESSURE_REVIEW');
  const result = {
    verdict,
    warnings,
    full_graph: { nodes: nodes.length, edges: edges.length, average_degree: Number(fullAvgDegree.toFixed(4)) },
    core_graph: {
      nodes: coreNodes.length,
      edges: coreEdges.length,
      average_degree: Number(coreAvgDegree.toFixed(4)),
      district_locality: Number(coreDistrictLocality.toFixed(6)),
      macro_locality: Number(coreMacroLocality.toFixed(6)),
      average_clustering: Number(coreClustering.toFixed(6))
    },
    integration_layer: {
      nodes: integrationNodes.length,
      core_edges: integrationCoreEdges.length,
      internal_edges: integrationInternalEdges.length,
      physical_edges_touched: integrationTouchEdges.length,
      physical_edge_pressure_ratio: Number(pressureRatio.toFixed(6))
    },
    role_stats: roleStats,
    top_pressure_nodes: pressureNodes.slice(0, 60),
    unresolved
  };

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(JSON_REPORT, JSON.stringify(result, null, 2) + '\n', 'utf8');
  const md = [
    '# Native Graph Topology Pressure Audit', '',
    `- Verdict: **${verdict}**`,
    `- Full graph: **${nodes.length} nodes / ${edges.length} edges / ${fullAvgDegree.toFixed(2)} avg degree**`,
    `- Core graph: **${coreNodes.length} nodes / ${coreEdges.length} edges / ${coreAvgDegree.toFixed(2)} avg degree**`,
    `- Core district locality: **${pct(coreDistrictLocality)}**`,
    `- Core macro locality: **${pct(coreMacroLocality)}**`,
    `- Core clustering: **${coreClustering.toFixed(3)}**`,
    `- Integration nodes: **${integrationNodes.length}**`,
    `- Physical edges touched by integration layer: **${integrationTouchEdges.length} (${pct(pressureRatio)})**`,
    `- Unresolved integration links: **${unresolved.length}**`, '',
    '## Role pressure', '',
    '| Role | Nodes | Avg degree | Avg core neighbors | Avg domain spread | Avg macro spread | Max macro spread |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...roleStats.map(x => `| ${x.role} | ${x.nodes} | ${x.avg_degree.toFixed(2)} | ${x.avg_core_neighbors.toFixed(2)} | ${x.avg_domain_spread.toFixed(2)} | ${x.avg_macro_spread.toFixed(2)} | ${x.max_macro_spread} |`), '',
    '## Highest integration pressure',
    ...pressureNodes.slice(0, 30).map(x => `- ${x.path} — ${x.role}; degree ${x.degree}; core ${x.core_neighbors}; domains ${x.domain_spread}; macros ${x.macro_spread}`), '',
    '## Warnings', ...(warnings.length ? warnings.map(x => `- ${x}`) : ['- None']), ''
  ].join('\n');
  fs.writeFileSync(REPORT, md, 'utf8');

  console.log('');
  console.log('Native Graph Topology Pressure Audit');
  console.log('------------------------------------');
  console.log(`Verdict: ${verdict}`);
  console.log(`Full graph: ${nodes.length} nodes / ${edges.length} edges / avg ${fullAvgDegree.toFixed(2)}`);
  console.log(`Core graph: ${coreNodes.length} nodes / ${coreEdges.length} edges / avg ${coreAvgDegree.toFixed(2)}`);
  console.log(`Core district locality: ${pct(coreDistrictLocality)}`);
  console.log(`Core macro locality: ${pct(coreMacroLocality)}`);
  console.log(`Core clustering: ${coreClustering.toFixed(3)}`);
  console.log(`Integration nodes: ${integrationNodes.length}`);
  console.log(`Semantic lanes: ${lanes.length}`);
  console.log(`Integration edge pressure: ${integrationTouchEdges.length} edges (${pct(pressureRatio)})`);
  console.log(`Wide integration nodes (>4 macros): ${overWide.length}`);
  console.log(`Under/over-broad lanes: ${badLanes.length}`);
  console.log(`Unresolved integration links: ${unresolved.length}`);
  console.log('');
  console.log('Report: reports\\TOPOLOGY_PRESSURE_AUDIT.md');
  console.log('JSON: reports\\TOPOLOGY_PRESSURE_AUDIT.json');
}

main();
