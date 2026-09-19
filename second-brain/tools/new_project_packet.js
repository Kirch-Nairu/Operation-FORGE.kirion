const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
function arg(name) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; }
function has(name) { return process.argv.includes(name); }
function slug(s) { return String(s).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, ''); }
function titleCase(s) { return String(s).trim(); }
function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && !has('--force')) throw new Error(`Refusing to overwrite ${path.relative(ROOT, file)} without --force`);
  fs.writeFileSync(file, content.replace(/^\n/, ''), 'utf8');
}
function fm(id, type, project, title) {
  return `---\nid: ${id}\ntype: ${type}\nproject: ${project}\nstatus: ACTIVE\nauthority: project\ncertainty: SUPPORTED\ncreated: ${new Date().toISOString()}\nsource: repo-backed\ntitle: ${JSON.stringify(title)}\n---\n`;
}

function main() {
  const projectRaw = arg('--project');
  const titleRaw = arg('--title') || projectRaw;
  if (!projectRaw) {
    console.error('Usage: node tools\\new_project_packet.js --project TALIBON [--title "Talibon Intra-Office Portal"]');
    process.exit(2);
  }
  const project = slug(projectRaw), title = titleCase(titleRaw);
  const projectFile = path.join(ROOT, 'atlas', 'projects', `${project}.md`);
  const dir = path.join(ROOT, 'atlas', 'projects', project);
  const relDir = path.relative(ROOT, dir).split(path.sep).join('/');
  const projectLink = `[[atlas/projects/${project}|${title}]]`;

  if (!fs.existsSync(projectFile)) {
    write(projectFile, `${fm(`${project}-PROJECT`, 'project', project, title)}# ${title}\n\n## Purpose\n\nDescribe the project outcome and users.\n\n## Current state\n\n- lifecycle: idea\n- durable implementation: unknown\n\n## Engineering packet\n- [[${relDir}/OVERVIEW|Project Engineering Overview]]\n- [[${relDir}/PLANNING|Planning]]\n- [[${relDir}/ARCHITECTURE_DECISIONS|Architecture & Decisions]]\n- [[${relDir}/DATA_AUTHORITY|Data Authority]]\n- [[${relDir}/SECURITY|Security]]\n- [[${relDir}/FAILURE_RISK|Failure & Risk]]\n- [[${relDir}/RELEASE|Release Readiness]]\n- [[${relDir}/OPERATIONS|Operations]]\n- [[${relDir}/QUOTE_SCOPE|Quote & Scope]]\n- [[${relDir}/OBSERVATION|Post-Release Observation]]\n\n## Cognition\n- [[cognitive-os/hubs/PROJECTS_SECTOR]]\n- [[atlas/projects/packets/PROJECT_PACKET_INDEX]]\n`);
  }

  write(path.join(dir, 'OVERVIEW.md'), `${fm(`${project}-PACKET-OVERVIEW`, 'project-packet', project, `${title} — engineering overview`)}# ${title} — Engineering Overview\n\nProject: ${projectLink}\n\n## Outcome\n- \n\n## Current durable state\n- repository / branch:\n- deployment:\n- authority:\n- current phase:\n\n## Active engineering views\n- [[${relDir}/PLANNING|Planning]]\n- [[${relDir}/ARCHITECTURE_DECISIONS|Architecture & Decisions]]\n- [[${relDir}/DATA_AUTHORITY|Data Authority]]\n- [[${relDir}/SECURITY|Security]]\n- [[${relDir}/FAILURE_RISK|Failure & Risk]]\n- [[${relDir}/RELEASE|Release Readiness]]\n- [[${relDir}/OPERATIONS|Operations]]\n- [[${relDir}/QUOTE_SCOPE|Quote & Scope]]\n- [[${relDir}/OBSERVATION|Observation]]\n\n## Cognition\n- [[atlas/projects/packets/PROJECT_ENGINEERING_PACKET]]\n- [[cognitive-os/10_ENGINEERING_COGNITION_MESH]]\n`);

  write(path.join(dir, 'PLANNING.md'), `${fm(`${project}-PACKET-PLAN`, 'project-planning', project, `${title} — planning`)}# ${title} — Planning\n\nProject: ${projectLink}\n\n## Problem / outcome\n- \n\n## Scope\n- owned:\n- non-goals:\n\n## Constraints\n- \n\n## Assumptions\n- \n\n## Dependencies\n- \n\n## Acceptance\n- \n\n## Sequencing\n- \n\n## Cognition\n- [[mesh/planning/Planning System]]\n- [[mesh/planning/Scope Boundary]]\n- [[mesh/planning/Assumption Register]]\n- [[mesh/planning/Acceptance Criteria]]\n`);

  write(path.join(dir, 'ARCHITECTURE_DECISIONS.md'), `${fm(`${project}-PACKET-ARCH`, 'project-architecture', project, `${title} — architecture and decisions`)}# ${title} — Architecture & Decisions\n\nProject: ${projectLink}\n\n## System context\n- \n\n## Module / domain boundaries\n- \n\n## Runtime topology\n- \n\n## Data ownership\n- \n\n## Material decisions\n- \n\n## Reversibility / migration\n- \n\n## Cognition\n- [[mesh/architecture/Architecture System]]\n- [[mesh/decision/Decision Support System]]\n- [[decision-engine/packets/DECISION_PACKET_MODEL]]\n- [[atlas/projects/packets/ARCHITECTURE_DECISION_PACKET]]\n`);

  write(path.join(dir, 'DATA_AUTHORITY.md'), `${fm(`${project}-PACKET-DATA`, 'project-data', project, `${title} — data authority`)}# ${title} — Data Authority\n\nProject: ${projectLink}\n\n## Authoritative stores\n- \n\n## Mutation boundaries\n- \n\n## Invariants / concurrency\n- \n\n## Schema evolution / migration\n- \n\n## Backup / recovery / portability\n- \n\n## Cognition\n- [[mesh/data/Data Architecture System]]\n- [[mesh/data/Data Integrity]]\n- [[mesh/data/Migration Safety]]\n- [[atlas/projects/packets/DATA_AUTHORITY_PACKET]]\n`);

  write(path.join(dir, 'SECURITY.md'), `${fm(`${project}-PACKET-SEC`, 'project-security', project, `${title} — security`)}# ${title} — Security\n\nProject: ${projectLink}\n\n## Assets / actors\n- \n\n## Trust / auth boundaries\n- \n\n## Attack surface / abuse paths\n- \n\n## Secure defaults / hardening\n- \n\n## Secrets / privileged operations\n- \n\n## Verification / residual risk\n- \n\n## Cognition\n- [[mesh/security/Security Engineering System]]\n- [[mesh/security/Threat Model]]\n- [[mesh/testing/Security Verification]]\n- [[atlas/projects/packets/SECURITY_REVIEW_PACKET]]\n`);

  write(path.join(dir, 'FAILURE_RISK.md'), `${fm(`${project}-PACKET-RISK`, 'project-risk', project, `${title} — failure and risk`)}# ${title} — Failure & Risk\n\nProject: ${projectLink}\n\n## Failure modes\n- \n\n## Dependency / capacity failure\n- \n\n## Containment / degradation\n- \n\n## Recovery objectives\n- \n\n## Backup / restore / DR\n- \n\n## Open risk / acceptance\n- \n\n## Cognition\n- [[mesh/reliability/Reliability System]]\n- [[mesh/reliability/Failure Containment]]\n- [[risk/RISK_SYSTEM]]\n- [[atlas/projects/packets/FAILURE_RISK_PACKET]]\n`);

  write(path.join(dir, 'RELEASE.md'), `${fm(`${project}-PACKET-RELEASE`, 'project-release', project, `${title} — release readiness`)}# ${title} — Release Readiness\n\nProject: ${projectLink}\n\n## Artifact / source identity\n- \n\n## Required evidence\n- \n\n## Migration / configuration\n- \n\n## Rollback\n- \n\n## Health signals / observation\n- \n\n## Stop conditions\n- \n\n## Cognition\n- [[mesh/testing/Release Evidence]]\n- [[mesh/deployment/Deployment Gate]]\n- [[mesh/standards/Release Assurance Baseline]]\n- [[atlas/projects/packets/RELEASE_READINESS_PACKET]]\n`);

  write(path.join(dir, 'OPERATIONS.md'), `${fm(`${project}-PACKET-OPS`, 'project-operations', project, `${title} — operations`)}# ${title} — Operations\n\nProject: ${projectLink}\n\n## Environment / config authority\n- \n\n## Health / telemetry / logs\n- \n\n## Admin access / secrets\n- \n\n## Patch / dependency updates\n- \n\n## Runbooks / ownership\n- \n\n## Incident escalation\n- \n\n## Cognition\n- [[mesh/operations/Operations System]]\n- [[mesh/deployment/Deployment System]]\n- [[mesh/reliability/Operational Runbook]]\n- [[atlas/projects/packets/OPERATIONS_PACKET]]\n`);

  write(path.join(dir, 'QUOTE_SCOPE.md'), `${fm(`${project}-PACKET-QUOTE`, 'project-commercial', project, `${title} — quote and scope`)}# ${title} — Quote & Scope\n\nProject: ${projectLink}\n\n## Outcome / owned scope\n- \n\n## Exclusions\n- \n\n## Estimate and assumptions\n- \n\n## External costs\n- \n\n## Contingency / risk premium\n- \n\n## Maintenance / support\n- \n\n## Change-request triggers\n- \n\n## Cognition\n- [[mesh/delivery/Quote Construction]]\n- [[mesh/delivery/Scope Pricing]]\n- [[mesh/planning/Scope Boundary]]\n- [[atlas/projects/packets/QUOTE_SCOPE_PACKET]]\n`);

  write(path.join(dir, 'OBSERVATION.md'), `${fm(`${project}-PACKET-OBS`, 'project-observation', project, `${title} — post-release observation`)}# ${title} — Post-Release Observation\n\nProject: ${projectLink}\n\n## Observation window\n- \n\n## Health / errors / latency / resource use\n- \n\n## Security / abuse signals\n- \n\n## Data anomalies\n- \n\n## Support / user impact\n- \n\n## Claims promoted to observed-in-operation\n- \n\n## Cognition\n- [[mesh/testing/Production Observation]]\n- [[mesh/operations/Observability]]\n- [[mesh/governance/Production Observation Matters]]\n- [[atlas/projects/packets/POST_RELEASE_OBSERVATION_PACKET]]\n`);

  console.log(`Project engineering packet created: ${relDir}`);
  console.log(`Project note: atlas/projects/${project}.md`);
}

try { main(); } catch (err) { console.error(`new_project_packet: ${err.message}`); process.exit(1); }
