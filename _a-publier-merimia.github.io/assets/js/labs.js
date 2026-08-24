/* ==========================================================================
   Ayat Merimi — Labs interactifs
   Trois outils, tous issus de projets réels. Tout s'exécute côté client :
   aucune donnée ne quitte le navigateur.
   ========================================================================== */

(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* =========================================================================
     LAB 1 — Anonymiseur de plaques
     Détection heuristique classique : gradient horizontal, image intégrale,
     fenêtres glissantes au rapport d'une plaque. Puis pixelisation.
     ========================================================================= */

  function labPlate() {
    var cv = $('#plate-canvas');
    if (!cv) return;
    var ctx = cv.getContext('2d', { willReadFrequently: true });
    var drop = $('#plate-drop'), file = $('#plate-file'), status = $('#plate-status');
    var boxes = [], base = null;

    function say(msg, cls) {
      status.innerHTML = '<div class="alert alert-' + (cls || 'ok') + '"><span aria-hidden="true">•</span><div>' + msg + '</div></div>';
    }

    function load(src) {
      var im = new Image();
      im.onload = function () {
        var sc = Math.min(1, 900 / im.width);
        cv.width = Math.round(im.width * sc);
        cv.height = Math.round(im.height * sc);
        ctx.drawImage(im, 0, 0, cv.width, cv.height);
        base = ctx.getImageData(0, 0, cv.width, cv.height);
        boxes = [];
        $('#plate-tools').style.display = '';
        say('Image chargée (' + cv.width + ' × ' + cv.height + ' px). Lancez la détection, ou tracez vous-même un rectangle sur la zone à masquer.', 'ok');
      };
      im.onerror = function () { say('Impossible de lire ce fichier image.', 'danger'); };
      im.src = src;
    }

    function readFile(f) {
      if (!f || !/^image\//.test(f.type)) { say('Merci de fournir un fichier image.', 'warn'); return; }
      var fr = new FileReader();
      fr.onload = function (e) { load(e.target.result); };
      fr.readAsDataURL(f);
    }

    drop.addEventListener('click', function () { file.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
    file.addEventListener('change', function () { readFile(file.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
    });

    function detect() {
      if (!base) return;
      var W = cv.width, H = cv.height, d = base.data;

      var gray = new Float32Array(W * H);
      for (var i = 0, p = 0; i < d.length; i += 4, p++) {
        gray[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      }
      var edge = new Uint8Array(W * H);
      for (var y = 0; y < H; y++) {
        for (var x = 1; x < W - 1; x++) {
          var k = y * W + x;
          if (Math.abs(gray[k + 1] - gray[k - 1]) > 42) edge[k] = 1;
        }
      }
      var S = W + 1, ii = new Int32Array(S * (H + 1));
      for (var yy = 0; yy < H; yy++) {
        var row = 0;
        for (var xx = 0; xx < W; xx++) {
          row += edge[yy * W + xx];
          ii[(yy + 1) * S + (xx + 1)] = ii[yy * S + (xx + 1)] + row;
        }
      }
      function area(x0, y0, w, h) {
        var x1 = x0 + w, y1 = y0 + h;
        return ii[y1 * S + x1] - ii[y0 * S + x1] - ii[y1 * S + x0] + ii[y0 * S + x0];
      }

      var cands = [], widths = [];
      for (var w0 = Math.max(48, Math.round(W * 0.07)); w0 <= Math.round(W * 0.55); w0 = Math.round(w0 * 1.22)) widths.push(w0);

      widths.forEach(function (bw) {
        var bh = Math.max(10, Math.round(bw / 4.7));
        var step = Math.max(4, Math.round(bw / 10));
        for (var y = 0; y + bh < H; y += step) {
          for (var x = 0; x + bw < W; x += step) {
            var dens = area(x, y, bw, bh) / (bw * bh);
            if (dens < 0.17) continue;
            var mx = Math.round(bw * 0.35), my = Math.round(bh * 0.9);
            var ox = Math.max(0, x - mx), oy = Math.max(0, y - my);
            var ow = Math.min(W - ox, bw + mx * 2), oh = Math.min(H - oy, bh + my * 2);
            var outer = (area(ox, oy, ow, oh) - area(x, y, bw, bh)) / Math.max(1, ow * oh - bw * bh);
            if (dens < outer * 1.9) continue;
            cands.push({ x: x, y: y, w: bw, h: bh, s: dens * (dens / Math.max(outer, 0.01)) });
          }
        }
      });

      cands.sort(function (a, b) { return b.s - a.s; });
      var keep = [];
      cands.forEach(function (c) {
        for (var i = 0; i < keep.length; i++) {
          var k = keep[i];
          var ix = Math.max(0, Math.min(c.x + c.w, k.x + k.w) - Math.max(c.x, k.x));
          var iy = Math.max(0, Math.min(c.y + c.h, k.y + k.h) - Math.max(c.y, k.y));
          if (ix * iy / Math.min(c.w * c.h, k.w * k.h) > 0.25) return;
        }
        if (keep.length < 4) keep.push(c);
      });

      boxes = keep.map(function (c) { return { x: c.x, y: c.y, w: c.w, h: c.h, auto: true }; });
      redraw();

      if (!boxes.length) {
        say('Aucun candidat trouvé. L\'heuristique cherche une zone de forte densité de contours au rapport 4,7 — elle échoue sur les plaques inclinées, floues ou trop petites. <strong>Tracez le rectangle à la main</strong> : c\'est exactement pour cela que je garde un mode manuel.', 'warn');
      } else {
        say('<strong>' + boxes.length + ' zone' + (boxes.length > 1 ? 's candidates détectées' : ' candidate détectée') +
            '.</strong> Vérifiez le cadrage : un faux positif est possible. Ajustez en traçant vos propres rectangles, puis anonymisez.', 'ok');
      }
    }

    function redraw() {
      ctx.putImageData(base, 0, 0);
      boxes.forEach(function (b) {
        ctx.strokeStyle = b.auto ? '#34d399' : '#ff5fa2';
        ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.setLineDash([]);
      });
    }

    function pixelate() {
      if (!boxes.length) { say('Tracez ou détectez au moins une zone avant d\'anonymiser.', 'warn'); return; }
      ctx.putImageData(base, 0, 0);
      boxes.forEach(function (b) {
        var block = Math.max(4, Math.round(b.w / 11));
        for (var y = b.y; y < b.y + b.h; y += block) {
          for (var x = b.x; x < b.x + b.w; x += block) {
            var w = Math.min(block, b.x + b.w - x), h = Math.min(block, b.y + b.h - y);
            if (w <= 0 || h <= 0) continue;
            var px = ctx.getImageData(x, y, w, h).data;
            var r = 0, g = 0, bl = 0, n = px.length / 4;
            for (var i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; bl += px[i + 2]; }
            ctx.fillStyle = 'rgb(' + (r / n | 0) + ',' + (g / n | 0) + ',' + (bl / n | 0) + ')';
            ctx.fillRect(x, y, w, h);
          }
        }
      });
      say('Zones anonymisées de façon <strong>irréversible</strong> : les pixels d\'origine sont remplacés, pas recouverts. Un rectangle opaque posé par-dessus dans un PDF laisse souvent la donnée récupérable — c\'est une erreur classique.', 'ok');
    }

    var dragging = false, sx = 0, sy = 0;
    function pos(e) {
      var r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) };
    }
    cv.addEventListener('pointerdown', function (e) {
      if (!base) return;
      dragging = true; cv.setPointerCapture(e.pointerId);
      var p = pos(e); sx = p.x; sy = p.y;
    });
    cv.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var p = pos(e); redraw();
      ctx.strokeStyle = '#ff5fa2'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(Math.min(sx, p.x), Math.min(sy, p.y), Math.abs(p.x - sx), Math.abs(p.y - sy));
      ctx.setLineDash([]);
    });
    cv.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      var p = pos(e), w = Math.abs(p.x - sx), h = Math.abs(p.y - sy);
      if (w > 8 && h > 5) {
        boxes.push({ x: Math.min(sx, p.x), y: Math.min(sy, p.y), w: w, h: h, auto: false });
        say('Zone ajoutée à la main (' + Math.round(w) + ' × ' + Math.round(h) + ' px).', 'ok');
      }
      redraw();
    });

    $('#plate-detect').addEventListener('click', detect);
    $('#plate-blur').addEventListener('click', pixelate);
    $('#plate-reset').addEventListener('click', function () {
      if (!base) return; boxes = []; redraw(); say('Zones effacées. Image d\'origine restaurée.', 'ok');
    });
    $('#plate-dl').addEventListener('click', function () {
      if (!base) return;
      var a = document.createElement('a');
      a.download = 'image-anonymisee.png'; a.href = cv.toDataURL('image/png'); a.click();
    });
  }

  /* =========================================================================
     LAB 2 — Filtres sur image en niveaux de gris
     Portage dans le navigateur de mon TP Java « GreyImage ».
     ========================================================================= */

  function labFilters() {
    var cv = $('#filt-canvas');
    if (!cv) return;
    var ctx = cv.getContext('2d', { willReadFrequently: true });
    var hist = $('#filt-hist'), hctx = hist.getContext('2d');
    var drop = $('#filt-drop'), file = $('#filt-file'), status = $('#filt-status');
    var seuil = $('#filt-seuil'), tronc = $('#filt-tronc');
    var seuilOut = $('#filt-seuil-val'), troncOut = $('#filt-tronc-val');
    var formula = $('#filt-formula');
    var grey = null, W = 0, H = 0, mode = 'gris';

    function say(msg, cls) {
      status.innerHTML = '<div class="alert alert-' + (cls || 'ok') + '"><span aria-hidden="true">•</span><div>' + msg + '</div></div>';
    }

    /* Une image 2D stockée dans un tableau 1D : pixel(x,y) = data[y * largeur + x] */
    function toGrey(img) {
      var sc = Math.min(1, 760 / img.width);
      W = Math.round(img.width * sc); H = Math.round(img.height * sc);
      cv.width = W; cv.height = H;
      ctx.drawImage(img, 0, 0, W, H);
      var d = ctx.getImageData(0, 0, W, H).data;
      grey = new Uint8ClampedArray(W * H);
      for (var i = 0, p = 0; i < d.length; i += 4, p++) {
        grey[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      }
      $('#filt-tools').style.display = '';
      apply();
      say('Image convertie en niveaux de gris : ' + W + ' × ' + H + ' = <strong>' + (W * H).toLocaleString('fr-FR') + ' pixels</strong>, chacun réduit à une seule valeur entre 0 et 255.', 'ok');
    }

    function apply() {
      if (!grey) return;
      var out = ctx.createImageData(W, H);
      var s = +seuil.value, t = +tronc.value;
      var counts = new Uint32Array(256);

      for (var p = 0, q = 0; p < grey.length; p++, q += 4) {
        var v = grey[p];
        if (mode === 'negatif')  v = 255 - v;
        else if (mode === 'seuil')  v = v < s ? 0 : 255;
        else if (mode === 'tronc')  v = v > t ? t : v;
        counts[v]++;
        out.data[q] = out.data[q + 1] = out.data[q + 2] = v;
        out.data[q + 3] = 255;
      }
      ctx.putImageData(out, 0, 0);
      drawHist(counts);

      formula.textContent = {
        gris:    'v = 0.299·R + 0.587·V + 0.114·B',
        negatif: 'v = 255 − v',
        seuil:   'v = (v < ' + s + ') ? 0 : 255',
        tronc:   'v = (v > ' + t + ') ? ' + t + ' : v'
      }[mode];
    }

    function drawHist(counts) {
      var w = hist.width = hist.clientWidth * 2, h = hist.height = 160;
      hctx.clearRect(0, 0, w, h);
      var max = 0;
      for (var i = 0; i < 256; i++) if (counts[i] > max) max = counts[i];
      if (!max) return;
      var bw = w / 256;
      for (var v = 0; v < 256; v++) {
        var bh = (counts[v] / max) * (h - 10);
        hctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
        hctx.fillRect(v * bw, h - bh, Math.max(bw, 1), bh);
      }
      hctx.strokeStyle = 'rgba(255,95,162,.6)'; hctx.lineWidth = 2;
      hctx.beginPath(); hctx.moveTo(0, h - 1); hctx.lineTo(w, h - 1); hctx.stroke();
    }

    function readFile(f) {
      if (!f || !/^image\//.test(f.type)) { say('Merci de fournir un fichier image.', 'warn'); return; }
      var fr = new FileReader();
      fr.onload = function (e) {
        var im = new Image();
        im.onload = function () { toGrey(im); };
        im.src = e.target.result;
      };
      fr.readAsDataURL(f);
    }

    drop.addEventListener('click', function () { file.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
    file.addEventListener('change', function () { readFile(file.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
    });

    document.querySelectorAll('[data-filt]').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.dataset.filt;
        document.querySelectorAll('[data-filt]').forEach(function (x) {
          x.classList.toggle('accent', x === b);
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        $('#filt-seuil-row').style.display = mode === 'seuil' ? '' : 'none';
        $('#filt-tronc-row').style.display = mode === 'tronc' ? '' : 'none';
        apply();
      });
    });

    seuil.addEventListener('input', function () { seuilOut.textContent = seuil.value; apply(); });
    tronc.addEventListener('input', function () { troncOut.textContent = tronc.value; apply(); });

    $('#filt-dl').addEventListener('click', function () {
      if (!grey) return;
      var a = document.createElement('a');
      a.download = 'image-filtree.png'; a.href = cv.toDataURL('image/png'); a.click();
    });
  }

  /* =========================================================================
     LAB 3 — Morpion contre MinMax
     L'IA explore l'arbre complet des parties possibles. Elle ne perd jamais.
     ========================================================================= */

  function labMorpion() {
    var boardEl = $('#mor-board');
    if (!boardEl) return;
    var statusEl = $('#mor-status'), scoresEl = $('#mor-scores'), countEl = $('#mor-count');
    var board, over, explored, humanFirst = true;

    var LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    function winner(b) {
      for (var i = 0; i < LINES.length; i++) {
        var l = LINES[i];
        if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return { who: b[l[0]], line: l };
      }
      return b.indexOf('') === -1 ? { who: 'nul', line: null } : null;
    }

    /* Score du point de vue de l'IA (O) : +10 si elle gagne, -10 si elle perd,
       moins la profondeur pour préférer les victoires rapides. */
    function minmax(b, isAI, depth) {
      explored++;
      var w = winner(b);
      if (w) {
        if (w.who === 'O') return 10 - depth;
        if (w.who === 'X') return depth - 10;
        return 0;
      }
      var best = isAI ? -Infinity : Infinity;
      for (var i = 0; i < 9; i++) {
        if (b[i]) continue;
        b[i] = isAI ? 'O' : 'X';
        var v = minmax(b, !isAI, depth + 1);
        b[i] = '';
        best = isAI ? Math.max(best, v) : Math.min(best, v);
      }
      return best;
    }

    function aiMove() {
      explored = 0;
      var scores = [], best = -Infinity, choice = -1;
      for (var i = 0; i < 9; i++) {
        if (board[i]) { scores.push(null); continue; }
        board[i] = 'O';
        var v = minmax(board, false, 1);
        board[i] = '';
        scores.push(v);
        if (v > best) { best = v; choice = i; }
      }
      if (choice >= 0) board[choice] = 'O';
      showScores(scores, choice);
      countEl.textContent = explored.toLocaleString('fr-FR');
    }

    function showScores(scores, choice) {
      var html = '<p style="font-family:var(--f-mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--txt-3);margin:0 0 10px">Note calculée pour chaque case</p>';
      html += '<div class="mor-grid mor-scores-grid">';
      for (var i = 0; i < 9; i++) {
        var v = scores[i];
        var cls = i === choice ? ' chosen' : '';
        html += '<div class="mor-score' + cls + '">' + (v === null ? '·' : (v > 0 ? '+' : '') + v) + '</div>';
      }
      html += '</div>';
      scoresEl.innerHTML = html;
    }

    function render() {
      var w = winner(board);
      boardEl.innerHTML = '';
      for (var i = 0; i < 9; i++) {
        var b = document.createElement('button');
        b.className = 'mor-cell' + (board[i] ? ' filled' : '');
        if (w && w.line && w.line.indexOf(i) > -1) b.className += ' win';
        b.textContent = board[i];
        b.disabled = !!board[i] || over;
        b.setAttribute('aria-label', 'Case ' + (i + 1) + (board[i] ? ', occupée par ' + board[i] : ', libre'));
        (function (idx) {
          b.addEventListener('click', function () { play(idx); });
        })(i);
        boardEl.appendChild(b);
      }
      if (w) {
        over = true;
        statusEl.innerHTML = w.who === 'nul'
          ? '<div class="alert alert-ok"><span aria-hidden="true">=</span><div><strong>Match nul.</strong> C\'est le meilleur résultat possible face à cet algorithme.</div></div>'
          : (w.who === 'X'
            ? '<div class="alert alert-danger"><span aria-hidden="true">!</span><div><strong>Vous avez gagné.</strong> Ce ne devrait pas arriver — si vous y parvenez, c\'est un bug, écrivez-moi.</div></div>'
            : '<div class="alert alert-warn"><span aria-hidden="true">✕</span><div><strong>L\'IA gagne.</strong> Elle avait vu cette fin plusieurs coups à l\'avance.</div></div>');
      } else {
        statusEl.innerHTML = '<p style="font-size:.88rem;color:var(--txt-2);margin:0">À vous de jouer — vous êtes les <strong>X</strong>.</p>';
      }
    }

    function play(i) {
      if (over || board[i]) return;
      board[i] = 'X';
      if (!winner(board)) aiMove();
      render();
    }

    function reset(first) {
      board = ['', '', '', '', '', '', '', '', ''];
      over = false; explored = 0;
      humanFirst = first;
      scoresEl.innerHTML = '';
      countEl.textContent = '0';
      if (!humanFirst) aiMove();
      render();
    }

    $('#mor-reset').addEventListener('click', function () { reset(true); });
    $('#mor-ai-first').addEventListener('click', function () { reset(false); });
    reset(true);
  }

  /* --- Démarrage ---------------------------------------------------------- */

  function init() { labPlate(); labFilters(); labMorpion(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
