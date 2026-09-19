#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..','..','..');
const controlPlane=JSON.parse(fs.readFileSync(path.join(root,'harness','notion','control-plane.json'),'utf8'));
const routePack=JSON.parse(fs.readFileSync(path.join(root,'harness','notion','route-pack.json'),'utf8'));
const token=process.env.PSB_NOTION_API_KEY||process.env.NOTION_API_KEY;
if(!token) throw new Error('Set PSB_NOTION_API_KEY or NOTION_API_KEY. The token is never written to disk.');
const apiVersion=process.env.PSB_NOTION_API_VERSION||controlPlane.notion_api_version;

function canonical(value){if(Array.isArray(value)) return value.map(canonical);if(value&&typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
function canonicalJson(value){return JSON.stringify(canonical(value));}
function sha256(value){return crypto.createHash('sha256').update(value).digest('hex');}
function gitBlob(sourcePath){const r=spawnSync('git',['-C',root,'hash-object','--',sourcePath],{encoding:'utf8',windowsHide:true});if(r.status!==0) throw new Error(`Cannot hash ${sourcePath}: ${(r.stderr||r.stdout||'git hash-object failed').trim()}`);return r.stdout.trim();}
async function notion(endpoint,options={}){const res=await fetch(`https://api.notion.com/v1${endpoint}`,{...options,headers:{Authorization:`Bearer ${token}`,'Notion-Version':apiVersion,'Content-Type':'application/json',...(options.headers||{})}});const text=await res.text();let body;try{body=text?JSON.parse(text):{};}catch{body={raw:text};}if(!res.ok) throw new Error(`Notion API ${res.status} ${endpoint}: ${body.message||text}`);return body;}
function propertyText(prop){if(!prop) return '';const list=prop.title||prop.rich_text||[];return list.map(x=>x.plain_text||'').join('').trim();}
async function pageMarkdown(pageId){
  const result=await notion(`/pages/${pageId}/markdown`);
  if(result.object!=='page_markdown'||typeof result.markdown!=='string') throw new Error(`${pageId}: Notion did not return a page_markdown object`);
  const unknown=Array.isArray(result.unknown_block_ids)?result.unknown_block_ids:[];
  if(result.truncated||unknown.length) throw new Error(`${pageId}: Notion markdown retrieval is incomplete (truncated=${Boolean(result.truncated)}, unknown_blocks=${unknown.length})`);
  const markdown=result.markdown.trimEnd();
  if(!markdown) throw new Error(`${pageId}: Notion page markdown is empty`);
  return markdown+'\n';
}
async function queryKnowledge(){
  const out=[];let cursor=null;
  do{
    const filters=[{property:'Status',select:{equals:controlPlane.required_status}}];
    if(controlPlane.required_origin) filters.push({property:'Origin',select:{equals:controlPlane.required_origin}});
    const body={page_size:100,filter:filters.length===1?filters[0]:{and:filters}};
    if(cursor) body.start_cursor=cursor;
    const page=await notion(`/data_sources/${controlPlane.knowledge_data_source_id}/query`,{method:'POST',body:JSON.stringify(body)});
    out.push(...(page.results||[]));cursor=page.has_more?page.next_cursor:null;
  }while(cursor);
  return out;
}

const pages=await queryKnowledge();
const docs=[];
for(const page of pages){
  const sourcePath=propertyText(page.properties?.['Source Path']);
  const sourceSha=propertyText(page.properties?.['Source SHA']);
  if(!sourcePath) continue;
  if(!/^[a-f0-9]{40}$/.test(sourceSha)) throw new Error(`${sourcePath}: Source SHA is missing or invalid in Notion`);
  const workingSha=gitBlob(sourcePath);
  if(workingSha!==sourceSha) throw new Error(`${sourcePath}: Notion Source SHA ${sourceSha} does not match current Git blob ${workingSha}`);
  const content=await pageMarkdown(page.id);
  docs.push({page_id:page.id,title:propertyText(page.properties?.Name)||sourcePath,notion_url:page.url,source_path:sourcePath,source_sha:sourceSha,content_sha256:sha256(content),content});
}
docs.sort((a,b)=>a.source_path.localeCompare(b.source_path));
const snapshot={version:1,provider:'NOTION_SNAPSHOT',generated_at:new Date().toISOString(),notion_api_version:apiVersion,data_source_id:controlPlane.knowledge_data_source_id,source_repository:controlPlane.source_repository,control_plane_sha256:sha256(canonicalJson(controlPlane)),route_pack_sha256:sha256(canonicalJson(routePack)),documents:docs};
snapshot.snapshot_sha256=sha256(canonicalJson(snapshot));
const configured=process.env.PSB_NOTION_SNAPSHOT||controlPlane.snapshot_path;
const output=path.isAbsolute(configured)?configured:path.resolve(root,...configured.split('/'));
fs.mkdirSync(path.dirname(output),{recursive:true});
const tmp=`${output}.tmp-${process.pid}`;
fs.writeFileSync(tmp,JSON.stringify(snapshot,null,2)+'\n','utf8');
fs.renameSync(tmp,output);
console.log(JSON.stringify({status:'PASS',provider:snapshot.provider,notion_api_version:apiVersion,origin:controlPlane.required_origin||null,documents:docs.length,snapshot_sha256:snapshot.snapshot_sha256,output},null,2));
