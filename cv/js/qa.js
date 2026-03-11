// qa.js — Easy Apply Q&A tab component

export class TabQA extends HTMLElement {
  constructor() {
    super();
    this.templates = null;
    this.answers = null;
    this.cv = null;
    this.job = null;
  }

  async loadData() {
    if (this.templates && this.answers) return;
    try {
      const [tpl, ans] = await Promise.all([
        fetch('./data/qa-templates.json').then(r => r.json()),
        fetch('./data/qa-answers.json').then(r => r.json())
      ]);
      this.templates = tpl;
      this.answers = ans.answers || {};
    } catch (e) {
      console.error('QA data load error:', e);
    }
  }

  async showJob(cv, job) {
    this.cv = cv;
    this.job = job;
    await this.loadData();
    this.render();
  }

  render() {
    this.textContent = '';
    if (!this.cv || !this.templates) {
      const empty = document.createElement('div');
      empty.className = 'qa-empty';
      empty.textContent = 'Select a job to see Easy Apply Q&A';
      this.appendChild(empty);
      return;
    }

    const jobAnswers = this.answers[this.cv.job_id] || {};
    const questions = this.templates.questions || [];

    const container = document.createElement('div');
    container.className = 'qa-container';

    // Header
    const header = document.createElement('div');
    header.className = 'qa-header';
    const title = document.createElement('div');
    title.className = 'qa-title';
    title.textContent = this.cv.job_title;
    const company = document.createElement('div');
    company.className = 'qa-company';
    company.textContent = this.cv.company;
    header.append(title, company);
    container.appendChild(header);

    // Copy All button
    const copyAllBtn = document.createElement('button');
    copyAllBtn.className = 'qa-copy-all';
    copyAllBtn.textContent = 'Copy All Answers';
    copyAllBtn.addEventListener('click', () => this.copyAll(questions, jobAnswers));
    container.appendChild(copyAllBtn);

    if (questions.length === 0 || Object.keys(jobAnswers).length === 0) {
      const noAns = document.createElement('div');
      noAns.className = 'qa-no-answers';
      noAns.textContent = 'No Q&A answers generated for this job yet.';
      container.appendChild(noAns);
      this.appendChild(container);
      return;
    }

    // Question cards
    questions.forEach(q => {
      const answer = jobAnswers[q.id];
      if (!answer) return;
      const card = this.renderQuestion(q, answer);
      container.appendChild(card);
    });

    this.appendChild(container);
  }

  renderQuestion(q, answer) {
    const card = document.createElement('div');
    card.className = 'qa-card';

    // Question header
    const qHeader = document.createElement('div');
    qHeader.className = 'qa-question-header';

    const qText = document.createElement('div');
    qText.className = 'qa-question-text';
    qText.textContent = q.text;
    qHeader.appendChild(qText);

    if (q.required) {
      const badge = document.createElement('span');
      badge.className = 'qa-required';
      badge.textContent = 'Required';
      qHeader.appendChild(badge);
    }

    if (q.context) {
      const ctx = document.createElement('div');
      ctx.className = 'qa-context';
      ctx.textContent = q.context;
      qHeader.appendChild(ctx);
    }

    card.appendChild(qHeader);

    // Answer
    const answerEl = this.renderAnswer(q.type, answer, q);
    card.appendChild(answerEl);

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'qa-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      const text = this.formatAnswer(q.type, answer);
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1500);
      });
    });
    card.appendChild(copyBtn);

    return card;
  }

  renderAnswer(type, answer, q) {
    const wrap = document.createElement('div');
    wrap.className = 'qa-answer';

    switch (type) {
      case 'boolean': {
        const val = document.createElement('div');
        val.className = 'qa-bool-value ' + (answer.value ? 'qa-yes' : 'qa-no');
        val.textContent = answer.value ? 'Yes' : 'No';
        wrap.appendChild(val);
        break;
      }
      case 'boolean_with_reasoning': {
        const val = document.createElement('div');
        val.className = 'qa-bool-value ' + (answer.value ? 'qa-yes' : 'qa-no');
        val.textContent = answer.value ? 'Yes' : 'No';
        wrap.appendChild(val);
        if (answer.reasoning) {
          const reason = document.createElement('div');
          reason.className = 'qa-reasoning';
          reason.textContent = answer.reasoning;
          wrap.appendChild(reason);
        }
        break;
      }
      case 'salary': {
        const val = document.createElement('div');
        val.className = 'qa-salary-value';
        const currency = q.currency || 'AED';
        val.textContent = `${currency} ${Number(answer.value).toLocaleString()}`;
        wrap.appendChild(val);
        if (answer.reasoning) {
          const reason = document.createElement('div');
          reason.className = 'qa-reasoning';
          reason.textContent = answer.reasoning;
          wrap.appendChild(reason);
        }
        break;
      }
      case 'text': {
        const val = document.createElement('div');
        val.className = 'qa-text-value';
        val.textContent = answer.value;
        wrap.appendChild(val);
        if (answer.reasoning) {
          const reason = document.createElement('div');
          reason.className = 'qa-reasoning';
          reason.textContent = answer.reasoning;
          wrap.appendChild(reason);
        }
        break;
      }
      case 'number': {
        const val = document.createElement('div');
        val.className = 'qa-number-value';
        val.textContent = Number(answer.value).toLocaleString();
        wrap.appendChild(val);
        break;
      }
      case 'select': {
        const val = document.createElement('div');
        val.className = 'qa-select-value';
        val.textContent = answer.value;
        wrap.appendChild(val);
        if (answer.reasoning) {
          const reason = document.createElement('div');
          reason.className = 'qa-reasoning';
          reason.textContent = answer.reasoning;
          wrap.appendChild(reason);
        }
        break;
      }
      default: {
        const val = document.createElement('div');
        val.className = 'qa-text-value';
        val.textContent = String(answer.value);
        wrap.appendChild(val);
      }
    }

    return wrap;
  }

  formatAnswer(type, answer) {
    if (type === 'boolean' || type === 'boolean_with_reasoning') {
      return answer.value ? 'Yes' : 'No';
    }
    if (type === 'salary') {
      return String(answer.value);
    }
    return String(answer.value);
  }

  copyAll(questions, jobAnswers) {
    const lines = questions
      .filter(q => jobAnswers[q.id])
      .map(q => {
        const a = jobAnswers[q.id];
        return `${q.text}\n${this.formatAnswer(q.type, a)}`;
      });
    const text = lines.join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      const btn = this.querySelector('.qa-copy-all');
      if (btn) {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy All Answers'; btn.classList.remove('copied'); }, 1500);
      }
    });
  }
}

customElements.define('tab-qa', TabQA);
