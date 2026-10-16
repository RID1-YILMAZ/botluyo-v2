LiteGraph.clearRegisteredTypes();

// 1. TÜM EVENT (TETİKLEYİCİ) DÜĞÜMLERİ
const BOT_EVENTS = {
    "Mesaj_Gelince": { title: "Mesaj Gelince", action: "post/add", pins: { "user_id": "Kullanıcı ID", "channel_id": "Kanal ID", "message": "Mesaj Metni" } },
    "Mention_Gelince": { title: "Mention Gelince", action: "post/mention", pins: { "user_id": "Kullanıcı ID", "channel_id": "Kanal ID", "message": "Mesaj Metni" } },
    "Ozel_Mesaj_Gelince": { title: "Özel Mesaj Gelince", action: "message/send", pins: { "user_id": "Kullanıcı ID", "message": "Mesaj Metni" } },
    "Turbo_Gelince": { title: "Turbo Gelince", action: "turbo/transfer", pins: { "user_id": "Kullanıcı ID", "message.quantity": "Miktar", "message.message": "Turbo Notu" } },
    "Gruba_Katilma": { title: "Gruba Biri Katılınca", action: "group/join", pins: { "user_id": "Kullanıcı ID", "group_id": "Grup ID" } },
    "Form_Gonderilince": { title: "Form Gönderilince", action: "post/bumote", pins: { "user_id": "Kullanıcı ID", "post_id": "Gönderi ID", "message.submit": "Buton Etiketi" } }
};

Object.keys(BOT_EVENTS).forEach(evKey => {
    const evData = BOT_EVENTS[evKey];
    function EvNode() {
        this.title = evData.title;
        this.color = "#701010"; this.bgcolor = "#500a0a";
        this.addOutput("Çalıştır", LiteGraph.EVENT);
        Object.values(evData.pins).forEach(pinName => this.addOutput(pinName, "string,number"));
    }
    LiteGraph.registerNodeType(`Botluyo_Events/${evKey}`, EvNode);
});

// 2. VERİ (DATA) VE YANIT ÇÖZÜCÜ DÜĞÜMLER
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

function DataYanitAlani() {
    this.title = "Nesneden Veri Al (JSON)";
    this.color = "#2980b9"; this.bgcolor = "#1a5276";
    this.addInput("Nesne (API Yanıtı)", "object");
    this.addWidget("text", "Alan Adı (Örn: id)", "id", "value");
    this.addOutput("Değer", "string,number");
    this.serialize_widgets = true;
}
LiteGraph.registerNodeType("Botluyo_Data/Nesne_Verisi_Al", DataYanitAlani);

function DataFormAlani() {
    this.title = "Form Alanı Oku";
    this.color = "#8e44ad"; this.bgcolor = "#5b2c6f";
    this.addWidget("text", "Alan Adı", "isim", "value");
    this.addOutput("Değer", "string,number");
    this.serialize_widgets = true;
}
LiteGraph.registerNodeType("Botluyo_Data/Form_Alani", DataFormAlani);


// 3. DİNAMİK API DÜĞÜMLERİ (Yanıt Pini Eklendi)
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
                this.addOutput("Yanıt (Response)", "object"); // YENİ EKLENDİ
            }
            DynamicApiNode.title = title;
            DynamicApiNode.desc = `/!api/${endpoint}`;
            LiteGraph.registerNodeType(`API_${currentCategory}/${endpoint.replace(/\//g, '_')}`, DynamicApiNode);
        }
    });
}

// 4. LITEGRAPH BAŞLATMA
const graph = new LGraph();
const canvas = new LGraphCanvas("#blueprint-canvas", graph);
canvas.background_color = "#1e1e1e";

// 5. GELİŞMİŞ DERLEYİCİ (RECURSIVE COMPILER)
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

        // Event Verileri (Dinamik okuma)
        if (sourceNode.type.startsWith("Botluyo_Events/")) {
            let evKey = sourceNode.type.split("/")[1];
            let evData = BOT_EVENTS[evKey];
            if (evData) {
                let pinKeys = Object.keys(evData.pins);
                let actualKey = pinKeys[sourceSlot - 1]; // 0. slot EVENT, 1. slot ilk veri
                if (actualKey) return `data.${actualKey}`;
            }
        }

        if (sourceNode.type === "Botluyo_Data/Metin") return `'${sourceNode.widgets_values[0]}'`;
        if (sourceNode.type === "Botluyo_Data/Sayi") return sourceNode.widgets_values[0];
        
        if (sourceNode.type === "Botluyo_Data/Nesne_Verisi_Al") {
            let obj = resolveData(sourceNode.inputs[0]?.link) || "null";
            let field = sourceNode.widgets_values[0];
            return `(${obj}?.['${field}'])`;
        }

        if (sourceNode.type === "Botluyo_Data/Form_Alani") {
            let field = sourceNode.widgets_values[0];
            return `(data.message?.form?.['${field}'])`;
        }
        
        // API Yanıtı Okuma
        if (sourceNode.type.startsWith("API_")) {
            if (sourceSlot === 1) return `res_${sourceNode.id}`; // Çalıştığı an oluşturulan değişkenden alır
        }

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
            // Artık düz bot.post yerine, API cevabını benzersiz bir değişkene atıyoruz
            blockCode += `${indent}let res_${node.id} = await bot.post('/!api/${endpoint}', { ${reqData.join(', ')} });\n`;
        }

        let nextLink = node.outputs && node.outputs[0]?.links ? node.outputs[0].links[0] : null;
        if (nextLink) blockCode += traverseExecution(getLink(nextLink)[3], indent);
        
        return blockCode;
    }

    const eventNodes = data.nodes.filter(n => n.type.startsWith("Botluyo_Events/"));
    eventNodes.forEach(eventNode => {
        let evKey = eventNode.type.split("/")[1];
        let evData = BOT_EVENTS[evKey];
        if (evData) {
            code += `bot.on('message', async (data) => {\n  if (data.action === '${evData.action}') {\n`;
            let nextLinkInfo = eventNode.outputs && eventNode.outputs[0].links ? eventNode.outputs[0].links[0] : null;
            code += traverseExecution(nextLinkInfo ? getLink(nextLinkInfo)[3] : null, "    ");
            code += `  }\n});\n\n`;
        }
    });

    return code;
}

// 6. ARAYÜZ, KAYDETME VE ZIP SİSTEMİ
const STORAGE_KEY = "botluyo_v2_save";
const savedData = localStorage.getItem(STORAGE_KEY);
if (savedData) {
    graph.configure(JSON.parse(savedData));
} else {
    const nEvent = LiteGraph.createNode("Botluyo_Events/Mesaj_Gelince"); nEvent.pos = [100, 200]; graph.add(nEvent);
}
graph.start();

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
    zip.file("README.md", "# Botluyo Blueprint Projesi\n\n1. `npm install`\n2. `.token.json` dosyasini guncelle\n3. `npm start`");
    zip.generateAsync({type:"blob"}).then(function(content) { saveAs(content, "botluyo-botum.zip"); });
});
