// Compare Tab — side-by-side job comparison
import { scoreJob, loadPrefs, parseNum } from './score-engine.js';

export class TabCompare extends HTMLElement {
  constructor() { super(); this.jobs = []; this.compareIds = new Set(); }

  setData(jobs) { this.jobs = jobs; }

  setCompareIds(ids) {
    this.compareIds = ids;
    this.render();
  }

  render() {
    this.replaceChildren();
    this.style.cssText = 'padding:20px;overflow-y:auto;height:100%';

    if (!this.compareIds.size) {
      const msg = document.createElement('div');
      msg.style.cssText = 'text-align:center;padding:60px 20px';
      const t = document.createElement('div');
      t.textContent = 'No jobs selected for comparison';
      t.style.cssText = 'font-size:16px;color:var(--text-dim);margin-bottom:8px';
      const sub = document.createElement('div');
      sub.textContent = 'Go to Jobs tab and check the boxes next to 2-3 jobs';
      sub.style.cssText = 'font-size:13px;color:var(--text-dim)';
      msg.append(t, sub);
      this.appendChild(msg);
      return;
    }

    const prefs = loadPrefs();
    const selected = [...this.compareIds].map(id => {
      const j = this.jobs.find(x => x.job_id === id);
      return j ? { ...j, _score: scoreJob(j, prefs) } : null;
    }).filter(Boolean);

    if (!selected.length) return;

    const cols = selected.length + 1; // label col + job cols
    const table = document.createElement('div');
    table.style.cssText = `display:grid;grid-template-columns:160px repeat(${selected.length},1fr);gap:1px;background:rgba(255,255,255,0.03);border-radius:var(--radius);overflow:hidden`;

    const rows = [
      { label: 'Title', get: j => j.title, type: 'text' },
      { label: 'Company', get: j => j.company, type: 'text' },
      { label: 'Location', get: j => j.location, type: 'text' },
      { label: 'Type / Mode', get: j => (j.employment_type || '') + ' / ' + (j.work_mode || ''), type: 'text' },
      { label: 'Posted', get: j => j.posted, type: 'text' },
      { label: 'Candidates', get: j => j.total_candidates || '0', type: 'num-low' },
      { label: 'Company Size', get: j => j.company_size, type: 'text' },
      { label: 'Followers', get: j => j.company_followers || '0', type: 'num-high' },
      { label: 'Median Tenure', get: j => j.company_median_tenure, type: 'text' },
      { label: 'Easy Apply', get: j => j.easy_apply ? 'Yes' : 'No', type: 'bool' },
      { label: 'Match Score', get: j => j._score, type: 'num-high' },
    ];

    // Header row
    const headerLabel = this._cell('', true);
    table.appendChild(headerLabel);
    selected.forEach(j => {
      const cell = this._cell(j.title, true);
      cell.style.cssText += ';font-size:13px;font-weight:700;color:var(--accent-blue)';
      table.appendChild(cell);
    });

    // Data rows
    rows.forEach(row => {
      const label = this._cell(row.label, false);
      label.style.cssText += ';color:var(--text-dim);font-weight:600;font-size:11px;text-transform:uppercase';
      table.appendChild(label);

      const values = selected.map(j => row.get(j));
      const numVals = values.map(v => parseNum(v));

      selected.forEach((j, i) => {
        const cell = this._cell(String(values[i] ?? '\u2014'), false);

        // Color coding for comparable values
        if (row.type === 'num-low' && numVals.some(n => n > 0)) {
          const min = Math.min(...numVals.filter(n => n > 0));
          if (numVals[i] === min && numVals[i] > 0) cell.style.color = 'var(--accent-green)';
          else if (numVals[i] === Math.max(...numVals)) cell.style.color = 'var(--accent-red)';
        }
        if (row.type === 'num-high' && numVals.some(n => n > 0)) {
          const max = Math.max(...numVals);
          if (numVals[i] === max && numVals[i] > 0) cell.style.color = 'var(--accent-green)';
          else if (numVals[i] === Math.min(...numVals.filter(n => n > 0))) cell.style.color = 'var(--accent-red)';
        }
        if (row.type === 'bool' && values[i] === 'Yes') cell.style.color = 'var(--accent-green)';

        table.appendChild(cell);
      });
    });

    // Seniority bars comparison
    const senLabel = this._cell('SENIORITY', false);
    senLabel.style.cssText += ';color:var(--text-dim);font-weight:600;font-size:11px;text-transform:uppercase';
    table.appendChild(senLabel);
    selected.forEach(j => {
      const cell = this._cell('', false);
      const sen = j.candidate_seniority || {};
      Object.entries(sen).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:10px;margin-bottom:2px';
        const lbl = document.createElement('span');
        lbl.textContent = k.replace(' level', '');
        lbl.style.cssText = 'width:50px;color:var(--text-dim)';
        const bar = document.createElement('div');
        bar.style.cssText = `width:${v}%;height:8px;background:var(--accent-purple);border-radius:2px;max-width:80px`;
        const pct = document.createElement('span');
        pct.textContent = v + '%';
        pct.style.cssText = 'color:var(--text)';
        row.append(lbl, bar, pct);
        cell.appendChild(row);
      });
      table.appendChild(cell);
    });

    this.appendChild(table);
  }

  _cell(text, isHeader) {
    const cell = document.createElement('div');
    cell.style.cssText = `padding:10px 12px;background:var(--bg-card);font-size:12px;color:var(--text)`;
    if (isHeader) cell.style.fontWeight = '700';
    if (text) cell.textContent = text;
    return cell;
  }
}

customElements.define('tab-compare', TabCompare);
