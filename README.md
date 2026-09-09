# Carnet d’histoire — stockage local et GitHub Pages

Cette version est une application statique React/Vite. Aucun compte ChatGPT, serveur, API, D1 ou R2 n’est nécessaire. Les fiches, événements, règnes et photos restent dans IndexedDB sur l’appareil, dans le navigateur utilisé. GitHub Pages héberge uniquement les fichiers de l’application : les fiches saisies ne sont pas envoyées à GitHub.

## Sauvegarder et transférer le carnet

Utiliser **Exporter une sauvegarde** pour télécharger un fichier JSON contenant toutes les fiches et photos. Sur l’autre appareil, ouvrir le même site puis **Importer une sauvegarde**. L’import ajoute les nouvelles fiches et remplace celles ayant le même identifiant, après confirmation. Les autres fiches sont conservées. Un fichier invalide est refusé intégralement.

Conserver les exports hors du dossier du dépôt (par exemple Documents/Sauvegardes). Ne pas envoyer les sauvegardes personnelles sur GitHub. Il n’y a pas de synchronisation automatique entre appareils, navigateurs ou adresses du site. Effacer les données du navigateur, utiliser un mode privé ou changer l’adresse du site peut faire perdre l’accès au carnet local. La demande de stockage persistant dépend du navigateur et ne remplace pas les exports.

## Publier sur GitHub Pages

1. Créer un dépôt GitHub vide, par exemple `carnet-histoire`. Avec GitHub Free, choisir un dépôt public pour utiliser Pages. Le code et le site seront publics ; les fiches locales ne sont pas dans le dépôt.
2. Avec GitHub Desktop : **File → Add local repository**, choisir ce dossier, enregistrer toutes les modifications avec un commit puis **Publish repository**. Ou utiliser les commandes ci-dessous après avoir installé Git et vous être connecté à GitHub.
3. Dans le dépôt GitHub : **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Le workflow `.github/workflows/pages.yml` compile et publie le site lors d’un push sur `main` ou `master`. Si nécessaire, ouvrir **Actions → Publier le carnet sur GitHub Pages → Run workflow** après avoir activé Pages.
5. Attendre la réussite du workflow puis ouvrir le lien affiché dans **Settings → Pages**. L’adresse habituelle est `https://VOTRE-PSEUDO.github.io/carnet-histoire/`.

```powershell
git add .
git commit -m "Stockage local et publication GitHub Pages"
git remote add origin https://github.com/VOTRE-PSEUDO/carnet-histoire.git
git push -u origin HEAD:main
```

Remplacer VOTRE-PSEUDO et carnet-histoire par vos valeurs. Si `origin` existe déjà, vérifier `git remote -v` puis utiliser le dépôt voulu ; ne pas remplacer un dépôt existant sans vérifier. Ne pas exécuter deux méthodes de création de dépôt à la fois : avec GitHub Desktop, vous pouvez laisser **Publish repository** créer le dépôt au lieu de le créer au préalable.

Le chemin relatif des ressources fonctionne pour un dépôt projet, un site à la racine ou un domaine personnalisé. Aucun secret GitHub à créer : le workflow utilise les autorisations standard de GitHub Actions.

## Développement

Node.js 24 recommandé.

```powershell
npm ci
npm run dev
npm test
npm run build
npm run preview
```

`dist` est le site compilé. Il faut le servir en HTTP(S), pas ouvrir `index.html` par double-clic. Les sauvegardes locales fonctionnent sans appeler un serveur. Cette version ne garantit pas la réouverture hors connexion : le téléchargement initial de l’application nécessite Internet. L’installation sur l’écran d’accueil dépend du navigateur.

## Ancienne version ChatGPT

La modification locale ne désactive pas le site déjà publié. Il reste privé tant que vous ne modifiez pas ses autorisations. Les données de cette ancienne version ne sont pas migrées automatiquement, car elles sont sur son serveur et son domaine. Si vous avez déjà saisi des fiches, récupérer leur export (photos comprises) avant de supprimer l’ancien hébergement. Le dépôt Git conserve l’historique de l’ancienne implémentation ; la version actuelle ne l’utilise plus.

## Vérifications

`npm test` vérifie la persistance IndexedDB avec un moteur de test, la création, la modification, les photos embarquées, la relecture, les imports, le rejet des sauvegardes invalides et la suppression. `npm run build` vérifie TypeScript et produit le site statique. La publication réelle nécessite votre dépôt GitHub ; aucun dépôt n’a été créé ni publié automatiquement.

Documentation : https://docs.github.com/fr/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Sécurité et limites

Les fiches ne sont pas transmises à un serveur et aucun compte n’est demandé. Le bouton **Enregistrer** valide une fiche et l’écrit dans IndexedDB. **Sauvegarder dans un fichier** télécharge le carnet complet avec les photos. La saisie non validée n’est pas automatiquement enregistrée.

Le site compilé limite les scripts à sa propre origine et bloque les connexions applicatives, objets et cadres externes via une politique CSP. Les notes sont affichées comme du texte par React. Les imports sont validés avant une écriture atomique ; seules des photos embarquées JPG/PNG/WebP sont acceptées, sans HTML ni SVG. Ces protections réduisent les risques, sans garantir une sécurité absolue.

Les fichiers JSON et la base locale ne sont pas chiffrés par l’application. Une personne ayant accès au même profil de navigateur peut lire le carnet. Les applications sous le même domaine GitHub Pages partagent une origine : les noms de bases par chemin évitent les collisions, mais ne constituent pas une isolation de sécurité. Héberger le carnet sous un domaine dédié si d’autres sites non fiables partagent votre domaine.

Avant publication : activer **Enforce HTTPS** dans GitHub Pages et protéger le compte GitHub avec l’authentification à deux facteurs (cela concerne l’administrateur, pas les utilisateurs du carnet). Maintenir navigateur et dépendances à jour. Un compte d’hébergement compromis ou une extension malveillante peut contourner les protections de l’application. La configuration de l’hébergement n’a pas été vérifiée : aucun dépôt GitHub n’a encore été fourni.

Vérification du 9 septembre 2026 : les anciennes dépendances serveur inutilisées ont été retirées, Vite mis à jour vers 8.2.2 et les correctifs compatibles appliqués. `npm audit fix` a terminé avec **0 vulnérabilité connue** sur 306 paquets audités. Ce résultat est daté, ne couvre pas les failles inconnues et ne constitue pas un audit d’intrusion. La politique CSP a été ajoutée au build ; son comportement dans les navigateurs et la configuration HTTPS réelle restent à contrôler lors de la publication.
