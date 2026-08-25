const info = [];

prodsWithVids = document.querySelectorAll("#table-container-2 table.sortable-table tbody tr");
prodsWithVids.forEach(e => {
    const year = e.querySelector(":nth-child(5)")?.innerHTML
    info.push({ Title: e.querySelector("td.title a")?.innerHTML ?? null,
                Play: e.querySelector("td.play")?.innerHTML ?? null,
                Director: e.querySelector(":nth-child(4)")?.innerHTML ?? null,
                Year: year ?? null,
                Company: e.querySelector(":nth-child(6)")?.innerHTML ?? null,
                Language: e.querySelector(":nth-child(7)")?.innerHTML ?? null,
                Country: e.querySelector(":nth-child(8)")?.innerHTML ?? null,
                HasVid: true
            })
});

const allProds = document.querySelectorAll("#table-container-3 table.sortable-table tbody tr");
allProds.forEach(e => {
    const title = e.querySelector("td.title a")?.innerHTML
    const director = e.querySelector(":nth-child(4)")?.innerHTML
    const year = e.querySelector(":nth-child(5)")?.innerHTML
    if(info.find(p=>p.Title === title && p.Director === director && p.Year === year) === undefined){
        info.push({ Title: title ?? null,
            Play: e.querySelector("td.play")?.innerHTML ?? null,
            Director: director ?? null,
            Year: year ?? null,
            Company: e.querySelector(":nth-child(6)")?.innerHTML ?? null,
            Language: e.querySelector(":nth-child(7)")?.innerHTML ?? null,
            Country: e.querySelector(":nth-child(8)")?.innerHTML ?? null,
            HasVid: false
        })
    }

});

info.forEach(p => {p.Year = Number.isNaN(Number(p.Year))||p.Year === ''? p.Year: Number(p.Year)})
console.log(info)
