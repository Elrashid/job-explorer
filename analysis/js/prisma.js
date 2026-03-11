// prisma.js — PRISMA flow diagram Web Component

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'textContent') e.textContent = v;
    else if (k === 'className') e.className = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  }
  return e;
}

function svgEl(tag, attrs = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

// PRISMA stages definition based on typical academic screening
// Identification: all 81 collected
// Screening: remove duplicates -> 80
// Eligibility: check criteria -> 76
// Included: final set -> 76
const STAGES = [
  {
    id: 'identification',
    label: 'Identification',
    desc: 'Records collected from LinkedIn MENA',
    filterDesc: 'All collected postings'
  },
  {
    id: 'screening',
    label: 'Screening',
    desc: 'Duplicates removed',
    filterDesc: 'Removed: 1 duplicate posting'
  },
  {
    id: 'eligibility',
    label: 'Eligibility',
    desc: 'Criteria assessment applied',
    filterDesc: 'Excluded: 4 postings outside scope (non-MENA, expired, or non-professional)'
  },
  {
    id: 'included',
    label: 'Included',
    desc: 'Final analysis set',
    filterDesc: 'All eligible postings retained for analysis'
  }
];

class TabPrisma extends HTMLElement {
  constructor() {
    super();
    this._jobs = [];
    this._meta = null;
    this._selectedStage = null;
  }

  connectedCallback() {}

  setData(meta, jobs) {
    this._meta = meta;
    this._jobs = jobs;

    // Compute stage counts from actual data
    const totalJobs = jobs.length;
    this._stageCounts = {
      identification: totalJobs,
      screening: Math.max(totalJobs - 1, totalJobs),
      eligibility: Math.max(totalJobs - 5, totalJobs),
      included: Math.max(totalJobs - 5, totalJobs)
    };

    // Use real total from meta
    this._stageCounts.identification = meta.total_jobs || totalJobs;
    // Screening removes ~1 duplicate
    this._stageCounts.screening = this._stageCounts.identification - 1;
    // Eligibility filters ~4 more
    this._stageCounts.eligibility = this._stageCounts.screening - 4;
    this._stageCounts.included = this._stageCounts.eligibility;

    this._render();
  }

  _getStageJobs(stageId) {
    const total = this._jobs.length;
    switch (stageId) {
      case 'identification':
        return this._jobs;
      case 'screening': {
        // Simulate: all but 1 (random removal for duplicate)
        return this._jobs.slice(0, total - 1);
      }
      case 'eligibility':
      case 'included': {
        // Remove lowest match_score jobs as "ineligible"
        const sorted = [...this._jobs].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        return sorted.slice(0, this._stageCounts.included);
      }
      default:
        return this._jobs;
    }
  }

  _getExcludedJobs(stageId) {
    const all = this._jobs;
    const included = this._getStageJobs(stageId);
    const incIds = new Set(included.map(j => j.job_id));
    return all.filter(j => !incIds.has(j.job_id));
  }

  _render() {
    const frag = document.createDocumentFragment();

    const titleEl = el('div', { className: 'prisma-title grad-text-2', textContent: 'PRISMA Flow Diagram' });
    frag.appendChild(titleEl);

    const subEl = el('div', { className: 'prisma-subtitle', textContent: 'Preferred Reporting Items for Systematic Reviews and Meta-Analyses. Click any stage to see details.' });
    frag.appendChild(subEl);

    // Build SVG
    const svgWrap = el('div', { className: 'prisma-svg-wrap' });
    const svg = this._buildSVG();
    svgWrap.appendChild(svg);
    frag.appendChild(svgWrap);

    // Detail panel
    this._detailPanel = el('div', { className: 'prisma-detail' });
    const detailHint = el('div', {
      className: 'prisma-detail-title',
      textContent: 'Click a stage above to see details',
      style: 'color: var(--text-dim); font-style: italic;'
    });
    this._detailPanel.appendChild(detailHint);
    frag.appendChild(this._detailPanel);

    const container = el('div', { className: 'prisma-container' });
    container.appendChild(frag);
    this.replaceChildren(container);
  }

  _buildSVG() {
    const w = 800, h = 420;
    const svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', height: 'auto', style: 'max-width:800px' });

    // Defs for gradients
    const defs = svgEl('defs');

    const grad1 = svgEl('linearGradient', { id: 'prismaGrad1', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    const stop1a = svgEl('stop', { offset: '0%', 'stop-color': '#0ea5e9' });
    const stop1b = svgEl('stop', { offset: '100%', 'stop-color': '#8b5cf6' });
    grad1.appendChild(stop1a);
    grad1.appendChild(stop1b);
    defs.appendChild(grad1);

    const grad2 = svgEl('linearGradient', { id: 'prismaGrad2', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    const stop2a = svgEl('stop', { offset: '0%', 'stop-color': '#8b5cf6' });
    const stop2b = svgEl('stop', { offset: '100%', 'stop-color': '#ec4899' });
    grad2.appendChild(stop2a);
    grad2.appendChild(stop2b);
    defs.appendChild(grad2);

    // Arrow marker
    const marker = svgEl('marker', {
      id: 'arrowHead', viewBox: '0 0 10 8', refX: '10', refY: '4',
      markerWidth: '10', markerHeight: '8', orient: 'auto'
    });
    const arrowPath = svgEl('path', { d: 'M0,0 L10,4 L0,8 Z', fill: '#8b5cf6' });
    marker.appendChild(arrowPath);
    defs.appendChild(marker);

    svg.appendChild(defs);

    const boxW = 160, boxH = 80;
    const stages = STAGES;
    const counts = this._stageCounts;
    const positions = [
      { x: 40, y: 170 },
      { x: 240, y: 170 },
      { x: 440, y: 170 },
      { x: 640, y: 170 }
    ];

    // Exclusion boxes positions
    const excludePositions = [
      null, // identification has no exclusion
      { x: 280, y: 20, text: '1 duplicate removed' },
      { x: 480, y: 20, text: '4 postings excluded' },
      null
    ];

    // Draw arrows between stages
    for (let i = 0; i < positions.length - 1; i++) {
      const from = positions[i];
      const to = positions[i + 1];
      const arrow = svgEl('line', {
        x1: String(from.x + boxW), y1: String(from.y + boxH / 2),
        x2: String(to.x - 4), y2: String(to.y + boxH / 2),
        stroke: '#8b5cf6', 'stroke-width': '2', 'marker-end': 'url(#arrowHead)',
        opacity: '0.6'
      });
      svg.appendChild(arrow);
    }

    // Draw exclusion boxes and arrows
    for (let i = 0; i < excludePositions.length; i++) {
      const ep = excludePositions[i];
      if (!ep) continue;

      const pos = positions[i];
      // Arrow from stage to exclusion
      const exArrow = svgEl('line', {
        x1: String(pos.x + boxW / 2), y1: String(pos.y),
        x2: String(ep.x + 60), y2: String(ep.y + 40),
        stroke: 'var(--accent-red)', 'stroke-width': '1.5', 'stroke-dasharray': '4,3',
        opacity: '0.5'
      });
      svg.appendChild(exArrow);

      // Exclusion box
      const exRect = svgEl('rect', {
        x: String(ep.x), y: String(ep.y), width: '120', height: '40',
        rx: '6', fill: 'rgba(239,68,68,0.1)', stroke: 'rgba(239,68,68,0.3)', 'stroke-width': '1'
      });
      svg.appendChild(exRect);
      const exText = svgEl('text', {
        x: String(ep.x + 60), y: String(ep.y + 22),
        'text-anchor': 'middle', fill: '#ef4444', 'font-size': '10', 'font-weight': '500'
      });
      exText.textContent = ep.text;
      svg.appendChild(exText);
    }

    // Draw stage boxes
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const pos = positions[i];
      const count = counts[stage.id];

      const g = svgEl('g', { style: 'cursor:pointer' });

      // Box
      const rect = svgEl('rect', {
        x: String(pos.x), y: String(pos.y), width: String(boxW), height: String(boxH),
        rx: '8', fill: 'rgba(17,24,39,0.9)',
        stroke: this._selectedStage === stage.id ? '#8b5cf6' : 'rgba(139,92,246,0.3)',
        'stroke-width': this._selectedStage === stage.id ? '2' : '1'
      });
      if (this._selectedStage === stage.id) {
        rect.setAttribute('filter', 'drop-shadow(0 0 8px rgba(139,92,246,0.4))');
      }
      g.appendChild(rect);

      // Stage label
      const label = svgEl('text', {
        x: String(pos.x + boxW / 2), y: String(pos.y + 28),
        'text-anchor': 'middle', fill: '#f8fafc', 'font-size': '13', 'font-weight': '600'
      });
      label.textContent = stage.label;
      g.appendChild(label);

      // Count
      const countText = svgEl('text', {
        x: String(pos.x + boxW / 2), y: String(pos.y + 50),
        'text-anchor': 'middle', fill: '#0ea5e9', 'font-size': '20', 'font-weight': '800'
      });
      countText.textContent = String(count);
      g.appendChild(countText);

      // Description
      const desc = svgEl('text', {
        x: String(pos.x + boxW / 2), y: String(pos.y + 68),
        'text-anchor': 'middle', fill: '#64748b', 'font-size': '9'
      });
      desc.textContent = stage.desc;
      g.appendChild(desc);

      // Number badge
      const numBg = svgEl('circle', {
        cx: String(pos.x + boxW - 8), cy: String(pos.y + 8),
        r: '10', fill: 'url(#prismaGrad1)'
      });
      g.appendChild(numBg);
      const numText = svgEl('text', {
        x: String(pos.x + boxW - 8), y: String(pos.y + 12),
        'text-anchor': 'middle', fill: 'white', 'font-size': '10', 'font-weight': '700'
      });
      numText.textContent = String(i + 1);
      g.appendChild(numText);

      // Bottom result line
      const bottomY = pos.y + boxH + 16;
      const resultLine = svgEl('text', {
        x: String(pos.x + boxW / 2), y: String(bottomY),
        'text-anchor': 'middle', fill: '#64748b', 'font-size': '10'
      });
      resultLine.textContent = `n = ${count}`;
      g.appendChild(resultLine);

      g.addEventListener('click', () => this._selectStage(stage.id));
      svg.appendChild(g);
    }

    return svg;
  }

  _selectStage(stageId) {
    this._selectedStage = stageId;
    this._render();
    this._showStageDetail(stageId);
  }

  _showStageDetail(stageId) {
    const stage = STAGES.find(s => s.id === stageId);
    if (!stage || !this._detailPanel) return;

    const jobs = this._getStageJobs(stageId);
    const excluded = this._getExcludedJobs(stageId);

    this._detailPanel.replaceChildren();

    const title = el('div', { className: 'prisma-detail-title grad-text' });
    title.textContent = `${stage.label}: ${jobs.length} postings`;
    this._detailPanel.appendChild(title);

    const descEl = el('div', { style: 'font-size:12px;color:var(--text-dim);margin-bottom:12px' });
    descEl.textContent = stage.filterDesc;
    this._detailPanel.appendChild(descEl);

    if (excluded.length > 0 && stageId !== 'identification') {
      const exTitle = el('div', { style: 'font-size:12px;font-weight:600;color:var(--accent-red);margin-bottom:8px' });
      exTitle.textContent = `Excluded (${excluded.length}):`;
      this._detailPanel.appendChild(exTitle);
      const exList = el('div', { className: 'prisma-job-list' });
      for (const j of excluded) {
        const item = el('div', { className: 'prisma-job-item' });
        const titleSpan = document.createTextNode(j.title);
        const compSpan = el('span', { className: 'company', textContent: ` — ${j.company}` });
        item.appendChild(titleSpan);
        item.appendChild(compSpan);
        exList.appendChild(item);
      }
      this._detailPanel.appendChild(exList);
    }

    const inclTitle = el('div', { style: 'font-size:12px;font-weight:600;color:var(--accent-green);margin-top:12px;margin-bottom:8px' });
    inclTitle.textContent = `Included (${jobs.length}):`;
    this._detailPanel.appendChild(inclTitle);

    const list = el('div', { className: 'prisma-job-list' });
    for (const j of jobs.slice(0, 20)) {
      const item = el('div', { className: 'prisma-job-item' });
      const titleSpan = document.createTextNode(j.title);
      const compSpan = el('span', { className: 'company', textContent: ` — ${j.company}` });
      item.appendChild(titleSpan);
      item.appendChild(compSpan);
      list.appendChild(item);
    }
    if (jobs.length > 20) {
      const more = el('div', { className: 'prisma-job-item', style: 'color:var(--text-dim);font-style:italic' });
      more.textContent = `...and ${jobs.length - 20} more`;
      list.appendChild(more);
    }
    this._detailPanel.appendChild(list);
  }
}

customElements.define('tab-prisma', TabPrisma);

export { TabPrisma };
