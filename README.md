**Résumé des routes :**

---

### **Spot (/spot)**  
- **POST /** 🔒 **PROTEGE**  
  *Champs obligatoires : `name`, `lon`, `lat`, `category`*  
  *Description* : Création d'un nouveau spot.  
  *Réponse* :  
  - Succès : `{ result: true, data: spot }`  
  - Erreurs : `406` (spot trop proche), `400` (échec d'insertion).  

- **GET /loc/:lon/:lat/:limit** 🔒 **PROTEGE**  
  *Description* : Récupère les spots proches d'une localisation.  
  *Réponse* :  
  - Succès : `{ result: true, data: [spots] }`  
  - Erreur : `400` (aucun résultat).  

- **GET /:spotID** 🔒 **PROTEGE**  
  *Description* : Récupération d'un spot par son ID.  
  *Réponse* : `{ result: Boolean(data), data: spot }`.  

- **POST /picture/:spotID** 🔒 **PROTEGE** 📤 **FICHIER**  
  *Description* : Ajoute une image à un spot.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreurs : `500` (échec Cloudinary), `400` (erreur de mise à jour).  

---

### **Video (/video)**  
- **POST /** 🔒 **PROTEGE** 📤 **FICHIER**  
  *Champs obligatoires : `spot`*  
  *Description* : Upload d'une vidéo.  
  *Réponse* :  
  - Succès : `{ result: true, data: video }`  
  - Erreurs : `400` (erreur base de données), `500` (échec Cloudinary).  

- **PUT /upvote/:videoID** 🔒 **PROTEGE**  
  *Description* : Ajouter un upvote à une vidéo.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreur : `400` (ID incorrect).  

- **PUT /unvote/:videoID** 🔒 **PROTEGE**  
  *Description* : Retirer un vote d'une vidéo.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreur : `400` (ID incorrect).  

- **DELETE /:videoID** 🔒 **PROTEGE**  
  *Description* : Supprimer une vidéo (réservé au propriétaire).  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreurs : `400` (vidéo inexistante, utilisateur non propriétaire).  

---

### **Crew (/crew)**  
- **GET /:crewID** 🔒 **PROTEGE**  
  *Description* : Récupération des données d'un crew.  
  *Réponse* :  
  - Succès : `{ result: true, data: crew }`  
  - Erreur : `404` (crew non trouvé).  

- **POST /** 🔒 **PROTEGE**  
  *Champs obligatoires : `name`*  
  *Description* : Création d'un nouveau crew.  
  *Réponse* :  
  - Succès : `{ result: true, data: newCrew }`  
  - Erreur : `400` (déjà dans un crew).  

- **PUT /promote/:targetUserID** 🔒 **PROTEGE** 🛡️ **ADMIN**  
  *Description* : Promouvoir un membre en admin.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreur : `400` (échec de promotion).  

- **PUT /demote/:targetUserID** 🔒 **PROTEGE** 🛡️ **ADMIN**  
  *Description* : Rétrograder un admin.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreur : `400` (échec de rétrogradation).  

- **PUT /add/:targetUserID** 🔒 **PROTEGE** 🛡️ **ADMIN**  
  *Description* : Ajouter un utilisateur au crew.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreur : `400` (utilisateur déjà dans un crew).  

- **PUT /remove/:targetUserID** 🔒 **PROTEGE** 🛡️ **ADMIN**  
  *Description* : Retirer un utilisateur du crew.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreur : `400` (échec de suppression).  

- **PUT /leave** 🔒 **PROTEGE**  
  *Description* : Quitter son crew.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreurs : `400` (non membre ou erreur).  

---

### **User (/user)**  
- **POST /signup**  
  *Champs obligatoires : `email`, `username`, `password`*  
  *Description* : Inscription d'un utilisateur.  
  *Réponse* :  
  - Succès : `{ result: true, data: { token, uID, username, email } }`  
  - Erreurs : `401` (utilisateur existant), `400` (erreur base de données).  

- **POST /signin**  
  *Champs obligatoires : `email`, `password`*  
  *Description* : Connexion d'un utilisateur.  
  *Réponse* :  
  - Succès : `{ result: true, data: { token, uID, username, email } }`  
  - Erreurs : `400` (utilisateur inexistant), `401` (mot de passe invalide).  

- **GET /extend** 🔒 **PROTEGE**  
  *Description* : Renouvellement du token.  
  *Réponse* : `{ result: true, data: { token } }`.  

- **GET /** 🔒 **PROTEGE**  
  *Description* : Récupération des données de l'utilisateur connecté.  
  *Réponse* : `{ result: true, data: user }`.  

- **GET /:uID** 🔒 **PROTEGE**  
  *Description* : Récupération des données d'un utilisateur par uID.  
  *Réponse* : `{ result: true, data: user }`.  

- **POST /avatar** 🔒 **PROTEGE** 📤 **FICHIER**  
  *Description* : Mise à jour de l'avatar.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreurs : `500` (Cloudinary), `400` (erreur de mise à jour).  

- **DELETE /** 🔒 **PROTEGE**  
  *Description* : Suppression du compte.  
  *Réponse* :  
  - Succès : `{ result: true, message: "Compte supprimé avec succès" }`  
  - Erreurs : `404` (utilisateur introuvable), `500` (erreur serveur).  

- **PUT /skaterTag** 🔒 **PROTEGE**  
  *Champs obligatoires : `newSkaterTag`*  
  *Description* : Modifier le SkaterTag (username).  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreurs : `400` (champ manquant), `500` (erreur serveur).  

--- 

**Légende :**  
- 🔒 **PROTEGE** : Route nécessitant un token valide.  
- 🛡️ **ADMIN** : Route réservée aux administrateurs de crew.  
- 📤 **FICHIER** : Route avec upload de fichier.  
- *Champs obligatoires* : Liste des champs requis dans le body (vérifiés par `checkBodyMW`).