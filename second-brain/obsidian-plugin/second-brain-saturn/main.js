const { Plugin, ItemView, Notice } = require('obsidian');

const VIEW_TYPE = 'second-brain-saturn-view';
const SVG_NS = 'http://www.w3.org/2000/svg';

const CENTRAL_PATH = 'cognitive-os/CENTRAL_BRAIN.md';
const TILT_DEG = -9;
const INITIAL_VIEWBOX = { x: -980, y: -590, w: 1960, h: 1180 };
const PLANET_RADIUS = 205;
const RING = { hubRx: 540, hubRy: 178, laneRx: [625, 684, 742], laneRy: [214, 238, 262] };

const SECTORS = [
  { id: 'architecture', label: 'ARCHITECTURE', angle: -158, hub: 'cognitive-os/hubs/ARCHITECTURE_SECTOR.md', color: '#6f84a8' },
  { id: 'data', label: 'DATA', angle: -112, hub: 'cognitive-os/hubs/DATA_SECTOR.md', color: '#6f84a8' },
  { id: 'platform', label: 'PLATFORM + RELIABILITY', angle: -66, hub: 'cognitive-os/hubs/PLATFORM_RELIABILITY_SECTOR.md', color: '#6f84a8' },
  { id: 'security', label: 'SECURITY', angle: -20, hub: 'cognitive-os/hubs/SECURITY_SECTOR.md', color: '#9a5a5a' },
  { id: 'assurance', label: 'ASSURANCE + LEARNING', angle: 26, hub: 'cognitive-os/hubs/ASSURANCE_LEARNING_SECTOR.md', color: '#9a5a5a' },
  { id: 'decision', label: 'DECISION + GOVERNANCE', angle: 72, hub: 'cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR.md', color: '#9a5a5a' },
  { id: 'ai', label: 'AI + AUTOMATION', angle: 118, hub: 'cognitive-os/hubs/AI_AUTOMATION_SECTOR.md', color: '#6f84a8' },
  { id: 'projects', label: 'PROJECTS', angle: 164, hub: 'cognitive-os/hubs/PROJECTS_SECTOR.md', color: '#a6a8ad' },
];

const SECTOR_BY_HUB = Object.fromEntries(SECTORS.map((s) => [s.hub, s]));
const INCLUDED_PREFIXES = [
  'mesh/', 'cognitive-os/', 'planning/', 'decision-engine/', 'assurance/',
  'risk/', 'scenario/', 'incident/', 'knowledge/', 'truth/', 'atlas/projects/',
];

function svgElement(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  return el;
}
function degToRad(deg) { return (deg * Math.PI) / 180; }
function rotatePoint(x, y, deg) {
  const r = degToRad(deg);
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: x * c - y * s, y: x * s + y * c };
}
function ellipsePoint(angleDeg, rx, ry, tiltDeg = TILT_DEG) {
  const a = degToRad(angleDeg);
  return rotatePoint(rx * Math.cos(a), ry * Math.sin(a), tiltDeg);
}
function stableHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function hashUnit(text) { return (stableHash(text) % 10000) / 10000; }
function displayName(file) {
  return file.basename.replace(/_/g, ' ').replace(/\bSECTOR\b/gi, '').replace(/\s+/g, ' ').trim();
}
function included(path) { return INCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix)); }

function classify(path) {
  if (path === CENTRAL_PATH) return { kind: 'central', sector: null };
  if (SECTOR_BY_HUB[path]) return { kind: 'sector', sector: SECTOR_BY_HUB[path].id };
  if (path.startsWith('atlas/projects/')) return { kind: 'project', sector: 'projects' };
  if (path.startsWith('cognitive-os/')) return { kind: 'core', sector: null };
  if (path.startsWith('mesh/architecture/')) return { kind: 'atomic', sector: 'architecture' };
  if (path.startsWith('mesh/data/')) return { kind: 'atomic', sector: 'data' };
  if (path.startsWith('mesh/operations/') || path.startsWith('mesh/reliability/')) return { kind: 'atomic', sector: 'platform' };
  if (path.startsWith('mesh/security/')) return { kind: 'atomic', sector: 'security' };
  if (path.startsWith('mesh/governance/')) return { kind: 'atomic', sector: 'decision' };
  if (path.startsWith('mesh/ai/')) return { kind: 'atomic', sector: 'ai' };
  if (path.startsWith('planning/ARCHITECTURE_') || path.startsWith('planning/UX_FRONTEND_')) return { kind: 'subhub', sector: 'architecture' };
  if (path.startsWith('planning/DATA_')) return { kind: 'subhub', sector: 'data' };
  if (path.startsWith('planning/PLATFORM_')) return { kind: 'subhub', sector: 'platform' };
  if (path.startsWith('planning/SECURITY_')) return { kind: 'subhub', sector: 'security' };
  if (path.startsWith('planning/RESEARCH_')) return { kind: 'subhub', sector: 'assurance' };
  if (path.startsWith('planning/DELIVERY_')) return { kind: 'subhub', sector: 'decision' };
  if (path.startsWith('decision-engine/') || path.startsWith('truth/')) return { kind: 'subhub', sector: 'decision' };
  if (path.startsWith('risk/')) return { kind: 'subhub', sector: 'security' };
  if (path.startsWith('scenario/') || path.startsWith('assurance/') || path.startsWith('incident/') || path.startsWith('knowledge/')) return { kind: 'subhub', sector: 'assurance' };
  return { kind: 'atomic', sector: 'decision' };
}

