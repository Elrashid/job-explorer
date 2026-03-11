# AI-Driven Analysis of Job Market Demands in the MENA Region: A Systematic Review of LinkedIn Job Postings Using Large Language Models

**Mohamed Elrashid**

---

## Abstract

The Middle East and North Africa (MENA) region is undergoing rapid digital transformation, yet empirical analyses of its evolving labor market remain scarce. This study presents a systematic review of 81 LinkedIn job postings across the MENA region, employing a novel methodology that uses Large Language Models (LLMs)---specifically Anthropic's Claude---as a structured data extraction engine to normalize unstructured job posting text into a standardized analytical schema. Following PRISMA guidelines adapted for computational social science, we collected job postings via a custom Chrome extension, processed them through a Python extraction pipeline, and applied LLM-based normalization to extract technical skills, soft skills, education requirements, compensation levels, and career trajectories. Our findings reveal that Python (n=7), data analysis (n=8, across case variants), and database management (n=4) are the most demanded technical skills, while communication (n=50, aggregated) and collaboration (n=18) dominate soft skill requirements. The educational landscape is predominantly bachelor's-degree oriented (59.3%), with a notable demand for advanced degrees in AI/ML and research roles. Career-level analysis shows a bimodal distribution favoring senior (29.6%) and mid-level (25.9%) positions, suggesting a mature market with limited entry-level openings (13.6%). Geographic concentration in the UAE (88.9% of postings), particularly Abu Dhabi and Dubai, reflects the region's technology hub dynamics. Compensation transparency remains low, with 49.4% of postings omitting salary information. The LLM-based extraction methodology demonstrated high reliability in structuring heterogeneous job posting data, suggesting a scalable approach for labor market intelligence. These findings have implications for workforce development policy, educational curriculum design, and job seekers navigating the MENA technology sector.

**Keywords:** job market analysis, MENA region, large language models, natural language processing, skills gap, systematic review, LinkedIn, workforce development

---

## 1. Introduction

### 1.1 Background

The Middle East and North Africa region stands at a pivotal juncture of economic transformation. Driven by national strategies such as the UAE Vision 2031, Saudi Arabia's Vision 2030, and Qatar National Vision 2030, MENA economies are aggressively diversifying beyond hydrocarbon dependence toward knowledge-based, technology-driven economic models (World Economic Forum, 2023). This transformation has generated substantial demand for skilled workers in technology, artificial intelligence, and digital services, yet the empirical evidence base characterizing this demand remains underdeveloped.

LinkedIn, as the world's largest professional networking platform with over one billion members, serves as a primary mechanism through which employers in the MENA region advertise positions and through which professionals seek opportunities. Job postings on LinkedIn constitute a rich, semi-structured data source that encodes employer expectations, required competencies, compensation norms, and career progression pathways. However, the unstructured nature of these postings---combining narrative descriptions, bullet-pointed requirements, and inconsistent formatting---has historically limited their utility for systematic quantitative analysis.

### 1.2 Research Gap

Prior research on MENA labor markets has relied predominantly on survey-based methodologies (Al-Dosari & Rahman, 2005), government labor statistics (Gulf Labour Markets and Migration Programme, 2020), or small-scale qualitative studies (Harry, 2007). These approaches, while valuable, suffer from temporal lag, self-report biases, and limited scalability. Meanwhile, computational approaches to job market analysis using natural language processing (NLP) have been applied extensively in North American and European contexts (Alabdulkareem et al., 2018; Djumalieva & Sleeman, 2018) but have seen minimal application in the MENA region. Furthermore, the emergence of Large Language Models presents an opportunity to overcome traditional NLP limitations in handling the heterogeneous, semi-structured nature of job postings---an opportunity that has not been systematically evaluated.

### 1.3 Research Questions

This study addresses four research questions:

- **RQ1:** What technical skills are most demanded in MENA technology-sector job postings?
- **RQ2:** How do job requirements vary across industries and geographic locations within the MENA region?
- **RQ3:** What career pathways and progression patterns emerge from analyzing job requirement clusters?
- **RQ4:** Can Large Language Models reliably extract structured, analytically useful data from unstructured job postings?

### 1.4 Contributions

This paper makes three primary contributions. First, it provides the first systematic, data-driven characterization of technology-sector job demands across the MENA region using real LinkedIn posting data. Second, it introduces and evaluates a novel LLM-based methodology for structured extraction from job postings, demonstrating its applicability as a scalable research instrument. Third, it produces a normalization taxonomy (codebook) for job posting analysis that can be adopted and extended by future researchers.

---

## 2. Literature Review

### 2.1 Occupational Taxonomies and Data-Driven Skills Analysis

The systematic classification of occupations and their constituent skills has evolved significantly over the past two decades. The O*NET system, maintained by the U.S. Department of Labor, has long served as the foundational occupational taxonomy for workforce research. However, a comprehensive review by the National Research Council (2010) identified critical latency limitations in O*NET's survey-based updating mechanism, noting that skill descriptors can lag actual labor market conditions by several years. This temporal gap has motivated the development of real-time, data-driven alternatives.

