# Normalization Codebook for LinkedIn Job Posting Analysis

## Version 1.0 | March 2026

This codebook defines the normalization taxonomy used for structured extraction from LinkedIn job postings in the MENA region. It specifies valid values, classification criteria, and coding rules for each field in the normalized schema.

---

## 1. Schema Overview

Each job posting is normalized into 18 primary fields plus 3 derived analytical fields.

| # | Field | Type | Description |
|---|-------|------|-------------|
| 1 | `job_id` | string | LinkedIn unique job posting identifier |
| 2 | `title` | string | Job title as posted |
| 3 | `company` | string | Employer name |
| 4 | `location` | string | Geographic location (City, Emirate/Region, Country) |
| 5 | `role_category` | categorical | Standardized role classification |
| 6 | `required_skills_technical` | list[string] | Technical/hard skills required |
| 7 | `required_skills_soft` | list[string] | Soft/interpersonal skills required |
| 8 | `min_years_experience` | integer or null | Minimum years of experience required |
| 9 | `max_years_experience` | integer or null | Maximum years of experience stated |
| 10 | `required_education` | categorical | Minimum education level required |
| 11 | `required_certifications` | list[string] | Professional certifications required or preferred |
| 12 | `tools_technologies` | list[string] | Specific tools, platforms, and technologies mentioned |
| 13 | `industry_keywords` | list[string] | Industry and domain keywords |
| 14 | `salary_explicit` | string | Explicit salary/compensation text from posting |
| 15 | `salary_range` | string | Normalized salary range |
| 16 | `benefits` | list[string] | Listed benefits and perks |
| 17 | `compensation_level` | categorical | Overall compensation classification |
| 18 | `career_level` | categorical | Seniority/career stage classification |
| 19 | `growth_potential` | categorical | Assessed career growth potential |
| 20 | `match_score` | integer (0-100) | Profile fit score against reference profile |
| 21 | `skill_gaps` | list[string] | Skills/qualifications missing from reference profile |

---

## 2. Role Category Classification

Postings are classified into one of 9 role categories based on the primary function of the role.

| Category | Definition | Examples |
|----------|-----------|----------|
| **AI/ML** | Roles primarily focused on artificial intelligence, machine learning, deep learning, NLP, or computer vision research and engineering | AI Engineer, ML Researcher, NLP Scientist, Data Scientist (AI focus) |
| **IT** | Information technology roles including systems administration, software engineering, DevOps, cybersecurity, and technical support | Systems Administrator, Software Engineer, IT Manager, Technical Support Specialist |
| **Education** | Teaching, academic, and educational administration roles at any level | Professor, Teacher, IB Coordinator, Academic Director, Curriculum Developer |
| **Management** | Non-technical management roles focused on operations, administration, or functional leadership | Office Manager, Alumni Affairs Manager, Operations Director, Program Manager |
| **Research** | Research-focused roles outside of AI/ML, including applied research, research administration, and interdisciplinary research | Research Director, Grants Manager, Research Associate, Policy Researcher |
| **Executive** | C-suite, VP-level, or equivalent strategic leadership positions | CTO, VP of Engineering, Chief Innovation Officer, Managing Director |
| **Engineering** | Non-AI engineering roles including robotics, hardware, mechanical, and civil engineering | Robotics Engineer, Hardware Engineer, Embedded Systems Engineer |
| **Aviation** | Roles specific to the aviation and aerospace industry | Pilot, Flight Operations, Air Traffic Control |
| **Other** | Roles that do not fit neatly into the above categories | Administrative Officer, Fundraising Officer, Content Manager, SEO Specialist |

### Classification Rules

1. If a role spans multiple categories, classify by the **primary function** described in the job title and first paragraph of the description.
2. AI/ML takes precedence over IT when the role is primarily focused on model development, training, or research.
3. Executive takes precedence over other categories when the role is at VP level or above, regardless of domain.
4. Education classification requires the role to be within an educational institution AND focused on teaching or academic functions; IT roles at universities are classified as IT.

---

## 3. Career Level Classification

Career levels are assigned based on explicit seniority indicators and contextual cues.

| Level | Definition | Indicators |
|-------|-----------|------------|
| **entry** | Early career, 0-2 years experience expected | "Junior," "Associate," "Graduate," "Intern," 0-2 years experience, no management responsibility |
| **mid** | Established professional, 3-6 years experience | "Specialist," "Analyst," 3-6 years experience, individual contributor with moderate autonomy |
| **senior** | Experienced professional, 7+ years experience | "Senior," "Principal," 7+ years experience, may mentor others, deep expertise expected |
| **lead** | Team or project leadership with hands-on component | "Lead," "Team Lead," "Head of," manages a small team while still contributing technically |
| **executive** | Strategic leadership, organizational-level impact | "Director," "VP," "Chief," "C-suite," "Managing Director," budget authority, cross-functional scope |

### Classification Rules

1. Explicit title indicators (e.g., "Senior" in the title) take precedence.
2. When title is ambiguous, use years of experience requirements: 0-2 = entry, 3-6 = mid, 7-10 = senior, 10+ = lead/executive.
3. Faculty positions: Assistant Professor = mid, Associate Professor = senior, Full Professor = senior/lead, Department Chair/Dean = executive.
4. When multiple levels are listed (e.g., "Assistant/Associate/Professor"), classify at the midpoint.