function nodeRadius(node) {
  if (node.kind === 'central') return 16;
  if (node.kind === 'sector') return 8.5;
  if (node.kind === 'project') return 7;
  if (node.kind === 'subhub') return 5.2;
  if (node.kind === 'core') return 4.4;
  return 2.8 + Math.min(1.7, Math.log2(1 + (node.degree || 0)) * 0.26);
}

class SaturnBrainView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.labelsVisible = false;
    this.edgesVisible = false;
    this.viewBox = { ...INITIAL_VIEWBOX };
    this.nodeEls = [];
    this.edgeEls = [];
  }
  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return 'Saturn Brain'; }
  getIcon() { return 'git-fork'; }
  async onOpen() { await this.renderView(); }
  async onClose() { this.contentEl.empty(); }

  async renderView() {
    const root = this.contentEl;
    root.empty();
    root.addClass('saturn-brain-root');

    const toolbar = root.createDiv({ cls: 'saturn-brain-toolbar' });
    const titleWrap = toolbar.createDiv({ cls: 'saturn-brain-toolbar-title' });
    titleWrap.createDiv({ cls: 'saturn-brain-kicker', text: 'PROJECT SECOND BRAIN' });
    titleWrap.createDiv({ cls: 'saturn-brain-title', text: 'SATURN COGNITIVE MAP' });

    const controls = toolbar.createDiv({ cls: 'saturn-brain-controls' });
    const fitBtn = controls.createEl('button', { text: 'Fit' });
    const labelsBtn = controls.createEl('button', { text: 'Labels' });
    const edgesBtn = controls.createEl('button', { text: 'Semantic edges' });
    const refreshBtn = controls.createEl('button', { text: 'Refresh' });
    const centralBtn = controls.createEl('button', { text: 'Central Brain' });

    const stage = root.createDiv({ cls: 'saturn-brain-stage' });
    const status = root.createDiv({ cls: 'saturn-brain-status' });

    const graph = this.buildGraph();
    status.setText(`${graph.nodes.length} notes  •  ${graph.edges.length} real links  •  Saturn projection`);

    const svg = svgElement('svg', {
      class: 'saturn-brain-svg',
      viewBox: `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.w} ${this.viewBox.h}`,
      role: 'img',
      'aria-label': 'Saturn-style Project Second Brain knowledge map',
    });
    stage.appendChild(svg);

    this.positionNodes(graph.nodes);
    this.renderSpace(svg);
    this.renderRearRings(svg);
    this.renderEdges(svg, graph);
    this.renderPlanet(svg);
    this.renderFrontRings(svg);
    this.renderNodes(svg, graph);
    this.bindNavigation(svg);

    fitBtn.onclick = () => this.fit(svg);
    labelsBtn.onclick = () => {
      this.labelsVisible = !this.labelsVisible;
      root.toggleClass('saturn-show-all-labels', this.labelsVisible);
      labelsBtn.toggleClass('is-active', this.labelsVisible);
    };
    edgesBtn.onclick = () => {
      this.edgesVisible = !this.edgesVisible;
      root.toggleClass('saturn-show-edges', this.edgesVisible);
      edgesBtn.toggleClass('is-active', this.edgesVisible);
    };
    refreshBtn.onclick = () => this.renderView();
    centralBtn.onclick = async () => {
      const file = this.app.vault.getAbstractFileByPath(CENTRAL_PATH);
      if (file) await this.app.workspace.getLeaf(true).openFile(file);
    };
  }

  buildGraph() {
    const files = this.app.vault.getMarkdownFiles().filter((file) => included(file.path));
    const nodes = files.map((file) => {
      const c = classify(file.path);
      return { file, path: file.path, name: displayName(file), kind: c.kind, sector: c.sector, degree: 0, x: 0, y: 0 };
    });
    const nodeByPath = new Map(nodes.map((node) => [node.path, node]));
    const edges = [];
    const edgeKeys = new Set();

    for (const node of nodes) {
      const cache = this.app.metadataCache.getFileCache(node.file) || {};
      const refs = [...(cache.links || []), ...(cache.frontmatterLinks || [])];
      for (const ref of refs) {
        if (!ref || !ref.link) continue;
        const dest = this.app.metadataCache.getFirstLinkpathDest(ref.link, node.path);
        if (!dest || !nodeByPath.has(dest.path) || dest.path === node.path) continue;
        const key = [node.path, dest.path].sort().join('::');
        if (edgeKeys.has(key)) continue;
        edgeKeys.add(key);
        edges.push({ a: node.path, b: dest.path });
        node.degree += 1;
        nodeByPath.get(dest.path).degree += 1;
      }
    }
    return { nodes, edges, nodeByPath };
  }

  positionNodes(nodes) {
    const central = nodes.find((n) => n.path === CENTRAL_PATH);
    if (central) { central.x = 0; central.y = 0; }

    const core = nodes.filter((n) => n.kind === 'core').sort((a, b) => a.path.localeCompare(b.path));
    const golden = Math.PI * (3 - Math.sqrt(5));
    core.forEach((node, i) => {
      const r = 48 + Math.sqrt(i + 1) * 31;
      const a = i * golden + hashUnit(node.path);
      node.x = Math.cos(a) * Math.min(r, PLANET_RADIUS - 34);
      node.y = Math.sin(a) * Math.min(r, PLANET_RADIUS - 34) * 0.86;
    });

    for (const sector of SECTORS) {
      const hub = nodes.find((n) => n.path === sector.hub);
      if (!hub) continue;
      const p = ellipsePoint(sector.angle, RING.hubRx, RING.hubRy);
      hub.x = p.x;
      hub.y = p.y;
    }

    for (const sector of SECTORS) {
      if (sector.id === 'projects') continue;
      const members = nodes.filter((n) => n.sector === sector.id && n.kind !== 'sector').sort((a, b) => a.path.localeCompare(b.path));
      const count = Math.max(1, members.length);
      members.forEach((node, i) => {
        const lane = i % 3;
        const span = 32;
        const t = count === 1 ? 0 : i / (count - 1) - 0.5;
        const theta = sector.angle + t * span;
        const p = ellipsePoint(theta, RING.laneRx[lane], RING.laneRy[lane]);
        const tangent = degToRad(theta + 90 + TILT_DEG);
        const jitter = (hashUnit(node.path) - 0.5) * 10;
        node.x = p.x + Math.cos(tangent) * jitter;
        node.y = p.y + Math.sin(tangent) * jitter * 0.6;
      });
    }

    const projects = nodes.filter((n) => n.kind === 'project').sort((a, b) => a.path.localeCompare(b.path));
    const moonAngles = [-160, -112, -66, -18, 32, 82, 132, 176];
    projects.forEach((node, i) => {
      const angle = moonAngles[i % moonAngles.length] + Math.floor(i / moonAngles.length) * 7;
      const lane = Math.floor(i / moonAngles.length);
      const p = ellipsePoint(angle, 880 + lane * 65, 395 + lane * 30);
      node.x = p.x;
      node.y = p.y;
    });
  }

  renderSpace(svg) {
    const defs = svgElement('defs');
    const planetGradient = svgElement('radialGradient', { id: 'saturn-planet-gradient', cx: '38%', cy: '30%', r: '78%' });
    planetGradient.appendChild(svgElement('stop', { offset: '0%', 'stop-color': '#303742' }));
    planetGradient.appendChild(svgElement('stop', { offset: '52%', 'stop-color': '#181d25' }));
    planetGradient.appendChild(svgElement('stop', { offset: '100%', 'stop-color': '#090c11' }));
    defs.appendChild(planetGradient);

    const glow = svgElement('radialGradient', { id: 'saturn-glow-gradient', cx: '50%', cy: '50%', r: '50%' });
    glow.appendChild(svgElement('stop', { offset: '0%', 'stop-color': '#dfe4ec', 'stop-opacity': '0.09' }));
    glow.appendChild(svgElement('stop', { offset: '55%', 'stop-color': '#dfe4ec', 'stop-opacity': '0.03' }));
    glow.appendChild(svgElement('stop', { offset: '100%', 'stop-color': '#dfe4ec', 'stop-opacity': '0' }));
    defs.appendChild(glow);
    svg.appendChild(defs);

    const stars = svgElement('g', { class: 'saturn-starfield' });
    for (let i = 0; i < 170; i += 1) {
      const x = -940 + hashUnit(`star-x-${i}`) * 1880;
      const y = -550 + hashUnit(`star-y-${i}`) * 1100;
      const r = 0.45 + hashUnit(`star-r-${i}`) * 1.05;
      const opacity = 0.14 + hashUnit(`star-o-${i}`) * 0.42;
      stars.appendChild(svgElement('circle', { cx: x, cy: y, r, fill: '#edf1f7', opacity }));
    }
    svg.appendChild(stars);
  }

  renderRearRings(svg) {
    const g = svgElement('g', { class: 'saturn-ring-rear', transform: `rotate(${TILT_DEG})` });
    const rings = [[565,185,1.8,0.20],[615,205,8.5,0.065],[654,219,1.25,0.17],[700,238,10.5,0.045],[742,252,1.1,0.14]];
    for (const [rx, ry, width, opacity] of rings) {
      g.appendChild(svgElement('ellipse', { cx: 0, cy: 0, rx, ry, fill: 'none', stroke: '#d9dde5', 'stroke-width': width, 'stroke-opacity': opacity }));
    }
    svg.appendChild(g);
  }

  renderPlanet(svg) {
    const g = svgElement('g', { class: 'saturn-planet-layer' });
    g.appendChild(svgElement('circle', { class: 'saturn-planet-glow', cx: 0, cy: 0, r: 270, fill: 'url(#saturn-glow-gradient)' }));
    g.appendChild(svgElement('circle', { class: 'saturn-planet-disc', cx: 0, cy: 0, r: PLANET_RADIUS, fill: 'url(#saturn-planet-gradient)' }));
    for (const y of [-116, -66, -18, 34, 82, 124]) {
      const half = Math.sqrt(Math.max(0, PLANET_RADIUS * PLANET_RADIUS - y * y));
      g.appendChild(svgElement('path', { class: 'saturn-planet-band', d: `M ${-half} ${y} Q 0 ${y + 13} ${half} ${y}` }));
    }
    svg.appendChild(g);
  }

  renderFrontRings(svg) {
    const g = svgElement('g', { class: 'saturn-ring-front', transform: `rotate(${TILT_DEG})` });
    const rings = [[565,185,2.4,0.44],[615,205,8.5,0.12],[654,219,1.7,0.36],[700,238,10.5,0.08],[742,252,1.5,0.30]];
    for (const [rx, ry, width, opacity] of rings) {
      g.appendChild(svgElement('path', { d: `M ${-rx} 0 A ${rx} ${ry} 0 0 0 ${rx} 0`, fill: 'none', stroke: '#eef1f5', 'stroke-width': width, 'stroke-opacity': opacity }));
    }
    svg.appendChild(g);
  }

  renderEdges(svg, graph) {
    const group = svgElement('g', { class: 'saturn-edge-layer' });
    this.edgeEls = [];
    for (const edge of graph.edges) {
      const a = graph.nodeByPath.get(edge.a);
      const b = graph.nodeByPath.get(edge.b);
      if (!a || !b) continue;
      const major = ['central', 'sector', 'project'].includes(a.kind) || ['central', 'sector', 'project'].includes(b.kind);
      const line = svgElement('line', { class: `saturn-edge${major ? ' saturn-edge-major' : ''}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'data-a': a.path, 'data-b': b.path });
      group.appendChild(line);
      this.edgeEls.push(line);
    }
    svg.appendChild(group);
  }

  renderNodes(svg, graph) {
    const group = svgElement('g', { class: 'saturn-node-layer' });
    this.nodeEls = [];
    for (const node of graph.nodes) {
      const sector = node.sector ? SECTORS.find((s) => s.id === node.sector) : null;
      const color = node.kind === 'central' ? '#d5ab3f' : node.kind === 'sector' ? (sector?.color || '#9aa0aa') : '#c9cdd5';
      const g = svgElement('g', { class: `saturn-node saturn-node-${node.kind}`, transform: `translate(${node.x} ${node.y})`, tabindex: 0, 'data-path': node.path });
      g.style.color = color;
      const r = nodeRadius(node);
      if (node.kind === 'central' || node.kind === 'sector' || node.kind === 'project') {
        g.appendChild(svgElement('circle', { class: 'saturn-node-halo', r: r + (node.kind === 'central' ? 14 : 7) }));
      }
      g.appendChild(svgElement('circle', { class: 'saturn-node-dot', r, fill: color }));
      const label = svgElement('text', { class: 'saturn-node-label', x: r + 8, y: 4 });
      label.textContent = node.kind === 'sector' ? (sector?.label || node.name) : node.name;
      g.appendChild(label);
      g.addEventListener('mouseenter', () => { g.classList.add('is-hovered'); this.highlight(node.path); });
      g.addEventListener('mouseleave', () => { g.classList.remove('is-hovered'); this.clearHighlight(); });
      g.addEventListener('click', async (event) => { event.stopPropagation(); await this.openNode(node.file); });
      g.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); await this.openNode(node.file); }
      });
      group.appendChild(g);
      this.nodeEls.push(g);
    }
    svg.appendChild(group);
  }

  async openNode(file) { await this.app.workspace.getLeaf(true).openFile(file); }

  highlight(path) {
    const connected = new Set([path]);
    for (const edge of this.edgeEls) {
      const a = edge.getAttribute('data-a');
      const b = edge.getAttribute('data-b');
      const active = a === path || b === path;
      if (a === path) connected.add(b);
      if (b === path) connected.add(a);
      edge.classList.toggle('is-highlighted', active);
      edge.classList.toggle('is-dimmed', !active);
    }
    for (const node of this.nodeEls) node.classList.toggle('is-dimmed', !connected.has(node.getAttribute('data-path')));
  }

  clearHighlight() {
    for (const edge of this.edgeEls) edge.classList.remove('is-highlighted', 'is-dimmed');
    for (const node of this.nodeEls) node.classList.remove('is-dimmed');
  }

  fit(svg) {
    this.viewBox = { ...INITIAL_VIEWBOX };
    svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.w} ${this.viewBox.h}`);
  }

  bindNavigation(svg) {
    svg.addEventListener('wheel', (event) => {
      event.preventDefault();
      const factor = event.deltaY > 0 ? 1.12 : 0.89;
      const rect = svg.getBoundingClientRect();
      const mx = this.viewBox.x + ((event.clientX - rect.left) / rect.width) * this.viewBox.w;
      const my = this.viewBox.y + ((event.clientY - rect.top) / rect.height) * this.viewBox.h;
      const nw = this.viewBox.w * factor;
      const nh = this.viewBox.h * factor;
      this.viewBox.x = mx - ((mx - this.viewBox.x) / this.viewBox.w) * nw;
      this.viewBox.y = my - ((my - this.viewBox.y) / this.viewBox.h) * nh;
      this.viewBox.w = nw;
      this.viewBox.h = nh;
      svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.w} ${this.viewBox.h}`);
    }, { passive: false });

    let dragging = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startBox = null;

    svg.addEventListener('pointerdown', (event) => {
      if (event.target.closest('.saturn-node')) return;
      dragging = true;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startBox = { ...this.viewBox };
      svg.setPointerCapture(pointerId);
      svg.classList.add('is-panning');
    });

    svg.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      const rect = svg.getBoundingClientRect();
      this.viewBox.x = startBox.x - ((event.clientX - startX) / rect.width) * startBox.w;
      this.viewBox.y = startBox.y - ((event.clientY - startY) / rect.height) * startBox.h;
      svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.w} ${this.viewBox.h}`);
    });

    const finishPan = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      svg.classList.remove('is-panning');
      try { svg.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
    };
    svg.addEventListener('pointerup', finishPan);
    svg.addEventListener('pointercancel', finishPan);
    svg.addEventListener('dblclick', (event) => { if (!event.target.closest('.saturn-node')) this.fit(svg); });
  }
}

