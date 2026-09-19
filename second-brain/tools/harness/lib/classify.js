const SIGNAL_KEYWORDS = {
  ui: ['ui','frontend','browser','page','screen','dashboard','interface'],
  data: ['database','data','state','record','asset','ledger','postgres','sql'],
  auth: ['auth','login','permission','rbac','role','identity','session'],
  security: ['security','secure','vulnerability','threat','authorization'],
  privacy: ['privacy','pii','personal data','sensitive data','encrypt'],
  supply_chain: ['dependency','package','supply chain','npm','composer'],
  distributed: ['distributed','microservice','queue','event bus','multi-service'],
  performance: ['performance','latency','throughput','memory','cpu','slow'],
  deployment: ['deploy','deployment','ci/cd','pipeline','release','production'],
  network: ['network','dns','tcp','firewall','proxy','lan','wan'],
  ai: [' ai ','llm','model','agent','chatgpt','machine learning'],
  incident: ['incident','outage','breach','compromise'],
  commercial: ['client','contract','commercial','price','billing'],
  compliance: ['compliance','audit','regulatory','standard'],
  recovery: ['recovery','restore','backup','rollback','disaster'],
  migration: ['migration','schema change','backfill'],
  external_dependency: ['third-party','external api','provider','vendor'],
  offline: ['offline','unreliable connectivity','disconnected'],
  production: ['production','live system','live environment'],
  financial: ['payment','money','financial','payroll','billing']
};

function inferSignals(task) {
  const text = ` ${[task.intent, ...(task.constraints || []), ...(task.acceptance || [])].join(' ').toLowerCase()} `;
  const derived = {};
  for (const [signal, words] of Object.entries(SIGNAL_KEYWORDS)) {
    derived[signal] = words.some(w => text.includes(w));
  }
  return { ...derived, ...(task.signals || {}) };
}

function classifyTask(task, cfg) {
  const valid = new Map(cfg.types.map(x => [x.id, x]));
  if (task.type) {
    if (!valid.has(task.type)) return { status:'BLOCKED', reason:`Unknown explicit task type: ${task.type}`, candidates:[] };
    return { status:'RESOLVED', type:task.type, explicit:true, score:null, candidates:[{type:task.type,score:null}] };
  }
  const text = ` ${[task.intent, ...(task.constraints || [])].join(' ').toLowerCase()} `;
  const scored = cfg.types.map(t => {
    const hits = t.keywords.filter(k => text.includes(k.toLowerCase()));
    return { type:t.id, score:hits.length, hits, priority:t.priority || 0 };
  }).filter(x => x.score > 0).sort((a,b) => b.score-a.score || b.priority-a.priority || a.type.localeCompare(b.type));
  if (!scored.length || scored[0].score < cfg.minimum_score) {
    return { status:'BLOCKED', reason:'No task classification reached the configured minimum score. Supply task.type or clearer intent.', candidates:scored };
  }
  if (scored[1] && scored[0].score - scored[1].score < cfg.ambiguity_margin && scored[0].score === scored[1].score) {
    return { status:'BLOCKED', reason:`Ambiguous classification between ${scored[0].type} and ${scored[1].type}. Supply task.type.`, candidates:scored.slice(0,5) };
  }
  return { status:'RESOLVED', type:scored[0].type, explicit:false, score:scored[0].score, candidates:scored.slice(0,5) };
}

module.exports = { classifyTask, inferSignals, SIGNAL_KEYWORDS };
