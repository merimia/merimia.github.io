/* ==========================================================================
   Ayat Merimi — Portfolio
   Moteur d'interactions partagé
   ========================================================================== */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Thème ------------------------------------------------------------ */

  var saved = null;
  try { saved = localStorage.getItem('am-theme'); } catch (e) {}
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('am-theme', next); } catch (e) {}
    var b = document.getElementById('theme-btn');
    if (b) b.textContent = next === 'light' ? '◐' : '◑';
  }

  /* --- Séquence de démarrage -------------------------------------------- */

  function boot() {
    var el = document.getElementById('boot');
    if (!el) return;
    // Ne rejouer qu'une fois par session
    var seen = false;
    try { seen = sessionStorage.getItem('am-boot') === '1'; } catch (e) {}
    if (seen || REDUCED) { el.remove(); return; }

    var lines = el.querySelectorAll('.boot-line');
    var bar = el.querySelector('.boot-bar i');
    var i = 0;
    var step = setInterval(function () {
      if (lines[i]) lines[i].classList.add('show');
      if (bar) bar.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
      i++;
      if (i >= lines.length) {
        clearInterval(step);
        setTimeout(function () {
          el.classList.add('done');
          try { sessionStorage.setItem('am-boot', '1'); } catch (e) {}
          setTimeout(function () { el.remove(); }, 550);
        }, 340);
      }
    }, 150);
  }

  /* --- Navigation -------------------------------------------------------- */

  function nav() {
    var bar = document.querySelector('.nav');
    var prog = document.getElementById('progress');

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (bar) bar.classList.toggle('scrolled', y > 10);
      if (prog) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var burger = document.getElementById('burger');
    var links = document.getElementById('nav-links');
    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          links.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    var tb = document.getElementById('theme-btn');
    if (tb) {
      tb.addEventListener('click', toggleTheme);
      tb.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '◐' : '◑';
    }
  }

  /* --- Révélation au scroll --------------------------------------------- */

  function reveal() {
    var items = document.querySelectorAll('.rv');
    if (!items.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    items.forEach(function (n) { io.observe(n); });
  }

  /* --- Compteurs animés -------------------------------------------------- */

  function counters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(function (n) { n.textContent = n.dataset.count + (n.dataset.suffix || ''); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var t0 = performance.now(), dur = 1300;
        (function tick(t) {
          var p = Math.min((t - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (n) { io.observe(n); });
  }

  /* --- Timeline progressive ---------------------------------------------- */

  function timeline() {
    var tl = document.querySelector('.timeline');
    if (!tl) return;
    var fill = tl.querySelector('.tl-fill');
    var items = tl.querySelectorAll('.tl-item');

    function upd() {
      var r = tl.getBoundingClientRect();
      var p = (window.innerHeight * 0.62 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      if (fill) fill.style.height = (p * r.height) + 'px';
      items.forEach(function (it) {
        var ir = it.getBoundingClientRect();
        it.classList.toggle('on', ir.top < window.innerHeight * 0.68);
      });
    }
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* --- Terminal interactif ------------------------------------------------ */

  var FS = {
    help: function () {
      return [
        ['mut', 'Commandes disponibles :'],
        ['', '  whoami        qui je suis'],
        ['', '  skills        stack technique'],
        ['', '  ls piliers    les 4 domaines'],
        ['', '  projects      projets marquants'],
        ['', '  contact       comment me joindre'],
        ['', '  cv            télécharger mon CV'],
        ['', '  sudo hire-me  ce que je cherche'],
        ['', '  clear         nettoyer l\'écran']
      ];
    },
    whoami: function () {
      return [
        ['ok', 'ayat_merimi'],
        ['', 'BUT Informatique — Université de Lorraine'],
        ['', 'Ingénieure Cybersécurité — CNAM Saint-Dié (2026 → 2029)'],
        ['mut', 'Je construis des systèmes complets, puis j\'essaie de les casser.']
      ];
    },
    skills: function () {
      return [
        ['', 'langages   python · c · c# · java · php · javascript · swift'],
        ['', 'back       node.js · rest · jwt · mysql · mariadb'],
        ['', 'front      angular · swiftui · java swing · figma'],
        ['', 'sécurité   owasp · appsec · crypto · rgpd'],
        ['', 'systèmes   linux · docker · gitlab ci · tcp/ip']
      ];
    },
    'ls piliers': function () {
      return [
        ['', 'design/       UX, interfaces, créativité'],
        ['', 'ia-cyber/     vision par ordinateur & sécurité applicative'],
        ['', 'backend/      web, bases de données, API'],
        ['', 'reseaux/      systèmes, infrastructure, architecture'],
        ['mut', 'Astuce : « cd design » pour ouvrir un pilier.']
      ];
    },
    projects: function () {
      return [
        ['ok', '1. Reconnaissance de plaques    OpenCV · chiffrement · RGPD'],
        ['ok', '2. Microservice REST sécurisé   JWT · 500+ utilisateurs en production'],
        ['ok', '3. Jardin de Cocagne            web + Android · RBAC · paiement'],
        ['ok', '4. Plateforme Ministère         PHP · MVC · tests de sécurité'],
        ['mut', 'Détail complet dans chaque pilier.']
      ];
    },
    contact: function () {
      return [
        ['', 'email     ayamerimi2016@gmail.com'],
        ['', 'linkedin  linkedin.com/in/ayat-merimi'],
        ['', 'github    github.com/merimia']
      ];
    },
    cv: function () {
      setTimeout(function () { window.open('cv-ayat-merimi.pdf', '_blank', 'noopener'); }, 400);
      return [['ok', 'Ouverture du CV…']];
    },
    'sudo hire-me': function () {
      return [
        ['ok', '[sudo] mot de passe : ********'],
        ['', 'Recherche : alternance dev / cybersécurité'],
        ['', 'Rythme    : compatible CNAM Saint-Dié-des-Vosges'],
        ['', 'Mobilité  : selon le poste'],
        ['ok', 'Statut    : disponible immédiatement']
      ];
    }
  };
  var ROUTES = {
    'cd design': 'design.html', 'cd ia-cyber': 'ia-cyber.html',
    'cd backend': 'backend.html', 'cd reseaux': 'reseaux.html',
    'cd labs': 'labs.html'
  };

  function terminal() {
    var body = document.getElementById('term-body');
    var input = document.getElementById('term-input');
    if (!body || !input) return;

    var history = [], hIdx = -1;

    function put(cls, text) {
      var p = document.createElement('p');
      if (cls) p.className = cls;
      p.textContent = text;
      body.appendChild(p);
      body.scrollTop = body.scrollHeight;
    }

    function run(raw) {
      var cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
      var line = document.createElement('p');
      line.className = 'cmd';
      line.innerHTML = '<b>ayat@portfolio</b>:~$ ';
      line.appendChild(document.createTextNode(raw));
      body.appendChild(line);

      if (!cmd) { body.scrollTop = body.scrollHeight; return; }
      history.unshift(raw); hIdx = -1;

      if (cmd === 'clear') { body.innerHTML = ''; return; }
      if (ROUTES[cmd]) { put('ok', 'Navigation vers ' + ROUTES[cmd] + '…'); setTimeout(function () { location.href = ROUTES[cmd]; }, 450); return; }
      if (cmd === 'ls') cmd = 'ls piliers';
      if (cmd === 'sudo') { put('err', 'usage : sudo hire-me'); return; }

      var fn = FS[cmd];
      if (!fn) { put('err', 'commande introuvable : ' + cmd + '  —  tapez « help »'); return; }
      fn().forEach(function (r) { put(r[0], r[1]); });
      body.scrollTop = body.scrollHeight;
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { run(input.value); input.value = ''; }
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hIdx > 0) { hIdx--; input.value = history[hIdx]; }
        else { hIdx = -1; input.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        var v = input.value.trim().toLowerCase();
        if (!v) return;
        var all = Object.keys(FS).concat(Object.keys(ROUTES));
        var m = all.filter(function (k) { return k.indexOf(v) === 0; });
        if (m.length === 1) input.value = m[0];
        else if (m.length > 1) put('mut', m.join('   '));
      }
    });

    document.querySelectorAll('[data-term-run]').forEach(function (b) {
      b.addEventListener('click', function () {
        run(b.dataset.termRun);
        input.focus();
      });
    });

    body.parentElement.addEventListener('click', function (e) {
      if (!e.target.closest('a, button')) input.focus();
    });

    // Message d'accueil
    put('mut', 'Portfolio d\'Ayat Merimi — session interactive');
    put('mut', 'Tapez « help » pour la liste des commandes. Tab pour compléter.');
  }

  /* --- Filtres de projets -------------------------------------------------- */

  function filters() {
    var bar = document.querySelector('[data-filter-bar]');
    if (!bar) return;
    var items = document.querySelectorAll('[data-tags]');
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      bar.querySelectorAll('button').forEach(function (x) {
        x.classList.toggle('accent', x === b);
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      var f = b.dataset.f;
      items.forEach(function (it) {
        var show = f === 'all' || (it.dataset.tags || '').split(' ').indexOf(f) > -1;
        it.style.display = show ? '' : 'none';
        if (show && !REDUCED) {
          it.animate(
            [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
            { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' }
          );
        }
      });
    });
  }

  /* --- Easter egg (Konami) -------------------------------------------------- */

  function egg() {
    var seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var i = 0;
    window.addEventListener('keydown', function (e) {
      if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = (k === seq[i]) ? i + 1 : (k === seq[0] ? 1 : 0);
      if (i === seq.length) {
        i = 0;
        var box = document.getElementById('egg');
        if (!box) return;
        box.textContent = '⚑ Flag capturé : AM{recrutez_moi_en_alternance}';
        box.classList.add('show');
        setTimeout(function () { box.classList.remove('show'); }, 5200);
      }
    });
  }

  /* --- Année courante ------------------------------------------------------- */

  function year() {
    document.querySelectorAll('[data-year]').forEach(function (n) {
      n.textContent = new Date().getFullYear();
    });
  }

  /* --- Démarrage ------------------------------------------------------------ */

  /* --- Récit : les jalons s'allument au passage ------------------------- */

  function story() {
    var steps = document.querySelectorAll('.story-step');
    if (!steps.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      steps.forEach(function (s) { s.classList.add('on'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -80px 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }

  function init() {
    boot(); nav(); reveal(); counters();
    timeline(); story(); terminal(); filters(); egg(); year();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
