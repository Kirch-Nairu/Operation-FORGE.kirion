const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'reports', 'ENGINEERING_MESH_AUDIT.md');
const JSON_REPORT = path.join(ROOT, 'reports', 'ENGINEERING_MESH_AUDIT.json');
const IGNORE = new Set(['.git', '.obsidian', 'archive', 'templates', 'templates-v2', 'node_modules']);
const PREFIXES = ['mesh/', 'cognitive-os/', 'planning/', 'decision-engine/', 'assurance/', 'risk/', 'scenario/', 'incident/', 'knowledge/', 'truth/', 'atlas/projects/'];
const LINK_RE = /\[\[([^\]]+)\]\]/g;
const FENCE_RE = /```[\s\S]*?```/g;
const CENTRAL = 'cognitive-os/CENTRAL_BRAIN.md';

function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }
function scoped(r) { return PREFIXES.some(p => r.startsWith(p)); }
function ignored(r) { return r.split('/').some(p => IGNORE.has(p)); }
function pct(x) { return `${(x * 100).toFixed(1)}%`; }
function avg(a) { return a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0; }
function percentile(values, p) {
  if (!values.length) return 0;
  const a = [...values].sort((x,y)=>x-y);
  const idx = Math.min(a.length - 1, Math.max(0, Math.ceil((p / 100) * a.length) - 1));
  return a[idx];
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const r = rel(full);
    if (ent.isDirectory()) {
      if (!ignored(r)) walk(full, out);
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md') && !ignored(r)) out.push(full);
  }
  return out;
}

function splitFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (!lines.length || lines[0].trim() !== '---') return { frontmatter: '', body: text };
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') return { frontmatter: lines.slice(0, i + 1).join('\n'), body: lines.slice(i + 1).join('\n') };
  }
  return { frontmatter: '', body: text };
}

function targets(text) {
  const clean = text.replace(FENCE_RE, '');
  const out = [];
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(clean))) {
    const t = m[1].split('|', 1)[0].split('#', 1)[0].trim().replace(/\\/g, '/');
    if (t) out.push(t);
  }
  return out;
}

const MACRO = {
  architecture: 'design', planning: 'design', product: 'design', api: 'design', frontend: 'design', quality: 'design',
  decision: 'governance', governance: 'governance', documentation: 'governance', delivery: 'governance', standards: 'governance',
  security: 'security', identity: 'security', privacy: 'security', network: 'security', 'supply-chain': 'security', host: 'security',
  data: 'data', database: 'data',
  operations: 'platform', reliability: 'platform', sre: 'platform', deployment: 'platform', cicd: 'platform', performance: 'platform', distributed: 'platform',
  testing: 'assurance', incident: 'assurance', assurance: 'assurance',
  ai: 'ai', projects: 'projects', control: 'control', truth: 'governance', risk: 'security', scenario: 'platform', knowledge: 'governance', other: 'other'
};

function kindFromBase(base) {
  if (/System$/.test(base) || /Doctrine$/.test(base)) return 'subhub';
  if (/Standard$/.test(base) || /Baseline$/.test(base) || /Policy$/.test(base)) return 'standard';
  if (/Requirement$/.test(base)) return 'requirement';
  if (/Gate$/.test(base)) return 'gate';
  if (/Packet$/.test(base)) return 'packet';
  return 'atomic';
}

