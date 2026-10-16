// --- MANTIK, DEĞİŞKEN, AKIŞ VE DÖNGÜ DÜĞÜMLERİ ---

function LogicBranch() { this.title = "Eğer (Branch)"; this.color = "#b8860b"; this.bgcolor = "#665005"; this.addInput("Çalıştır", LiteGraph.ACTION); this.addInput("Koşul", "boolean"); this.addOutput("Doğru (True)", LiteGraph.EVENT); this.addOutput("Yanlış (False)", LiteGraph.EVENT); } LiteGraph.registerNodeType("Botluyo_Logic/Branch", LogicBranch);
function LogicCompare() { this.title = "Karşılaştırma (==)"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30"; this.addWidget("combo", "İşlem", "==", (v) => { this.title = `Karşılaştırma (${v})`; }, { values: ["==", "!=", ">", "<", ">=", "<="] }); this.addInput("A", "string,number"); this.addInput("B", "string,number"); this.addOutput("Sonuç", "boolean"); this.serialize_widgets = true; } LiteGraph.registerNodeType("Botluyo_Logic/Compare", LogicCompare);
function LogicIncludes() { this.title = "Metin İçeriyor mu?"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30"; this.addInput("Ana Metin", "string"); this.addInput("Aranan", "string"); this.addOutput("Sonuç", "boolean"); } LiteGraph.registerNodeType("Botluyo_Logic/Includes", LogicIncludes);
function LogicSetVar() { this.title = "Değişken Ata (Set)"; this.color = "#8e44ad"; this.bgcolor = "#5b2c6f"; this.addInput("Çalıştır", LiteGraph.ACTION); this.addInput("Değer", 0); this.addOutput("Sonraki", LiteGraph.EVENT); this.addWidget("text", "Değişken Adı", "veri1", "value"); this.serialize_widgets = true; } LiteGraph.registerNodeType("Botluyo_Logic/Set_Variable", LogicSetVar);
function DataGetVar() { this.title = "Değişken Oku (Get)"; this.color = "#8e44ad"; this.bgcolor = "#5b2c6f"; this.addOutput("Değer", 0); this.addWidget("text", "Değişken Adı", "veri1", "value"); this.serialize_widgets = true; } LiteGraph.registerNodeType("Botluyo_Data/Get_Variable", DataGetVar);
function LogicJoinText() { this.title = "Metin Birleştir"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30"; this.addInput("A", "string"); this.addInput("B", "string"); this.addOutput("Sonuç", "string"); } LiteGraph.registerNodeType("Botluyo_Logic/Join_Text", LogicJoinText);
function LogicGetWord() { this.title = "Kelime Al"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30"; this.addInput("Metin", "string"); this.addInput("Sıra", "number"); this.addOutput("Sonuç", "string"); } LiteGraph.registerNodeType("Botluyo_Logic/Get_Word", LogicGetWord);
function LogicMathOp() { this.title = "Dört İşlem"; this.color = "#2e8b57"; this.bgcolor = "#1a4d30"; this.addWidget("combo", "İşlem", "+", null, { values: ["+", "-", "*", "/"] }); this.addInput("A", "number"); this.addInput("B", "number"); this.addOutput("Sonuç", "number"); this.serialize_widgets = true; } LiteGraph.registerNodeType("Botluyo_Logic/Math_Op", LogicMathOp);
function LogicForEach() { this.title = "Her Öğe İçin (For-Each)"; this.color = "#b8860b"; this.bgcolor = "#665005"; this.addInput("Çalıştır", LiteGraph.ACTION); this.addInput("Liste (Array)", "object"); this.addOutput("Döngü", LiteGraph.EVENT); this.addOutput("Öğe", "object,string,number"); this.addOutput("İndeks", "number"); this.addOutput("Tamamlandı", LiteGraph.EVENT); } LiteGraph.registerNodeType("Botluyo_Logic/ForEach", LogicForEach);
function LogicDelay() { this.title = "Bekle (Delay)"; this.color = "#d35400"; this.bgcolor = "#873600"; this.addInput("Çalıştır", LiteGraph.ACTION); this.addInput("Saniye", "number"); this.addOutput("Sonraki", LiteGraph.EVENT); } LiteGraph.registerNodeType("Botluyo_Logic/Delay", LogicDelay);

// --- YENİ EKLENEN YARDIMCILAR ---
function LogicPrint() {
    this.title = "Konsola Yaz (Print)";
    this.color = "#8e44ad"; this.bgcolor = "#5b2c6f"; // Mor
    this.addInput("Çalıştır", LiteGraph.ACTION);
    this.addInput("Veri", 0); // 0 (sıfır) her tür veri bağlanabilir demektir
    this.addOutput("Sonraki", LiteGraph.EVENT);
} LiteGraph.registerNodeType("Botluyo_Logic/Print", LogicPrint);

function EventConnected() {
    this.title = "Bot Bağlanınca";
    this.color = "#27ae60"; this.bgcolor = "#1e8449"; // Yeşil
    this.addOutput("Çalıştır", LiteGraph.EVENT);
} LiteGraph.registerNodeType("Botluyo_Events/Connected", EventConnected);

function EventTimer() {
    this.title = "Zamanlayıcı (Timer)";
    this.color = "#27ae60"; this.bgcolor = "#1e8449"; // Yeşil
    this.addWidget("number", "Saniye", 60, "value", {min: 1});
    this.addOutput("Çalıştır", LiteGraph.EVENT);
    this.serialize_widgets = true;
} LiteGraph.registerNodeType("Botluyo_Events/Timer", EventTimer);
