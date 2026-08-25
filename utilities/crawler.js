// import axios from "axios";
// import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import websiteData from "./pie of pie/updated-prod-table.json" with { type: "json" };
import info from "./prod-table-types.json" with {type: "json"};


// const response = await axios.get("https://globalshakespeares.mit.edu/productions/");
// console.log(response.status);
// console.log(response.data.length);

// const info = []
// //{title, director, year, type}

// const $ = cheerio.load(response.data);
// await $("#table-container-3 table.sortable-table tbody tr").each(async (index, element) => {
//   const title = $(element).find("td.title a").text() ?? "Unlabeled";
//   const director = $(element).find(":nth-child(4)").text() ?? "Unlabeled";
//   const rawYear = $(element).find(":nth-child(5)").text() ?? "Unlabeled";
//   const year = Number.isNaN(Number(rawYear))||rawYear === ''? rawYear: Number(rawYear);

//   const link = $(element).find("td.title a").attr('href');
//   info.push({ title, director, year, link });
// });

// for (const entry of info) {
//   try {
//     const response = await axios.get(entry.link);
//     const $ = cheerio.load(response.data);
//     entry.type = $("div.production-meta :nth-child(6) .meta-data").text() ?? null;
//   } catch (error) {
//     console.error(`Failed: ${entry.link}`, error);
//   }
// }


const newProdTable = websiteData.slice();

// const newProdTable = [{
//         "Title": "36 Chowringhee Lane",
//         "Play": "Henry IV, part 2, King Lear, Twelfth Night",
//         "Director": "Sen, Arpana",
//         "Year": 1981,
//         "Company": "Film-Valas",
//         "Language": [
//             "Bengali",
//             "English",
//             "Hindi"
//         ],
//         "Country": [
//             "India"
//         ],
//         "On": "Both",
//         "Region": [
//             "Unlabeled"
//         ]
//     }]
// const info = [{
//         "title": "36 Chowringhee Lane",
//         "director": "Sen, Arpana",
//         "year": 1981,
//         "link": "https://globalshakespeares.mit.edu/36-chowringhee-lane-sen-arpana-1981/",
//         "type": "film"
//     },]
// console.log(newProdTable)
for (const prod of newProdTable){
    if(prod.On === 'Excel Sheet')
        continue
    const entry = info.find(e => e.title === prod.Title && e.year === prod.Year && e.director === prod.Director);
    try{
        prod.Type = entry.type
    }catch(e){
        console.log(prod)
        prod.type = "Unlabeled"
    }

}


writeFileSync('./prod-table-with-types.json', JSON.stringify(newProdTable, null, 4))


// console.log(info)
