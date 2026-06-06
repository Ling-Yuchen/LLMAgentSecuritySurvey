const PAGE_SIZE = 12;

const state = {
  siteData: null,
  papers: [],
  filtered: [],
  currentPage: 1,
};

const els = {
  title: document.querySelector("#survey-title"),
  subtitle: document.querySelector("#survey-subtitle"),
  paperLink: document.querySelector("#paper-link"),
  codeLink: document.querySelector("#code-link"),
  authorsGrid: document.querySelector("#authors-grid"),
  backgroundCopy: document.querySelector("#background-copy"),
  abstractCopy: document.querySelector("#abstract-copy"),
  questionsGrid: document.querySelector("#questions-grid"),
  outlookIntro: document.querySelector("#outlook-intro"),
  outlookGrid: document.querySelector("#outlook-grid"),
  literatureGrid: document.querySelector("#literature-grid"),
  resultsSummary: document.querySelector("#results-summary"),
  pageNumbers: document.querySelector("#page-numbers"),
  prevPage: document.querySelector("#prev-page"),
  nextPage: document.querySelector("#next-page"),
  searchInput: document.querySelector("#search-input"),
  searchField: document.querySelector("#search-field"),
  typeFilter: document.querySelector("#type-filter"),
  multiAgentFilter: document.querySelector("#multi-agent-filter"),
  yearFilter: document.querySelector("#year-filter"),
  resetFilters: document.querySelector("#reset-filters"),
};

async function loadData() {
  const [siteRes, paperRes] = await Promise.all([
    fetch("./data/site-data.json"),
    fetch("./data/papers.json"),
  ]);

  if (!siteRes.ok || !paperRes.ok) {
    throw new Error("Failed to load site data.");
  }

  state.siteData = await siteRes.json();
  state.papers = await paperRes.json();
  state.filtered = [...state.papers];
}

function renderHero() {
  const { siteData } = state;
  els.title.textContent = siteData.title;
  els.subtitle.textContent = siteData.subtitle;
  els.paperLink.href = siteData.paperUrl;
  els.codeLink.href = siteData.codeUrl;
}

