/* Dedilhado Vivo · blog: botões "Ouvir" e montador de acordes */
(function () {
  "use strict";
  var ctx = null, master = null;
  function audio() {
    if (!ctx) {
      try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.5;
      var comp = ctx.createDynamicsCompressor();
      master.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function freq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function tone(m, t, dur, vol) {
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o1.type = "triangle"; o2.type = "sine";
    o1.frequency.value = freq(m); o2.frequency.value = freq(m) * 2;
    var g2 = ctx.createGain(); g2.gain.value = 0.25;
    f.type = "lowpass"; f.frequency.value = 2400;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(f); f.connect(master);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(vol * 0.45, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function play(ms, mode, btn) {
    if (!audio() || !ms.length) return 0;
    var t = ctx.currentTime + 0.06, total = 0, v = Math.min(0.5, 0.9 / Math.sqrt(ms.length));
    if (mode === "seq") {
      ms.forEach(function (m, i) { tone(m, t + i * 0.42, 0.9, 0.5); });
      total = ms.length * 0.42 + 0.6;
    } else if (mode === "chord") {
      ms.forEach(function (m) { tone(m, t, 2.2, v); }); total = 2.2;
    } else {
      ms.forEach(function (m, i) { tone(m, t + i * 0.32, 1.0, 0.45); });
      var t2 = t + ms.length * 0.32 + 0.25;
      ms.forEach(function (m) { tone(m, t2, 2.2, v); });
      total = ms.length * 0.32 + 2.4;
    }
    if (btn) { btn.classList.add("on"); setTimeout(function () { btn.classList.remove("on"); }, total * 1000); }
    return total;
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("button.play");
    if (!b) return;
    var raw = b.getAttribute("data-notes") || "", mode = b.getAttribute("data-mode") || "both";
    if (mode === "prog") {
      if (!audio()) return;
      var chords = raw.split("|").map(function (c) { return c.split(",").filter(Boolean).map(Number); });
      var t0 = ctx.currentTime + 0.06;
      chords.forEach(function (ch, i) { var v = Math.min(0.5, 0.9 / Math.sqrt(ch.length)); ch.forEach(function (m) { tone(m, t0 + i * 1.3, 1.6, v); }); });
      b.classList.add("on"); setTimeout(function () { b.classList.remove("on"); }, (chords.length * 1.3 + 0.6) * 1000);
      return;
    }
    play(raw.split(",").filter(Boolean).map(Number), mode, b);
  });

  /* ---------- Montador de acordes ---------- */
  var box = document.getElementById("montador-app");
  if (!box) return;
  var LG = (document.documentElement.lang || "pt").slice(0, 2);
  var LET = "CDEFGAB", NAT = [0, 2, 4, 5, 7, 9, 11];
  var PT = LG === "es" ? ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"] : LG === "en" ? ["C", "D", "E", "F", "G", "A", "B"] : ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"];
  var L10 = { pt: ["maior", "Notas", "Fórmula", "Dó"], es: ["mayor", "Notas", "Fórmula", "Do"], en: ["major", "Notes", "Formula", "C"] }[LG] || ["maior", "Notas", "Fórmula", "Dó"];
  var ACC = { "-2": "𝄫", "-1": "♭", "0": "", "1": "♯", "2": "𝄪" };
  var ROOTS = [["C", 0, 0], ["D♭", 1, -1], ["D", 1, 0], ["E♭", 2, -1], ["E", 2, 0], ["F", 3, 0], ["F♯", 3, 1], ["G", 4, 0], ["A♭", 5, -1], ["A", 5, 0], ["B♭", 6, -1], ["B", 6, 0]];
  // grau: [passos de letra, semitons]
  var IV = { "1": [0, 0], "2": [1, 2], "♭3": [2, 3], "3": [2, 4], "4": [3, 5], "♭5": [4, 6], "5": [4, 7], "♯5": [4, 8], "6": [5, 9], "𝄫7": [6, 9], "♭7": [6, 10], "7": [6, 11], "8": [7, 12], "9": [8, 14] };
  var TYPES = [
    ["", "maior", ["1", "3", "5"], "Tríade maior: alegre, estável."],
    ["m", "menor", ["1", "♭3", "5"], "Tríade menor: mais triste ou introspectiva."],
    ["5", "quinta (power chord)", ["1", "5", "8"], "Só fundamental, quinta e oitava. Nem maior nem menor: muito usado no rock."],
    ["sus4", "sus4", ["1", "4", "5"], "A terça vira quarta: som 'suspenso', que pede para resolver."],
    ["sus2", "sus2", ["1", "2", "5"], "A terça vira segunda: som aberto, moderno."],
    ["°", "diminuto", ["1", "♭3", "♭5"], "Duas terças menores: som tenso."],
    ["+", "aumentado", ["1", "3", "♯5"], "Duas terças maiores: som misterioso, de suspense."],
    ["7", "com sétima (dominante)", ["1", "3", "5", "♭7"], "Maior com sétima menor: o acorde que 'puxa' para o próximo."],
    ["7M", "com sétima maior", ["1", "3", "5", "7"], "Maior com sétima maior: suave, cara de bossa nova e jazz."],
    ["m7", "menor com sétima", ["1", "♭3", "5", "♭7"], "Menor com sétima menor: macio, muito usado em MPB e pop."],
    ["m7(♭5)", "meio-diminuto", ["1", "♭3", "♭5", "♭7"], "Diminuto com sétima menor (ø). Aparece antes do V em tom menor."],
    ["°7", "diminuto com sétima", ["1", "♭3", "♭5", "𝄫7"], "Três terças menores seguidas: muita tensão, ótimo de passagem."],
    ["m(7M)", "menor com sétima maior", ["1", "♭3", "5", "7"], "Menor com sétima maior: som de filme de suspense."],
    ["6", "com sexta", ["1", "3", "5", "6"], "Maior com sexta: doce, comum no samba e na bossa."],
    ["(9)", "com nona (add9)", ["1", "3", "5", "9"], "Maior com nona e sem sétima: brilho extra."],
    ["7(9)", "sétima e nona", ["1", "3", "5", "♭7", "9"], "Dominante com nona: rico, comum no samba e no jazz."],
    ["7M(9)", "sétima maior e nona", ["1", "3", "5", "7", "9"], "Sonoridade de bossa nova."]
  ];
  var TL = { es: [["mayor", "Tríada mayor: alegre, estable."], ["menor", "Tríada menor: más triste o introspectiva."], ["quinta (power chord)", "Solo fundamental, quinta y octava. Ni mayor ni menor: muy usado en el rock."], ["sus4", "La tercera se vuelve cuarta: sonido 'suspendido' que pide resolver."], ["sus2", "La tercera se vuelve segunda: sonido abierto y moderno."], ["disminuido", "Dos terceras menores: sonido tenso."], ["aumentado", "Dos terceras mayores: sonido misterioso, de suspenso."], ["con séptima (dominante)", "Mayor con séptima menor: el acorde que 'empuja' hacia el siguiente."], ["con séptima mayor", "Mayor con séptima mayor: suave, con aire de bossa nova y jazz."], ["menor con séptima", "Menor con séptima menor: suave, muy usado en el pop y el soul."], ["semidisminuido", "Disminuido con séptima menor (ø). Aparece antes del V en tonalidad menor."], ["disminuido con séptima", "Tres terceras menores seguidas: mucha tensión, ideal de paso."], ["menor con séptima mayor", "Menor con séptima mayor: sonido de película de suspenso."], ["con sexta", "Mayor con sexta: dulce, común en el samba y la bossa."], ["con novena (add9)", "Mayor con novena y sin séptima: brillo extra."], ["séptima y novena", "Dominante con novena: rico, común en el samba y el jazz."], ["séptima mayor y novena", "Sonido de bossa nova."]], en: [["major", "Major triad: bright, stable."], ["minor", "Minor triad: darker or more introspective."], ["fifth (power chord)", "Only root, fifth and octave. Neither major nor minor: a rock staple."], ["sus4", "The third becomes a fourth: a 'suspended' sound that wants to resolve."], ["sus2", "The third becomes a second: open, modern sound."], ["diminished", "Two minor thirds: tense sound."], ["augmented", "Two major thirds: mysterious, suspenseful sound."], ["dominant seventh", "Major with a minor seventh: the chord that 'pulls' to the next one."], ["major seventh", "Major with a major seventh: soft, bossa nova and jazz feel."], ["minor seventh", "Minor with a minor seventh: mellow, common in pop and soul."], ["half-diminished", "Diminished with a minor seventh (ø). Comes before V in minor keys."], ["diminished seventh", "Three stacked minor thirds: lots of tension, great as a passing chord."], ["minor-major seventh", "Minor with a major seventh: suspense-movie sound."], ["sixth", "Major with a sixth: sweet, common in samba and bossa."], ["add ninth (add9)", "Major with a ninth and no seventh: extra sparkle."], ["seventh and ninth", "Dominant with a ninth: rich, common in samba and jazz."], ["major seventh and ninth", "The bossa nova sound."]] }[LG];
  if (TL) TYPES.forEach(function (T, i) { T[1] = TL[i][0]; T[3] = TL[i][1]; });
  var root = 0, type = 7;
  function spell(r, deg) {
    var R = ROOTS[r], li = R[1], rpc = (NAT[li] + R[2] + 12) % 12;
    var iv = IV[deg], L = (li + iv[0]) % 7;
    var want = (rpc + iv[1]) % 12, acc = want - NAT[L];
    while (acc > 6) acc -= 12; while (acc < -6) acc += 12;
    var m = 48 + rpc + iv[1];
    return { pt: PT[L] + ACC[acc], c: LET[L] + ACC[acc], m: m };
  }
  var NS = "http://www.w3.org/2000/svg";
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function draw(tones, degs) {
    var W = 26, H = 112, BW = 16, BH = 70, whites = [];
    for (var m = 48; m <= 76; m++) if ([0, 2, 4, 5, 7, 9, 11].indexOf(m % 12) >= 0) whites.push(m);
    var svg = el("svg", { viewBox: "-1 -1 " + (whites.length * W + 2) + " " + (H + 30), "class": "kbd", role: "img", "aria-label": "Teclado com o acorde" });
    var on = {}; tones.forEach(function (t, i) { on[t.m] = { lab: degs[i], name: t.pt }; });
    var xs = {};
    whites.forEach(function (m, i) {
      var x = i * W; xs[m] = x + W / 2;
      el("rect", { x: x, y: 0, width: W, height: H, rx: 3, "class": on[m] ? "wk on" : "wk" }, svg);
      if (m % 12 === 0 && !on[m]) { var t = el("text", { x: x + W / 2, y: H - 8, "class": "kc" }, svg); t.textContent = L10[3]; }
    });
    whites.slice(0, -1).forEach(function (m, i) {
      if ([1, 3, 6, 8, 10].indexOf((m + 1) % 12) >= 0) {
        var x = (i + 1) * W - BW / 2; xs[m + 1] = x + BW / 2;
        el("rect", { x: x, y: 0, width: BW, height: BH, rx: 2, "class": on[m + 1] ? "bk on" : "bk" }, svg);
      }
    });
    Object.keys(on).forEach(function (k) {
      var m = +k, black = [1, 3, 6, 8, 10].indexOf(m % 12) >= 0, cy = black ? BH - 13 : H - 18;
      el("circle", { cx: xs[m], cy: cy, r: 10, "class": "dot" }, svg);
      var t = el("text", { x: xs[m], y: cy + 4, "class": "dt" }, svg); t.textContent = on[k].lab;
      var n = el("text", { x: xs[m], y: H + 20, "class": "kn" }, svg); n.textContent = on[k].name;
    });
    return svg;
  }
  var rRow = box.querySelector("[data-r]"), tRow = box.querySelector("[data-t]"), out = box.querySelector(".out"), kb = box.querySelector(".kb"), pb = box.querySelector("button.play");
  ROOTS.forEach(function (R, i) {
    var b = document.createElement("button"); b.type = "button"; b.className = "ch"; b.textContent = R[0];
    b.onclick = function () { root = i; render(true); }; rRow.appendChild(b);
  });
  TYPES.forEach(function (T, i) {
    var b = document.createElement("button"); b.type = "button"; b.className = "ch";
    b.textContent = T[0] || L10[0]; b.title = T[1];
    b.onclick = function () { type = i; render(true); }; tRow.appendChild(b);
  });
  function render(sound) {
    [].forEach.call(rRow.children, function (b, i) { b.setAttribute("aria-pressed", i === root); });
    [].forEach.call(tRow.children, function (b, i) { b.setAttribute("aria-pressed", i === type); });
    var T = TYPES[type], degs = T[2], tones = degs.map(function (d) { return spell(root, d); });
    var name = ROOTS[root][0] + T[0];
    out.innerHTML = "<b>" + name + "</b> · " + spell(root, "1").pt + " " + T[1] +
      "<br>" + L10[1] + ": <b>" + tones.map(function (t) { return t.pt; }).join(" · ") + "</b><br>" + L10[2] + ": " + degs.join(" – ") + "<br><span style='color:var(--ink2);font-size:15px'>" + T[3] + "</span>";
    kb.innerHTML = ""; kb.appendChild(draw(tones, degs));
    pb.setAttribute("data-notes", tones.map(function (t) { return t.m; }).join(","));
    if (sound) play(tones.map(function (t) { return t.m; }), "chord", pb);
  }
  render(false);
})();