function classify(r) {
  if (r === CENTRAL) return { kind: 'central', domain: 'control', macro: 'control' };
  if (r.startsWith('mesh/')) {
    const parts = r.split('/');
    const domain = parts.length > 2 ? parts[1] : 'other';
    const base = path.basename(r, '.md');
    return { kind: kindFromBase(base), domain, macro: MACRO[domain] || domain };
  }
  if (r.startsWith('cognitive-os/hubs/')) {
    const n = path.basename(r).toUpperCase();
    let domain = 'control';
    if (n.includes('ARCHITECTURE')) domain = 'architecture';
    else if (n.includes('DATA')) domain = 'data';
    else if (n.includes('PLATFORM')) domain = 'operations';
    else if (n.includes('SECURITY')) domain = 'security';
    else if (n.includes('ASSURANCE')) domain = 'testing';
    else if (n.includes('DECISION')) domain = 'decision';
    else if (n.includes('AI')) domain = 'ai';
    else if (n.includes('PROJECT')) domain = 'projects';
    return { kind: 'sector', domain, macro: MACRO[domain] || domain };
  }
  if (r.startsWith('atlas/projects/packets/')) return { kind: 'packet', domain: 'projects', macro: 'projects' };
  if (r.startsWith('atlas/projects/')) return { kind: 'project', domain: 'projects', macro: 'projects' };
  if (r.startsWith('planning/')) return { kind: 'subhub', domain: 'planning', macro: 'design' };
  if (r.startsWith('decision-engine/')) return { kind: 'subhub', domain: 'decision', macro: 'governance' };
  if (r.startsWith('assurance/')) return { kind: 'subhub', domain: 'assurance', macro: 'assurance' };
  if (r.startsWith('risk/')) return { kind: 'subhub', domain: 'risk', macro: 'security' };
  if (r.startsWith('scenario/')) return { kind: 'subhub', domain: 'scenario', macro: 'platform' };
  if (r.startsWith('incident/')) return { kind: 'subhub', domain: 'incident', macro: 'assurance' };
  if (r.startsWith('knowledge/')) return { kind: 'subhub', domain: 'knowledge', macro: 'governance' };
  if (r.startsWith('truth/')) return { kind: 'subhub', domain: 'truth', macro: 'governance' };
  if (r.startsWith('cognitive-os/')) return { kind: 'core', domain: 'control', macro: 'control' };
  return { kind: 'other', domain: 'other', macro: 'other' };
}

function components(adj) {
  const seen = new Set(), sizes = [];
  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const q = [start]; seen.add(start); let size = 0;
    while (q.length) {
      const cur = q.pop(); size++;
      for (const nxt of adj.get(cur)) if (!seen.has(nxt)) { seen.add(nxt); q.push(nxt); }
    }
    sizes.push(size);
  }
  return sizes.sort((a,b)=>b-a);
}

function clustering(node, adj) {
  const nbrs = [...adj.get(node)], k = nbrs.length;
  if (k < 2) return 0;
  let links = 0;
  for (let i=0;i<k;i++) for (let j=i+1;j<k;j++) if (adj.get(nbrs[i]).has(nbrs[j])) links++;
  return links / (k * (k - 1) / 2);
}

function triangleCount(adj) {
  const nodes = [...adj.keys()].sort(), rank = new Map(nodes.map((n,i)=>[n,i]));
  let count = 0;
  for (const a of nodes) for (const b of adj.get(a)) {
    if (rank.get(b) <= rank.get(a)) continue;
    for (const c of adj.get(b)) if (rank.get(c) > rank.get(b) && adj.get(a).has(c)) count++;
  }
  return count;
}

function articulationAndBridges(adj) {
  const disc = new Map(), low = new Map(), parent = new Map(), articulation = new Set(), bridges = [];
  let time = 0;
  function dfs(u) {
    disc.set(u, ++time); low.set(u, disc.get(u)); let children = 0;
    for (const v of adj.get(u)) {
      if (!disc.has(v)) {
        parent.set(v, u); children++; dfs(v); low.set(u, Math.min(low.get(u), low.get(v)));
        if (!parent.has(u) && children > 1) articulation.add(u);
        if (parent.has(u) && low.get(v) >= disc.get(u)) articulation.add(u);
        if (low.get(v) > disc.get(u)) bridges.push([u,v]);
      } else if (parent.get(u) !== v) low.set(u, Math.min(low.get(u), disc.get(v)));
    }
  }
  for (const n of adj.keys()) if (!disc.has(n)) dfs(n);
  return { articulation: [...articulation].sort(), bridges };
}

function pathStats(adj) {
  const nodes = [...adj.keys()]; let total = 0, pairs = 0, diameter = 0;
  for (let i=0;i<nodes.length;i++) {
    const start = nodes[i], dist = new Map([[start,0]]), q=[start];
    for (let qi=0;qi<q.length;qi++) {
      const cur=q[qi];
      for (const nxt of adj.get(cur)) if (!dist.has(nxt)) { dist.set(nxt,dist.get(cur)+1); q.push(nxt); }
    }
    for (let j=i+1;j<nodes.length;j++) { const d=dist.get(nodes[j]); if (d==null) continue; total+=d; pairs++; diameter=Math.max(diameter,d); }
  }
  return { average: pairs ? total/pairs : 0, diameter };
}

