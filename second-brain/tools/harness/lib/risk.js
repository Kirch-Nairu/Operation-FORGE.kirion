const MODE_ORDER = ['LOW','MEDIUM','HIGH','CRITICAL'];

function modeAtLeast(a,b) { return MODE_ORDER.indexOf(a) >= MODE_ORDER.indexOf(b); }
function maxMode(a,b) { return modeAtLeast(a,b) ? a : b; }
function clamp(n) { return Math.max(0, Math.min(4, Number.isFinite(n) ? n : 0)); }

function triggerMatches(trigger, type, signals, dimensions) {
  if (trigger.task_types && !trigger.task_types.includes(type)) return false;
  if (trigger.all_signals && !trigger.all_signals.every(s => signals[s])) return false;
  if (trigger.minimum_dimension) {
    for (const [k,v] of Object.entries(trigger.minimum_dimension)) if ((dimensions[k] || 0) < v) return false;
  }
  return true;
}

function scoreRisk(task, type, signals, cfg) {
  if (!type || !cfg.base[type]) throw new Error(`No risk baseline for task type ${type}`);
  const dimensions = { ...cfg.base[type] };
  for (const [signal, minimums] of Object.entries(cfg.signal_minimums || {})) {
    if (!signals[signal]) continue;
    for (const [dim, min] of Object.entries(minimums)) dimensions[dim] = Math.max(dimensions[dim] || 0, min);
  }
  for (const [dim, value] of Object.entries(task.risk_overrides || {})) {
    if (!cfg.dimensions.includes(dim)) throw new Error(`Unknown risk override dimension: ${dim}`);
    dimensions[dim] = clamp(value);
  }
  let weighted = 0, weight = 0;
  for (const dim of cfg.dimensions) {
    const w = cfg.weights[dim] || 1;
    weighted += clamp(dimensions[dim]) * w;
    weight += w;
    dimensions[dim] = clamp(dimensions[dim]);
  }
  const score = weight ? weighted / weight : 0;
  let mode = score <= cfg.thresholds.LOW ? 'LOW'
    : score <= cfg.thresholds.MEDIUM ? 'MEDIUM'
    : score <= cfg.thresholds.HIGH ? 'HIGH' : 'CRITICAL';
  mode = maxMode(mode, cfg.type_floors[type] || 'LOW');
  const fired = (cfg.critical_triggers || []).filter(t => triggerMatches(t, type, signals, dimensions));
  if (fired.length) mode = 'CRITICAL';
  return { mode, score:Number(score.toFixed(3)), dimensions, type_floor:cfg.type_floors[type] || 'LOW', critical_triggers_fired:fired.length };
}

module.exports = { scoreRisk, modeAtLeast, MODE_ORDER };
