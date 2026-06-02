import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("C:/Users/user/Downloads/JRA_G1_Results_1960_2025_Final (1).xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);
const help = await workbook.help("range values");
console.log(help);
