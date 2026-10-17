// ===== BOTLUYO v2: olaylar, veri, API düğümleri, derleyici, arayüz =====
// (LiteGraph.clearRegisteredTypes() artık index.html'de, logic.js'ten önce çalışıyor.)

// --- Tema: dokunmatik için büyük hedefler, okunur tel renkleri ---
Object.assign(LiteGraph, { NODE_TITLE_HEIGHT: 34, NODE_TITLE_TEXT_Y: 23, NODE_SLOT_HEIGHT: 26, NODE_WIDGET_HEIGHT: 26, NODE_TEXT_SIZE: 15, EVENT_LINK_COLOR: "#ffffff", pointerevents_method: "mouse" });
if (LGraphCanvas.link_type_colors) Object.assign(LGraphCanvas.link_type_colors, { number: "#7ad98f", string: "#79a8ff", boolean: "#ff8d82", object: "#6fe3e3" });

// --- Olay düğümleri ---
const BOT_EVENTS = {
  "Mesaj_Gelince": { title: "Mesaj Gelince", action: "post/add", pins: { "user_id": "Kullanıcı ID", "channel_id": "Kanal ID", "message": "Mesaj Metni" } },
  "Mention_Gelince": { title: "Mention Gelince", action: "post/mention", pins: { "user_id": "Kullanıcı ID", "channel_id": "Kanal ID", "message": "Mesaj Metni" } },
  "Ozel_Mesaj_Gelince": { title: "Özel Mesaj Gelince", action: "message/send", pins: { "user_id": "Kullanıcı ID", "message": "Mesaj Metni" } },
  "Turbo_Gelince": { title: "Turbo Gelince", action: "turbo/transfer", pins: { "user_id": "Kullanıcı ID", "message.quantity": "Miktar", "message.message": "Turbo Notu" } },
  "Gruba_Katilma": { title: "Gruba Biri Katılınca", action: "group/join", pins: { "user_id": "Kullanıcı ID", "group_id": "Grup ID" } },
  "Form_Gonderilince": { title: "Form Gönderilince", action: "post/bumote", pins: { "user_id": "Kullanıcı ID", "post_id": "Gönderi ID", "message.submit": "Buton Etiketi" } }
};
Object.entries(BOT_EVENTS).forEach(([k, ev]) => defNode(`Botluyo_Events/${k}`, ev.title, "red", function () {
  this.addOutput("Çalıştır", EVT); Object.values(ev.pins).forEach(p => this.addOutput(p, "string,number"));
}));

// --- Veri düğümleri ---
defNode("Botluyo_Data/Metin", "Metin (String)", "gray", function () { this.addOutput("Metin", "string"); this.addWidget("text", "Değer", "Merhaba", "value"); });
defNode("Botluyo_Data/Sayi", "Sayı (Number)", "gray", function () { this.addOutput("Sayı", "number"); this.addWidget("number", "Değer", 0, "value"); });
defNode("Botluyo_Data/Nesne_Verisi_Al", "Nesneden Veri Al", "blue", function () { this.addInput("Nesne", "object"); this.addWidget("text", "Alan Adı", "id", "value"); this.addOutput("Değer", "string,number"); });
defNode("Botluyo_Data/Form_Alani", "Form Alanı Oku", "purple", function () { this.addWidget("text", "Alan Adı", "isim", "value"); this.addOutput("Değer", "string,number"); });

// --- API düğümleri (renk hatası düzeltildi: her düğüm kendi grubunun tonunu alır) ---
let apiCat = "Genel", apiHue = 210;
API_LIST.trim().split("\n").forEach(line => {
  line = line.trim(); if (!line) return;
  if (line.startsWith("## ")) { const p = line.slice(3).split("|"); apiCat = p[0]; apiHue = parseInt(p[1]) || 210; return; }
  const [endpoint, title, f] = line.split("|"), fields = f ? f.split(",") : [], hue = apiHue;
  function ApiNode() {
    this.title = title; this.color = `hsl(${hue},60%,30%)`; this.bgcolor = `hsl(${hue},60%,15%)`;
    this.addInput("Çalıştır", ACT);
    fields.forEach(x => this.addInput(x.replace("#", ""), x[0] === "#" ? "number" : "string"));
    this.addOutput("Sonraki", EVT); this.addOutput("Yanıt", "object");
  }
  ApiNode.desc = "/!api/" + endpoint;
  regNode(`API_${apiCat}/${endpoint.replace(/\//g, "_")}`, title, ApiNode);
});

