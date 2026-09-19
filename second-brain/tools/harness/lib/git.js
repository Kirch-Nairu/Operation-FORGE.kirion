const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');
const {canonicalJson,sha256}=require('./io');

function runGit(cwd,args){
  const r=spawnSync('git',['-C',cwd,...args],{encoding:'utf8',windowsHide:true});
  return {ok:r.status===0,status:r.status,stdout:(r.stdout||'').trim(),stderr:(r.stderr||'').trim(),error:r.error?r.error.message:null};
}

function probeGitRepository(inputPath){
  if(!inputPath) return {status:'NOT_REQUESTED'};
  const requested=path.resolve(inputPath);
  if(!fs.existsSync(requested)) return {status:'UNKNOWN',requested_path:requested,reason:'path does not exist'};
  const top=runGit(requested,['rev-parse','--show-toplevel']);
  if(!top.ok) return {status:'UNKNOWN',requested_path:requested,reason:top.error||top.stderr||'not a git repository'};
  const root=path.resolve(top.stdout);
  const head=runGit(root,['rev-parse','HEAD']);
  const branch=runGit(root,['symbolic-ref','--quiet','--short','HEAD']);
  const status=runGit(root,['status','--porcelain=v1','--untracked-files=normal']);
  const upstream=runGit(root,['rev-parse','--abbrev-ref','--symbolic-full-name','@{u}']);
  if(!head.ok || !status.ok) return {status:'UNKNOWN',requested_path:requested,top_level:root,reason:head.stderr||status.stderr||'git probe failed'};
  const entries=status.stdout?status.stdout.split(/\r?\n/).filter(Boolean):[];
  return {
    status:'RESOLVED',
    requested_path:requested,
    top_level:root,
    head:head.stdout,
    branch:branch.ok?branch.stdout:null,
    detached:!branch.ok,
    clean:entries.length===0,
    dirty_entry_count:entries.length,
    dirty_entries:entries,
    upstream:upstream.ok?upstream.stdout:null
  };
}

function walkFiles(base,current,out){
  for(const ent of fs.readdirSync(current,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
    if(['.git','.harness','node_modules'].includes(ent.name)) continue;
    const full=path.join(current,ent.name);
    if(ent.isDirectory()) walkFiles(base,full,out);
    else if(ent.isFile()) out.push(path.relative(base,full).split(path.sep).join('/'));
  }
}

function runtimeFingerprint(root){
  const roots=['harness','tools/harness'];
  const files=[];
  for(const rel of roots){
    const full=path.join(root,rel);
    if(fs.existsSync(full)) walkFiles(root,full,files);
  }
  files.sort();
  const entries=files.map(rel=>({path:rel,sha256:sha256(fs.readFileSync(path.join(root,...rel.split('/'))))}));
  return {sha256:sha256(canonicalJson(entries)),file_count:entries.length,files:entries};
}

module.exports={runGit,probeGitRepository,runtimeFingerprint};
