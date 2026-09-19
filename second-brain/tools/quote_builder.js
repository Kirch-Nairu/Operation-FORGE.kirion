const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}
function has(name) { return process.argv.includes(name); }
function slug(s) { return String(s || 'quote').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function money(n, currency) { return `${currency} ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function pct(v) { return Number(v || 0) / 100; }
function assertNumber(v, name) { if (!Number.isFinite(Number(v)) || Number(v) < 0) throw new Error(`${name} must be a non-negative number`); return Number(v); }

function template() {
  return {
    project: 'PROJECT NAME',
    client: 'CLIENT NAME',
    currency: 'PHP',
    validity_days: 30,
    items: [
      { category: 'engineering', name: 'Core implementation', amount: 0, notes: 'Architecture + backend/frontend implementation' },
      { category: 'security', name: 'Security and hardening', amount: 0, notes: 'Threat model, secure defaults, hardening, verification' },
      { category: 'verification', name: 'Testing and assurance', amount: 0, notes: 'Integration, security, recovery, release evidence' },
      { category: 'deployment', name: 'Deployment and turnover', amount: 0, notes: 'Environment, release, documentation, handoff' }
    ],
    contingency_percent: 10,
    risk_premium_percent: 0,
    support_amount: 0,
    margin_percent: 20,
    tax_percent: 0,
    assumptions: ['Approved requirements remain materially stable during the quoted phase.'],
    exclusions: ['Third-party licenses, hosting, domains, SMS/email/API usage unless explicitly listed.'],
    maintenance: 'Defined separately in the maintenance/support boundary.',
    notes: ['Price is derived from scope, uncertainty, engineering consequence, and delivery obligations—not feature count alone.']
  };
}

function writeTemplate(file) {
  const target = path.resolve(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target) && !has('--force')) throw new Error(`Refusing to overwrite ${path.relative(ROOT, target)} without --force`);
  fs.writeFileSync(target, JSON.stringify(template(), null, 2) + '\n', 'utf8');
  console.log(`Quote spec template written: ${path.relative(ROOT, target)}`);
}

function build(spec, specPath, outArg) {
  if (!spec.project) throw new Error('spec.project is required');
  if (!spec.client) throw new Error('spec.client is required');
  if (!Array.isArray(spec.items) || !spec.items.length) throw new Error('spec.items must be a non-empty array');
  const currency = spec.currency || 'PHP';
  const items = spec.items.map((item, i) => ({
    category: item.category || 'engineering',
    name: item.name || `Item ${i + 1}`,
    amount: assertNumber(item.amount, `items[${i}].amount`),
    notes: item.notes || ''
  }));
  const direct = items.reduce((s, x) => s + x.amount, 0);
  const contingencyRate = assertNumber(spec.contingency_percent || 0, 'contingency_percent');
  const riskRate = assertNumber(spec.risk_premium_percent || 0, 'risk_premium_percent');
  const marginRate = assertNumber(spec.margin_percent || 0, 'margin_percent');
  const taxRate = assertNumber(spec.tax_percent || 0, 'tax_percent');
  const support = assertNumber(spec.support_amount || 0, 'support_amount');
  const contingency = direct * pct(contingencyRate);
  const risk = direct * pct(riskRate);
  const preMargin = direct + contingency + risk + support;
  const margin = preMargin * pct(marginRate);
  const preTax = preMargin + margin;
  const tax = preTax * pct(taxRate);
  const total = preTax + tax;
  const validity = Number(spec.validity_days || 30);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const defaultOut = path.join('reports', 'quotes', `${date}-${slug(spec.project)}-quote.md`);
  const out = path.resolve(ROOT, outArg || defaultOut);
  fs.mkdirSync(path.dirname(out), { recursive: true });

  const lines = [
    `# Technical Quote — ${spec.project}`, '',
    `**Prepared for:** ${spec.client}`,
    `**Date:** ${date}`,
    `**Currency:** ${currency}`,
    `**Validity:** ${validity} days`, '',
    '## Engineering basis', '',
    'This quote separates direct engineering work from uncertainty, delivery risk, support obligations, margin, and taxes. Architecture, security, verification, deployment, and operational consequences should be priced when they create real work or retained responsibility.', '',
    '## Direct scope', '',
    '| Category | Item | Amount | Notes |',
    '|---|---|---:|---|',
    ...items.map(x => `| ${x.category} | ${x.name} | ${money(x.amount, currency)} | ${String(x.notes).replace(/\|/g, '\\|')} |`), '',
    '## Commercial calculation', '',
    `- Direct engineering subtotal: **${money(direct, currency)}**`,
    `- Contingency (${contingencyRate}%): **${money(contingency, currency)}**`,
    `- Delivery risk premium (${riskRate}%): **${money(risk, currency)}**`,
    `- Fixed support/turnover allocation: **${money(support, currency)}**`,
    `- Margin (${marginRate}% of pre-margin amount): **${money(margin, currency)}**`,
    `- Tax (${taxRate}%): **${money(tax, currency)}**`,
    `- **Total quoted amount: ${money(total, currency)}**`, '',
    '## Assumptions',
    ...(Array.isArray(spec.assumptions) && spec.assumptions.length ? spec.assumptions.map(x => `- ${x}`) : ['- None recorded.']), '',
    '## Exclusions',
    ...(Array.isArray(spec.exclusions) && spec.exclusions.length ? spec.exclusions.map(x => `- ${x}`) : ['- None recorded.']), '',
    '## Maintenance / support boundary', '',
    spec.maintenance || 'Not specified.', '',
    '## Notes',
    ...(Array.isArray(spec.notes) && spec.notes.length ? spec.notes.map(x => `- ${x}`) : ['- None.']), '',
    '## Cognition references', '',
    '- [[mesh/delivery/Quote Construction]]',
    '- [[mesh/delivery/Estimation Model]]',
    '- [[mesh/delivery/Scope Pricing]]',
    '- [[mesh/delivery/Contingency Budget]]',
    '- [[mesh/delivery/Delivery Risk Premium]]',
    '- [[atlas/projects/packets/QUOTE_SCOPE_PACKET]]', '',
    `Source spec: ${path.relative(ROOT, specPath).split(path.sep).join('/')}`, ''
  ];
  fs.writeFileSync(out, lines.join('\n'), 'utf8');
  console.log('');
  console.log(`Quote: ${path.relative(ROOT, out)}`);
  console.log(`Direct subtotal: ${money(direct, currency)}`);
  console.log(`Total: ${money(total, currency)}`);
  console.log('');
}

function main() {
  const init = arg('--init');
  if (init) return writeTemplate(init);
  const specArg = arg('--spec');
  if (!specArg) {
    console.error('Usage:');
    console.error('  node tools\\quote_builder.js --init quotes\\project.json');
    console.error('  node tools\\quote_builder.js --spec quotes\\project.json [--out reports\\quotes\\project.md]');
    process.exit(2);
  }
  const specPath = path.resolve(ROOT, specArg);
  if (!fs.existsSync(specPath)) throw new Error(`Spec not found: ${specArg}`);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  build(spec, specPath, arg('--out'));
}

try { main(); } catch (err) { console.error(`quote_builder: ${err.message}`); process.exit(1); }
