#!/usr/bin/env node
const path=require('path');
const {readJson,writeJson}=require('./lib/io');
const {doctor,intake,buildTask,bootstrapTask,evaluateTask,learningCandidate}=require('./lib/runtime');
const {createSession,advanceSession,refreshTarget}=require('./lib/lifecycle');

function arg(name,args){const i=args.indexOf(name);return i>=0?args[i+1]:null;}
function usage(){console.log(`Project Second Brain Cognition Harness

Commands:
  doctor
  intake --intent <text> [--out <task.json>]
  classify --task <task.json>
  route --task <task.json>
  bootstrap --task <task.json> [--out <dir>]
  evaluate --task <task.json> --evidence <evidence.json> [--through <stage>]
  learn --task <task.json> --evidence <evidence.json> --failure <claim> [--proposal <text>] [--out <file.json>]
  session-create --task <task.json> --out <session.json> [--evidence <evidence.json>] [--through <stage>]
  session-advance --session <session.json> --task <task.json> --evidence <evidence.json> --to <stage> [--out <session.json>]
  session-refresh-target --session <session.json> --task <task.json> --reason <text> [--out <session.json>]

Transport-neutral agent adapter:
  node tools/harness/agent.js

Optional session signing:
  set PSB_HARNESS_SESSION_KEY in the harness server environment to HMAC-sign lifecycle sessions.
`);}
function loadTask(args){const v=arg('--task',args);if(!v) throw new Error('--task is required');const file=path.resolve(process.cwd(),v);return {task:readJson(file),base:path.dirname(file)};}
function loadEvidence(args,required=true){const v=arg('--evidence',args);if(!v){if(required) throw new Error('--evidence is required');return {version:1,claims:{}};}return readJson(path.resolve(process.cwd(),v));}
function main(){
  const args=process.argv.slice(2),cmd=args[0];if(!cmd||cmd==='help'||cmd==='--help'){usage();return;}
  if(cmd==='doctor'){const r=doctor();console.log(JSON.stringify(r,null,2));process.exitCode=r.verdict==='PASS'?0:2;return;}
  if(cmd==='intake'){const intent=arg('--intent',args);if(!intent) throw new Error('--intent is required');const r=intake({intent}),out=arg('--out',args);if(out) writeJson(path.resolve(process.cwd(),out),r.task);console.log(JSON.stringify(r,null,2));process.exitCode=r.stop?3:0;return;}
  const loaded=loadTask(args),task=loaded.task,taskBaseDir=loaded.base;
  if(cmd==='classify'){const r=buildTask(task,{taskBaseDir});console.log(JSON.stringify({classification:r.classification,signals:r.signals},null,2));process.exitCode=r.classification.status==='RESOLVED'?0:2;return;}
  if(cmd==='route'){const r=buildTask(task,{taskBaseDir});console.log(JSON.stringify({classification:r.classification,risk:r.risk,route:r.route,context_status:r.context.status,harness_git:r.harness_git,target_repository:r.target_repository},null,2));process.exitCode=r.classification.status==='RESOLVED'&&r.context.status==='RESOLVED'?0:2;return;}
  if(cmd==='bootstrap'){const r=bootstrapTask(task,{taskBaseDir,writeArtifacts:true,outputBase:path.resolve(process.cwd(),arg('--out',args)||'.harness')});console.log(JSON.stringify({run_id:r.run_id,output:r.output,classification:r.classification.status==='RESOLVED'?r.classification.type:'BLOCKED',rigor:r.risk&&r.risk.mode,lanes:r.route?r.route.lanes.length:0,context:r.context.status,gate_verdict:r.gates.verdict,harness_head:r.harness_git.head||null,target_head:r.target_repository.head||null},null,2));process.exitCode=r.classification.status!=='RESOLVED'||r.context.status!=='RESOLVED'?2:r.gates.verdict==='BLOCK'?3:0;return;}
  if(cmd==='evaluate'){const r=evaluateTask(task,loadEvidence(args),{taskBaseDir,throughStage:arg('--through',args)||'PRE_DELIVERY'});console.log(JSON.stringify(r,null,2));process.exitCode=r.verdict==='PASS'?0:3;return;}
  if(cmd==='learn'){const failure=arg('--failure',args);if(!failure) throw new Error('--failure is required');const r=learningCandidate(task,loadEvidence(args),{taskBaseDir,failureClaim:failure,proposal:arg('--proposal',args)||null}),out=arg('--out',args);if(out) writeJson(path.resolve(process.cwd(),out),r);console.log(JSON.stringify(r,null,2));return;}
  if(cmd==='session-create'){const out=arg('--out',args);if(!out) throw new Error('--out is required');const r=createSession(task,loadEvidence(args,false),{taskBaseDir,throughStage:arg('--through',args)||'BOOTSTRAP'});writeJson(path.resolve(process.cwd(),out),r);console.log(JSON.stringify({session_id:r.session_id,current_stage:r.current_stage,blocked_stage:r.blocked_stage,status:r.status,integrity_mode:r.integrity_mode,output:path.resolve(process.cwd(),out)},null,2));process.exitCode=r.status==='BLOCKED'?3:0;return;}
  if(cmd==='session-advance'){const sessionFile=arg('--session',args),to=arg('--to',args);if(!sessionFile||!to) throw new Error('--session and --to are required');const r=advanceSession(readJson(path.resolve(process.cwd(),sessionFile)),task,loadEvidence(args),to,{taskBaseDir}),out=arg('--out',args)||sessionFile;if(r.session) writeJson(path.resolve(process.cwd(),out),r.session);console.log(JSON.stringify({verdict:r.verdict,status:r.status,reason:r.reason||null,current_stage:r.session&&r.session.current_stage,blocked_stage:r.session&&r.session.blocked_stage,output:r.session?path.resolve(process.cwd(),out):null},null,2));process.exitCode=r.verdict==='PASS'?0:3;return;}
  if(cmd==='session-refresh-target'){const sessionFile=arg('--session',args),reason=arg('--reason',args);if(!sessionFile||!reason) throw new Error('--session and --reason are required');const r=refreshTarget(readJson(path.resolve(process.cwd(),sessionFile)),task,reason,{taskBaseDir}),out=arg('--out',args)||sessionFile;if(r.session) writeJson(path.resolve(process.cwd(),out),r.session);console.log(JSON.stringify({verdict:r.verdict,status:r.status,reason:r.reason||null,current_stage:r.session&&r.session.current_stage,target_head:r.session&&r.session.target_repository&&r.session.target_repository.head,output:r.session?path.resolve(process.cwd(),out):null},null,2));process.exitCode=r.verdict==='PASS'?0:3;return;}
  throw new Error(`Unknown command: ${cmd}`);
}
try{main();}catch(err){console.error(`HARNESS ERROR: ${err.message}`);process.exitCode=1;}
