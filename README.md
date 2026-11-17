# LLM Agent Security Survey Web

Static showcase site for the survey:

`Toward Secure LLM Agents: A Survey of Threat Surfaces, Attacks, Defenses, and Evaluation`

## Files

- `index.html`: GitHub Pages entry page
- `styles.css`: page styles
- `app.js`: client-side rendering, filtering, and pagination
- `data/site-data.json`: survey metadata and section content
- `data/papers.json`: literature records for the browser
- `scripts/build_site_data.py`: rebuilds the JSON data from the project sources

## Data Sources

The site is generated from:

- `<survey-project>/main.tex`
- `<survey-project>/main.bib`
- `<survey-project>/LLM_Agent_Security_Literature.xlsx`

## Rebuild Data

From the survey project root, run:

```bash
python3 web/LLMAgentSecuritySurvey/scripts/build_site_data.py
```

## Technical annotations

The public `data/papers.json` includes `lifecycleStage`, `benchmark`,
`evaluationMetrics`, `attackMethods`, and `defenseMethods` as arrays. All five
appear on each literature card and support both all-field and field-specific
search. The four benchmark, metric, attack, and defense fields contain up to two
representative short labels per paper. They are editorial summaries for browsing.
Lifecycle labels use the survey's terminology and retain the distinction between
planning, decision, tool execution, memory, and coordination. The page provides a
collapsible lifecycle glossary. ASR denotes attack success rate.
Empty arrays display “Not specified”, without treating missing annotations
as evidence that a method or benchmark is absent. Local source files are not
included in the website publication.

## Preview Locally

From this web directory, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
