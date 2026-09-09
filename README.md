# Carnet d’histoire

Application web personnelle en français, adaptée au téléphone et installable depuis le navigateur. Les données sont sauvegardées en ligne dans D1 et les photos dans R2, séparées par utilisateur connecté.

Fonctionnalités : création, modification et suppression des personnages et règnes ; photos ; événements datés ; frise avec périodes de vie en haut et règnes en bas ; zoom et défilement horizontal ; accès aux fiches depuis la frise.

Une connexion Internet est nécessaire. Les dates complètes de naissance/décès et début/fin sont requises (années 0001 à 9999). Les dates avant notre ère et les dates incertaines ne sont pas prises en charge.

Développement : `npm run install:ci`, `npm run dev`. Compilation : `npm run build`. Schéma : `npm run db:generate`. Les migrations locales se chargent avec Wrangler, selon le fichier généré dans `drizzle`. Les migrations de production sont appliquées par Sites.

Vérification : `npx tsc --noEmit`, puis `node scripts/test-api.mjs` avec le serveur local lancé et la migration appliquée. Les tests utilisent exclusivement l’identité locale simulée et suppriment la fiche de test.

L’intégration WebMCP ouvre le formulaire de création ; elle reste facultative et n’a pas été vérifiée dans un contexte WebMCP compatible. Aucun test visuel dans un navigateur n’a été demandé ni exécuté.
