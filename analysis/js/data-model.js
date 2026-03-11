// data-model.js — Data Model ER diagram Web Component

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

// Entity definitions
const ENTITIES = [
  {
    name: 'Job',
    x: 350, y: 30,
    attrs: [
      { name: 'job_id', pk: true },
      { name: 'title' },
      { name: 'career_level' },
      { name: 'match_score' },
      { name: 'growth_potential' },
      { name: 'compensation_level' },
      { name: 'salary_range' }
    ]
  },
  {
    name: 'Company',
    x: 30, y: 30,
    attrs: [
      { name: 'company_name', pk: true },
      { name: 'industry' }
    ]
  },
  {
    name: 'Skill',
    x: 680, y: 30,
    attrs: [
      { name: 'skill_name', pk: true },
      { name: 'type (technical/soft)' },
      { name: 'frequency' }
    ]
  },
  {
    name: 'Location',
    x: 30, y: 280,
    attrs: [
      { name: 'location_id', pk: true },
      { name: 'city' },
      { name: 'country' },
      { name: 'region' }
    ]
  },
  {
    name: 'Qualification',
    x: 680, y: 280,
    attrs: [
      { name: 'qualification_id', pk: true },
      { name: 'education_level' },
      { name: 'certification' },
      { name: 'min_years_exp' }
    ]
  }
];

const RELATIONSHIPS = [
  { from: 'Company', to: 'Job', label: 'posts', fromCard: '1', toCard: 'N' },
  { from: 'Job', to: 'Skill', label: 'requires', fromCard: 'N', toCard: 'M' },
  { from: 'Job', to: 'Qualification', label: 'demands', fromCard: '1', toCard: 'N' },
  { from: 'Location', to: 'Job', label: 'hosts', fromCard: '1', toCard: 'N' },
];

class TabDatamodel extends HTMLElement {
  constructor() {
    super();
    this._meta = null;
    this._jobs = [];
  }

  connectedCallback() {}

  setData(meta, jobs) {
    this._meta = meta;
    this._jobs = jobs;
    this._render();
  }

  _render() {
    const container = el('div', { className: 'datamodel-container' });
    container.appendChild(el('div', { className: 'datamodel-title grad-text-2', textContent: 'Entity-Relationship Data Model' }));
    container.appendChild(el('div', { className: 'datamodel-subtitle', textContent: 'Normalized schema for 81 LinkedIn job postings in the MENA region' }));

    // Compute real counts from data
    const jobCount = this._jobs.length;
    const companies = new Set(this._jobs.map(j => j.company)).size;
    const skills = Object.keys(this._meta.top_technical_skills).length;
    const locations = new Set(this._jobs.map(j => j.location).filter(Boolean)).size;
    const edLevels = Object.keys(this._meta.education_requirements).length;

    const svgWrap = el('div', { className: 'datamodel-svg-wrap' });
    const svg = this._buildSVG(jobCount, companies, skills, locations, edLevels);
    svgWrap.appendChild(svg);
    container.appendChild(svgWrap);

    this.replaceChildren(container);
  }

