//vue application
export default async () => ({
    template: await fetch(new URL("./index.html", import.meta.url)).then((r) =>
        r.text(),
    ),
    data() {
        return {
            file: "compare",
        };
    },
    mounted,
    methods: {
        copyFile
    },
    watch: {
        file(newFile, oldFile){
            fetch(`utilities/${newFile}.js`).then(r => r.text()).then(c => {
                document.getElementById('utilities-code').textContent = c;
                Prism.highlightElement(document.getElementById('utilities-code'))
            })
        }
    }
});

function mounted(){
    fetch('/compare.js').then(r => r.text()).then(c => {
        document.getElementById('utilities-code').textContent = c;
        Prism.highlightElement(document.getElementById('utilities-code'))
    })
}

//copies file to clipboard
function copyFile() {
  const copyText = document.getElementById("utilities-code").textContent;
  navigator.clipboard.writeText(copyText);
  alert("Copied the file to clipboard");
}
