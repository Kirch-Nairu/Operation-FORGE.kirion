const fs = require('fs');
const path = require('path');
const { sha256 } = require('./io');

const LINK_RE = /\[\[([^\]]+)\]\]/g;
function rel(root,p){ return path.relative(root,p).split(path.sep).join('/'); }
function walkMarkdown(root, ignored, out=[]) {
  for (const ent of fs.readdirSync(root,{withFileTypes:true})) {
    if (ignored.has(ent.name)) continue;
    const full = path.join(root,ent.name);
    if (ent.isDirectory()) walkMarkdown(full,ignored,out);
    else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
}
function buildIndex(root, ignoredDirs=[]) {
  const ignored = new Set(ignoredDirs);
  const exact = new Map(), stems = new Map(), paths = [];
  for (const file of walkMarkdown(root,ignored).sort()) {
    const r=rel(root,file); paths.push(r);
    exact.set(r,r); exact.set(r.replace(/\.md$/i,''),r);
    const stem=path.basename(r,'.md');
    if (!stems.has(stem)) stems.set(stem,[]);
    stems.get(stem).push(r);
  }
  return { paths, exact, stems };
}
function links(text) {
  const out=[]; LINK_RE.lastIndex=0; let m;
  while((m=LINK_RE.exec(text))){
    const t=m[1].split('|',1)[0].split('#',1)[0].trim().replace(/\\/g,'/');
    if(t) out.push(t);
  }
  return out;
}
function resolveLink(target,index){
  if(index.exact.has(target)) return index.exact.get(target);
  if(!/\.md$/i.test(target) && index.exact.has(`${target}.md`)) return index.exact.get(`${target}.md`);
  if(!target.includes('/')){
    const matches=index.stems.get(path.basename(target,'.md'))||[];
    if(matches.length===1) return matches[0];
  }
  return null;
}
/**
 * Resolve the document budget for this run.
 *
 * A single flat document cap could not serve both a LOW-rigor bug fix and a
 * HIGH-rigor greenfield build: the former carried far more than it needed, the
 * latter hit the cap and truncated. The budget now scales with rigor.
 * `max_documents` is still honoured if present so older manifests keep working.
 */
function documentBudget(cfg, mode) {
  if (typeof cfg.max_documents === 'number') return cfg.max_documents;
  const byMode = cfg.max_documents_by_mode || {};
  return byMode[mode] ?? cfg.max_documents_default ?? 48;
}

function byteBudget(cfg, mode) {
  if (typeof cfg.max_bytes === 'number') return cfg.max_bytes;
  const byMode = cfg.max_bytes_by_mode || {};
  return byMode[mode] ?? cfg.max_bytes_default ?? 196608;
}

function compileContext(root, route, manifest) {
  const cfg=manifest.context;
  const maxDocuments=documentBudget(cfg,route.rigor_mode);
  const maxBytes=byteBudget(cfg,route.rigor_mode);
  const index=buildIndex(root,cfg.ignored_directories||[]);
  const seeds=[...route.control_roots,...route.lanes.map(x=>x.path)];
  const missingRequired=seeds.filter(p=>!index.paths.includes(p));
  if(missingRequired.length) return { status:'BLOCKED', missing_required:missingRequired, documents:[], unresolved_links:[] };
  const depthFor=kind=>{
    const byKind=(cfg.link_depth_by_seed||{})[kind];
    if(byKind && byKind[route.rigor_mode]!=null) return byKind[route.rigor_mode];
    return cfg.default_link_depth?.[route.rigor_mode] ?? 1;
  };
  const controlRootDepth=depthFor('CONTROL_ROOT'), laneDepth=depthFor('LANE');
  const maxDepth=Math.max(controlRootDepth,laneDepth);
  const controlRootSet=new Set(route.control_roots);
  const queue=seeds.map(p=>({path:p,depth:0,seed:true,budget:controlRootSet.has(p)?controlRootDepth:laneDepth}));
  const seen=new Set(), documents=[], unresolved=[], queued=new Set(seeds);
  let bytes=0;
  while(queue.length && documents.length<maxDocuments){
    const item=queue.shift(); if(seen.has(item.path)) continue; seen.add(item.path);
    const content=fs.readFileSync(path.join(root,...item.path.split('/')),'utf8');
    const size=Buffer.byteLength(content,'utf8');
    if(bytes+size>maxBytes){
      if(item.seed) return {status:'BLOCKED',reason:'Required seed sources exceed context byte budget.',missing_required:[],documents,unresolved_links:unresolved};
      continue;
    }
    bytes+=size;
    documents.push({path:item.path,sha256:sha256(content),bytes:size,depth:item.depth,source:item.seed?'REQUIRED_SEED':'GRAPH_EXPANSION',content});
    // Expansion budget is inherited from the seed that reached this document, so a
    // lane's neighbourhood stops at the lane's depth even when a control root is
    // still expanding elsewhere in the same run.
    if(item.depth>=item.budget) continue;
    const targets=[...new Set(links(content))].sort();
    for(const target of targets){
      const dst=resolveLink(target,index);
      if(!dst){ unresolved.push({source:item.path,target}); continue; }
      if(!seen.has(dst) && !queued.has(dst)){ queue.push({path:dst,depth:item.depth+1,seed:false,budget:item.budget}); queued.add(dst); }
    }
  }
  return {
    status:'RESOLVED',
    missing_required:[],
    document_count:documents.length,
    total_bytes:bytes,
    max_depth:maxDepth,
    control_root_depth:controlRootDepth,
    lane_depth:laneDepth,
    truncated:queue.length>0,
    document_budget:maxDocuments,
    byte_budget:maxBytes,
    documents,
    unresolved_links:unresolved
  };
}
module.exports={buildIndex,links,resolveLink,compileContext,documentBudget,byteBudget};
