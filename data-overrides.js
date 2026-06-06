window.JRA_G1_DATA_READY = window.JRA_G1_DATA_READY.then((data) => {
  const updates = [
    [2025, "大阪杯", "寶萊歌劇 (Bellagio Opera)"],
    [2019, "フェブラリーS", "日輪之神（Inti）"],
    [2019, "高松宮記念", "曲調夫子（Mr Melody）"],
    [2019, "大阪杯", "艾恩遺跡（Al Ain）"],
    [2019, "皐月賞", "農神節慶（Saturnalia）"],
    [2019, "NHKマイルC", "頌讚火星（Admire Mars）"],
    [2019, "ヴィクトリアマイル", "樸素無華（Normcore）"],
    [2019, "日本ダービー", "名父巴魯（Roger Barows）"],
    [2019, "安田記念", "冠軍車手（Indy Champ）"],
    [2019, "スプリンターズS", "倫敦塔（Tower of London）"],
    [2019, "マイルチャンピオンシップ", "冠軍車手（Indy Champ）"],
    [2019, "ジャパンC", "文雅之士（Suave Richard）"],
    [2019, "阪神ジュベナイルF", "拉丁城市（Resistencia）"],
    [2019, "朝日杯フューチュリティS", "戰舞者（Salios）"],
    [2018, "フェブラリーS", "信子之夢（Nonkono Yume）"],
    [2018, "高松宮記念", "鐵杵成針（Fine Needle）"],
    [2018, "大阪杯", "文雅之士（Suave Richard）"],
    [2018, "皐月賞", "金紀元（Epoca d'Oro）"],
    [2018, "天皇賞（春）", "七色線（Rainbow Line）"],
    [2018, "NHKマイルC", "啟愛航海（Keiai Nautique）"],
    [2018, "ヴィクトリアマイル", "子夜白光（Jour Polaire）"],
    [2018, "日本ダービー", "華格納（Wagnerian）"],
    [2018, "宝塚記念", "覓奇火箭（Mikki Rocket）"],
    [2018, "スプリンターズS", "鐵杵成針（Fine Needle）"],
    [2018, "天皇賞（秋）", "金之霸（Rey de Oro）"],
    [2018, "マイルチャンピオンシップ", "絕嶺之峽（Stelvio）"],
    [2018, "阪神ジュベナイルF", "野田幻想（Danon Fantasy）"],
    [2018, "朝日杯フューチュリティS", "頌讚火星（Admire Mars）"],
    [2018, "ホープフルS", "農神節慶（Saturnalia）"],
  ];

  function splitHorse(value) {
    const match = String(value || "").match(/^(.*?)\s*[\(（](.*?)[\)）]\s*$/);
    return match
      ? { display: value, zh: match[1].trim(), en: match[2].trim() }
      : { display: value, zh: value || "", en: "" };
  }

  for (const [year, race, horse] of updates) {
    const record = data.records.find((item) => item.year === year && item.race === race);
    if (!record) continue;
    const parsed = splitHorse(horse);
    record.horse = parsed.display;
    record.horseZh = parsed.zh;
    record.horseEn = parsed.en;
  }

  data.updatedFrom = "JRA_G1_Results_1960_2025_2_1.xlsx";
  return data;
});
