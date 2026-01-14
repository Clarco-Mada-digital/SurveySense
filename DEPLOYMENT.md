# Déploiement sur GitHub Pages

Ce document explique comment déployer l'application SurveySense sur GitHub Pages.

## Configuration effectuée

### 1. Configuration Vite
- **Base path** : `/Questionaire-App/` pour la production
- **Build optimisé** : Séparation des bundles pour de meilleures performances
- **Sourcemaps** : Activés pour le débogage

### 2. Scripts ajoutés
- `build:github` : Build spécifique pour GitHub Pages
- `deploy` : Build et déploiement en une commande

### 3. Workflow GitHub Actions
- Déploiement automatique sur chaque push vers `master`
- Build optimisé avec cache npm
- Déploiement via GitHub Pages

## Méthodes de déploiement

### Méthode 1 : Automatique avec GitHub Actions (Recommandé)

1. **Pousser vers GitHub** :
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin master
   ```

2. **Activer GitHub Pages** :
   - Allez dans les paramètres du repository GitHub
   - Section "Pages" dans le menu de gauche
   - Source : "GitHub Actions"

3. **Attendre le déploiement** :
   - L'action GitHub va s'exécuter automatiquement
   - Le site sera disponible à l'URL : `https://[username].github.io/Questionaire-App/`

### Méthode 2 : Manuel avec gh-pages

1. **Installer gh-pages** (déjà fait) :
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Déployer manuellement** :
   ```bash
   npm run deploy
   ```

3. **Configurer GitHub Pages** :
   - Allez dans les paramètres du repository
   - Section "Pages"
   - Source : "Deploy from a branch"
   - Branch : `gh-pages`
   - Folder : `/ (root)`

## Fichiers modifiés

- `vite.config.ts` : Configuration pour GitHub Pages
- `package.json` : Scripts de déploiement
- `.github/workflows/deploy.yml` : Workflow automation

## Important

- Le nom du repository doit être `Questionaire-App` pour que le base path fonctionne
- Si vous changez le nom, modifiez le base path dans `vite.config.ts`
- L'application utilise le stockage local (localStorage), donc les données ne seront pas partagées entre utilisateurs

## URL attendue

Une fois déployé, votre application sera accessible à :
```
https://[votre-username].github.io/Questionaire-App/
```

## Prochaines étapes

1. Poussez vos modifications vers GitHub
2. Activez GitHub Pages dans les paramètres du repository
3. Testez le déploiement automatique
4. Vérifiez que toutes les fonctionnalités fonctionnent en production
