import * as XLSX from 'xlsx';
import { readFileSync } from "fs";

const data = readFileSync('./gs-prod-table-views.xlsx')
const workbook = XLSX.read(data);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
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



const siteAllProds = JSON.parse(readFileSync('./productions.json', "utf8"));
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

const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, hasVidSheet, "Has Videos");
XLSX.utils.book_append_sheet(newWorkbook, allProdsSheet, "All Productions");
// XLSX.writeFile(newWorkbook, "updated-prod-table.xlsx");

function sameProd(prodA, prodB){
    if(prodA.Title === prodB.Title && prodA.Director === prodB.Director && prodA.Year === prodB.Year)
        return true
    return false
}

const excel = {
        "Title": "Bir Baba Hamlet (A Father’s Hamlet)",
        "Play": "Hamlet",
        "Director": "Eren, Emrah",
        "Year": 2017,
        "Company": "Baba Sahne",
        "Language": "Turkish",
        "Country": "Turkey",
        "HasVid": true
    }
const web = {
    Title: 'Bir Baba Hamlet (A Father’s Hamlet)',
    Play: 'Hamlet',
    Director: 'Eren, Emrah',
    Year: 2017,
    Company: 'Baba Sahne',
    Language: 'Turkish',
    Country: 'Turkey',
    HasVid: true,
    On: 'Website'
  }
console.log(excel.Director === web.Director)
