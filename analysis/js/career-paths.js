// career-paths.js — Career Paths Web Component

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'textContent') e.textContent = v;
    else if (k === 'className') e.className = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  }
  return e;
}

class TabCareers extends HTMLElement {
  constructor() {
    super();
    this._jobs = [];
    this._meta = null;
  }

  connectedCallback() {}

  setData(meta, jobs) {
    this._meta = meta;
    this._jobs = jobs;
    this._render();
  }

  _getTopMatches() {
    return [...this._jobs]
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .slice(0, 10);
  }

  _getSkillGapAnalysis() {
    const topJobs = [...this._jobs]
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .slice(0, 20);

    // Count frequency of each gap across high-scoring jobs
    const gapCounts = {};
    for (const job of topJobs) {
      if (!job.skill_gaps) continue;
      for (const gap of job.skill_gaps) {
        gapCounts[gap] = (gapCounts[gap] || 0) + 1;
      }
    }
    return Object.entries(gapCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }

  _buildLearningPath(gaps) {
    // Group gaps into learning categories
    const categories = [
      { title: 'AI/ML Foundations', keywords: ['ai', 'ml', 'machine learning', 'deep learning', 'neural', 'tensorflow', 'pytorch', 'nlp', 'computer vision'], skills: [] },
      { title: 'Cloud & Infrastructure', keywords: ['cloud', 'aws', 'azure', 'docker', 'kubernetes', 'ci/cd', 'devops', 'infrastructure'], skills: [] },
      { title: 'Data Engineering', keywords: ['data', 'database', 'sql', 'pipeline', 'etl', 'analytics', 'warehouse'], skills: [] },
      { title: 'Leadership & Strategy', keywords: ['leadership', 'management', 'strategy', 'stakeholder', 'team', 'executive', 'budget'], skills: [] },
      { title: 'Domain Expertise', keywords: ['industry', 'domain', 'arabic', 'certification', 'license', 'experience'], skills: [] }
    ];

    for (const [gap] of gaps) {
      const lower = gap.toLowerCase();
      let placed = false;
      for (const cat of categories) {
        if (cat.keywords.some(kw => lower.includes(kw))) {
          cat.skills.push(gap);
          placed = true;
          break;
        }
      }
      if (!placed && categories.length > 0) {
        categories[categories.length - 1].skills.push(gap);
      }
    }

    return categories.filter(c => c.skills.length > 0);
  }

  _render() {
    const topMatches = this._getTopMatches();
    const gaps = this._getSkillGapAnalysis();
    const learningPath = this._buildLearningPath(gaps);
    const maxGap = gaps.length > 0 ? gaps[0][1] : 1;

    const container = el('div', { className: 'career-container' });

    // LEFT: Profile card
    const profile = el('div', { className: 'profile-card' });

    profile.appendChild(el('div', { className: 'profile-name grad-text-2', textContent: 'Mohamed Elrashid' }));
    profile.appendChild(el('div', { className: 'profile-title', textContent: 'IT Officer | AI Researcher' }));

    const details = [
      { label: 'Experience', value: '12+ years in IT & Technology' },
      { label: 'Focus', value: 'AI/ML Research & Implementation' },
      { label: 'Region', value: 'MENA (UAE-based)' },
      { label: 'Education', value: 'Advanced degree holder' }
    ];
    for (const d of details) {
      const row = el('div', { className: 'profile-detail' });
      row.appendChild(el('strong', { textContent: d.label + ': ' }));
      row.appendChild(document.createTextNode(d.value));
      profile.appendChild(row);
    }

    // Core skills from high-matching jobs
    const coreSection = el('div', { className: 'profile-section' });
    coreSection.appendChild(el('div', { className: 'profile-section-title', textContent: 'Core Strengths' }));
    const coreSkills = ['Python', 'AI/ML', 'Data Analysis', 'IT Management', 'Research Methodology', 'Project Management', 'Cloud Computing', 'Database Management'];
    const coreTags = el('div');
    for (const s of coreSkills) {
      coreTags.appendChild(el('span', { className: 'skill-tag have', textContent: s }));
    }
    coreSection.appendChild(coreTags);
    profile.appendChild(coreSection);

    // Top gaps
    const gapSection = el('div', { className: 'profile-section' });
    gapSection.appendChild(el('div', { className: 'profile-section-title', textContent: 'Key Gaps (from top jobs)' }));
    const gapTags = el('div');
    for (const [g] of gaps.slice(0, 6)) {
      gapTags.appendChild(el('span', { className: 'skill-tag gap', textContent: g }));
    }
    gapSection.appendChild(gapTags);
    profile.appendChild(gapSection);

    container.appendChild(profile);

    // RIGHT: Matches, Gap Analysis, Learning Path
    const right = el('div', { className: 'career-right' });

    // Top 10 matches
    const matchSection = el('div');
    matchSection.appendChild(el('div', { className: 'career-section-title grad-text', textContent: 'Top 10 Best-Matching Jobs' }));

    for (const job of topMatches) {
      const score = job.match_score || 0;
      const scoreClass = score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low';

      const card = el('div', { className: 'match-card' });

      const scoreBadge = el('div', { className: `match-score ${scoreClass}`, textContent: String(score) });
      card.appendChild(scoreBadge);

      const info = el('div', { className: 'match-info' });
      info.appendChild(el('div', { className: 'match-title', textContent: job.title }));
      info.appendChild(el('div', { className: 'match-company', textContent: `${job.company} — ${job.location || 'MENA'}` }));

      if (job.skill_gaps && job.skill_gaps.length > 0) {
        const gapsDiv = el('div', { className: 'match-gaps' });
        for (const g of job.skill_gaps.slice(0, 3)) {
          gapsDiv.appendChild(el('span', { className: 'skill-tag gap', textContent: g }));
        }
        if (job.skill_gaps.length > 3) {
          gapsDiv.appendChild(el('span', { className: 'skill-tag', textContent: `+${job.skill_gaps.length - 3} more` }));
        }
        info.appendChild(gapsDiv);
      }

      card.appendChild(info);
      matchSection.appendChild(card);
    }
    right.appendChild(matchSection);

    // Skill gap analysis bar chart
    const gapAnalysis = el('div', { className: 'gap-analysis' });
    gapAnalysis.appendChild(el('div', { className: 'career-section-title grad-text-2', textContent: 'Skill Gap Frequency (Top 20 Jobs)' }));

    for (const [gap, count] of gaps) {
      const pct = (count / maxGap) * 100;
      const fill = el('div', { className: 'gap-fill' });
      fill.style.width = pct + '%';

      gapAnalysis.appendChild(el('div', { className: 'gap-bar-row' }, [
        el('span', { className: 'gap-label', textContent: gap, title: gap }),
        el('div', { className: 'gap-track' }, [fill]),
        el('span', { className: 'gap-count', textContent: String(count) })
      ]));
    }
    right.appendChild(gapAnalysis);

    // Learning path
    const learning = el('div', { className: 'learning-path' });
    learning.appendChild(el('div', { className: 'career-section-title grad-text', textContent: 'Recommended Learning Path' }));

    let stepNum = 1;
    for (const cat of learningPath) {
      const step = el('div', { className: 'learning-step' });
      step.appendChild(el('div', { className: 'step-number', textContent: String(stepNum) }));
      const content = el('div', { className: 'step-content' });
      content.appendChild(el('div', { className: 'step-title', textContent: cat.title }));
      const desc = cat.skills.slice(0, 3).join(', ');
      const extra = cat.skills.length > 3 ? ` (+${cat.skills.length - 3} more)` : '';
      content.appendChild(el('div', { className: 'step-desc', textContent: `Focus areas: ${desc}${extra}` }));
      step.appendChild(content);
      learning.appendChild(step);
      stepNum++;
    }
    right.appendChild(learning);

    container.appendChild(right);
    this.replaceChildren(container);
  }
}

customElements.define('tab-careers', TabCareers);

export { TabCareers };
