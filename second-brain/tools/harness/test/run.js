// Harness unit tests.
//
// These tests exercise harness logic in isolation and must not depend on an
// operator's Notion credentials or on a snapshot that exists only on one machine.
// The suite therefore pins the GIT semantic provider before any harness module is
// loaded. Previously the suite inherited whatever provider the environment
// implied and failed on a clean checkout with a snapshot-missing error that looked
// like a logic failure. Provider selection itself is covered separately in
// test/semantic-provider.js, which sets its own provider explicitly.
process.env.PSB_SEMANTIC_PROVIDER = 'GIT';

const assert=require('assert');
const fs=require('fs');
const os=require('os');
const path=require('path');
const {spawnSync}=require('child_process');
const {normalizeTask}=require('../lib/io');
const {classifyTask,inferSignals}=require('../lib/classify');
const {scoreRisk}=require('../lib/risk');
const {routeTask}=require('../lib/route');
const {compileContext}=require('../lib/context');
const {evaluateGates}=require('../lib/gates');
const {buildTask,computeRun,intake,learningCandidate}=require('../lib/runtime');
const {createSession,advanceSession,refreshTarget,verifySessionIntegrity}=require('../lib/lifecycle');
const {handleRequest}=require('../lib/agent-protocol');

const repo=path.resolve(__dirname,'..','..','..');
const cfg={
  manifest:require(path.join(repo,'harness/HARNESS_MANIFEST.json')),
  lanes:require(path.join(repo,'harness/config/lane-registry.json')),
  taskTypes:require(path.join(repo,'harness/config/task-types.json')),
  risk:require(path.join(repo,'harness/config/risk-model.json')),
  routing:require(path.join(repo,'harness/config/routing-rules.json')),
  gates:require(path.join(repo,'harness/config/gates.json'))
};
let count=0;
function test(name,fn){fn();count++;console.log(`PASS ${name}`);}
function emptyEvidence(){return {version:1,claims:{}};}
function git(cwd,args){const r=spawnSync('git',['-C',cwd,...args],{encoding:'utf8',windowsHide:true});if(r.status!==0) throw new Error(`git ${args.join(' ')} failed: ${(r.stderr||r.stdout||'').trim()}`);return (r.stdout||'').trim();}
function makeTargetRepo(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'harness-target-'));
  git(tmp,['init']);git(tmp,['config','user.email','harness@example.test']);git(tmp,['config','user.name','Harness Test']);
  fs.writeFileSync(path.join(tmp,'fixture.txt'),'v1\n');git(tmp,['add','fixture.txt']);git(tmp,['commit','-m','initial']);
  return tmp;
}
function bugTask(extra={}){return {version:1,id:'bug-lifecycle',intent:'Fix a broken rendering bug',type:'BUG_FIX',...extra};}

test('explicit classification is authoritative',()=>{
  const t=normalizeTask({version:1,id:'x',intent:'do work',type:'BUG_FIX'});
  assert.equal(classifyTask(t,cfg.taskTypes).type,'BUG_FIX');
});

test('deterministic keyword classification resolves obvious server bug',()=>{
  const t=normalizeTask({version:1,id:'x',intent:'Fix a broken asset route returning server error undefined method'});
  assert.equal(classifyTask(t,cfg.taskTypes).type,'BUG_FIX');
});

test('ambiguous or vague intake fails closed',()=>{
  const result=intake({intent:'Make it better'});
  assert.equal(result.classification.status,'BLOCKED');
  assert.equal(result.stop,true);
});

test('signals derive offline/data/auth concerns from raw intent',()=>{
  const s=inferSignals(normalizeTask({version:1,id:'x',intent:'Build a secure offline database app with login'}));
  assert(s.offline&&s.data&&s.auth&&s.security);
});

test('production recovery is forced CRITICAL',()=>{
  const t=normalizeTask({version:1,id:'x',intent:'restore production',type:'PRODUCTION_RECOVERY',signals:{production:true,recovery:true}});
  const s=inferSignals(t),r=scoreRisk(t,'PRODUCTION_RECOVERY',s,cfg.risk);
  assert.equal(r.mode,'CRITICAL');
});