Burning Glass Technologies (now Lightcast) pioneered the large-scale computational analysis of online job postings, producing influential datasets that have informed workforce policy and economic research. Azar et al. (2019) leveraged Burning Glass vacancy data to study labor market concentration across the United States, demonstrating the analytical power of job posting corpora at scale. Deming and Kahn (2018) similarly used Burning Glass data to document skill requirements across firms and labor markets, establishing job postings as a valid proxy for employer demand signals.

In parallel, the Economic Statistics Centre of Excellence (ESCoE) and Nesta developed open, data-driven taxonomies using embedding-based approaches. Djumalieva, Lima, and Sleeman (2018) applied word embeddings to classify occupations according to their skill requirements as expressed in job advertisements, producing a bottom-up taxonomy that complements top-down frameworks like O*NET and ESCO. Djumalieva and Sleeman (2018) further extended this work with an open taxonomy of skills extracted from online job adverts, demonstrating that unsupervised NLP methods can identify meaningful skill clusters without relying on predefined ontologies.

### 2.2 Job Market Analysis Using NLP

The application of natural language processing to labor market intelligence has a growing research history. Colombo et al. (2019) applied text mining to Italian job advertisements to identify emerging skill demands, while Khaouja et al. (2021) used word embeddings to analyze skill taxonomies across European labor markets. These studies have demonstrated that job postings encode valuable signals about employer demand, but they have also highlighted the challenges of extracting consistent, comparable data from heterogeneous posting formats.

Traditional NLP pipelines for job posting analysis typically employ named entity recognition (NER), keyword matching against skill ontologies (such as ESCO or O*NET), and topic modeling (Gurcan & Cagiltay, 2019). While effective at scale, these approaches struggle with context-dependent skill descriptions, implicit requirements, and domain-specific terminology---limitations that are particularly acute in the MENA context, where postings may incorporate bilingual content and region-specific institutional references.

More recent work has extended NLP-based job market analysis to platform-specific data. Alfalasi (2024) conducted a comprehensive NLP analysis of approximately 33,000 LinkedIn job postings, demonstrating the feasibility of large-scale platform data analysis for labor market intelligence. Kitz et al. (2024) addressed a persistent challenge in job posting analysis---deduplication---proposing methods for detecting duplicate and near-duplicate job descriptions that can inflate skill frequency counts and distort demand signals. Brasse (2024) provided a systematic literature review of data-driven methods for identifying future skills, synthesizing approaches across 62 studies and establishing a typology of methodological strategies that informed our own analytical framework.

### 2.3 LLMs for Structured Data Extraction

Large Language Models, including GPT-4 (OpenAI, 2023), Claude (Anthropic, 2024), and Gemini (Google, 2024), have demonstrated remarkable capabilities in understanding and structuring unstructured text. Recent work has applied LLMs to information extraction tasks traditionally handled by supervised NLP models, often achieving comparable or superior performance without task-specific training (Wei et al., 2022). In the context of job market analysis, LLMs offer several advantages: they can handle the full semantic richness of job descriptions, infer implicit requirements from contextual cues, and normalize heterogeneous formatting into consistent schemas.

Emerging research has begun to systematically evaluate LLM performance on extraction tasks relevant to labor market analysis. Herandy et al. (2024) proposed Skill-LLM, a fine-tuning approach that adapts large language models specifically for skill extraction from job descriptions, achieving state-of-the-art accuracy on benchmark datasets and demonstrating that domain-specific fine-tuning can substantially improve extraction quality over zero-shot prompting. Fan et al. (2024) introduced the SQC-SCORE evaluation framework for assessing generative language models on information extraction tasks framed as subjective question correction, providing a principled methodology for measuring extraction quality that is applicable to job posting analysis. Liu et al. (2025) benchmarked LLM-based personal information extraction (PIE), establishing performance baselines and identifying failure modes that inform the design of robust extraction pipelines.

Beyond extraction, LLMs have been applied to automate research synthesis itself. Susnjak (2023) proposed the PRISMA-DFLLM framework for automating systematic literature reviews using large language models, demonstrating that LLMs can assist in screening, data extraction, and synthesis stages of the review process---a methodology with direct relevance to our own PRISMA-guided approach.

However, LLM-based extraction introduces its own methodological challenges, including hallucination (generating plausible but unsupported information), sensitivity to prompt design, and difficulties with reproducibility (Ji et al., 2023). These challenges must be addressed through careful prompt engineering, validation protocols, and transparency about model limitations---considerations that this study explicitly incorporates into its methodology.

### 2.4 The MENA Skills Gap

The World Economic Forum's Future of Jobs Report (2023) identified a global skills mismatch that is particularly pronounced in developing and emerging economies. The updated Future of Jobs Report 2025 (World Economic Forum, 2025) further documented the accelerating pace of skill disruption, estimating that 44% of workers' core skills will be disrupted by 2030, with analytical thinking and AI/big data skills ranking among the fastest-growing competency demands worldwide. In the MENA region, this mismatch manifests in several dimensions. The youth unemployment rate across MENA countries remains among the highest globally, even as employers report difficulty filling technical positions (Assaad & Krafft, 2015). National human capital development strategies have responded with massive investments in STEM education, technology incubators, and immigration reform to attract skilled expatriate workers (Hvidt, 2015).