// --- Tuval ---
const $ = id => document.getElementById(id), stage = $("stage"), cv = $("blueprint-canvas");
const graph = new LGraph(), canvas = new LGraphCanvas(cv, graph);
Object.assign(canvas, { background_color: "#14161c", render_shadows: false, show_info: false, render_canvas_border: false });
const fit = () => canvas.resize(stage.clientWidth, stage.clientHeight);
addEventListener("resize", fit); addEventListener("orientationchange", () => setTimeout(fit, 250)); fit();
if (canvas.startRendering) canvas.startRendering();

// --- Derleyici ---
const SKELETON = `// Botluyo Blueprint ile otomatik oluşturuldu
const TopluyoBOT = require('topluyo-bot');
const bot = TopluyoBOT(process.env.TOKEN || require('./.token.json'));
let hazir = false;

bot.on('connected', () => { hazir = true; console.log('Bot bağlandı! ✅'); });
bot.on('auth_problem', () => console.error('Token geçersiz! Topluyo > Cihazlarım bölümünden anahtarı yenileyin.'));
bot.on('error', (e) => console.error('[Botluyo] Bağlantı hatası:', e?.message || e));

`;
const H_LISTE = `const _liste = (v, ad) => { if (Array.isArray(v)) return v; if (v != null) console.warn('[Botluyo] ' + ad + ': liste bir dizi değil, döngü atlandı.'); return []; };\n`;
const H_BEKLE = `const _bekle = (sn) => new Promise(r => setTimeout(r, Math.max(0, Number(sn) || 0) * 1000));\n`;

