// --- MANTIK, DEĞİŞKEN, AKIŞ VE DÖNGÜ DÜĞÜMLERİ ---

function LogicBranch() {
    this.title = "Eğer (Branch)"; this.color = "#b8860b"; this.bgcolor = "#665005";
    this.addInput("Çalıştır", LiteGraph.ACTION); this.addInput("Koşul", "boolean");
    this.addOutput("Doğru (True)", LiteGraph.EVENT); this.addOutput("Yanlış (False)", LiteGraph.EVENT);
} LiteGraph.registerNodeType("Botluyo_Logic/Branch", LogicBranch);

function LogicCompare() {
    this.title = "Karşılaştırma (==)"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addWidget("combo", "İşlem", "==", (v) => { this.title = `Karşılaştırma (${v})`; }, { values: ["==", "!=", ">", "<", ">=", "<="] });
    this.addInput("A", "string,number"); this.addInput("B", "string,number"); this.addOutput("Sonuç", "boolean"); this.serialize_widgets = true;
} LiteGraph.registerNodeType("Botluyo_Logic/Compare", LogicCompare);

function LogicIncludes() {
    this.title = "Metin İçeriyor mu?"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addInput("Ana Metin", "string"); this.addInput("Aranan", "string"); this.addOutput("Sonuç", "boolean");
} LiteGraph.registerNodeType("Botluyo_Logic/Includes", LogicIncludes);

function LogicSetVar() {
    this.title = "Değişken Ata (Set)"; this.color = "#8e44ad"; this.bgcolor = "#5b2c6f";
    this.addInput("Çalıştır", LiteGraph.ACTION); this.addInput("Değer", "string,number,boolean,object");
    this.addOutput("Sonraki", LiteGraph.EVENT); this.addWidget("text", "Değişken Adı", "veri1", "value"); this.serialize_widgets = true;
} LiteGraph.registerNodeType("Botluyo_Logic/Set_Variable", LogicSetVar);

function DataGetVar() {
    this.title = "Değişken Oku (Get)"; this.color = "#8e44ad"; this.bgcolor = "#5b2c6f";
    this.addOutput("Değer", "string,number,boolean,object"); this.addWidget("text", "Değişken Adı", "veri1", "value"); this.serialize_widgets = true;
} LiteGraph.registerNodeType("Botluyo_Data/Get_Variable", DataGetVar);

function LogicJoinText() {
    this.title = "Metin Birleştir"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addInput("A", "string"); this.addInput("B", "string"); this.addOutput("Sonuç", "string");
} LiteGraph.registerNodeType("Botluyo_Logic/Join_Text", LogicJoinText);

function LogicGetWord() {
    this.title = "Kelime Al"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addInput("Metin", "string"); this.addInput("Sıra", "number"); this.addOutput("Sonuç", "string");
} LiteGraph.registerNodeType("Botluyo_Logic/Get_Word", LogicGetWord);

function LogicMathOp() {
    this.title = "Dört İşlem"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30";
    this.addWidget("combo", "İşlem", "+", null, { values: ["+", "-", "*", "/"] });
    this.addInput("A", "number"); this.addInput("B", "number"); this.addOutput("Sonuç", "number"); this.serialize_widgets = true;
} LiteGraph.registerNodeType("Botluyo_Logic/Math_Op", LogicMathOp);

// YENİ: For-Each Döngüsü
function LogicForEach() {
    this.title = "Her Öğe İçin (For-Each)";
    this.color = "#b8860b"; this.bgcolor = "#665005"; // Akış kontrol rengi
    this.addInput("Çalıştır", LiteGraph.ACTION);
    this.addInput("Liste (Array)", "object");
    this.addOutput("Döngü Gövdesi", LiteGraph.EVENT); // 0
    this.addOutput("Öğe (Item)", "object,string,number"); // 1
    this.addOutput("İndeks", "number"); // 2
    this.addOutput("Tamamlandı", LiteGraph.EVENT); // 3
} LiteGraph.registerNodeType("Botluyo_Logic/ForEach", LogicForEach);

// YENİ: Bekle (Delay)
function LogicDelay() {
    this.title = "Bekle (Delay)";
    this.color = "#d35400"; this.bgcolor = "#873600"; // Zaman/Saat rengi (Turuncu)
    this.addInput("Çalıştır", LiteGraph.ACTION);
    this.addInput("Saniye", "number");
    this.addOutput("Sonraki", LiteGraph.EVENT);
} LiteGraph.registerNodeType("Botluyo_Logic/Delay", LogicDelay);
