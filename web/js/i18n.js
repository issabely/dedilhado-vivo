/* Dedilhado Vivo · idiomas (pt, es, en). Traduz o texto da tela por dicionário, sem mexer na lógica do app. */
(function () {
  "use strict";
  var root = document.documentElement;
  var LANG = root.getAttribute("data-lang") || "pt";
  var native = !!window.ReactNativeWebView || location.protocol === "file:";
  var KEY = "dv-lang";
  function getPref() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setPref(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var isBot = navigator.webdriver || /bot|crawl|spider|lighthouse|headless|preview/i.test(navigator.userAgent);
  // raiz do site (funciona no domínio e também em servidor local, ex.: 127.0.0.1:5501/web/)
  var path = location.pathname.replace(/index\.html$/, "");
  var ROOT = LANG === "pt" ? path : path.replace(/(es|en)\/$/, "");
  var BASE = { pt: ROOT, es: ROOT + "es/", en: ROOT + "en/" };

  // Preferência salva: quem escolheu outro idioma volta direto para ele
  if (!native && !isBot && LANG === "pt" && /\/$/.test(path) && !/\/(blog|violao|violino|piano|flauta-transversal|afinador-online)\/$/.test(path)) {
    var p = getPref();
    if (p === "es" || p === "en") { location.replace(BASE[p] + location.search + location.hash); return; }
  }

  function go(l) {
    setPref(l);
    if (native) return;
    if (location.pathname === BASE[l]) location.reload();
    else location.href = BASE[l] + location.search + location.hash;
  }

  // Seletor de idioma no cabeçalho
  function setupSelect() {
    var sel = document.getElementById("langSel");
    if (!sel || native) return;
    sel.hidden = false;
    sel.value = LANG;
    sel.addEventListener("change", function () { go(sel.value); });
  }

  // Sugestão de idioma (uma vez), para quem tem o navegador em espanhol ou inglês
  function suggest() {
    if (native || isBot || getPref()) return;
    var nl = ((navigator.languages && navigator.languages[0]) || navigator.language || "").slice(0, 2).toLowerCase();
    if (nl === LANG || (nl !== "es" && nl !== "en" && nl !== "pt")) return;
    var txt = { es: ["¿Prefieres en español?", "Ver en español", "No, gracias"],
                en: ["Prefer English?", "View in English", "No, thanks"],
                pt: ["Prefere em português?", "Ver em português", "Não, obrigado"] }[nl];
    var bar = document.createElement("div");
    bar.setAttribute("data-noi18n", "");
    bar.setAttribute("style", "position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;background:#172033;color:#fff;padding:10px 14px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.25);font:600 15px system-ui,sans-serif;max-width:calc(100% - 24px)");
    bar.innerHTML = '<span>' + txt[0] + '</span><button type="button" style="border:0;border-radius:999px;padding:7px 14px;font:inherit;background:#4c8dff;color:#fff;cursor:pointer">' + txt[1] + '</button><button type="button" style="border:0;background:none;color:#cfd6e6;font:inherit;cursor:pointer">' + txt[2] + '</button>';
    var b = bar.querySelectorAll("button");
    b[0].onclick = function () { go(nl); };
    b[1].onclick = function () { setPref(LANG); bar.remove(); };
    document.body.appendChild(bar);
  }

  if (LANG === "pt" || !window.DV_DICT) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setupSelect(); suggest(); });
    else { setupSelect(); suggest(); }
    return;
  }

  // ---------- Tradução ----------
  var D = window.DV_DICT;            // {exact: {pt: tr}, tpl: [[pt, tr], ...], notes: {...}}
  var EX = D.exact, NOTES = D.notes || {};
  var TPL = (D.tpl || []).map(function (p) {
    var parts = p[0].split(/(\{\d+\})/), re = "^", order = [];
    parts.forEach(function (x) {
      var m = /^\{(\d+)\}$/.exec(x);
      if (m) { re += "(.+?)"; order.push(+m[1]); } else re += x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    return { re: new RegExp(re + "$"), order: order, out: p[1], lit: p[0].replace(/\{\d+\}/g, "").length };
  }).sort(function (a, b) { return b.lit - a.lit; });
  var NOTE_RE = /^(Dó|Ré|Mi|Fá|Sol|Lá|Si)(?=$|[\s♯♭#b𝄪𝄫\d·,–\-\/()])/;
  var NOTE_ANY = /(Dó|Ré|Mi|Fá|Sol|Lá|Si)(?=$|[\s♯♭#b𝄪𝄫\d·,–\-\/()])/g;
  var NOTEISH = /^(?:\s*(?:Dó|Ré|Mi|Fá|Sol|Lá|Si)\s?(?:[♯♭#b𝄪𝄫])?\s?-?\d?\s*[·,–\-\/]?\s*)+$/;
  var memo = new Map();

  function noteSwap(s) {
    var out = s.replace(NOTE_ANY, function (n) { return NOTES[n] || n; });
    if (D.lettersJoin) out = out.replace(/([A-G])\s(\d)\b/g, "$1$2");
    return out;
  }
  function tr(s) {
    var t = s.replace(/\s+/g, " ").trim();
    if (!t || !/[A-Za-zÀ-ÿ]/.test(t)) return null;
    if (memo.has(t)) return memo.get(t);
    var r = null;
    if (EX.hasOwnProperty(t)) r = EX[t];
    else if (NOTEISH.test(t)) r = noteSwap(t);
    else {
      for (var i = 0; i < TPL.length; i++) {
        var m = TPL[i].re.exec(t);
        if (m) {
          var outp = TPL[i].out, ord = TPL[i].order;
          r = outp.replace(/\{(\d+)\}/g, function (_, k) {
            var v = m[ord.indexOf(+k) + 1]; if (v == null) return "";
            var tv = tr(v); return tv == null ? v : tv;
          });
          break;
        }
      }
    }
    if (r == null) r = compose(t);
    if (memo.size > 6000) memo.clear();
    memo.set(t, r);
    return r;
  }
  var EXL = null;
  function part(x) { var v = tr(x); return v == null ? x : v; }
  function compose(t) {
    var m, out;
    if (t.indexOf(" · ") > 0) {
      out = t.split(" · ").map(part).join(" · ");
      return out !== t ? out : null;
    }
    if ((m = /^(.{2,40}?:)\s*(.+)$/.exec(t)) && EX.hasOwnProperty(m[1])) {
      return EX[m[1]] + " " + m[2].split(/,\s*/).map(part).join(", ");
    }
    if ((m = /^(.+?)\s+(\d+[ªº]?)$/.exec(t)) && EX.hasOwnProperty(m[1])) return EX[m[1]] + " " + m[2];
    if ((m = /^(\d+)\s+(.+)$/.exec(t)) && EX.hasOwnProperty(m[2])) return m[1] + " " + EX[m[2]];
    if ((m = /^(.+?)\s*\((.+)\)$/.exec(t)) && EX.hasOwnProperty(m[1])) return EX[m[1]] + " (" + part(m[2]) + ")";
    if ((m = /^(\d+\.\s+)(.+)$/.exec(t)) && tr(m[2]) != null) return m[1] + tr(m[2]);
    if ((m = /^(←\s*)(.+)$/.exec(t)) && tr(m[2]) != null) return m[1] + tr(m[2]);
    if ((m = /^(.+?)(\s*→)$/.exec(t)) && tr(m[1]) != null) return tr(m[1]) + m[2];
    if ((m = /^([·:;,.\-–—]\s*)(.+)$/.exec(t)) && tr(m[2]) != null) return m[1] + tr(m[2]);
    if ((m = /^(.+?)(\s*[·:;,.\-–—])$/.exec(t)) && EX.hasOwnProperty(m[1])) return EX[m[1]] + m[2];
    if (t.length > 2 && t === t.toUpperCase() && t !== t.toLowerCase()) {
      if (!EXL) { EXL = {}; for (var k in EX) EXL[k.toLowerCase()] = EX[k]; }
      var lw = t.toLowerCase(), hit = EXL[lw];
      if (hit == null && (m = /^(.+?)\s+(\d+)$/.exec(lw)) && EXL[m[1]] != null) hit = EXL[m[1]] + " " + m[2];
      if (hit != null) return hit.toUpperCase();
    }
    var RX = D.rx || [];
    for (var i = 0; i < RX.length; i++) { var re = new RegExp(RX[i][0]); if (re.test(t)) return t.replace(re, RX[i][1]); }
    return null;
  }
  function apply(s) {
    var r = tr(s); if (r == null || r === s.trim()) return null;
    var lead = /^\s*/.exec(s)[0], trail = /\s*$/.exec(s)[0];
    return lead + r + trail;
  }
  var ATTRS = ["title", "aria-label", "placeholder", "alt"];
  var busy = false;
  function skip(el) {
    for (var e = el; e && e !== document.body; e = e.parentNode)
      if (e.nodeType === 1 && (e.tagName === "SCRIPT" || e.tagName === "STYLE" || e.tagName === "TEXTAREA" || e.isContentEditable || e.hasAttribute("data-noi18n"))) return true;
    return false;
  }
  function doText(n) {
    if (skip(n.parentNode)) return;
    var v = apply(n.nodeValue); if (v != null) n.nodeValue = v;
  }
  var LINKS = D.links || {};
  function doAttrs(el) {
    if (el.tagName === "A") { var h = el.getAttribute("href"); if (h && LINKS[h]) el.setAttribute("href", LINKS[h]); }
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute && el.getAttribute(ATTRS[i]);
      if (a) { var v = apply(a); if (v != null) el.setAttribute(ATTRS[i], v); }
    }
  }
  function walk(rootNode) {
    if (rootNode.nodeType === 3) { doText(rootNode); return; }
    if (rootNode.nodeType !== 1 || skip(rootNode)) return;
    doAttrs(rootNode);
    var w = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }
  var mo = new MutationObserver(function (list) {
    if (busy) return; busy = true;
    try {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === "characterData") doText(m.target);
        else if (m.type === "attributes") { var v = apply(m.target.getAttribute(m.attributeName) || ""); if (v != null) m.target.setAttribute(m.attributeName, v); }
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    } finally { mo.takeRecords(); busy = false; }
  });
  function start() {
    busy = true; walk(document.body); busy = false;
    var tt = apply(document.title); if (tt) document.title = tt;
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    setupSelect(); suggest();
  }
  ["alert", "confirm", "prompt"].forEach(function (f) {
    var orig = window[f]; if (!orig) return;
    window[f] = function (msg) { var a = [].slice.call(arguments); if (typeof msg === "string") { a[0] = msg.split("\n").map(function (l) { var v = apply(l); return v == null ? l : v; }).join("\n"); } return orig.apply(window, a); };
  });
  window.DV_TR = function (s) { var v = apply(String(s)); return v == null ? s : v; };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