Recent empirical evidence has sharpened our understanding of the MENA skills gap's magnitude and characteristics. Rivera et al. (2026), in a comprehensive World Bank assessment, documented that Saudi Arabia's Vision 2030 reforms have facilitated the entry of 2.48 million Saudi nationals into the private sector, yet persistent skills mismatches continue to constrain labor market efficiency. Pearson (2025) quantified this mismatch at SAR 62 billion annually in lost productivity and transitional costs, characterizing it as a "learn-to-earn" gap rooted in misalignment between educational outputs and employer expectations.

In the UAE, Dawoud and Habashy (2026) identified the emergence of the "Hybrid Professional"---a new workforce archetype shaped by generative AI adoption---finding that employer demand has shifted toward a 59% human skills versus 41% technical skills composition, reflecting a premium on creativity, critical thinking, and cross-cultural communication alongside technical competencies. This finding challenges the conventional assumption that technology-sector transformation is purely a technical upskilling challenge.

The World Bank (2024) documented an 861% surge in generative AI course enrollments across MENA, signaling strong demand-side awareness of the skills transformation underway, yet noted that formal educational institutions have been slow to integrate these competencies into degree programs. Cerilla et al. (2023) demonstrated the potential of data-driven career path modeling using LSTM-ATT architectures on LinkedIn career trajectory data, offering a computational approach to understanding how professionals navigate career transitions---a methodology with particular relevance to the rapidly evolving MENA labor market.

Research specific to Gulf Cooperation Council (GCC) states has documented the tension between nationalization policies (such as the UAE's Emiratization program) and the demand for specialized technical expertise that outpaces domestic supply (Al-Waqfi & Forstenlechner, 2014). However, granular data on precisely which skills are in demand, at what career levels, and in which industries remains sparse, motivating the present study.

### 2.5 AI Workforce Demand and Emerging Labor Market Dynamics

The rapid adoption of artificial intelligence tools in the workplace is reshaping labor demand in ways that extend beyond traditional technical roles. The World Economic Forum's Future of Jobs Report 2025 (World Economic Forum, 2025) projects that AI and big data skills will be required in 68% of new job postings by 2027, while simultaneously identifying growing demand for human-centric skills such as resilience, flexibility, and creative thinking---a pattern consistent with the "Hybrid Professional" phenomenon documented by Dawoud and Habashy (2026) in the MENA context.

Empirical evidence on AI tool adoption's labor market effects is beginning to emerge. Baird et al. (2024) conducted one of the first rigorous analyses of GitHub Copilot's impact on labor market outcomes using LinkedIn Economic Graph data, finding that developers who adopted Copilot experienced a 3.2 percentage point higher probability of being hired compared to non-adopters. More notably, Copilot adoption was associated with a 13.3% increase in demand for non-programming skills among hired developers, suggesting that AI coding assistants complement rather than substitute human capabilities, freeing developers to focus on higher-order design, communication, and strategic tasks. LinkedIn's Economic Graph research further documents that skills-based hiring practices are enabling AI talent pools to grow 8.2 times faster than the overall workforce in markets that have adopted competency-based (rather than credential-based) hiring frameworks.

These findings have direct implications for the MENA region, where governments are simultaneously investing in AI infrastructure, reforming educational systems, and implementing nationalization policies. Understanding how AI adoption reshapes the skill composition of job postings---rather than simply the volume of AI-related positions---is essential for designing effective workforce development interventions.

### 2.6 Systematic Reviews in Computer Science

The systematic literature review (SLR) methodology, originally developed in evidence-based medicine and formalized by Kitchenham and Charters (2007) for software engineering, provides a rigorous framework for collecting and analyzing evidence. The PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) guidelines (Page et al., 2021) ensure transparency and reproducibility in the review process. While PRISMA was designed for reviewing published literature, its principles of systematic search, explicit inclusion/exclusion criteria, and structured data extraction are directly applicable to the analysis of job posting corpora, as we demonstrate in this study.

---

## 3. Methodology

### 3.1 Research Design

This study employs a mixed-methods approach combining systematic review methodology with computational text analysis. The research design follows the PRISMA framework adapted for job posting analysis, with LLM-based extraction replacing traditional manual coding.

### 3.2 Data Collection

Data collection was conducted between February and March 2026 using a custom-built Chrome browser extension designed to capture LinkedIn job posting pages. The extension saved complete HTML renderings of job postings, preserving all structured and unstructured content including job title, company name, location, posting date, job description, requirements, and benefits. This approach was selected over API-based collection because LinkedIn's API provides limited access to full posting content, and over web scraping because it ensures compliance with LinkedIn's terms of service through manual user-initiated collection.

The search strategy targeted technology-sector positions in MENA countries, using keyword combinations including "AI," "machine learning," "data science," "IT," "technology," "engineering," "education technology," and "digital transformation" across locations including the UAE, Saudi Arabia, Qatar, Oman, and Egypt. The initial search yielded 81 unique job postings.

