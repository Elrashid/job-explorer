// app.js — Main controller for the analysis dashboard

import { TabOverview } from './meta-charts.js';
import { TabPrisma } from './prisma.js';
import { TabSkills } from './skill-matrix.js';
import { TabCareers } from './career-paths.js';
import { TabDatamodel } from './data-model.js';

const TAB_IDS = ['overview', 'prisma', 'skills', 'careers', 'datamodel'];

async function loadJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
  return resp.json();
}

function activateTab(tabId) {
  // Update buttons
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update panes
  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(pane => {
    if (pane.id === `pane-${tabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

async function init() {
  const statusEl = document.getElementById('load-status');

  try {
    if (statusEl) statusEl.textContent = 'Loading data...';

    const [meta, jobs] = await Promise.all([
      loadJSON('./data/meta_summary.json'),
      loadJSON('./data/jobs_normalized.json')
    ]);

    if (statusEl) statusEl.textContent = `${meta.total_jobs} jobs loaded`;

    // Wire tab buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        activateTab(btn.dataset.tab);
      });
    });

    // Keyboard shortcuts 1-5
    document.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5) {
        e.preventDefault();
        activateTab(TAB_IDS[num - 1]);
      }
    });

    // Initialize all tab components
    const overviewEl = document.querySelector('tab-overview');
    if (overviewEl) overviewEl.setData(meta, jobs);

    const prismaEl = document.querySelector('tab-prisma');
    if (prismaEl) prismaEl.setData(meta, jobs);

    const skillsEl = document.querySelector('tab-skills');
    if (skillsEl) skillsEl.setData(meta, jobs);

    const careersEl = document.querySelector('tab-careers');
    if (careersEl) careersEl.setData(meta, jobs);

    const datamodelEl = document.querySelector('tab-datamodel');
    if (datamodelEl) datamodelEl.setData(meta, jobs);

    // Default to overview tab
    activateTab('overview');

  } catch (err) {
    console.error('Init error:', err);
    if (statusEl) statusEl.textContent = 'Error loading data';
  }
}

document.addEventListener('DOMContentLoaded', init);
