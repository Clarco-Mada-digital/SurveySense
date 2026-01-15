# SurveySense 📝

**SurveySense** est une application web moderne et élégante pour la création, la gestion et l'analyse de questionnaires. Conçue avec une approche "Private-by-Design", elle garantit que toutes vos données restent sous votre contrôle exclusif.

![Survey Illustration](https://mgx-backend-cdn.metadl.com/generate/images/903894/2026-01-13/8a27dd6a-bd12-4fb0-b6fa-e919f906967d.png)

## 🌟 Fonctionnalités Principales

- **Générateur de Formulaires Intuitif** : Créez des questions variées (texte, choix multiples, cases à cocher, échelles, oui/non).
- **Analyse Visuelle** : Tableaux de bord automatiques avec graphiques interactifs (Recharts).
- **Gestion Complète** : Modifiez, supprimez et dupliquez vos questionnaires facilement.
- **Export/Import Flexible** : Sauvegardez vos données en JSON ou exportez les réponses en CSV pour Excel.
- **Accessibilité** : Interface responsive adaptée au mobile et au desktop.

## 🛡️ Sécurité & Confidentialité des Données

SurveySense se distingue par ses mesures de protection avancées :

### 1. Approche "Local-First"
Contrairement aux solutions cloud classiques, SurveySense ne possède pas de base de données centrale. **Toutes vos données (questionnaires et réponses) sont stockées localement dans votre navigateur.** Elles ne transitent jamais par un serveur tiers.

### 2. Chiffrement AES-256
Pour prévenir tout accès non autorisé via le stockage physique du navigateur, toutes les données sont chiffrées à l'aide de l'algorithme **AES (Advanced Encryption Standard)** avant d'être sauvegardées. Même en inspectant votre stockage local, un intrus ne verra que des données illisibles.

### 3. Protection des Résultats par PIN Haché
Vous pouvez protéger l'accès aux statistiques d'un questionnaire par un code PIN à 4 chiffres.
- **Hachage SHA-256** : Le code PIN n'est jamais stocké en clair. Seule son empreinte numérique est conservée.
- **Salage (Salt)** : Un sel unique est généré pour chaque questionnaire, rendant le décryptage par force brute pratiquement impossible.

### 4. Verrouillage de l'Éditeur & Suppression
La sécurité s'étend désormais à la gestion du questionnaire :
- **Modification protégée** : L'accès à l'interface de modification d'un questionnaire existant nécessite la validation du code PIN.
- **Suppression sécurisée** : Un code PIN valide est requis pour supprimer définitivement un questionnaire protégé, évitant les pertes de données accidentelles ou malveillantes.

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript
- **Styling** : Tailwind CSS, shadcn/ui
- **Animations** : Framer Motion
- **Graphiques** : Recharts
- **Sécurité** : CryptoJS (AES, SHA-256)
- **Tooling** : Vite, pnpm

## 🚀 Installation et Démarrage

### Installation des dépendances
```shell
pnpm i
```

### Lancement en mode développement
```shell
pnpm run dev
```

### Build pour la production
```shell
pnpm run build
```

---
© 2026 SurveySense - Sécurité et Confidentialité avant tout.
