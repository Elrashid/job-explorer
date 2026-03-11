// Match Score Engine — configurable weights, stored in localStorage
const STORAGE_KEY = 'job-explorer-prefs';

const DEFAULTS = {
  preferredLocations: [],
  workMode: '',        // '' = no preference, 'On-site', 'Hybrid', 'Remote'
  maxCompetition: 5000,
  companySize: '',     // '' = no preference, 'small', 'medium', 'large'
  locationWeight: 30,
  modeWeight: 20,
  competitionWeight: 25,
  sizeWeight: 25,
};

export function loadPrefs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...DEFAULTS };
    const parsed = JSON.parse(saved);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return { ...DEFAULTS };
    return { ...DEFAULTS, ...parsed };
  } catch { return { ...DEFAULTS }; }
}

export function savePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function getDefaults() { return { ...DEFAULTS }; }

function parseNum(s) {
  if (!s) return 0;
  return parseInt(String(s).replace(/,/g, '')) || 0;
}

function extractCity(location) {
  if (!location) return '';
  const parts = location.split(',');
  return parts[0].trim();
}

function companyBucket(size) {
  if (!size) return 'unknown';
  const m = size.match(/(\d+)/);
  if (!m) return 'unknown';
  const n = parseInt(m[1]);
  if (n <= 500) return 'small';
  if (n <= 5000) return 'medium';
  return 'large';
}

export function scoreJob(job, prefs) {
  let total = 0;
  let maxTotal = 0;

  // Location score
  if (prefs.preferredLocations.length > 0) {
    const city = extractCity(job.location).toLowerCase();
    const match = prefs.preferredLocations.some(loc =>
      city.includes(loc.toLowerCase()) || loc.toLowerCase().includes(city)
    );
    total += match ? prefs.locationWeight : 0;
  } else {
    total += prefs.locationWeight; // No preference = full score
  }
  maxTotal += prefs.locationWeight;

  // Work mode score
  if (prefs.workMode) {
    total += (job.work_mode === prefs.workMode) ? prefs.modeWeight : 0;
  } else {
    total += prefs.modeWeight;
  }
  maxTotal += prefs.modeWeight;

  // Competition score (lower is better)
  const candidates = parseNum(job.total_candidates);
  if (candidates > 0 && prefs.maxCompetition > 0) {
    const ratio = Math.max(0, 1 - (candidates / prefs.maxCompetition));
    total += ratio * prefs.competitionWeight;
  } else {
    total += prefs.competitionWeight;
  }
  maxTotal += prefs.competitionWeight;

  // Company size score
  if (prefs.companySize) {
    total += (companyBucket(job.company_size) === prefs.companySize) ? prefs.sizeWeight : 0;
  } else {
    total += prefs.sizeWeight;
  }
  maxTotal += prefs.sizeWeight;

  return maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 50;
}

export function scoreBadgeClass(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'mid';
  return 'low';
}

export function competitionHeat(job) {
  const n = parseNum(job.total_candidates);
  if (n < 500) return 'low';
  if (n < 2000) return 'mid';
  return 'high';
}

export function extractAllCities(jobs) {
  const cities = new Map();
  for (const j of jobs) {
    const city = extractCity(j.location);
    if (city && city !== 'United Arab Emirates') {
      cities.set(city, (cities.get(city) || 0) + 1);
    }
  }
  return cities;
}

export { extractCity, parseNum };