test('greenfield routing traverses multiple cognition families',()=>{
  const t=normalizeTask({version:1,id:'x',intent:'Build a secure offline app',type:'GREENFIELD_SYSTEM',signals:{offline:true,auth:true,data:true}});
  const s=inferSignals(t),r=scoreRisk(t,t.type,s,cfg.risk),route=routeTask(t.type,s,r.mode,cfg.routing,cfg.lanes,cfg.manifest.control_roots);
  assert(route.routed_lane_count>=12);assert(route.routed_families.length>=6);
});

test('stage scoping narrows active lanes without dropping routed lanes',()=>{
  const t=normalizeTask({version:1,id:'x',intent:'Build a secure offline app',type:'GREENFIELD_SYSTEM',signals:{offline:true,auth:true,data:true,deployment:true}});
  const s=inferSignals(t),r=scoreRisk(t,t.type,s,cfg.risk);
  const early=routeTask(t.type,s,r.mode,cfg.routing,cfg.lanes,cfg.manifest.control_roots,{stage:'PRE_DESIGN'});
  const late=routeTask(t.type,s,r.mode,cfg.routing,cfg.lanes,cfg.manifest.control_roots,{stage:'PRE_DELIVERY'});
  // deferral narrows the seeded context
  assert(early.active_lane_count<early.routed_lane_count);
  assert(early.active_lane_count<late.active_lane_count);
  // but never loses a lane: active + deferred always reconstructs the full route
  for(const route of [early,late]) assert.equal(route.lanes.length+route.deferred_lanes.length,route.routed_lane_count);
  // and the routed set itself is stage-independent
  assert.equal(early.routed_lane_count,late.routed_lane_count);
});

test('every registered lane has a declared stage scope',()=>{
  const ids=Object.values(cfg.lanes.families).flat().map(x=>x.id);
  for(const id of ids) assert(cfg.routing.stage_scope[id],`lane ${id} has no stage_scope`);
  assert.equal(Object.keys(cfg.routing.stage_scope).length,ids.length);
});

test('incident response is floored at POST_DEPLOY regardless of requested stage',()=>{
  const t=normalizeTask({version:1,id:'x',intent:'active incident, service down',type:'INCIDENT_RESPONSE',signals:{incident:true,production:true}});
  const s=inferSignals(t),r=scoreRisk(t,t.type,s,cfg.risk);
  const route=routeTask(t.type,s,r.mode,cfg.routing,cfg.lanes,cfg.manifest.control_roots,{stage:'PRE_DESIGN'});
  assert.equal(route.evaluated_stage,'POST_DEPLOY');
  assert.equal(route.deferred_lanes.length,0);
});

test('context compiler blocks missing required sources',()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'harness-')),route={rigor_mode:'LOW',control_roots:['missing.md'],lanes:[]};
  assert.equal(compileContext(tmp,route,cfg.manifest).status,'BLOCKED');
});

test('context compiler follows resolvable graph links and hashes content',()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'harness-'));fs.mkdirSync(path.join(tmp,'cognitive-os'),{recursive:true});fs.writeFileSync(path.join(tmp,'cognitive-os','root.md'),'root [[Concept]]');fs.mkdirSync(path.join(tmp,'mesh'),{recursive:true});fs.writeFileSync(path.join(tmp,'mesh','Concept.md'),'concept');
  const c=compileContext(tmp,{rigor_mode:'LOW',control_roots:['cognitive-os/root.md'],lanes:[]},{context:{...cfg.manifest.context,ignored_directories:[]}});
  assert.equal(c.status,'RESOLVED');assert.equal(c.documents.length,2);assert.equal(c.documents[0].sha256.length,64);
});

test('run id is deterministic for unchanged cognition state',()=>{
  const task=bugTask(),a=computeRun(buildTask(task)),b=computeRun(buildTask(task));
  assert.equal(a.run_id,b.run_id);assert.equal(a.task_sha256,b.task_sha256);assert.equal(a.context_sha256,b.context_sha256);
});

test('agent protocol classification matches reusable runtime core',()=>{
  const task=bugTask(),core=buildTask(task),agent=handleRequest({operation:'classify',task});
  assert.deepEqual(agent.classification,core.classification);assert.deepEqual(agent.signals,core.signals);
});

