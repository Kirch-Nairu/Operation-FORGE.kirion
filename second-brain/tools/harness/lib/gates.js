const STAGE_ORDER=['BOOTSTRAP','PRE_DESIGN','PRE_IMPLEMENTATION','PRE_DELIVERY','POST_DEPLOY','POST_VERIFY'];
const REQUIREMENT_KINDS=['internal','task_field_nonempty','claim','each_primary_journey_claim','claim_or_absent'];
const INTERNAL_CHECKS=['classification_resolved','required_sources_resolved','target_repo_resolved','target_repo_clean','context_not_truncated'];

function taskField(task,field){ return field.split('.').reduce((v,k)=>v&&v[k],task); }
function applies(gate,ctx){
  const a=gate.applies||{};
  if(a.task_types&&!a.task_types.includes(ctx.type)) return false;
  if(a.risk_modes&&!a.risk_modes.includes(ctx.risk.mode)) return false;
  if(a.signals_any&&!a.signals_any.some(s=>ctx.signals[s])) return false;
  if(a.signals_all&&!a.signals_all.every(s=>ctx.signals[s])) return false;
  if(a.task_fields_any&&!a.task_fields_any.some(f=>Boolean(taskField(ctx.task,f)))) return false;
  return true;
}
function hasLevels(claim,levels){ const actual=new Set((claim&&claim.levels)||[]); return levels.every(x=>actual.has(x)); }
function claimFailure(key,claim,required){
  if(!claim) return `claim ${key} is missing; requires PASS + [${required.join(', ')}]`;
  if(claim.status!=='PASS') return `claim ${key} is ${claim.status}${claim.detail?`: ${claim.detail}`:''}`;
  const missing=required.filter(x=>!(claim.levels||[]).includes(x));
  if(missing.length) return `claim ${key} is PASS but lacks evidence capabilities [${missing.join(', ')}]`;
  return '';
}
function checkRequirement(req,ctx,claims){
  if(req.kind==='internal'){
    if(req.check==='classification_resolved') return ctx.classification.status==='RESOLVED'?{pass:true}:{pass:false,reason:ctx.classification.reason||'classification unresolved'};
    if(req.check==='required_sources_resolved') return ctx.context&&ctx.context.status==='RESOLVED'?{pass:true}:{pass:false,reason:`required context source resolution failed${ctx.context&&ctx.context.reason?`: ${ctx.context.reason}`:''}`};
    if(req.check==='target_repo_resolved') return ctx.target_repository&&ctx.target_repository.status==='RESOLVED'?{pass:true}:{pass:false,reason:`target repository reality unresolved${ctx.target_repository&&ctx.target_repository.reason?`: ${ctx.target_repository.reason}`:''}`};
    if(req.check==='target_repo_clean'){
      if(!ctx.target_repository||ctx.target_repository.status!=='RESOLVED') return {pass:false,reason:'target repository reality unresolved'};
      return ctx.target_repository.clean?{pass:true}:{pass:false,reason:`target repository is dirty (${ctx.target_repository.dirty_entry_count||0} entries)`};
    }
    if(req.check==='context_not_truncated'){
      // A truncated context silently drops sources the run believes it has. This
      // check makes that visible instead of letting the run proceed on a partial
      // pack. Gate severity (WARN vs BLOCK) is set per rigor mode in gates.json,
      // not here: whether truncation is tolerable is a policy call, not a fact.
      if(!ctx.context||ctx.context.status!=='RESOLVED') return {pass:true,reason:'no compiled context to evaluate'};
      if(!ctx.context.truncated) return {pass:true};
      return {pass:false,reason:`compiled context truncated at ${ctx.context.document_count}/${ctx.context.document_budget} documents, ${ctx.context.total_bytes}/${ctx.context.byte_budget} bytes — increase the rigor-mode budget or narrow the task`};
    }
    return {pass:false,reason:`unknown internal check ${req.check}`};
  }
  if(req.kind==='task_field_nonempty'){
    const v=taskField(ctx.task,req.field);
    return Array.isArray(v)?{pass:v.length>0,reason:v.length?'':`${req.field} is empty`}:{pass:Boolean(v),reason:v?'':`${req.field} is empty`};
  }
  if(req.kind==='claim'){
    const c=claims[req.claim], reason=claimFailure(req.claim,c,req.require_levels||[]);
    return reason?{pass:false,reason}:{pass:true};
  }
  if(req.kind==='each_primary_journey_claim'){
    const failures=[];
    for(const j of ctx.task.primary_journeys||[]){
      const key=req.claim_template.replace('{id}',j.id),reason=claimFailure(key,claims[key],req.require_levels||[]);
      if(reason) failures.push(reason);
    }
    return failures.length?{pass:false,reason:failures.join('; ')}:{pass:true};
  }
  if(req.kind==='claim_or_absent'){
    const trigger=claims[req.trigger_claim];
    if(!trigger||trigger.status!=='PASS') return {pass:true,reason:'trigger absent'};
    const reason=claimFailure(req.claim,claims[req.claim],req.require_levels||[]);
    return reason?{pass:false,reason}:{pass:true};
  }
  return {pass:false,reason:`unknown requirement kind ${req.kind}`};
}
function stageIncluded(stage,throughStage){
  if(!throughStage) return true;
  const a=STAGE_ORDER.indexOf(stage),b=STAGE_ORDER.indexOf(throughStage);
  if(a<0) throw new Error(`Unknown gate stage: ${stage}`);
  if(b<0) throw new Error(`Unknown through-stage: ${throughStage}`);
  return a<=b;
}
function evaluateGates(gatesCfg,ctx,evidence={version:1,claims:{}},options={}){
  const claims=evidence.claims||{},results=[],throughStage=options.throughStage||null;
  for(const gate of gatesCfg.gates){
    if(!stageIncluded(gate.stage,throughStage)||!applies(gate,ctx)) continue;
    const r=checkRequirement(gate.requirement,ctx,claims);
    results.push({id:gate.id,stage:gate.stage,severity:gate.severity,description:gate.description,status:r.pass?'PASS':'FAIL',reason:r.reason||''});
  }
  const blocking=results.filter(x=>x.severity==='BLOCK'&&x.status==='FAIL');
  return {verdict:blocking.length?'BLOCK':'PASS',through_stage:throughStage||'ALL',blocking_failures:blocking.length,results};
}
module.exports={evaluateGates,applies,checkRequirement,claimFailure,STAGE_ORDER,REQUIREMENT_KINDS,INTERNAL_CHECKS};
