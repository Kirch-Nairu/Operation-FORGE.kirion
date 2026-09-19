#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {McpServer,createMcpHandler} from '@modelcontextprotocol/server';
import {serveStdio} from '@modelcontextprotocol/server/stdio';
import {localhostHostValidation,localhostOriginValidation,toNodeHandler} from '@modelcontextprotocol/node';
import * as z from 'zod/v4';
import {SessionStore,defaultStateDirectory} from './store.mjs';

const require=createRequire(import.meta.url);
const here=path.dirname(fileURLToPath(import.meta.url));
const repoRoot=path.resolve(here,'..','..','..');
const runtime=require('../lib/runtime.js');
const lifecycle=require('../lib/lifecycle.js');
const store=new SessionStore();

const journeySchema=z.object({id:z.string().regex(/^[a-z0-9][a-z0-9._-]*$/),description:z.string().min(1),method:z.string().optional(),path:z.string().optional()});
const taskSchema=z.object({
  version:z.literal(1),id:z.string().min(1),intent:z.string().min(1),type:z.string().optional(),
  constraints:z.array(z.string()).optional(),signals:z.record(z.string(),z.boolean()).optional(),risk_overrides:z.record(z.string(),z.number().int().min(0).max(4)).optional(),
  primary_journeys:z.array(journeySchema).optional(),repository:z.object({path:z.string().optional(),branch:z.string().optional(),sha:z.string().optional()}).optional(),acceptance:z.array(z.string()).optional()
});
const claimSchema=z.object({status:z.enum(['PASS','FAIL','UNKNOWN']),levels:z.array(z.enum(['INTENDED','IMPLEMENTED','TESTED','OBSERVED','DURABLE','DEPLOYED','VERIFIED'])),detail:z.string().optional(),source:z.string().optional(),sha:z.string().optional(),observed_at:z.string().optional()});
const evidenceSchema=z.object({version:z.literal(1),claims:z.record(z.string(),claimSchema)});
const intakeSchema=z.object({intent:z.string().min(1),id:z.string().optional(),type:z.string().optional(),constraints:z.array(z.string()).optional(),signals:z.record(z.string(),z.boolean()).optional(),risk_overrides:z.record(z.string(),z.number().int().min(0).max(4)).optional(),primary_journeys:z.array(journeySchema).optional(),repository:z.object({path:z.string().optional(),branch:z.string().optional(),sha:z.string().optional()}).optional(),acceptance:z.array(z.string()).optional()});
const stageSchema=z.enum(['BOOTSTRAP','PRE_DESIGN','PRE_IMPLEMENTATION','PRE_DELIVERY','POST_DEPLOY','POST_VERIFY']);

