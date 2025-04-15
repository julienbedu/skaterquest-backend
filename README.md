**Résumé mis à jour des routes Express déployées :**

---

### **Utilisateurs** (`/user`) :
- **POST `/signup`**  
  **Champs obligatoires** : `email`, `username`, `password` (via `checkBodyMW`).  
  **Description** : Inscription d'un nouvel utilisateur.  
  **Réponse** :  
  - Succès : `{ result: true, token }`  
  - Erreurs : `User already exists`, `Database insertion error` (401, 400).

- **POST `/signin`**  
  **Champs obligatoires** : `email`, `password` (via `checkBodyMW`).  
  **Description** : Connexion d'un utilisateur existant.  
  **Réponse** :  
  - Succès : `{ result: true, token }`  
  - Erreurs : `No such user`, `Invalid password` (400, 401).

- **GET `/extend`** 🔒 **PROTEGE**  
  **Description** : Renouvellement du token d'authentification.  
  **Réponse** : `{ result: true, token }`.

- **GET `/`** 🔒 **PROTEGE**  
  **Description** : Récupération des données de l'utilisateur connecté (sans mot de passe).  
  **Réponse** : `{ result: true, data: user }`.

- **GET `/:uID`** 🔒 **PROTEGE**  
  **Description** : Récupération des données d'un utilisateur spécifique par son `uID`.  
  **Réponse** : `{ result: true, data: user }`.

---

### **Figures (Tricks)** (`/trick`) :
- **GET `/`**  
  **Description** : Liste de toutes les figures disponibles.  
  **Réponse** : `{ result: true, data: [tricks] }`.

- **PUT `/validate/:trickID`** 🔒 **PROTEGE**  
  **Description** : Valider une figure pour l'utilisateur connecté.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreur : `No such trick` (si l'ID n'existe pas).

- **PUT `/invalidate/:trickID`** 🔒 **PROTEGE**  
  **Description** : Retirer une validation de figure pour l'utilisateur connecté.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreur : `No such trick` (si l'ID n'existe pas).

---

### **Spots** (`/spot`) :
- **POST `/`** 🔒 **PROTEGE**  
  **Champs obligatoires** : `name`, `lon`, `lat`, `category` (via `checkBodyMW`).  
  **Description** : Création d'un nouveau spot (avec localisation et catégorie).  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreur : `400` en cas d'échec d'insertion en base.

- **GET `/:id`** 🔒 **PROTEGE**  
  **Description** : Récupération des données d'un spot par son ID.  
  **Réponse** : `{ result: true, data: spot }` (ou `false` si non trouvé).

---

### **Vidéos** (`/video`) :
- **POST `/`** 🔒 **PROTEGE**  
  **Champs obligatoires** : `tricks`, `spot` (via `checkBodyMW`).  
  **Description** : Upload d'une vidéo (liée à un spot et des figures).  
  **Réponse** :  
  - Succès : `{ result: true, data: video }`  
  - Erreurs : `Database insertion error`, échec d'upload Cloudinary (500).

- **PUT `/upvote/:videoID`** 🔒 **PROTEGE**  
  **Description** : Ajouter un vote (upvote) à une vidéo.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreurs : `Wrong video ID` (400).

- **PUT `/unvote/:videoID`** 🔒 **PROTEGE**  
  **Description** : Retirer un vote d'une vidéo.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreurs : `Wrong video ID` (400).

- **DELETE `/:videoID`** 🔒 **PROTEGE**  
  **Description** : Supprimer une vidéo (réservé au propriétaire).  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreurs : `No such video`, `You're not the video owner` (400).

---

### **Crews** (`/crew`) :
- **POST `/create`** 🔒 **PROTEGE**  
  **Champs obligatoires** : `name` (via `checkBodyMW`).  
  **Description** : Création d'un nouveau crew.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreur : `Allready part of one crew` (si l'utilisateur appartient déjà à un crew).

- **PUT `/join/:id`** 🔒 **PROTEGE**  
  **Description** : Rejoindre un crew existant.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreurs : `Allready part of one crew`, `Bad crew Id`, `Ooops wtf, bad userID` (400).

- **PUT `/leave`** 🔒 **PROTEGE**  
  **Description** : Quitter son crew actuel.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreurs : `You're not part of any crew`, `Bad crew Id` (400).

---

**Notes :**  
- 🔒 **PROTEGE** : Route nécessitant un token d'authentification valide (`tokenVerifierMW`).  
- Les champs marqués comme obligatoires (ex: `email`, `name`) sont vérifiés par `checkBodyMW`.  
- Les réponses d'erreur incluent une clé `reason` pour expliciter la cause.  
- Les codes HTTP (ex: `400`, `401`) sont utilisés pour les erreurs critiques.