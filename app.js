LiteGraph.clearRegisteredTypes();

// EVENT: Mesaj Gelince (Kırmızı)
function EventMesaj() {
    this.title = "Mesaj Gelince (Event)";
    this.color = "#701010"; this.bgcolor = "#500a0a";
    this.addOutput("Çalıştır", LiteGraph.EVENT);
    this.addOutput("Kullanıcı ID", "string");
    this.addOutput("Mesaj Metni", "string");
}
LiteGraph.registerNodeType("Botluyo_Events/Mesaj_Gelince", EventMesaj);

// ACTION: Özel Mesaj Gönder (Mavi)
function ActionMesajGonder() {
    this.title = "Özel Mesaj Gönder";
    this.color = "#103060"; this.bgcolor = "#0a1d3a";
    this.addInput("Çalıştır", LiteGraph.ACTION);
    this.addInput("Kullanıcı ID", "string");
    this.addInput("Mesaj Metni", "string");
    this.addOutput("Sonraki", LiteGraph.EVENT);
}
LiteGraph.registerNodeType("Botluyo_Actions/Mesaj_Gonder", ActionMesajGonder);

// DATA: Sabit Metin (Gri)
function DataMetin() {
    this.title = "Metin (String)";
    this.color = "#333333"; this.bgcolor = "#1a1a1a";
    this.addOutput("Metin", "string");
    this.addWidget("text", "Değer", "Merhaba Topluyo!", "value");
    this.serialize_widgets = true;
}
LiteGraph.registerNodeType("Botluyo_Data/Metin", DataMetin);

// Editörü Başlat
const graph = new LGraph();
const canvas = new LGraphCanvas("#blueprint-canvas", graph);
canvas.background_color = "#1e1e1e";

// Varsayılan Düğümleri Ekle
const nodeEvent = LiteGraph.createNode("Botluyo_Events/Mesaj_Gelince");
nodeEvent.pos = [100, 200];
graph.add(nodeEvent);

const nodeAction = LiteGraph.createNode("Botluyo_Actions/Mesaj_Gonder");
nodeAction.pos = [500, 200];
graph.add(nodeAction);

// Kabloları bağla
nodeEvent.connect(1, nodeAction, 1);
nodeEvent.connect(0, nodeAction, 0);

graph.start();

// DERLEYİCİ (COMPILER)
function generateBotCode() {
    const data = graph.serialize();
    let code = "// Botluyo Blueprint ile otomatik oluşturuldu\n";
    code += "const TopluyoBOT = require('topluyo-bot');\n";
    code += "const bot = TopluyoBOT(process.env.TOKEN || 'SENIN_TOKENIN');\n\n";

    const getNode = (id) => data.nodes.find(n => n.id === id);
    const getLink = (id) => data.links.find(l => l[0] === id);
    const eventNodes = data.nodes.filter(n => n.type.startsWith("Botluyo_Events/"));

    eventNodes.forEach(eventNode => {
        if (eventNode.type === "Botluyo_Events/Mesaj_Gelince") {
            code += `bot.on('message', async (data) => {\n  if (data.action === 'post/add') {\n`;

            let nextLinkInfo = eventNode.outputs && eventNode.outputs[0].links ? eventNode.outputs[0].links[0] : null;
            let currentNodeId = nextLinkInfo ? getLink(nextLinkInfo)[3] : null;

            while (currentNodeId) {
                let node = getNode(currentNodeId);
                let inputs = {};
                
                if (node.inputs) {
                    node.inputs.forEach((inp) => {
                        if (inp.type !== LiteGraph.ACTION && inp.link) {
                            let dataLink = getLink(inp.link);
                            let sourceNode = getNode(dataLink[1]);
                            let sourceOutputSlot = dataLink[2];
                            
                            if (sourceNode.type === "Botluyo_Events/Mesaj_Gelince") {
                                if (sourceOutputSlot === 1) inputs[inp.name] = "data.user_id";
                                if (sourceOutputSlot === 2) inputs[inp.name] = "data.message";
                            } else if (sourceNode.type === "Botluyo_Data/Metin") {
                                inputs[inp.name] = `'${sourceNode.widgets_values[0]}'`;
                            }
                        }
                    });
                }

                if (node.type === "Botluyo_Actions/Mesaj_Gonder") {
                    let uId = inputs["Kullanıcı ID"] || "null";
                    let msg = inputs["Mesaj Metni"] || "''";
                    code += `    await bot.post('/!api/message/send', { user_id: ${uId}, message: ${msg} });\n`;
                }

                nextLinkInfo = node.outputs && node.outputs[0].links ? node.outputs[0].links[0] : null;
                currentNodeId = nextLinkInfo ? getLink(nextLinkInfo)[3] : null;
            }
            code += `  }\n});\n\n`;
        }
    });
    return code;
}

document.getElementById("btn-export").addEventListener("click", () => {
    const generatedCode = generateBotCode();
    const outputBox = document.getElementById("code-output");
    outputBox.style.display = outputBox.style.display === "block" ? "none" : "block";
    outputBox.textContent = generatedCode;
});
