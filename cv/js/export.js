// export.js — Export Tab Web Component

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

function download(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sanitize(str) {
  return (str || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
}

export class TabExport extends HTMLElement {
  constructor() {
    super();
    this.cv = null;
    this.profile = null;
    this.job = null;
  }

  setJob(cv, profile, job) {
    this.cv = cv;
    this.profile = profile;
    this.job = job;
    this.render();
  }

  render() {
    while (this.firstChild) this.removeChild(this.firstChild);

    const container = el('div', { className: 'export-container' });
    container.appendChild(el('div', { className: 'export-title', textContent: 'Export Tailored CV' }));

    if (!this.cv) {
      container.appendChild(el('div', { className: 'export-subtitle', textContent: 'Select a job from the Browse tab first.' }));
      this.appendChild(container);
      return;
    }

    // Job info
    const info = el('div', { className: 'export-job-info' }, [
      el('div', { className: 'export-job-title', textContent: this.cv.job_title }),
      el('div', { className: 'export-job-company', textContent: `${this.cv.company} — Match: ${this.cv.match_score}% | ATS: ${this.cv.ats_score}%` })
    ]);
    container.appendChild(info);

    container.appendChild(el('div', { className: 'export-subtitle', textContent: 'Choose an export format:' }));

    const grid = el('div', { className: 'export-grid' });
    const formats = [
      { icon: '\uD83C\uDF10', label: 'HTML', desc: 'Styled, print-ready web page', fn: () => this.exportHTML() },
      { icon: '\uD83D\uDCDD', label: 'Markdown', desc: 'Standard .md format', fn: () => this.exportMarkdown() },
      { icon: '\uD83D\uDCC4', label: 'PDF', desc: 'Print dialog (Ctrl+P)', fn: () => this.exportPDF() },
      { icon: '\uD83D\uDCCB', label: 'Word (.docx)', desc: 'Microsoft Word document', fn: () => this.exportDocx() },
      { icon: '\uD83D\uDCCA', label: 'PowerPoint', desc: '5-slide pitch deck', fn: () => this.exportPptx() },
      { icon: '\uD83D\uDCC2', label: 'Plain Text', desc: 'ATS-safe + LLM-ready', fn: () => this.exportText() }
    ];

    for (const fmt of formats) {
      grid.appendChild(el('button', { className: 'export-btn', onClick: fmt.fn }, [
        el('div', { className: 'export-btn-icon', textContent: fmt.icon }),
        el('div', { className: 'export-btn-label', textContent: fmt.label }),
        el('div', { className: 'export-btn-desc', textContent: fmt.desc })
      ]));
    }
    container.appendChild(grid);
    this.appendChild(container);
  }

  getFilename(ext) {
    return `Mohamed_Elrashid_CV_${sanitize(this.cv.job_title)}.${ext}`;
  }

  buildMarkdownContent() {
    const cv = this.cv;
    const p = this.profile;
    const lines = [];
    lines.push(`# ${p.name}`);
    lines.push(`**${p.headline}**\n`);
    lines.push(`${p.contact.email} | ${p.contact.phone} | ${p.contact.linkedin} | ${p.contact.github}\n`);
    lines.push(`---\n`);
    lines.push(`## Professional Summary\n`);
    lines.push(`${cv.tailored_summary || ''}\n`);
    lines.push(`## Experience\n`);

    const expList = cv.tailored_experience || p.experience;
    for (const exp of expList) {
      lines.push(`### ${exp.title} — ${exp.company}`);
      lines.push(`*${exp.dates}*\n`);
      if (exp.bullets) {
        for (const b of exp.bullets) lines.push(`- ${b}`);
      }
      lines.push('');
    }

    lines.push(`## Technical Skills\n`);
    const skills = cv.skills_order || Object.values(p.skills).flat().filter(s => typeof s === 'string');
    lines.push(skills.join(' | ') + '\n');

    lines.push(`## Certifications\n`);
    const certs = cv.certs_order || p.certifications.map(c => c.name);
    for (const cert of certs) {
      const certObj = p.certifications.find(c => c.name === cert);
      lines.push(`- ${cert}${certObj ? ` (${certObj.year})` : ''}`);
    }
    lines.push('');

    lines.push(`## Education\n`);
    lines.push(`**${p.education.degree}** — ${p.education.university}`);
    lines.push(`${p.education.grade} (${p.education.years})\n`);

    lines.push(`## Open Source & Community\n`);
    lines.push(`- GitHub: ${p.github.total_repos}+ repos (github.com/${p.github.username})`);
    lines.push(`- Achievements: ${p.github.achievements.join(', ')}`);
    lines.push(`- StackOverflow: ${p.github.stackoverflow_rep} reputation`);
    lines.push(`- Volunteer: ${p.volunteer.events_count} UAE tech/startup events (${p.volunteer.period})`);

    return lines.join('\n');
  }

  buildPlainText() {
    if (this.cv.llm_ready_text) return this.cv.llm_ready_text;

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
      if (exp.bullets) for (const b of exp.bullets) lines.push(`- ${b}`);
    }
    lines.push('');
    lines.push('TECHNICAL SKILLS');
    const skills = cv.skills_order || Object.values(p.skills).flat().filter(s => typeof s === 'string');
    lines.push(skills.join(', '));
    lines.push('');
    lines.push('CERTIFICATIONS');
    const certs = cv.certs_order || p.certifications.map(c => c.name);
    for (const c of certs) lines.push(`- ${c}`);
    lines.push('');
    lines.push('EDUCATION');
    lines.push(`${p.education.degree} - ${p.education.university} - ${p.education.grade}`);
    return lines.join('\n');
  }

  exportHTML() {
    const md = this.buildMarkdownContent();
    const p = this.profile;
    const cv = this.cv;
    const skills = cv.skills_order || Object.values(p.skills).flat().filter(s => typeof s === 'string');
    const certs = cv.certs_order || p.certifications.map(c => c.name);
    const expList = cv.tailored_experience || p.experience;

    let expHtml = '';
    for (const exp of expList) {
      let bullets = '';
      if (exp.bullets) {
        for (const b of exp.bullets) {
          bullets += `<li>${this.escapeHtml(b)}</li>`;
        }
      }
      expHtml += `<div class="exp"><h3>${this.escapeHtml(exp.title)} <span class="dates">${this.escapeHtml(exp.dates)}</span></h3><div class="company">${this.escapeHtml(exp.company)}</div><ul>${bullets}</ul></div>`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${this.escapeHtml(p.name)} - CV</title>
<style>
body{font-family:'Segoe UI',sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}
h1{font-size:28px;margin-bottom:4px}
.headline{color:#2563eb;font-size:14px;margin-bottom:12px}
.contact{color:#6b7280;font-size:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e5e7eb}
h2{font-size:16px;color:#2563eb;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin:20px 0 10px;text-transform:uppercase;letter-spacing:1px}
.exp{margin-bottom:14px}
h3{font-size:14px;font-weight:600;margin-bottom:2px}
.dates{font-weight:400;color:#6b7280;font-size:12px;float:right}
.company{font-size:12px;color:#2563eb;margin-bottom:6px}
ul{padding-left:20px;margin:0}
li{font-size:12px;margin-bottom:2px}
.skills{display:flex;flex-wrap:wrap;gap:6px}
.skill{font-size:11px;padding:3px 10px;border-radius:12px;background:#f3f4f6;border:1px solid #e5e7eb}
.cert{font-size:12px;margin-bottom:2px}
@media print{body{margin:20px}}
</style>
</head>
<body>
<h1>${this.escapeHtml(p.name)}</h1>
<div class="headline">${this.escapeHtml(cv.tailored_summary || p.headline)}</div>
<div class="contact">${this.escapeHtml(p.contact.email)} | ${this.escapeHtml(p.contact.phone)} | ${this.escapeHtml(p.contact.linkedin)} | ${this.escapeHtml(p.contact.github)}</div>
<h2>Professional Summary</h2>
<p>${this.escapeHtml(cv.tailored_summary || '')}</p>
<h2>Experience</h2>
${expHtml}
<h2>Technical Skills</h2>
<div class="skills">${skills.map(s => `<span class="skill">${this.escapeHtml(s)}</span>`).join('')}</div>
<h2>Certifications</h2>
${certs.map(c => `<div class="cert">${this.escapeHtml(c)}</div>`).join('')}
<h2>Education</h2>
<p><strong>${this.escapeHtml(p.education.degree)}</strong> — ${this.escapeHtml(p.education.university)} — ${this.escapeHtml(p.education.grade)} (${this.escapeHtml(p.education.years)})</p>
</body>
</html>`;

    download(this.getFilename('html'), html, 'text/html');
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  exportMarkdown() {
    download(this.getFilename('md'), this.buildMarkdownContent(), 'text/markdown');
  }

  exportPDF() {
    window.print();
  }

  exportText() {
    download(this.getFilename('txt'), this.buildPlainText(), 'text/plain');
  }

  async exportDocx() {
    try {
      if (!window.docx) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.min.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = window.docx;
      const cv = this.cv;
      const p = this.profile;
      const children = [];

      children.push(new Paragraph({ text: p.name, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
      children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: `${p.contact.email} | ${p.contact.phone} | ${p.contact.linkedin}`, size: 20, color: '666666' })
      ]}));
      children.push(new Paragraph({ text: '' }));

      children.push(new Paragraph({ text: 'PROFESSIONAL SUMMARY', heading: HeadingLevel.HEADING_1 }));
      children.push(new Paragraph({ text: cv.tailored_summary || '' }));
      children.push(new Paragraph({ text: '' }));

      children.push(new Paragraph({ text: 'EXPERIENCE', heading: HeadingLevel.HEADING_1 }));
      const expList = cv.tailored_experience || p.experience;
      for (const exp of expList) {
        children.push(new Paragraph({ children: [
          new TextRun({ text: exp.title, bold: true }),
          new TextRun({ text: ` — ${exp.company} (${exp.dates})`, color: '666666' })
        ]}));
        if (exp.bullets) {
          for (const b of exp.bullets) {
            children.push(new Paragraph({ text: b, bullet: { level: 0 } }));
          }
        }
        children.push(new Paragraph({ text: '' }));
      }

      children.push(new Paragraph({ text: 'TECHNICAL SKILLS', heading: HeadingLevel.HEADING_1 }));
      const skills = cv.skills_order || Object.values(p.skills).flat().filter(s => typeof s === 'string');
      children.push(new Paragraph({ text: skills.join(' | ') }));
      children.push(new Paragraph({ text: '' }));

      children.push(new Paragraph({ text: 'CERTIFICATIONS', heading: HeadingLevel.HEADING_1 }));
      const certs = cv.certs_order || p.certifications.map(c => c.name);
      for (const c of certs) {
        children.push(new Paragraph({ text: c, bullet: { level: 0 } }));
      }
      children.push(new Paragraph({ text: '' }));

      children.push(new Paragraph({ text: 'EDUCATION', heading: HeadingLevel.HEADING_1 }));
      children.push(new Paragraph({ text: `${p.education.degree} — ${p.education.university} — ${p.education.grade} (${p.education.years})` }));

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.getFilename('docx');
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('DOCX export error:', err);
      alert('Word export failed. Try another format.');
    }
  }

  async exportPptx() {
    try {
      if (!window.PptxGenJS) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgenjs.bundle.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      const pptx = new window.PptxGenJS();
      pptx.title = `${this.profile.name} — ${this.cv.job_title}`;

      const slides = this.cv.pitch_deck ? this.cv.pitch_deck.slides : [
        { title: `Why ${this.profile.name}`, bullets: ['16+ years IT experience', 'UAE-based, Government sector', 'Azure & AI certified'] },
        { title: 'Track Record', bullets: ['IT Officer at Imam Malik College (Gov of Dubai)', '2 startups founded', 'ERP & infrastructure development'] },
        { title: 'Technical Depth', bullets: ['110+ GitHub repos', 'Full-stack: .NET, Flutter, Python', 'Azure Solutions + Infrastructure certified'] },
        { title: 'Cultural Fit', bullets: ['Bilingual Arabic/English', 'UAE since childhood', '40+ community events'] },
        { title: 'Growth Vision', bullets: ['AI/ML research', 'GenAI certified', 'Microsoft Certified Trainer'] }
      ];

      for (const slideData of slides) {
        const slide = pptx.addSlide();
        slide.background = { color: '0a0e1a' };
        slide.addText(slideData.title, { x: 0.5, y: 0.4, w: 9, h: 1, fontSize: 28, bold: true, color: '22c55e', fontFace: 'Segoe UI' });
        const bulletText = (slideData.bullets || []).map(b => ({ text: b, options: { fontSize: 16, color: 'e2e8f0', bullet: true, paraSpaceAfter: 8 } }));
        slide.addText(bulletText, { x: 0.8, y: 1.8, w: 8.4, h: 3.5, fontFace: 'Segoe UI' });
        slide.addText(`${this.profile.name} | ${this.cv.job_title} at ${this.cv.company}`, { x: 0.5, y: 5, w: 9, h: 0.4, fontSize: 10, color: '64748b', fontFace: 'Segoe UI' });
      }

      await pptx.writeFile({ fileName: this.getFilename('pptx') });
    } catch (err) {
      console.error('PPTX export error:', err);
      alert('PowerPoint export failed. Try another format.');
    }
  }
}

customElements.define('tab-export', TabExport);
