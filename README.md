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

## Preview Locally

From this web directory, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
