import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from "fs";

const data = readFileSync('./filename.xlsx')
const workbook = XLSX.read(data);
const sheet = workbook.Sheets[workbook.SheetNames[1]];
const xlsxAllProds = XLSX.utils.sheet_to_json(sheet).map(p => {
    const prod = p
    for(const key of ['Title', 'Play', 'Director', 'Year', 'Company', 'Language', 'Country', 'Region', 'On']){
        if(prod[key] === undefined)
            prod[key] = ''
    }
    prod.Region = prod.Region.split(',')
    prod.Country = prod.Country.split(',');
    prod.Language = prod.Language.split(',')
    return prod
});

writeFileSync('./filename.json', JSON.stringify(xlsxAllProds, null, 4))
