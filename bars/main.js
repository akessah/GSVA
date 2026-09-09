import {createApp} from "vue"
import websiteData from "../data/updated-prod-table.json" with { type: "json" };
import monsterData from "../data/monster-insights-data.json" with { type: "json" };

const data = []
const notFound = []
group(data, 'play')
let root;
let chart;
let legend;
let yAxis;
let xAxis;


export default async () => ({
    mounted,
  template: await fetch(new URL("./index.html", import.meta.url)).then((r) =>
    r.text(),
  ),
  data() {
        return {
            grouping: "play",
        };
    },

    watch: {

        grouping(newGrouping, oldGrouping){
            chart.series.clear();
            legend.data.clear()

            group(data, newGrouping)
            yAxis.data.setAll(data);

            for (const group in data[0]){
                if(group !== 'month')
                makeSeries(group, group);
            }

        },
    }
});





function mounted(){

root = am5.Root.new("chartdiv");


const myTheme = am5.Theme.new(root);

myTheme.rule("Grid", ["base"]).setAll({
  strokeOpacity: 0.1
});


// Set themes
// https://www.amcharts.com/docs/v5/concepts/themes/
root.setThemes([
  am5themes_Animated.new(root),
  myTheme
]);


// Create chart
// https://www.amcharts.com/docs/v5/charts/xy-chart/
chart = root.container.children.push(am5xy.XYChart.new(root, {
  panX: false,
  panY: false,
  wheelX: "panY",
  wheelY: "zoomY",
  paddingLeft: 0,
  layout: root.verticalLayout
}));

// Add scrollbar
// https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
chart.set("scrollbarY", am5.Scrollbar.new(root, {
  orientation: "vertical"
}));



// Create axes
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
const yRenderer = am5xy.AxisRendererY.new(root, {});
yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
  categoryField: "month",
  renderer: yRenderer,
  tooltip: am5.Tooltip.new(root, {})
}));

yRenderer.grid.template.setAll({
  location: 1
})

yAxis.data.setAll(data);

xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
  min: 0,
  maxPrecision: 0,
  renderer: am5xy.AxisRendererX.new(root, {
    minGridDistance: 40,
    strokeOpacity: 0.1
  })
}));

// Add legend
// https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
legend = chart.children.push(am5.Legend.new(root, {
  centerX: am5.p50,
  x: am5.p50
}));



for (const play in data[0]){
    if(play !== 'month')
    makeSeries(play, play);
}


// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
chart.appear(1000, 100);




// const miniData = [{
//                 "page": "Two Roses for Richard III (Baltar; Ferreira, 2012)",
//                 "count": 1099,
//                 "type": "production"
//             }]
// const miniWebData = [{
//         "Title": "Two Roses for Richard III",
//         "Play": "Richard III",
//         "Director": "Baltar, Cláudio; Ferreira, Fábio",
//         "Year": 2012,
//         "Company": "Companhia BufoMecânica; Royal Shakespeare Company",
//         "Language": [
//             "Portuguese"
//         ],
//         "Region": [
//             "Brazil"
//         ],
//         "Country": [
//             "United Kingdom"
//         ],
//         "On": "Both"
//     },]

// [{play: 'Hamlet', count: 3}, {play: 'Macbeth', count: 5}]
// {year: 2026, Hamlet: 3, Macbeth: 5
console.log(data)
console.log(notFound)
}


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

function group(data, by){
    data.length = 0
    let monthArray;
    for(let [month, val] of Object.entries(monsterData)){
        switch(by){
            case "play":
                monthArray = groupByPlay([], month)
                break
            case "director":
                monthArray = groupByDirector([], month)
                break
            case "language":
                monthArray = groupByLanguage([], month)
                break
            case "type":
                monthArray = groupByType([], month)
                break
            default:
                throw new Error(`${by} not a valid grouping`)
        }

        const monthObj = {month}
        monthArray.forEach(e => {
            monthObj[e[by]] = e.count
        });

        data.push(monthObj)

    }

}
function groupByPlay(data, month){
    notFound.length = 0
    // console.log(monsterData[month+" 2026"].pages)
    monsterData[month].pages.reduce((acc, e) => {
    // miniData.reduce((acc, e)=>{
        let play;
        if(e.type === 'play')
            play = e.page;
        else if (e.type === 'production'){
            const prod = findProd(e)
            play = prod? prod.Play: 'Not Found'
            if (play === 'Not Found')
                notFound.push(e)
        } else{
            console.log('n/a'
            )
            return;
        }
            // return;
            // play = 'N/A';

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
    monsterData[month].pages.reduce((acc, e) => {
        let director;
        if (e.type === 'production'){
            const ind = e.page.lastIndexOf('(');
            const info = e.page.slice(ind, -1);

            const comma = info.indexOf(',')
            director = info.slice(1, comma)

        } else
            return;
            // director = 'N/A';

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
    monsterData[month].pages.reduce((acc, e) => {
        let language;
        if(e.type === 'language')
            language = e.page;
        else if (e.type === 'production'){
            const prod = findProd(e)

            language = prod? prod.Language.join(', '): 'Not Found'
            if (language === 'Not Found')
                notFound.push(e)
        } else
            return;
            // language = 'N/A';

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
    monsterData[month].pages.reduce((acc, e) => {
        let type;
        if (e.type === 'production'){
            const prod = findProd(e)

            type = prod? prod.Type: 'Not Found'
            if (type === 'Not Found')
                notFound.push(e)
        } else
            return;
            // type = 'N/A';

        const entry = data.find(c => c.type === type)

        if(entry)
            entry.count += e.count
        else
            data.push({type, count: 1})
    }, data)
    console.log(notFound)
    return data


}

// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
function makeSeries(name, fieldName) {
  const series = chart.series.push(am5xy.ColumnSeries.new(root, {
    name: name,
    stacked: true,
    xAxis: xAxis,
    yAxis: yAxis,
    baseAxis: yAxis,
    valueXField: fieldName,
    categoryYField: "month"
  }));

  series.columns.template.setAll({
    tooltipText: "{name}, {categoryY}: {valueX}",
    tooltipY: am5.percent(90)
  });
  series.data.setAll(data);

  // Make stuff animate on load
  // https://www.amcharts.com/docs/v5/concepts/animations/
  series.appear();

  series.bullets.push(function () {
    return am5.Bullet.new(root, {
      sprite: am5.Label.new(root, {
        text: "{valueX}",
        fill: root.interfaceColors.get("alternativeText"),
        centerY: am5.p50,
        centerX: am5.p50,
        populateText: true
      })
    });
  });

  legend.data.push(series);


}