module.exports = class SecondBrainSaturnPlugin extends Plugin {
  async onload() {
    console.log('[Second Brain Saturn] loading');
    this.registerView(VIEW_TYPE, (leaf) => new SaturnBrainView(leaf, this));
    this.addCommand({ id: 'open-saturn-brain', name: 'Open Saturn Brain', callback: () => this.activateView() });
    this.addCommand({ id: 'refresh-saturn-brain', name: 'Refresh Saturn Brain', callback: () => this.refreshViews() });

    for (const icon of ['git-fork', 'network', 'circle-dot']) {
      try {
        this.addRibbonIcon(icon, 'Open Saturn Brain', () => this.activateView());
        break;
      } catch (error) {
        console.warn(`[Second Brain Saturn] ribbon icon ${icon} unavailable`, error);
      }
    }
    console.log('[Second Brain Saturn] loaded');
  }

  onunload() { this.app.workspace.detachLeavesOfType(VIEW_TYPE); }

  async activateView() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length) { await this.app.workspace.revealLeaf(existing[0]); return; }
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }

  async refreshViews(showNotice = true) {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    for (const leaf of leaves) {
      if (leaf.view && typeof leaf.view.renderView === 'function') await leaf.view.renderView();
    }
    if (showNotice) new Notice('Saturn Brain refreshed');
  }
};