function output(data,summary){return {content:[{type:'text',text:summary||JSON.stringify(data)}],structuredContent:data};}
function errorMessage(err){return err instanceof Error?err.message:String(err);}
function toolHandler(fn){return async args=>{try{return await fn(args);}catch(err){return {isError:true,content:[{type:'text',text:`HARNESS ERROR: ${errorMessage(err)}`}],structuredContent:{error:errorMessage(err)}};}};}
function allowedRoots(){
  const raw=process.env.PSB_HARNESS_ALLOWED_REPO_ROOTS||'';
  return raw.split(path.delimiter).map(x=>x.trim()).filter(Boolean).map(x=>path.resolve(x));
}
function within(candidate,root){const rel=path.relative(root,candidate);return rel===''||(!rel.startsWith('..')&&!path.isAbsolute(rel));}
function normalizeServerTask(input){
  const task=JSON.parse(JSON.stringify(input));
  if(task.repository&&task.repository.path){
    const candidate=path.resolve(task.repository.path),roots=allowedRoots();
    if(!roots.length) throw new Error('repository.path is disabled until PSB_HARNESS_ALLOWED_REPO_ROOTS is configured');
    if(!roots.some(root=>within(candidate,root))) throw new Error(`repository.path is outside PSB_HARNESS_ALLOWED_REPO_ROOTS: ${candidate}`);
    task.repository.path=candidate;
  }
  return task;
}
function doctorFull(){
  const result=runtime.doctor(repoRoot),errors=[...(result.errors||[])];
  const file=path.join(repoRoot,'harness','schema','session.schema.json');
  if(!fs.existsSync(file)) errors.push('Missing schema session.schema.json');
  else {try{JSON.parse(fs.readFileSync(file,'utf8'));}catch(err){errors.push(`Invalid JSON schema session.schema.json: ${errorMessage(err)}`);}}
  return {...result,verdict:errors.length?'BLOCK':'PASS',errors};
}
function loadVerifiedSession(id){
  const session=store.load(id),verification=lifecycle.verifySessionIntegrity(session);
  if(!verification.valid) throw new Error(`stored lifecycle session failed integrity verification: ${verification.reason}`);
  return session;
}
function createHarnessServer(){
  const server=new McpServer({name:'project-second-brain-cognition-harness',version:'0.1.0'},{capabilities:{tools:{}}});

  server.registerTool('second_brain_doctor',{title:'Second Brain Harness Doctor',description:'Use this when you need to verify that the cognition harness configuration, lanes, gates, schemas, runtime fingerprint, and Git provenance are internally coherent before relying on it.',annotations:{readOnlyHint:true,idempotentHint:true,openWorldHint:false}},toolHandler(async()=>{const r=doctorFull();return output(r,`Harness doctor: ${r.verdict}; ${r.errors.length} error(s), ${r.warnings.length} warning(s).`);}));

  server.registerTool('second_brain_intake',{title:'Second Brain Task Intake',description:'Use this first when a user gives raw engineering intent. It normalizes the task, classifies it, infers signals, scores risk, and returns deterministic routing. Do not design or code when stop=true.',inputSchema:intakeSchema,annotations:{readOnlyHint:true,idempotentHint:true,openWorldHint:false}},toolHandler(async args=>{const input=normalizeServerTask(args),r=runtime.intake(input,{root:repoRoot,taskBaseDir:process.cwd()});return output(r,`Task ${r.task.id}: ${r.classification.status==='RESOLVED'?r.classification.type:'BLOCKED'}; stop=${r.stop}.`);}));

  server.registerTool('second_brain_bootstrap',{title:'Second Brain Cognition Bootstrap',description:'Use this after intake and before architecture selection or implementation. It compiles the deterministic routed Second Brain context pack, exact source hashes, risk result, Git reality, and current gates for the supplied normalized task.',inputSchema:z.object({task:taskSchema,include_context:z.boolean().default(true)}),annotations:{readOnlyHint:true,idempotentHint:true,openWorldHint:false}},toolHandler(async({task,include_context})=>{
    task=normalizeServerTask(task);const r=runtime.bootstrapTask(task,{root:repoRoot,taskBaseDir:process.cwd(),writeArtifacts:false});
    const data={run_id:r.run_id,manifest:r.manifest,task:r.task,classification:r.classification,signals:r.signals,risk:r.risk,route:r.route,gates:r.gates,context_manifest:r.context_manifest};
    if(include_context&&r.context.status==='RESOLVED') data.context_documents=r.context.documents;
    return output(data,`Cognition run ${r.run_id}: classification=${r.classification.status==='RESOLVED'?r.classification.type:'BLOCKED'}, rigor=${r.risk?.mode||'UNRESOLVED'}, context=${r.context.status}, gate=${r.gates.verdict}.`);
  }));

  server.registerTool('second_brain_evaluate',{title:'Second Brain Gate Evaluation',description:'Use this whenever evidence changes and before making an engineering stage or delivery claim. It evaluates evidence against all applicable gates through the requested lifecycle stage.',inputSchema:z.object({task:taskSchema,evidence:evidenceSchema,through_stage:stageSchema.default('PRE_DELIVERY')}),annotations:{readOnlyHint:true,idempotentHint:true,openWorldHint:false}},toolHandler(async({task,evidence,through_stage})=>{task=normalizeServerTask(task);const r=runtime.evaluateTask(task,evidence,{root:repoRoot,taskBaseDir:process.cwd(),throughStage:through_stage});return output(r,`Gate evaluation through ${through_stage}: ${r.verdict}; ${r.blocking_failures} blocking failure(s).`);}));

  server.registerTool('second_brain_session_create',{title:'Second Brain Lifecycle Session Create',description:'Use this after the normalized task and cognition context are established to create the server-held lifecycle state. A deterministic session id prevents quietly resetting the same run to bypass gates.',inputSchema:z.object({task:taskSchema,evidence:evidenceSchema.optional(),through_stage:stageSchema.default('BOOTSTRAP')}),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false}},toolHandler(async({task,evidence,through_stage})=>{
    task=normalizeServerTask(task);const candidate=lifecycle.createSession(task,evidence||{version:1,claims:{}},{root:repoRoot,taskBaseDir:process.cwd(),throughStage:through_stage});
    const persisted=store.create(candidate);const session=persisted.session,verification=lifecycle.verifySessionIntegrity(session);
    if(!verification.valid) throw new Error(`existing lifecycle session cannot be verified with the server signing key: ${verification.reason}`);
    if(session.run_id!==candidate.run_id) throw new Error('existing lifecycle session id collision with a different cognition run');
    return output({created:persisted.created,session_id:session.session_id,run_id:session.run_id,current_stage:session.current_stage,blocked_stage:session.blocked_stage,status:session.status,integrity_mode:session.integrity_mode},`Lifecycle ${session.session_id}: ${persisted.created?'created':'reused'} at ${session.current_stage||'NONE'}; status=${session.status}.`);
  }));

  server.registerTool('second_brain_session_status',{title:'Second Brain Lifecycle Session Status',description:'Use this to inspect the authoritative server-held lifecycle stage and last gate evaluation for an existing cognition run.',inputSchema:z.object({session_id:z.string().regex(/^session-[a-f0-9]{16}$/)}),annotations:{readOnlyHint:true,idempotentHint:true,openWorldHint:false}},toolHandler(async({session_id})=>{const session=loadVerifiedSession(session_id);return output({session_id:session.session_id,run_id:session.run_id,current_stage:session.current_stage,blocked_stage:session.blocked_stage,status:session.status,target_repository:session.target_repository,last_evaluation:session.last_evaluation,history_length:session.history.length,history_head:session.history.at(-1)?.event_sha256||null},`Lifecycle ${session_id}: stage=${session.current_stage||'NONE'}, status=${session.status}.`);}));

  server.registerTool('second_brain_session_advance',{title:'Second Brain Lifecycle Advance',description:'Use this only when attempting the next sequential engineering lifecycle stage. The server rejects skipped stages, stale cognition state, target-repository drift, tampered sessions, and failed BLOCK gates.',inputSchema:z.object({session_id:z.string().regex(/^session-[a-f0-9]{16}$/),task:taskSchema,evidence:evidenceSchema,to_stage:stageSchema}),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:false}},toolHandler(async({session_id,task,evidence,to_stage})=>{
    task=normalizeServerTask(task);const session=loadVerifiedSession(session_id),r=lifecycle.advanceSession(session,task,evidence,to_stage,{root:repoRoot,taskBaseDir:process.cwd()});if(r.session) store.save(r.session);
    return output({verdict:r.verdict,status:r.status,reason:r.reason||null,session_id,current_stage:r.session?.current_stage||session.current_stage,blocked_stage:r.session?.blocked_stage||null,blocking_failures:r.session?.last_evaluation?.blocking_failures??null},`Lifecycle ${session_id}: ${r.status}; verdict=${r.verdict}${r.reason?`; ${r.reason}`:''}.`);
  }));

  server.registerTool('second_brain_session_refresh_target',{title:'Second Brain Target Reality Checkpoint',description:'Use this after implementation has changed the target repository and the intended state is committed and clean. It deliberately adopts the new exact Git reality so later stages cannot silently reason against stale source state.',inputSchema:z.object({session_id:z.string().regex(/^session-[a-f0-9]{16}$/),task:taskSchema,reason:z.string().min(1)}),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false}},toolHandler(async({session_id,task,reason})=>{
    task=normalizeServerTask(task);const session=loadVerifiedSession(session_id),r=lifecycle.refreshTarget(session,task,reason,{root:repoRoot,taskBaseDir:process.cwd()});if(r.session) store.save(r.session);
    return output({verdict:r.verdict,status:r.status,reason:r.reason||null,session_id,current_stage:r.session?.current_stage||session.current_stage,target_repository:r.session?.target_repository||session.target_repository},`Target checkpoint ${session_id}: ${r.status}; verdict=${r.verdict}.`);
  }));

  server.registerTool('second_brain_learning_candidate',{title:'Second Brain Failure Learning Candidate',description:'Use this after an OBSERVED or VERIFIED runtime failure to create a review-only learning candidate. This never mutates permanent doctrine automatically.',inputSchema:z.object({task:taskSchema,evidence:evidenceSchema,failure_claim:z.string().min(1),proposal:z.string().optional(),scope:z.string().optional(),confidence:z.enum(['LOW','MEDIUM','HIGH']).optional()}),annotations:{readOnlyHint:true,idempotentHint:true,openWorldHint:false}},toolHandler(async({task,evidence,failure_claim,proposal,scope,confidence})=>{task=normalizeServerTask(task);const r=runtime.learningCandidate(task,evidence,{root:repoRoot,taskBaseDir:process.cwd(),failureClaim:failure_claim,proposal,scope,confidence});return output(r,`Learning candidate ${r.id}: ${r.review_status}; doctrine_mutated=${r.doctrine_mutated}.`);}));

  return server;
}

