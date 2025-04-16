### Résumé des Routes Déployées :

---

#### **Utilisateurs (`/user`)**  
- **POST `/signup`**  
  Champs obligatoires : `email`, `username`, `password`.  
  Description : Inscription d'un nouvel utilisateur.  
  Réponse :  
  - Succès : `{ result: true, token }`  
  - Erreurs : `User already exists` (401), `Database insertion error` (400).  

- **POST `/signin`**  
  Champs obligatoires : `email`, `password`.  
  Description : Connexion d'un utilisateur existant.  
  Réponse :  
  - Succès : `{ result: true, token }`  
  - Erreurs : `No such user` (400), `Invalid password` (401).  

- **GET `/extend` 🔒 PROTEGE**  
  Description : Renouvellement du token d'authentification.  
  Réponse : `{ result: true, token }`.  

- **GET `/` 🔒 PROTEGE**  
  Description : Récupération des données de l'utilisateur connecté (sans mot de passe).  
  Réponse : `{ result: true, data: user }`.  

- **GET `/:uID` 🔒 PROTEGE**  
  Description : Récupération des données d'un utilisateur spécifique par son `uID`.  
  Réponse : `{ result: true, data: user }`.  

---

#### **Spots (`/spot`)**  
- **POST `/` 🔒 PROTEGE**  
  Champs obligatoires : `name`, `lon`, `lat`, `category`.  
  Description : Création d'un nouveau spot.  
  Réponse :  
  - Succès : `{ result: true, data: { _id: spotID } }`  
  - Erreurs : `400` (échec d'insertion), `406` (spot trop proche).  

- **GET `/:id` 🔒 PROTEGE**  
  Description : Récupération des données d'un spot par son ID.  
  Réponse : `{ result: Boolean(data), data: spot }`.  

- **GET `/loc/:lon/:lat/:limit` 🔒 PROTEGE**  
  Description : Récupère les spots les plus proches d'une localisation.  
  Réponse :  
  - Succès : `{ result: true, data: [spots] }`  
  - Aucun résultat/Erreur : `{ result: false }` (400).  

---

#### **Figures (`/trick`)**  
- **GET `/`**  
  Description : Liste de toutes les figures disponibles.  
  Réponse : `{ result: true, data: [tricks] }`.  

- **PUT `/validate/:trickID` 🔒 PROTEGE**  
  Description : Valider une figure pour l'utilisateur connecté.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreur : `No such trick` (400).  

- **PUT `/invalidate/:trickID` 🔒 PROTEGE**  
  Description : Retirer une validation de figure pour l'utilisateur connecté.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreur : `No such trick` (400).  

---

#### **Vidéos (`/video`)**  
- **POST `/` 🔒 PROTEGE**  
  Champs obligatoires : `tricks`, `spot`.  
  Description : Upload d'une vidéo (liée à un spot et des figures).  
  Réponse :  
  - Succès : `{ result: true, data: video }`  
  - Erreurs : `Database insertion error` (400), `500` (échec Cloudinary).  

- **PUT `/upvote/:videoID` 🔒 PROTEGE**  
  Description : Ajouter un vote (upvote) à une vidéo.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreurs : `Wrong video ID` (400).  

- **PUT `/unvote/:videoID` 🔒 PROTEGE**  
  Description : Retirer un vote d'une vidéo.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreurs : `Wrong video ID` (400).  

- **DELETE `/:videoID` 🔒 PROTEGE**  
  Description : Supprimer une vidéo (réservé au propriétaire).  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreurs : `No such video`, `You're not the video owner` (400).  

---

#### **Crews (`/crew`)**  
- **GET `/:crewID` 🔒 PROTEGE**  
  Description : Récupération des données d'un crew par son ID.  
  Réponse :  
  - Succès : `{ result: true, data: crew }`  
  - Erreur : `Crew not found` (404).  

- **POST `/create` 🔒 PROTEGE**  
  Champs obligatoires : `name`.  
  Description : Création d'un nouveau crew.  
  Réponse :  
  - Succès : `{ result: true, data: newCrew }`  
  - Erreur : `Already part of one crew` (400).  

- **PUT `/promote/:targetUserID` 🔒 PROTEGE 🛡️ ADMIN**  
  (Middleware `isUserCrewAdminMW` requis)  
  Description : Promouvoir un membre en administrateur du crew.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreur : `Error while promoting user` (400).  

- **PUT `/demote/:targetUserID` 🔒 PROTEGE 🛡️ ADMIN**  
  (Middleware `isUserCrewAdminMW` requis)  
  Description : Rétrograder un administrateur du crew.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreur : `Error while demoting user` (400).  

- **PUT `/add/:targetUserID` 🔒 PROTEGE 🛡️ ADMIN**  
  (Middleware `isUserCrewAdminMW` requis)  
  Description : Ajouter un utilisateur au crew.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreur : `User is already part of a crew` (400).  

- **PUT `/remove/:targetUserID` 🔒 PROTEGE 🛡️ ADMIN**  
  (Middleware `isUserCrewAdminMW` requis)  
  Description : Retirer un utilisateur du crew.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreur : `Error while removing user` (400).  

- **PUT `/leave` 🔒 PROTEGE**  
  Description : Quitter son crew actuel.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreurs : `You're not part of any crew`, `Bad crew Id` (400).  

--- 

**Notes** :  
- 🔒 **PROTEGE** : Route nécessitant un token d'authentification valide.  
- 🛡️ **ADMIN** : Route réservée aux administrateurs de crew (vérifié via `isUserCrewAdminMW`).  
- Les réponses d'erreur incluent toujours un `reason` explicite.
