// app.js — Main controller for CV Generator dashboard

import { TabBrowse } from './browse.js';
import { TabPreview } from './preview.js';
import { TabExport } from './export.js';
import { TabLinkedin } from './linkedin.js';
import { TabLlm } from './llm-ready.js';

const TAB_IDS = ['browse', 'preview', 'export', 'linkedin', 'llm'];

// Shared state
let selectedJobId = null;
let profile = null;
let cvs = [];
let jobs = [];

async function loadJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
  return resp.json();
}

function activateTab(tabId) {
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(pane => {
    pane.classList.toggle('active', pane.id === `pane-${tabId}`);
  });
}

function selectJob(jobId) {
  selectedJobId = jobId;
  window.location.hash = jobId;

  // Notify all components
  const cv = cvs.find(c => c.job_id === jobId);
  const job = jobs.find(j => j.job_id === jobId);
  if (!cv || !job) return;

  const previewEl = document.querySelector('tab-preview');
  if (previewEl) previewEl.showCV(cv, profile, job);

  const exportEl = document.querySelector('tab-export');
  if (exportEl) exportEl.setJob(cv, profile, job);

  const llmEl = document.querySelector('tab-llm');
  if (llmEl) llmEl.showJob(cv, job);
}

async function init() {
  const statusEl = document.getElementById('load-status');

  try {
    if (statusEl) statusEl.textContent = 'Loading data...';

    [profile, cvs, jobs] = await Promise.all([
      loadJSON('./data/profile.json'),
      loadJSON('./data/cvs.json'),
      loadJSON('../analysis/data/jobs_normalized.json')
    ]);

    if (statusEl) statusEl.textContent = `${cvs.length} tailored CVs loaded`;

    // Wire tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => activateTab(btn.dataset.tab));
    });

    // Keyboard shortcuts 1-5
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5) {
        e.preventDefault();
        activateTab(TAB_IDS[num - 1]);
      }
    });

    // Initialize components
    const browseEl = document.querySelector('tab-browse');
    if (browseEl) {
      browseEl.setData(cvs, jobs);
      browseEl.onJobSelect = (jobId) => {
        selectJob(jobId);
        activateTab('preview');
      };
    }

    const previewEl = document.querySelector('tab-preview');
    if (previewEl) previewEl.init(profile);

    const linkedinEl = document.querySelector('tab-linkedin');
    if (linkedinEl) linkedinEl.setData(cvs, jobs);

    // Handle hash routing
    const hash = window.location.hash.slice(1);
    if (hash) {
      selectJob(hash);
      activateTab('preview');
    } else {
      activateTab('browse');
    }

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const id = window.location.hash.slice(1);
      if (id) {
        selectJob(id);
        activateTab('preview');
      }
    });

  } catch (err) {
    console.error('Init error:', err);
    if (statusEl) statusEl.textContent = 'Error loading data';
  }
}

document.addEventListener('DOMContentLoaded', init);