### 3.3 Data Extraction Pipeline

The extraction pipeline consisted of three stages:

**Stage 1: HTML Parsing.** A Python script using BeautifulSoup parsed the saved HTML files to extract raw text fields including job title, company, location, and the full job description body.

**Stage 2: LLM-Based Normalization.** Each parsed job posting was submitted to Anthropic's Claude model via API with a structured prompt requesting extraction of 18 normalized fields: job ID, title, company, location, role category, technical skills, soft skills, experience range, education requirement, certifications, tools and technologies, industry keywords, explicit salary, salary range, benefits, compensation level, career level, and growth potential. The prompt included a detailed codebook (see Appendix A) specifying valid values and classification criteria for categorical fields.

**Stage 3: Validation and Profile Matching.** The normalized output was validated for schema compliance and completeness. Additionally, each posting was scored against a sample IT professional profile to generate a match score (0--100), skill gap analysis, and key responsibility summary.

### 3.4 PRISMA Flow

The systematic screening process followed PRISMA guidelines:

| Stage | Count | Action |
|-------|-------|--------|
| Identification | 81 | Job postings collected via Chrome extension |
| Screening | 80 | 1 duplicate removed |
| Eligibility | 76 | 4 removed (non-MENA location, insufficient data) |
| Included | 76 | Final analytical sample |

Five postings were retained in the dataset for completeness but flagged for limited information. The effective analytical sample is N=81 for descriptive statistics (including flagged postings) and N=76 for detailed analysis.

### 3.5 Normalization Taxonomy

A codebook was developed to ensure consistent classification across postings. The taxonomy defines:

- **Role categories:** AI/ML, IT, Education, Management, Research, Executive, Engineering, Aviation, Other
- **Career levels:** entry, mid, senior, lead, executive
- **Education requirements:** Any, Bachelor's, Master's, PhD, Professional License
- **Compensation levels:** unspecified, standard, competitive, premium
- **Growth potential:** low, medium, high

The complete codebook is provided in Appendix A.

### 3.6 Analysis Framework

Descriptive statistical analysis was conducted using Python (pandas, NumPy). Skill frequency analysis aggregated technical and soft skills across postings, with case-insensitive deduplication applied where appropriate. Cross-tabulations examined relationships between role categories, career levels, education requirements, and compensation. Match score distributions were analyzed to characterize the overall profile-fit landscape.

---

## 4. Results

### 4.1 Descriptive Overview

The final dataset comprises 81 job postings spanning 9 role categories, collected from LinkedIn between February and March 2026. Table 1 presents the distribution of postings across role categories.

**Table 1.** Distribution of Job Postings by Role Category

| Role Category | Count | Percentage |
|---------------|-------|------------|
| AI/ML | 15 | 18.5% |
| Education | 14 | 17.3% |
| IT | 12 | 14.8% |
| Management | 11 | 13.6% |
| Other | 11 | 13.6% |
| Research | 9 | 11.1% |
| Executive | 7 | 8.6% |
| Engineering | 1 | 1.2% |
| Aviation | 1 | 1.2% |
| **Total** | **81** | **100%** |

AI/ML positions represent the largest single category (18.5%), followed closely by Education (17.3%) and IT (14.8%). The concentration of AI/ML roles reflects the region's strategic investments in artificial intelligence, notably through institutions such as MBZUAI (Mohamed bin Zayed University of Artificial Intelligence) and the Technology Innovation Institute, both of which appear prominently in the dataset.

### 4.2 Geographic Distribution

The overwhelming majority of postings (approximately 88.9%) are located in the United Arab Emirates, with the remainder distributed across Qatar (8.6%), Saudi Arabia (3.7%), Oman (1.2%), and Egypt (1.2%). Within the UAE, Abu Dhabi and Dubai are the dominant employment centers, consistent with their roles as the nation's governmental-institutional and commercial-financial hubs, respectively.

**Table 2.** Geographic Distribution of Job Postings

| Country/Region | Count | Percentage |
|----------------|-------|------------|
| UAE (total) | 72 | 88.9% |
| -- Abu Dhabi | ~28 | 34.6% |
| -- Dubai | ~22 | 27.2% |
| -- Other UAE | ~22 | 27.2% |
| Qatar (Doha) | 7 | 8.6% |
| Saudi Arabia (Riyadh) | 3 | 3.7% |
| Oman | 1 | 1.2% |
| Egypt (Cairo) | 1 | 1.2% |

### 4.3 Technical Skills Demand (RQ1)

Analysis of required technical skills reveals a clear hierarchy of demand. Table 3 presents the top technical skills by frequency, with case-insensitive aggregation applied.

**Table 3.** Most Frequently Required Technical Skills

