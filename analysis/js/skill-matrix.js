// skill-matrix.js — Skills Matrix heatmap Web Component

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'textContent') e.textContent = v;
    else if (k === 'className') e.className = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  }
  return e;
}

function getHeatColor(value, max) {
  if (value === 0) return 'rgba(255,255,255,0.02)';
  const intensity = value / max;
  if (intensity > 0.7) return 'rgba(139,92,246,0.7)';
  if (intensity > 0.4) return 'rgba(139,92,246,0.4)';
  if (intensity > 0.2) return 'rgba(139,92,246,0.2)';
  return 'rgba(139,92,246,0.1)';
}

class TabSkills extends HTMLElement {
  constructor() {
    super();
    this._jobs = [];
    this._meta = null;
  }

  connectedCallback() {}

  setData(meta, jobs) {
    this._meta = meta;
    this._jobs = jobs;
    this._render();
  }

  _computeMatrix() {
    const categories = Object.keys(this._meta.role_categories).sort();

    // Get top 15 skills (case-insensitive dedup)
    const skillMap = new Map();
    for (const [skill, count] of Object.entries(this._meta.top_technical_skills)) {
      const key = skill.toLowerCase();
      if (skillMap.has(key)) {
        skillMap.set(key, { name: skillMap.get(key).name, count: skillMap.get(key).count + count });
      } else {
        skillMap.set(key, { name: skill, count });
      }
    }
    const topSkills = [...skillMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
      .map(s => s.name);

    // Build matrix: skill -> category -> count
    const matrix = {};
    let maxCount = 0;
    for (const skill of topSkills) {
      matrix[skill] = {};
      for (const cat of categories) {
        matrix[skill][cat] = 0;
      }
    }

    // Count from jobs data
    for (const job of this._jobs) {
      const cat = job.role_category;
      if (!cat) continue;
      const allSkills = [
        ...(job.required_skills_technical || []),
        ...(job.tools_technologies || [])
      ];
      for (const jobSkill of allSkills) {
        for (const topSkill of topSkills) {
          if (jobSkill.toLowerCase().includes(topSkill.toLowerCase()) ||
              topSkill.toLowerCase().includes(jobSkill.toLowerCase())) {
            matrix[topSkill][cat] = (matrix[topSkill][cat] || 0) + 1;
            if (matrix[topSkill][cat] > maxCount) maxCount = matrix[topSkill][cat];
          }
        }
      }
    }

    return { topSkills, categories, matrix, maxCount };
  }

  _getJobsForCell(skill, category) {
    return this._jobs.filter(job => {
      if (job.role_category !== category) return false;
      const allSkills = [
        ...(job.required_skills_technical || []),
        ...(job.tools_technologies || [])
      ];
      return allSkills.some(js =>
        js.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(js.toLowerCase())
      );
    });
  }

  _render() {
    const { topSkills, categories, matrix, maxCount } = this._computeMatrix();

    const container = el('div', { className: 'matrix-container' });

    container.appendChild(el('div', { className: 'matrix-title grad-text-2', textContent: 'Skills x Role Category Heat Map' }));
    container.appendChild(el('div', { className: 'matrix-subtitle', textContent: 'Top 15 technical skills mapped against role categories. Click any cell to see matching jobs.' }));

    const wrap = el('div', { className: 'matrix-table-wrap' });
    const table = el('table', { className: 'matrix-table' });

    // Header row
    const thead = el('thead');
    const headerRow = el('tr');
    headerRow.appendChild(el('th', { textContent: 'Skill' }));
    for (const cat of categories) {
      headerRow.appendChild(el('th', { textContent: cat }));
    }
    headerRow.appendChild(el('th', { textContent: 'Total' }));
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = el('tbody');
    for (const skill of topSkills) {
      const row = el('tr');
      row.appendChild(el('td', { textContent: skill }));
      let rowTotal = 0;
      for (const cat of categories) {
        const count = matrix[skill][cat] || 0;
        rowTotal += count;
        const td = el('td', {
          className: 'matrix-cell',
          textContent: count > 0 ? String(count) : '',
          title: `${skill} in ${cat}: ${count}`
        });
        td.style.backgroundColor = getHeatColor(count, maxCount);
        td.style.color = count > 0 ? 'var(--text-bright)' : 'transparent';
        td.addEventListener('click', () => this._showCellDetail(skill, cat, count));
        row.appendChild(td);
      }
      const totalTd = el('td', { textContent: String(rowTotal) });
      totalTd.style.fontWeight = '700';
      totalTd.style.color = 'var(--accent-blue)';
      row.appendChild(totalTd);
      tbody.appendChild(row);
    }

    // Footer totals
    const footRow = el('tr');
    const footLabel = el('td', { textContent: 'Total' });
    footLabel.style.fontWeight = '700';
    footRow.appendChild(footLabel);
    let grandTotal = 0;
    for (const cat of categories) {
      let catTotal = 0;
      for (const skill of topSkills) {
        catTotal += (matrix[skill][cat] || 0);
      }
      grandTotal += catTotal;
      const ftd = el('td', { textContent: String(catTotal) });
      ftd.style.fontWeight = '700';
      ftd.style.color = 'var(--accent-purple)';
      footRow.appendChild(ftd);
    }
    const gtd = el('td', { textContent: String(grandTotal) });
    gtd.style.fontWeight = '700';
    gtd.style.color = 'var(--accent-pink)';
    footRow.appendChild(gtd);
    tbody.appendChild(footRow);

    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);

    // Detail panel
    this._detailPanel = el('div', { className: 'matrix-detail', style: 'display:none' });
    container.appendChild(this._detailPanel);

    this.replaceChildren(container);
  }

  _showCellDetail(skill, category, count) {
    if (!this._detailPanel) return;
    this._detailPanel.style.display = 'block';
    this._detailPanel.replaceChildren();

    const title = el('div', { className: 'matrix-detail-title grad-text' });
    title.textContent = `"${skill}" in ${category} (${count} jobs)`;
    this._detailPanel.appendChild(title);

    if (count === 0) {
      const noData = el('div', { style: 'font-size:12px;color:var(--text-dim);font-style:italic' });
      noData.textContent = 'No jobs require this skill in this category.';
      this._detailPanel.appendChild(noData);
      return;
    }

    const jobs = this._getJobsForCell(skill, category);
    const list = el('div', { className: 'matrix-detail-list' });
    for (const j of jobs) {
      const item = el('div', { className: 'prisma-job-item' });
      const titleNode = document.createTextNode(j.title);
      const compSpan = el('span', { className: 'company', textContent: ` — ${j.company}` });
      const scoreSpan = el('span', { style: 'margin-left:auto;color:var(--accent-blue);font-weight:600' });
      scoreSpan.textContent = ` [Score: ${j.match_score}]`;
      item.appendChild(titleNode);
      item.appendChild(compSpan);
      item.appendChild(scoreSpan);
      list.appendChild(item);
    }
    this._detailPanel.appendChild(list);
  }
}

customElements.define('tab-skills', TabSkills);

export { TabSkills };
