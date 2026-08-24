# Mettre le site en ligne

Ce dossier est prêt à être publié tel quel. Il contient un site statique — aucune
compilation, aucune dépendance à installer.

**Destination : le dépôt `merimia.github.io`.**
Surtout pas `portfolio-but`, qui reste ton portfolio BUT existant.

---

## 1. Vérifier avant de publier

Ouvre un terminal dans ce dossier et lance un serveur local :

```bash
python -m http.server 8000
```

Puis va sur `http://localhost:8000`. Vérifie rapidement :

- les sept pages s'ouvrent et la navigation fonctionne
- les images s'affichent
- les quatre labs répondent (charge un exemple dans chacun)
- le bouton ◑ bascule bien en thème sombre

Arrête le serveur avec `Ctrl + C`.

---

## 2. Publier

### Si tu as déjà le dépôt en local

```bash
cd chemin/vers/merimia.github.io
git rm -r --cached .          # oublie l'ancien contenu suivi
# supprime les anciens fichiers du dossier, puis copie tout le contenu d'ici
git add .
git commit -m "Refonte complète du portfolio"
git push origin main
```

### Si tu ne l'as pas en local

```bash
git clone https://github.com/merimia/merimia.github.io.git
cd merimia.github.io
# remplace tout le contenu par celui de ce dossier
git add .
git commit -m "Refonte complète du portfolio"
git push origin main
```

### Sans ligne de commande

Sur `github.com/merimia/merimia.github.io` : supprime les anciens fichiers, puis
**Add file → Upload files**, glisse tout le contenu de ce dossier, et valide.

Attention : l'upload par le web ne conserve pas les dossiers vides et peut être
fastidieux avec `assets/`. La ligne de commande est plus fiable ici.

---

## 3. Après la publication

GitHub Pages met une à deux minutes à se rafraîchir. Le site sera sur
**https://merimia.github.io**

Puis :

- **Vide le cache LinkedIn.** Va sur le [Post Inspector](https://www.linkedin.com/post-inspector/),
  colle ton adresse et lance l'analyse. Sans ça, LinkedIn peut garder l'ancien aperçu
  pendant des semaines.
- **Mets l'adresse dans ton CV et ton profil LinkedIn**, si ce n'est pas déjà fait.

---

## Contenu du dossier

```
index.html          Accueil
apropos.html        À propos
design.html         Design & UX
ia-cyber.html       IA & Cybersécurité
backend.html        Backend & Données
reseaux.html        Réseaux & Systèmes
labs.html           Les 4 labs interactifs
404.html            Page d'erreur

cv-ayat-merimi.pdf  Ton CV, lié depuis le site

assets/css/         main.css, fx.css, robot.css
assets/js/          core.js, fx.js, labs.js, robot.js
assets/img/         Captures, schémas, maquettes, portrait, image de partage
assets/doc/         Rapport d'audit, diaporamas DNS et soutenance, business plan

.nojekyll           Empêche GitHub Pages de filtrer certains fichiers — ne pas supprimer
robots.txt          Autorise l'indexation
sitemap.xml         Plan du site pour les moteurs de recherche
README.md           Documentation technique du site
PUBLIER.md          Ce fichier — tu peux le supprimer après publication
```

---

## Ce qui reste à faire un jour

- Publier deux ou trois projets sur GitHub, et remplacer la mention
  « code disponible sur demande » par de vrais liens
- Ajouter tes chiffres si tu en mesures de nouveaux
- Traduire le site en anglais, si tu vises des entreprises internationales

Tout est modifiable directement dans les fichiers HTML. Les couleurs sont
centralisées en haut de `assets/css/main.css`.