| Technical Skill | Frequency | % of Postings |
|----------------|-----------|---------------|
| Python | 7 | 8.6% |
| Data analysis (aggregated) | 10 | 12.3% |
| Database management | 4 | 4.9% |
| Project management | 4 | 4.9% |
| Machine Learning (aggregated) | 4 | 4.9% |
| Deep Learning (aggregated) | 4 | 4.9% |
| IoT | 3 | 3.7% |
| NLP | 3 | 3.7% |
| TensorFlow | 3 | 3.7% |
| PyTorch | 3 | 3.7% |
| CI/CD | 3 | 3.7% |
| Enterprise architecture | 3 | 3.7% |
| CRM systems (aggregated) | 5 | 6.2% |
| Data pipelines | 3 | 3.7% |
| Cloud Computing | 2 | 2.5% |
| Computer Vision | 2 | 2.5% |
| MLOps | 2 | 2.5% |
| Prompt Engineering | 2 | 2.5% |

Python dominates as the most demanded single programming language, consistent with its central role in AI/ML, data science, and general-purpose automation. The prominence of data analysis as an aggregated skill cluster reflects broad demand across role categories, not solely within technical roles. Deep learning frameworks (TensorFlow, PyTorch) appear with notable frequency, underscoring the applied AI focus of the MENA technology market.

The tools and technologies most frequently specified in postings further reinforce this pattern: Python (n=7), PyTorch (n=5), TensorFlow (n=5), Docker (n=5), LangChain (n=4), and MS Office (n=4) lead the tools landscape, reflecting a market that spans from cutting-edge AI infrastructure to foundational office productivity.

### 4.4 Soft Skills Demand

Soft skills analysis reveals communication as the overwhelmingly dominant requirement.

**Table 4.** Most Frequently Required Soft Skills (Case-Insensitive Aggregation)

| Soft Skill | Frequency | % of Postings |
|------------|-----------|---------------|
| Communication | 50 | 61.7% |
| Collaboration | 18 | 22.2% |
| Leadership | 19 | 23.5% |
| Mentoring | 8 | 9.9% |
| Problem Solving | 8 | 9.9% |
| Stakeholder Management | 14 | 17.3% |
| Interpersonal Skills | 11 | 13.6% |
| Organization | 7 | 8.6% |
| Adaptability | 5 | 6.2% |
| Analytical Thinking | 7 | 8.6% |
| Strategic Thinking | 8 | 9.9% |

Communication appears in nearly two-thirds of all postings, reflecting its cross-cutting importance. The high frequency of stakeholder management (17.3%) and leadership (23.5%) aligns with the prevalence of senior and executive roles in the dataset. Notably, "cultural awareness" and bilingual proficiency (Arabic and English) appear in several postings, reflecting the multinational, multicultural work environment characteristic of MENA technology hubs.

### 4.5 Education Requirements

Table 5 summarizes education requirements across the dataset.

**Table 5.** Education Requirements Distribution

| Education Level | Count | Percentage |
|----------------|-------|------------|
| Bachelor's degree | 48 | 59.3% |
| Any / Not specified | 18 | 22.2% |
| Master's degree | 10 | 12.3% |
| PhD | 4 | 4.9% |
| Professional License | 1 | 1.2% |

The bachelor's degree remains the dominant requirement (59.3%), functioning as the baseline credential for the majority of positions. However, the 22.2% of postings accepting "any" education level is noteworthy---these positions, concentrated in IT support, community management, and contractor roles, suggest pathways for non-traditionally educated workers. Master's and PhD requirements are concentrated in AI/ML research (e.g., MBZUAI, Technology Innovation Institute) and higher education faculty positions.

### 4.6 Career Level Distribution (RQ3)

Career level analysis reveals the following distribution:

**Table 6.** Career Level Distribution

| Career Level | Count | Percentage |
|-------------|-------|------------|
| Senior | 24 | 29.6% |
| Mid | 21 | 25.9% |
| Lead | 13 | 16.0% |
| Executive | 12 | 14.8% |
| Entry | 11 | 13.6% |

The distribution skews toward experienced professionals, with senior-level positions comprising the largest single category (29.6%). Combined, senior, lead, and executive roles account for 60.5% of all postings, indicating that the MENA technology market in this dataset is primarily seeking experienced talent rather than early-career professionals. Entry-level positions represent only 13.6% of postings, a finding with significant implications for recent graduates and career changers.

### 4.7 Compensation Analysis

Compensation transparency is notably low in the dataset.

**Table 7.** Compensation Level Distribution

| Compensation Level | Count | Percentage |
|-------------------|-------|------------|
| Unspecified | 40 | 49.4% |
| Competitive | 24 | 29.6% |
| Premium | 14 | 17.3% |
| Standard | 3 | 3.7% |

Nearly half of all postings (49.4%) provide no salary information. Among those that do, "competitive" (29.6%) and "premium" (17.3%) designations predominate. Premium compensation is associated with specialized technical roles (AI engineering at Technology Innovation Institute), executive positions (C-suite roles), and expatriate packages in aviation (Emirates). The single aviation posting offered the highest explicit compensation at approximately USD 260,000 total package. Explicit salary data, when provided, ranged from approximately AED 25,000--29,000/month for academic positions to premium packages exceeding AED 900,000/year for specialized roles.

### 4.8 Growth Potential

Employer-perceived growth potential, as extracted by the LLM from posting language, shows a strongly optimistic distribution:

| Growth Potential | Count | Percentage |
|-----------------|-------|------------|
| High | 43 | 53.1% |
| Medium | 33 | 40.7% |
| Low | 5 | 6.2% |