test('unresolved declared target repository blocks bootstrap',()=>{
  const missing=path.join(os.tmpdir(),`does-not-exist-${process.pid}-${Date.now()}`),run=buildTask(bugTask({repository:{path:missing}}));
  assert.equal(run.gates.verdict,'BLOCK');assert(run.gates.results.some(x=>x.id==='GATE-BOOT-TARGET-REALITY'&&x.status==='FAIL'));
});

test('missing primary route observation blocks delivery',()=>{
  const task=normalizeTask({version:1,id:'sentinel',intent:'build app',type:'GREENFIELD_SYSTEM',signals:{auth:true,data:true},primary_journeys:[{id:'asset-detail',description:'open asset'}]});
  const classification={status:'RESOLVED',type:'GREENFIELD_SYSTEM'},signals=inferSignals(task),risk=scoreRisk(task,'GREENFIELD_SYSTEM',signals,cfg.risk),ctx={task,type:'GREENFIELD_SYSTEM',classification,signals,risk,context:{status:'RESOLVED'},target_repository:{status:'NOT_REQUESTED'}};
  const ev={version:1,claims:{'design.authority_boundaries':{status:'PASS',levels:['INTENDED']},'decision.architecture':{status:'PASS',levels:['INTENDED']},'verification.automated':{status:'PASS',levels:['TESTED']},'verification.authorization_negative':{status:'PASS',levels:['TESTED']},'delivery.source_state':{status:'PASS',levels:['DURABLE']}}};
  const result=evaluateGates(cfg.gates,ctx,ev,{throughStage:'PRE_DELIVERY'});
  assert.equal(result.verdict,'BLOCK');assert(result.results.some(x=>x.id==='GATE-VERIFY-PRIMARY-RUNTIME'&&x.status==='FAIL'));
});

test('explicit observed runtime failure blocks even when automated verification passed',()=>{
  const task=normalizeTask({version:1,id:'sentinel',intent:'build app',type:'GREENFIELD_SYSTEM',primary_journeys:[{id:'asset-detail',description:'open asset'}]});
  const classification={status:'RESOLVED',type:'GREENFIELD_SYSTEM'},signals=inferSignals(task),risk=scoreRisk(task,'GREENFIELD_SYSTEM',signals,cfg.risk),ctx={task,type:'GREENFIELD_SYSTEM',classification,signals,risk,context:{status:'RESOLVED'},target_repository:{status:'NOT_REQUESTED'}};
  const ev={version:1,claims:{'verification.automated':{status:'PASS',levels:['TESTED']},'journey.asset-detail.runtime':{status:'FAIL',levels:['OBSERVED'],detail:'GET /assets/{asset} returned HTTP 500'},'delivery.source_state':{status:'PASS',levels:['DURABLE']},'decision.architecture':{status:'PASS',levels:['INTENDED']}}};
  const result=evaluateGates(cfg.gates,ctx,ev,{throughStage:'PRE_DELIVERY'}),gate=result.results.find(x=>x.id==='GATE-VERIFY-PRIMARY-RUNTIME');
  assert.equal(result.verdict,'BLOCK');assert(gate.reason.includes('HTTP 500'));
});

test('observed primary route closes the specific runtime gate',()=>{
  const task=normalizeTask({version:1,id:'sentinel',intent:'build app',type:'GREENFIELD_SYSTEM',primary_journeys:[{id:'asset-detail',description:'open asset'}]});
  const classification={status:'RESOLVED',type:'GREENFIELD_SYSTEM'},signals=inferSignals(task),risk=scoreRisk(task,'GREENFIELD_SYSTEM',signals,cfg.risk),ctx={task,type:'GREENFIELD_SYSTEM',classification,signals,risk,context:{status:'RESOLVED'},target_repository:{status:'NOT_REQUESTED'}},ev={version:1,claims:{'journey.asset-detail.runtime':{status:'PASS',levels:['OBSERVED']}}};
  const gate=evaluateGates(cfg.gates,ctx,ev,{throughStage:'PRE_DELIVERY'}).results.find(x=>x.id==='GATE-VERIFY-PRIMARY-RUNTIME');assert(gate&&gate.status==='PASS');
});