---

## 4. Education Requirements

| Level | Definition |
|-------|-----------|
| **Any** | No specific education requirement stated, or the posting explicitly states experience can substitute for formal education |
| **Bachelor's** | Bachelor's degree (or equivalent) required as minimum |
| **Master's** | Master's degree required as minimum; includes MBA |
| **PhD** | Doctoral degree required |
| **Professional License** | Specific professional licensure required in lieu of or in addition to academic degrees (e.g., ATPL for pilots, medical license) |

### Classification Rules

1. Code the **minimum** required education, not preferred.
2. If "Bachelor's required, Master's preferred," code as Bachelor's.
3. If no education is mentioned at all, code as Any.
4. Professional License is used only when a license is the primary credential required, not when certifications are supplementary.

---

## 5. Compensation Level Classification

| Level | Definition | Criteria |
|-------|-----------|----------|
| **unspecified** | No salary or compensation information provided | Posting contains no salary figures, ranges, or qualitative compensation indicators |
| **standard** | Below-market or entry-level compensation | Explicit salary below regional median for the role category; part-time or contract with limited benefits |
| **competitive** | At-market or above-market compensation | Explicit salary at or above regional median; comprehensive benefits package mentioned; "competitive salary" stated |
| **premium** | Significantly above-market compensation | Explicit salary well above regional median; expatriate packages with housing/education allowances; equity/profit-sharing; executive-level total compensation |

### Classification Rules

1. Tax-free salary (standard in UAE/GCC) does not automatically qualify as premium; assess against regional norms.
2. Housing and education allowances push classification upward (standard to competitive, competitive to premium).
3. When no salary is stated but "competitive package" is mentioned with benefits, classify as competitive.
4. When no compensation information is available at all, classify as unspecified.

---

## 6. Growth Potential Assessment

| Level | Definition | Indicators |
|-------|-----------|------------|
| **low** | Limited career advancement opportunities | Part-time role, fixed-term contract, narrow scope, no mention of development opportunities |
| **medium** | Moderate growth opportunities | Standard full-time role, some professional development mentioned, established career path within the organization |
| **high** | Strong growth and advancement potential | Rapidly growing organization, emerging technology domain, explicit mention of career development programs, leadership pipeline, equity/ownership opportunities |

### Classification Rules

1. Assess based on both organizational context (growing company vs. stable bureaucracy) and role characteristics.
2. AI/ML roles at research institutions default to high unless explicitly limited.
3. Executive roles default to medium (already at high seniority) unless at a rapidly scaling organization.

---

## 7. Technical Skills Extraction Guidelines

- Extract skills as stated in the posting, preserving the employer's terminology.
- Separate distinct skills even when listed together (e.g., "Python and R" becomes two entries: "Python", "R").
- Include both required and preferred/desirable skills.
- Do not infer skills not mentioned or implied in the posting.
- Maintain specificity: "TensorFlow" rather than "deep learning framework" when TensorFlow is explicitly named.

---

## 8. Soft Skills Extraction Guidelines

- Extract interpersonal, behavioral, and cognitive skills.
- Common categories: communication, leadership, teamwork/collaboration, problem solving, adaptability, time management, stakeholder management.
- Include language requirements (e.g., "Arabic and English fluency") as soft skills when described as interpersonal competencies.
- Do not duplicate skills that are better classified as technical (e.g., "project management" may be technical or soft depending on context).

---

## 9. Match Score Methodology

The match score (0-100) assesses alignment between a job posting and a reference IT professional profile. The reference profile represents a mid-career IT professional with:

- Bachelor's degree in a technology-related field
- 5-8 years of experience in IT
- Core competencies in systems administration, networking, and general software development
- Working knowledge of cloud computing, databases, and common enterprise tools
- No specialized AI/ML, aviation, or academic research expertise

### Scoring Rubric

| Score Range | Interpretation |
|-------------|---------------|
| 0-20 | Poor fit: role requires fundamentally different qualifications |
| 21-40 | Partial fit: some transferable skills but significant gaps |
| 41-60 | Moderate fit: core skills align with meaningful upskilling needed |
| 61-80 | Good fit: strong alignment with minor gaps |
| 81-100 | Excellent fit: near-complete alignment |

---

## 10. Data Quality Flags

Postings may be flagged for the following data quality issues:

- **Incomplete:** Posting text was truncated or key sections missing
- **Ambiguous:** Role requirements unclear or contradictory
- **Duplicate:** Same position posted multiple times (only first instance retained)
- **Out-of-scope:** Posting location outside MENA region or non-technology-sector role

---

## 11. Post-Processing Notes

- **Case normalization:** The LLM extraction may produce case variants of the same skill (e.g., "Data Analysis" vs. "data analysis"). Post-processing aggregation should be applied for frequency analysis.
- **Deduplication:** Skills that are semantically equivalent but phrased differently (e.g., "ML" and "Machine Learning") should be aggregated in analysis while preserving original extraction in the dataset.
- **Null handling:** Fields with no extractable information are stored as empty strings ("") for string fields, empty lists ([]) for list fields, and null for numeric fields.
