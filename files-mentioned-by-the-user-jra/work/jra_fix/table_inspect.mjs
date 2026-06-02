import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/user/Downloads/JRA_G1_Results_1960_2025_Final (1).xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

for (const range of ["G1歷年冠軍!A1:Z10", "G1歷年冠軍!A1:Z80"]) {
  const result = await workbook.inspect({
    kind: "table",
    range,
    include: "values,formulas",
    tableMaxRows: 90,
    tableMaxCols: 30,
  });
  console.log(`--- ${range} ---`);
  console.log(result.ndjson);
}
