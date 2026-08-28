//npm install pdfjs-dist
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { readFileSync, writeFileSync } from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

async function extractText(pdfUrl) {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  const numPages = pdf.numPages;
  const texts = {};
  const links = {};
  const rects = {};
  const countries = []
  const referrals = []
  const pages = []

  for(let pageNum = 1; pageNum <= numPages; pageNum++){
    const page = await pdf.getPage(pageNum);
    const text = (await page.getTextContent()).items.map(s => s.str);
    if(pageNum === 2){
      for(const [ind, snippet] of text.entries()){
        if(snippet === "Top 10 Countries"){
          countries.push(...getCounts(text, 2, ind+2, 'country'))
        }else if (snippet === "Top 10 Referrals"){
          referrals.push(...getCounts(text, 2, ind+2, 'site'))
        }
      }

    }else if (pageNum === 3){
      countries.push(...getCounts(text, 8, 0, 'country'));
      referrals.push(...getCounts(text, 8, 44, 'site'));
      for(const [ind, snippet] of text.entries()){
        if(snippet === "Top Posts/Pages")
          pages.push(...getCounts(text, 23, ind+2, 'title'))
      }
    }else if(pageNum === 4){
     pages.push(...getCounts(text, 27, 0, 'title'))
    }
    texts[pageNum] = text

    const annotations = await page.getAnnotations();
    if(pageNum === 1){
      console.log(Object.keys(annotations[0]))
    }
    links[pageNum] = annotations.filter(a => a.subtype == 'Link' && a.url).map(a => {return {text: a.overlaidText, url: a.url}});
    rects[pageNum] = annotations
  }

  return {links, texts, countries, referrals, pages}
}

// writeFileSync('./links.json', JSON.stringify(results.links, null, 4))
// writeFileSync('./texts.json', JSON.stringify(results.texts, null, 4))
// console.log(results.countries, results.referrals, results.pages)
// writeFileSync('./rects.json', JSON.stringify(results.rects, null, 4))

function getCounts(text, numEntries, ind, tag){
  const results = []
  let ent = ind
  for(let i = 0; i < numEntries; i++){
    if(Number.isNaN(Number(text[ent+4].replace(',', '')))){
      let item = ""
      ent += 2
      while(text[ent] != " "){
        item += text[ent];
        ent++
      }
      results.push({'count': Number(text[ent+1].replace(',', ''))})
      results[results.length-1][tag] = item
      ent += 2

    }else{
      const entry = {'count': Number(text[ent+4].replace(',', ''))}
      results.push(entry)
      entry[tag] = text[ent+2]
      ent += 5
    }
  }
  return results
}

async function getPage(entry, links){
  const pageEntry = {count: entry.count}
  let page = entry.title.replace(" – MIT Global Shakespeares", "")
  let link = links.find(l => l.text === entry.title)
  let type;
  if(!link){
    return {page, count: entry.count, type: "manual check"}
  }else{
    link = link.url
  }
  for(const cat of ['/play/', '/glossary/', '/language/']){
    if(link.includes(cat)){
      type = cat.replaceAll('/', '')
      return {type, page, count: entry.count}
    }

  }
  if(link.includes('?s=')){
    type = 'search'
    return {type, page, count: entry.count}
  }




  const response = await axios.get(link);
  const $ = cheerio.load(response.data);
  if ($('div#single-production').length){
    page = $('h1').text().trim();
    type = 'production';
    return {type, page, count: entry.count};
  }

  return {type: "other", page, count: entry.count}


}

// console.log((await extractText({url: '../test_report.pdf'})))
// console.log(text)

//main page
//production


//news/essay

const results = await extractText({url: '../test_report.pdf'})
console.log(await Promise.all(results.pages.map(async p => await getPage(p, [...results.links[3], ...results.links[4]]))))
