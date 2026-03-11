"""Aggregate normalized job .md files into JSON datasets.

Usage:
    python tools/aggregate_jobs.py              # Reindex: rebuild from .md files
    python tools/aggregate_jobs.py --state      # Also update processing_state.json
"""
import json
import os
import re
import sys
import hashlib
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).parent.parent
JOBS_MD_DIR = ROOT / "analysis" / "jobs"
DATA_DIR = ROOT / "analysis" / "data"
SOURCE_JSON = ROOT / "explorer" / "jobs_extracted.json"

# YAML frontmatter field types for proper parsing
LIST_FIELDS = {
    "required_skills_technical", "required_skills_soft",
    "required_certifications", "tools_technologies",
    "industry_keywords", "benefits", "skill_gaps",
    "key_responsibilities"
}
INT_FIELDS = {"min_years_experience", "max_years_experience", "match_score"}


def parse_yaml_frontmatter(filepath):
    """Parse YAML frontmatter from a markdown file."""
    text = filepath.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return None
    block = m.group(1)
    data = {}
    for line in block.split("\n"):
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, val = line.partition(":")
        key = key.strip()
        val = val.strip()
        if key in LIST_FIELDS:
            # Parse JSON-style arrays: ["a", "b", "c"]
            if val.startswith("["):
                try:
                    data[key] = json.loads(val)
                except json.JSONDecodeError:
                    data[key] = []
            else:
                data[key] = []
        elif key in INT_FIELDS:
            if val == "null" or val == "":
                data[key] = None
            else:
                try:
                    data[key] = int(val)
                except ValueError:
                    data[key] = None
        else:
            # String field — strip quotes
            if val.startswith('"') and val.endswith('"'):
                val = val[1:-1]
            if val == "null":
                val = None
            data[key] = val
    return data


def build_meta_summary(normalized_jobs):
    """Build aggregated statistics from normalized job data."""
    summary = {
        "total_jobs": len(normalized_jobs),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "role_categories": {},
        "career_levels": {},
        "education_requirements": {},
        "compensation_levels": {},
        "growth_potential": {},
        "top_technical_skills": {},
        "top_soft_skills": {},
        "top_tools": {},
        "top_certifications": {},
        "top_industry_keywords": {},
        "top_benefits": {},
        "experience_distribution": {
            "no_requirement": 0,
            "0-2": 0, "3-5": 0, "6-10": 0, "10+": 0
        },
        "match_score_distribution": {
            "high_70_100": [],
            "medium_40_69": [],
            "low_0_39": []
        },
        "skills_by_category": {},
        "locations": {}
    }

    for job in normalized_jobs:
        # Category counts
        cat = job.get("role_category", "Other")
        summary["role_categories"][cat] = summary["role_categories"].get(cat, 0) + 1

        # Career level
        cl = job.get("career_level", "unknown")
        summary["career_levels"][cl] = summary["career_levels"].get(cl, 0) + 1

        # Education
        ed = job.get("required_education", "Any")
        summary["education_requirements"][ed] = summary["education_requirements"].get(ed, 0) + 1

        # Compensation
        comp = job.get("compensation_level", "unspecified")
        summary["compensation_levels"][comp] = summary["compensation_levels"].get(comp, 0) + 1

        # Growth
        gp = job.get("growth_potential", "unknown")
        summary["growth_potential"][gp] = summary["growth_potential"].get(gp, 0) + 1

        # Location
        loc = job.get("location", "Unknown")
        summary["locations"][loc] = summary["locations"].get(loc, 0) + 1

        # Skills frequency
        for skill in job.get("required_skills_technical", []):
            s = skill.strip()
            if s:
                summary["top_technical_skills"][s] = summary["top_technical_skills"].get(s, 0) + 1
        for skill in job.get("required_skills_soft", []):
            s = skill.strip()
            if s:
                summary["top_soft_skills"][s] = summary["top_soft_skills"].get(s, 0) + 1
        for tool in job.get("tools_technologies", []):
            t = tool.strip()
            if t:
                summary["top_tools"][t] = summary["top_tools"].get(t, 0) + 1
        for cert in job.get("required_certifications", []):
            c = cert.strip()
            if c:
                summary["top_certifications"][c] = summary["top_certifications"].get(c, 0) + 1
        for kw in job.get("industry_keywords", []):
            k = kw.strip()
            if k:
                summary["top_industry_keywords"][k] = summary["top_industry_keywords"].get(k, 0) + 1
        for b in job.get("benefits", []):
            b = b.strip()
            if b:
                summary["top_benefits"][b] = summary["top_benefits"].get(b, 0) + 1

        # Experience distribution
        min_exp = job.get("min_years_experience")
        if min_exp is None:
            summary["experience_distribution"]["no_requirement"] += 1
        elif min_exp <= 2:
            summary["experience_distribution"]["0-2"] += 1
        elif min_exp <= 5:
            summary["experience_distribution"]["3-5"] += 1
        elif min_exp <= 10:
            summary["experience_distribution"]["6-10"] += 1
        else:
            summary["experience_distribution"]["10+"] += 1

        # Match score buckets
        score = job.get("match_score", 0) or 0
        entry = {"job_id": job.get("job_id"), "title": job.get("title"), "score": score}
        if score >= 70:
            summary["match_score_distribution"]["high_70_100"].append(entry)
        elif score >= 40:
            summary["match_score_distribution"]["medium_40_69"].append(entry)
        else:
            summary["match_score_distribution"]["low_0_39"].append(entry)

        # Skills by category (for heatmap)
        if cat not in summary["skills_by_category"]:
            summary["skills_by_category"][cat] = {}
        for skill in job.get("required_skills_technical", []):
            s = skill.strip()
            if s:
                summary["skills_by_category"][cat][s] = summary["skills_by_category"][cat].get(s, 0) + 1

    # Sort frequency maps by count (descending)
    for key in ["top_technical_skills", "top_soft_skills", "top_tools",
                "top_certifications", "top_industry_keywords", "top_benefits"]:
        summary[key] = dict(sorted(summary[key].items(), key=lambda x: -x[1]))

    # Sort match score lists
    for bucket in summary["match_score_distribution"]:
        summary["match_score_distribution"][bucket].sort(key=lambda x: -x["score"])

    return summary