test('truncated context is a WARN below CRITICAL rigor and a BLOCK at CRITICAL',()=>{
  const gatesCfg=require('../../../harness/config/gates.json');
  const base=(mode,truncated)=>({task:{},type:'GREENFIELD_SYSTEM',classification:{status:'RESOLVED'},signals:{},risk:{mode},route:{},
    context:{status:'RESOLVED',truncated,document_count:1,document_budget:1,total_bytes:1,byte_budget:1},
    target_repository:{status:'NOT_REQUESTED'}});
  const find=(mode,truncated)=>{
    const r=evaluateGates(gatesCfg,base(mode,truncated),{version:1,claims:{}},{throughStage:'PRE_DESIGN'});
    return r.results.find(x=>x.id.startsWith('GATE-DESIGN-CONTEXT-COMPLETE'));
  };
  assert.equal(find('HIGH',false).status,'PASS');
  const warnHit=find('HIGH',true); assert.equal(warnHit.status,'FAIL'); assert.equal(warnHit.severity,'WARN');
  const blockHit=find('CRITICAL',true); assert.equal(blockHit.status,'FAIL'); assert.equal(blockHit.severity,'BLOCK');
  // a WARN-severity failure must not itself flip the run verdict to BLOCK
  const warnOnly=evaluateGates({gates:gatesCfg.gates.filter(g=>g.id==='GATE-DESIGN-CONTEXT-COMPLETE')},base('HIGH',true),{version:1,claims:{}},{throughStage:'PRE_DESIGN'});
  assert.equal(warnOnly.verdict,'PASS');
  const blockOnly=evaluateGates({gates:gatesCfg.gates.filter(g=>g.id==='GATE-DESIGN-CONTEXT-COMPLETE-CRITICAL')},base('CRITICAL',true),{version:1,claims:{}},{throughStage:'PRE_DESIGN'});
  assert.equal(blockOnly.verdict,'BLOCK');
});

test('no rigor mode or lifecycle stage truncates the compiled context for the shipped mesh',()=>{
  const {compileContext}=require('../lib/context');
  const {routeTask}=require('../lib/route');
  const routing=require('../../../harness/config/routing-rules.json');
  const registry=require('../../../harness/config/lane-registry.json');
  const manifest=require('../../../harness/HARNESS_MANIFEST.json');
  const sigSets={
    LOW:{ui:true}, MEDIUM:{ui:true,data:true},
    HIGH:{ui:true,data:true,auth:true,security:true,offline:true,recovery:true,deployment:true,production:true},
    CRITICAL:{ui:true,data:true,auth:true,security:true,offline:true,recovery:true,deployment:true,production:true,privacy:true,supply_chain:true,distributed:true,ai:true,incident:true}
  };
  const typesByMode={LOW:'BUG_FIX',MEDIUM:'EXISTING_SYSTEM_FEATURE',HIGH:'GREENFIELD_SYSTEM',CRITICAL:'GREENFIELD_SYSTEM'};
  for(const mode of ['LOW','MEDIUM','HIGH','CRITICAL']){
    for(const stage of ['PRE_DESIGN','PRE_IMPLEMENTATION','PRE_DELIVERY','POST_DEPLOY']){
      const route=routeTask(typesByMode[mode],sigSets[mode],mode,routing,registry,manifest.control_roots,{stage});
      const c=compileContext(path.join(__dirname,'..','..','..'),route,manifest);
      assert(!c.truncated,`${mode}/${stage} truncated at ${c.document_count}/${c.document_budget} docs, ${c.total_bytes}/${c.byte_budget} bytes`);
    }
  }
});

test('lifecycle advances sequentially and rejects stage skipping',()=>{
  const task=bugTask();let session=createSession(task,emptyEvidence(),{throughStage:'BOOTSTRAP'});assert.equal(session.current_stage,'BOOTSTRAP');
  let result=advanceSession(session,task,emptyEvidence(),'PRE_DESIGN');assert.equal(result.status,'ADVANCED');session=result.session;
  result=advanceSession(session,task,emptyEvidence(),'PRE_DELIVERY');assert.equal(result.verdict,'BLOCK');assert.equal(result.status,'INVALID_TRANSITION');
});

