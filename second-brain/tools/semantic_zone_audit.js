const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'reports', 'SEMANTIC_ZONE_AUDIT.md');
const JSON_REPORT = path.join(ROOT, 'reports', 'SEMANTIC_ZONE_AUDIT.json');
const LINK_RE = /\[\[([^\]]+)\]\]/g;
const IGNORE = new Set(['.git', '.obsidian', 'archive', 'templates', 'templates-v2', 'node_modules']);

function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }
function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const r = rel(full);
    if (ent.isDirectory()) {
      if (!r.split('/').some(x => IGNORE.has(x))) walk(full, out);
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
}
function links(text) {
  const out = [];
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(text))) {
    const t = m[1].split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
    if (t) out.push(t);
  }
  return out;
}
function district(r) {
  if (r.startsWith('mesh/families/')) return 'families';
  if (r.startsWith('mesh/lanes/')) return 'lanes';
  if (r.startsWith('mesh/corridors/')) return 'corridors';
  if (r.startsWith('mesh/')) return r.split('/')[1] || 'mesh';
  if (r.startsWith('atlas/projects/packets/') || r.startsWith('atlas/projects/')) return 'projects';
  if (r.startsWith('cognitive-os/')) return 'control';
  if (r.startsWith('risk/')) return 'risk';
  if (r.startsWith('assurance/')) return 'assurance';
  if (r.startsWith('knowledge/')) return 'knowledge';
  if (r.startsWith('planning/')) return 'planning';
  if (r.startsWith('decision-engine/')) return 'decision';
  if (r.startsWith('incident/')) return 'incident';
  return r.split('/')[0] || 'other';
}

