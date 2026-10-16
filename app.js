LiteGraph.clearRegisteredTypes();

// 1. TEMEL EVENT VE DATA DÜĞÜMLERİ
function EventMesaj() {
    this.title = "Mesaj Gelince (Event)";
    this.color = "#701010"; this.bgcolor = "#500a0a";
    this.addOutput("Çalıştır", LiteGraph.EVENT);
    this.addOutput("Kullanıcı ID", "string");
    this.addOutput("Mesaj Metni", "string");
}
LiteGraph.registerNodeType("Botluyo_Events/Mesaj_Gelince", EventMesaj);

function DataMetin() {
    this.title = "Metin (String)";
    this.color = "#333333"; this.bgcolor = "#1a1a1a";
    this.addOutput("Metin", "string");
    this.addWidget("text", "Değer", "Merhaba", "value");
    this.serialize_widgets = true;
}
LiteGraph.registerNodeType("Botluyo_Data/Metin", DataMetin);

function DataNumber() {
    this.title = "Sayı (Number)";
    this.color = "#333333"; this.bgcolor = "#1a1a1a";
    this.addOutput("Sayı", "number");
    this.addWidget("number", "Değer", 0, "value");
    this.serialize_widgets = true;
}
LiteGraph.registerNodeType("Botluyo_Data/Sayi", DataNumber);

// 2. DİNAMİK API DÜĞÜMLERİ (api.js'den okur)
let currentCategory = "Genel";
let currentColorHue = 210;
if(typeof API_LIST !== 'undefined') {
    API_LIST.trim().split('\n').forEach(line => {
        if (line.startsWith('## ')) {
            let parts = line.slice(3).split('|');
            currentCategory = parts[0];
            currentColorHue = parseInt(parts[1]) || 210;
        } else if (line.trim() !== '') {
            let parts = line.split('|');
            let endpoint = parts[0];
            let title = parts[1];
            let fields = parts[2] ? parts[2].split(',') : [];

            function DynamicApiNode() {
                this.title = title;
                this.color = `hsl(${currentColorHue}, 60%, 30%)`;
                this.bgcolor = `hsl(${currentColorHue}, 60%, 15%)`;
                this.addInput("Çalıştır", LiteGraph.ACTION);
                fields.forEach(f => {
                    let isNumber = f.startsWith('#');
                    let name = f.replace('#', '');
                    this.addInput(name, isNumber ? "number" : "string");
                });
                this.addOutput("Sonraki", LiteGraph.EVENT);
            }
            DynamicApiNode.title = title;
            DynamicApiNode.desc = `/!api/${endpoint}`;
            LiteGraph.registerNodeType(`API_${currentCategory}/${endpoint.replace(/\//g, '_')}`, DynamicApiNode);
        }
    });
}

// 3. LITEGRAPH BAŞLATMA
const graph = new LGraph();
const canvas = new LGraphCanvas("#blueprint-canvas", graph);
canvas.background_color = "#1e1e1e";