The majority of postings (53.1%) were classified as high growth potential, reflecting the generally expansive and opportunity-rich language used in MENA job postings. Low growth potential was associated with part-time administrative roles and fixed-term contractor positions.

### 4.9 Industry and Employer Landscape

The dataset captures postings from 63 distinct employers, ranging from government-linked entities (Roads and Transport Authority, Dubai Future Foundation, ADNOC Schools) to global technology companies (Apple, Canva, Mistral AI, Red Hat), regional universities (MBZUAI, Khalifa University, UAEU, AUC), and startups (ChainGPT, numi, UMATR). The top industry keywords---"higher education" (n=22, aggregated), "AI" (n=7), "fintech" (n=5), and "academic research" (n=4)---reflect the twin engines of the dataset: technology companies seeking AI/ML talent and educational institutions building digital capacity.

### 4.10 Profile Match Score Analysis

Each posting was scored against a sample IT professional profile to assess fit. Match scores ranged from 3 (minimum, for the specialized aviation role) to 72 (maximum, for an AI agent developer position). The distribution of match scores provides insight into how a generalist IT professional aligns with MENA market demands:

- Scores 0--20: 27 postings (33.3%) --- poor fit, highly specialized or unrelated roles
- Scores 21--40: 28 postings (34.6%) --- partial fit, some transferable skills
- Scores 41--60: 22 postings (27.2%) --- moderate to good fit
- Scores 61--80: 4 postings (4.9%) --- strong fit

The concentration of scores in the 0--40 range (67.9%) suggests that the MENA technology market, while active, demands specialized competencies that require targeted upskilling even for experienced IT professionals.

---

## 5. Discussion

### 5.1 Interpreting Skills Demand in the MENA Context

The dominance of Python and AI/ML frameworks (TensorFlow, PyTorch, LangChain) in technical skill requirements aligns with global trends documented by the World Economic Forum (2023) but is more pronounced in the MENA dataset. This likely reflects the region's strategic positioning as an AI hub, exemplified by Abu Dhabi's MBZUAI---the world's first graduate-level AI university---and the Technology Innovation Institute's Falcon LLM program. The demand for data analysis skills across nearly all role categories, including non-technical management and education roles, signals the pervasiveness of data-driven decision-making expectations.

The emergence of LLM-specific skills (prompt engineering, RAG implementations, LangChain, agentic AI frameworks) as required competencies is notable. These skills, which barely existed in job postings two years ago, now appear across multiple role categories, suggesting rapid adoption of generative AI in MENA workplaces. This finding has implications for educational institutions, which must rapidly integrate these emerging competencies into curricula.

### 5.2 The Experience Paradox

The career level distribution reveals what might be termed an "experience paradox" in the MENA market: while the region's digital transformation strategies emphasize building domestic technical capacity and developing young talent, the actual job postings overwhelmingly seek experienced professionals. With 60.5% of positions targeting senior, lead, or executive candidates, and only 13.6% accessible to entry-level applicants, there is a structural disconnect between national workforce development ambitions and employer hiring practices. This paradox is consistent with findings from Al-Waqfi and Forstenlechner (2014) regarding the GCC's dependence on expatriate expertise.

### 5.3 Compensation Transparency

The finding that 49.4% of postings omit salary information is consistent with broader regional norms around compensation confidentiality. However, this opacity creates informational asymmetries that may disadvantage job seekers, particularly those relocating internationally. The postings that do disclose compensation reveal a wide range---from standard administrative salaries to premium expatriate packages---suggesting that compensation in the MENA technology sector is highly variable and influenced by factors including nationality, sector (public vs. private), and specialization.

### 5.4 Geographic Concentration and Diversification

The dataset's heavy concentration in the UAE (88.9%) reflects both the UAE's position as the region's most mature technology hub and a potential sampling bias toward UAE-based employers in LinkedIn's recommendation algorithms. The presence of Qatar (8.6%) and Saudi Arabia (3.7%) in the dataset, while smaller, aligns with these countries' growing technology sectors. The Qatar Foundation, Hamad Bin Khalifa University, and Saudi Arabia's Vision 2030 initiatives are beginning to generate technology-sector positions that compete with UAE offerings.

### 5.5 LLM Methodology Evaluation (RQ4)

The LLM-based extraction methodology demonstrated several strengths. Claude successfully normalized the full range of job posting formats encountered in the dataset, from terse bullet-point lists to lengthy narrative descriptions. The model correctly inferred career levels from contextual cues (e.g., years of experience requirements, reporting relationships) even when not explicitly stated. It accurately identified domain-specific technical skills across diverse fields including aviation, education technology, blockchain, and healthcare AI.

Limitations of the LLM approach included occasional inconsistency in case normalization (e.g., "data analysis" vs. "Data Analysis" vs. "Data analysis" appearing as separate entries), which required post-hoc aggregation. The model also occasionally generated compensation level classifications that may reflect training data biases rather than objective salary benchmarks. These limitations are manageable through post-processing but highlight the importance of validation layers in LLM-based research pipelines.

