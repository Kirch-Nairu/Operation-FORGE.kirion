const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PRESET_DIR = path.join(ROOT, 'obsidian-presets');
const REPORT_DIR = path.join(ROOT, 'reports');
const REPORT_MD = path.join(REPORT_DIR, 'GRAPH_PROFILE_AUDIT.md');
const REPORT_JSON = path.join(REPORT_DIR, 'GRAPH_PROFILE_AUDIT.json');

const FILES = {
  default: 'graph.json',
  research: 'graph.research-spread.json',
  atlas: 'graph.engineering-atlas.json',
  balanced: 'graph.balanced-atlas.json',
  dense: 'graph.dense-cognition.json',
  wide: 'graph.wide-systems.json'
};

const ALLOWED_VARIATION = new Set([
  'textFadeMultiplier',
  'nodeSizeMultiplier',
  'lineSizeMultiplier',
  'centerStrength',
  'repelStrength',
  'linkStrength',
  'linkDistance',
  'scale'
]);

function load(name) {
  const file = path.join(PRESET_DIR, FILES[name]);
  if (!fs.existsSync(file)) throw new Error(`Missing profile: ${FILES[name]}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])]));
  }
  return value;
}

function invariantProjection(config) {
  return stable(Object.fromEntries(
    Object.entries(config).filter(([key]) => !ALLOWED_VARIATION.has(key))
  ));
}

function same(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

function physics(config) {
  return {
    center: config.centerStrength,
    repel: config.repelStrength,
    link: config.linkStrength,
    distance: config.linkDistance,
    line: config.lineSizeMultiplier,
    node: config.nodeSizeMultiplier,
    text: config.textFadeMultiplier,
    scale: config.scale
  };
}

function main() {
  const profiles = Object.fromEntries(Object.keys(FILES).map(name => [name, load(name)]));
  const warnings = [];

  if (!same(profiles.default, profiles.research)) {
    warnings.push('graph.json is not byte-semantically equivalent to the research-spread profile.');
  }

  const referenceInvariant = invariantProjection(profiles.research);
  const compared = ['atlas', 'balanced', 'dense', 'wide'];
  for (const name of compared) {
    if (!same(referenceInvariant, invariantProjection(profiles[name]))) {
      warnings.push(`${name}: non-physics graph configuration differs from research-spread.`);
    }
  }

  for (const [name, config] of Object.entries(profiles)) {
    if (!Array.isArray(config.colorGroups) || !config.colorGroups.length) {
      warnings.push(`${name}: colorGroups missing or empty.`);
    }
    if (!config.search || typeof config.search !== 'string') {
      warnings.push(`${name}: graph search scope is missing.`);
    }
    for (const key of ['centerStrength', 'repelStrength', 'linkStrength', 'linkDistance']) {
      if (typeof config[key] !== 'number') warnings.push(`${name}: ${key} is not numeric.`);
    }
  }

  const result = {
    verdict: warnings.length ? 'REVIEW' : 'PROFILE_SET_PLAUSIBLE',
    default_profile: 'research',
    allowed_variation: [...ALLOWED_VARIATION],
    profiles: Object.fromEntries(Object.entries(profiles).map(([name, config]) => [name, physics(config)])),
    semantic_scope_equal: compared.every(name => same(referenceInvariant, invariantProjection(profiles[name]))),
    default_matches_research: same(profiles.default, profiles.research),
    warnings
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(result, null, 2) + '\n', 'utf8');

  const rows = Object.entries(result.profiles).map(([name, p]) =>
    `| ${name} | ${p.center} | ${p.repel} | ${p.link} | ${p.distance} | ${p.line} | ${p.node} | ${p.scale} |`
  );

  const md = [
    '# Native Graph Profile Audit', '',
    `- Verdict: **${result.verdict}**`,
    `- Default matches research-spread: **${result.default_matches_research}**`,
    `- Semantic/search/color configuration equal across profiles: **${result.semantic_scope_equal}**`, '',
    '| Profile | Center | Repel | Link | Distance | Line | Node | Scale |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...rows, '',
    '## Allowed profile differences', '',
    ...result.allowed_variation.map(x => `- ${x}`), '',
    '## Warnings', '',
    ...(warnings.length ? warnings.map(x => `- ${x}`) : ['- None']), ''
  ].join('\n');

  fs.writeFileSync(REPORT_MD, md, 'utf8');

  console.log('');
  console.log('Native Graph Profile Audit');
  console.log('--------------------------');
  console.log(`Verdict: ${result.verdict}`);
  console.log(`Default matches research: ${result.default_matches_research}`);
  console.log(`Semantic configuration equal: ${result.semantic_scope_equal}`);
  for (const [name, p] of Object.entries(result.profiles)) {
    console.log(`${name.padEnd(9)} center=${p.center} repel=${p.repel} link=${p.link} distance=${p.distance} line=${p.line} scale=${p.scale}`);
  }
  console.log('');
  console.log('Report: reports\\GRAPH_PROFILE_AUDIT.md');
  console.log('JSON: reports\\GRAPH_PROFILE_AUDIT.json');
}

main();
