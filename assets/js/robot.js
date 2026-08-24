/* ==========================================================================
   Ayat Merimi — Mascotte « bit »
   Page Design & UX uniquement.
   Sa position horizontale reflète la progression dans la page : c'est un
   indicateur de lecture qui a pris la forme d'un personnage.
   ========================================================================== */

(function () {
  'use strict';

  var LINES = [
    'Bonjour. Je suis le seul élément décoratif de ce site — et encore, j\'indique ta progression.',
    'Un écran n\'est pas fini tant que ses états vide, chargement et erreur ne sont pas dessinés.',
    'Le contraste et la navigation clavier ne sont pas du confort. Ce sont des exigences.',
    'L\'utilisateur qui contourne une interface mal pensée devient la première faille du système.',
    'Je marche vers la droite quand tu descends. C\'est tout mon programme.'
  ];

  var SVG =
    '<button class="bit-btn" aria-label="Parler à la mascotte">' +
      '<span class="bit-flip" style="display:block">' +
      '<svg width="46" height="54" viewBox="0 0 46 54" aria-hidden="true" focusable="false">' +
        '<g class="bit-body">' +
          '<path d="M23 8V3" stroke="#ff5fa2" stroke-width="2" stroke-linecap="round"/>' +
          '<circle class="ant" cx="23" cy="2.6" r="2.6" fill="#ff5fa2"/>' +
          '<rect x="6" y="8" width="34" height="25" rx="7" fill="#ff5fa2"/>' +
          '<rect x="11" y="14" width="24" height="12" rx="4" fill="#12131a"/>' +
          '<g class="eyes">' +
            '<circle cx="18" cy="20" r="2.4" fill="#ffd6e6"/>' +
            '<circle cx="28" cy="20" r="2.4" fill="#ffd6e6"/>' +
          '</g>' +
          '<rect x="13" y="34" width="20" height="10" rx="4" fill="#d94a86"/>' +
          '<rect class="leg-l" x="17" y="44" width="4.5" height="7" rx="2" fill="#b03a6b"/>' +
          '<rect class="leg-r" x="25" y="44" width="4.5" height="7" rx="2" fill="#b03a6b"/>' +
        '</g>' +
      '</svg>' +
      '</span>' +
    '</button>' +
    '<div class="bit-say" role="status" aria-live="polite"></div>';

  function init() {
    var bit = document.createElement('div');
    bit.id = 'bit';
    bit.innerHTML = SVG;
    document.body.appendChild(bit);

    var say = bit.querySelector('.bit-say');
    var btn = bit.querySelector('.bit-btn');
    var lastY = window.scrollY || 0;
    var stopTimer = null, sayTimer = null, idx = -1;

    function place() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;

      var travel = Math.max(0, window.innerWidth - bit.offsetWidth - 32);
      bit.style.transform = 'translateX(' + (16 + p * travel).toFixed(1) + 'px)';

      if (Math.abs(y - lastY) > 1) {
        bit.classList.toggle('left', y < lastY);
        bit.classList.add('walk');
        clearTimeout(stopTimer);
        stopTimer = setTimeout(function () { bit.classList.remove('walk'); }, 160);
      }
      lastY = y;
    }

    btn.addEventListener('click', function () {
      idx = (idx + 1) % LINES.length;
      say.textContent = LINES[idx];
      bit.classList.add('say');
      clearTimeout(sayTimer);
      sayTimer = setTimeout(function () { bit.classList.remove('say'); }, 6000);
    });

    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    place();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
