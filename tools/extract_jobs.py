"""Extract structured data from saved LinkedIn job HTML files."""
import re
import html
import json
import csv
from pathlib import Path

ROOT = Path(__file__).parent.parent
JOBS_DIR = ROOT / "linkedin-jobs"
OUTPUT_JSON = ROOT / "explorer" / "jobs_extracted.json"
OUTPUT_CSV = ROOT / "explorer" / "jobs_extracted.csv"


def strip_html(raw):
    """Remove scripts, styles, and tags; return plain text."""
    text = re.sub(r"<script[^>]*>.*?</script>", "", raw, flags=re.DOTALL)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
    text = re.sub(r"<[^>]+>", "\n", text)
    text = html.unescape(text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def get_lines(text):
    """Get non-empty stripped lines from text."""
    return [l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 1]


def extract_description(raw):
    """Extract job description from HTML, preserving structure."""
    idx = raw.lower().find("about the job")
    if idx == -1:
        return ""
    chunk = raw[idx : idx + 30000]
    end = re.search(
        r'(?:Show less|Show more|<footer|"similar-jobs"|"right-rail")', chunk
    )
    if end:
        chunk = chunk[: end.start()]
    chunk = re.sub(r"<br\s*/?>", "\n", chunk)
    chunk = re.sub(r"<li[^>]*>", "\n- ", chunk)
    chunk = re.sub(r"</p>", "\n\n", chunk)
    chunk = re.sub(r"<[^>]+>", "", chunk)
    chunk = html.unescape(chunk)
    chunk = re.sub(r"[ \t]+", " ", chunk)
    chunk = re.sub(r"\n{3,}", "\n\n", chunk)
    return chunk.strip()


def extract_candidate_insights(lines):
    """Extract candidate competition data."""
    total_applicants = ""
    seniority_breakdown = {}
    education_breakdown = {}

    for i, line in enumerate(lines):
        # Total candidates
        m = re.match(r"^(\d[\d,]*)$", line)
        if m and i + 1 < len(lines) and "total" in lines[i + 1].lower():
            total_applicants = m.group(1)

        # Seniority breakdown: "46% Senior level candidates"
        m = re.match(r"(\d+)%\s+(Senior|Entry|Director|Manager|Executive|Mid-Senior|Associate)\s+level\s+candidates", line, re.IGNORECASE)
        if m:
            seniority_breakdown[m.group(2) + " level"] = int(m.group(1))

        # Education breakdown: "have a Bachelor's Degree"
        if re.search(r"have a .+ Degree|have a Master of|have other degrees", line, re.IGNORECASE):
            if i > 0:
                pct_match = re.match(r"(\d+)%", lines[i - 1])
                if pct_match:
                    degree = re.sub(r"^have (a |an )?", "", line, flags=re.IGNORECASE).strip()
                    education_breakdown[degree] = int(pct_match.group(1))

    return total_applicants, seniority_breakdown, education_breakdown


def extract_company_info(lines):
    """Extract company section data."""
    followers = ""
    industry = ""
    company_size = ""
    employees_on_linkedin = ""
    company_description = ""
    total_employees = ""
    growth_2yr = ""
    median_tenure = ""

    for i, line in enumerate(lines):
        # Followers: "5,140,573 followers"
        m = re.search(r"([\d,]+)\s+followers", line)
        if m:
            followers = m.group(1)

        # Industry line (right after followers)
        if "followers" in line and i + 2 < len(lines):
            next_line = lines[i + 2] if lines[i + 1].lower() == "follow" else lines[i + 1]
            if not re.search(r"followers|follow|employees|\d+\+", next_line, re.IGNORECASE):
                industry = next_line

        # Company size: "10001+ employees" or "51-200 employees"
        m = re.search(r"([\d,]+-?[\d,]*\+?)\s+employees", line)
        if m and "on LinkedIn" not in line:
            company_size = m.group(1) + " employees"

        # On LinkedIn: "69,570 on LinkedIn"
        m = re.search(r"([\d,]+)\s+on LinkedIn", line)
        if m:
            employees_on_linkedin = m.group(1)

        # Total employees
        if line.lower() == "total employees" and i > 0:
            total_employees = lines[i - 1].replace(",", "").strip()

        # 2-year growth
        if "2 year growth" in line.lower() and i > 0:
            gm = re.match(r"(\d+)%", lines[i - 1])
            if gm and not growth_2yr:
                growth_2yr = gm.group(1) + "%"

        # Median tenure
        m = re.search(r"Median employee tenure", line, re.IGNORECASE)
        if m and i + 1 < len(lines):
            median_tenure = lines[i + 1] if "year" in lines[i + 1].lower() else ""
        # Also check same line pattern
        m2 = re.search(r"(\d+\.?\d*)\s+years?", line)
        if m2 and i > 0 and "tenure" in lines[i - 1].lower():
            median_tenure = m2.group(0)

    return {
        "followers": followers,
        "industry": industry,
        "company_size": company_size,
        "employees_on_linkedin": employees_on_linkedin,
        "total_employees": total_employees,
        "growth_2yr": growth_2yr,
        "median_tenure": median_tenure,
    }


def extract_leadership_role(lines):
    """Extract leadership role flag."""
    for i, line in enumerate(lines):
        if line.lower().startswith("leadership role"):
            if i + 1 < len(lines):
                val = lines[i + 1].strip().upper()
                if val in ("YES", "NO"):
                    return val
    return ""


def extract_salary_benefits(lines):
    """Extract salary/benefits section text."""
    capture = False
    result = []
    for line in lines:
        if re.search(r"^Salary\s*[&]\s*benefits", line, re.IGNORECASE):
            capture = True
            continue
        if capture:
            if re.search(r"^(Set alert|See how you compare|more)$", line):
                break
            result.append(line)
    return " ".join(result).strip()[:500] if result else ""


def extract_job(filepath):
    """Extract all available fields from a single LinkedIn job HTML file."""
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()

    text = strip_html(raw)
    fname = filepath.stem
    lines = get_lines(text)

    # Job ID from filename
    job_id_match = re.match(r"(\d+)", fname)
    job_id = job_id_match.group(1) if job_id_match else ""

    # Title & Company from <title> tag
    title_match = re.search(r"<title>(.*?)</title>", raw)
    title_text = html.unescape(title_match.group(1)) if title_match else ""
    parts = [p.strip() for p in title_text.split("|")]
    job_title = parts[0] if parts else ""
    company = parts[1] if len(parts) > 1 else ""

    # Company from aria-label as fallback
    if not company:
        aria = re.search(r'aria-label="Company,\s*([^"]+)"', raw)
        if aria:
            company = html.unescape(aria.group(1)).strip().rstrip(".")

    # Location - find the "X ago" line, location is the line just before it
    location = ""
    for i, line in enumerate(lines[:50]):
        if re.search(r"^\d+\s+(?:day|week|month|hour|minute)s?\s+ago$", line) or \
           re.search(r"^Reposted\s+\d+\s+(?:day|week|month|hour|minute)s?\s+ago$", line):
            if i > 0 and len(lines[i - 1]) < 100:
                location = lines[i - 1]
            break

    # Employment type
    emp_match = re.search(r"\b(Full-time|Part-time|Contract|Temporary|Internship|Volunteer|Freelance)\b", text, re.IGNORECASE)
    employment_type = emp_match.group(0) if emp_match else ""

    # Work mode
    mode_match = re.search(r"\b(On-site|Remote|Hybrid)\b", text, re.IGNORECASE)
    work_mode = mode_match.group(0) if mode_match else ""

    # Posted date
    posted_match = re.search(r"(?:Reposted\s+)?(\d+\s+(?:day|week|month|hour|minute)s?\s+ago)", text, re.IGNORECASE)
    posted = posted_match.group(0) if posted_match else ""

    # Applicants (from header)
    app_match = re.search(r"(?:Over\s+)?(\d+[\d,]*)\s+(?:people clicked apply|applicants?)", text, re.IGNORECASE)
    applicants = app_match.group(0) if app_match else ""

    # Easy Apply
    easy_apply = bool(re.search(r"Easy Apply", text))

    # Promoted by hirer
    promoted = bool(re.search(r"Promoted by hirer", text))

    # Responses managed off LinkedIn
    off_linkedin = bool(re.search(r"Responses managed off LinkedIn", text))

    # Seniority
    seniority = ""
    sen_match = re.search(r"\b(Entry[- ]level|Associate|Mid-Senior level|Director|Executive|Internship|Senior|Junior|Lead|Manager|Principal)\b", text, re.IGNORECASE)
    if sen_match:
        seniority = sen_match.group(0)

    # Salary from text
    salary = ""
    sal_match = re.search(r"[\$€£]\s?[\d,]+(?:\s*[-–]\s*[\$€£]?\s?[\d,]+)?(?:\s*/\s*(?:yr|year|month|hr|hour))?", text)
    if sal_match:
        salary = sal_match.group(0)

    # Leadership role
    leadership_role = extract_leadership_role(lines)

    # Salary & benefits section
    salary_benefits = extract_salary_benefits(lines)

    # Job description
    description = extract_description(raw)

    # Candidate insights
    total_candidates, seniority_breakdown, education_breakdown = extract_candidate_insights(lines)

    # Company info
    company_info = extract_company_info(lines)

    # LinkedIn URL
    url = f"https://www.linkedin.com/jobs/view/{job_id}" if job_id else ""

    return {
        "job_id": job_id,
        "title": job_title,
        "company": company,
        "location": location,
        "employment_type": employment_type,
        "work_mode": work_mode,
        "posted": posted,
        "applicants": applicants,
        "easy_apply": easy_apply,
        "promoted": promoted,
        "off_linkedin_apply": off_linkedin,
        "seniority": seniority,
        "leadership_role": leadership_role,
        "salary": salary,
        "salary_benefits": salary_benefits,
        "url": url,
        "total_candidates": total_candidates,
        "candidate_seniority": seniority_breakdown,
        "candidate_education": education_breakdown,
        "company_industry": company_info["industry"],
        "company_size": company_info["company_size"],
        "company_followers": company_info["followers"],
        "company_employees_linkedin": company_info["employees_on_linkedin"],
        "company_total_employees": company_info["total_employees"],
        "company_growth_2yr": company_info["growth_2yr"],
        "company_median_tenure": company_info["median_tenure"],
        "description": description[:5000] if description else "",
        "has_full_description": bool(description),
    }


def main():
    jobs = []
    for fpath in sorted(JOBS_DIR.glob("*.html")):
        print(f"Processing: {fpath.name[:80]}")
        job = extract_job(fpath)
        jobs.append(job)
        print(f"  {job['title'][:60]}")
        print(f"  {job['company']} | {job['location']}")
        print(f"  {job['employment_type']} {job['work_mode']} | {job['posted']} | {job['applicants']}")
        print(f"  EasyApply={job['easy_apply']} | Promoted={job['promoted']} | Leadership={job['leadership_role']}")
        print(f"  Total candidates: {job['total_candidates']} | Seniority: {job['candidate_seniority']}")
        print(f"  Education: {job['candidate_education']}")
        print(f"  Company: {job['company_industry']} | {job['company_size']} | {job['company_followers']} followers")
        print(f"  Growth: {job['company_growth_2yr']} | Tenure: {job['company_median_tenure']}")
        print(f"  Salary: {job['salary']} | Benefits: {job['salary_benefits'][:80]}")
        print(f"  Description: {'YES' if job['has_full_description'] else 'NO (not loaded)'}")
        print()

    # Save JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(jobs)} jobs to {OUTPUT_JSON.name}")

    # Save CSV (flat fields only, skip nested dicts)
    if jobs:
        skip = {"description", "candidate_seniority", "candidate_education"}
        fields = [k for k in jobs[0] if k not in skip]
        with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            for job in jobs:
                row = {k: v for k, v in job.items() if k not in skip}
                writer.writerow(row)
        print(f"Saved summary CSV to {OUTPUT_CSV.name}")


if __name__ == "__main__":
    main()
