// --- MANTIK VE AKIŞ (LOGIC & FLOW) DÜĞÜMLERİ ---

// 1. Branch (Eğer / İse) Düğümü - UE4'teki meşhur Branch Node
function LogicBranch() {
    this.title = "Eğer (Branch)";
    this.color = "#b8860b"; // UE4 Akış Kontrol Rengi (Hardal Sarısı)
    this.bgcolor = "#665005";
    
    // Girdi
    this.addInput("Çalıştır", LiteGraph.ACTION);
    this.addInput("Koşul", "boolean");
    
    // Çıktılar (Akış ikiye bölünüyor)
    this.addOutput("Doğru (True)", LiteGraph.EVENT);
    this.addOutput("Yanlış (False)", LiteGraph.EVENT);
}
LogicBranch.title = "Eğer (Branch)";
LogicBranch.desc = "Bir koşula (Doğru/Yanlış) göre program akışını ikiye böler.";
LiteGraph.registerNodeType("Botluyo_Logic/Branch", LogicBranch);

// 2. Karşılaştırma (Compare) Düğümü
function LogicCompare() {
    this.title = "Karşılaştırma (==)";
    this.color = "#2e8b57"; // UE4 Pure Function Rengi (Yeşil)
    this.bgcolor = "#1a4d30";
    
    // Operatör seçimi için Combo Box (Açılır Menü)
    this.addWidget("combo", "İşlem", "==", (v) => { this.title = `Karşılaştırma (${v})`; }, { values: ["==", "!=", ">", "<", ">=", "<="] });
    
    this.addInput("A", "string,number");
    this.addInput("B", "string,number");
    
    this.addOutput("Sonuç", "boolean");
    this.serialize_widgets = true;
}
LogicCompare.title = "Karşılaştırma";
LogicCompare.desc = "A ve B değerlerini karşılaştırır, True veya False döndürür.";
LiteGraph.registerNodeType("Botluyo_Logic/Compare", LogicCompare);

// 3. İçeriyor mu? (Includes) Düğümü
function LogicIncludes() {
    this.title = "Metin İçeriyor mu?";
    this.color = "#2e8b57";
    this.bgcolor = "#1a4d30";
    
    this.addInput("Ana Metin", "string");
    this.addInput("Aranan", "string");
    
    this.addOutput("Sonuç", "boolean");
}
LogicIncludes.title = "Metin İçeriyor mu?";
LogicIncludes.desc = "Bir metnin içinde başka bir metnin geçip geçmediğini kontrol eder.";
LiteGraph.registerNodeType("Botluyo_Logic/Includes", LogicIncludes);
