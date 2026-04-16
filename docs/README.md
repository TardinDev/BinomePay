# BinomePay — Pages publiques

Ce dossier contient les pages HTML à héberger pour satisfaire les exigences Google Play.

## Déploiement GitHub Pages (gratuit)

1. Pousser ce dossier `docs/` sur la branche `main` de votre repo GitHub
2. Aller dans **Settings → Pages**
3. Source : `Deploy from a branch` → Branch : `main` → Folder : `/docs`
4. Cliquer **Save**

L'URL sera `https://<user>.github.io/<repo>/` (ou un domaine custom via `CNAME`).

## Domaine personnalisé (binomepay.com)

Pour utiliser `https://binomepay.com/privacy` :

1. Acheter le domaine `binomepay.com` (Namecheap, OVH, Gandi…)
2. Créer un fichier `docs/CNAME` contenant : `binomepay.com`
3. Chez le registrar, pointer les DNS vers GitHub Pages :
   - `A` record : `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. Dans GitHub Pages settings, ajouter le custom domain

**URLs finales à saisir dans Play Console :**

- Privacy Policy : `https://binomepay.com/privacy.html`
- Terms : `https://binomepay.com/terms.html`

## Alternative : Vercel / Netlify

Importer le dossier `docs/` dans Vercel ou Netlify en 1 clic, domaine gratuit fourni.
