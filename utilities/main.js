
export default async () => ({
  template: await fetch(new URL("./index.html", import.meta.url)).then((r) =>
    r.text(),
  ),
  data() {
        return {
            file: "compare",
        };
    },
    mounted
});

function mounted(){
    fetch('/compare.js').then(r => r.text()).then(c => {
        document.getElementById('utilities-code').textContent = c;
        Prism.highlightElement(document.getElementById('utilities-code'))
    })
}
