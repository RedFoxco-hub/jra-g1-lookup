import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/user/Downloads/JRA_G1_Results_1960_2025_Final (1).xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

console.log("Workbook keys:", Object.keys(workbook));
if (workbook.worksheets) {
  console.log("Worksheets keys:", Object.keys(workbook.worksheets));
  const sheets = workbook.worksheets.items ?? workbook.worksheets;
  console.log("Sheets:", sheets.map?.((s) => ({ id: s.id, name: s.name })) ?? sheets);
}

for (const term of ["Jantar", "Jack", "Ascoli", "Stellenbosch", "遠觀天象", "金積驥", "百塔", "橡木城"]) {
  const result = await workbook.inspect({
    kind: "match",
    searchTerm: term,
    options: { maxResults: 50 },
    summary: `matches for ${term}`,
  });
  console.log(`--- ${term} ---`);
  console.log(result.ndjson);
}
