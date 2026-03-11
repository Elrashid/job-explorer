// browse.js — Browse Tab Web Component

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

function scoreClass(score) {
  if (score >= 50) return 'score-high';
  if (score >= 25) return 'score-mid';
  return 'score-low';
}

export class TabBrowse extends HTMLElement {
  constructor() {
    super();
    this.cvs = [];
    this.jobs = [];
    this.onJobSelect = null;
    this.filters = { search: '', category: '', level: '' };
  }

  setData(cvs, jobs) {
    this.cvs = cvs;
    this.jobs = jobs;
    this.render();
  }

  getFilteredCVs() {
    let filtered = [...this.cvs];
    const { search, category, level } = this.filters;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(cv =>
        cv.job_title.toLowerCase().includes(q) ||
        cv.company.toLowerCase().includes(q)
      );
    }

    if (category) {
      filtered = filtered.filter(cv => {
        const job = this.jobs.find(j => j.job_id === cv.job_id);
        return job && job.role_category === category;
      });
    }

    if (level) {
      filtered = filtered.filter(cv => {
        const job = this.jobs.find(j => j.job_id === cv.job_id);
        return job && job.career_level === level;
      });
    }

    filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    return filtered;
  }

  render() {
    while (this.firstChild) this.removeChild(this.firstChild);
    const categories = [...new Set(this.jobs.map(j => j.role_category).filter(Boolean))].sort();
    const levels = [...new Set(this.jobs.map(j => j.career_level).filter(Boolean))].sort();

    const controls = el('div', { className: 'browse-controls' }, [
      el('input', {
        className: 'browse-search',
        type: 'text',
        placeholder: 'Search jobs...',
        onInput: (e) => { this.filters.search = e.target.value; this.renderGrid(); }
      }),
      this.makeSelect('All Categories', categories, (v) => { this.filters.category = v; this.renderGrid(); }),
      this.makeSelect('All Levels', levels, (v) => { this.filters.level = v; this.renderGrid(); }),
      el('span', { className: 'browse-count', id: 'browse-count' })
    ]);
    this.appendChild(controls);

    const grid = el('div', { className: 'job-grid', id: 'job-grid' });
    this.appendChild(grid);
    this.renderGrid();
  }

  makeSelect(placeholder, options, onChange) {
    const select = el('select', { className: 'browse-select', onChange: (e) => onChange(e.target.value) });
    select.appendChild(el('option', { value: '', textContent: placeholder }));
    for (const opt of options) {
      select.appendChild(el('option', { value: opt, textContent: opt }));
    }
    return select;
  }

  renderGrid() {
    const grid = this.querySelector('#job-grid');
    const countEl = this.querySelector('#browse-count');
    if (!grid) return;

    while (grid.firstChild) grid.removeChild(grid.firstChild);
    const filtered = this.getFilteredCVs();
    if (countEl) countEl.textContent = `${filtered.length} of ${this.cvs.length} jobs`;

    for (const cv of filtered) {
      const job = this.jobs.find(j => j.job_id === cv.job_id);
      grid.appendChild(this.makeCard(cv, job));
    }
  }

  makeCard(cv, job) {
    const atsScore = cv.ats_score || 0;
    const keywords = (cv.ats_keywords || []).slice(0, 5).join(', ');
    const tags = [];
    if (job && job.role_category) tags.push(el('span', { className: 'tag tag-category', textContent: job.role_category }));
    if (job && job.career_level) tags.push(el('span', { className: 'tag tag-level', textContent: job.career_level }));
    if (atsScore > 0) tags.push(el('span', { className: 'tag tag-ats', textContent: `ATS ${atsScore}%` }));

    const cardChildren = [
      el('div', { className: 'job-card-header' }, [
        el('div', { className: `job-card-score ${scoreClass(cv.match_score || 0)}`, textContent: String(cv.match_score || 0) }),
        el('div', { className: 'job-card-info' }, [
          el('div', { className: 'job-card-title', textContent: cv.job_title }),
          el('div', { className: 'job-card-company', textContent: cv.company })
        ])
      ]),
      el('div', { className: 'job-card-tags' }, tags)
    ];
    if (keywords) {
      cardChildren.push(el('div', { className: 'job-card-keywords', textContent: keywords }));
    }

    return el('div', {
      className: 'job-card',
      onClick: () => { if (this.onJobSelect) this.onJobSelect(cv.job_id); }
    }, cardChildren);
  }
}

customElements.define('tab-browse', TabBrowse);