function compile() {
  const d = graph.serialize(), nodes = new Map(d.nodes.map(n => [n.id, n])), links = new Map(d.links.map(l => [l[0], l]));
  const warns = [], warn = m => { if (!warns.includes(m)) warns.push(m); };
  const lbl = n => `${n.title || n.type} #${n.id}`, js = v => JSON.stringify(String(v ?? ""));
  const wv = (n, i, def) => n.widgets_values?.[i] ?? def, inp = (n, i) => n.inputs?.[i]?.link ?? null;
  const OPS = ["==", "!=", ">", "<", ">=", "<="], MOPS = ["+", "-", "*", "/", "%"], DANGER = /(^|\/)(del|kick|block|transfer|reset|hide|logout|reject|leave)(\/|$)/;
  let hoist, rootId, rootKind, emitted = 0; const reached = new Set(), used = { liste: false, bekle: false };

  // Veri teli -> JS ifadesi (bağsızsa null)
  function ex(lid, st = []) {
    const l = lid == null ? null : links.get(lid); if (!l) return null;
    const s = nodes.get(l[1]); if (!s) return null;
    if (st.includes(s.id)) { warn(`Veri teli döngüsü: ${lbl(s)}`); return null; }
    const k = [...st, s.id], a = (i, f) => ex(inp(s, i), k) ?? f, t = s.type;
    if (t.startsWith("Botluyo_Events/")) {
      const ev = BOT_EVENTS[t.split("/")[1]], p = ev && Object.keys(ev.pins)[l[2] - 1]; if (!p) return null;
      if (rootKind !== "message" || s.id !== rootId) warn(`${lbl(s)} verisi, ait olmadığı bir akışta kullanılıyor.`);
      return `data.${p}`;
    }
    switch (t) {
      case "Botluyo_Data/Metin": return js(wv(s, 0, ""));
      case "Botluyo_Data/Sayi": { const n = Number(wv(s, 0, 0)); return String(Number.isFinite(n) ? n : 0); }
      case "Botluyo_Data/Nesne_Verisi_Al": return `(${a(0, "undefined")}?.[${js(wv(s, 0, "id"))}])`;
      case "Botluyo_Data/Form_Alani":
        if (rootKind !== "message") { warn(`${lbl(s)}: form verisi yalnız mesaj olaylarında vardır.`); return "undefined"; }
        return `(data.message?.form?.[${js(wv(s, 0, "isim"))}])`;
      case "Botluyo_Data/Get_Variable": return `(vars[${js(wv(s, 0, "veri1"))}])`;
      case "Botluyo_Logic/Compare": { const o = OPS.includes(wv(s, 0, "==")) ? wv(s, 0, "==") : "=="; return `(${a(0, "undefined")} ${o} ${a(1, "undefined")})`; }
      case "Botluyo_Logic/Includes": return `String(${a(0, '""')} ?? "").includes(String(${a(1, '""')} ?? ""))`;
      case "Botluyo_Logic/Join_Text": return `(String(${a(0, '""')} ?? "") + String(${a(1, '""')} ?? ""))`;
      case "Botluyo_Logic/Get_Word": return `(String(${a(0, '""')} ?? "").trim().split(/\\s+/)[(${a(1, "1")}) - 1] ?? "")`;
      case "Botluyo_Logic/Math_Op": { const o = MOPS.includes(wv(s, 0, "+")) ? wv(s, 0, "+") : "+"; return `(Number(${a(0, "0")}) ${o} Number(${a(1, "0")}))`; }
      case "Botluyo_Logic/ForEach":
        if (l[2] === 1) { hoist.add(`item_${s.id}`); return `item_${s.id}`; }
        if (l[2] === 2) { hoist.add(`i_${s.id}`); return `i_${s.id}`; }
        return null;
    }
    if (t.startsWith("API_") && l[2] === 1) { hoist.add(`res_${s.id}`); return `res_${s.id}`; }
    return null;
  }

  const outs = (n, i) => [...(n.outputs?.[i]?.links || [])].sort((x, y) => x - y).map(id => links.get(id)?.[3]).filter(x => x != null);
  const follow = (n, i, ind, path) => outs(n, i).map(id => walk(id, ind, path)).join("");

  function walk(id, ind, path) {
    const n = nodes.get(id); if (!n) return "";
    if (path.includes(id)) { warn(`Yürütme döngüsü: ${lbl(n)}`); return `${ind}// ⚠ döngü: ${lbl(n)}\n`; }
    if (++emitted > 3000) { warn("Çok fazla düğüm; derleme kesildi."); return ""; }
    reached.add(id); const p = [...path, id], t = n.type; let c = "";
    if (t === "Botluyo_Logic/Print") {
      const v = ex(inp(n, 1)); if (v == null) warn(`${lbl(n)}: Veri bağlı değil.`);
      c = `${ind}console.log(${v ?? '""'});\n`;
    } else if (t === "Botluyo_Logic/Set_Variable") {
      const v = ex(inp(n, 1)); if (v == null) warn(`${lbl(n)}: Değer bağlı değil, null atanır.`);
      c = `${ind}vars[${js(wv(n, 0, "veri1"))}] = ${v ?? "null"};\n`;
    } else if (t === "Botluyo_Logic/Delay") {
      used.bekle = true; const v = ex(inp(n, 1)); if (v == null) warn(`${lbl(n)}: Saniye bağlı değil, 1 sn kullanıldı.`);
      c = `${ind}await _bekle(${v ?? "1"});\n`;
    } else if (t === "Botluyo_Logic/Branch") {
      const v = ex(inp(n, 1)); if (v == null) warn(`${lbl(n)}: Koşul bağlı değil, hep Yanlış kolu çalışır.`);
      return `${ind}if (${v ?? "false"}) {\n${follow(n, 0, ind + "  ", p)}${ind}} else {\n${follow(n, 1, ind + "  ", p)}${ind}}\n` + follow(n, 2, ind, p);
    } else if (t === "Botluyo_Logic/ForEach") {
      used.liste = true; hoist.add(`item_${id}`); hoist.add(`i_${id}`);
      const v = ex(inp(n, 1)); if (v == null) warn(`${lbl(n)}: Liste bağlı değil.`);
      return `${ind}{\n${ind}  const arr_${id} = _liste(${v ?? "null"}, ${js(lbl(n))});\n${ind}  for (i_${id} = 0; i_${id} < arr_${id}.length; i_${id}++) {\n${ind}    item_${id} = arr_${id}[i_${id}];\n${follow(n, 0, ind + "    ", p)}${ind}  }\n${ind}}\n` + follow(n, 3, ind, p);
    } else if (t.startsWith("API_")) {
      hoist.add(`res_${id}`); const ep = t.split("/")[1].replace(/_/g, "/"), args = [], miss = [];
      (n.inputs || []).forEach(i => {
        if (i.type === LiteGraph.ACTION || i.name === "Çalıştır") return;
        const e = ex(i.link); if (e == null) { if (i.type === "number") miss.push(i.name); return; }
        let v = e;
        if (i.type === "number") { const m = /^"(-?\d+(?:\.\d+)?)"$/.exec(e); v = m ? m[1] : /^-?\d+(\.\d+)?$/.test(e) ? e : `Number(${e})`; }
        args.push(`${i.name}: ${v}`);
      });
      if (DANGER.test(ep) && miss.length) warn(`${lbl(n)}: ${miss.join(", ")} bağlı değil.`);
      c = `${ind}res_${id} = await bot.post('/!api/${ep}', { ${args.join(", ")} });\n`;
    } else return "";
    return c + follow(n, 0, ind, p);
  }

  let listeners = "";
  const roots = d.nodes.filter(n => n.type.startsWith("Botluyo_Events/"));
  if (!roots.length) warn("Hiç olay düğümü yok; bot hiçbir şey yapmaz.");
  roots.forEach(ev => {
    hoist = new Set(); rootId = ev.id; reached.add(ev.id);
    const kind = ev.type.endsWith("/Connected") ? "connected" : ev.type.endsWith("/Timer") ? "timer" : "message", def = BOT_EVENTS[ev.type.split("/")[1]];
    if (kind === "message" && !def) return;
    rootKind = kind;
    const b = follow(ev, 0, "    ", [ev.id]); if (!b) warn(`${lbl(ev)}: hiçbir düğüme bağlı değil.`);
    const decl = `  let vars = {}${[...hoist].map(h => ", " + h).join("")};\n`;
    const log = `    console.error(${js("[Botluyo] Hata — " + (ev.title || ev.type) + ":")}, err?.message || err);\n`;
    if (kind === "message") listeners += `bot.on('message', async (data) => {\n  if (data.action !== '${def.action}') return;\n${decl}  try {\n${b}  } catch (err) {\n${log}  }\n});\n\n`;
    else if (kind === "connected") listeners += `bot.on('connected', async () => {\n${decl}  try {\n${b}  } catch (err) {\n${log}  }\n});\n\n`;
    else {
      let sec = Number(wv(ev, 0, 60)); if (!(sec > 0)) sec = 60; sec = Math.max(1, sec);
      listeners += `let _mesgul_${ev.id} = false;\nsetInterval(async () => {\n  if (!hazir || _mesgul_${ev.id}) return;\n  _mesgul_${ev.id} = true;\n${decl}  try {\n${b}  } catch (err) {\n${log}  } finally {\n    _mesgul_${ev.id} = false;\n  }\n}, ${sec} * 1000);\n\n`;
    }
  });
  d.nodes.forEach(n => { if (!reached.has(n.id) && n.inputs?.some(i => i.type === LiteGraph.ACTION)) warn(`${lbl(n)}: hiçbir olaydan ulaşılamıyor, koda girmedi.`); });
  return { code: SKELETON + (used.liste ? H_LISTE : "") + (used.bekle ? H_BEKLE : "") + (used.liste || used.bekle ? "\n" : "") + listeners, warns };
}

