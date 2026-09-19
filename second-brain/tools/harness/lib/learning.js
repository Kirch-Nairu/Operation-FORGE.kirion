const {canonicalJson,sha256}=require('./io');

function createLearningCandidate({task,evidence,failureClaim,gateEvaluation=null,proposal=null,scope='HARNESS',confidence='MEDIUM'}){
  if(!task || !task.id) throw new Error('learning candidate requires a task');
  if(!evidence || !evidence.claims) throw new Error('learning candidate requires evidence claims');
  if(!failureClaim) throw new Error('learning candidate requires failureClaim');
  const claim=evidence.claims[failureClaim];
  if(!claim) throw new Error(`failure claim not found: ${failureClaim}`);
  if(claim.status!=='FAIL') throw new Error(`failure claim must have FAIL status: ${failureClaim}`);
  const levels=new Set(claim.levels||[]);
  if(!levels.has('OBSERVED')&&!levels.has('VERIFIED')) throw new Error('learning candidate requires an OBSERVED or VERIFIED failure');
  const failedGates=(gateEvaluation&&gateEvaluation.results||[]).filter(x=>x.status==='FAIL').map(x=>({id:x.id,stage:x.stage,severity:x.severity,reason:x.reason}));
  const basis={task_id:task.id,failure_claim:failureClaim,detail:claim.detail||'',source:claim.source||'',failed_gates:failedGates.map(x=>x.id)};
  return {
    version:1,
    id:`learning-${sha256(canonicalJson(basis)).slice(0,16)}`,
    task_id:task.id,
    failure_claim:failureClaim,
    observed_behavior:claim.detail||'Observed failure recorded without detail.',
    evidence_levels:[...(claim.levels||[])].sort(),
    evidence_source:claim.source||null,
    failed_gates:failedGates,
    proposed_change:proposal||null,
    scope,
    confidence,
    review_status:'PENDING_HUMAN_REVIEW',
    doctrine_mutated:false
  };
}
module.exports={createLearningCandidate};
