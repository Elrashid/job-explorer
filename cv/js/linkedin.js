// linkedin.js — LinkedIn Advisor Tab Web Component

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

export class TabLinkedin extends HTMLElement {
  constructor() {
    super();
    this.cvs = [];
    this.jobs = [];
  }

  setData(cvs, jobs) {
    this.cvs = cvs;
    this.jobs = jobs;
    this.render();
  }

  render() {
    while (this.firstChild) this.removeChild(this.firstChild);
    const container = el('div', { className: 'linkedin-container' });

    container.appendChild(el('div', { className: 'export-title', textContent: 'LinkedIn Profile Advisor' }));
    container.appendChild(el('div', { className: 'export-subtitle', textContent: 'Recommendations grouped by role category. Update your LinkedIn profile to match your target roles.' }));

    // Current profile warning
    const warning = el('div', {
      className: 'export-job-info',
      style: 'border-color: rgba(245, 158, 11, 0.3); margin-bottom: 20px;'
    }, [
      el('div', { className: 'sidebar-title', textContent: 'Current LinkedIn Issues' }),
      el('div', { className: 'linkedin-tip linkedin-tip-remove', textContent: 'Your current top skills are "Microsoft Excel", "Microsoft Office", "Attention to Detail" — these are generic and hurt your profile for technical roles.' }),
      el('div', { className: 'linkedin-tip linkedin-tip-remove', textContent: 'Your summary is outdated: "@KonStartup.com, MOECS.Net #Teacher #Tech geek" — needs a professional rewrite.' })
    ]);
    container.appendChild(warning);

    // Group by role category
    const categories = {};
    for (const cv of this.cvs) {
      if (!cv.linkedin_tips) continue;
      const job = this.jobs.find(j => j.job_id === cv.job_id);
      const cat = job ? job.role_category : 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ cv, job });
    }

    // Sort categories by job count
    const sortedCats = Object.entries(categories).sort((a, b) => b[1].length - a[1].length);

    for (const [cat, items] of sortedCats) {
      container.appendChild(this.buildCategory(cat, items));
    }

    this.appendChild(container);
  }

  buildCategory(category, items) {
    const card = el('div', { className: 'linkedin-category' });

    // Header
    const header = el('div', { className: 'linkedin-category-header' }, [
      document.createTextNode(category),
      el('span', { className: 'linkedin-category-count', textContent: `${items.length} jobs` })
    ]);

    const body = el('div', { className: 'linkedin-category-body' });
    body.style.display = 'none';

    header.addEventListener('click', () => {
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    });

    card.appendChild(header);

    // Aggregate tips across jobs in this category
    const headlines = new Set();
    const skillsToAdd = new Set();
    const skillsToRemove = new Set();
    const summaryAdditions = new Set();
    const featuredContent = new Set();

    const toArray = v => Array.isArray(v) ? v : (v ? [v] : []);
    for (const { cv } of items) {
      const tips = cv.linkedin_tips;
      if (tips.headline) headlines.add(tips.headline);
      toArray(tips.skills_to_add).forEach(s => skillsToAdd.add(s));
      toArray(tips.skills_to_remove).forEach(s => skillsToRemove.add(s));
      toArray(tips.summary_additions).forEach(s => summaryAdditions.add(s));
      toArray(tips.featured_content).forEach(s => featuredContent.add(s));
    }

    // Recommended Headlines
    if (headlines.size > 0) {
      const section = el('div', { className: 'linkedin-section' });
      section.appendChild(el('div', { className: 'linkedin-section-title', textContent: 'Recommended Headlines' }));
      for (const h of headlines) {
        section.appendChild(el('div', { className: 'linkedin-tip', textContent: h }));
      }
      body.appendChild(section);
    }

    // Skills to add
    if (skillsToAdd.size > 0) {
      const section = el('div', { className: 'linkedin-section' });
      section.appendChild(el('div', { className: 'linkedin-section-title', textContent: 'Skills to Add' }));
      for (const s of skillsToAdd) {
        section.appendChild(el('div', { className: 'linkedin-tip linkedin-tip-add', textContent: `+ ${s}` }));
      }
      body.appendChild(section);
    }

    // Skills to remove
    if (skillsToRemove.size > 0) {
      const section = el('div', { className: 'linkedin-section' });
      section.appendChild(el('div', { className: 'linkedin-section-title', textContent: 'Skills to Remove/Replace' }));
      for (const s of skillsToRemove) {
        section.appendChild(el('div', { className: 'linkedin-tip linkedin-tip-remove', textContent: `- ${s}` }));
      }
      body.appendChild(section);
    }

    // Summary additions
    if (summaryAdditions.size > 0) {
      const section = el('div', { className: 'linkedin-section' });
      section.appendChild(el('div', { className: 'linkedin-section-title', textContent: 'Summary Improvements' }));
      for (const s of summaryAdditions) {
        section.appendChild(el('div', { className: 'linkedin-tip', textContent: s }));
      }
      body.appendChild(section);
    }

    // Featured content ideas
    if (featuredContent.size > 0) {
      const section = el('div', { className: 'linkedin-section' });
      section.appendChild(el('div', { className: 'linkedin-section-title', textContent: 'Featured Content Ideas' }));
      for (const s of featuredContent) {
        section.appendChild(el('div', { className: 'linkedin-tip', textContent: s }));
      }
      body.appendChild(section);
    }

    // Job list
    const jobSection = el('div', { className: 'linkedin-section' });
    jobSection.appendChild(el('div', { className: 'linkedin-section-title', textContent: 'Jobs in This Category' }));
    for (const { cv } of items) {
      jobSection.appendChild(el('div', { className: 'linkedin-tip', textContent: `${cv.job_title} @ ${cv.company} (Match: ${cv.match_score}%)` }));
    }
    body.appendChild(jobSection);

    card.appendChild(body);
    return card;
  }
}

customElements.define('tab-linkedin', TabLinkedin);