// --- Kayıt ---
const KEY = "botluyo_v2_save";
const grow = () => graph._nodes.forEach(n => { const s = n.computeSize(); n.size = [Math.max(n.size[0], s[0]), Math.max(n.size[1], s[1])]; });
function save() { try { graph._nodes.length ? localStorage.setItem(KEY, JSON.stringify(graph.serialize())) : localStorage.removeItem(KEY); return true; } catch (e) { return false; } }
try { const s = localStorage.getItem(KEY); if (s) { graph.configure(JSON.parse(s)); grow(); } } catch (e) { graph.clear(); localStorage.removeItem(KEY); }
if (!graph._nodes.length) { const n = LiteGraph.createNode("Botluyo_Events/Mesaj_Gelince"); n.pos = [40, 140]; graph.add(n); }
setInterval(save, 5000); document.addEventListener("visibilitychange", () => document.hidden && save()); addEventListener("pagehide", save);

// --- Bildirim ---
let tt; function toast(m) { const t = $("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2300); }

// --- Düğüm ekleme paneli (dokunmatikte sağ tık yerine) ---
let CATS;
function catalog() {
  if (CATS) return CATS;
  const names = { Botluyo_Events: "Olaylar", Botluyo_Data: "Veri", Botluyo_Logic: "Mantık ve akış" }, m = new Map(), ord = ["Olaylar", "Veri", "Mantık ve akış"];
  Object.entries(LiteGraph.registered_node_types).forEach(([t, c]) => {
    const k = t.split("/")[0], cat = names[k] || "API · " + k.slice(4);
    if (!m.has(cat)) m.set(cat, []); m.get(cat).push({ t, title: c.title || t, desc: c.desc || "" });
  });
  return CATS = [...m.entries()].sort((a, b) => (ord.indexOf(a[0]) + 1 || 99) - (ord.indexOf(b[0]) + 1 || 99));
}
function renderList(q = "") {
  q = q.toLocaleLowerCase("tr").trim(); const box = $("list"); box.textContent = "";
  catalog().forEach(([cat, items]) => {
    const f = items.filter(i => !q || (i.title + " " + cat + " " + i.desc).toLocaleLowerCase("tr").includes(q)); if (!f.length) return;
    const h = document.createElement("div"); h.className = "cat"; h.textContent = cat; box.append(h);
    f.forEach(i => {
      const b = document.createElement("button"); b.className = "it"; b.textContent = i.title;
      if (i.desc) { const s = document.createElement("small"); s.textContent = i.desc; b.append(s); }
      b.onclick = () => addNode(i.t); box.append(b);
    });
  });
}
function addNode(t) {
  const n = LiteGraph.createNode(t); if (!n) return;
  const r = cv.getBoundingClientRect(), ds = canvas.ds, j = (graph._nodes.length % 6) * 28;
  n.pos = [r.width / 2 / ds.scale - ds.offset[0] - 70 + j, r.height / 2 / ds.scale - ds.offset[1] - 50 + j];
  graph.add(n); canvas.selectNode(n); canvas.setDirty(true, true); closeSheet();
}
function openSheet() { $("sheet").classList.add("open"); $("q").value = ""; renderList(); if (matchMedia("(pointer:fine)").matches) setTimeout(() => $("q").focus(), 50); }
function closeSheet() { $("sheet").classList.remove("open"); }
$("q").oninput = e => renderList(e.target.value);
$("sheet").onclick = e => { if (e.target.id === "sheet") closeSheet(); };
addEventListener("keydown", e => { if (e.key === "Escape") { closeSheet(); $("code").classList.remove("open"); } });

// --- Dokunmatik: tek parmak = fare, iki parmak = kaydır + yakınlaştır ---
(function () {
  const pts = new Map(); let g = null, down = false;
  const fire = (t, p) => cv.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window, clientX: p.x, clientY: p.y, button: 0, buttons: t === "mouseup" ? 0 : 1 }));
  const measure = () => { const a = [...pts.values()]; return { mx: (a[0].x + a[1].x) / 2, my: (a[0].y + a[1].y) / 2, d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1 }; };
  function endSingle() { const f = LiteGraph.release_link_on_empty_shows_menu; LiteGraph.release_link_on_empty_shows_menu = false; fire("mouseup", [...pts.values()][0]); LiteGraph.release_link_on_empty_shows_menu = f; down = false; }
  function gesture() {
    const n = measure(), ds = canvas.ds, r = cv.getBoundingClientRect(), mx = n.mx - r.left, my = n.my - r.top;
    ds.offset[0] += (n.mx - g.mx) / ds.scale; ds.offset[1] += (n.my - g.my) / ds.scale;
    const s = Math.min(3, Math.max(0.25, ds.scale * n.d / g.d)), cx = mx / ds.scale - ds.offset[0], cy = my / ds.scale - ds.offset[1];
    ds.scale = s; ds.offset[0] = mx / s - cx; ds.offset[1] = my / s - cy; g = n; canvas.setDirty(true, true);
  }
  cv.addEventListener("pointerdown", e => {
    if (e.pointerType !== "touch") return; e.preventDefault(); cv.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { down = true; fire("mousedown", pts.get(e.pointerId)); }
    else if (pts.size === 2) { if (down) endSingle(); g = measure(); }
  });
  cv.addEventListener("pointermove", e => {
    if (e.pointerType !== "touch" || !pts.has(e.pointerId)) return; e.preventDefault();
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1 && down) fire("mousemove", pts.get(e.pointerId)); else if (pts.size === 2 && g) gesture();
  });
  const up = e => {
    if (e.pointerType !== "touch" || !pts.has(e.pointerId)) return; e.preventDefault();
    const p = pts.get(e.pointerId); pts.delete(e.pointerId);
    if (down && pts.size === 0) { fire("mouseup", p); down = false; }
    if (pts.size < 2) g = null;
  };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
})();

