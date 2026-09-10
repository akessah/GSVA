import websiteData from "../data/updated-prod-table.json" with { type: "json" };

//chart components
let root;
let regionChart, regionSeries;
let countryChart, countrySeries;
let languageChart, languageSeries;

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
    if(visible)
        shrink();
    else
        grow()
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
    const formattedData = [
        {
            'region': 'Brazil',
            'count': 0,
            'subData': []
        },
        {
            'region': 'Europe',
            'count': 0,
            'subData': []
        },
        {
            'region': 'UK and North America',
            'count': 0,
            'subData': []
        },
        {
            'region': 'East and Southeast Asia',
            'count': 0,
            'subData': []
        },
        {
            'region': 'India',
            'count': 0,
            'subData': []
        },
        {
            'region': 'Arab World',
            'count': 0,
            'subData': []
        },
        {
            'region': 'Unlabeled',
            'count': 0,
            'subData': []
        }
    ];


    websiteData.filter(p => p.On !== 'Excel Sheet').reduce((acc, p) => {
        const regions = acc.filter(r => p.Region.includes(r.region));
        for (const region of regions){
            region.count ++;
            for(const country of p.Country){
                let c = region.subData.find(c => c.country === country)
                if(c)
                    c.count++;
                else{
                    region.subData.push({country: country||'Unlabeled', count: 1, subData: []})
                    c = region.subData.at(-1)
                }
                for(const language of p.Language){
                    let l = c.subData.find(x => x.language === language);
                    if (l)
                        l.count++;
                    else
                        c.subData.push({language: language||'Unlabeled', count: 1})
                }

            }
        }
        return acc
    }, formattedData);


    root = am5.Root.new("chartdiv");

    //first regions chart
    regionChart = root.container.children.push(
        am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            width: am5.percent(15),
            radius: am5.percent(80),
            centerX: -200,
            centerY: 650
        })
    );
    regionSeries = regionChart.series.push(
        am5percent.PieSeries.new(
            root, {
                name: 'Series',
                valueField: 'count',
                categoryField: 'region',
                oversizedBehavior: "truncate"
            }
        )
    );


    //second countries chart
    countryChart = root.container.children.push(
        am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            centerX: -300,
            centerY: 250,
            width: am5.percent(40)
        })
    );
    countrySeries = countryChart.series.push(
        am5percent.PieSeries.new(
            root, {
                name: 'CountrySeries',
                valueField: 'count',
                categoryField: 'country',
                oversizedBehavior: "truncate"
            }
        )
    );

    //third languages chart
    languageChart = root.container.children.push(
        am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            width: am5.percent(10),
            radius: am5.percent(50),
            centerX: -750,
            centerY: 550
        })
    );
    languageSeries = languageChart.series.push(
        am5percent.PieSeries.new(
            root, {
                name: 'LanguageSeries',
                valueField: 'count',
                categoryField: 'language',
                oversizedBehavior: "truncate"
            }
        )
    );

    //handlers
    regionSeries.slices.template.events.on('click', e => {
        selectSlice(e.target)
    });

    countrySeries.slices.template.events.on('click', e=>{
        selectSlice2(e.target)
    });

    //set colors
    regionSeries.get('colors').set("colors", [
        am5.color(0x2f1c0f),
        am5.color(0xc36b54),
        am5.color(0xfce2b3),
        am5.color(0xe6a264),
        am5.color(0x2f1c0f),
        am5.color(0xc36b54),
        am5.color(0xfce2b3),
    ]);




    function selectSlice(slice){
        //hide country chart if clicking active region
        if(slice.get("active")){
            countryChart.hide();
            return;
        }
        languageChart.hide();

        //create trio of colors
        const count = slice.dataItem.dataContext.subData.length;
        const colors = [];
        for(let i = 0; i < count; i++){
            if(i%3==0)
                colors.push(am5.color(0x662a15));
            else if(i%3==1)
                colors.push(am5.color(0xaf331f));
            else
                colors.push(am5.color(0xf5be43));
        }
        const countrySeriesColorset = countrySeries.get('colors', null);
        countrySeriesColorset.set('colors', colors);

        //set data
        countrySeries.data.setAll(slice.dataItem.dataContext.subData);
        countryChart.appear();

    }

    function selectSlice2(slice){
        //hide language chart if clicking active country
        if(slice.get("active")){
            languageChart.hide();
            return;
        }

        //create gradient from color to white
        const fill = slice.get('fill', null);
        const count = slice.dataItem.dataContext.subData.length;
        const colors = [];
        for(let i = 0; i < count; i++){
            if(i%3==0)
                colors.push(am5.color(0xc8beaf));
            else if(i%3==1)
                colors.push(am5.color(0x3d3c34));
            else
                colors.push(am5.color(0x7ea41d));
        }
        const languageSeriesColorset = languageSeries.get('colors', null);
        languageSeriesColorset.set('colors', colors);

        //set data
        languageSeries.data.setAll(slice.dataItem.dataContext.subData);
        languageChart.appear();
    }


    for(const series of [regionSeries, countrySeries, languageSeries]){
        //limit active slices to one
        series.slices.template.events.on("click", function(ev) {
            series.slices.each(function(slice) {
                if (slice != ev.target && slice.get("active")) {
                    slice.set("active", false);
                }
            })
        });

        //have wedges pop out less
        series.slices.template.states.create('active', {
            shiftRadius: 10
        });

        series.labels.template.setAll(
            {fontSize: 'large'}
        );
    }



    regionChart.events.on('datavalidated', ()=>{
        setTimeout(()=> selectSlice(regionSeries.dataItems.getIndex(0)), 1000)
    });


    regionSeries.data.setAll(formattedData);
}
