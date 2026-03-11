// Dashboard Tab — stat cards, charts, leaderboard
import { scoreJob, loadPrefs, scoreBadgeClass, extractAllCities, parseNum } from './score-engine.js';

export class TabDashboard extends HTMLElement {
  constructor() {
    super();
    this.jobs = [];
  }

  setData(jobs) {
    this.jobs = jobs;
    this.render();
  }

  render() {
    const jobs = this.jobs;
    if (!jobs.length) return;

    const prefs = loadPrefs();
    const total = jobs.length;
    const fullTime = jobs.filter(j => j.employment_type === 'Full-time').length;
    const easyApply = jobs.filter(j => j.easy_apply).length;
    const hybrid = jobs.filter(j => j.work_mode === 'Hybrid' || j.work_mode === 'Remote').length;
    const avgCandidates = Math.round(jobs.reduce((s, j) => s + parseNum(j.total_candidates), 0) / total);

    // Industry breakdown
    const industries = {};
    jobs.forEach(j => { const k = j.company_industry || 'Other'; industries[k] = (industries[k] || 0) + 1; });
    const indEntries = Object.entries(industries).sort((a, b) => b[1] - a[1]);

    // Location breakdown
    const cities = extractAllCities(jobs);
    const cityEntries = [...cities.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    // Top companies by followers
    const compMap = new Map();
    jobs.forEach(j => {
      if (j.company && !compMap.has(j.company)) compMap.set(j.company, parseNum(j.company_followers));
    });
    const topCompanies = [...compMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxFollowers = topCompanies[0]?.[1] || 1;

    // Top 5 by score
    const scored = jobs.map(j => ({ ...j, _score: scoreJob(j, prefs) }))
      .sort((a, b) => b._score - a._score).slice(0, 5);

    // Donut chart colors
    const donutColors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#64748b'];
    let donutOffset = 0;
    const donutSegments = indEntries.map(([, count], i) => {
      const pct = (count / total) * 100;
      const seg = { offset: donutOffset, pct, color: donutColors[i % donutColors.length] };
      donutOffset += pct;
      return seg;
    });

    const container = document.createElement('div');
    container.style.cssText = 'padding:20px;max-width:1200px;margin:0 auto';

    // STAT CARDS
    const statsRow = document.createElement('div');
    statsRow.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px';
    const statData = [
      { label: 'Total Jobs', value: total, grad: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' },
      { label: 'Full-time', value: fullTime, grad: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
      { label: 'Easy Apply', value: easyApply, grad: 'linear-gradient(135deg,#06b6d4,#22c55e)' },
      { label: 'Hybrid/Remote', value: hybrid, grad: 'linear-gradient(135deg,#f59e0b,#ec4899)' },
      { label: 'Avg Candidates', value: avgCandidates, grad: 'linear-gradient(135deg,#ef4444,#f59e0b)' },
    ];
    statData.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = 'padding:16px;text-align:center';
      const lbl = document.createElement('div');
      lbl.textContent = s.label;
      lbl.style.cssText = 'font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px';
      const val = document.createElement('div');
      val.textContent = s.value.toLocaleString();
      val.style.cssText = `font-size:28px;font-weight:800;background:${s.grad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text`;
      card.append(lbl, val);
      this._animateCounter(val, s.value);
      statsRow.appendChild(card);
    });
    container.appendChild(statsRow);

    // CHARTS ROW
    const chartsRow = document.createElement('div');
    chartsRow.style.cssText = 'display:grid;grid-template-columns:280px 1fr 1fr;gap:16px;margin-bottom:24px';

    // Donut chart
    const donutCard = document.createElement('div');
    donutCard.className = 'card';
    donutCard.style.cssText = 'padding:16px';
    const donutTitle = document.createElement('div');
    donutTitle.textContent = 'By Industry';
    donutTitle.style.cssText = 'font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px';
    donutCard.appendChild(donutTitle);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.style.cssText = 'width:140px;height:140px;display:block;margin:0 auto 12px';
    donutSegments.forEach(seg => {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', '100');
      circle.setAttribute('cy', '100');
      circle.setAttribute('r', '80');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', seg.color);
      circle.setAttribute('stroke-width', '30');
      circle.setAttribute('stroke-dasharray', `${seg.pct * 5.027} ${502.7 - seg.pct * 5.027}`);
      circle.setAttribute('stroke-dashoffset', `${-seg.offset * 5.027}`);
      circle.style.cursor = 'pointer';
      circle.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('filter-industry', { detail: indEntries[donutSegments.indexOf(seg)][0], bubbles: true }));
      });
      svg.appendChild(circle);
    });
    donutCard.appendChild(svg);