function renderAuthors() {
  els.authorsGrid.innerHTML = state.siteData.authors
    .map(
      (author) => `
        <article class="author-card fade-in">
          <h3>${escapeHtml(author.name)}</h3>
          <p>${escapeHtml(author.institution)}</p>
          <div class="author-meta">
            <span class="chip chip-muted">${escapeHtml(author.city)}, ${escapeHtml(author.country)}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderOverview() {
  els.backgroundCopy.innerHTML = state.siteData.background
    .map((paragraph) => `<p class="fade-in">${escapeHtml(paragraph)}</p>`)
    .join("");
  els.abstractCopy.textContent = state.siteData.abstract;
}

function renderQuestions() {
  els.questionsGrid.innerHTML = state.siteData.researchQuestions
    .map(
      (item) => `
        <article class="question-card fade-in">
          <p class="eyebrow">${escapeHtml(item.id)}</p>
          <h3>${escapeHtml(item.shortTitle)}</h3>
          <p><strong>${escapeHtml(item.question)}</strong></p>
          <p>${escapeHtml(item.answer)}</p>
        </article>
      `,
    )
    .join("");
}

function renderOutlook() {
  els.outlookIntro.textContent = state.siteData.futureOutlookIntro;
  els.outlookGrid.innerHTML = state.siteData.futurePriorities
    .map(
      (item) => `
        <article class="outlook-card fade-in">
          <h3>${escapeHtml(item.challenge)}</h3>
          <p>${escapeHtml(item.direction)}</p>
        </article>
      `,
    )
    .join("");
}

function populateFilters() {
  const types = [...new Set(state.papers.map((paper) => paper.typeTag))].sort();
  const years = [...new Set(state.papers.map((paper) => String(paper.year)))].sort((a, b) => Number(b) - Number(a));

  els.typeFilter.innerHTML += types
    .map((type) => `<option value="${escapeAttribute(type)}">${escapeHtml(type)}</option>`)
    .join("");

  els.yearFilter.innerHTML += years
    .map((year) => `<option value="${escapeAttribute(year)}">${escapeHtml(year)}</option>`)
    .join("");
}

function getSearchableValue(paper, field) {
  if (field === "all") {
    return [
      paper.id,
      paper.title,
      paper.authors,
      paper.venue,
      paper.year,
      paper.doi,
      paper.typeTag,
      paper.multiAgentLabel,
      ...(paper.researchTopic || []),
      ...(paper.keywords || []),
      ...(paper.agentType || []),
      ...(paper.taskScenario || []),
      ...(paper.threatModel || []),
      ...(paper.attackSurface || []),
    ]
      .join(" ")
      .toLowerCase();
  }

  const raw = paper[field];
  if (Array.isArray(raw)) {
    return raw.join(" ").toLowerCase();
  }
  return String(raw || "").toLowerCase();
}

function applyFilters() {
  const searchTerm = els.searchInput.value.trim().toLowerCase();
  const searchField = els.searchField.value;
  const typeValue = els.typeFilter.value;
  const multiAgentValue = els.multiAgentFilter.value;
  const yearValue = els.yearFilter.value;

  state.filtered = state.papers.filter((paper) => {
    const matchesSearch = !searchTerm || getSearchableValue(paper, searchField).includes(searchTerm);
    const matchesType = typeValue === "all" || paper.typeTag === typeValue;
    const matchesMultiAgent = multiAgentValue === "all" || paper.multiAgentLabel === multiAgentValue;
    const matchesYear = yearValue === "all" || String(paper.year) === yearValue;
    return matchesSearch && matchesType && matchesMultiAgent && matchesYear;
  });

  state.currentPage = 1;
  renderLiterature();
}

function renderLiterature() {
  const total = state.filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  state.currentPage = Math.min(state.currentPage, totalPages);

  const startIndex = (state.currentPage - 1) * PAGE_SIZE;
  const pageItems = state.filtered.slice(startIndex, startIndex + PAGE_SIZE);

  els.resultsSummary.textContent =
    total === 0
      ? "No papers match the current filters."
      : `Showing ${startIndex + 1}-${Math.min(startIndex + PAGE_SIZE, total)} of ${total} papers.`;

  if (pageItems.length === 0) {
    els.literatureGrid.innerHTML = `<div class="empty-state">Try another search term or clear the filters.</div>`;
  } else {
    els.literatureGrid.innerHTML = pageItems
      .map(
        (paper) => `
          <article class="paper-card fade-in">
            <div class="paper-meta">
              <span class="chip">${escapeHtml(paper.typeTag)}</span>
              <span class="chip chip-muted">Multi-agent: ${escapeHtml(paper.multiAgentLabel)}</span>
            </div>
            <h3>${escapeHtml(paper.title)}</h3>
            <p class="meta-line"><strong>${escapeHtml(paper.authors)}</strong> · ${formatPaperMeta(paper)}</p>
            <div class="paper-tags">
              ${paper.researchTopic.slice(0, 2).map((topic) => `<span class="chip chip-muted">${escapeHtml(topic)}</span>`).join("")}
            </div>
            <p class="meta-line">
              DOI:
              ${
                paper.doiUrl
                  ? `<a class="doi-link" href="${escapeAttribute(paper.doiUrl)}" target="_blank" rel="noreferrer">${escapeHtml(paper.doi)}</a>`
                  : `<span class="empty-doi">Not available</span>`
              }
            </p>
          </article>
        `,
      )
      .join("");
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  els.prevPage.disabled = state.currentPage === 1;
  els.nextPage.disabled = state.currentPage === totalPages;

  const pages = [];
  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - state.currentPage) <= 1) {
      pages.push(page);
    }
  }

  const withGaps = [];
  pages.forEach((page, index) => {
    withGaps.push(page);
    const next = pages[index + 1];
    if (next && next - page > 1) {
      withGaps.push("...");
    }
  });

  els.pageNumbers.innerHTML = withGaps
    .map((item) => {
      if (item === "...") {
        return `<span class="chip chip-muted">...</span>`;
      }
      return `
        <button class="page-number ${item === state.currentPage ? "is-active" : ""}" type="button" data-page="${item}">
          ${item}
        </button>
      `;
    })
    .join("");

  els.pageNumbers.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentPage = Number(button.dataset.page);
      renderLiterature();
      window.scrollTo({ top: document.querySelector("#literature").offsetTop - 70, behavior: "smooth" });
    });
  });
}

function bindEvents() {
  [els.searchInput, els.searchField, els.typeFilter, els.multiAgentFilter, els.yearFilter].forEach((element) => {
    element.addEventListener("input", applyFilters);
    element.addEventListener("change", applyFilters);
  });

  els.prevPage.addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage -= 1;
      renderLiterature();
    }
  });

  els.nextPage.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
    if (state.currentPage < totalPages) {
      state.currentPage += 1;
      renderLiterature();
    }
  });

  els.resetFilters.addEventListener("click", () => {
    els.searchInput.value = "";
    els.searchField.value = "all";
    els.typeFilter.value = "all";
    els.multiAgentFilter.value = "all";
    els.yearFilter.value = "all";
    applyFilters();
  });
}

function formatPaperMeta(paper) {
  const year = String(paper.year || "");
  const venue = String(paper.venue || "");
  if (year && venue.includes(year)) {
    return escapeHtml(venue);
  }
  return `${escapeHtml(year)} · ${escapeHtml(venue)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

async function init() {
  try {
    await loadData();
    renderHero();
    renderAuthors();
    renderOverview();
    renderQuestions();
    renderOutlook();
    populateFilters();
    bindEvents();
    renderLiterature();
  } catch (error) {
    els.title.textContent = "Failed to load survey content.";
    els.subtitle.textContent = String(error.message || error);
  }
}

init();
