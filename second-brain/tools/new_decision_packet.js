const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
function arg(name) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; }
function has(name) { return process.argv.includes(name); }
function slug(s) { return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function upperSlug(s) { return String(s).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function q(s) { return JSON.stringify(String(s)); }

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && !has('--force')) throw new Error(`Refusing to overwrite ${path.relative(ROOT, file)} without --force`);
  fs.writeFileSync(file, content.replace(/^\n/, ''), 'utf8');
}

function fm(id, type, project, title) {
  return `---\nid: ${id}\ntype: ${type}\nproject: ${project}\nstatus: PROPOSED\nauthority: proposed\ncertainty: UNKNOWN\ncreated: ${new Date().toISOString()}\nsource: repo-backed\ntitle: ${q(title)}\n---\n`;
}

function main() {
  const projectRaw = arg('--project');
  const title = arg('--title');
  if (!projectRaw || !title) {
    console.error('Usage: node tools\\new_decision_packet.js --project TALIBON --title "Authentication licensing boundary"');
    process.exit(2);
  }
  const project = upperSlug(projectRaw);
  const name = slug(title);
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const packetId = `${project}-DEC-${date}-${name.toUpperCase()}`;
  const dir = path.join(ROOT, 'records', 'decisions', project, name);
  const relDir = path.relative(ROOT, dir).split(path.sep).join('/');

  const decision = fm(packetId, 'decision', project, title) + `# ${title}\n\n## Decision question\n\nWhat is being decided and why does it require a durable decision?\n\n## Context\n\nDescribe the current state, constraints, affected actors, authoritative facts, and why the decision exists now.\n\n## Selected option\n\nPROPOSED — not yet approved.\n\n## Alternatives\n\n- Option A:\n- Option B:\n- Option C:\n\n## Packet\n- [[${relDir}/EVIDENCE|Supporting Evidence]]\n- [[${relDir}/ARCHITECTURE_IMPACT|Architecture Impact]]\n- [[${relDir}/FAILURE_VULNERABILITY|Failure and Vulnerability]]\n- [[${relDir}/MITIGATION|Mitigation and Response]]\n- [[${relDir}/VERIFICATION|Verification]]\n- [[${relDir}/COST_CONSEQUENCE|Cost and Consequence]]\n- [[${relDir}/REVISIT|Revisit Triggers]]\n\n## Cognition\n- [[decision-engine/packets/DECISION_PACKET_MODEL]]\n- [[mesh/decision/Decision Support System]]\n- [[mesh/decision/Decision Record]]\n`;

  const evidence = fm(`${packetId}-EVIDENCE`, 'decision-evidence', project, `${title} — evidence`) + `# Supporting Evidence — ${title}\n\n## Direct repository/runtime evidence\n- \n\n## External references / standards\n- \n\n## Stakeholder authority\n- \n\n## Assumptions and uncertainty\n- \n\n## Evidence that would change the decision\n- \n\n## Cognition\n- [[${relDir}/DECISION|Decision]]\n- [[decision-engine/packets/SUPPORTING_EVIDENCE_PACKET]]\n- [[mesh/decision/Evidence Support]]\n- [[mesh/decision/Decision Confidence]]\n`;

  const architecture = fm(`${packetId}-ARCH`, 'decision-impact', project, `${title} — architecture impact`) + `# Architecture Impact — ${title}\n\n## Affected boundaries\n- modules / bounded contexts:\n- interfaces:\n- authoritative stores:\n- deployment units:\n- dependencies:\n\n## Change surface\n- \n\n## Compatibility / migration\n- \n\n## Reversibility\n- \n\n## Cognition\n- [[${relDir}/DECISION|Decision]]\n- [[decision-engine/packets/ARCHITECTURE_IMPACT_PACKET]]\n- [[mesh/architecture/Architecture System]]\n- [[mesh/architecture/Change Surface]]\n`;

  const failure = fm(`${packetId}-FAIL`, 'decision-risk', project, `${title} — failure and vulnerability`) + `# Failure and Vulnerability — ${title}\n\n## Technical failure modes\n- \n\n## Operational failure modes\n- \n\n## Security / attack surface\n- \n\n## Data integrity consequences\n- \n\n## Maximum credible blast radius\n- \n\n## Cognition\n- [[${relDir}/DECISION|Decision]]\n- [[decision-engine/packets/FAILURE_VULNERABILITY_PACKET]]\n- [[mesh/decision/Decision Failure Modes]]\n- [[mesh/decision/Vulnerability Impact]]\n- [[mesh/security/Threat Model]]\n- [[mesh/reliability/Failure Containment]]\n`;

  const mitigation = fm(`${packetId}-MIT`, 'decision-mitigation', project, `${title} — mitigation`) + `# Mitigation and Response — ${title}\n\n## Preventive controls\n- \n\n## Detective controls\n- \n\n## Containment / fallback\n- \n\n## Recovery actions\n- \n\n## Residual risk and owner\n- \n\n## Cognition\n- [[${relDir}/DECISION|Decision]]\n- [[decision-engine/packets/MITIGATION_RESPONSE_PACKET]]\n- [[mesh/decision/Mitigation Plan]]\n- [[mesh/security/Hardened Configuration]]\n- [[mesh/reliability/Operational Runbook]]\n`;

  const verification = fm(`${packetId}-VERIFY`, 'decision-verification', project, `${title} — verification`) + `# Verification — ${title}\n\n## Required proof before approval/release\n- unit / invariant:\n- integration / contract:\n- negative / abuse:\n- security:\n- migration / data:\n- recovery / rollback:\n- production observation:\n\n## Stop conditions\n- \n\n## Cognition\n- [[${relDir}/DECISION|Decision]]\n- [[decision-engine/packets/VERIFICATION_PACKET]]\n- [[mesh/testing/Verification System]]\n- [[mesh/testing/Release Evidence]]\n`;

  const cost = fm(`${packetId}-COST`, 'decision-cost', project, `${title} — cost and consequence`) + `# Cost and Consequence — ${title}\n\n## Engineering effort\n- \n\n## Infrastructure / licenses\n- \n\n## Operational and support cost\n- \n\n## Complexity introduced\n- \n\n## Future change cost\n- \n\n## Quote / commercial impact\n- \n\n## Cognition\n- [[${relDir}/DECISION|Decision]]\n- [[decision-engine/packets/COST_CONSEQUENCE_PACKET]]\n- [[mesh/delivery/Operational Cost Model]]\n- [[mesh/quality/Complexity Budget]]\n`;

  const revisit = fm(`${packetId}-REVISIT`, 'decision-review-trigger', project, `${title} — revisit triggers`) + `# Revisit Triggers — ${title}\n\nRevisit when any of the following becomes true:\n- an assumption is disproven or stale\n- scale crosses a defined threshold\n- a vulnerability or incident changes the risk model\n- dependency behavior or cost changes materially\n- operational burden becomes unacceptable\n- stronger evidence changes the tradeoff\n\n## Project-specific triggers\n- \n\n## Cognition\n- [[${relDir}/DECISION|Decision]]\n- [[decision-engine/packets/REVISIT_TRIGGER_PACKET]]\n- [[mesh/decision/Revisit Trigger]]\n- [[truth/STALE_ASSUMPTION_PROTOCOL]]\n`;

  write(path.join(dir, 'DECISION.md'), decision);
  write(path.join(dir, 'EVIDENCE.md'), evidence);
  write(path.join(dir, 'ARCHITECTURE_IMPACT.md'), architecture);
  write(path.join(dir, 'FAILURE_VULNERABILITY.md'), failure);
  write(path.join(dir, 'MITIGATION.md'), mitigation);
  write(path.join(dir, 'VERIFICATION.md'), verification);
  write(path.join(dir, 'COST_CONSEQUENCE.md'), cost);
  write(path.join(dir, 'REVISIT.md'), revisit);

  console.log(`Decision packet created: ${relDir}`);
  console.log(`ID: ${packetId}`);
  console.log('Status: PROPOSED — human approval required before treating the decision as authoritative.');
}

try { main(); } catch (err) { console.error(`new_decision_packet: ${err.message}`); process.exit(1); }
