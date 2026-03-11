// llm-ready.js — LLM-Ready Tab Web Component

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

export class TabLlm extends HTMLElement {
  constructor() {
    super();
    this.cv = null;
    this.job = null;
  }

  showJob(cv, job) {
    this.cv = cv;
    this.job = job;
    this.render();
  }

  render() {
    while (this.firstChild) this.removeChild(this.firstChild);
    const container = el('div', { className: 'llm-container' });

    if (!this.cv) {
      container.appendChild(el('div', { className: 'llm-empty', textContent: 'Select a job from the Browse tab to generate LLM-ready text.' }));
      this.appendChild(container);
      return;
    }

    // Prompt suggestion
    const prompt = el('div', { className: 'llm-prompt' }, [
      el('strong', { textContent: 'Prompt suggestion: ' }),
      document.createTextNode(`Paste the text below into ChatGPT/Claude and ask: "Does this candidate fit the ${this.cv.job_title} position at ${this.cv.company}? Identify strengths, gaps, and interview questions."`)
    ]);
    container.appendChild(prompt);

    // Copy button
    const copyBtn = el('button', {
      className: 'llm-copy-btn',
      textContent: 'Copy to Clipboard',
      onClick: () => {
        const text = this.getLlmText();
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Copy to Clipboard';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      }
    });
    container.appendChild(copyBtn);

    // LLM text
    const textBlock = el('pre', { className: 'llm-text', textContent: this.getLlmText() });
    container.appendChild(textBlock);

    this.appendChild(container);
  }

  getLlmText() {
    if (this.cv.llm_ready_text) return this.cv.llm_ready_text;

    // Generate from CV data
    const cv = this.cv;
    const job = this.job;
    const lines = [];

    lines.push('CANDIDATE PROFILE: Mohamed Elrashid');
    lines.push(`TARGET ROLE: ${cv.job_title} at ${cv.company}`);
    lines.push(`MATCH SCORE: ${cv.match_score}/100`);
    lines.push(`ATS SCORE: ${cv.ats_score}/100`);
    lines.push('');
    lines.push('SKILL MATCH ANALYSIS:');

    if (cv.ats_keywords) {
      for (const kw of cv.ats_keywords) {
        lines.push(`\u2713 ${kw}`);
      }
    }

    if (job && job.skill_gaps) {
      for (const gap of job.skill_gaps) {
        lines.push(`\u2717 ${gap} — gap`);
      }
    }

    lines.push('');
    lines.push('EXPERIENCE SUMMARY:');
    lines.push('- 16+ years continuous IT experience across education, enterprise, and government sectors');
    lines.push('- Currently IT Officer at Imam Malik College (Government of Dubai), 5+ years');
    lines.push('- Previously IT Trainer (5 years), IT Officer at legal firm (3 years), Senior Software Engineer (1.5 years)');
    lines.push('- Founded 2 startups: KONSTARTUP (tech community) and MOECS (Azure consulting)');
    lines.push('- 110+ GitHub repositories, Arctic Code Vault Contributor');
    lines.push('');
    lines.push('CERTIFICATIONS:');
    lines.push('- Microsoft Certified Trainer (MCT) 2021-2027');
    lines.push('- Azure AI Fundamentals (2023)');
    lines.push('- MS Specialist: Azure Solutions + Infrastructure (2014)');
    lines.push('- MCSA: Office 365 (2014)');
    lines.push('- Generative AI for Business Leaders (2025)');
    lines.push('- Security Onion (2025)');
    lines.push('- ISO20000 ITSM (2024)');
    lines.push('');
    lines.push('EDUCATION: BSc Information Systems (V.Good with Honours) — Omdurman Islamic University, 2010');
    lines.push('LANGUAGES: Arabic (Native), English (Full Professional)');
    lines.push('LOCATION: Dubai, UAE');

    return lines.join('\n');
  }
}

customElements.define('tab-llm', TabLlm);
