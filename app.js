let data;

const t = {
  allYears: "\u5168\u90e8\u5e74\u4efd",
  allRaces: "\u5168\u90e8\u8cfd\u4e8b",
  countUnit: "\u7b46",
  noResults: "\u6c92\u6709\u7b26\u5408\u689d\u4ef6\u7684\u7d50\u679c",
  year: "\u5e74\u4efd",
};

const state = {
  query: "",
  year: "all",
  race: "all",
  view: "results",
};

const els = {
  yearCount: document.getElementById("yearCount"),
  raceCount: document.getElementById("raceCount"),
  recordCount: document.getElementById("recordCount"),
  search: document.getElementById("searchInput"),
  year: document.getElementById("yearSelect"),
  race: document.getElementById("raceSelect"),
  reset: document.getElementById("resetButton"),
  resultStatus: document.getElementById("resultStatus"),
  highlightStatus: document.getElementById("highlightStatus"),
  resultsBody: document.getElementById("resultsBody"),
  resultsView: document.getElementById("resultsView"),
  matrixView: document.getElementById("matrixView"),
  matrixTable: document.getElementById("matrixTable"),
};

function init() {
  normalizeHorseNames();
  repairYears();
  els.yearCount.textContent = data.years.length;
  els.raceCount.textContent = data.races.length;
  els.recordCount.textContent = data.records.length;

  els.year.innerHTML = `<option value="all">${t.allYears}</option>${data.years.map((year) => `<option value="${year}">${year}</option>`).join("")}`;
  els.race.innerHTML = `<option value="all">${t.allRaces}</option>${data.races.map((race) => `<option value="${escapeAttr(race)}">${escapeHtml(race)}</option>`).join("")}`;

  els.search.addEventListener("input", () => {
    state.query = els.search.value.trim();
    render();
  });
  els.year.addEventListener("change", () => {
    state.year = els.year.value;
    syncQuickYears();
    render();
  });
  els.race.addEventListener("change", () => {
    state.race = els.race.value;
    render();
  });
  els.reset.addEventListener("click", reset);

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      document.querySelectorAll(".mode-button").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });

  document.querySelectorAll(".quick-years button").forEach((button) => {
    button.addEventListener("click", () => {
      state.year = button.dataset.year;
      els.year.value = state.year;
      syncQuickYears();
      render();
    });
  });

  syncQuickYears();
  render();
}

function reset() {
  state.query = "";
  state.year = "all";
  state.race = "all";
  els.search.value = "";
  els.year.value = "all";
  els.race.value = "all";
  syncQuickYears();
  render();
}

function filteredRecords() {
  const query = normalize(state.query);
  return data.records.filter((record) => {
    if (state.year !== "all" && String(record.year) !== state.year) return false;
    if (state.race !== "all" && record.race !== state.race) return false;
    if (!query) return true;
    return matchesQuery(record, query);
  });
}

function normalizeHorseNames() {
  for (const record of data.records) {
    const parsed = splitHorse(record.horse);
    record.horse = parsed.display;
    record.horseZh = parsed.zh;
    record.horseEn = parsed.en;
  }
}

function splitHorse(value) {
  const match = String(value || "").match(/^(.*?)\s*[\(（](.*?)[\)）]\s*$/);
  return match
    ? { display: value, zh: match[1].trim(), en: match[2].trim() }
    : { display: value, zh: value || "", en: "" };
}

function repairYears() {
  const years = Array.from({ length: 66 }, (_, index) => 2025 - index);
  const raceOrder = new Map(data.races.map((race, index) => [race, index]));
  let rowIndex = 0;
  let previousRaceIndex = -1;

  for (const record of data.records) {
    const raceIndex = raceOrder.get(record.race) ?? 0;
    if (raceIndex <= previousRaceIndex) rowIndex += 1;
    record.year = years[rowIndex] ?? record.year;
    previousRaceIndex = raceIndex;
  }

  data.years = years;
}

function render() {
  const records = filteredRecords();
  els.resultsView.classList.toggle("is-hidden", state.view !== "results");
  els.matrixView.classList.toggle("is-hidden", state.view !== "matrix");
  els.resultStatus.textContent = `${records.length.toLocaleString("zh-Hant")} ${t.countUnit}`;
  els.highlightStatus.textContent = statusText();

  if (state.view === "results") {
    renderResults(records);
  } else {
    renderMatrix(records);
  }
}

function renderResults(records) {
  if (!records.length) {
    els.resultsBody.innerHTML = `<tr><td colspan="4" class="empty">${t.noResults}</td></tr>`;
    return;
  }

  els.resultsBody.innerHTML = records
    .sort((a, b) => b.year - a.year || data.races.indexOf(a.race) - data.races.indexOf(b.race))
    .map((record) => {
      const zh = record.horseZh || record.horse;
      const en = record.horseEn || "";
      return `<tr>
        <td class="year-cell">${record.year}</td>
        <td class="race-cell">${highlight(record.race)}</td>
        <td>
          <div class="horse-main">${highlight(zh)}</div>
          ${en ? `<div class="horse-sub">${highlight(record.horse)}</div>` : ""}
        </td>
        <td>${en ? highlight(en) : ""}</td>
      </tr>`;
    })
    .join("");
}