    // Legend
    indEntries.forEach(([name, count], i) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12px;padding:2px 0;cursor:pointer';
      row.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('filter-industry', { detail: name, bubbles: true }));
      });
      const dot = document.createElement('div');
      dot.style.cssText = `width:8px;height:8px;border-radius:50%;background:${donutColors[i % donutColors.length]};flex-shrink:0`;
      const label = document.createElement('span');
      label.textContent = name;
      label.style.cssText = 'flex:1;color:var(--text-dim)';
      const num = document.createElement('span');
      num.textContent = count;
      num.style.cssText = 'color:var(--text)';
      row.append(dot, label, num);
      donutCard.appendChild(row);
    });
    chartsRow.appendChild(donutCard);

    // Bar chart — locations
    const locCard = document.createElement('div');
    locCard.className = 'card';
    locCard.style.cssText = 'padding:16px';
    const locTitle = document.createElement('div');
    locTitle.textContent = 'By Location';
    locTitle.style.cssText = 'font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px';
    locCard.appendChild(locTitle);
    const maxCity = cityEntries[0]?.[1] || 1;
    cityEntries.forEach(([city, count]) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px';
      const lbl = document.createElement('div');
      lbl.textContent = city;
      lbl.style.cssText = 'width:90px;text-align:right;color:var(--text-dim);flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      const track = document.createElement('div');
      track.style.cssText = 'flex:1;height:16px;background:var(--bg-deep);border-radius:4px;overflow:hidden';
      const fill = document.createElement('div');
      fill.style.cssText = `height:100%;width:${(count/maxCity)*100}%;background:var(--grad-1);border-radius:4px;transition:width 0.6s ease`;
      track.appendChild(fill);
      const num = document.createElement('div');
      num.textContent = count;
      num.style.cssText = 'width:24px;text-align:right;color:var(--text)';
      row.append(lbl, track, num);
      locCard.appendChild(row);
    });
    chartsRow.appendChild(locCard);

    // Horizontal bars — companies
    const compCard = document.createElement('div');
    compCard.className = 'card';
    compCard.style.cssText = 'padding:16px';
    const compTitle = document.createElement('div');
    compTitle.textContent = 'Top Companies (followers)';
    compTitle.style.cssText = 'font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px';
    compCard.appendChild(compTitle);
    topCompanies.forEach(([name, followers]) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px';
      const lbl = document.createElement('div');
      lbl.textContent = name;
      lbl.style.cssText = 'width:100px;text-align:right;color:var(--text-dim);flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      const track = document.createElement('div');
      track.style.cssText = 'flex:1;height:16px;background:var(--bg-deep);border-radius:4px;overflow:hidden';
      const fill = document.createElement('div');
      fill.style.cssText = `height:100%;width:${(followers/maxFollowers)*100}%;background:var(--grad-2);border-radius:4px;transition:width 0.6s ease`;
      track.appendChild(fill);
      const num = document.createElement('div');
      num.textContent = (followers / 1000).toFixed(0) + 'k';
      num.style.cssText = 'width:36px;text-align:right;color:var(--text)';
      row.append(lbl, track, num);
      compCard.appendChild(row);
    });
    chartsRow.appendChild(compCard);
    container.appendChild(chartsRow);

    // LEADERBOARD
    const lbCard = document.createElement('div');
    lbCard.className = 'card';
    lbCard.style.cssText = 'padding:16px';
    const lbTitle = document.createElement('div');
    lbTitle.textContent = 'Top Match Scores';
    lbTitle.style.cssText = 'font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px';
    lbCard.appendChild(lbTitle);
    scored.forEach((j, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer';
      row.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('select-job', { detail: j.job_id, bubbles: true }));
      });
      const rank = document.createElement('div');
      rank.textContent = '#' + (i + 1);
      rank.style.cssText = 'font-size:14px;font-weight:700;width:30px;color:var(--text-dim)';
      const badge = document.createElement('div');
      badge.className = 'score-badge ' + scoreBadgeClass(j._score);
      badge.textContent = j._score;
      const info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0';
      const title = document.createElement('div');
      title.textContent = j.title;
      title.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-bright);white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      const sub = document.createElement('div');
      sub.textContent = j.company + ' \u2022 ' + j.location;
      sub.style.cssText = 'font-size:11px;color:var(--text-dim)';
      info.append(title, sub);
      const meter = document.createElement('div');
      meter.style.cssText = 'width:100px;height:6px;background:var(--bg-deep);border-radius:3px;overflow:hidden;flex-shrink:0';
      const fill = document.createElement('div');
      const grad = j._score >= 70 ? 'var(--grad-3)' : j._score >= 40 ? 'var(--grad-1)' : 'linear-gradient(135deg,var(--accent-amber),var(--accent-red))';
      fill.style.cssText = `height:100%;width:${j._score}%;background:${grad};border-radius:3px`;
      meter.appendChild(fill);
      row.append(rank, badge, info, meter);
      lbCard.appendChild(row);
    });
    container.appendChild(lbCard);

    this.replaceChildren(container);
  }

  _animateCounter(el, target) {
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = current.toLocaleString();
    }, 30);
  }
}

customElements.define('tab-dashboard', TabDashboard);
