// Export utilities — CSV download and clipboard copy

export function exportCSV(jobs) {
  const skip = new Set(['description', 'candidate_seniority', 'candidate_education']);
  const fields = Object.keys(jobs[0]).filter(k => !skip.has(k));

  const escape = v => {
    let s = String(v ?? '');
    // Prevent CSV formula injection
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  const rows = [fields.join(',')];
  for (const job of jobs) {
    rows.push(fields.map(f => escape(job[f])).join(','));
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jobs_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(jobs) {
  const lines = jobs.map(j =>
    `- **${j.title}** | ${j.company} | ${j.location} | [Link](${j.url})`
  );
  const text = lines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied ' + jobs.length + ' jobs to clipboard');
  });
}

function showToast(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', bottom: '20px', right: '20px',
    background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
    color: 'white', padding: '10px 20px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '600', zIndex: '999',
    boxShadow: '0 0 20px rgba(139,92,246,0.4)',
    animation: 'fadeIn 0.3s ease'
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}
