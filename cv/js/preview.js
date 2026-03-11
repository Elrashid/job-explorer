// preview.js — CV Preview Tab Web Component

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

function svgEl(tag, attrs = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

export class TabPreview extends HTMLElement {
  constructor() {
    super();
    this.profile = null;
    this.cv = null;
    this.job = null;
    this.mode = 'human'; // 'human' or 'ats'
  }

  init(profile) {
    this.profile = profile;
    this.renderEmpty();
  }

  renderEmpty() {
    while (this.firstChild) this.removeChild(this.firstChild);
    this.appendChild(el('div', { className: 'preview-empty', textContent: 'Select a job from the Browse tab to preview a tailored CV' }));
  }

  showCV(cv, profile, job) {
    this.cv = cv;
    this.profile = profile;
    this.job = job;
    this.render();
  }

  render() {
    if (!this.cv || !this.profile) return this.renderEmpty();
    while (this.firstChild) this.removeChild(this.firstChild);

    const container = el('div', { className: 'preview-container' });

    // Main content
    const main = el('div', { className: 'preview-main' });

    // Toggle bar
    const toggle = el('div', { className: 'preview-toggle' }, [
      el('button', {
        className: `preview-toggle-btn ${this.mode === 'human' ? 'active' : ''}`,
        textContent: 'Human-Readable',
        onClick: () => { this.mode = 'human'; this.render(); }
      }),
      el('button', {
        className: `preview-toggle-btn ${this.mode === 'ats' ? 'active' : ''}`,
        textContent: 'ATS-Optimized',
        onClick: () => { this.mode = 'ats'; this.render(); }
      })
    ]);
    main.appendChild(toggle);

    if (this.mode === 'human') {
      main.appendChild(this.buildHumanCV());
    } else {
      main.appendChild(this.buildAtsCV());
    }

    container.appendChild(main);

    // Sidebar
    container.appendChild(this.buildSidebar());

    this.appendChild(container);
  }

  buildHumanCV() {
    const cv = this.cv;
    const p = this.profile;
    const doc = el('div', { className: 'cv-document' });

    // Header
    doc.appendChild(el('div', { className: 'cv-name', textContent: p.name }));
    doc.appendChild(el('div', { className: 'cv-headline', textContent: cv.tailored_summary || p.headline }));

    // Contact
    const contact = el('div', { className: 'cv-contact' });
    const contactItems = [p.contact.email, p.contact.phone, p.contact.linkedin, p.contact.github];
    for (const item of contactItems) {
      if (item) contact.appendChild(el('span', { textContent: item }));
    }
    doc.appendChild(contact);

    // Summary
    if (cv.tailored_summary) {
      const section = el('div', { className: 'cv-section' });
      section.appendChild(el('div', { className: 'cv-section-title', textContent: 'Professional Summary' }));
      section.appendChild(el('div', { className: 'cv-summary', textContent: cv.tailored_summary }));
      doc.appendChild(section);
    }

    // Experience
    const expSection = el('div', { className: 'cv-section' });
    expSection.appendChild(el('div', { className: 'cv-section-title', textContent: 'Experience' }));
    const expList = cv.tailored_experience || p.experience;
    for (const exp of expList) {
      const item = el('div', { className: 'cv-exp-item' });
      item.appendChild(el('div', { className: 'cv-exp-header' }, [
        el('span', { className: 'cv-exp-title', textContent: exp.title }),
        el('span', { className: 'cv-exp-dates', textContent: exp.dates })
      ]));
      const companyText = exp.company + (exp.sector ? ` (${exp.sector})` : '') + (exp.location ? ` — ${exp.location}` : '');
      item.appendChild(el('div', { className: 'cv-exp-company', textContent: companyText }));

      if (exp.bullets && exp.bullets.length > 0) {
        const ul = el('ul', { className: 'cv-exp-bullets' });
        for (const bullet of exp.bullets) {
          ul.appendChild(el('li', { textContent: bullet }));
        }
        item.appendChild(ul);
      }
      expSection.appendChild(item);
    }
    doc.appendChild(expSection);

    // Skills
    const skillsSection = el('div', { className: 'cv-section' });
    skillsSection.appendChild(el('div', { className: 'cv-section-title', textContent: 'Technical Skills' }));
    const skillsList = el('div', { className: 'cv-skills-list' });
    const skills = cv.skills_order || Object.values(p.skills).flat().filter(s => typeof s === 'string');
    for (const skill of skills) {
      skillsList.appendChild(el('span', { className: 'cv-skill-tag', textContent: skill }));
    }
    skillsSection.appendChild(skillsList);
    doc.appendChild(skillsSection);

    // Certifications
    const certSection = el('div', { className: 'cv-section' });
    certSection.appendChild(el('div', { className: 'cv-section-title', textContent: 'Certifications' }));
    const certs = cv.certs_order || p.certifications.map(c => c.name);
    for (const cert of certs) {
      const certObj = p.certifications.find(c => c.name === cert);
      const certItem = el('div', { className: 'cv-cert-item' });
      certItem.appendChild(document.createTextNode(cert + ' '));
      if (certObj) {
        certItem.appendChild(el('span', { className: 'cv-cert-year', textContent: `(${certObj.year})` }));
      }
      certSection.appendChild(certItem);
    }
    doc.appendChild(certSection);

    // Education
    const eduSection = el('div', { className: 'cv-section' });
    eduSection.appendChild(el('div', { className: 'cv-section-title', textContent: 'Education' }));
    eduSection.appendChild(el('div', { className: 'cv-exp-item' }, [
      el('div', { className: 'cv-exp-title', textContent: p.education.degree }),
      el('div', { className: 'cv-exp-company', textContent: `${p.education.university} — ${p.education.grade}` }),
      el('div', { className: 'cv-exp-dates', textContent: p.education.years })
    ]));
    doc.appendChild(eduSection);

    // GitHub
    if (p.github) {
      const ghSection = el('div', { className: 'cv-section' });
      ghSection.appendChild(el('div', { className: 'cv-section-title', textContent: 'Open Source & Community' }));
      ghSection.appendChild(el('div', { className: 'cv-summary', textContent:
        `${p.github.total_repos}+ repositories on GitHub (github.com/${p.github.username}). ` +
        `Achievements: ${p.github.achievements.join(', ')}. ` +
        `StackOverflow: ${p.github.stackoverflow_rep} reputation. ` +
        `Volunteer: ${p.volunteer.events_count} UAE tech/startup events (${p.volunteer.period}).`
      }));
      doc.appendChild(ghSection);
    }

    return doc;
  }

  buildAtsCV() {
    const cv = this.cv;
    const p = this.profile;
    const lines = [];

    lines.push(p.name.toUpperCase());
    lines.push(`${p.contact.email} | ${p.contact.phone} | ${p.contact.linkedin} | ${p.contact.github}`);
    lines.push('');
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(cv.tailored_summary || p.headline);
    lines.push('');
    lines.push('EXPERIENCE');

    const expList = cv.tailored_experience || p.experience;
    for (const exp of expList) {
      lines.push('');
      lines.push(`${exp.title} | ${exp.company} | ${exp.dates}`);
      if (exp.bullets) {
        for (const b of exp.bullets) {
          lines.push(`- ${b}`);
        }
      }
    }

    lines.push('');
    lines.push('TECHNICAL SKILLS');
    const skills = cv.skills_order || Object.values(p.skills).flat().filter(s => typeof s === 'string');
    lines.push(skills.join(', '));

    lines.push('');
    lines.push('CERTIFICATIONS');
    const certs = cv.certs_order || p.certifications.map(c => c.name);
    for (const cert of certs) {
      const certObj = p.certifications.find(c => c.name === cert);
      lines.push(`- ${cert}${certObj ? ` (${certObj.year})` : ''}`);
    }

    lines.push('');
    lines.push('EDUCATION');
    lines.push(`${p.education.degree} - ${p.education.university} - ${p.education.grade} (${p.education.years})`);

    lines.push('');
    lines.push('GITHUB & COMMUNITY');
    lines.push(`${p.github.total_repos}+ repos | github.com/${p.github.username} | Arctic Code Vault Contributor`);
    lines.push(`StackOverflow: ${p.github.stackoverflow_rep} reputation`);
    lines.push(`Volunteer: ${p.volunteer.events_count} tech events (${p.volunteer.period})`);

    return el('pre', { className: 'cv-ats', textContent: lines.join('\n') });
  }

  buildSidebar() {
    const cv = this.cv;
    const job = this.job;
    const sidebar = el('div', { className: 'preview-sidebar' });

    // Job info
    const jobInfo = el('div', { className: 'sidebar-section' });
    jobInfo.appendChild(el('div', { className: 'sidebar-title', textContent: 'Target Job' }));
    jobInfo.appendChild(el('div', { className: 'cv-exp-title', textContent: cv.job_title }));
    jobInfo.appendChild(el('div', { className: 'cv-exp-company', textContent: cv.company }));
    sidebar.appendChild(jobInfo);

    // ATS Score gauge
    const atsSection = el('div', { className: 'sidebar-section' });
    atsSection.appendChild(el('div', { className: 'sidebar-title', textContent: 'ATS Score' }));
    atsSection.appendChild(this.buildGauge(cv.ats_score || 0));
    sidebar.appendChild(atsSection);

    // Match score
    const matchSection = el('div', { className: 'sidebar-section' });
    matchSection.appendChild(el('div', { className: 'sidebar-title', textContent: 'Match Score' }));
    matchSection.appendChild(this.buildGauge(cv.match_score || 0));
    sidebar.appendChild(matchSection);

    // Keyword density
    if (cv.keyword_density) {
      const kdSection = el('div', { className: 'sidebar-section' });
      kdSection.appendChild(el('div', { className: 'sidebar-title', textContent: `Keywords: ${cv.keyword_density.matched}/${cv.keyword_density.total} (${cv.keyword_density.percent}%)` }));
      sidebar.appendChild(kdSection);
    }

    // Keywords list
    if (cv.ats_keywords && cv.ats_keywords.length > 0) {
      const kwSection = el('div', { className: 'sidebar-section' });
      kwSection.appendChild(el('div', { className: 'sidebar-title', textContent: 'Matched Keywords' }));
      const kwList = el('div', { className: 'keyword-list' });
      for (const kw of cv.ats_keywords) {
        kwList.appendChild(el('div', { className: 'keyword-item keyword-match', textContent: `\u2713 ${kw}` }));
      }
      kwSection.appendChild(kwList);
      sidebar.appendChild(kwSection);
    }

    // Skill gaps
    if (job && job.skill_gaps && job.skill_gaps.length > 0) {
      const gapSection = el('div', { className: 'sidebar-section' });
      gapSection.appendChild(el('div', { className: 'sidebar-title', textContent: 'Skill Gaps' }));
      const gapList = el('div', { className: 'keyword-list' });
      for (const gap of job.skill_gaps) {
        gapList.appendChild(el('div', { className: 'keyword-item keyword-gap', textContent: `\u2717 ${gap}` }));
      }
      gapSection.appendChild(gapList);
      sidebar.appendChild(gapSection);
    }

    return sidebar;
  }

  buildGauge(score) {
    const svg = svgEl('svg', { class: 'ats-gauge', viewBox: '0 0 80 80' });
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    // Background circle
    const bgCircle = svgEl('circle', {
      cx: '40', cy: '40', r: String(radius),
      fill: 'none', stroke: '#1a1f35', 'stroke-width': '8'
    });
    svg.appendChild(bgCircle);

    // Score arc
    const color = score >= 60 ? '#22c55e' : score >= 30 ? '#0ea5e9' : '#ef4444';
    const scoreCircle = svgEl('circle', {
      cx: '40', cy: '40', r: String(radius),
      fill: 'none', stroke: color, 'stroke-width': '8',
      'stroke-dasharray': String(circumference),
      'stroke-dashoffset': String(offset),
      'stroke-linecap': 'round',
      transform: 'rotate(-90 40 40)'
    });
    svg.appendChild(scoreCircle);

    // Text
    const text = svgEl('text', { x: '40', y: '44', class: 'ats-gauge-text' });
    text.textContent = String(score);
    svg.appendChild(text);

    return svg;
  }
}

customElements.define('tab-preview', TabPreview);
