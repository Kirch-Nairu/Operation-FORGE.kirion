const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'reports', 'LANE_OPERABILITY_AUDIT.md');
const JSON_REPORT = path.join(ROOT, 'reports', 'LANE_OPERABILITY_AUDIT.json');
const LINK_RE = /\[\[([^\]]+)\]\]/g;
const FAMILY_ROOT = path.join(ROOT, 'mesh', 'families');
const LANE_ROOT = path.join(ROOT, 'mesh', 'lanes');
const EXPECTED_FAMILIES = new Set([
  'product-delivery',
  'application-architecture',
  'security-trust',
  'quality-assurance',
  'resilience-systems',
  'platform-runtime',
  'governance-intelligence'
]);

function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }
function read(p) { return fs.readFileSync(p, 'utf8'); }
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
function frontmatter(text) {
  if (!text.startsWith('---')) return {};
  const end = text.indexOf('\n---', 3);
  if (end < 0) return {};
  const body = text.slice(3, end).split(/\r?\n/);
  const out = {};
  for (const line of body) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}
function walkMarkdown(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMarkdown(full, out);
    else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
}
function allMarkdown(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', '.obsidian', 'archive', 'node_modules', 'templates', 'templates-v2'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) allMarkdown(full, out);
    else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
}

function main() {
  const notes = allMarkdown(ROOT);
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
    if (!/\.md$/i.test(target) && exact.has(`${target}.md`)) return exact.get(`${target}.md`);
    if (!target.includes('/')) {
      const matches = stems.get(path.basename(target, '.md')) || [];
      if (matches.length === 1) return matches[0];
    }
    return null;
  }

  const laneFiles = walkMarkdown(LANE_ROOT).sort();
  const familyFiles = walkMarkdown(FAMILY_ROOT)
    .filter(f => path.basename(f) !== 'ENGINEERING_COGNITION_MAP.md')
    .sort();
  const warnings = [];
  const unresolved = [];
  const lanes = [];
  const familySet = new Set();

  for (const file of laneFiles) {
    const r = rel(file);
    const text = read(file);
    const fm = frontmatter(text);
    const folderFamily = r.split('/')[2] || 'unknown';
    familySet.add(folderFamily);
    const rawLinks = links(text);
    const resolved = [];
    const bad = [];
    for (const target of rawLinks) {
      const dst = resolve(target);
      if (dst) resolved.push(dst);
      else {
        bad.push(target);
        unresolved.push({ source: r, target });
      }
    }

    const parentFamilies = resolved.filter(x => x.startsWith('mesh/families/'));
    const siblingLanes = resolved.filter(x => x.startsWith('mesh/lanes/'));
    const coreAnchors = resolved.filter(x =>
      !x.startsWith('mesh/families/') &&
      !x.startsWith('mesh/lanes/') &&
      !x.startsWith('mesh/corridors/') &&
      !x.startsWith('atlas/projects/packets/')
    );

    if (fm.type !== 'semantic-lane') warnings.push(`${r}: frontmatter type is '${fm.type || 'missing'}', expected semantic-lane.`);
    if (fm.family !== folderFamily) warnings.push(`${r}: frontmatter family '${fm.family || 'missing'}' does not match folder '${folderFamily}'.`);
    if (fm.authority !== 'navigation') warnings.push(`${r}: lane authority must remain navigation.`);
    if (parentFamilies.length !== 1) warnings.push(`${r}: expected exactly one parent family link; found ${parentFamilies.length}.`);
    if (siblingLanes.length) warnings.push(`${r}: directly links ${siblingLanes.length} sibling lane(s); lane rings are prohibited.`);
    if (coreAnchors.length < 3) warnings.push(`${r}: only ${coreAnchors.length} core anchors; lane is too weak to form a useful subdistrict.`);
    if (coreAnchors.length > 5) warnings.push(`${r}: ${coreAnchors.length} core anchors; lane may become a local visual black hole.`);
    if (bad.length) warnings.push(`${r}: ${bad.length} unresolved link(s).`);

    lanes.push({
      path: r,
      family: folderFamily,
      core_anchors: coreAnchors,
      core_anchor_count: coreAnchors.length,
      parent_family_links: parentFamilies,
      sibling_lane_links: siblingLanes,
      unresolved: bad
    });
  }

  for (const expected of EXPECTED_FAMILIES) {
    if (!familySet.has(expected)) warnings.push(`Missing semantic lane family folder: ${expected}.`);
  }
  for (const actual of familySet) {
    if (!EXPECTED_FAMILIES.has(actual)) warnings.push(`Unexpected semantic lane family folder: ${actual}.`);
  }

  const families = [];
  for (const file of familyFiles) {
    const r = rel(file);
    const text = read(file);
    const resolved = links(text).map(resolve).filter(Boolean);
    const laneLinks = resolved.filter(x => x.startsWith('mesh/lanes/'));
    const corridorLinks = resolved.filter(x => x.startsWith('mesh/corridors/'));
    const directDomainBypass = resolved.filter(x =>
      x.startsWith('mesh/') &&
      !x.startsWith('mesh/lanes/') &&
      !x.startsWith('mesh/corridors/') &&
      !x.startsWith('mesh/families/')
    );

    if (laneLinks.length < 2) warnings.push(`${r}: fewer than two semantic lane links.`);
    if (directDomainBypass.length) warnings.push(`${r}: directly links ${directDomainBypass.length} domain note(s), bypassing the lane hierarchy.`);

    families.push({
      path: r,
      lane_links: laneLinks,
      lane_count: laneLinks.length,
      corridor_links: corridorLinks,
      direct_domain_bypass: directDomainBypass
    });
  }

  const avgAnchors = lanes.length ? lanes.reduce((s, x) => s + x.core_anchor_count, 0) / lanes.length : 0;
  if (laneFiles.length < 20) warnings.push(`Only ${laneFiles.length} semantic lanes exist; hierarchy is too shallow for V3.2.`);
  if (unresolved.length) warnings.push(`${unresolved.length} unresolved links originate from semantic lanes.`);

  const result = {
    verdict: warnings.length ? 'LANE_OPERABILITY_REVIEW' : 'LANES_OPERABLE',
    lane_nodes: lanes.length,
    family_nodes: families.length,
    average_core_anchors_per_lane: Number(avgAnchors.toFixed(2)),
    unresolved_lane_links: unresolved.length,
    lanes,
    families,
    unresolved,
    warnings
  };

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(JSON_REPORT, JSON.stringify(result, null, 2) + '\n', 'utf8');
  const md = [
    '# Lane Operability Audit', '',
    `- Verdict: **${result.verdict}**`,
    `- Semantic lanes: **${result.lane_nodes}**`,
    `- Macro families: **${result.family_nodes}**`,
    `- Average core anchors per lane: **${result.average_core_anchors_per_lane.toFixed(2)}**`,
    `- Unresolved lane links: **${result.unresolved_lane_links}**`, '',
    '## Family hierarchy',
    ...families.map(f => `- ${f.path} — ${f.lane_count} lanes; ${f.direct_domain_bypass.length} direct domain bypasses`), '',
    '## Lanes',
    ...lanes.map(l => `- ${l.path} — ${l.core_anchor_count} core anchors; sibling-lane links: ${l.sibling_lane_links.length}`), '',
    '## Warnings',
    ...(warnings.length ? warnings.map(w => `- ${w}`) : ['- None']), ''
  ].join('\n');
  fs.writeFileSync(REPORT, md, 'utf8');

  console.log('');
  console.log('Lane Operability Audit');
  console.log('----------------------');
  console.log(`Verdict: ${result.verdict}`);
  console.log(`Lanes: ${result.lane_nodes}`);
  console.log(`Families: ${result.family_nodes}`);
  console.log(`Average core anchors/lane: ${result.average_core_anchors_per_lane.toFixed(2)}`);
  console.log(`Unresolved lane links: ${result.unresolved_lane_links}`);
  console.log('');
  console.log('Report: reports\\LANE_OPERABILITY_AUDIT.md');
  console.log('JSON: reports\\LANE_OPERABILITY_AUDIT.json');
}

main();
