// Kanban Board Tab — drag and drop with localStorage persistence
import { scoreJob, loadPrefs, scoreBadgeClass } from './score-engine.js';

const BOARD_KEY = 'job-explorer-board';
const COLUMNS = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

export class TabBoard extends HTMLElement {
  constructor() { super(); this.jobs = []; this.boardState = {}; }

  setData(jobs) {
    this.jobs = jobs;
    this._loadState();
    this.render();
  }

  _loadState() {
    try {
      const saved = localStorage.getItem(BOARD_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      this.boardState = (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) ? parsed : {};
    } catch { this.boardState = {}; }
    // Put any new jobs in Saved
    this.jobs.forEach(j => {
      if (!this.boardState[j.job_id]) this.boardState[j.job_id] = 'Saved';
    });
    this._saveState();
  }

  _saveState() {
    localStorage.setItem(BOARD_KEY, JSON.stringify(this.boardState));
  }

  render() {
    this.replaceChildren();
    this.style.cssText = 'display:flex;gap:12px;padding:16px;height:100%;overflow-x:auto';

    const prefs = loadPrefs();
    const scored = new Map();
    this.jobs.forEach(j => scored.set(j.job_id, scoreJob(j, prefs)));

    COLUMNS.forEach(col => {
      const colJobs = this.jobs.filter(j => this.boardState[j.job_id] === col);

      const column = document.createElement('div');
      column.style.cssText = 'flex:1;min-width:200px;display:flex;flex-direction:column;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden';

      // Header
      const header = document.createElement('div');
      header.style.cssText = 'padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between';
      const title = document.createElement('span');
      title.textContent = col;
      title.style.cssText = 'font-size:13px;font-weight:700;color:var(--text-bright)';
      const count = document.createElement('span');
      count.textContent = colJobs.length;
      count.style.cssText = 'font-size:11px;background:var(--bg-surface);border:1px solid var(--border);padding:1px 8px;border-radius:10px;color:var(--text-dim)';
      header.append(title, count);
      column.appendChild(header);

      // Drop zone
      const zone = document.createElement('div');
      zone.style.cssText = 'flex:1;overflow-y:auto;padding:8px;min-height:60px';
      zone.dataset.column = col;

      zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.style.background = 'rgba(139,92,246,0.1)';
      });
      zone.addEventListener('dragleave', () => {
        zone.style.background = '';
      });
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.style.background = '';
        const jobId = e.dataTransfer.getData('text/plain');
        if (jobId && this.jobs.some(j => j.job_id === jobId)) {
          this.boardState[jobId] = col;
          this._saveState();
          this.render();
        }
      });

      // Cards
      colJobs.forEach(j => {
        const score = scored.get(j.job_id) || 50;
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.style.cssText = 'padding:10px;margin-bottom:6px;cursor:grab;display:flex;align-items:flex-start;gap:8px';

        card.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', j.job_id);
          card.style.opacity = '0.5';
        });
        card.addEventListener('dragend', () => { card.style.opacity = '1'; });

        const badge = document.createElement('div');
        badge.className = 'score-badge score-badge-sm ' + scoreBadgeClass(score);
        badge.textContent = score;

        const info = document.createElement('div');
        info.style.cssText = 'min-width:0;flex:1';
        const t = document.createElement('div');
        t.textContent = j.title;
        t.style.cssText = 'font-size:12px;font-weight:600;color:var(--text-bright);white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
        const s = document.createElement('div');
        s.textContent = j.company;
        s.style.cssText = 'font-size:11px;color:var(--accent-blue)';
        info.append(t, s);

        card.append(badge, info);
        zone.appendChild(card);
      });

      column.appendChild(zone);
      this.appendChild(column);
    });
  }
}

customElements.define('tab-board', TabBoard);
