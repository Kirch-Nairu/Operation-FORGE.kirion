const assert=require('assert');
const fs=require('fs');
const os=require('os');
const path=require('path');
const {spawnSync}=require('child_process');
const {canonicalJson,sha256}=require('../lib/io');
const {contextManifest}=require('../lib/runtime');
const {compileSemanticContext,requiredSemanticPaths,snapshotDigest,configDigest}=require('../lib/semantic-provider');

const repo=path.resolve(__dirname,'..','..','..');
const manifest=require(path.join(repo,'harness/HARNESS_MANIFEST.json'));
const controlPlane=require(path.join(repo,'harness/notion/control-plane.json'));
const routePack=require(path.join(repo,'harness/notion/route-pack.json'));
let count=0;
function test(name,fn){fn();count++;console.log(`PASS ${name}`);}
function gitBlob(sourcePath){const r=spawnSync('git',['-C',repo,'hash-object','--',sourcePath],{encoding:'utf8',windowsHide:true});if(r.status!==0) throw new Error((r.stderr||r.stdout||'git hash-object failed').trim());return r.stdout.trim();}
const route={rigor_mode:'LOW',control_roots:['cognitive-os/CENTRAL_BRAIN.md','cognitive-os/02_ADAPTIVE_RIGOR.md','cognitive-os/05_AUTHORITY_AND_TRUTH.md'],lanes:[{id:'VERIFICATION',family:'quality-assurance',path:'mesh/lanes/quality-assurance/VERIFICATION_LANE.md'}]};
function makeSnapshot(generatedAt='2026-08-30T00:00:00.000Z'){const documents=requiredSemanticPaths(route,routePack).sort().map((sourcePath,i)=>{const content=`# Snapshot fixture ${i}\n\nSource path: ${sourcePath}\n`;return {page_id:`fixture-${i}`,title:`Fixture ${i}`,notion_url:`https://notion.example/${i}`,source_path:sourcePath,source_sha:gitBlob(sourcePath),content_sha256:sha256(content),content};});const snapshot={version:1,provider:'NOTION_SNAPSHOT',generated_at:generatedAt,notion_api_version:controlPlane.notion_api_version,data_source_id:controlPlane.knowledge_data_source_id,source_repository:controlPlane.source_repository,control_plane_sha256:configDigest(controlPlane),route_pack_sha256:configDigest(routePack),documents};snapshot.snapshot_sha256=snapshotDigest(snapshot);return snapshot;}
function writeSnapshot(snapshot){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'psb-notion-snapshot-')),file=path.join(dir,'snapshot.json');fs.writeFileSync(file,JSON.stringify(snapshot,null,2)+'\n','utf8');return file;}
function compile(file){return compileSemanticContext(repo,route,manifest,{provider:'NOTION_SNAPSHOT',snapshotPath:file,controlPlane,routePack});}

test('missing Notion semantic snapshot fails closed',()=>{const file=path.join(os.tmpdir(),`missing-notion-snapshot-${process.pid}-${Date.now()}.json`),result=compile(file);assert.equal(result.status,'BLOCKED');assert(result.reason.includes('missing'));});
test('valid Notion semantic snapshot resolves deterministic routed context',()=>{const file=writeSnapshot(makeSnapshot()),a=compile(file),b=compile(file);assert.equal(a.status,'RESOLVED');assert.equal(a.provider,'NOTION_SNAPSHOT');assert(a.documents.length>=8);assert.equal(sha256(canonicalJson(contextManifest(a))),sha256(canonicalJson(contextManifest(b))));});
test('context manifest is independent of local snapshot path and sync timestamp',()=>{const a=compile(writeSnapshot(makeSnapshot('2026-08-30T00:00:00.000Z'))),b=compile(writeSnapshot(makeSnapshot('2026-08-30T01:00:00.000Z')));assert.equal(a.status,'RESOLVED');assert.equal(b.status,'RESOLVED');assert.notEqual(a.snapshot_path,b.snapshot_path);assert.notEqual(a.snapshot_sha256,b.snapshot_sha256);assert.deepEqual(contextManifest(a),contextManifest(b));});
test('tampered Notion semantic snapshot is rejected',()=>{const snapshot=makeSnapshot();snapshot.documents[0].content+='tampered\n';const result=compile(writeSnapshot(snapshot));assert.equal(result.status,'BLOCKED');assert(result.errors.some(x=>x.includes('digest mismatch')));});
test('stale Notion source SHA is rejected even with a valid snapshot digest',()=>{const snapshot=makeSnapshot();snapshot.documents[0].source_sha='0000000000000000000000000000000000000000';snapshot.snapshot_sha256=snapshotDigest(snapshot);const result=compile(writeSnapshot(snapshot));assert.equal(result.status,'BLOCKED');assert(result.reason.includes('source drift'));});
test('stale route-pack fingerprint is rejected',()=>{const snapshot=makeSnapshot();snapshot.route_pack_sha256='0'.repeat(64);snapshot.snapshot_sha256=snapshotDigest(snapshot);const result=compile(writeSnapshot(snapshot));assert.equal(result.status,'BLOCKED');assert(result.errors.some(x=>x.includes('route-pack')));});
console.log(`\n${count} semantic provider tests passed.`);
