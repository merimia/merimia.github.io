/* ==========================================================================
   Ayat Merimi — Couche d'ambiance
   Réduit au strict nécessaire : un fond teinté fixe. Pas de curseur
   personnalisé, pas de magnétisme, pas de particules.
   ========================================================================== */

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init() {
    if (document.querySelector('.ambient')) return;
    var a = document.createElement('div');
    a.className = 'ambient';
    a.setAttribute('aria-hidden', 'true');
    a.innerHTML = '<i></i><i></i>';
    document.body.insertBefore(a, document.body.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