function renderMatrix(records) {
  const years = state.year === "all" ? data.years : data.years.filter((year) => String(year) === state.year);
  const races = state.race === "all" ? data.races : data.races.filter((race) => race === state.race);
  const allowed = new Set(records.map((record) => `${record.year}|${record.race}`));
  const byKey = new Map(data.records.map((record) => [`${record.year}|${record.race}`, record]));

  const header = `<thead><tr><th>${t.year}</th>${races.map((race) => `<th>${escapeHtml(race)}</th>`).join("")}</tr></thead>`;
  const body = years
    .map((year) => {
      const cells = races.map((race) => {
        const key = `${year}|${race}`;
        const record = byKey.get(key);
        if (!record || !allowed.has(key)) return "<td></td>";
        return `<td>${highlight(record.horse)}</td>`;
      });
      return `<tr><td class="year-cell">${year}</td>${cells.join("")}</tr>`;
    })
    .join("");

  els.matrixTable.innerHTML = `${header}<tbody>${body}</tbody>`;
}

function statusText() {
  const parts = [];
  if (state.year !== "all") parts.push(`${state.year}`);
  if (state.race !== "all") parts.push(state.race);
  if (state.query) parts.push(`\u300c${state.query}\u300d`);
  return parts.join(" / ");
}

function syncQuickYears() {
  document.querySelectorAll(".quick-years button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.year === state.year);
  });
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase("zh-Hant").replace(/[\u2018\u2019']/g, "'").trim();
}

function normalizeLoose(value) {
  return normalize(value).normalize("NFKC").replace(/[\s\-_'().,\uFF0C\u3002\u30FB\u3001\uFF08\uFF09]/g, "");
}

function matchesQuery(record, query) {
  const haystack = normalize([record.year, record.race, record.horse, record.horseZh, record.horseEn].join(" "));
  if (haystack.includes(query)) return true;

  const compactHaystack = normalizeLoose(haystack);
  const compactQuery = normalizeLoose(query);
  if (compactQuery && compactHaystack.includes(compactQuery)) return true;

  const terms = query.split(/\s+/).map(normalizeLoose).filter(Boolean);
  if (!terms.length) return true;
  const tokens = haystack.split(/[\s\-_'().,\uFF0C\u3002\u30FB\u3001\uFF08\uFF09]+/).map(normalizeLoose).filter(Boolean);
  return terms.every((term) => fuzzyTermMatches(term, compactHaystack, tokens));
}

function fuzzyTermMatches(term, compactHaystack, tokens) {
  if (compactHaystack.includes(term)) return true;
  if (term.length >= 3 && isSubsequence(term, compactHaystack)) return true;
  if (term.length < 3) return false;

  const allowed = term.length <= 4 ? 1 : term.length <= 8 ? 2 : 3;
  return tokens.some((token) => {
    if (token.includes(term)) return true;
    if (term.includes(token) && token.length >= 3) return true;
    return closestEditDistance(term, token, allowed) <= allowed;
  });
}

function isSubsequence(needle, haystack) {
  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return false;
}

function closestEditDistance(needle, token, limit) {
  if (Math.abs(needle.length - token.length) > limit && !token.includes(needle)) {
    const windowSize = needle.length;
    let best = limit + 1;
    for (let start = 0; start <= token.length - Math.max(1, windowSize - limit); start += 1) {
      const candidate = token.slice(start, start + windowSize);
      best = Math.min(best, editDistance(needle, candidate, limit));
      if (best <= limit) return best;
    }
    return best;
  }
  return editDistance(needle, token, limit);
}

function editDistance(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowBest = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current[j] = value;
      rowBest = Math.min(rowBest, value);
    }
    if (rowBest > limit) return limit + 1;
    previous = current;
  }

  return previous[b.length];
}

function highlight(value) {
  const text = escapeHtml(value);
  if (!state.query) return text;
  const needle = escapeRegExp(state.query);
  if (!needle) return text;
  return text.replace(new RegExp(`(${needle})`, "ig"), "<mark>$1</mark>");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function escapeRegExp(value) {
  const specials = new Set(["\\", "^", "$", ".", "*", "+", "?", "(", ")", "[", "]", "{", "}", "|"]);
  return String(value).split("").map((char) => specials.has(char) ? `\\${char}` : char).join("");
}

window.JRA_G1_DATA_READY
  .then((loaded) => {
    data = loaded;
    init();
  })
  .catch((error) => {
    console.error(error);
    document.body.innerHTML = `<main><div class="empty">${escapeHtml(error.message)}</div></main>`;
  });