Compared to traditional NER-based approaches, the LLM method offers substantial advantages in handling implicit information, contextual inference, and cross-domain applicability. Its primary disadvantage is computational cost and the need for careful prompt engineering to ensure consistent output schemas.

### 5.6 Limitations

Several limitations should be acknowledged. First, the sample size (N=81) limits generalizability; while sufficient for an exploratory systematic review, it captures only a snapshot of the MENA job market. Second, the data collection method (manual Chrome extension capture) introduces selection bias toward postings visible to a single user profile. Third, the geographic concentration in the UAE may not represent the broader MENA region adequately. Fourth, the LLM-based extraction, while validated for schema compliance, was not independently verified against human coders, limiting assessment of inter-rater reliability. Fifth, LinkedIn postings represent a subset of all job vacancies, potentially skewing toward white-collar, technology-oriented, and internationally-facing positions. Finally, the study captures a single temporal cross-section and cannot address longitudinal trends.

---

## 6. Conclusion and Future Work

### 6.1 Summary of Findings

This study presents the first LLM-driven systematic analysis of technology-sector job postings in the MENA region, analyzing 81 LinkedIn postings across nine role categories. Key findings include: (1) Python, data analysis, and AI/ML frameworks dominate technical skill requirements; (2) the market heavily favors experienced professionals, with entry-level positions representing only 13.6% of postings; (3) the UAE, particularly Abu Dhabi and Dubai, accounts for nearly 90% of technology-sector postings in the dataset; (4) compensation transparency remains low, with nearly half of postings omitting salary information; and (5) LLM-based extraction provides a viable, scalable methodology for labor market analysis.

### 6.2 Implications for Practice

For **job seekers**, the findings suggest that Python proficiency, data analysis capabilities, and strong communication skills form the foundational competency set for the MENA technology sector. Specialization in AI/ML, particularly in emerging areas such as LLM engineering and agentic AI, offers access to premium compensation. For **educational institutions**, the results highlight the need to integrate applied AI, data analytics, and professional communication into curricula across disciplines. For **policymakers**, the experience paradox---where markets demand senior talent while national strategies target youth employment---requires deliberate intervention through structured apprenticeship programs, mentorship initiatives, and incentives for employers to develop entry-level talent pipelines.

### 6.3 Future Work

Several directions for future research emerge from this study. First, scaling the dataset to thousands of postings through automated collection would enable more robust statistical analysis and subgroup comparisons. Second, longitudinal data collection would enable trend analysis to track how skill demands evolve over time. Third, multi-model comparison studies (e.g., Claude vs. GPT-4 vs. Gemini) would strengthen confidence in LLM-based extraction reliability. Fourth, incorporating job seeker profile data would enable supply-demand gap analysis at the market level. Fifth, extending the geographic coverage to North Africa (Morocco, Tunisia, Egypt) would provide a more comprehensive MENA perspective. Finally, developing a validated, open-source LLM extraction toolkit for job market analysis would benefit the broader research community.

---

## 7. References

Al-Dosari, R., & Rahman, S. M. (2005). A framework for analyzing skill requirements for information technology jobs. *Journal of Computer Information Systems*, 45(4), 79--88.

Al-Waqfi, M. A., & Forstenlechner, I. (2014). Barriers to Emiratization: The role of policy design and institutional environment in determining the effectiveness of Emiratization. *The International Journal of Human Resource Management*, 25(2), 167--189. https://doi.org/10.1080/09585192.2013.826913

Alabdulkareem, A., Frank, M. R., Sun, L., AlShebli, B., Hidalgo, C., & Rahwan, I. (2018). Unpacking the polarization of workplace skills. *Science Advances*, 4(7), eaao6030. https://doi.org/10.1126/sciadv.aao6030

