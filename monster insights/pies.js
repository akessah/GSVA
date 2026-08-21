import {createApp} from "vue"
import websiteData from "../data/updated-prod-table.json" with { type: "json" };
import monsterData from "../data/monster-insights-data.json" with { type: "json" };
// import * as am5 from "@amcharts/amcharts5";
// import * as am5percent from "@amcharts/amcharts5/percent.js";

const data = []

const app = createApp({
    template: "#template",

    data() {
        return {
            month: "feb",
            grouping: "play",
        };
    },

    watch: {
        month(newMonth, oldMonth){
            group(data, newMonth, this.grouping)
            series.data.setAll(data)
        },

        grouping(newGrouping, oldGrouping){
            series.setAll({
                name: `${newGrouping} Series`,
                valueField: 'count',
                categoryField: newGrouping,
                oversizedBehavior: "truncate"
            })

            group(data, this.month, newGrouping)

            series.data.setAll(data)
        }
    }
}).mount("#app");


const root = am5.Root.new("chartdiv")
const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        centerX: -400,
        centerY: 450,
        width: am5.percent(40)
    })
);
let series = chart.series.push(
    am5percent.PieSeries.new(
        root, {
            name: 'play Series',
            valueField: 'count',
            categoryField: 'play',
            oversizedBehavior: "truncate"
        }
    )
)

// console.log(this.series)

//{play: "Hamlet", count: 25}
const miniData = [{
                "page": "Two Roses for Richard III (Baltar; Ferreira, 2012)",
                "count": 1099,
                "type": "production"
            }]
const miniWebData = [{
        "Title": "Two Roses for Richard III",
        "Play": "Richard III",
        "Director": "Baltar, Cláudio; Ferreira, Fábio",
        "Year": 2012,
        "Company": "Companhia BufoMecânica; Royal Shakespeare Company",
        "Language": [
            "Portuguese"
        ],
        "Region": [
            "Brazil"
        ],
        "Country": [
            "United Kingdom"
        ],
        "On": "Both"
    },]

const notFound = []

function findProd(e){
    const ind = e.page.lastIndexOf('(');
    const title = e.page.slice(0, ind-1);
    const info = e.page.slice(ind, -1);

    const comma = info.indexOf(',')
    const semicolon = info.indexOf(';')
    const director = semicolon !== -1? info.slice(1, semicolon): comma !== -1? info.slice(1, comma):"Unlabeled";
    const rawYear = comma !== -1? info.slice(comma + 1): info
    const year = Number.isNaN(Number(rawYear))||rawYear === ''? rawYear: Number(rawYear)

    const prod = websiteData.find(p => p.Title === title && p.Director.includes(director) && p.Year === year)

    return prod
}

function group(data, month, by){
    switch(by){
        case "play":
            return groupByPlay(data, month)
            break
        case "director":
            return groupByDirector(data, month)
            break
        case "language":
            return groupByLanguage(data, month)
            break
        case "type":
            return groupByType(data, month)
            break

    }
}
function groupByPlay(data, month){
    console.log('play')
    data.length = 0
    notFound.length = 0
    // console.log(monsterData[month+" 2026"].pages)
    monsterData[month+" 2026"].pages.reduce((acc, e) => {
    // miniData.reduce((acc, e)=>{
        let play;
        if(e.type === 'play')
            play = e.page;
        else if (e.type === 'production'){
            const prod = findProd(e)
            play = prod? prod.Play: 'Not Found'
            if (play === 'Not Found')
                notFound.push(e)
        } else
            play = 'N/A';

        const entry = data.find(c => c.play === play)
        if(entry)
            entry.count += e.count
        else
            data.push({play, count: 1})
    }, data)
    return data

}

function groupByDirector(data, month){
    console.log('director')
    data.length = 0
    monsterData[month+" 2026"].pages.reduce((acc, e) => {
        let director;
        if (e.type === 'production'){
            const ind = e.page.lastIndexOf('(');
            const info = e.page.slice(ind, -1);

            const comma = info.indexOf(',')
            director = info.slice(1, comma)

        } else
            director = 'N/A';

        const entry = data.find(c => c.director === director)
        if(entry)
            entry.count += e.count
        else
            data.push({director, count: 1})
    }, data)
    return data
}

function groupByLanguage(data, month){
    console.log('language')
    data.length = 0
    notFound.length = 0
    // console.log(monsterData[month+" 2026"].pages)
    monsterData[month+" 2026"].pages.reduce((acc, e) => {
        let language;
        if(e.type === 'language')
            language = e.page;
        else if (e.type === 'production'){
            const prod = findProd(e)

            language = prod? prod.Language.join(', '): 'Not Found'
            if (language === 'Not Found')
                notFound.push(e)
        } else
            language = 'N/A';

        const entry = data.find(c => c.language === language)
        if(entry)
            entry.count += e.count
        else
            data.push({language, count: 1})
    }, data)
    return data

}

function groupByType(data, month){
    console.log('type')
    data.length = 0
    notFound.length = 0
    monsterData[month+" 2026"].pages.reduce((acc, e) => {
        let type;
        if (e.type === 'production'){
            const prod = findProd(e)

            type = prod? prod.Type: 'Not Found'
            if (type === 'Not Found')
                notFound.push(e)
        } else
            type = 'N/A';

        const entry = data.find(c => c.type === type)

        if(entry)
            entry.count += e.count
        else
            data.push({type, count: 1})
    }, data)
    console.log(notFound)
    return data


}

console.log(groupByPlay(data, 'feb'))
// console.log(data)
series.data.setAll(data)
