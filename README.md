# Portfolio — Ayat Merimi

Site statique, sans framework ni étape de compilation. Tout est en HTML, CSS et JavaScript natifs :
tu peux ouvrir n'importe quel fichier et le modifier directement.

## Mise en ligne

1. Ouvre ton dépôt `merimia/merimia.github.io` sur GitHub.
2. Remplace le contenu par les fichiers de ce dossier (garde ton `cv-ayat-merimi.pdf` à la racine).
3. Valide et pousse. GitHub Pages met le site à jour en une à deux minutes.

Pour tester en local avant de publier :

```bash
cd site
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

Ouvrir `index.html` par double-clic fonctionne aussi, mais le serveur local reproduit
plus fidèlement le comportement réel.

## Structure

```
index.html        Accueil — les 4 portes d'entrée
design.html       Pilier 1 — Design, UX & Créativité
ia-cyber.html     Pilier 2 — IA & Cybersécurité
backend.html      Pilier 3 — Web, Bases de données & Backend
reseaux.html      Pilier 4 — Réseaux, Systèmes & Architecture
labs.html         Les 4 outils interactifs

assets/css/main.css   Design system : couleurs, typo, composants
assets/css/fx.css     Couche d'ambiance : accents roses, fond teinté
assets/css/robot.css  Mascotte « bit » (page Design uniquement)
assets/js/core.js     Navigation, révélations, terminal, compteurs
assets/js/fx.js       Fond teinté
assets/js/labs.js     Logique des 4 labs
assets/js/robot.js    Mascotte « bit » (page Design uniquement)
assets/img/           Tes captures d'écran (à remplir)
```

## Thème

Le site s'ouvre en **clair**. Le bouton ◑ de la barre de navigation bascule en sombre, et le
choix est mémorisé dans le navigateur. Pour changer le mode par défaut, remplace
`data-theme="light"` par `data-theme="dark"` dans la balise `<html>` de chaque page.

Le terminal de l'accueil reste sombre dans les deux modes — c'est volontaire.

## Modifier les couleurs

Tout est centralisé en haut de `assets/css/main.css`, dans le bloc `:root` :

```css
--brand:  #00e5a0;   /* menthe */
--pink:   #ff5fa2;   /* ton rose signature */
--violet: #a855f7;

--p-design: #ff5fa2;  /* accent du pilier Design */
--p-cyber:  #34d399;  /* accent du pilier IA & Cyber */
--p-back:   #56a8ff;  /* accent du pilier Backend */
--p-net:    #fbbf24;  /* accent du pilier Réseaux */
```

Change une valeur, tout le site suit.

## Emplacements à remplir

Deux marqueurs à chercher dans le code quand tu ajoutes du contenu :

- `<figure class="shot">` — zone d'image en attente. Remplace le bloc entier par
  `<img src="assets/img/nom.png" alt="description">`.
- `data-profile` — lien de profil CTF en attente d'une vraie URL (`ia-cyber.html`).

L'image de partage LinkedIn se place dans `assets/img/og.png`, au format 1200 × 630 px.

## Accessibilité & performance

- Navigable entièrement au clavier, avec lien d'évitement
- Respecte `prefers-reduced-motion` : toutes les animations s'éteignent
- Contenu lisible même si le JavaScript ne se charge pas
- Aucune dépendance externe hors Google Fonts
- Les labs ne font aucune requête réseau : tout s'exécute dans le navigateur

## Easter egg

Le code Konami (↑ ↑ ↓ ↓ ← → ← → B A) affiche un flag. Le terminal de l'accueil accepte
`help`, `whoami`, `skills`, `projects`, `cd design`, `sudo hire-me`, avec historique
(flèches haut/bas) et complétion (Tab).

## La mascotte « bit »

Le petit robot rose n'existe que sur `design.html`. Sa position horizontale suit ta
progression dans la page — c'est une barre de progression déguisée, pas une décoration
gratuite. Il se retourne quand tu remontes, s'arrête quand tu arrêtes de défiler, et
affiche une phrase quand on clique dessus.

Il disparaît sous 760 px de large et se fige si `prefers-reduced-motion` est activé.

Pour changer ses répliques : tableau `LINES` en haut de `assets/js/robot.js`.
Pour le retirer : supprimer les deux lignes `robot.css` et `robot.js` dans `design.html`.
Pour l'ajouter ailleurs : copier ces deux lignes dans la page voulue — mais le texte
de la section « Le petit robot en bas de l'écran » explique pourquoi il n'est que là.
