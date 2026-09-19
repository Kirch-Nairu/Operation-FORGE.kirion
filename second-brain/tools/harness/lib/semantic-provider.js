const fs=require('fs');
const path=require('path');
const {canonicalJson,sha256}=require('./io');
const {compileContext,documentBudget,byteBudget}=require('./context');
const {runGit}=require('./git');

const PROVIDERS={GIT:'GIT',NOTION_SNAPSHOT:'NOTION_SNAPSHOT'};

function resolveProvider(value,controlPlane={}){
  const raw=String(value||controlPlane.default_provider||PROVIDERS.GIT).trim().toUpperCase().replace(/[- ]/g,'_');
  if(raw==='NOTION' || raw==='SNAPSHOT') return PROVIDERS.NOTION_SNAPSHOT;
  if(raw===PROVIDERS.GIT || raw===PROVIDERS.NOTION_SNAPSHOT) return raw;
  throw new Error(`Unknown semantic provider: ${value}`);
}

function snapshotPath(root,controlPlane={},override){
  const configured=override||process.env.PSB_NOTION_SNAPSHOT||controlPlane.snapshot_path||'.harness/notion/semantic-snapshot.json';
  return path.isAbsolute(configured)?configured:path.resolve(root,...configured.split('/'));
}

function snapshotDigest(snapshot){
  const copy={...snapshot};
  delete copy.snapshot_sha256;
  return sha256(canonicalJson(copy));
}

function configDigest(value){return sha256(canonicalJson(value));}

function requiredSemanticPaths(route,routePack={}){
  const out=[];
  const add=p=>{if(typeof p==='string'&&p.trim()&&!out.includes(p.trim())) out.push(p.trim());};
  for(const p of route&&route.control_roots||[]) add(p);
  for(const lane of route&&route.lanes||[]) add(lane.path);
  for(const p of routePack.always||[]) add(p);
  for(const lane of route&&route.lanes||[]) for(const p of routePack.by_lane&&routePack.by_lane[lane.id]||[]) add(p);
  return out;
}

function validateSnapshotShape(snapshot){
  const errors=[];
  if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot)) return ['snapshot must be an object'];
  if(snapshot.version!==1) errors.push('snapshot version must be 1');
  if(snapshot.provider!==PROVIDERS.NOTION_SNAPSHOT) errors.push('snapshot provider must be NOTION_SNAPSHOT');
  if(typeof snapshot.generated_at!=='string'||!snapshot.generated_at) errors.push('snapshot generated_at is required');
  if(typeof snapshot.data_source_id!=='string'||!snapshot.data_source_id) errors.push('snapshot data_source_id is required');
  if(typeof snapshot.source_repository!=='string'||!snapshot.source_repository) errors.push('snapshot source_repository is required');
  if(!/^[a-f0-9]{64}$/.test(snapshot.control_plane_sha256||'')) errors.push('snapshot control_plane_sha256 must be SHA-256');
  if(!/^[a-f0-9]{64}$/.test(snapshot.route_pack_sha256||'')) errors.push('snapshot route_pack_sha256 must be SHA-256');
  if(!Array.isArray(snapshot.documents)) errors.push('snapshot documents must be an array');
  if(!/^[a-f0-9]{64}$/.test(snapshot.snapshot_sha256||'')) errors.push('snapshot snapshot_sha256 must be SHA-256');
  const seen=new Set();
  for(const [i,doc] of (snapshot.documents||[]).entries()){
    if(!doc||typeof doc!=='object'){errors.push(`documents[${i}] must be an object`);continue;}
    if(typeof doc.source_path!=='string'||!doc.source_path) errors.push(`documents[${i}] source_path is required`);
    else if(seen.has(doc.source_path)) errors.push(`duplicate source_path: ${doc.source_path}`); else seen.add(doc.source_path);
    if(!/^[a-f0-9]{40}$/.test(doc.source_sha||'')) errors.push(`documents[${i}] source_sha must be a Git blob SHA`);
    if(!/^[a-f0-9]{64}$/.test(doc.content_sha256||'')) errors.push(`documents[${i}] content_sha256 must be SHA-256`);
    if(typeof doc.content!=='string'||!doc.content.trim()) errors.push(`documents[${i}] content is required`);
    if(typeof doc.page_id!=='string'||!doc.page_id) errors.push(`documents[${i}] page_id is required`);
    if(typeof doc.title!=='string'||!doc.title) errors.push(`documents[${i}] title is required`);
    if(typeof doc.notion_url!=='string'||!doc.notion_url) errors.push(`documents[${i}] notion_url is required`);
  }
  return errors;
}

