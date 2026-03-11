// meta-charts.js — Overview tab Web Component

const COLORS = [
  '#0ea5e9', '#8b5cf6', '#ec4899', '#22c55e', '#f59e0b',
  '#ef4444', '#06b6d4', '#a855f7', '#f97316', '#14b8a6',
  '#6366f1', '#e879f9', '#84cc16', '#fb923c', '#38bdf8'
];

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'textContent') e.textContent = v;
    else if (k === 'className') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
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

function buildStatCards(meta, jobs) {
  const cats = Object.keys(meta.role_categories).length;
  const scores = jobs.map(j => j.match_score).filter(s => s != null);
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';

  // Find top skill
  const techEntries = Object.entries(meta.top_technical_skills);
  techEntries.sort((a, b) => b[1] - a[1]);
  const topSkill = techEntries.length ? techEntries[0][0] : 'N/A';
  const topSkillCount = techEntries.length ? techEntries[0][1] : 0;

  const grid = el('div', { className: 'stat-grid' });
  const cards = [
    { label: 'Total Jobs Analyzed', value: String(meta.total_jobs), detail: 'LinkedIn MENA region postings' },
    { label: 'Role Categories', value: String(cats), detail: Object.keys(meta.role_categories).join(', ') },
    { label: 'Avg Match Score', value: avgScore, detail: `Range: ${Math.min(...scores)} - ${Math.max(...scores)}` },
    { label: 'Top Skill', value: topSkill, detail: `Appears in ${topSkillCount} job postings` }
  ];
  for (const c of cards) {
    const card = el('div', { className: 'stat-card' }, [
      el('div', { className: 'stat-label', textContent: c.label }),
      el('div', { className: 'stat-value', textContent: c.value }),
      el('div', { className: 'stat-detail', textContent: c.detail })
    ]);
    grid.appendChild(card);
  }
  return grid;
}

function buildBarChart(title, data, gradIndex = 0) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxVal = Math.max(...entries.map(e => e[1]));
  const grads = ['var(--grad-1)', 'var(--grad-2)', 'var(--grad-3)'];
  const grad = grads[gradIndex % grads.length];

  const panel = el('div', { className: 'chart-panel' });
  panel.appendChild(el('div', { className: 'chart-title', textContent: title }));
  const chart = el('div', { className: 'bar-chart' });

  for (const [label, count] of entries) {
    const pct = maxVal > 0 ? (count / maxVal) * 100 : 0;
    const fill = el('div', { className: 'bar-fill' });
    fill.style.width = '0%';
    fill.style.background = grad;

    const row = el('div', { className: 'bar-row' }, [
      el('span', { className: 'bar-label', textContent: label, title: label }),
      el('div', { className: 'bar-track' }, [fill]),
      el('span', { className: 'bar-count', textContent: String(count) })
    ]);
    chart.appendChild(row);

    // Animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { fill.style.width = pct + '%'; });
    });
  }
  panel.appendChild(chart);
  return panel;
}

function buildDonutChart(title, data) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, e) => s + e[1], 0);

  const panel = el('div', { className: 'chart-panel' });
  panel.appendChild(el('div', { className: 'chart-title', textContent: title }));

  const container = el('div', { className: 'donut-container' });

  const size = 160;
  const cx = size / 2, cy = size / 2, r = 55, strokeW = 24;
  const circumference = 2 * Math.PI * r;

  const svg = svgEl('svg', { width: String(size), height: String(size), viewBox: `0 0 ${size} ${size}`, class: 'donut-svg' });

  // Background circle
  const bgCircle = svgEl('circle', {
    cx: String(cx), cy: String(cy), r: String(r),
    fill: 'none', stroke: 'rgba(255,255,255,0.05)', 'stroke-width': String(strokeW)
  });
  svg.appendChild(bgCircle);

  let accOffset = 0;
  for (let i = 0; i < entries.length; i++) {
    const [, count] = entries[i];
    const pct = count / total;
    const dashLen = pct * circumference;
    const dashGap = circumference - dashLen;

    const circle = svgEl('circle', {
      cx: String(cx), cy: String(cy), r: String(r),
      fill: 'none',
      stroke: COLORS[i % COLORS.length],
      'stroke-width': String(strokeW),
      'stroke-dasharray': `${dashLen} ${dashGap}`,
      'stroke-dashoffset': String(-accOffset),
      transform: `rotate(-90 ${cx} ${cy})`
    });
    svg.appendChild(circle);
    accOffset += dashLen;
  }

  // Center text
  const centerText = svgEl('text', {
    x: String(cx), y: String(cy),
    'text-anchor': 'middle', 'dominant-baseline': 'central',
    fill: '#f8fafc', 'font-size': '22', 'font-weight': '700'
  });
  centerText.textContent = String(total);
  svg.appendChild(centerText);

  container.appendChild(svg);

  // Legend
  const legend = el('div', { className: 'donut-legend' });
  for (let i = 0; i < entries.length; i++) {
    const [label, count] = entries[i];
    const pctStr = ((count / total) * 100).toFixed(0) + '%';
    const dot = el('span', { className: 'legend-dot' });
    dot.style.backgroundColor = COLORS[i % COLORS.length];
    legend.appendChild(
      el('div', { className: 'legend-item' }, [
        dot,
        document.createTextNode(`${label}: ${count} (${pctStr})`)
      ])
    );
  }
  container.appendChild(legend);
  panel.appendChild(container);
  return panel;
}

function buildTop15Skills(meta) {
  const entries = Object.entries(meta.top_technical_skills).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const data = Object.fromEntries(entries);
  return buildBarChart('Top 15 Technical Skills', data, 2);
}

class TabOverview extends HTMLElement {
  connectedCallback() {
    // Data will be set via setData
  }

  setData(meta, jobs) {
    const frag = document.createDocumentFragment();

    frag.appendChild(buildStatCards(meta, jobs));

    const grid = el('div', { className: 'charts-grid' });
    grid.appendChild(buildBarChart('Jobs by Role Category', meta.role_categories, 0));
    grid.appendChild(buildBarChart('Career Level Distribution', meta.career_levels, 1));
    grid.appendChild(buildDonutChart('Education Requirements', meta.education_requirements));
    grid.appendChild(buildTop15Skills(meta));
    frag.appendChild(grid);

    this.replaceChildren(frag);
  }
}

customElements.define('tab-overview', TabOverview);

export { TabOverview };
