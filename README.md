# Carnet d’histoire — dossiers locaux

Aucun compte ni stockage distant. L’application utilise un dossier choisi sur l’appareil, contenant le fichier **carnet-histoire.json** (fiches, événements, règnes et photos embarquées).

## Ouvrir, mémoriser et changer de dossier

- Cliquer sur **Choisir un dossier**. Un dossier existant charge son carnet ; un dossier vide ouvre un carnet vide. Les autres fichiers ne sont pas modifiés.
- Le navigateur mémorise la référence au dossier dans IndexedDB. Au démarrage suivant, le carnet est rouvert si l’autorisation est encore accordée ; sinon un bouton **Autoriser le dossier** apparaît. Le code ne contourne pas les autorisations du système.
- **Changer de dossier** ouvre un autre carnet, sans transférer ni fusionner le précédent. Terminer l’édition avant de changer. Revenir au premier dossier retrouve ses données.
- Pour déplacer ou copier un carnet : Télécharger une copie, ouvrir le nouveau dossier, puis Importer une sauvegarde. On peut aussi copier carnet-histoire.json avec l’explorateur de fichiers, application fermée.
- **Réautoriser / rouvrir** recharge le fichier, notamment après une modification externe. Exporter sa copie avant de rouvrir si un conflit a été signalé.

## Sauvegarde

Les fiches valides sont sauvegardées automatiquement après une seconde sans saisie. Les champs obligatoires incomplets ou les dates invalides bloquent la sauvegarde et affichent un message. **Sauvegarder et fermer** enregistre immédiatement la fiche ; **Sauvegarder** en haut enregistre tout le carnet. Suppressions et imports sont écrits immédiatement.

**Fermer** ferme le formulaire : cela n’annule pas les modifications déjà sauvegardées automatiquement. Une fermeture ou un rechargement pendant une saisie non validée peut perdre les dernières modifications ; un avertissement est demandé au navigateur lorsqu’une fiche est ouverte. La sauvegarde ne continue pas quand la page est fermée.

Les écritures sont sérialisées et confirmées après fermeture réussie du flux de fichier. Une erreur d’accès ou un manque d’espace est affiché et n’est jamais présenté comme une réussite. Avant chaque écriture, le fichier est comparé à la version chargée : une modification externe détectée bloque l’écrasement. Web Locks sérialise les écritures entre onglets de la même origine ; ce contrôle ne remplace pas un verrou système contre tous les logiciels externes.

Le fichier est limité à 100 Mo, pour rester compatible avec l’import. Les photos JPG/PNG/WebP sont limitées à 5 Mo chacune. Garder régulièrement une copie indépendante : le fichier courant ne constitue pas un historique des versions.

## Compatibilité réelle

Le choix et la mémorisation d’un dossier utilisent File System Access, disponible sur certains navigateurs, principalement Chromium sur ordinateur, en HTTPS ou localhost. Le navigateur mémorise un accès autorisé, pas un chemin absolu arbitraire. Il peut demander de réautoriser cet accès après une fermeture.

Sur les navigateurs non compatibles, notamment de nombreux navigateurs mobiles, l’application utilise IndexedDB et propose le téléchargement/import de fichiers. Elle affiche explicitement qu’un dossier ne peut pas être choisi. Pour garantir l’accès persistant à un dossier sur tous les téléphones comme une application native, une version Android/iOS serait nécessaire.

Effacer les données du navigateur oublie le dossier mémorisé mais ne supprime pas le fichier dans votre dossier. Changer d’adresse du site ou de navigateur nécessite de choisir le dossier à nouveau. Si le dossier est synchronisé par un logiciel tiers, la synchronisation est gérée par ce logiciel.

## Publication et développement

Node.js 24 : `npm ci`, `npm test`, `npm run build`, `npm run dev`. GitHub Pages publie `dist` via le workflow fourni. Aucune clé API ni variable de connexion n’est nécessaire.

Le chargement initial du site requiert Internet ; cette version ne garantit pas une réouverture hors ligne. Les écritures dans le dossier sont locales. L’historique Git conserve les anciennes versions ; elles ne font pas partie du site compilé actuel.

## Sécurité et validation

Aucun transfert applicatif distant ; politique CSP bloquant les connexions et scripts externes. Les imports sont validés, les textes rendus par React, les images SVG/HTML et URL externes refusées. La base et les fichiers ne sont pas chiffrés par l’application. Protéger l’appareil et le compte GitHub et activer HTTPS.

Les tests couvrent le stockage navigateur, les imports invalides, les changements de dossier, l’isolement entre carnets, les photos, les modifications externes, les écritures refusées et les échecs disque à l’aide de fichiers simulés. La compilation TypeScript/Vite est vérifiée. Le sélecteur natif, la sérialisation réelle des accès aux dossiers par le navigateur et la réautorisation après redémarrage restent à vérifier sur les appareils cibles.