def main():
    update_state = "--state" in sys.argv

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Parse all .md files
    normalized = []
    state_jobs = {}
    md_files = sorted(JOBS_MD_DIR.glob("*.md"))
    print(f"Found {len(md_files)} .md files in {JOBS_MD_DIR}")

    for md in md_files:
        data = parse_yaml_frontmatter(md)
        if data:
            normalized.append(data)
            if update_state:
                content_hash = hashlib.md5(md.read_bytes()).hexdigest()[:12]
                state_jobs[data.get("job_id", md.stem)] = {
                    "status": "done",
                    "processed_at": datetime.fromtimestamp(
                        md.stat().st_mtime, tz=timezone.utc
                    ).isoformat(),
                    "md_hash": content_hash
                }
        else:
            print(f"  WARNING: Could not parse frontmatter from {md.name}")
            if update_state:
                state_jobs[md.stem] = {
                    "status": "failed",
                    "error": "no frontmatter",
                    "processed_at": datetime.now(timezone.utc).isoformat()
                }

    # Write jobs_normalized.json
    out_norm = DATA_DIR / "jobs_normalized.json"
    with open(out_norm, "w", encoding="utf-8") as f:
        json.dump(normalized, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(normalized)} jobs to {out_norm}")

    # Build and write meta_summary.json
    summary = build_meta_summary(normalized)
    out_meta = DATA_DIR / "meta_summary.json"
    with open(out_meta, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"Wrote meta summary to {out_meta}")

    # Optionally update processing state
    if update_state:
        source_count = 0
        if SOURCE_JSON.exists():
            with open(SOURCE_JSON, "r", encoding="utf-8") as f:
                source_count = len(json.load(f))
        state = {
            "last_run": datetime.now(timezone.utc).isoformat(),
            "total_in_source": source_count,
            "processed": sum(1 for v in state_jobs.values() if v["status"] == "done"),
            "failed": sum(1 for v in state_jobs.values() if v["status"] == "failed"),
            "jobs": state_jobs
        }
        out_state = DATA_DIR / "processing_state.json"
        with open(out_state, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
        print(f"Wrote processing state to {out_state}")

    # Print quick summary
    print(f"\n--- Quick Stats ---")
    print(f"Total normalized: {len(normalized)}")
    print(f"Role categories: {summary['role_categories']}")
    print(f"Top 5 technical skills: {dict(list(summary['top_technical_skills'].items())[:5])}")
    print(f"Match score high (70+): {len(summary['match_score_distribution']['high_70_100'])}")
    print(f"Match score medium (40-69): {len(summary['match_score_distribution']['medium_40_69'])}")
    print(f"Match score low (0-39): {len(summary['match_score_distribution']['low_0_39'])}")


if __name__ == "__main__":
    main()
