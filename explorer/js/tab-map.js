// Map Tab — SVG map of MENA region with job markers
import { extractCity } from './score-engine.js';

// Approximate positions on a 800x500 SVG canvas (wider for MENA)
const CITY_COORDS = {
  'Dubai':           { x: 570, y: 240 },
  'Abu Dhabi':       { x: 520, y: 270 },
  'Abu Dhabi Emirate': { x: 510, y: 280 },
  'Sharjah':         { x: 580, y: 225 },
  'Ajman':           { x: 585, y: 215 },
  'Ras Al Khaimah':  { x: 590, y: 185 },
  'Ras al-Khaimah':  { x: 590, y: 185 },
  'Fujairah':        { x: 610, y: 220 },
  'Al Ain':          { x: 555, y: 300 },
  'Al Dhafra':       { x: 490, y: 290 },
  'New Cairo':       { x: 130, y: 200 },
  'Cairo':           { x: 125, y: 195 },
  'Doha':            { x: 460, y: 235 },
  'Riyadh':          { x: 370, y: 200 },
  'Jeddah':          { x: 260, y: 260 },
  'Muscat':          { x: 650, y: 250 },
  'Manama':          { x: 450, y: 210 },
  'Kuwait City':     { x: 420, y: 150 },
};

export class TabMap extends HTMLElement {
  constructor() { super(); this.jobs = []; this.selectedCity = null; }

  setData(jobs) { this.jobs = jobs; this.render(); }

