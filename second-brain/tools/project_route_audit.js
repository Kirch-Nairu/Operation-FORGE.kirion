const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'reports', 'PROJECT_ROUTE_AUDIT.md');
const JSON_REPORT = path.join(ROOT, 'reports', 'PROJECT_ROUTE_AUDIT.json');
const LINK_RE = /\[\[([^\]]+)\]\]/g;
const PROJECTS = ['SALRYN', 'TALIBON'];
const REQUIRED_FAMILIES = new Set([
  'product-delivery',
  'application-architecture',
  'security-trust',
  'quality-assurance',
  'resilience-systems',
  'platform-runtime',
  'governance-intelligence'
]);

function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }
function links(text) {
  const out = [];
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(text))) {
    const target = m[1].split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
    if (target) out.push(target);
  }
  return out;
}
function allMarkdown(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', '.obsidian', 'node_modules', 'archive'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) allMarkdown(full, out);
    else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
}

function main() {
  const files = allMarkdown(ROOT);
  const exact = new Map();
  for (const file of files) {
    const r = rel(file);
    exact.set(r, r);
    exact.set(r.replace(/\.md$/i, ''), r);
  }
  function resolve(t) {
    if (exact.has(t)) return exact.get(t);
    if (!/\.md$/i.test(t) && exact.has(`${t}.md`)) return exact.get(`${t}.md`);
    return null;
  }

  const projects = {};
  const warnings = [];
  const unresolved = [];

  for (const project of PROJECTS) {
    const dir = path.join(ROOT, 'atlas', 'projects', 'packets', project);
    const rootName = project === 'SALRYN' ? '00_SALRYN_COGNITION.md' : '00_TALIBON_COGNITION.md';
    const rootPath = `atlas/projects/packets/${project}/${rootName}`;
    const routeFiles = fs.readdirSync(dir)
      .filter(n => /_ROUTE\.md$/i.test(n))
      .sort()
      .map(n => `atlas/projects/packets/${project}/${n}`);

    const routeStats = [];
    const familyCoverage = new Set();
    for (const route of routeFiles) {
      const text = fs.readFileSync(path.join(ROOT, ...route.split('/')), 'utf8');
      const rawLinks = links(text);
      const resolved = [];
      const bad = [];
      for (const target of rawLinks) {
        const dst = resolve(target);
        if (dst) resolved.push(dst);
        else {
          bad.push(target);
          unresolved.push({ project, source: route, target });
        }
      }
      const laneLinks = resolved.filter(x => x.startsWith('mesh/lanes/'));
      const packetLinks = resolved.filter(x => x.startsWith(`atlas/projects/packets/${project}/`) && x !== route && x !== rootPath);
      const rootLinks = resolved.filter(x => x === rootPath);
      for (const lane of laneLinks) {
        const parts = lane.split('/');
        if (parts[2]) familyCoverage.add(parts[2]);
      }
      if (laneLinks.length < 2) warnings.push(`${route}: fewer than two lane entry points.`);
      if (laneLinks.length > 4) warnings.push(`${route}: more than four lane entry points; route may become a visual bridge black hole.`);
      if (packetLinks.length < 1) warnings.push(`${route}: no project evidence packet links.`);
      if (rootLinks.length !== 1) warnings.push(`${route}: must link exactly once to ${rootPath}.`);
      routeStats.push({ path: route, lane_links: laneLinks, packet_links: packetLinks, unresolved: bad });
    }

    const rootText = fs.readFileSync(path.join(ROOT, ...rootPath.split('/')), 'utf8');
    const rootResolved = links(rootText).map(resolve).filter(Boolean);
    const rootRouteLinks = rootResolved.filter(x => /_ROUTE\.md$/i.test(x));
    const legacyDirect = rootResolved.filter(x => x.startsWith(`atlas/projects/packets/${project}/`) && x !== rootPath && !/_ROUTE\.md$/i.test(x));

    if (routeFiles.length < 5) warnings.push(`${project}: fewer than five project route nodes.`);
    if (rootRouteLinks.length !== routeFiles.length) warnings.push(`${project}: project root does not expose every route node.`);
    if (legacyDirect.length) warnings.push(`${project}: project root still directly links ${legacyDirect.length} non-route packet nodes.`);

    const missingFamilies = [...REQUIRED_FAMILIES].filter(x => !familyCoverage.has(x));
    if (missingFamilies.length) warnings.push(`${project}: route layer does not reach families: ${missingFamilies.join(', ')}.`);

    projects[project] = {
      routes: routeStats,
      route_count: routeFiles.length,
      root_route_links: rootRouteLinks.length,
      legacy_direct_packet_links: legacyDirect,
      family_coverage: [...familyCoverage].sort(),
      missing_families: missingFamilies
    };
  }

  if (unresolved.length) warnings.push(`${unresolved.length} unresolved links originate from project route notes.`);

  const result = {
    verdict: warnings.length ? 'ROUTE_REVIEW' : 'PROJECT_ROUTES_PLAUSIBLE',
    projects,
    unresolved,
    warnings
  };

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(JSON_REPORT, JSON.stringify(result, null, 2) + '\n', 'utf8');
  const md = [
    '# Project Route Audit', '',
    `- Verdict: **${result.verdict}**`,
    `- Unresolved route links: **${unresolved.length}**`, '',
    ...PROJECTS.flatMap(project => {
      const p = projects[project];
      return [
        `## ${project}`, '',
        `- Route nodes: **${p.route_count}**`,
        `- Root route links: **${p.root_route_links}**`,
        `- Legacy direct packet links from root: **${p.legacy_direct_packet_links.length}**`,
        `- Lane-family coverage: **${p.family_coverage.join(', ')}**`,
        `- Missing families: **${p.missing_families.join(', ') || 'none'}**`, '',
        ...p.routes.map(r => `- ${r.path} — ${r.lane_links.length} lanes / ${r.packet_links.length} project evidence packets`), ''
      ];
    }),
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x}`) : ['- None']), ''
  ].join('\n');
  fs.writeFileSync(REPORT, md, 'utf8');

  console.log('');
  console.log('Project Route Audit');
  console.log('-------------------');
  console.log(`Verdict: ${result.verdict}`);
  for (const project of PROJECTS) {
    const p = projects[project];
    console.log(`${project}: ${p.route_count} routes / ${p.family_coverage.length} lane families / ${p.legacy_direct_packet_links.length} legacy direct root links`);
  }
  console.log(`Unresolved route links: ${unresolved.length}`);
  console.log('');
  console.log('Report: reports\\PROJECT_ROUTE_AUDIT.md');
  console.log('JSON: reports\\PROJECT_ROUTE_AUDIT.json');
}

main();