function secureEqual(a,b){const aa=Buffer.from(a||''),bb=Buffer.from(b||'');return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
function isLoopback(host){return ['127.0.0.1','localhost','::1'].includes(host);}
function remoteHostAllowed(req){
  const allowed=(process.env.PSB_MCP_ALLOWED_HOSTS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!allowed.length) return false;
  try{return allowed.includes(new URL(`http://${req.headers.host||''}`).hostname.toLowerCase());}catch{return false;}
}
function authorize(req,res){
  const token=process.env.PSB_MCP_BEARER_TOKEN;
  if(!token) return true;
  const header=req.headers.authorization||'',provided=header.startsWith('Bearer ')?header.slice(7):'';
  if(secureEqual(provided,token)) return true;
  res.writeHead(401,{'content-type':'application/json','www-authenticate':'Bearer'});res.end(JSON.stringify({error:'unauthorized'}));return false;
}
function requireServerSecurity(mode,host){
  if(!process.env.PSB_HARNESS_SESSION_KEY&&process.env.PSB_MCP_INSECURE_DEV!=='1') throw new Error('PSB_HARNESS_SESSION_KEY is required; use PSB_MCP_INSECURE_DEV=1 only for disposable local development');
  if(mode==='http'&&!isLoopback(host)&&!process.env.PSB_MCP_BEARER_TOKEN) throw new Error('Remote HTTP bind requires PSB_MCP_BEARER_TOKEN or an OAuth/auth gateway in front of this process');
  if(mode==='http'&&!isLoopback(host)&&!(process.env.PSB_MCP_ALLOWED_HOSTS||'').trim()) throw new Error('Remote HTTP bind requires PSB_MCP_ALLOWED_HOSTS');
}
async function startHttp(){
  const host=process.env.PSB_MCP_BIND_HOST||'127.0.0.1',port=Number(process.env.PORT||process.env.PSB_MCP_PORT||4318);requireServerSecurity('http',host);
  const mcpHandler=toNodeHandler(createMcpHandler(()=>createHarnessServer()));
  const validateLocalHost=localhostHostValidation(),validateLocalOrigin=localhostOriginValidation();
  const server=http.createServer((req,res)=>{
    const pathname=(()=>{try{return new URL(req.url||'/','http://localhost').pathname;}catch{return '/';}})();
    if(pathname==='/health'&&req.method==='GET'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({status:'ok',service:'project-second-brain-cognition-harness',state_dir:defaultStateDirectory()}));return;}
    if(pathname!=='/mcp'){res.writeHead(404,{'content-type':'application/json'});res.end(JSON.stringify({error:'not found'}));return;}
    if(isLoopback(host)){if(!validateLocalHost(req,res)||!validateLocalOrigin(req,res)) return;}else if(!remoteHostAllowed(req)){res.writeHead(421,{'content-type':'application/json'});res.end(JSON.stringify({error:'host not allowed'}));return;}
    if(!authorize(req,res)) return;
    void mcpHandler(req,res);
  });
  server.listen(port,host,()=>console.error(`Project Second Brain MCP listening on http://${host}:${port}/mcp`));
  const shutdown=()=>server.close(()=>process.exit(0));process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
}

const stdio=process.argv.includes('--stdio');
requireServerSecurity(stdio?'stdio':'http',process.env.PSB_MCP_BIND_HOST||'127.0.0.1');
if(stdio){void serveStdio(()=>createHarnessServer());console.error('Project Second Brain MCP running on stdio');}
else {void startHttp();}
