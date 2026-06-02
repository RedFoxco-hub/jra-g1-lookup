import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/user/Downloads/JRA_G1_Results_1960_2025_Final (1).xlsx";
const outputDir = "C:/Users/user/Documents/Codex/2026-06-02/files-mentioned-by-the-user-jra/outputs/jra_g1_results_fixed";
const outputPath = `${outputDir}/JRA_G1_Results_1960_2025_Final_fixed.xlsx`;

const translations = new Map([
  ["上蒼賜福", "上蒼賜福 (Kamunyak)"],
  ["八角茴香", "八角茴香 (Star Anise)"],
  ["初勁", "初勁 (First Force)"],
  ["剛勁力", "剛勁力 (Energico)"],
  ["北十字星", "北十字星 (Croix du Nord)"],
  ["匯兩川", "匯兩川 (Namur)"],
  ["十歡玫瑰", "十歡玫瑰 (Ten Happy Rose)"],
  ["博物街", "博物街 (Museum Mile)"],
  ["名將田原", "名將田原 (Meisho Tabaru)"],
  ["喜迅升", "喜迅升 (Admire Zoom)"],
  ["堅韌力", "堅韌力 (Durezza)"],
  ["大海女神", "大海女神 (Mama Cocha)"],
  ["寬道路", "寬道路 (Brede Weg)"],
  ["寶萊歌劇", "寶萊歌劇 (Bellagio Opera)"],
  ["尼羅長流", "尼羅長流 (Peptide Nile)"],
  ["巧繡生花", "巧繡生花 (Embroidery)"],
  ["帝王級", "帝王級 (T O Royal)"],
  ["拯救者", "拯救者 (Redentor)"],
  ["拼勝堡", "拼勝堡 (Panja Tower)"],
  ["日照飛駿", "日照飛駿 (Naran Huleg)"],
  ["星映天下", "星映天下 (Stars on Earth)"],
  ["格倫島", "格倫島 (Calandagan)"],
  ["法老茶座", "法老茶座 (Cafe Pharoah)"],
  ["洛夫琴山", "洛夫琴山 (Lovcen)"],
  ["浪漫勇士", "浪漫勇士 (Romantic Warrior)"],
  ["消暑樂祭", "消暑樂祭 (Mad Cool)"],
  ["清爽口味", "清爽口味 (Lemon Pop)"],
  ["盡得真傳", "盡得真傳 (Dura Erede)"],
  ["神志勇進", "神志勇進 (Soul Rush)"],
  ["神速力量", "神速力量 (Arma Veloce)"],
  ["紅瑪瑙", "紅瑪瑙 (Namura Clair)"],
  ["純潔之輝", "純潔之輝 (Sodashi)"],
  ["葡北佳景", "葡北佳景 (Costa Nova)"],
  ["蒙面舞會", "蒙面舞會 (Masquerade Ball)"],
  ["西野雛菊", "西野雛菊 (Nishino Daisy)"],
  ["豔玫華彩", "豔玫華彩 (Stunning Rose)"],
  ["賢德之君", "賢德之君 (Lugal)"],
  ["里見夢境", "里見夢境 (Satono Reve)"],
  ["野田赤蠍", "野田赤蠍 (Danon Scorpion)"],
  ["金積驥", "金積驥 (Jack d'Or)"],
  ["鑽彩", "鑽彩 (Champagne Color)"],
  ["長山我駒", "長山我駒 (Oju Chosan)"],
  ["險峰懸壁", "險峰懸壁 (Gendarme)"],
  ["響號", "響號 (Blow the Horn)"],
  ["馬上特技", "馬上特技 (Cavallerizzo)"],
]);

const exactCorrections = new Map([
  ["金積驥 (Jantar Mantar)", "遠觀天象 (Jantar Mantar)"],
  ["亞士可利 (Ascoli Piceno)", "百塔意成 (Ascoli Piceno)"],
  ["斯泰倫博斯 (Stellenbosch)", "橡木城 (Stellenbosch)"],
]);

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("G1歷年冠軍");
const range = sheet.getRange("A1:AA67");
const values = range.values;
let changed = 0;

for (let row = 0; row < values.length; row++) {
  for (let col = 0; col < values[row].length; col++) {
    const value = values[row][col];
    if (typeof value !== "string") continue;

    let next = exactCorrections.get(value);
    if (!next) next = translations.get(value);

    if (next && next !== value) {
      values[row][col] = next;
      changed++;
    }
  }
}

range.values = values;
sheet.getRange("A1:A67").format.columnWidthPx = 60;
sheet.getRange("B1:AA67").format.columnWidthPx = 170;
sheet.getRange("B1:AA67").format.wrapText = true;
sheet.getRange("A1:AA1").format.wrapText = true;
sheet.getRange("A1:AA67").format.rowHeightPx = 38;

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ changed, outputPath }, null, 2));