// 4. DERLEYİCİ (RECURSIVE COMPILER)
function generateBotCode() {
    const data = graph.serialize();
    let code = "// Botluyo Blueprint ile otomatik oluşturuldu\n";
    code += "const TopluyoBOT = require('topluyo-bot');\n";
    code += "const bot = TopluyoBOT(process.env.TOKEN || require('./.token.json'));\n\n";
    code += "bot.on('connected', () => console.log('Bot bağlandı!'));\n\n";

    const getNode = (id) => data.nodes.find(n => n.id === id);
    const getLink = (id) => data.links.find(l => l[0] === id);

    function resolveData(linkId) {
        if (!linkId) return "null";
        let link = getLink(linkId);
        if (!link) return "null";
        
        let sourceNode = getNode(link[1]);
        let sourceSlot = link[2];

        if (sourceNode.type === "Botluyo_Events/Mesaj_Gelince") {
            if (sourceSlot === 1) return "data.user_id";
            if (sourceSlot === 2) return "data.message";
        }
        if (sourceNode.type === "Botluyo_Data/Metin") return `'${sourceNode.widgets_values[0]}'`;
        if (sourceNode.type === "Botluyo_Data/Sayi") return sourceNode.widgets_values[0];
        
        if (sourceNode.type === "Botluyo_Logic/Compare") {
            let op = sourceNode.widgets_values[0];
            let a = resolveData(sourceNode.inputs[0]?.link) || "null";
            let b = resolveData(sourceNode.inputs[1]?.link) || "null";
            return `(${a} ${op} ${b})`;
        }
        if (sourceNode.type === "Botluyo_Logic/Includes") {
            let mainText = resolveData(sourceNode.inputs[0]?.link) || "''";
            let search = resolveData(sourceNode.inputs[1]?.link) || "''";
            return `String(${mainText}).includes(${search})`;
        }
        return "null";
    }

    function traverseExecution(nodeId, indent = "    ") {
        if (!nodeId) return "";
        let node = getNode(nodeId);
        if (!node) return "";
        let blockCode = "";

        if (node.type === "Botluyo_Logic/Branch") {
            let condition = resolveData(node.inputs[1]?.link) || "false";
            blockCode += `${indent}if (${condition}) {\n`;
            let trueLink = node.outputs[0]?.links ? node.outputs[0].links[0] : null;
            blockCode += traverseExecution(trueLink ? getLink(trueLink)[3] : null, indent + "  ");
            blockCode += `${indent}} else {\n`;
            let falseLink = node.outputs[1]?.links ? node.outputs[1].links[0] : null;
            blockCode += traverseExecution(falseLink ? getLink(falseLink)[3] : null, indent + "  ");
            blockCode += `${indent}}\n`;
            return blockCode;
        }

        if (node.type.startsWith("API_")) {
            let endpoint = node.properties?.endpoint || node.type.split('/')[1].replace(/_/g, '/');
            let reqData = [];
            if (node.inputs) {
                node.inputs.forEach(inp => {
                    if (inp.type !== LiteGraph.ACTION) {
                        let val = resolveData(inp.link);
                        if (val === "null") val = inp.type === 'number' ? "0" : "''";
                        reqData.push(`${inp.name}: ${val}`);
                    }
                });
            }
            blockCode += `${indent}await bot.post('/!api/${endpoint}', { ${reqData.join(', ')} });\n`;
        }

        let nextLink = node.outputs && node.outputs[0]?.links ? node.outputs[0].links[0] : null;
        if (nextLink) blockCode += traverseExecution(getLink(nextLink)[3], indent);
        
        return blockCode;
    }

    const eventNodes = data.nodes.filter(n => n.type.startsWith("Botluyo_Events/"));
    eventNodes.forEach(eventNode => {
        if (eventNode.type === "Botluyo_Events/Mesaj_Gelince") {
            code += `bot.on('message', async (data) => {\n  if (data.action === 'post/add') {\n`;
            let nextLinkInfo = eventNode.outputs && eventNode.outputs[0].links ? eventNode.outputs[0].links[0] : null;
            code += traverseExecution(nextLinkInfo ? getLink(nextLinkInfo)[3] : null, "    ");
            code += `  }\n});\n\n`;
        }
    });

    return code;
}

// 5. ARAYÜZ, KAYDETME VE ZIP SİSTEMİ
const STORAGE_KEY = "botluyo_v2_save";

// Yükleme
const savedData = localStorage.getItem(STORAGE_KEY);
if (savedData) {
    graph.configure(JSON.parse(savedData));
} else {
    const nEvent = LiteGraph.createNode("Botluyo_Events/Mesaj_Gelince"); nEvent.pos = [100, 200]; graph.add(nEvent);
}
graph.start();

// Oto Kayıt
setInterval(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(graph.serialize())); }, 5000);

document.getElementById("btn-save").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graph.serialize()));
    alert("Proje tarayıcıya başarıyla kaydedildi!");
});

document.getElementById("btn-clear").addEventListener("click", () => {
    if(confirm("Tüm tuvali temizlemek istediğine emin misin?")) {
        graph.clear();
        localStorage.removeItem(STORAGE_KEY);
    }
});

document.getElementById("btn-export").addEventListener("click", () => {
    const code = generateBotCode();
    const box = document.getElementById("code-output");
    box.style.display = box.style.display === "block" ? "none" : "block";
    box.textContent = code;
});

// ZIP Olarak Dışa Aktar
document.getElementById("btn-download").addEventListener("click", () => {
    const code = generateBotCode();
    const zip = new JSZip();
    
    zip.file("index.js", code);
    
    const packageJson = {
        name: "botluyo-blueprint-bot",
        version: "1.0.0",
        main: "index.js",
        scripts: { start: "node index.js" },
        dependencies: { "topluyo-bot": "latest" }
    };
    zip.file("package.json", JSON.stringify(packageJson, null, 2));
    zip.file(".token.json", '\"BURAYA_TOKENINIZI_YAZIN\"');
    zip.file(".gitignore", ".token.json\nnode_modules/");
    zip.file("README.md", "# Botluyo Blueprint Projesi\n\n1. Kodu çalıştırmak için terminale `npm install` yazın.\n2. Tokeninizi `.token.json` dosyasına tırnak işaretlerini bozmadan yazın.\n3. `npm start` ile botu çalıştırın.");

    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "botluyo-botum.zip");
    });
});
