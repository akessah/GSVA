//npm install pdfjs-dist
//npm install axios
//npm install cheerio
//npm install prompt-sync

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { writeFileSync } from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import monsterData from "../data/monster-insights-data.json" with { type: "json" };
import promptSync from 'prompt-sync';

const prompt = promptSync();


/**
 * Extracts text and other useful information from Monster Insights report
 * @param {String} pdfUrl path to the report from current directory
 * @returns pdf text indexed by page, pdf links indexed by page, list of top 10 countries and referrals, list of top 50 pages
 */
async function extractText(pdfUrl) {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  const numPages = pdf.numPages;
  const texts = {};
  const links = {};
  const countries = [];
  const referrals = [];
  const pages = [];

  for(let pageNum = 1; pageNum <= numPages; pageNum++){
    const page = await pdf.getPage(pageNum);
    const text = (await page.getTextContent()).items.map(s => s.str);

    if(pageNum === 2){ //get countries and referrals from report page 2
      for(const [ind, snippet] of text.entries()){
        if(snippet === "Top 10 Countries"){
          countries.push(...getCounts(text, 2, ind+2, 'country'));
        }else if (snippet === "Top 10 Referrals"){
          referrals.push(...getCounts(text, 2, ind+2, 'site'));
        }
      }

    }else if (pageNum === 3){ //get rest of countries and referrals + start getting paged
      countries.push(...getCounts(text, 8, 0, 'country'));
      referrals.push(...getCounts(text, 8, 44, 'site'));
      for(const [ind, snippet] of text.entries()){
        if(snippet === "Top Posts/Pages")
          pages.push(...getCounts(text, 23, ind+2, 'title'));
      }
    }else if(pageNum === 4){ //get rest of pages
      pages.push(...getCounts(text, 27, 0, 'title'));
    }

    //store text and links for each page
    texts[pageNum] = text;
    const annotations = await page.getAnnotations();
    links[pageNum] = annotations.filter(a => a.subtype == 'Link' && a.url).map(a => {return {text: a.overlaidText, url: a.url}});
  }

  return {links, texts, countries, referrals, pages}
}

/**
 * Extracts lists from report text. Expects text list to be repeating pattern of ["1.", " ", "Item", " ", "Count"], but does account for some malformed patterns
 * @param {String[]} text text from report
 * @param {Number} numEntries number of list entries to return
 * @param {Number} ind index in text array to start from; string at that index should match regex ^\d\.$
 * @param {String} tag desired keyname for list (ex 'country' if getting list of top 10 countries)
 * @returns list of tags with associated counts
 */
function getCounts(text, numEntries, ind, tag){
  //
  const results = [];
  let ent = ind;

  for(let i = 0; i < numEntries; i++){ //if "Item" is split across different strings
    if(Number.isNaN(Number(text[ent+4].replace(',', '')))){
      let item = "";
      ent += 2;
      while(text[ent] != " "){
        item += text[ent];
        ent++;
      }
      results.push({'count': Number(text[ent+1].replace(',', ''))})
      results[results.length-1][tag] = item;
      ent += 2;

    }else{ //well formed text pattern
      const entry = {'count': Number(text[ent+4].replace(',', ''))}
      results.push(entry);
      entry[tag] = text[ent+2];
      ent += 5;
    }
  }
  return results
}


/**
 * Searches for more information about a webpage
 * @param {Object} entry
 * @param {Number} entry.count number o
 * @param {String} entry.page title of page as listed on report
 * @param {Object[]} links
 * @param {String} links[].text title of link
 * @param {String} links[].url link url
 * @returns same entry with webpage type and a title more suitable for display
 */
async function getPage(entry, links){
  let page = entry.title.replace(" – MIT Global Shakespeares", "");
  let link = links.find(l => l.text === entry.title);
  let type;

  //no url, check by hand
  if(!link){
    return {page, count: entry.count, type: "manual check"};
  }else{
    link = link.url;
  }

  //if url has any of these words, that's its type
  for(const cat of ['/play/', '/glossary/', '/language/', '/director/']){
    if(link.includes(cat)){
      type = cat.replaceAll('/', '');
      return {type, page, count: entry.count};
    }
  }

  //search queries has ?s in url
  if(link.includes('?s=')){
    type = 'search';
    return {type, page, count: entry.count};
  }

  //most likely a production, get page title from actual page, unlike on report it includes director and year
  const response = await axios.get(link);
  const $ = cheerio.load(response.data);
  if ($('div#single-production').length){
    page = $('h1').text().trim();
    type = 'production';
    return {type, page, count: entry.count};
  }

  //other
  return {type: "other", page, count: entry.count};


}

const path = prompt('Enter path from current directory to report: ');
const results = await extractText({url: path});
results.pages = await Promise.all(results.pages.map(async p => await getPage(p, [...results.links[3], ...results.links[4]])));

delete results.links;
delete results.texts;

const month = prompt('Enter month year (ex "Feb 2026"): ')
monsterData[month] = results;

writeFileSync('./test-monster-insights.json', JSON.stringify(monsterData, null, 4));
