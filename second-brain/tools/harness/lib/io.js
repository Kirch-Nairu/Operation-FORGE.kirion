const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function repoRoot() { return path.resolve(__dirname, '..', '..', '..'); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  }
  return value;
}
function canonicalJson(value) { return JSON.stringify(canonical(value)); }
function normalizeTask(task) {
  if (!task || task.version !== 1 || typeof task.id !== 'string' || !task.id.trim() || typeof task.intent !== 'string' || !task.intent.trim()) {
    throw new Error('Task must contain version=1, non-empty id, and non-empty intent.');
  }
  const journeys = Array.isArray(task.primary_journeys) ? task.primary_journeys : [];
  const ids = new Set();
  for (const j of journeys) {
    if (!j || typeof j.id !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(j.id) || typeof j.description !== 'string' || !j.description.trim()) {
      throw new Error('Each primary journey needs a stable lowercase id and description.');
    }
    if (ids.has(j.id)) throw new Error(`Duplicate primary journey id: ${j.id}`);
    ids.add(j.id);
  }
  return {version:1,id:task.id.trim(),intent:task.intent.trim(),...(task.type?{type:String(task.type).trim()}:{}),constraints:Array.isArray(task.constraints)?task.constraints.map(String):[],signals:Object.fromEntries(Object.entries(task.signals||{}).map(([k,v])=>[k,Boolean(v)])),risk_overrides:Object.fromEntries(Object.entries(task.risk_overrides||{}).map(([k,v])=>[k,Number(v)])),primary_journeys:journeys,repository:task.repository||{},acceptance:Array.isArray(task.acceptance)?task.acceptance.map(String):[]};
}
function loadConfig(root = repoRoot()) {
  const h = path.join(root, 'harness');
  return {manifest:readJson(path.join(h,'HARNESS_MANIFEST.json')),lanes:readJson(path.join(h,'config','lane-registry.json')),taskTypes:readJson(path.join(h,'config','task-types.json')),risk:readJson(path.join(h,'config','risk-model.json')),routing:readJson(path.join(h,'config','routing-rules.json')),gates:readJson(path.join(h,'config','gates.json')),evidence:readJson(path.join(h,'config','evidence-levels.json')),semanticProvider:readJson(path.join(h,'notion','control-plane.json')),routePack:readJson(path.join(h,'notion','route-pack.json'))};
}
module.exports = { repoRoot, readJson, writeJson, sha256, canonicalJson, normalizeTask, loadConfig };
