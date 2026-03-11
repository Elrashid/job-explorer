// Jobs Tab — list + detail with match scores and filters
import { scoreJob, loadPrefs, scoreBadgeClass, competitionHeat, parseNum } from './score-engine.js';

export class TabJobs extends HTMLElement {
  constructor() {
    super();
    this.jobs = [];
    this.filtered = [];
    this.selected = null;
    this.focusIdx = -1;
    this.compareSet = new Set();
  }

  setData(jobs) {
    this.jobs = jobs;
    this._buildUI();
    this.applyFilters();
  }

  getCompareSet() { return this.compareSet; }

  selectById(id) {
    this.selected = id;
    this._renderList();
    this._renderDetail();
  }

  _buildUI() {
    this.replaceChildren();
    this.style.cssText = 'display:flex;height:100%';

    // Left panel
    const left = document.createElement('div');
    left.style.cssText = 'width:400px;min-width:320px;display:flex;flex-direction:column;border-right:1px solid var(--border)';

    // Filters
    const filters = document.createElement('div');
    filters.style.cssText = 'padding:10px 14px;display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--border);background:var(--bg-card)';

    this._search = this._makeInput('Search...', '160px');
    this._search.addEventListener('input', () => this.applyFilters());

    this._filterType = this._makeSelect('All Types', [...new Set(this.jobs.map(j => j.employment_type).filter(Boolean))]);
    this._filterMode = this._makeSelect('All Modes', [...new Set(this.jobs.map(j => j.work_mode).filter(Boolean))]);
    this._filterIndustry = this._makeSelect('All Industries', [...new Set(this.jobs.map(j => j.company_industry).filter(Boolean))].sort());

    this._sortBy = this._makeSelect(null, [
      { v: 'score', t: 'Best Match' }, { v: 'posted', t: 'Newest' },
      { v: 'title', t: 'Title A-Z' }, { v: 'candidates', t: 'Most Candidates' },
    ]);

    [this._filterType, this._filterMode, this._filterIndustry, this._sortBy].forEach(s =>
      s.addEventListener('change', () => this.applyFilters())
    );

    filters.append(this._search, this._filterType, this._filterMode, this._filterIndustry, this._sortBy);
    left.appendChild(filters);

    this._listEl = document.createElement('div');
    this._listEl.style.cssText = 'flex:1;overflow-y:auto';
    left.appendChild(this._listEl);

    // Right panel
    this._detailEl = document.createElement('div');
    this._detailEl.style.cssText = 'flex:1;overflow-y:auto;padding:20px';

    this.append(left, this._detailEl);
  }

  _makeInput(placeholder, width) {
    const el = document.createElement('input');
    el.type = 'text';
    el.placeholder = placeholder;
    el.style.cssText = `background:var(--bg-deep);border:1px solid var(--border);color:var(--text);padding:5px 10px;border-radius:var(--radius-sm);font-size:12px;width:${width}`;
    return el;
  }

