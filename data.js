window.JRA_G1_DATA_READY = Promise.resolve((function () {
  const meta = {"updatedFrom":"JRA_G1_Results_1960_2025_2.xlsx","years":[2025,2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2003,2002,2001,2000,1999,1998,1997,1996,1995,1994,1993,1992,1991,1990,1989,1988,1987,1986,1985,1984,1983,1982,1981,1980,1979,1978,1977,1976,1975,1974,1973,1972,1971,1970,1969,1968,1967,1966,1965,1964,1963,1962,1961,1960],"races":["\u30d5\u30a7\u30d6\u30e9\u30ea\u30fcS","\u9ad8\u677e\u5bae\u8a18\u5ff5","\u5927\u962a\u676f","\u685c\u82b1\u8cde","\u4e2d\u5c71\u30b0\u30e9\u30f3\u30c9\u30b8\u30e3\u30f3\u30d7","\u7690\u6708\u8cde","\u5929\u7687\u8cde\uff08\u6625\uff09","NHK\u30de\u30a4\u30ebC","\u30f4\u30a3\u30af\u30c8\u30ea\u30a2\u30de\u30a4\u30eb","\u30aa\u30fc\u30af\u30b9","\u65e5\u672c\u30c0\u30fc\u30d3\u30fc","\u5b89\u7530\u8a18\u5ff5","\u5b9d\u585a\u8a18\u5ff5","\u30b9\u30d7\u30ea\u30f3\u30bf\u30fc\u30baS","\u79cb\u83ef\u8cde","\u83ca\u82b1\u8cde","\u5929\u7687\u8cde\uff08\u79cb\uff09","\u30a8\u30ea\u30b6\u30d9\u30b9\u5973\u738b\u676f","\u30de\u30a4\u30eb\u30c1\u30e3\u30f3\u30d4\u30aa\u30f3\u30b7\u30c3\u30d7","\u30b8\u30e3\u30d1\u30f3C","\u30c1\u30e3\u30f3\u30d4\u30aa\u30f3\u30baC","\u962a\u795e\u30b8\u30e5\u30d9\u30ca\u30a4\u30ebF","\u671d\u65e5\u676f\u30d5\u30e5\u30fc\u30c1\u30e5\u30ea\u30c6\u30a3S","\u4e2d\u5c71\u5927\u969c\u5bb3","\u30db\u30fc\u30d7\u30d5\u30ebS","\u6709\u99ac\u8a18\u5ff5"]};
  const rows = (window.JRA_G1_ROW_CHUNKS || []).flat();

  function splitHorse(value) {
    const m = String(value || "").match(/^(.*?)\s*\((.*?)\)\s*$/);
    return m
      ? { display: value, zh: m[1].trim(), en: m[2].trim() }
      : { display: value, zh: value || "", en: "" };
  }

  const records = [];
  for (const row of rows) {
    const year = row[0];
    for (let i = 0; i < meta.races.length; i += 1) {
      const horse = row[i + 1];
      if (!horse) continue;
      const parsed = splitHorse(horse);
      records.push({
        year,
        race: meta.races[i],
        horse: parsed.display,
        horseZh: parsed.zh,
        horseEn: parsed.en,
      });
    }
  }

  const result = {
    updatedFrom: meta.updatedFrom,
    years: meta.years,
    races: meta.races,
    records,
  };
  window.JRA_G1_DATA = result;
  return result;
})());
