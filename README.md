# Job Market Intelligence Platform

AI-driven analysis of MENA region job market data — combining a job explorer dashboard, meta-analysis with PRISMA methodology, and an academic paper.

**Live site:** [https://elrashid.github.io/job-explorer/](https://elrashid.github.io/job-explorer/)

## What's Inside

### [Explorer](explorer/)
Interactive cyberpunk-themed dashboard for browsing 81 LinkedIn job postings from the MENA region. Filter by role, location, company, and seniority. Track applications and compare positions.

### [Analysis Dashboard](analysis/)
Meta-analysis companion with five tabs:
- **Overview** — Role categories, career levels, education distribution, top skills
- **PRISMA** — Interactive PRISMA flow diagram (Identification → Screening → Eligibility → Included)
- **Skills Matrix** — Heat map of technical skills by role category
- **Career Paths** — Profile match scoring, skill gap analysis, learning recommendations
- **Data Model** — ER diagram of the normalized job data schema

### [Academic Paper](paper/paper.md)
Full research article: *"AI-Driven Analysis of Job Market Demands in the MENA Region: A Systematic Review of LinkedIn Job Postings Using Large Language Models"*

- PRISMA-compliant systematic review methodology
- LLM-based structured extraction from unstructured job descriptions
- 36 APA 7th edition references with BibTeX ([references.bib](paper/references.bib))
- Normalization codebook ([appendices/codebook.md](paper/appendices/codebook.md))

## Project Structure

```
├── index.html                  # Landing page hub
├── explorer/                   # Job explorer dashboard
│   ├── index.html
│   ├── jobs_extracted.json     # Raw extracted data (81 jobs, 28 fields each)
│   └── ...
├── analysis/                   # Meta-analysis dashboard
│   ├── index.html
│   ├── data/
│   │   ├── jobs_normalized.json    # Normalized job data
│   │   ├── meta_summary.json       # Aggregated statistics
│   │   └── processing_state.json   # Pipeline state tracking
│   ├── jobs/                       # 81 per-job .md files (YAML frontmatter)
│   ├── js/                         # Web Components (ES modules)
│   └── css/
├── paper/                      # Academic paper
│   ├── paper.md
│   ├── references.bib
│   └── appendices/
├── tools/
│   ├── extract_jobs.py         # HTML → JSON extraction
│   └── aggregate_jobs.py       # .md frontmatter → JSON aggregates
├── docs/
│   ├── literature-search-criteria.md
│   └── literature-search-results.md
└── linkedin-jobs/              # Raw HTML files (.gitignored)
```

## Data Pipeline

```
linkedin-jobs/*.html
    → tools/extract_jobs.py
        → explorer/jobs_extracted.json
            → Claude Code normalization (per-job .md files)
                → tools/aggregate_jobs.py
                    → analysis/data/jobs_normalized.json
                    → analysis/data/meta_summary.json
```

### Pipeline Modes

| Mode | Command | What it does |
|------|---------|-------------|
| **Resume** | Default | Process only new/unprocessed jobs |
| **Reindex** | `python tools/aggregate_jobs.py` | Rebuild JSON from existing .md files |
| **Full Refresh** | Delete .md files, reprocess all | Re-analyze everything from scratch |

## Key Findings

- **81 jobs** across 9 role categories, 63 employers
- **Top skills:** Python, data analysis, TensorFlow, PyTorch, LangChain
- **Top soft skills:** Communication (62%), Leadership (24%), Collaboration (22%)
- **Career levels:** Senior (30%), Mid (26%), Lead (16%), Executive (15%), Entry (14%)
- **Education:** Bachelor's (59%), Any (22%), Master's (12%), PhD (5%)
- **Geography:** UAE (89%), Qatar (9%), Saudi Arabia (4%)
- **Compensation:** 49% of postings omit salary information

## Tech Stack

- **Frontend:** Vanilla JS, Web Components, ES Modules, CSS custom properties
- **Data extraction:** Python (BeautifulSoup, regex)
- **Normalization:** Claude (LLM-based structured extraction)
- **Aggregation:** Python (JSON processing)
- **Hosting:** GitHub Pages via GitHub Actions

## Author

**Mohamed Elrashid** — IT Officer, AI & GPT Architecture Researcher, UAE

## License

This project is for academic and personal research purposes.