  _makeSelect(defaultText, options) {
    const sel = document.createElement('select');
    sel.style.cssText = 'background:var(--bg-deep);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:var(--radius-sm);font-size:12px;cursor:pointer';
    if (defaultText) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = defaultText;
      sel.appendChild(opt);
    }
    options.forEach(o => {
      const opt = document.createElement('option');
      if (typeof o === 'string') { opt.value = o; opt.textContent = o; }
      else { opt.value = o.v; opt.textContent = o.t; }
      sel.appendChild(opt);
    });
    return sel;
  }

  applyFilters() {
    const q = this._search.value.toLowerCase();
    const type = this._filterType.value;
    const mode = this._filterMode.value;
    const ind = this._filterIndustry.value;
    const sort = this._sortBy.value;
    const prefs = loadPrefs();

    this.filtered = this.jobs.filter(j => {
      if (q && !(j.title + j.company + j.location + j.description).toLowerCase().includes(q)) return false;
      if (type && j.employment_type !== type) return false;
      if (mode && j.work_mode !== mode) return false;
      if (ind && j.company_industry !== ind) return false;
      return true;
    }).map(j => ({ ...j, _score: scoreJob(j, prefs) }));

    if (sort === 'score') this.filtered.sort((a, b) => b._score - a._score);
    else if (sort === 'posted') this.filtered.sort((a, b) => this._parsePosted(a.posted) - this._parsePosted(b.posted));
    else if (sort === 'title') this.filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'candidates') this.filtered.sort((a, b) => parseNum(b.total_candidates) - parseNum(a.total_candidates));

    this._renderList();
    if (this.selected) this._renderDetail();
  }

  setFilterIndustry(ind) {
    this._filterIndustry.value = ind;
    this.applyFilters();
  }

  _parsePosted(s) {
    if (!s) return 9999;
    const m = s.match(/(\d+)\s+(hour|minute|day|week|month)/i);
    if (!m) return 9999;
    const n = parseInt(m[1]), u = m[2].toLowerCase();
    if (u === 'minute') return n / 60;
    if (u === 'hour') return n / 24;
    if (u === 'day') return n;
    if (u === 'week') return n * 7;
    return n * 30;
  }

  _renderList() {
    const list = this._listEl;
    list.replaceChildren();
    if (!this.filtered.length) {
      const empty = document.createElement('div');
      empty.textContent = 'No jobs match filters';
      empty.style.cssText = 'padding:40px;text-align:center;color:var(--text-dim)';
      list.appendChild(empty);
      return;
    }
    this.filtered.forEach((j, idx) => {
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:var(--transition)';
      if (this.selected === j.job_id) {
        card.style.background = 'var(--bg-surface)';
        card.style.borderLeft = '3px solid var(--accent-purple)';
      }
      card.addEventListener('click', () => { this.selected = j.job_id; this.focusIdx = idx; this._renderList(); this._renderDetail(); });

      // Compare checkbox
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = this.compareSet.has(j.job_id);
      cb.title = 'Add to compare';
      cb.style.cssText = 'accent-color:var(--accent-purple);cursor:pointer;flex-shrink:0';
      cb.addEventListener('click', e => { e.stopPropagation(); this._toggleCompare(j.job_id); });

      // Score badge
      const badge = document.createElement('div');
      badge.className = 'score-badge score-badge-sm ' + scoreBadgeClass(j._score);
      badge.textContent = j._score;

      // Info
      const info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0';
      const title = document.createElement('div');
      title.textContent = j.title;
      title.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-bright);white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      const sub = document.createElement('div');
      sub.style.cssText = 'font-size:11px;color:var(--text-dim);display:flex;gap:8px;flex-wrap:wrap';
      const company = document.createElement('span');
      company.textContent = j.company;
      company.style.color = 'var(--accent-blue)';
      const loc = document.createElement('span');
      loc.textContent = j.location;
      const posted = document.createElement('span');
      posted.textContent = j.posted;
      sub.append(company, loc, posted);
      if (j.easy_apply) {
        const ea = document.createElement('span');
        ea.textContent = 'Easy Apply';
        ea.style.color = 'var(--accent-green)';
        sub.appendChild(ea);
      }
      info.append(title, sub);

      // Heat
      const heat = document.createElement('div');
      heat.textContent = parseNum(j.total_candidates).toLocaleString();
      heat.className = 'heat-' + competitionHeat(j);
      heat.style.cssText = 'font-size:11px;font-weight:600;flex-shrink:0;width:44px;text-align:right';

      card.append(cb, badge, info, heat);
      list.appendChild(card);
    });
  }

  _toggleCompare(id) {
    if (this.compareSet.has(id)) this.compareSet.delete(id);
    else if (this.compareSet.size < 3) this.compareSet.add(id);
    this._renderList();
    this.dispatchEvent(new CustomEvent('compare-changed', { bubbles: true }));
  }

  toggleCompareFocused() {
    if (this.focusIdx >= 0 && this.focusIdx < this.filtered.length) {
      this._toggleCompare(this.filtered[this.focusIdx].job_id);
    }
  }

  navigateList(dir) {
    if (!this.filtered.length) return;
    this.focusIdx = Math.max(0, Math.min(this.filtered.length - 1, this.focusIdx + dir));
    this.selected = this.filtered[this.focusIdx].job_id;
    this._renderList();
    this._renderDetail();
    const cards = this._listEl.children;
    if (cards[this.focusIdx]) cards[this.focusIdx].scrollIntoView({ block: 'nearest' });
  }

  _renderDetail() {
    const d = this._detailEl;
    d.replaceChildren();
    const prefs = loadPrefs();
    const j = this.jobs.find(x => x.job_id === this.selected);
    if (!j) {
      const msg = document.createElement('div');
      msg.textContent = 'Select a job';
      msg.style.cssText = 'padding:40px;text-align:center;color:var(--text-dim)';
      d.appendChild(msg);
      return;
    }
    const score = scoreJob(j, prefs);

    // Header
    const h2 = document.createElement('h2');
    h2.textContent = j.title;
    h2.style.cssText = 'font-size:20px;color:var(--text-bright);margin-bottom:4px';
    const comp = document.createElement('div');
    comp.textContent = j.company;
    comp.style.cssText = 'font-size:15px;color:var(--accent-blue);margin-bottom:12px';
    d.append(h2, comp);

    // Badges
    const badges = document.createElement('div');
    badges.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px';
    const addBadge = (text, bg, color) => {
      const b = document.createElement('span');
      b.textContent = text;
      b.style.cssText = `padding:3px 10px;border-radius:20px;font-size:12px;font-weight:500;background:${bg};color:${color}`;
      badges.appendChild(b);
    };
    if (j.employment_type) addBadge(j.employment_type, '#164e63', '#67e8f9');
    if (j.work_mode) addBadge(j.work_mode, '#1e3a5f', '#93c5fd');
    if (j.easy_apply) addBadge('Easy Apply', '#14532d', '#86efac');
    if (j.promoted) addBadge('Promoted', '#713f12', '#fde047');
    addBadge('Score: ' + score, 'var(--grad-1)', 'white');
    d.appendChild(badges);

    // Info grid
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px';
    const addBox = (label, value) => {
      const box = document.createElement('div');
      box.className = 'card';
      box.style.cssText = 'padding:10px 12px';
      const l = document.createElement('div');
      l.textContent = label;
      l.style.cssText = 'font-size:10px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px';
      const v = document.createElement('div');
      v.textContent = value || '\u2014';
      v.style.cssText = 'font-size:13px;color:var(--text)';
      box.append(l, v);
      grid.appendChild(box);
    };
    addBox('Location', j.location);
    addBox('Posted', j.posted);
    addBox('Applicants', j.applicants);
    addBox('Total Candidates', j.total_candidates);
    addBox('Salary', j.salary);
    addBox('Seniority', j.seniority);
    d.appendChild(grid);

    // Candidate seniority bars
    const senColors = { 'Senior level': '#3b82f6', 'Entry level': '#22c55e', 'Director level': '#f59e0b', 'Manager level': '#a855f7' };
    const sen = j.candidate_seniority || {};
    if (Object.keys(sen).length) {
      d.appendChild(this._makeSection('Candidate Seniority', Object.entries(sen).sort((a, b) => b[1] - a[1]), senColors));
    }

    // Education bars
    const eduColors = ['#06b6d4', '#8b5cf6', '#f43f5e', '#eab308', '#10b981'];
    const edu = j.candidate_education || {};
    if (Object.keys(edu).length) {
      const colorMap = {};
      Object.keys(edu).forEach((k, i) => { colorMap[k.replace(' (Similar to you)', '')] = eduColors[i % eduColors.length]; });
      const entries = Object.entries(edu).map(([k, v]) => [k.replace(' (Similar to you)', ''), v]).sort((a, b) => b[1] - a[1]);
      d.appendChild(this._makeSection('Candidate Education', entries, colorMap));
    }

    // Company info
    const csec = document.createElement('div');
    csec.style.cssText = 'margin-bottom:16px';
    const ct = document.createElement('div');
    ct.textContent = 'COMPANY';
    ct.style.cssText = 'font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;border-bottom:1px solid var(--border);padding-bottom:4px';
    csec.appendChild(ct);
    const cgrid = document.createElement('div');
    cgrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px';
    const addCBox = (label, value) => {
      const box = document.createElement('div');
      box.className = 'card';
      box.style.cssText = 'padding:10px 12px';
      const l = document.createElement('div');
      l.textContent = label;
      l.style.cssText = 'font-size:10px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px';
      const v = document.createElement('div');
      v.textContent = value || '\u2014';
      v.style.cssText = 'font-size:13px;color:var(--text)';
      box.append(l, v);
      cgrid.appendChild(box);
    };
    addCBox('Industry', j.company_industry);
    addCBox('Size', j.company_size);
    addCBox('Followers', j.company_followers);
    addCBox('Median Tenure', j.company_median_tenure);
    csec.appendChild(cgrid);
    d.appendChild(csec);

    // Description
    if (j.description) {
      const sec = document.createElement('div');
      sec.style.cssText = 'margin-bottom:16px';
      const t = document.createElement('div');
      t.textContent = 'JOB DESCRIPTION';
      t.style.cssText = 'font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;border-bottom:1px solid var(--border);padding-bottom:4px';
      const box = document.createElement('div');
      box.textContent = j.description;
      box.style.cssText = 'background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;white-space:pre-wrap;font-size:12px;color:var(--text-dim);line-height:1.7;max-height:400px;overflow-y:auto';
      sec.append(t, box);
      d.appendChild(sec);
    }

    // Link
    const link = document.createElement('a');
    link.href = j.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open on LinkedIn';
    link.style.cssText = 'display:inline-block;padding:8px 16px;background:var(--grad-1);color:white;text-decoration:none;border-radius:var(--radius);font-size:13px;font-weight:600';
    d.appendChild(link);
  }

  _makeSection(title, entries, colorMap) {
    const sec = document.createElement('div');
    sec.style.cssText = 'margin-bottom:16px';
    const t = document.createElement('div');
    t.textContent = title.toUpperCase();
    t.style.cssText = 'font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;border-bottom:1px solid var(--border);padding-bottom:4px';
    sec.appendChild(t);
    entries.forEach(([label, pct]) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:12px';
      const lbl = document.createElement('div');
      lbl.textContent = label;
      lbl.style.cssText = 'width:110px;text-align:right;color:var(--text-dim);flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      const track = document.createElement('div');
      track.style.cssText = 'flex:1;height:14px;background:var(--bg-deep);border-radius:4px;overflow:hidden';
      const fill = document.createElement('div');
      fill.style.cssText = `height:100%;width:${pct}%;background:${colorMap[label] || '#64748b'};border-radius:4px`;
      track.appendChild(fill);
      const num = document.createElement('div');
      num.textContent = pct + '%';
      num.style.cssText = 'width:32px;text-align:right;color:var(--text)';
      row.append(lbl, track, num);
      sec.appendChild(row);
    });
    return sec;
  }
}

customElements.define('tab-jobs', TabJobs);
