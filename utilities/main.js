
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
            fetch(`/${newFile}.js`).then(r => r.text()).then(c => {
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

function copyFile() {
  // Get the text field
  const copyText = document.getElementById("utilities-code").textContent;

  // Select the text field
//   copyText.select();
//   copyText.setSelectionRange(0, 99999); // For mobile devices

   // Copy the text inside the text field
  navigator.clipboard.writeText(copyText);

  // Alert the copied text
  alert("Copied the file to clipboard");
}
