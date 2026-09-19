const fs=require('fs');
const path=require('path');
const {repoRoot,writeJson,canonicalJson,sha256,normalizeTask,loadConfig}=require('./io');
const {classifyTask,inferSignals,SIGNAL_KEYWORDS}=require('./classify');
const {scoreRisk,MODE_ORDER}=require('./risk');
const {routeTask,laneMap}=require('./route');
const {evaluateGates,STAGE_ORDER,REQUIREMENT_KINDS,INTERNAL_CHECKS}=require('./gates');
const {renderContext,renderRun}=require('./render');
const {probeGitRepository,runtimeFingerprint}=require('./git');
const {intakeTask}=require('./intake');
const {createLearningCandidate}=require('./learning');
const {compileSemanticContext,semanticProviderDoctor}=require('./semantic-provider');

function configFingerprint(cfg){
  return sha256(canonicalJson({manifest:cfg.manifest,lanes:cfg.lanes,taskTypes:cfg.taskTypes,risk:cfg.risk,routing:cfg.routing,gates:cfg.gates,evidence:cfg.evidence,semanticProvider:cfg.semanticProvider,routePack:cfg.routePack}));
}
function contextManifest(context){
  const {snapshot_path,snapshot_generated_at,snapshot_sha256,documents=[],...stable}=context||{};
  return {...stable,documents:documents.map(({content,...d})=>d)};
}
function resolveTargetRepository(task,taskBaseDir){
  if(!task.repository||!task.repository.path) return {status:'NOT_REQUESTED'};
  const p=path.isAbsolute(task.repository.path)?task.repository.path:path.resolve(taskBaseDir||process.cwd(),task.repository.path);
  return probeGitRepository(p);
}
function semanticOptions(cfg,options={}){
  return {provider:options.semanticProvider||process.env.PSB_SEMANTIC_PROVIDER||cfg.semanticProvider.default_provider,snapshotPath:options.semanticSnapshot||process.env.PSB_NOTION_SNAPSHOT,controlPlane:cfg.semanticProvider,routePack:cfg.routePack};
}
function buildTask(taskInput,options={}){
  const root=options.root||repoRoot(),cfg=loadConfig(root),task=normalizeTask(taskInput),classification=classifyTask(task,cfg.taskTypes),signals=inferSignals(task);
  const harness_git=probeGitRepository(root),target_repository=resolveTargetRepository(task,options.taskBaseDir),runtime_fingerprint=runtimeFingerprint(root),config_sha256=configFingerprint(cfg);
  if(classification.status!=='RESOLVED'){
    const context={status:'BLOCKED',provider:null,reason:'classification unresolved',documents:[],unresolved_links:[]};
    const gateCtx={task,type:null,classification,signals,risk:{mode:'LOW'},route:null,context,harness_git,target_repository};
    const gates=evaluateGates(cfg.gates,gateCtx,{version:1,claims:{}},{throughStage:'PRE_DESIGN'});
    return {cfg,task,classification,signals,risk:null,route:null,context,gates,gateCtx,harness_git,target_repository,runtime_fingerprint,config_sha256};
  }
  const risk=scoreRisk(task,classification.type,signals,cfg.risk);
  const stage=options.stage||'PRE_DESIGN';
  const route=routeTask(classification.type,signals,risk.mode,cfg.routing,cfg.lanes,cfg.manifest.control_roots,{stage});
  const context=compileSemanticContext(root,route,cfg.manifest,semanticOptions(cfg,options));
  const gateCtx={task,type:classification.type,classification,signals,risk,route,context,harness_git,target_repository};
  const gates=evaluateGates(cfg.gates,gateCtx,{version:1,claims:{}},{throughStage:'PRE_DESIGN'});
  return {cfg,task,classification,signals,risk,route,context,gates,gateCtx,harness_git,target_repository,runtime_fingerprint,config_sha256};
}
function computeRun(run){
  const task_sha256=sha256(canonicalJson(run.task)),cm=contextManifest(run.context),context_sha256=run.context.status==='RESOLVED'?sha256(canonicalJson(cm)):null;
  const basis={harness_version:run.cfg.manifest.version,protocol_version:run.cfg.manifest.protocol_version,runtime_sha256:run.runtime_fingerprint.sha256,config_sha256:run.config_sha256,task_sha256,classification:run.classification,risk:run.risk,route:run.route&&{lanes:run.route.lanes.map(x=>x.id),deferred:(run.route.deferred_lanes||[]).map(x=>x.id),stage:run.route.evaluated_stage,signals:run.route.active_signals},semantic_provider:run.context.provider||null,context_sha256};
  return {run_id:sha256(canonicalJson(basis)).slice(0,20),task_sha256,context_sha256,context_manifest:cm};
}
function bootstrapTask(taskInput,options={}){
  const run=buildTask(taskInput,options),ids=computeRun(run);
  const manifest={run_id:ids.run_id,protocol_version:run.cfg.manifest.protocol_version,harness_version:run.cfg.manifest.version,runtime_sha256:run.runtime_fingerprint.sha256,config_sha256:run.config_sha256,task_sha256:ids.task_sha256,context_sha256:ids.context_sha256,semantic_provider:run.context.provider||null,semantic_snapshot_sha256:run.context.snapshot_sha256||null,harness_git:run.harness_git,target_repository:run.target_repository};
  const report={...run,...ids,manifest};
  if(options.writeArtifacts){
    const outBase=path.resolve(options.outputBase||'.harness'),out=path.join(outBase,'runs',ids.run_id);
    fs.mkdirSync(out,{recursive:true});
    writeJson(path.join(out,'task.normalized.json'),run.task); writeJson(path.join(out,'classification.json'),run.classification); writeJson(path.join(out,'signals.json'),run.signals);
    if(run.risk) writeJson(path.join(out,'risk.json'),run.risk); if(run.route) writeJson(path.join(out,'route.json'),run.route);
    writeJson(path.join(out,'context.manifest.json'),ids.context_manifest); writeJson(path.join(out,'gates.json'),run.gates); writeJson(path.join(out,'run.manifest.json'),manifest);
    if(run.context.status==='RESOLVED') fs.writeFileSync(path.join(out,'CONTEXT.md'),renderContext(run.context,{harnessVersion:run.cfg.manifest.version,taskId:run.task.id,type:run.classification.type,mode:run.risk.mode}),'utf8');
    fs.writeFileSync(path.join(out,'RUN.md'),renderRun({...report,run_id:ids.run_id}),'utf8'); report.output=out;
  }
  return report;
}
function evaluateTask(taskInput,evidence,options={}){const run=buildTask(taskInput,options),ctx=run.gateCtx,throughStage=options.throughStage||'PRE_DELIVERY';return {...evaluateGates(run.cfg.gates,ctx,evidence||{version:1,claims:{}},{throughStage}),run:computeRun(run)};}
function intake(input,options={}){const task=intakeTask(input),run=buildTask(task,options);return {task,classification:run.classification,signals:run.signals,risk:run.risk,route:run.route,gates:run.gates,semantic_provider:run.context.provider||null,stop:run.gates.verdict==='BLOCK'||run.classification.status!=='RESOLVED'};}
function learningCandidate(taskInput,evidence,options={}){const run=buildTask(taskInput,options),gateEvaluation=evaluateGates(run.cfg.gates,run.gateCtx,evidence||{version:1,claims:{}},{throughStage:options.throughStage||'POST_VERIFY'});return createLearningCandidate({task:run.task,evidence,failureClaim:options.failureClaim,gateEvaluation,proposal:options.proposal||null,scope:options.scope||'HARNESS',confidence:options.confidence||'MEDIUM'});}
function doctor(root=repoRoot(),options={}){
  const cfg=loadConfig(root),errors=[],warnings=[],map=laneMap(cfg.lanes),signalNames=new Set(Object.keys(SIGNAL_KEYWORDS)),typeIds=cfg.taskTypes.types.map(x=>x.id),typeSet=new Set(typeIds),lanePaths=new Set();
  if(map.size!==23) errors.push(`Expected 23 semantic lanes, found ${map.size}.`); if(typeSet.size!==typeIds.length) errors.push('Duplicate task type id detected.');
  for(const lane of map.values()){if(lanePaths.has(lane.path)) errors.push(`Duplicate lane path: ${lane.path}`);lanePaths.add(lane.path);if(!fs.existsSync(path.join(root,...lane.path.split('/')))) errors.push(`Missing lane source: ${lane.path}`);}
  for(const p of cfg.manifest.control_roots) if(!fs.existsSync(path.join(root,...p.split('/')))) errors.push(`Missing control root: ${p}`);
  for(const type of typeIds){if(!cfg.risk.base[type]) errors.push(`Missing risk baseline for ${type}`);if(!cfg.risk.type_floors[type]) errors.push(`Missing risk floor for ${type}`);if(!cfg.routing.by_task[type]) errors.push(`Missing task routing for ${type}`);}
  for(const key of Object.keys(cfg.risk.base)) if(!typeSet.has(key)) errors.push(`Risk baseline references unknown task type ${key}`); for(const key of Object.keys(cfg.risk.type_floors)) if(!typeSet.has(key)) errors.push(`Risk floor references unknown task type ${key}`); for(const key of Object.keys(cfg.routing.by_task)) if(!typeSet.has(key)) errors.push(`Task routing references unknown task type ${key}`);
  for(const dim of cfg.risk.dimensions){if(typeof cfg.risk.weights[dim]!=='number') errors.push(`Missing risk weight for ${dim}`);for(const type of typeIds) if(!cfg.risk.base[type]||typeof cfg.risk.base[type][dim]!=='number') errors.push(`Risk baseline ${type} missing dimension ${dim}`);}
  const validateLaneIds=(label,ids)=>{for(const id of ids||[]) if(!map.has(id)) errors.push(`${label} references unknown lane ${id}`);}; validateLaneIds('always routing',cfg.routing.always); for(const [type,ids] of Object.entries(cfg.routing.by_task)) validateLaneIds(`routing ${type}`,ids); for(const [signal,ids] of Object.entries(cfg.routing.by_signal)){if(!signalNames.has(signal)) errors.push(`Routing references unknown signal ${signal}`);validateLaneIds(`signal routing ${signal}`,ids);} for(const [mode,ids] of Object.entries(cfg.routing.by_mode)){if(!MODE_ORDER.includes(mode)) errors.push(`Routing references unknown rigor mode ${mode}`);validateLaneIds(`mode routing ${mode}`,ids);} for(const mode of MODE_ORDER) if(typeof cfg.manifest.context.default_link_depth[mode]!=='number') errors.push(`Missing context link depth for ${mode}`); for(const laneId of Object.keys(cfg.routePack.by_lane||{})) if(!map.has(laneId)) errors.push(`Notion route pack references unknown lane ${laneId}`);
  const evidenceLevels=new Set(Object.keys(cfg.evidence.capabilities||{})),gateIds=new Set();
  for(const gate of cfg.gates.gates){if(gateIds.has(gate.id)) errors.push(`Duplicate gate id: ${gate.id}`);gateIds.add(gate.id);if(!STAGE_ORDER.includes(gate.stage)) errors.push(`Gate ${gate.id} has unknown stage ${gate.stage}`);if(!['BLOCK','WARN'].includes(gate.severity)) errors.push(`Gate ${gate.id} has unknown severity ${gate.severity}`);if(!gate.requirement||!REQUIREMENT_KINDS.includes(gate.requirement.kind)) errors.push(`Gate ${gate.id} has unknown requirement kind ${gate.requirement&&gate.requirement.kind}`);if(gate.requirement&&gate.requirement.kind==='internal'&&!INTERNAL_CHECKS.includes(gate.requirement.check)) errors.push(`Gate ${gate.id} has unknown internal check ${gate.requirement.check}`);for(const level of gate.requirement&&gate.requirement.require_levels||[]) if(!evidenceLevels.has(level)) errors.push(`Gate ${gate.id} requires unknown evidence capability ${level}`);for(const signal of [...(gate.applies&&gate.applies.signals_any||[]),...(gate.applies&&gate.applies.signals_all||[])]) if(!signalNames.has(signal)) errors.push(`Gate ${gate.id} references unknown signal ${signal}`);for(const type of gate.applies&&gate.applies.task_types||[]) if(!typeSet.has(type)) errors.push(`Gate ${gate.id} references unknown task type ${type}`);for(const mode of gate.applies&&gate.applies.risk_modes||[]) if(!MODE_ORDER.includes(mode)) errors.push(`Gate ${gate.id} references unknown risk mode ${mode}`);}
  for(const name of ['task.schema.json','evidence.schema.json','decision.schema.json','learning-candidate.schema.json','notion-semantic-snapshot.schema.json']){const file=path.join(root,'harness','schema',name);if(!fs.existsSync(file)){errors.push(`Missing schema ${name}`);continue;}try{JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){errors.push(`Invalid JSON schema ${name}: ${e.message}`);}}
  const provider=semanticProviderDoctor(root,cfg.manifest,cfg.semanticProvider,cfg.routePack,{provider:options.semanticProvider||process.env.PSB_SEMANTIC_PROVIDER,snapshotPath:options.semanticSnapshot||process.env.PSB_NOTION_SNAPSHOT}); errors.push(...(provider.errors||[])); warnings.push(...(provider.warnings||[]));
  const provenance=probeGitRepository(root),fingerprint=runtimeFingerprint(root); if(provenance.status!=='RESOLVED') warnings.push(`Harness Git provenance unresolved: ${provenance.reason||provenance.status}`); else if(!provenance.clean) warnings.push(`Harness worktree is dirty (${provenance.dirty_entry_count} entries); source hashes remain authoritative for this run.`);
  return {verdict:errors.length?'BLOCK':'PASS',harness_version:cfg.manifest.version,protocol_version:cfg.manifest.protocol_version,lane_count:map.size,task_type_count:typeIds.length,gate_count:cfg.gates.gates.length,runtime_sha256:fingerprint.sha256,semantic_provider:provider,git:provenance,errors,warnings};
}
module.exports={buildTask,bootstrapTask,evaluateTask,intake,learningCandidate,doctor,computeRun,contextManifest,configFingerprint};