function workingBlobSha(root,sourcePath){
  const full=path.join(root,...sourcePath.split('/'));
  if(!fs.existsSync(full)) return {ok:false,reason:'source path does not exist'};
  const r=runGit(root,['hash-object','--',sourcePath]);
  if(!r.ok||!/^[a-f0-9]{40}$/.test(r.stdout)) return {ok:false,reason:r.error||r.stderr||'git hash-object failed'};
  return {ok:true,sha:r.stdout};
}

function readSnapshot(root,controlPlane,routePack,options={}){
  const file=snapshotPath(root,controlPlane,options.snapshotPath);
  if(!fs.existsSync(file)) return {status:'BLOCKED',provider:PROVIDERS.NOTION_SNAPSHOT,reason:'semantic snapshot missing',snapshot_path:file,errors:[`Missing Notion semantic snapshot: ${file}`]};
  let snapshot;
  try{snapshot=JSON.parse(fs.readFileSync(file,'utf8'));}
  catch(err){return {status:'BLOCKED',provider:PROVIDERS.NOTION_SNAPSHOT,reason:'semantic snapshot invalid JSON',snapshot_path:file,errors:[err.message]};}
  const errors=validateSnapshotShape(snapshot);
  const expectedDigest=snapshotDigest(snapshot);
  if(snapshot.snapshot_sha256!==expectedDigest) errors.push(`snapshot digest mismatch: expected ${expectedDigest}, found ${snapshot.snapshot_sha256}`);
  const cpDigest=configDigest(controlPlane);
  const rpDigest=configDigest(routePack);
  if(snapshot.control_plane_sha256!==cpDigest) errors.push('semantic snapshot control-plane configuration is stale');
  if(snapshot.route_pack_sha256!==rpDigest) errors.push('semantic snapshot route-pack configuration is stale');
  if(snapshot.data_source_id!==controlPlane.knowledge_data_source_id) errors.push('semantic snapshot data source does not match configured Knowledge data source');
  if(snapshot.source_repository!==controlPlane.source_repository) errors.push('semantic snapshot repository identity does not match control plane');
  for(const doc of snapshot.documents||[]){
    if(doc.content_sha256!==sha256(doc.content)) errors.push(`content digest mismatch for ${doc.source_path}`);
  }
  return errors.length
    ? {status:'BLOCKED',provider:PROVIDERS.NOTION_SNAPSHOT,reason:'semantic snapshot integrity validation failed',snapshot_path:file,errors,snapshot}
    : {status:'RESOLVED',provider:PROVIDERS.NOTION_SNAPSHOT,snapshot_path:file,snapshot,errors:[]};
}