  _buildSVG(jobCount, companyCount, skillCount, locationCount, qualCount) {
    const w = 900, h = 500;
    const svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', height: 'auto' });

    // Defs
    const defs = svgEl('defs');
    const grad = svgEl('linearGradient', { id: 'erGrad1', x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
    grad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': '#0ea5e9' }));
    grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': '#8b5cf6' }));
    defs.appendChild(grad);

    const grad2 = svgEl('linearGradient', { id: 'erGrad2', x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
    grad2.appendChild(svgEl('stop', { offset: '0%', 'stop-color': '#8b5cf6' }));
    grad2.appendChild(svgEl('stop', { offset: '100%', 'stop-color': '#ec4899' }));
    defs.appendChild(grad2);
    svg.appendChild(defs);

    const entityW = 200, entityHeaderH = 32, attrH = 22;

    const entityPositions = {};
    const counts = { Job: jobCount, Company: companyCount, Skill: skillCount, Location: locationCount, Qualification: qualCount };

    // Draw entities
    for (const entity of ENTITIES) {
      const totalH = entityHeaderH + entity.attrs.length * attrH + 8;
      entityPositions[entity.name] = {
        x: entity.x, y: entity.y,
        w: entityW, h: totalH,
        cx: entity.x + entityW / 2,
        cy: entity.y + totalH / 2
      };

      const g = svgEl('g');

      // Shadow
      g.appendChild(svgEl('rect', {
        x: String(entity.x + 3), y: String(entity.y + 3),
        width: String(entityW), height: String(totalH),
        rx: '8', fill: 'rgba(0,0,0,0.3)'
      }));

      // Main rect
      g.appendChild(svgEl('rect', {
        x: String(entity.x), y: String(entity.y),
        width: String(entityW), height: String(totalH),
        rx: '8', fill: '#111827', stroke: 'rgba(139,92,246,0.3)', 'stroke-width': '1'
      }));

      // Header bg
      g.appendChild(svgEl('rect', {
        x: String(entity.x), y: String(entity.y),
        width: String(entityW), height: String(entityHeaderH),
        rx: '8', fill: 'url(#erGrad1)'
      }));
      // Fix bottom corners of header
      g.appendChild(svgEl('rect', {
        x: String(entity.x), y: String(entity.y + entityHeaderH - 8),
        width: String(entityW), height: '8',
        fill: 'url(#erGrad1)'
      }));

      // Entity name
      const nameText = svgEl('text', {
        x: String(entity.x + 10), y: String(entity.y + 21),
        fill: 'white', 'font-size': '13', 'font-weight': '700'
      });
      nameText.textContent = entity.name;
      g.appendChild(nameText);

      // Count badge
      const count = counts[entity.name] || 0;
      const badgeText = svgEl('text', {
        x: String(entity.x + entityW - 10), y: String(entity.y + 21),
        fill: 'rgba(255,255,255,0.7)', 'font-size': '10', 'font-weight': '600',
        'text-anchor': 'end'
      });
      badgeText.textContent = `n=${count}`;
      g.appendChild(badgeText);

      // Divider
      g.appendChild(svgEl('line', {
        x1: String(entity.x), y1: String(entity.y + entityHeaderH),
        x2: String(entity.x + entityW), y2: String(entity.y + entityHeaderH),
        stroke: 'rgba(139,92,246,0.2)', 'stroke-width': '1'
      }));

      // Attributes
      for (let i = 0; i < entity.attrs.length; i++) {
        const attr = entity.attrs[i];
        const ay = entity.y + entityHeaderH + 6 + i * attrH;

        // PK indicator
        if (attr.pk) {
          const keyIcon = svgEl('text', {
            x: String(entity.x + 12), y: String(ay + 14),
            fill: '#f59e0b', 'font-size': '10'
          });
          keyIcon.textContent = 'PK';
          g.appendChild(keyIcon);
        }

        const attrText = svgEl('text', {
          x: String(entity.x + (attr.pk ? 34 : 12)), y: String(ay + 14),
          fill: attr.pk ? '#f8fafc' : '#94a3b8', 'font-size': '11',
          'font-weight': attr.pk ? '600' : '400'
        });
        attrText.textContent = attr.name;
        g.appendChild(attrText);

        // Underline for PK
        if (attr.pk) {
          g.appendChild(svgEl('line', {
            x1: String(entity.x + 34), y1: String(ay + 16),
            x2: String(entity.x + 34 + attr.name.length * 6.5), y2: String(ay + 16),
            stroke: '#f59e0b', 'stroke-width': '0.5', opacity: '0.5'
          }));
        }
      }

      svg.appendChild(g);
    }

    // Draw relationships
    for (const rel of RELATIONSHIPS) {
      const from = entityPositions[rel.from];
      const to = entityPositions[rel.to];
      if (!from || !to) continue;

      // Determine connection points
      let x1, y1, x2, y2;

      const dx = to.cx - from.cx;
      const dy = to.cy - from.cy;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal connection
        if (dx > 0) {
          x1 = from.x + from.w;
          y1 = from.cy;
          x2 = to.x;
          y2 = to.cy;
        } else {
          x1 = from.x;
          y1 = from.cy;
          x2 = to.x + to.w;
          y2 = to.cy;
        }
      } else {
        // Vertical connection
        if (dy > 0) {
          x1 = from.cx;
          y1 = from.y + from.h;
          x2 = to.cx;
          y2 = to.y;
        } else {
          x1 = from.cx;
          y1 = from.y;
          x2 = to.cx;
          y2 = to.y + to.h;
        }
      }

      // Draw line
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      const path = svgEl('path', {
        d: `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`,
        fill: 'none', stroke: 'rgba(139,92,246,0.4)', 'stroke-width': '1.5'
      });
      svg.appendChild(path);

      // Relationship label
      const labelBg = svgEl('rect', {
        x: String(midX - 30), y: String(midY - 10),
        width: '60', height: '20', rx: '4',
        fill: '#1a1f35', stroke: 'rgba(139,92,246,0.3)', 'stroke-width': '1'
      });
      svg.appendChild(labelBg);
      const labelText = svgEl('text', {
        x: String(midX), y: String(midY + 4),
        'text-anchor': 'middle', fill: '#8b5cf6', 'font-size': '10', 'font-style': 'italic'
      });
      labelText.textContent = rel.label;
      svg.appendChild(labelText);

      // Cardinality at from end
      const fromCard = svgEl('text', {
        x: String(x1 + (x2 > x1 ? 8 : -8)), y: String(y1 + (y2 > y1 ? 16 : -6)),
        'text-anchor': x2 > x1 ? 'start' : 'end',
        fill: '#0ea5e9', 'font-size': '11', 'font-weight': '700'
      });
      fromCard.textContent = rel.fromCard;
      svg.appendChild(fromCard);

      // Cardinality at to end
      const toCard = svgEl('text', {
        x: String(x2 + (x2 > x1 ? -8 : 8)), y: String(y2 + (y2 > y1 ? -6 : 16)),
        'text-anchor': x2 > x1 ? 'end' : 'start',
        fill: '#0ea5e9', 'font-size': '11', 'font-weight': '700'
      });
      toCard.textContent = rel.toCard;
      svg.appendChild(toCard);
    }

    return svg;
  }
}

customElements.define('tab-datamodel', TabDatamodel);

export { TabDatamodel };