  render() {
    this.replaceChildren();
    this.style.cssText = 'padding:20px;height:100%;overflow-y:auto';

    // Count jobs by city
    const cityJobs = new Map();
    this.jobs.forEach(j => {
      const city = extractCity(j.location);
      if (city && city !== 'United Arab Emirates') {
        if (!cityJobs.has(city)) cityJobs.set(city, []);
        cityJobs.get(city).push(j);
      }
    });

    // Also group "no specific city" jobs
    const noCity = this.jobs.filter(j => {
      const c = extractCity(j.location);
      return !c || c === 'United Arab Emirates';
    });

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;gap:20px;flex-wrap:wrap';

    // SVG Map
    const mapCard = document.createElement('div');
    mapCard.className = 'card';
    mapCard.style.cssText = 'padding:20px;flex:1;min-width:400px';

    const title = document.createElement('div');
    title.textContent = 'JOB LOCATIONS';
    title.style.cssText = 'font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px';
    mapCard.appendChild(title);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.cssText = 'width:100%;max-width:740px;height:auto';

    // Background
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('width', '800');
    bg.setAttribute('height', '500');
    bg.setAttribute('fill', '#0a0e1a');
    bg.setAttribute('rx', '8');
    svg.appendChild(bg);

    // Country outlines (simplified)
    const countries = [
      { name: 'Egypt', points: '80,130 170,130 180,165 160,210 140,270 100,270 80,210', fill: 'rgba(14,165,233,0.12)', stroke: 'rgba(14,165,233,0.3)', lx: 105, ly: 285 },
      { name: 'Saudi Arabia', points: '220,140 320,120 400,150 430,190 420,250 370,300 300,310 250,280 220,240', fill: 'rgba(236,72,153,0.1)', stroke: 'rgba(236,72,153,0.25)', lx: 300, ly: 325 },
      { name: 'Qatar', points: '445,215 465,215 465,250 455,260 445,250', fill: 'rgba(245,158,11,0.12)', stroke: 'rgba(245,158,11,0.3)', lx: 445, ly: 272 },
      { name: 'UAE', points: '480,300 500,270 520,250 550,230 580,200 610,190 640,205 630,240 600,270 570,295 540,310 510,315', fill: 'rgba(139,92,246,0.15)', stroke: 'rgba(139,92,246,0.4)', lx: 550, ly: 330 },
    ];
    countries.forEach(c => {
      const poly = document.createElementNS(svgNS, 'polygon');
      poly.setAttribute('points', c.points);
      poly.setAttribute('fill', c.fill);
      poly.setAttribute('stroke', c.stroke);
      poly.setAttribute('stroke-width', '1.5');
      svg.appendChild(poly);
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', c.lx);
      label.setAttribute('y', c.ly);
      label.setAttribute('fill', c.stroke.replace('0.25', '0.5').replace('0.3', '0.5').replace('0.4', '0.5'));
      label.setAttribute('font-size', '12');
      label.setAttribute('font-weight', '600');
      label.textContent = c.name;
      svg.appendChild(label);
    });

    // City markers
    const maxCount = Math.max(...[...cityJobs.values()].map(arr => arr.length), 1);

    cityJobs.forEach((jobs, city) => {
      const coords = this._findCoords(city);
      if (!coords) return;

      const r = 8 + (jobs.length / maxCount) * 16;
      const isSelected = this.selectedCity === city;

      // Glow
      const glow = document.createElementNS(svgNS, 'circle');
      glow.setAttribute('cx', coords.x);
      glow.setAttribute('cy', coords.y);
      glow.setAttribute('r', r + 6);
      glow.setAttribute('fill', isSelected ? 'rgba(236,72,153,0.3)' : 'rgba(139,92,246,0.2)');
      svg.appendChild(glow);

      // Circle
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', coords.x);
      circle.setAttribute('cy', coords.y);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', isSelected ? 'url(#grad-pink)' : 'url(#grad-purple)');
      circle.setAttribute('stroke', isSelected ? '#ec4899' : '#8b5cf6');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      circle.addEventListener('click', () => {
        this.selectedCity = this.selectedCity === city ? null : city;
        this.render();
      });
      svg.appendChild(circle);

      // Count label
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', coords.x);
      text.setAttribute('y', coords.y + 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', '700');
      text.textContent = jobs.length;
      text.style.pointerEvents = 'none';
      svg.appendChild(text);

      // City name
      const name = document.createElementNS(svgNS, 'text');
      name.setAttribute('x', coords.x);
      name.setAttribute('y', coords.y + r + 14);
      name.setAttribute('text-anchor', 'middle');
      name.setAttribute('fill', 'var(--text-dim)');
      name.setAttribute('font-size', '10');
      name.textContent = city;
      svg.appendChild(name);
    });

    // Gradients
    const defs = document.createElementNS(svgNS, 'defs');
    const gradP = document.createElementNS(svgNS, 'radialGradient');
    gradP.id = 'grad-purple';
    const s1 = document.createElementNS(svgNS, 'stop');
    s1.setAttribute('offset', '0%');
    s1.setAttribute('stop-color', '#8b5cf6');
    const s2 = document.createElementNS(svgNS, 'stop');
    s2.setAttribute('offset', '100%');
    s2.setAttribute('stop-color', '#6d28d9');
    gradP.append(s1, s2);

    const gradK = document.createElementNS(svgNS, 'radialGradient');
    gradK.id = 'grad-pink';
    const s3 = document.createElementNS(svgNS, 'stop');
    s3.setAttribute('offset', '0%');
    s3.setAttribute('stop-color', '#ec4899');
    const s4 = document.createElementNS(svgNS, 'stop');
    s4.setAttribute('offset', '100%');
    s4.setAttribute('stop-color', '#be185d');
    gradK.append(s3, s4);

    defs.append(gradP, gradK);
    svg.insertBefore(defs, svg.firstChild);

    mapCard.appendChild(svg);

    // Legend
    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;margin-top:12px';
    cityJobs.forEach((jobs, city) => {
      const item = document.createElement('div');
      item.style.cssText = `display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;padding:3px 8px;border-radius:12px;border:1px solid ${this.selectedCity === city ? 'var(--accent-pink)' : 'var(--border)'};color:${this.selectedCity === city ? 'var(--accent-pink)' : 'var(--text-dim)'}`;
      item.addEventListener('click', () => { this.selectedCity = this.selectedCity === city ? null : city; this.render(); });
      const dot = document.createElement('div');
      dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:var(--accent-purple)';
      const lbl = document.createElement('span');
      lbl.textContent = city + ' (' + jobs.length + ')';
      item.append(dot, lbl);
      legend.appendChild(item);
    });
    if (noCity.length) {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text-dim);padding:3px 8px';
      item.textContent = 'UAE (general): ' + noCity.length;
      legend.appendChild(item);
    }
    mapCard.appendChild(legend);
    wrapper.appendChild(mapCard);

    // Job list for selected city
    const listCard = document.createElement('div');
    listCard.className = 'card';
    listCard.style.cssText = 'padding:16px;width:300px;flex-shrink:0';

    const listTitle = document.createElement('div');
    listTitle.textContent = this.selectedCity ? 'Jobs in ' + this.selectedCity : 'Click a city to filter';
    listTitle.style.cssText = 'font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px';
    listCard.appendChild(listTitle);

    const displayJobs = this.selectedCity ? (cityJobs.get(this.selectedCity) || []) : [];
    if (displayJobs.length) {
      displayJobs.forEach(j => {
        const row = document.createElement('div');
        row.style.cssText = 'padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer';
        row.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('select-job', { detail: j.job_id, bubbles: true }));
        });
        const t = document.createElement('div');
        t.textContent = j.title;
        t.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-bright)';
        const s = document.createElement('div');
        s.textContent = j.company;
        s.style.cssText = 'font-size:11px;color:var(--accent-blue)';
        row.append(t, s);
        listCard.appendChild(row);
      });
    } else if (this.selectedCity) {
      const msg = document.createElement('div');
      msg.textContent = 'No jobs in this city';
      msg.style.cssText = 'color:var(--text-dim);font-size:13px';
      listCard.appendChild(msg);
    }

    wrapper.appendChild(listCard);
    this.appendChild(wrapper);
  }

  _findCoords(city) {
    // Exact match
    if (CITY_COORDS[city]) return CITY_COORDS[city];
    // Partial match
    for (const [name, coords] of Object.entries(CITY_COORDS)) {
      if (city.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(city.toLowerCase())) {
        return coords;
      }
    }
    // Default UAE position with slight random offset
    return { x: 350 + Math.random() * 40 - 20, y: 250 + Math.random() * 30 - 15 };
  }
}

customElements.define('tab-map', TabMap);
