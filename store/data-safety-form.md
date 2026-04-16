# Google Play — Data Safety Form (réponses pré-remplies)

> À saisir dans **Play Console > App content > Data safety**.
> Ces réponses sont dérivées de l'analyse réelle du code (Clerk + Supabase + Expo Notifications + expo-image-picker).

---

## 1. Data collection and security

### Does your app collect or share any of the required user data types?

**→ Yes**

### Is all of the user data collected by your app encrypted in transit?

**→ Yes** (HTTPS/TLS — Supabase, Clerk, Expo)

### Do you provide a way for users to request that their data be deleted?

**→ Yes — in-app AND via email**

- In-app : **Profil > Supprimer mon compte**
- Email : `privacy@binomepay.com`

---

## 2. Data types — détail

### 2.1 Personal info

| Data type                   | Collected | Shared | Optional | Purposes                              |
| --------------------------- | --------- | ------ | -------- | ------------------------------------- |
| Name                        | ✅        | ❌     | ❌       | Account management, App functionality |
| Email address               | ✅        | ❌     | ❌       | Account management, Communications    |
| User IDs (Clerk ID)         | ✅        | ❌     | ❌       | Account management                    |
| Address                     | ❌        | —      | —        | —                                     |
| Phone number                | ❌        | —      | —        | —                                     |
| Race/ethnicity              | ❌        | —      | —        | —                                     |
| Political/religious beliefs | ❌        | —      | —        | —                                     |
| Sexual orientation          | ❌        | —      | —        | —                                     |
| Other info                  | ❌        | —      | —        | —                                     |

### 2.2 Financial info

| Data type            | Collected                           | Shared | Notes                                                        |
| -------------------- | ----------------------------------- | ------ | ------------------------------------------------------------ |
| User payment info    | ❌                                  | ❌     | L'app ne traite AUCUN paiement — mise en relation uniquement |
| Purchase history     | ❌                                  | ❌     | —                                                            |
| Credit score         | ❌                                  | ❌     | —                                                            |
| Other financial info | ✅ (montants & devises d'intention) | ❌     | App functionality — montants affichés lors des matches       |

> ⚠️ **Justification « Other financial info »** : les montants saisis dans les intentions d'échange (ex. "500 EUR") sont collectés pour faire le matching, pas pour traiter un paiement. À mentionner dans la description.

### 2.3 Health & fitness

**→ Aucune donnée collectée.**

### 2.4 Messages

| Data type             | Collected | Shared | Purposes                                     |
| --------------------- | --------- | ------ | -------------------------------------------- |
| Emails                | ❌        | ❌     | —                                            |
| SMS or MMS            | ❌        | ❌     | —                                            |
| Other in-app messages | ✅        | ❌     | App functionality (messagerie entre binômes) |

### 2.5 Photos and videos

| Data type | Collected | Shared | Optional | Purposes                             |
| --------- | --------- | ------ | -------- | ------------------------------------ |
| Photos    | ✅        | ❌     | ✅ Oui   | Photo de profil (optionnelle, Clerk) |
| Videos    | ❌        | —      | —        | —                                    |

### 2.6 Audio files

**→ Aucune donnée collectée.** (`RECORD_AUDIO` bloquée explicitement)

### 2.7 Files and docs

**→ Aucune donnée collectée** (pas de lecture du stockage de l'appareil).

### 2.8 Calendar

**→ Aucune donnée collectée.**

### 2.9 Contacts

**→ Aucune donnée collectée.**

### 2.10 App activity

| Data type                    | Collected                 | Shared | Purposes                          |
| ---------------------------- | ------------------------- | ------ | --------------------------------- |
| App interactions             | ✅                        | ❌     | Analytics (amélioration de l'app) |
| In-app search history        | ❌                        | —      | —                                 |
| Installed apps               | ❌                        | —      | —                                 |
| Other user-generated content | ✅ (intentions d'échange) | ❌     | App functionality                 |
| Other actions                | ❌                        | —      | —                                 |

### 2.11 Web browsing

**→ Aucune donnée collectée.**

### 2.12 App info and performance

| Data type      | Collected | Shared | Purposes                   |
| -------------- | --------- | ------ | -------------------------- |
| Crash logs     | ✅        | ❌     | App performance, debugging |
| Diagnostics    | ✅        | ❌     | App performance            |
| Other app info | ❌        | —      | —                          |

### 2.13 Device or other IDs

| Data type           | Collected            | Shared | Purposes           |
| ------------------- | -------------------- | ------ | ------------------ |
| Device or other IDs | ✅ (push token Expo) | ❌     | Notifications push |

---

## 3. Security practices

- ✅ **Data is encrypted in transit** (TLS 1.2+)
- ✅ **You can request data deletion** (in-app et par email)
- ✅ **Follows Families Policy** : Non applicable (18+)
- ✅ **Independent security review** : Non (peut être ajouté plus tard)

---

## 4. À copier-coller dans Play Console : description des pratiques

> **Traduction française fournie pour mémoire ; Play Console accepte le français.**

**Collecte :**

> BinomePay collecte uniquement les données strictement nécessaires au service de mise en relation : nom/prénom, email, photo de profil (optionnelle), détails des intentions d'échange (montants, devises, pays), messages entre utilisateurs. Aucune donnée de paiement n'est traitée.

**Partage avec des tiers :**

> Les données sont partagées avec Clerk (authentification) et Supabase (base de données) en tant que sous-traitants au sens du RGPD. Aucune donnée n'est vendue ni partagée avec des annonceurs.

**Sécurité :**

> Toutes les données sont chiffrées en transit (TLS) et au repos. L'authentification biométrique est disponible sur l'appareil. Les utilisateurs peuvent supprimer leur compte à tout moment depuis l'application (Profil > Supprimer mon compte).

---

## 5. Content rating questionnaire (IARC)

Réponses pour le questionnaire de classification :

| Question                         | Réponse                                                  |
| -------------------------------- | -------------------------------------------------------- |
| Violence                         | Non                                                      |
| Contenu sexuel                   | Non                                                      |
| Langage grossier                 | Non                                                      |
| Jeux d'argent                    | **Non** (pas de gambling — mise en relation uniquement)  |
| Substances contrôlées            | Non                                                      |
| Communication entre utilisateurs | **Oui** (messagerie in-app)                              |
| Partage de localisation          | Non                                                      |
| Informations personnelles        | **Oui** (collecte nom/email pour le compte)              |
| Accès internet illimité          | Oui                                                      |
| Contenu user-generated           | **Oui** (intentions + messages, modérés via signalement) |

**Classification attendue** : PEGI 3 / ESRB Everyone (ou 12+ selon réponses sur UGC).

---

## 6. Target audience and content

- **Age groups** : 18+
- **Mixed audience ads** : Non (pas de publicité)
- **Does your app unintentionally appeal to children?** : Non

---

## 7. News app

**→ Non**

## 8. COVID-19 contact tracing

**→ Non**

## 9. Government app

**→ Non**

## 10. Financial features

**→ Non** (pas de transfert d'argent — mise en relation uniquement)

---

## ⚠️ Points d'attention pour éviter un rejet

1. **Ne PAS cocher « transfert d'argent »** : BinomePay n'effectue aucun transfert. C'est de la mise en relation P2P.
2. **Bien mentionner la suppression de compte in-app** : obligatoire depuis mai 2024.
3. **Déclarer POST_NOTIFICATIONS** dans la rubrique permissions sensibles.
4. **Privacy URL** : mettre la vraie URL hébergée (pas un fichier `.md` GitHub brut).
