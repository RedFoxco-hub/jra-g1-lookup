import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputPath = "C:/Users/user/Documents/Codex/2026-06-02/files-mentioned-by-the-user-jra/outputs/jra_g1_results_fixed/JRA_G1_Results_1960_2025_Final_fixed.xlsx";
const imagePath = "C:/Users/user/Documents/Codex/2026-06-02/files-mentioned-by-the-user-jra/work/jra_fix/preview.png";
const input = await FileBlob.load(outputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const table = await workbook.inspect({
  kind: "table",
  range: "G1歷年冠軍!A1:AA5",
  include: "values,formulas",
  tableMaxRows: 6,
  tableMaxCols: 30,
});
console.log("--- table ---");
console.log(table.ndjson);

for (const term of ["遠觀天象", "金積驥", "百塔意成", "橡木城", "亞士可利", "斯泰倫博斯"]) {
  const result = await workbook.inspect({
    kind: "match",
    searchTerm: term,
    options: { maxResults: 30 },
    summary: `matches for ${term}`,
  });
  console.log(`--- ${term} ---`);
  console.log(result.ndjson);
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log("--- errors ---");
console.log(errors.ndjson);

const png = await workbook.render({ sheetName: "G1歷年冠軍", range: "A1:AA8", scale: 1 });
await fs.writeFile(imagePath, Buffer.from(await png.arrayBuffer()));
console.log(`preview=${imagePath}`);
