import axios from "axios";
import * as cheerio from "cheerio";
import { readFileSync, writeFileSync } from "fs";
import * as XLSX from 'xlsx';

console.log(`Starting...${Date.now()}`)

const info = [];
const response = await axios.get("https://globalshakespeares.mit.edu/productions/");
console.log(`Fetched page ${Date.now()}`);

const $ = cheerio.load(response.data);
await $("#table-container-2 table.sortable-table tbody tr").each(async (index, element) => {
    const Title = $(element).find("td.title a").text() ?? null;
    const Director = $(element).find(":nth-child(4)").text() ?? null;
    const Year = $(element).find(":nth-child(5)").text() ?? null;
    const Play = $(element).find("td.play").text() ?? null;
    const Company = $(element).find(":nth-child(6)").text() ?? null;
    const Language = $(element).find(":nth-child(7)").text() ?? null;
    const Country = $(element).find(":nth-child(8)").text() ?? null;
    const HasVid = true;

    const link = $(element).find("td.title a").attr('href');
    info.push({ Title, Director, Year, link, Play, Company, Language, Country, HasVid });
});

await $("#table-container-3 table.sortable-table tbody tr").each(async (index, element) => {
    const title = $(element).find("td.title a").text();
    const director = $(element).find(":nth-child(4)").text();
    const year = $(element).find(":nth-child(5)").text();
    if(info.find(p=>p.Title === title && p.Director === director && p.Year === year) === undefined){
        info.push({ Title: title ?? null,
            Play: $(element).find("td.play").text() ?? null,
            Director: director ?? null,
            Year: year ?? null,
            Company: $(element).find(":nth-child(6)").text() ?? null,
            Language: $(element).find(":nth-child(7)").text() ?? null,
            Country: $(element).find(":nth-child(8)").text() ?? null,
            HasVid: false,
            link: $(element).find("td.title a").attr('href')
        });
    }
});

console.log(`Scraped table ${Date.now()}`)

const prodTable = []
for (const p of info){
    p.Year = Number.isNaN(Number(p.Year))||p.Year === ''? p.Year: Number(p.Year)
    try {
        const response = await axios.get(p.link);
        const $ = cheerio.load(response.data);
        p.Type = $("div.production-meta :nth-child(6) .meta-data").text() ?? null;
        prodTable.push(p);
    } catch (error) {
        console.error(`Failed: ${p.link}`, error);
        throw error
    }
}

console.log(`Read links ${Date.now()}`)


const data = readFileSync('./gs-prod-table-views.xlsx')
const workbook = XLSX.read(data);
const xlsxHasVid = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]).map(p => {
    const prod = p
    for(const key of ['Title', 'Play', 'Director', 'Year', 'Company', 'Language', 'Country']){
        if(prod[key] === undefined)
            prod[key] = ''
    }
    prod.HasVid = true
    return prod
});
const xlsxAllProds = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]).map(p => {
    const prod = p
    for(const key of ['Title', 'Play', 'Director', 'Year', 'Company', 'Language', 'Country']){
        if(prod[key] === undefined)
            prod[key] = ''
    }
    return prod
});

console.log(`Converted current excel sheet ${Date.now()}`)


const siteAllProds = prodTable;
const siteHasVid = siteAllProds.filter(p=>p.HasVid)

const updatedHasvid = []
for(const prod of siteHasVid){
    if (xlsxHasVid.find(p => sameProd(prod, p)))
        updatedHasvid.push({...prod, On: 'Both'})
    else
        updatedHasvid.push({...prod, On: 'Website'})
}
for(const prod of xlsxHasVid){
    if (!siteHasVid.find(p => sameProd(prod, p)))
        updatedHasvid.push({...prod, On: 'Excel Sheet'})
}
// console.log(updatedHasvid.filter(p=>p.On!=='Both').length)
const hasVidSheet = XLSX.utils.json_to_sheet(updatedHasvid)


const updatedAllProds = []
for(const prod of siteAllProds){
    if (xlsxAllProds.find(p => sameProd(prod, p)))
        updatedAllProds.push({...prod, On: 'Both'})
    else
        updatedAllProds.push({...prod, On: 'Website'})
}
for(const prod of xlsxAllProds){
    if (!siteAllProds.find(p => sameProd(prod, p)))
        updatedAllProds.push({...prod, On: 'Excel Sheet'})
}
// console.log(updatedAllProds.filter(p=>p.On!=='Both').length)
const allProdsSheet = XLSX.utils.json_to_sheet(updatedAllProds)

console.log(`Compared sheet to site ${Date.now()}`)

const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, hasVidSheet.map(p => {const prod = {...p}; delete prod.On; return prod}), "Has Videos");
XLSX.utils.book_append_sheet(newWorkbook, allProdsSheet.map(p => {const prod = {...p}; delete prod.On; return prod}), "All Productions");
XLSX.writeFile(newWorkbook, "test-prod-table.xlsx");

console.log(`Wrote sheet to file ${Date.now()}`)
function sameProd(prodA, prodB){
    if(prodA.Title === prodB.Title && prodA.Director === prodB.Director && prodA.Year === prodB.Year)
        return true
    return false
}

const finalProdTableJson = XLSX.utils.sheet_to_json(allProdsSheet).map(p => {
    const prod = p
    for(const key of ['Title', 'Play', 'Director', 'Year', 'Company', 'Language', 'Country', 'Region', 'On']){
        if(prod[key] === undefined)
            prod[key] = 'Unlabeled'
    }
    prod.Region = prod.Region.split(',')
    prod.Country = prod.Country.split(',');
    prod.Language = prod.Language.split(',')
    return prod
});

writeFileSync('./test-prod-table.json', JSON.stringify(finalProdTableJson, null, 4))

console.log(`Wrote json to file ${Date.now()}`)
console.log('All done!')
