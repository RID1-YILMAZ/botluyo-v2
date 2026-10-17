// --- ORTAK YARDIMCILAR + MANTIK, DEĞİŞKEN, AKIŞ DÜĞÜMLERİ ---
const ACT = LiteGraph.ACTION, EVT = LiteGraph.EVENT;
const THEME = {
  gold: ["#b8860b", "#665005"], green: ["#2e8b57", "#1a4d30"], purple: ["#8e44ad", "#5b2c6f"],
  orange: ["#d35400", "#873600"], event: ["#27ae60", "#1e8449"], red: ["#701010", "#500a0a"],
  gray: ["#333333", "#1a1a1a"], blue: ["#2980b9", "#1a5276"]
};
function regNode(type, title, ctor) { ctor.title = title; LiteGraph.registerNodeType(type, ctor); }
function defNode(type, title, theme, setup) {
  function N() { this.title = title; this.color = THEME[theme][0]; this.bgcolor = THEME[theme][1]; setup.call(this); this.serialize_widgets = true; }
  regNode(type, title, N);
}

defNode("Botluyo_Logic/Branch", "Eğer (Branch)", "gold", function () {
  this.addInput("Çalıştır", ACT); this.addInput("Koşul", "boolean");
  this.addOutput("Doğru (True)", EVT); this.addOutput("Yanlış (False)", EVT); this.addOutput("Sonra", EVT);
});
defNode("Botluyo_Logic/Compare", "Karşılaştırma (==)", "green", function () {
  const s = this;
  this.addWidget("combo", "İşlem", "==", v => { s.title = `Karşılaştırma (${v})`; }, { values: ["==", "!=", ">", "<", ">=", "<="] });
  this.addInput("A", "string,number"); this.addInput("B", "string,number"); this.addOutput("Sonuç", "boolean");
});
defNode("Botluyo_Logic/Includes", "Metin İçeriyor mu?", "green", function () {
  this.addInput("Ana Metin", "string"); this.addInput("Aranan", "string"); this.addOutput("Sonuç", "boolean");
});
defNode("Botluyo_Logic/Set_Variable", "Değişken Ata (Set)", "purple", function () {
  this.addInput("Çalıştır", ACT); this.addInput("Değer", 0); this.addOutput("Sonraki", EVT);
  this.addWidget("text", "Değişken Adı", "veri1", "value");
});
defNode("Botluyo_Data/Get_Variable", "Değişken Oku (Get)", "purple", function () {
  this.addOutput("Değer", 0); this.addWidget("text", "Değişken Adı", "veri1", "value");
});
defNode("Botluyo_Logic/Join_Text", "Metin Birleştir", "green", function () {
  this.addInput("A", "string"); this.addInput("B", "string"); this.addOutput("Sonuç", "string");
});
defNode("Botluyo_Logic/Get_Word", "Kelime Al", "green", function () {
  this.addInput("Metin", "string"); this.addInput("Sıra", "number"); this.addOutput("Sonuç", "string");
});
defNode("Botluyo_Logic/Math_Op", "Dört İşlem", "green", function () {
  this.addWidget("combo", "İşlem", "+", null, { values: ["+", "-", "*", "/", "%"] });
  this.addInput("A", "number"); this.addInput("B", "number"); this.addOutput("Sonuç", "number");
});
defNode("Botluyo_Logic/ForEach", "Her Öğe İçin (For-Each)", "gold", function () {
  this.addInput("Çalıştır", ACT); this.addInput("Liste (Array)", "object");
  this.addOutput("Döngü", EVT); this.addOutput("Öğe", "object,string,number"); this.addOutput("İndeks", "number"); this.addOutput("Tamamlandı", EVT);
});
defNode("Botluyo_Logic/Delay", "Bekle (Delay)", "orange", function () {
  this.addInput("Çalıştır", ACT); this.addInput("Saniye", "number"); this.addOutput("Sonraki", EVT);
});
defNode("Botluyo_Logic/Print", "Konsola Yaz (Print)", "purple", function () {
  this.addInput("Çalıştır", ACT); this.addInput("Veri", 0); this.addOutput("Sonraki", EVT);
});
defNode("Botluyo_Events/Connected", "Bot Bağlanınca", "event", function () {
  this.addOutput("Çalıştır", EVT);
});
defNode("Botluyo_Events/Timer", "Zamanlayıcı (Timer)", "event", function () {
  this.addWidget("number", "Saniye", 60, "value", { min: 1 }); this.addOutput("Çalıştır", EVT);
});
