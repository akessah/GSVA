import websiteData from "../data/updated-prod-table.json" with { type: "json" };

//chart components
let root, container, series;


//vue application
export default async () => ({
    mounted,
    template: await fetch(new URL("./index.html", import.meta.url)).then((r) =>
        r.text(),
    ),
    data() {
        return {
            labels: true,
        };
    },
    watch: {
        labels(newLabels, oldLabels){
            for(const series of [regionSeries, countrySeries, languageSeries]){
                toggleLabels(series, newLabels)
            }
        }
    }
});


function toggleLabels(series, visible){
    series.labels.template.set("visible", visible);
    series.ticks.template.set("visible", visible);
    // if(visible)
    //     shrink();
    // else
    //     grow()
}

function grow(){
    regionChart.setAll({
        width: am5.percent(22.5),
    })
    countryChart.setAll({
        width: am5.percent(60)
    })
    languageChart.setAll({
        width: am5.percent(15),
    })
}

function shrink(){
    regionChart.setAll({
        width: am5.percent(15),
    })
    countryChart.setAll({
        width: am5.percent(40)
    })
    languageChart.setAll({
        width: am5.percent(10),
    })
}

function mounted(){
    const formattedData = [{
        name: "Root",
        children:[
            {
                name: 'Brazil',
                children: []
            },
            {
                name: 'Europe',
                children: []
            },
            {
                name: 'UK and North America',
                children: []
            },
            {
                name: 'East and Southeast Asia',
                children: []
            },
            {
                name: 'India',
                children: []
            },
            {
                name: 'Arab World',
                children: []
            },
            {
                name: 'Unlabeled',
                children: []
            }
        ]
    }];


    websiteData.filter(p => p.On !== 'Excel Sheet').reduce((acc, p) => {
        const root = acc[0]
        const regions = root.children.filter(r => p.Region.includes(r.name));
        for (const region of regions){
            // region.count ++;
            for(const country of p.Country){
                let c = region.children.find(c => c.name === country)
                if(!c)
                    // c.count++;
                    region.children.push({name: country||'Unlabeled', children: []});
                    c = region.children.at(-1);
                // else{
                //     region.subData.push({country: country||'Unlabeled', count: 1, subData: []})
                //     c = region.subData.at(-1)
                // }
                for(const language of p.Language){
                    let l = c.children.find(x => x.name === language);
                    if (l)
                        l.value++;
                    else
                        c.children.push({name: language||'Unlabeled', value: 1})
                }
            }
        }
        return acc
    }, formattedData);

    console.log(formattedData)
    root = am5.Root.new("chartdiv");

    root.setThemes([
        am5themes_Animated.new(root)
    ]);

    var container = root.container.children.push(
        am5.Container.new(root, {
            width: am5.percent(65),
            height: am5.percent(65),
            layout: root.verticalLayout,
            centerY: am5.percent(10),
            centerX: am5.percent(-25)

        })
    );

    var series = container.children.push(
        am5hierarchy.Sunburst.new(root, {
            downDepth: 1,
            initialDepth: 1,
            valueField: "value",
            categoryField: "name",
            childDataField: "children",
            innerRadius: am5.percent(30)
        })
    );


    //set colors
    series.get('colors').set("colors", [
        am5.color(0x2f1c0f),
        am5.color(0xc36b54),
        am5.color(0xfce2b3),
        am5.color(0xe6a264),
        am5.color(0x2f1c0f),
        am5.color(0xc36b54),
        am5.color(0xfce2b3),
    ]);

    series.data.setAll(formattedData);
    container.children.unshift(
        am5hierarchy.BreadcrumbBar.new(root, {
            series: series,
            // centerY: am5.percent(-30),
        })
    );
}







// series.data.setAll([{
//   name: "Root",
//   children: [{
//     name: "A0",
//     children: [{
//       name: "A0A1",
//       children: [{
//         name: "A0A0A2",
//         value: 71
//       }, {
//         name: "A0A0B2",
//         children: [{
//           name: "A0A0B1A3",
//           value: 69
//         }, {
//           name: "A0A0B1B3",
//           value: 85
//         }]
//       }, {
//         name: "A0A0C2",
//         value: 48
//       }]
//     }, {
//       name: "A0B1",
//       value: 27
//     }, {
//       name: "A0C1",
//       children: [{
//         name: "A0C2A2",
//         value: 2
//       }, {
//         name: "A0C2B2",
//         children: [{
//           name: "A0C2B1A3",
//           value: 54
//         }, {
//           name: "A0C2B1B3",
//           value: 16
//         }]
//       }]
//     }, {
//       name: "A0D1",
//       value: 89
//     }]
//   }, {
//     name: "B0",
//     children: [{
//       name: "B1A1",
//       value: 9
//     }, {
//       name: "B1B1",
//       children: [{
//         name: "B1B1A2",
//         children: [{
//           name: "B1B1A0A3",
//           value: 35
//         }, {
//           name: "B1B1A0B3",
//           value: 40
//         }]
//       }, {
//         name: "B1B1B2",
//         value: 55
//       }]
//     }]
//   }, {
//     name: "C0",
//     children: [{
//       name: "C2A1",
//       children: [{
//         name: "C2A0A2",
//         value: 24
//       }, {
//         name: "C2A0B2",
//         value: 89
//       }, {
//         name: "C2A0C2",
//         children: [{
//           name: "C2A0C2A3",
//           children: [{
//             name: "C2A0C2A0A4",
//             children: [{
//               name: "C2A0C2A0A00",
//               value: 90
//             }, {
//               name: "C2A0C2A0A01",
//               value: 70
//             }, {
//               name: "C2A0C2A0A02",
//               value: 66
//             }, {
//               name: "C2A0C2A0A03",
//               value: 58
//             }]
//           }, {
//             name: "C2A0C2A0B4",
//             children: [{
//               name: "C2A0C2A0B10",
//               value: 80
//             }, {
//               name: "C2A0C2A0B11",
//               value: 40
//             }]
//           }]
//         }, {
//           name: "C2A0C2B3",
//           value: 44
//         }]
//       }, {
//         name: "C2A0D2",
//         children: [{
//           name: "C2A0D3A3",
//           value: 28
//         }, {
//           name: "C2A0D3B3",
//           value: 14
//         }]
//       }]
//     }, {
//       name: "C2B1",
//       value: 40
//     }, {
//       name: "C2C1",
//       children: [{
//         name: "C2C2A2",
//         children: [{
//           name: "C2C2A0A3",
//           value: 28
//         }, {
//           name: "C2C2A0B3",
//           children: [{
//             name: "C2C2A0B1A4",
//             value: 19
//           }, {
//             name: "C2C2A0B1B4",
//             children: [{
//               name: "C2C2A0B1B10",
//               value: 11
//             }, {
//               name: "C2C2A0B1B11",
//               value: 10
//             }, {
//               name: "C2C2A0B1B12",
//               value: 97
//             }, {
//               name: "C2C2A0B1B13",
//               value: 47
//             }]
//           }, {
//             name: "C2C2A0B1C4",
//             children: [{
//               name: "C2C2A0B1C20",
//               value: 40
//             }, {
//               name: "C2C2A0B1C21",
//               value: 37
//             }, {
//               name: "C2C2A0B1C22",
//               value: 53
//             }]
//           }]
//         }, {
//           name: "C2C2A0C3",
//           value: 96
//         }]
//       }, {
//         name: "C2C2B2",
//         value: 66
//       }]
//     }]
//   }]
// }]);
// series.set("selectedDataItem", series.dataItems[0]);