function main() {
  const files = walk(ROOT);
  const exact = new Map();
  const stems = new Map();
  for (const f of files) {
    const r = rel(f);
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

  const selected = files.map(rel).filter(r =>
    r.startsWith('mesh/families/') ||
    r.startsWith('mesh/lanes/') ||
    r.startsWith('mesh/corridors/') ||
    r.startsWith('atlas/projects/packets/SALRYN/') ||
    r.startsWith('atlas/projects/packets/TALIBON/')
  ).sort();

  const unresolved = [];
  const nodes = [];
  for (const r of selected) {
    const text = fs.readFileSync(path.join(ROOT, ...r.split('/')), 'utf8');
    const resolved = [];
    const bad = [];
    for (const target of links(text)) {
      const dst = resolve(target);
      if (dst) resolved.push(dst);
      else {
        bad.push(target);
        unresolved.push({ source: r, target });
      }
    }
    const domains = [...new Set(resolved.map(district).filter(x => !['families', 'lanes', 'corridors', 'projects', 'control'].includes(x)))].sort();
    nodes.push({ path: r, resolved, links: resolved.length, unresolved: bad, domains });
  }

  const byPath = new Map(nodes.map(x => [x.path, x]));
  const families = nodes.filter(x => x.path.startsWith('mesh/families/') && !x.path.endsWith('ENGINEERING_COGNITION_MAP.md'));
  const lanes = nodes.filter(x => x.path.startsWith('mesh/lanes/'));
  const corridors = nodes.filter(x => x.path.startsWith('mesh/corridors/'));
  const salryn = nodes.filter(x => x.path.startsWith('atlas/projects/packets/SALRYN/'));
  const talibon = nodes.filter(x => x.path.startsWith('atlas/projects/packets/TALIBON/'));

  const laneDetails = lanes.map(lane => ({
    path: lane.path,
    links: lane.links,
    domains: lane.domains,
    family: lane.path.split('/')[2] || 'unknown'
  }));

  const familyDetails = families.map(family => {
    const laneRefs = family.resolved.filter(x => x.startsWith('mesh/lanes/'));
    const covered = new Set();
    for (const laneRef of laneRefs) {
      const lane = byPath.get(laneRef);
      if (lane) for (const d of lane.domains) covered.add(d);
    }
    return {
      path: family.path,
      lanes: laneRefs.length,
      lane_refs: laneRefs,
      covered_domains: [...covered].sort(),
      direct_links: family.links
    };
  });

  const warnings = [];
  if (lanes.length < 20) warnings.push(`Only ${lanes.length} semantic lanes exist; the V3.2 hierarchy is too shallow.`);
  for (const lane of laneDetails) {
    if (lane.links < 3) warnings.push(`${lane.path}: lane has fewer than three resolved relationships.`);
    if (lane.domains.length < 1) warnings.push(`${lane.path}: lane does not reach an engineering district.`);
  }
  for (const family of familyDetails) {
    if (family.lanes < 2) warnings.push(`${family.path}: family has fewer than two semantic lanes.`);
    if (family.covered_domains.length < 2) warnings.push(`${family.path}: its lanes cover fewer than two engineering districts.`);
  }
  for (const corridor of corridors) {
    if (corridor.domains.length < 2) warnings.push(`${corridor.path}: bridge corridor reaches fewer than two engineering districts.`);
  }
  if (salryn.length < 8) warnings.push('Salryn cognition packet is too shallow for a project integration exemplar.');
  if (talibon.length < 8) warnings.push('Talibon cognition packet is too shallow for a project integration exemplar.');
  if (unresolved.length) warnings.push(`${unresolved.length} unresolved links originate from zoning/lane/project packet files.`);

  const result = {
    verdict: warnings.length ? 'REVIEW' : 'LANE_HIERARCHY_PLAUSIBLE',
    family_nodes: families.length,
    lane_nodes: lanes.length,
    corridor_nodes: corridors.length,
    salryn_packet_nodes: salryn.length,
    talibon_packet_nodes: talibon.length,
    unresolved_links: unresolved.length,
    families: familyDetails,
    lanes: laneDetails,
    corridors: corridors.map(x => ({ path: x.path, links: x.links, domains: x.domains })),
    projects: { SALRYN: salryn.map(x => x.path), TALIBON: talibon.map(x => x.path) },
    unresolved,
    warnings
  };

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(JSON_REPORT, JSON.stringify(result, null, 2) + '\n', 'utf8');
  const md = [
    '# Semantic Zoning and Lane Audit', '',
    `- Verdict: **${result.verdict}**`,
    `- Macro family nodes: **${families.length}**`,
    `- Semantic lane nodes: **${lanes.length}**`,
    `- Bridge corridor nodes: **${corridors.length}**`,
    `- Salryn packet nodes: **${salryn.length}**`,
    `- Talibon packet nodes: **${talibon.length}**`,
    `- Unresolved zoning/lane/packet links: **${unresolved.length}**`, '',
    '## Families',
    ...familyDetails.map(x => `- ${x.path} — ${x.lanes} lanes; covered districts: ${x.covered_domains.join(', ') || 'none'}`), '',
    '## Lanes',
    ...laneDetails.map(x => `- ${x.path} — ${x.links} resolved links; districts: ${x.domains.join(', ') || 'none'}`), '',
    '## Corridors',
    ...corridors.map(x => `- ${x.path} — ${x.links} resolved links; districts: ${x.domains.join(', ') || 'none'}`), '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x}`) : ['- None']), ''
  ].join('\n');
  fs.writeFileSync(REPORT, md, 'utf8');

  console.log('');
  console.log('Semantic Zoning and Lane Audit');
  console.log('-------------------------------');
  console.log(`Verdict: ${result.verdict}`);
  console.log(`Families: ${families.length}`);
  console.log(`Lanes: ${lanes.length}`);
  console.log(`Corridors: ${corridors.length}`);
  console.log(`Salryn packet nodes: ${salryn.length}`);
  console.log(`Talibon packet nodes: ${talibon.length}`);
  console.log(`Unresolved zoning/lane/packet links: ${unresolved.length}`);
  console.log('');
  console.log('Report: reports\\SEMANTIC_ZONE_AUDIT.md');
  console.log('JSON: reports\\SEMANTIC_ZONE_AUDIT.json');
}

main();