// --- Düğmeler ---
$("btn-add").onclick = openSheet;
$("btn-save").onclick = () => toast(save() ? "Kaydedildi ✓" : "Kaydedilemedi (depo dolu olabilir)");
$("btn-clear").onclick = () => { if (confirm("Tüm tuval silinsin mi?")) { graph.clear(); localStorage.removeItem(KEY); toast("Tuval temizlendi"); } };
$("btn-del").onclick = () => {
  const sel = Object.values(canvas.selected_nodes || {}); if (!sel.length) return toast("Önce bir düğüme dokun");
  sel.forEach(n => graph.remove(n)); canvas.selected_nodes = {}; canvas.setDirty(true, true);
};
function showCode() {
  const r = compile(), w = $("warn"); $("code-output").textContent = r.code;
  w.style.display = r.warns.length ? "block" : "none"; w.textContent = r.warns.map(x => "⚠ " + x).join("\n");
  $("code").classList.add("open"); return r;
}
$("btn-export").onclick = () => $("code").classList.contains("open") ? $("code").classList.remove("open") : showCode();
$("btn-close").onclick = () => $("code").classList.remove("open");
$("btn-copy").onclick = async () => {
  const o = $("code-output");
  try { await navigator.clipboard.writeText(o.textContent); toast("Kopyalandı ✓"); }
  catch (e) { const r = document.createRange(); r.selectNodeContents(o); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Seçildi, kopyala'ya bas"); }
};
$("btn-download").onclick = () => {
  const r = compile(), zip = new JSZip();
  zip.file("index.js", r.code);
  zip.file("package.json", JSON.stringify({ name: "bot", main: "index.js", scripts: { start: "node index.js" }, dependencies: { "topluyo-bot": "latest" } }, null, 2));
  zip.file(".token.json", '"BURAYA_TOKENINIZI_YAZIN"'); zip.file(".gitignore", ".token.json\nnode_modules/");
  zip.generateAsync({ type: "blob" }).then(c => { saveAs(c, "botluyo-botum.zip"); toast(r.warns.length ? `İndirildi, ${r.warns.length} uyarı var (💻 Kod)` : "ZIP hazır ✓"); });
};