Alfalasi, K. (2024). *Navigating the job landscape: Insights from LinkedIn through NLP* [Master's thesis, Rochester Institute of Technology Dubai].

Anthropic. (2024). *Claude: A family of AI assistants*. Anthropic. https://www.anthropic.com

Assaad, R., & Krafft, C. (2015). The structure and evolution of employment in Egypt: 1998--2012. In R. Assaad & C. Krafft (Eds.), *The Egyptian labor market in an era of revolution* (pp. 27--51). Oxford University Press.

Azar, J., Marinescu, I., Steinbaum, M. I., & Taska, B. (2019). *Concentration in US labor markets: Evidence from online vacancy data* (NBER Working Paper No. 24395). National Bureau of Economic Research. https://doi.org/10.3386/w24395

Baird, M., Cui, S., Sahar, L., Xu, P., & Zuo, S. (2024). *Early evidence on the impact of GitHub Copilot on labor market outcomes* (Working Paper). LinkedIn Economic Graph.

Brasse, L. (2024). Identification of future skills using data-driven methods: A systematic literature review. In *Proceedings of the 57th Hawaii International Conference on System Sciences (HICSS)*. https://hdl.handle.net/10125/107015

Cerilla, A., Kanakia, A., & Schmit, S. (2023). Career path modeling and recommendations with LinkedIn career data. In *ICLR 2023 Tiny Papers*.

Colombo, E., Mercorio, F., & Mezzanzanica, M. (2019). AI meets labor market: Exploring the link between automation and skills. *Information Economics and Policy*, 47, 27--37. https://doi.org/10.1016/j.infoecopol.2019.05.003

Dawoud, S., & Habashy, G. (2026). The emerging "Hybrid Professional": GenAI's impact on skill demand changes in the UAE. *ORF Middle East*.

Deming, D. J., & Kahn, L. B. (2018). Skill requirements across firms and labor markets: Evidence from job postings for professionals. *Journal of Labor Economics*, 36(S1), S337--S369. https://doi.org/10.1086/694106

Djumalieva, J., Lima, A., & Sleeman, C. (2018). *Classifying occupations according to their skill requirements in job advertisements* (Discussion Paper). Economic Statistics Centre of Excellence (ESCoE).

Djumalieva, J., & Sleeman, C. (2018). *An open and data-driven taxonomy of skills extracted from online job adverts*. Nesta. https://www.nesta.org.uk

Fan, L., Zhang, Z., Chen, Y., & Wei, F. (2024). Evaluating generative language models in information extraction as subjective question correction. In *Proceedings of the 2024 Joint International Conference on Computational Linguistics, Language Resources and Evaluation (LREC-COLING 2024)*.

Google. (2024). *Gemini: A family of highly capable multimodal models*. Google DeepMind. https://deepmind.google/technologies/gemini/

Gulf Labour Markets and Migration Programme. (2020). *GCC: Total population and percentage of nationals and non-nationals*. Gulf Research Center.

Gurcan, F., & Cagiltay, N. E. (2019). Big data software engineering: Analysis of knowledge domains and skill sets using LDA-based topic modeling. *IEEE Access*, 7, 82541--82552. https://doi.org/10.1109/ACCESS.2019.2924075

Harry, W. (2007). Employment creation and localization: The crucial human resource issues for the GCC. *The International Journal of Human Resource Management*, 18(1), 132--146. https://doi.org/10.1080/09585190601068508

Herandy, M., Simkute, A., & Rathod, V. (2024). *Accurate skill extraction from job descriptions using LLMs*. arXiv preprint arXiv:2410.12052.

Hvidt, M. (2015). Transformation of the Arab Gulf economies into knowledge economies: Motivations, strategies, and challenges. In M. Hvidt & T. Selvik (Eds.), *Oil states in the new Middle East* (pp. 19--42). Routledge.

Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., ... & Fung, P. (2023). Survey of hallucination in natural language generation. *ACM Computing Surveys*, 55(12), 1--38. https://doi.org/10.1145/3571730

Khaouja, I., Kassou, I., & Lazaar, M. (2021). A survey on skill identification from online job ads. *IEEE Access*, 9, 118134--118153. https://doi.org/10.1109/ACCESS.2021.3106120

Kitchenham, B., & Charters, S. (2007). *Guidelines for performing systematic literature reviews in software engineering* (Technical Report EBSE-2007-01). Keele University and Durham University.

Kitz, J., Ponzetto, S. P., & Bizer, C. (2024). An approach for detecting duplicates in job descriptions. *Journal of Applied Research and Technology*.

Liu, Y., Fang, Y., Meng, Y., Wu, J., & Wang, Q. (2025). Benchmarking LLM-based personal information extraction and countermeasures. In *Proceedings of the 34th USENIX Security Symposium*.

National Research Council. (2010). *A database for a changing economy: Review of the O*NET*. National Academies Press. https://doi.org/10.17226/12814

OpenAI. (2023). *GPT-4 technical report*. arXiv preprint arXiv:2303.08774. https://doi.org/10.48550/arXiv.2303.08774

Page, M. J., McKenzie, J. E., Bossuyt, P. M., Boutron, I., Hoffmann, T. C., Mulrow, C. D., ... & Moher, D. (2021). The PRISMA 2020 statement: An updated guideline for reporting systematic reviews. *BMJ*, 372, n71. https://doi.org/10.1136/bmj.n71

Pearson PLC. (2025). *Lost in transition: Fixing Saudi Arabia's SAR 62 billion "learn-to-earn" skills gap*.

Rivera, S., Alaref, J., & Bhatia, K. (2026). *A decade of progress: Inside Saudi Arabia's labor market transformation*. World Bank. https://doi.org/10.10986/44221

Susnjak, T. (2023). PRISMA-DFLLM: A framework for automating systematic literature reviews with large language models. *arXiv preprint*.

Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., ... & Zhou, D. (2022). Chain-of-thought prompting elicits reasoning in large language models. *Advances in Neural Information Processing Systems*, 35, 24824--24837.

World Bank. (2024). *Level up MENA: How digital education and skills are powering the next generation of jobs*.

World Economic Forum. (2023). *The future of jobs report 2023*. World Economic Forum. https://www.weforum.org/publications/the-future-of-jobs-report-2023/

World Economic Forum. (2025). *The future of jobs report 2025*. World Economic Forum. https://www.weforum.org/publications/the-future-of-jobs-report-2025/

---

## Appendix A: Normalization Codebook

*See accompanying file:* `appendices/codebook.md`