test('changed task makes an existing lifecycle session stale',()=>{
  const task=bugTask(),session=createSession(task,emptyEvidence(),{throughStage:'BOOTSTRAP'}),changed={...task,intent:'Fix a different rendering bug'};
  const result=advanceSession(session,changed,emptyEvidence(),'PRE_DESIGN');assert.equal(result.verdict,'BLOCK');assert.equal(result.status,'STALE');assert(result.changed.includes('task_sha256'));
});

test('session history and envelope are tamper-evident',()=>{
  const task=bugTask(),session=createSession(task,emptyEvidence(),{throughStage:'BOOTSTRAP'}),tampered={...session,current_stage:'POST_VERIFY'};
  const result=advanceSession(tampered,task,emptyEvidence(),'PRE_DESIGN');assert.equal(result.status,'TAMPERED');
});

test('HMAC lifecycle sessions require the server-held signing key',()=>{
  const task=bugTask(),session=createSession(task,emptyEvidence(),{throughStage:'BOOTSTRAP',sessionKey:'test-secret'});assert.equal(session.integrity_mode,'HMAC_SHA256');assert.equal(verifySessionIntegrity(session,{sessionKey:'test-secret'}).valid,true);assert.equal(verifySessionIntegrity(session).valid,false);
  const result=advanceSession(session,task,emptyEvidence(),'PRE_DESIGN',{sessionKey:'test-secret'});assert.equal(result.verdict,'PASS');
});

test('target repository drift requires an explicit clean checkpoint refresh',()=>{
  const target=makeTargetRepo(),task=bugTask({repository:{path:target}});let session=createSession(task,emptyEvidence(),{throughStage:'BOOTSTRAP'});
  let result=advanceSession(session,task,emptyEvidence(),'PRE_DESIGN');assert.equal(result.verdict,'PASS');session=result.session;
  result=advanceSession(session,task,emptyEvidence(),'PRE_IMPLEMENTATION');assert.equal(result.verdict,'PASS');session=result.session;
  fs.writeFileSync(path.join(target,'fixture.txt'),'v2\n');git(target,['add','fixture.txt']);git(target,['commit','-m','implementation']);
  const delivery={version:1,claims:{'verification.automated':{status:'PASS',levels:['TESTED']},'delivery.source_state':{status:'PASS',levels:['DURABLE']}}};
  result=advanceSession(session,task,delivery,'PRE_DELIVERY');assert.equal(result.status,'TARGET_DRIFT');
  result=refreshTarget(session,task,'implementation committed and clean');assert.equal(result.status,'TARGET_REFRESHED');session=result.session;
  result=advanceSession(session,task,delivery,'PRE_DELIVERY');assert.equal(result.verdict,'PASS');assert.equal(result.session.current_stage,'PRE_DELIVERY');
});

test('dirty target repositories cannot be adopted as lifecycle checkpoints',()=>{
  const target=makeTargetRepo(),task=bugTask({repository:{path:target}});let session=createSession(task,emptyEvidence(),{throughStage:'BOOTSTRAP'});
  session=advanceSession(session,task,emptyEvidence(),'PRE_DESIGN').session;session=advanceSession(session,task,emptyEvidence(),'PRE_IMPLEMENTATION').session;fs.writeFileSync(path.join(target,'fixture.txt'),'dirty\n');
  const result=refreshTarget(session,task,'try to adopt dirty state');assert.equal(result.verdict,'BLOCK');assert.equal(result.status,'TARGET_DIRTY');
});

test('observed runtime failure produces review-only learning candidate',()=>{
  const task=bugTask(),ev={version:1,claims:{'runtime.failure_discovered':{status:'FAIL',levels:['OBSERVED'],detail:'primary route returned HTTP 500',source:'independent runtime execution'}}},candidate=learningCandidate(task,ev,{failureClaim:'runtime.failure_discovered',proposal:'require route-level runtime evidence'});
  assert.equal(candidate.review_status,'PENDING_HUMAN_REVIEW');assert.equal(candidate.doctrine_mutated,false);assert.equal(candidate.observed_behavior,'primary route returned HTTP 500');
});

console.log(`\n${count} harness tests passed.`);
