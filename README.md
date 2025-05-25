Partie backend de l'application mobile SkaterQuest, développée par Julien Bédu, Thomas Poillion et Baptiste Zuber.

---

**Résumé des dossiers :**
*NB : Je décris seulement ceux partagés sur GitHub.*

- **api** : Aide le fonctionnement de Vercel (qui n'est pas fait pour héberger des backends persistants) :
  - **app.js** est le fichier principal du back. L'avoir dans ce dossier permet à Vercel de le traiter comme une fonction serverless, pour pouvoir l'utiliser avec Express
  - **index.js** sert à importer et exporter l'appli (Vercel traite toutes les requêtes via ce fichier car je l'utilise dans **vercel.json**)

- **bin** : Contient le fichier **www.js** qui permet de démarrer le serveur

- **dummydata** : Contient des données factices servant à tester les routes sans passer par la BDD

- **lib** (library) : Contient le fichier **cloudinaryUpload.js** qui permet l'envoi des fichiers vers le service cloud Cloudinary

- **middleware** : Contient les middlewares que l'on appelle dans les routes pour s'occuper de parties spécifiques :
  - **checkBody.js** : Contrôle des saisies de l'utilisateur (pas de champ vide)
  - **trimFields.js** : Suppression des espaces inutiles des saisies de l'utilisateur
  - **getUserData.js** : Récupération des infos de l’utilisateur dans le corps de requête
  - **isUserCrewAdmin.js** : Contrôle du statut d’admin dans un crew
  - **tokenAuth.js** : Génération et contrôle des tokens (contient 2 fonctions distinctes)

- **models** : Contient les schémas de BDD, ainsi qu'un dossier **pipelines** contenant 2 fichiers :
  - **aggregation.js** : Permet de faire des requêtes complexes basées sur la géolocalisation.
  → Plus précisément, ce fichier contient une fonction servant à trouver les spots proches d’un utilisateur, avec les vidéos associées triées par vote, et toutes les infos utiles dans un document bien structuré
  - **population.js** : Permet de gérer les relations en clé étrangères de manière sécurisée.
  → Plus précisément, ce fichier contient des pipelines de "population" pour peupler les références entre documents MongoDB (comme .populate() de Mongoose), sans inclure de données sensibles comme les mots de passe ou les identifiants MongoDB (_id).

- **public** : Sert à stocker les fichiers statiques (images, fichiers CSS, PDF, ...) que le serveur peut servir au client sans traitement préalable. Créé par défaut mais vide actuellement car le frontend et Cloudinary ne le rendent pas utile pour le moment.

- **routes** : Routes API, lire détails ci-dessous dans la 2nde section de ce README.

- **tests** : Contient le fichier **testUpload.html** qui permet de tester manuellement les fonctionnalités d'upload de fichiers sur le backend (avatar de l'utilisateur, photo de spot, vidéo). Pratique pour tester rapidement les routes sans passer par un front complet, vérifier l’authentification, les formulaires et les réponses, et pour s’assurer que les fichiers sont bien uploadés et traités (via Cloudinary). N'est plus utile actuellement.

- **tmp** : Dossier qui contenait des vidéos temporaires pour réaliser des tests d'affichage, n'est plus utile actuellement mais le supprimer ou le rendre vide créé un bug. À résoudre prochainement.

---
---

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

- **GET /search/:searchTerm** 🔒 **PROTEGE**  
  *Description* : Recherche un utilisateur par son pseudo.  
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