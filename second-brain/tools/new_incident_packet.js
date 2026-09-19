const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
function arg(name) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; }
function has(name) { return process.argv.includes(name); }
function slug(s) { return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function upper(s) { return String(s).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && !has('--force')) throw new Error(`Refusing to overwrite ${path.relative(ROOT, file)} without --force`);
  fs.writeFileSync(file, content.replace(/^\n/, ''), 'utf8');
}
function fm(id, type, project, title) {
  return `---\nid: ${id}\ntype: ${type}\nproject: ${project}\nstatus: OPEN\nauthority: evidence\ncertainty: OBSERVED\ncreated: ${new Date().toISOString()}\nsource: incident-evidence\ntitle: ${JSON.stringify(title)}\n---\n`;
}

function main() {
  const projectRaw = arg('--project');
  const title = arg('--title');
  if (!projectRaw || !title) {
    console.error('Usage: node tools\\new_incident_packet.js --project SALRYN --title "Checkout posting regression"');
    process.exit(2);
  }
  const project = upper(projectRaw), s = slug(title), date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const id = `${project}-INC-${date}-${s.toUpperCase()}`;
  const dir = path.join(ROOT, 'incident', 'records', project, s);
  const relDir = path.relative(ROOT, dir).split(path.sep).join('/');

  write(path.join(dir,'SUMMARY.md'), `${fm(id,'incident',project,title)}# ${title}\n\n## What happened\n- \n\n## Current impact\n- \n\n## Current containment\n- \n\n## Current confidence\n- \n\n## Packet\n- [[${relDir}/TIMELINE|Timeline]]\n- [[${relDir}/IMPACT|Impact]]\n- [[${relDir}/CONTAINMENT|Containment]]\n- [[${relDir}/ROOT_CAUSE|Root Cause]]\n- [[${relDir}/RECOVERY|Recovery]]\n- [[${relDir}/LEARNING|Learning]]\n\n## Cognition\n- [[mesh/incident/Incident Evidence]]\n- [[incident/INCIDENT_SYSTEM]]\n`);
  write(path.join(dir,'TIMELINE.md'), `${fm(`${id}-TIME`,'incident-timeline',project,`${title} — timeline`)}# Incident Timeline — ${title}\n\nRecord facts with timestamps. Distinguish direct observation from inferred sequence.\n\n| Time | Observation / action | Evidence | Confidence |\n|---|---|---|---|\n| | | | |\n\n## Cognition\n- [[${relDir}/SUMMARY|Summary]]\n- [[mesh/incident/Incident Timeline]]\n`);
  write(path.join(dir,'IMPACT.md'), `${fm(`${id}-IMPACT`,'incident-impact',project,`${title} — impact`)}# Incident Impact — ${title}\n\n## Users / tenants\n- \n\n## Data / state\n- \n\n## Security / credentials\n- \n\n## Services / dependencies\n- \n\n## Time boundary\n- \n\n## Maximum credible impact\n- \n\n## Cognition\n- [[${relDir}/SUMMARY|Summary]]\n- [[mesh/incident/Impact Boundary]]\n- [[mesh/data/Data Classification]]\n`);
  write(path.join(dir,'CONTAINMENT.md'), `${fm(`${id}-CONTAIN`,'incident-containment',project,`${title} — containment`)}# Incident Containment — ${title}\n\n## Actions taken\n- \n\n## Authority / approvals\n- \n\n## Evidence preserved\n- \n\n## Remaining exposure\n- \n\n## Stop / escalation condition\n- \n\n## Cognition\n- [[${relDir}/SUMMARY|Summary]]\n- [[mesh/incident/Containment Decision]]\n- [[mesh/reliability/Failure Containment]]\n`);
  write(path.join(dir,'ROOT_CAUSE.md'), `${fm(`${id}-ROOT`,'incident-root-cause',project,`${title} — root cause`)}# Incident Root Cause — ${title}\n\n## Trigger\n- \n\n## Enabling conditions\n- \n\n## Missing / failed controls\n- \n\n## Detection gaps\n- \n\n## Architectural or process contributors\n- \n\n## Evidence\n- \n\n## Cognition\n- [[${relDir}/SUMMARY|Summary]]\n- [[mesh/incident/Root Cause Chain]]\n- [[mesh/incident/Control Failure]]\n- [[incident/ROOT_CAUSE_PROTOCOL]]\n`);
  write(path.join(dir,'RECOVERY.md'), `${fm(`${id}-RECOVERY`,'incident-recovery',project,`${title} — recovery`)}# Incident Recovery — ${title}\n\n## Eradication\n- \n\n## State restoration / reconciliation\n- \n\n## Credential / configuration changes\n- \n\n## Verification before resume\n- \n\n## Production observation\n- \n\n## Cognition\n- [[${relDir}/SUMMARY|Summary]]\n- [[mesh/incident/Recovery Decision]]\n- [[mesh/testing/Recovery Verification]]\n- [[mesh/reliability/Recovery Objective]]\n`);
  write(path.join(dir,'LEARNING.md'), `${fm(`${id}-LEARN`,'incident-learning',project,`${title} — learning`)}# Incident Learning — ${title}\n\n## Architecture changes\n- \n\n## Security / hardening changes\n- \n\n## Tests / verification changes\n- \n\n## Observability / runbook changes\n- \n\n## Decisions to revisit\n- \n\n## Pattern / lesson promotion\n- \n\n## Cognition\n- [[${relDir}/SUMMARY|Summary]]\n- [[mesh/incident/Post Incident Learning]]\n- [[knowledge/LESSON_SYSTEM]]\n- [[mesh/decision/Revisit Trigger]]\n`);

  console.log(`Incident packet created: ${relDir}`);
  console.log(`Incident ID: ${id}`);
}

try { main(); } catch (err) { console.error(`new_incident_packet: ${err.message}`); process.exit(1); }
