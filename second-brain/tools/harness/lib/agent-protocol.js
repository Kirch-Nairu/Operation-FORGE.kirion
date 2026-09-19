const {doctor,intake,buildTask,bootstrapTask,evaluateTask,learningCandidate}=require('./runtime');
const {createSession,advanceSession,refreshTarget}=require('./lifecycle');

function compactBuild(run){return {task:run.task,classification:run.classification,signals:run.signals,risk:run.risk,route:run.route,context_status:run.context.status,gates:run.gates,harness_git:run.harness_git,target_repository:run.target_repository};}
function handleRequest(request,options={}){
  if(!request||typeof request!=='object') throw new Error('request must be an object');
  const op=request.operation;if(!op) throw new Error('operation is required');const root=options.root;
  if(op==='doctor') return doctor(root);
  if(op==='intake') return intake(request.input||request,{root,taskBaseDir:request.task_base_dir});
  if(op==='classify'){const run=buildTask(request.task,{root,taskBaseDir:request.task_base_dir});return {classification:run.classification,signals:run.signals};}
  if(op==='route') return compactBuild(buildTask(request.task,{root,taskBaseDir:request.task_base_dir}));
  if(op==='bootstrap'){
    const run=bootstrapTask(request.task,{root,taskBaseDir:request.task_base_dir,writeArtifacts:Boolean(request.write_artifacts),outputBase:request.output_base});
    const result={run_id:run.run_id,manifest:run.manifest,task:run.task,classification:run.classification,signals:run.signals,risk:run.risk,route:run.route,gates:run.gates,context_manifest:run.context_manifest};
    if(request.include_context!==false&&run.context.status==='RESOLVED') result.context_documents=run.context.documents;if(run.output) result.output=run.output;return result;
  }
  if(op==='evaluate') return evaluateTask(request.task,request.evidence,{root,taskBaseDir:request.task_base_dir,throughStage:request.through_stage||'PRE_DELIVERY'});
  if(op==='learning_candidate') return learningCandidate(request.task,request.evidence,{root,taskBaseDir:request.task_base_dir,failureClaim:request.failure_claim,throughStage:request.through_stage||'POST_VERIFY',proposal:request.proposal,scope:request.scope,confidence:request.confidence});
  if(op==='session_create') return createSession(request.task,request.evidence||{version:1,claims:{}},{root,taskBaseDir:request.task_base_dir,throughStage:request.through_stage||'BOOTSTRAP'});
  if(op==='session_advance') return advanceSession(request.session,request.task,request.evidence||{version:1,claims:{}},request.to_stage,{root,taskBaseDir:request.task_base_dir});
  if(op==='session_refresh_target') return refreshTarget(request.session,request.task,request.reason,{root,taskBaseDir:request.task_base_dir});
  throw new Error(`unknown operation: ${op}`);
}
module.exports={handleRequest};
