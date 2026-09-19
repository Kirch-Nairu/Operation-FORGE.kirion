const STAGE_ORDER = ['BOOTSTRAP','PRE_DESIGN','PRE_IMPLEMENTATION','PRE_DELIVERY','POST_DEPLOY','POST_VERIFY'];

function laneMap(registry) {
  const map = new Map();
  for (const [family, lanes] of Object.entries(registry.families)) {
    for (const lane of lanes) {
      if (map.has(lane.id)) throw new Error(`Duplicate lane id: ${lane.id}`);
      map.set(lane.id, { ...lane, family });
    }
  }
  return map;
}

function stageIndex(stage) {
  const i = STAGE_ORDER.indexOf(stage);
  if (i < 0) throw new Error(`Unknown lifecycle stage: ${stage}`);
  return i;
}

/**
 * Stage scoping.
 *
 * Routing selects which lanes are relevant to the task. Scoping decides which of
 * those lanes are seeded into the compiled context *at the stage currently being
 * evaluated*. A greenfield build legitimately routes almost every lane, but the
 * release, runtime and incident lanes carry no decision weight before design
 * exists, and seeding them at PRE_DESIGN was pushing the context compiler past
 * its document budget so that it silently truncated.
 *
 * Deferral is not exclusion. Deferred lanes stay in the route and are reported
 * with the stage that activates them, so nothing is lost and the narrowing is
 * auditable.
 */
function applyStageScope(lanes, routing, taskType, stage) {
  const scope = routing.stage_scope || {};
  const floor = (routing.stage_floor_by_task || {})[taskType];
  const effectiveStage = floor && stageIndex(floor) > stageIndex(stage) ? floor : stage;
  const cutoff = stageIndex(effectiveStage);
  const active = [], deferred = [];
  for (const lane of lanes) {
    const laneStage = scope[lane.id] || 'PRE_DESIGN';
    if (stageIndex(laneStage) <= cutoff) active.push({ ...lane, activates_at: laneStage });
    else deferred.push({ ...lane, activates_at: laneStage });
  }
  return { active, deferred, effectiveStage };
}

function routeTask(type, signals, mode, routing, registry, controlRoots, options = {}) {
  const stage = options.stage || 'PRE_DESIGN';
  const map = laneMap(registry);
  const ids = new Set(routing.always || []);
  for (const id of routing.by_task[type] || []) ids.add(id);
  for (const [signal, laneIds] of Object.entries(routing.by_signal || {})) {
    if (signals[signal]) for (const id of laneIds) ids.add(id);
  }
  for (const id of routing.by_mode[mode] || []) ids.add(id);
  const unknown = [...ids].filter(id => !map.has(id));
  if (unknown.length) throw new Error(`Routing references unknown lane ids: ${unknown.join(', ')}`);

  const bySort = (a, b) => a.family.localeCompare(b.family) || a.id.localeCompare(b.id);
  const routed = [...ids].map(id => map.get(id)).sort(bySort);
  const { active, deferred, effectiveStage } = applyStageScope(routed, routing, type, stage);

  return {
    task_type: type,
    rigor_mode: mode,
    evaluated_stage: effectiveStage,
    control_roots: [...controlRoots],
    lanes: active,
    deferred_lanes: deferred.map(x => ({ id: x.id, family: x.family, activates_at: x.activates_at })),
    routed_lane_count: routed.length,
    active_lane_count: active.length,
    families: [...new Set(active.map(x => x.family))].sort(),
    routed_families: [...new Set(routed.map(x => x.family))].sort(),
    active_signals: Object.keys(signals).filter(k => signals[k]).sort()
  };
}

module.exports = { routeTask, laneMap, applyStageScope, STAGE_ORDER };