function betweenness(adj) {
  const nodes = [...adj.keys()], cb = new Map(nodes.map(v=>[v,0]));
  for (const s of nodes) {
    const stack=[], pred=new Map(nodes.map(v=>[v,[]])), sigma=new Map(nodes.map(v=>[v,0])), dist=new Map(nodes.map(v=>[v,-1]));
    sigma.set(s,1); dist.set(s,0); const q=[s];
    for (let qi=0;qi<q.length;qi++) {
      const v=q[qi]; stack.push(v);
      for (const w of adj.get(v)) {
        if (dist.get(w)<0) { q.push(w); dist.set(w,dist.get(v)+1); }
        if (dist.get(w)===dist.get(v)+1) { sigma.set(w,sigma.get(w)+sigma.get(v)); pred.get(w).push(v); }
      }
    }
    const delta=new Map(nodes.map(v=>[v,0]));
    while (stack.length) {
      const w=stack.pop();
      for (const v of pred.get(w)) delta.set(v,delta.get(v)+(sigma.get(v)/sigma.get(w))*(1+delta.get(w)));
      if (w!==s) cb.set(w,cb.get(w)+delta.get(w));
    }
  }
  for (const v of nodes) cb.set(v,cb.get(v)/2);
  return cb;
}

function main() {
  const notes=walk(ROOT), exact=new Map(), stems=new Map();
  for (const file of notes) {
    const r=rel(file); exact.set(r,r); exact.set(r.replace(/\.md$/i,''),r);
    const s=path.basename(r,'.md'); if (!stems.has(s)) stems.set(s,[]); stems.get(s).push(r);
  }
  function resolve(t) {
    if (exact.has(t)) return exact.get(t);
    if (!t.toLowerCase().endsWith('.md') && exact.has(`${t}.md`)) return exact.get(`${t}.md`);
    if (!t.includes('/')) { const a=stems.get(path.basename(t,'.md'))||[]; if (a.length===1) return a[0]; }
    return null;
  }

  const scopedNotes=notes.map(rel).filter(scoped).sort(), meta=new Map(scopedNotes.map(r=>[r,classify(r)]));
  const edges=new Map(), unresolved=[];
  for (const src of scopedNotes) {
    const text=fs.readFileSync(path.join(ROOT,...src.split('/')),'utf8');
    const {frontmatter,body}=splitFrontmatter(text);
    for (const [channel,chunk] of [['frontmatter',frontmatter],['body',body]]) for (const t of targets(chunk)) {
      const dst=resolve(t); if (!dst) { unresolved.push({source:src,target:t,channel}); continue; }
      if (!meta.has(dst)||dst===src) continue;
      const [a,b]=[src,dst].sort(), key=`${a}\t${b}`; if (!edges.has(key)) edges.set(key,new Set()); edges.get(key).add(channel);
    }
  }

  const adj=new Map(scopedNotes.map(r=>[r,new Set()]));
  for (const key of edges.keys()) { const [a,b]=key.split('\t'); adj.get(a).add(b); adj.get(b).add(a); }
  const degree=new Map(scopedNotes.map(r=>[r,adj.get(r).size])), localDegree=new Map(scopedNotes.map(r=>[r,0])), macroDegree=new Map(scopedNotes.map(r=>[r,0])), crossDegree=new Map(scopedNotes.map(r=>[r,0]));
  const cluster=new Map(scopedNotes.map(r=>[r,clustering(r,adj)]));
  let districtIntra=0, macroIntra=0, cross=0, bodyOnly=0, fmOnly=0, both=0;
  const districtPairs=new Map(), macroPairs=new Map();
  for (const [key,channels] of edges.entries()) {
    const [a,b]=key.split('\t'), ma=meta.get(a), mb=meta.get(b);
    if (channels.size===1&&channels.has('body')) bodyOnly++; else if (channels.size===1&&channels.has('frontmatter')) fmOnly++; else both++;
    if (ma.domain===mb.domain) { districtIntra++; localDegree.set(a,localDegree.get(a)+1); localDegree.set(b,localDegree.get(b)+1); }
    else {
      cross++; crossDegree.set(a,crossDegree.get(a)+1); crossDegree.set(b,crossDegree.get(b)+1);
      const p=[ma.domain,mb.domain].sort().join(' ↔ '); districtPairs.set(p,(districtPairs.get(p)||0)+1);
    }
    if (ma.macro===mb.macro) { macroIntra++; macroDegree.set(a,macroDegree.get(a)+1); macroDegree.set(b,macroDegree.get(b)+1); }
    else { const p=[ma.macro,mb.macro].sort().join(' ↔ '); macroPairs.set(p,(macroPairs.get(p)||0)+1); }
  }

  const n=scopedNotes.length,e=edges.size,avgDegree=n?2*e/n:0,density=n>1?e/(n*(n-1)/2):0;
  const districtLocality=e?districtIntra/e:0, macroLocality=e?macroIntra/e:0, avgCluster=avg([...cluster.values()]);
  const comps=components(adj), triangles=triangleCount(adj), cuts=articulationAndBridges(adj), paths=pathStats(adj), bc=betweenness(adj);
  const leaves=scopedNotes.filter(r=>degree.get(r)===1), isolated=scopedNotes.filter(r=>degree.get(r)===0), degrees=[...degree.values()];
  const domains=[...new Set([...meta.values()].map(x=>x.domain))].sort();
  const domainStats=domains.map(domain=>{
    const members=scopedNotes.filter(r=>meta.get(r).domain===domain), set=new Set(members); let ie=0,ee=0;
    for (const key of edges.keys()) { const [a,b]=key.split('\t'),ia=set.has(a),ib=set.has(b); if (ia&&ib) ie++; else if (ia!==ib) ee++; }
    const count=members.length,possible=count>1?count*(count-1)/2:0;
    return {domain,macro:members[0]?meta.get(members[0]).macro:'other',nodes:count,internal_edges:ie,external_edges:ee,avg_internal_degree:count?members.reduce((s,r)=>s+localDegree.get(r),0)/count:0,avg_total_degree:count?members.reduce((s,r)=>s+degree.get(r),0)/count:0,internal_density:possible?ie/possible:0,avg_clustering:count?members.reduce((s,r)=>s+cluster.get(r),0)/count:0};
  });
  const topHubs=scopedNotes.map(r=>({path:r,degree:degree.get(r),local_degree:localDegree.get(r),cross_degree:crossDegree.get(r),clustering:cluster.get(r),betweenness:bc.get(r),...meta.get(r)})).sort((a,b)=>b.degree-a.degree||b.betweenness-a.betweenness||a.path.localeCompare(b.path)).slice(0,60);
  const topBridges=[...topHubs].sort((a,b)=>b.betweenness-a.betweenness||b.cross_degree-a.cross_degree).slice(0,40);
  const corridors=[...districtPairs.entries()].sort((a,b)=>b[1]-a[1]).slice(0,50), macroCorridors=[...macroPairs.entries()].sort((a,b)=>b[1]-a[1]);
  const leafRatio=n?leaves.length/n:0, articulationRatio=n?cuts.articulation.length/n:0;

  const warnings=[];
  if (avgDegree<4.5) warnings.push('Average degree is still skeletal for the intended cognition mesh; add truthful local relationships rather than force settings.');
  if (avgDegree>9.5) warnings.push('Average degree is high enough to risk a force-directed hairball.');
  if (districtLocality<0.45) warnings.push('District locality is weak; local knowledge neighborhoods may not visually cohere.');
  if (macroLocality<0.68) warnings.push('Macro-domain locality is weak; unrelated engineering families may collapse together.');
  if (avgCluster<0.20) warnings.push('Average clustering is low; neighborhoods may look like branches rather than constellations.');
  if (leafRatio>0.20) warnings.push('Leaf ratio is high for an intentionally dense cognition mesh.');
  if (comps.length>1) warnings.push('The cognition mesh has disconnected components.');
  if (isolated.length) warnings.push('The cognition mesh contains isolated notes.');
  if (articulationRatio>0.16) warnings.push('Too much topology depends on single articulation nodes; add legitimate alternate local paths.');
  const verdict=warnings.length===0?'BALANCED_COMPLEXITY':(avgDegree>9.5||macroLocality<0.55?'CHAOTIC_COMPLEXITY':'GROWING_COMPLEXITY');

  const lines=[
    '# Engineering Cognition Mesh Audit','',
    `- Verdict: **${verdict}**`,
    `- Nodes: **${n}**`, `- Edges: **${e}**`, `- Average degree: **${avgDegree.toFixed(2)}**`, `- Density: **${pct(density)}**`,
    `- District locality: **${pct(districtLocality)}**`, `- Macro-family locality: **${pct(macroLocality)}**`,
    `- Average clustering: **${avgCluster.toFixed(3)}**`, `- Triangles: **${triangles}**`,
    `- Connected components: **${comps.length}**`, `- Largest component: **${comps[0]||0}**`,
    `- Leaf ratio: **${pct(leafRatio)}**`, `- Isolated nodes: **${isolated.length}**`,
    `- Articulation nodes: **${cuts.articulation.length}**`, `- Graph bridge edges: **${cuts.bridges.length}**`,
    `- Average shortest path: **${paths.average.toFixed(2)}**`, `- Diameter: **${paths.diameter}**`,
    `- Degree p50/p75/p90/p95: **${percentile(degrees,50)} / ${percentile(degrees,75)} / ${percentile(degrees,90)} / ${percentile(degrees,95)}**`,
    `- Body-only edges: **${bodyOnly}**`, `- Frontmatter-only edges: **${fmOnly}**`, `- Both channels: **${both}**`,
    `- Unresolved links: **${unresolved.length}**`, '',
    '## Health warnings', ...(warnings.length?warnings.map(x=>`- ${x}`):['- None']), '',
    '## District structure','',
    '| District | Macro | Nodes | Internal edges | External edges | Avg local degree | Avg total degree | Internal density | Clustering |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|',
    ...domainStats.map(d=>`| ${d.domain} | ${d.macro} | ${d.nodes} | ${d.internal_edges} | ${d.external_edges} | ${d.avg_internal_degree.toFixed(2)} | ${d.avg_total_degree.toFixed(2)} | ${pct(d.internal_density)} | ${d.avg_clustering.toFixed(3)} |`), '',
    '## Strongest district corridors', ...corridors.map(([p,c])=>`- ${p}: ${c} edges`), '',
    '## Macro-family corridors', ...macroCorridors.map(([p,c])=>`- ${p}: ${c} edges`), '',
    '## Highest-gravity nodes', ...topHubs.slice(0,35).map(x=>`- ${x.path} — degree ${x.degree}, local ${x.local_degree}, cross ${x.cross_degree}, clustering ${x.clustering.toFixed(2)}, betweenness ${x.betweenness.toFixed(1)}`), '',
    '## Bridge-centrality nodes', ...topBridges.slice(0,30).map(x=>`- ${x.path} — betweenness ${x.betweenness.toFixed(1)}, degree ${x.degree}, cross ${x.cross_degree}`), '',
    '## Articulation nodes', ...(cuts.articulation.length?cuts.articulation.map(x=>`- ${x}`):['- None']), '',
    '## Isolated notes', ...(isolated.length?isolated.map(x=>`- ${x}`):['- None']), '',
    '## Unresolved links', ...(unresolved.length?unresolved.slice(0,200).map(x=>`- ${x.source} -> ${x.target} (${x.channel})`):['- None']), ''
  ];
  fs.mkdirSync(path.dirname(REPORT),{recursive:true}); fs.writeFileSync(REPORT,lines.join('\n'),'utf8');
  const result={verdict,warnings,nodes:n,edges:e,average_degree:Number(avgDegree.toFixed(4)),density:Number(density.toFixed(6)),district_locality:Number(districtLocality.toFixed(6)),macro_locality:Number(macroLocality.toFixed(6)),average_clustering:Number(avgCluster.toFixed(6)),triangles,components:comps.length,largest_component:comps[0]||0,leaf_ratio:Number(leafRatio.toFixed(6)),isolated_nodes:isolated.length,articulation_nodes:cuts.articulation.length,graph_bridge_edges:cuts.bridges.length,average_shortest_path:Number(paths.average.toFixed(4)),diameter:paths.diameter,degree_percentiles:{p50:percentile(degrees,50),p75:percentile(degrees,75),p90:percentile(degrees,90),p95:percentile(degrees,95)},body_only_edges:bodyOnly,frontmatter_only_edges:fmOnly,both_channel_edges:both,unresolved_links:unresolved.length,domain_stats:domainStats,district_corridors:Object.fromEntries(corridors),macro_corridors:Object.fromEntries(macroCorridors),top_hubs:topHubs,top_bridges:topBridges,articulation:cuts.articulation,isolated,unresolved};
  fs.writeFileSync(JSON_REPORT,JSON.stringify(result,null,2)+'\n','utf8');
  console.log(''); console.log('Engineering Cognition Mesh Audit'); console.log('--------------------------------');
  console.log(`Verdict: ${verdict}`); console.log(`Nodes: ${n}`); console.log(`Edges: ${e}`); console.log(`Average degree: ${avgDegree.toFixed(2)}`); console.log(`District locality: ${pct(districtLocality)}`); console.log(`Macro locality: ${pct(macroLocality)}`); console.log(`Clustering: ${avgCluster.toFixed(3)}`); console.log(`Triangles: ${triangles}`); console.log(`Leaves: ${leaves.length} (${pct(leafRatio)})`); console.log(`Articulation nodes: ${cuts.articulation.length}`); console.log(`Unresolved links: ${unresolved.length}`); console.log(''); console.log('Report: reports\\ENGINEERING_MESH_AUDIT.md'); console.log('JSON: reports\\ENGINEERING_MESH_AUDIT.json'); console.log('');
}

main();
