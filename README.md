**Résumé des routes Express déployées :**

---

### **Utilisateurs** (`/user`) :
- **POST `/signup`**  
  **Description** : Inscription d'un nouvel utilisateur.  
  **Réponse** :  
  - Succès : `{ result: true, token }`  
  - Erreurs : `User already exists`, `Database insertion error` (401, 400).

- **POST `/signin`**  
  **Description** : Connexion d'un utilisateur existant.  
  **Réponse** :  
  - Succès : `{ result: true, token }`  
  - Erreurs : `No such user`, `Invalid password` (400, 401).

- **GET `/extend`**  
  **Description** : Renouvellement du token d'authentification.  
  **Réponse** : `{ result: true, token }`.

- **GET `/`**  
  **Description** : Récupération des données de l'utilisateur connecté (sans mot de passe).  
  **Réponse** : `{ result: true, data: user }`.

- **GET `/:uID`**  
  **Description** : Récupération des données d'un utilisateur spécifique par son `uID`.  
  **Réponse** : `{ result: true, data: user }`.

---

### **Figures (Tricks)** (`/trick`) :
- **GET `/`**  
  **Description** : Liste de toutes les figures disponibles.  
  **Réponse** : `{ result: true, data: [tricks] }`.

- **PUT `/validate/:id`**  
  **Description** : Valider une figure pour l'utilisateur connecté.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreur : `No such trick` (si l'ID n'existe pas).

- **PUT `/devalidate/:id`**  
  **Description** : Retirer une validation de figure pour l'utilisateur connecté.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreur : `No such trick` (si l'ID n'existe pas).

---

### **Spots** (`/spot`) :
- **POST `/`**  
  **Description** : Création d'un nouveau spot (avec localisation et catégorie).  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreur : `400` en cas d'échec d'insertion en base.

- **GET `/:id`**  
  **Description** : Récupération des données d'un spot par son ID.  
  **Réponse** : `{ result: true, data: spot }` (ou `false` si non trouvé).

---

### **Vidéos** (`/video`) :
- **POST `/`**  
  **Description** : Upload d'une vidéo (liée à un spot et des figures).  
  **Réponse** :  
  - Succès : `{ result: true, data: video }`  
  - Erreurs : `Database insertion error`, échec d'upload Cloudinary (500).

- **PUT `/upvote/:videoID`**  
  **Description** : Ajouter un vote (upvote) à une vidéo.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreurs : `No video ID`, `Wrong video ID` (400).

- **PUT `/unvote/:videoID`**  
  **Description** : Retirer un vote d'une vidéo.  
  **Réponse** :  
  - Succès : `{ result: true }`  
  - Erreurs : `No video ID`, `Wrong video ID` (400).

---

**Notes :**  
- Les réponses d'erreur incluent généralement une clé `reason` pour expliciter la cause.  
- Les codes HTTP (ex: `400`, `401`) sont utilisés pour les erreurs critiques.  
- Les données sensibles (mots de passe, `_id`) sont exclues des réponses utilisateur.
