import websiteData from "../data/updated-prod-table.json" with { type: "json" };

const stats = {
    Country: 0,
    Language: 0,
    Region: 0
}

const sets = {
    Country: new Set(),
    Language: new Set(),
    Region: new Set()
}

for (const prod of websiteData){
    for(const stat of ['Language', 'Country', 'Region']){
        prod[stat].forEach(e => {
            if (!sets[stat].has(e)){
                stats[stat] += 1;
                sets[stat].add(e)
            }
        });
    }
}

console.log(stats)
