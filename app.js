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
    const haystack = normalize([record.year, record.race, record.horse, record.horseZh, record.horseEn].join(" "));
    return haystack.includes(query);
  });
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