function compileNotionSnapshot(root,route,manifest,controlPlane,routePack,options={}){
  const loaded=readSnapshot(root,controlPlane,routePack,options);
  if(loaded.status!=='RESOLVED') return {...loaded,documents:[],unresolved_links:[],missing_required:[]};
  const required=requiredSemanticPaths(route,routePack),byPath=new Map(loaded.snapshot.documents.map(d=>[d.source_path,d]));
  const missing=required.filter(p=>!byPath.has(p));
  if(missing.length) return {status:'BLOCKED',provider:PROVIDERS.NOTION_SNAPSHOT,reason:'required semantic sources missing from snapshot',snapshot_path:loaded.snapshot_path,missing_required:missing,documents:[],unresolved_links:[],errors:missing.map(p=>`Missing snapshot source: ${p}`)};
  const errors=[],documents=[];
  let bytes=0;
  for(const sourcePath of required){
    const doc=byPath.get(sourcePath),working=workingBlobSha(root,sourcePath);
    if(!working.ok){errors.push(`${sourcePath}: ${working.reason}`);continue;}
    if(working.sha!==doc.source_sha){errors.push(`${sourcePath}: source drift; snapshot=${doc.source_sha} working=${working.sha}`);continue;}
    const size=Buffer.byteLength(doc.content,'utf8');
    bytes+=size;
    documents.push({path:sourcePath,sha256:doc.content_sha256,bytes:size,depth:0,source:'NOTION_SNAPSHOT',provider:PROVIDERS.NOTION_SNAPSHOT,source_sha:doc.source_sha,notion_page_id:doc.page_id,notion_url:doc.notion_url,title:doc.title,content:doc.content});
  }
  if(errors.length) return {status:'BLOCKED',provider:PROVIDERS.NOTION_SNAPSHOT,reason:'semantic snapshot source drift',snapshot_path:loaded.snapshot_path,missing_required:[],documents:[],unresolved_links:[],errors};
  const budget=documentBudget(manifest.context,route.rigor_mode);
  if(documents.length>budget) return {status:'BLOCKED',provider:PROVIDERS.NOTION_SNAPSHOT,reason:'required semantic snapshot exceeds document budget',snapshot_path:loaded.snapshot_path,missing_required:[],documents:[],unresolved_links:[],errors:[`Required ${documents.length} documents, budget is ${budget}`]};
  if(bytes>(manifest.context.max_bytes||Infinity)) return {status:'BLOCKED',provider:PROVIDERS.NOTION_SNAPSHOT,reason:'required semantic snapshot exceeds byte budget',snapshot_path:loaded.snapshot_path,missing_required:[],documents:[],unresolved_links:[],errors:[`Required ${bytes} bytes, budget is ${manifest.context.max_bytes}`]};
  return {status:'RESOLVED',provider:PROVIDERS.NOTION_SNAPSHOT,snapshot_path:loaded.snapshot_path,snapshot_sha256:loaded.snapshot.snapshot_sha256,snapshot_generated_at:loaded.snapshot.generated_at,missing_required:[],document_count:documents.length,total_bytes:bytes,max_depth:0,truncated:false,documents,unresolved_links:[],errors:[]};
}

function compileSemanticContext(root,route,manifest,options={}){
  const provider=resolveProvider(options.provider,options.controlPlane);
  if(provider===PROVIDERS.GIT){
    const context=compileContext(root,route,manifest);
    return {...context,provider:PROVIDERS.GIT};
  }
  return compileNotionSnapshot(root,route,manifest,options.controlPlane||{},options.routePack||{},options);
}

function semanticProviderDoctor(root,manifest,controlPlane,routePack,options={}){
  let provider;
  try{provider=resolveProvider(options.provider||process.env.PSB_SEMANTIC_PROVIDER,controlPlane);}catch(err){return {verdict:'BLOCK',provider:null,errors:[err.message],warnings:[]};}
  if(provider===PROVIDERS.GIT) return {verdict:'PASS',provider,warnings:['Git semantic provider explicitly selected; Notion snapshot is not active for this run.'],errors:[]};
  const loaded=readSnapshot(root,controlPlane,routePack,{snapshotPath:options.snapshotPath});
  if(loaded.status!=='RESOLVED') return {verdict:'BLOCK',provider,errors:loaded.errors||[loaded.reason],warnings:[],snapshot_path:loaded.snapshot_path};
  const errors=[];
  for(const doc of loaded.snapshot.documents){
    const working=workingBlobSha(root,doc.source_path);
    if(!working.ok) errors.push(`${doc.source_path}: ${working.reason}`);
    else if(working.sha!==doc.source_sha) errors.push(`${doc.source_path}: source drift; snapshot=${doc.source_sha} working=${working.sha}`);
  }
  return {verdict:errors.length?'BLOCK':'PASS',provider,snapshot_path:loaded.snapshot_path,snapshot_sha256:loaded.snapshot.snapshot_sha256,document_count:loaded.snapshot.documents.length,errors,warnings:[]};
}

module.exports={PROVIDERS,resolveProvider,snapshotPath,snapshotDigest,configDigest,requiredSemanticPaths,validateSnapshotShape,readSnapshot,compileNotionSnapshot,compileSemanticContext,semanticProviderDoctor,workingBlobSha};
