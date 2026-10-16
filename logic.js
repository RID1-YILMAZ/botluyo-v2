// --- MANTIK, DEĞİŞKEN VE AKIŞ DÜĞÜMLERİ ---

// 1. Branch (Eğer / İse)
function LogicBranch() {
    this.title = "Eğer (Branch)";
    this.color = "#b8860b"; this.bgcolor = "#665005";
    this.addInput("Çalıştır", LiteGraph.ACTION);
    this.addInput("Koşul", "boolean");
    this.addOutput("Doğru (True)", LiteGraph.EVENT);
    this.addOutput("Yanlış (False)", LiteGraph.EVENT);
}
LiteGraph.registerNodeType("Botluyo_Logic/Branch", LogicBranch);

// 2. Karşılaştırma (Compare)
function LogicCompare() {
    this.title = "Karşılaştırma (==)";
    this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addWidget("combo", "İşlem", "==", (v) => { this.title = `Karşılaştırma (${v})`; }, { values: ["==", "!=", ">", "<", ">=", "<="] });
    this.addInput("A", "string,number");
    this.addInput("B", "string,number");
    this.addOutput("Sonuç", "boolean");
    this.serialize_widgets = true;
}
LiteGraph.registerNodeType("Botluyo_Logic/Compare", LogicCompare);

// 3. İçeriyor mu? (Includes)
function LogicIncludes() {
    this.title = "Metin İçeriyor mu?";
    this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addInput("Ana Metin", "string");
    this.addInput("Aranan", "string");
    this.addOutput("Sonuç", "boolean");
}
LiteGraph.registerNodeType("Botluyo_Logic/Includes", LogicIncludes);

// 4. DEĞİŞKEN YÖNETİMİ (Set / Get Variable)
function LogicSetVar() {
    this.title = "Değişken Ata (Set)";
    this.color = "#8e44ad"; this.bgcolor = "#5b2c6f";
    this.addInput("Çalıştır", LiteGraph.ACTION);
    this.addInput("Değer", "string,number,boolean,object");
    this.addOutput("Sonraki", LiteGraph.EVENT);
    this.addWidget("text", "Değişken Adı", "veri1", "value");
    this.serialize_widgets = true;
}
LiteGraph.registerNodeType("Botluyo_Logic/Set_Variable", LogicSetVar);

function DataGetVar() {
    this.title = "Değişken Oku (Get)";
    this.color = "#8e44ad"; this.bgcolor = "#5b2c6f";
    this.addOutput("Değer", "string,number,boolean,object");
    this.addWidget("text", "Değişken Adı", "veri1", "value");
    this.serialize_widgets = true;
}
LiteGraph.registerNodeType("Botluyo_Data/Get_Variable", DataGetVar);

// 5. METİN VE MATEMATİK
function LogicJoinText() {
    this.title = "Metin Birleştir";
    this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addInput("A (Metin)", "string");
    this.addInput("B (Metin)", "string");
    this.addOutput("Sonuç", "string");
}
LiteGraph.registerNodeType("Botluyo_Logic/Join_Text", LogicJoinText);

function LogicGetWord() {
    this.title = "Kelime Al";
    this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addInput("Metin", "string");
    this.addInput("Sıra (Örn: 2)", "number");
    this.addOutput("Sonuç", "string");
}
LiteGraph.registerNodeType("Botluyo_Logic/Get_Word", LogicGetWord);

function LogicMathOp() {
    this.title = "Dört İşlem";
    this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addWidget("combo", "İşlem", "+", null, { values: ["+", "-", "*", "/"] });
    this.addInput("A (Sayı)", "number");
    this.addInput("B (Sayı)", "number");
    this.addOutput("Sonuç", "number");
    this.serialize_widgets = true;
}
LiteGraph.registerNodeType("Botluyo_Logic/Math_Op", LogicMathOp);
