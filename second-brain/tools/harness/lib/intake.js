const {sha256}=require('./io');

function intakeTask(input){
  if(typeof input==='string') input={intent:input};
  if(!input || typeof input.intent!=='string' || !input.intent.trim()) throw new Error('intake requires non-empty intent');
  const intent=input.intent.trim();
  const task={
    version:1,
    id:(input.id&&String(input.id).trim())||`task-${sha256(intent).slice(0,12)}`,
    intent,
    constraints:Array.isArray(input.constraints)?input.constraints.map(String):[],
    signals:input.signals&&typeof input.signals==='object'?input.signals:{},
    risk_overrides:input.risk_overrides&&typeof input.risk_overrides==='object'?input.risk_overrides:{},
    primary_journeys:Array.isArray(input.primary_journeys)?input.primary_journeys:[],
    repository:input.repository&&typeof input.repository==='object'?input.repository:{},
    acceptance:Array.isArray(input.acceptance)?input.acceptance.map(String):[]
  };
  if(input.type) task.type=String(input.type).trim();
  return task;
}
module.exports={intakeTask};
