import websiteData from "../data/updated-prod-table.json" with { type: "json" };
import monsterData from "../data/monster-insights-data.json" with { type: "json" };

//displayed data
const data = []
const notFound = []

//chart components
let root, chart, legend, yAxis, xAxis;

//fields with list values in websiteData
const listedFields = new Set(['language', 'country', 'regeion']);

group(data, 'play');


//vue application
export default async () => ({
    mounted,
    template: await fetch(new URL("./index.html", import.meta.url)).then((r) =>
        r.text(),
    ),
    data() {
        return {
            grouping: "play",
            openDescription: true
        };
    },
    watch: {
        grouping(newGrouping, oldGrouping){
            //clear current data
            chart.series.clear();
            legend.data.clear()

            //add new data
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

    console.log(data)
    console.log(notFound)
}


/**
 * Finds metadata for a production in the production table
 * @param {Object} e
 * @param {string} e.page title of the webpage
 * @param {number} e.count number of page views
 * @param {string} e.type type of webpage
 * @returns production metadata
 */
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

/**
 * Groups data by specified criteria
 * @param {Array} data list of all pages and associated view counts
 * @param {String} by criteria to group by
 */
function group(data, by){
    data.length = 0
    let monthArray;
    for(const month of Object.keys(monsterData)){

        monthArray = groupByX(month, by)
        const monthObj = {month}
        monthArray.forEach(e => {
            monthObj[e[by]] = e.count
        });

        data.push(monthObj)

    }

}


function groupByX(month, grouping){
    const groups = [];
    notFound.length = 0;
    monsterData[month].pages.forEach(e => {
        let group;
        if(e.type === grouping)
            group = e.page;
        else if (e.type === 'production'){
            const prod = findProd(e);

            if(!prod)
                group = 'Not Found';
            else if(listedFields.has(grouping))
                group = prod[grouping.replace(/^./, char => char.toUpperCase())].join(', ');
            else
                group = prod[grouping.replace(/^./, char => char.toUpperCase())]

            if (group === 'Not Found')
                notFound.push(e);
        } else
            return;

        const entry = groups.find(c => c[grouping] === group);

        if(entry)
            entry.count += e.count
        else
            groups.push({[grouping]: group, count: 1})
    });
    console.log(notFound);
    console.log(grouping, groups)
    return groups
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
