// Main App Controller — loads data, wires tabs, keyboard, settings, export
import { loadPrefs, savePrefs, getDefaults, extractAllCities } from './score-engine.js';
import { exportCSV, copyToClipboard } from './export.js';
import './tab-dashboard.js';
import './tab-jobs.js';
import './tab-compare.js';
import './tab-board.js';
import './tab-map.js';

let jobs = [];
let activeTab = 'dashboard';

const TABS = ['dashboard', 'jobs', 'compare', 'board', 'map'];

async function init() {
  const resp = await fetch('./jobs_extracted.json');
  jobs = await resp.json();

  document.getElementById('stats').textContent = jobs.length + ' jobs loaded';

  // Pass data to all tab components
  el('tab-dashboard').setData(jobs);
  el('tab-jobs').setData(jobs);
  el('tab-compare').setData(jobs);
  el('tab-board').setData(jobs);
  el('tab-map').setData(jobs);

  switchTab('dashboard');
  setupEvents();
  setupKeyboard();
}

function el(id) { return document.getElementById(id); }

function switchTab(name) {
  activeTab = name;
  TABS.forEach(t => {
    const pane = el('pane-' + t);
    const btn = el('btn-' + t);
    if (t === name) { pane.classList.add('active'); btn.classList.add('active'); }
    else { pane.classList.remove('active'); btn.classList.remove('active'); }
  });
}

function setupEvents() {
  // Tab buttons
  TABS.forEach(t => {
    el('btn-' + t).addEventListener('click', () => switchTab(t));
  });

  // Dashboard: filter-industry clicks
  el('tab-dashboard').addEventListener('filter-industry', e => {
    switchTab('jobs');
    el('tab-jobs').setFilterIndustry(e.detail);
  });

  // Dashboard + Map: select-job clicks
  el('tab-dashboard').addEventListener('select-job', e => {
    switchTab('jobs');
    el('tab-jobs').selectById(e.detail);
  });
  el('tab-map').addEventListener('select-job', e => {
    switchTab('jobs');
    el('tab-jobs').selectById(e.detail);
  });

  // Compare sync
  el('tab-jobs').addEventListener('compare-changed', () => {
    el('tab-compare').setCompareIds(el('tab-jobs').getCompareSet());
  });

  // Settings
  el('btn-settings').addEventListener('click', () => showSettings());

  // Export
  const exportBtn = el('btn-export');
  const exportDrop = el('export-dropdown');
  exportBtn.addEventListener('click', () => exportDrop.classList.toggle('hidden'));
  document.addEventListener('click', e => {
    if (!exportBtn.contains(e.target) && !exportDrop.contains(e.target)) {
      exportDrop.classList.add('hidden');
    }
  });
  el('export-csv').addEventListener('click', () => { exportCSV(jobs); exportDrop.classList.add('hidden'); });
  el('export-clipboard').addEventListener('click', () => { copyToClipboard(jobs); exportDrop.classList.add('hidden'); });

  // Help
  el('btn-help').addEventListener('click', () => toggleHelp());
  el('btn-help-close').addEventListener('click', () => el('help-overlay').classList.add('hidden'));
}

function setupKeyboard() {
  document.addEventListener('keydown', e => {
    // Don't capture when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    // Tab switching: 1-5
    if (e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      switchTab(TABS[parseInt(e.key) - 1]);
      return;
    }

    // Jobs tab navigation
    if (activeTab === 'jobs') {
      if (e.key === 'ArrowDown') { e.preventDefault(); el('tab-jobs').navigateList(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); el('tab-jobs').navigateList(-1); }
      if (e.key === 'c') { el('tab-jobs').toggleCompareFocused(); }
    }

    // Global
    if (e.key === '?') { e.preventDefault(); toggleHelp(); }
    if (e.key === 'e') { e.preventDefault(); exportCSV(jobs); }
    if (e.key === 'Escape') {
      el('settings-overlay').classList.add('hidden');
      el('help-overlay').classList.add('hidden');
    }
  });
}

function showSettings() {
  const overlay = el('settings-overlay');
  overlay.classList.remove('hidden');
  const prefs = loadPrefs();

  // Populate locations
  const cities = extractAllCities(jobs);
  const locContainer = el('pref-locations');
  locContainer.replaceChildren();
  [...cities.keys()].sort().forEach(city => {
    const chip = document.createElement('span');
    chip.className = 'chip' + (prefs.preferredLocations.includes(city) ? ' selected' : '');
    chip.textContent = city;
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
    locContainer.appendChild(chip);
  });

  // Work mode
  el('pref-mode').value = prefs.workMode;

  // Competition slider
  el('pref-competition').value = prefs.maxCompetition;
  el('pref-competition-val').textContent = prefs.maxCompetition.toLocaleString();
  el('pref-competition').addEventListener('input', function() {
    el('pref-competition-val').textContent = parseInt(this.value).toLocaleString();
  });

  // Company size
  el('pref-size').value = prefs.companySize;

  // Save
  el('pref-save').onclick = () => {
    const selectedCities = [...locContainer.querySelectorAll('.chip.selected')].map(c => c.textContent);
    const newPrefs = {
      ...prefs,
      preferredLocations: selectedCities,
      workMode: el('pref-mode').value,
      maxCompetition: parseInt(el('pref-competition').value),
      companySize: el('pref-size').value,
    };
    savePrefs(newPrefs);
    overlay.classList.add('hidden');
    // Refresh all tabs
    el('tab-dashboard').setData(jobs);
    el('tab-jobs').applyFilters();
    el('tab-board').render();
  };

  el('pref-cancel').onclick = () => overlay.classList.add('hidden');
}

function toggleHelp() {
  el('help-overlay').classList.toggle('hidden');
}

init();
