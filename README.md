# e-État Civil

Plateforme de dématérialisation de l'état civil : les citoyens demandent et paient leurs actes (naissance, mariage, décès) en ligne, les agents de commune traitent les demandes et délivrent des actes PDF sécurisés par QR code, et l'administrateur pilote l'ensemble via un tableau de bord.

Le projet comprend une **API REST Django**, une **application web React** et une **application mobile React Native (Expo)** qui partagent le même backend.

## Fonctionnalités

**Citoyen**
- Inscription, connexion, récupération du mot de passe
- Demande d'acte (naissance, mariage, décès) avec pièces justificatives
- Suivi de l'état des demandes et téléchargement de l'acte en PDF
- Choix de l'arrondissement, avec redirection automatique vers le plus proche s'il est indisponible

**Agent**
- File d'attente des demandes, traitées par ordre de priorité
- Recherche rapide d'actes par nom ou prénom
- Génération de l'acte en PDF avec QR code de vérification, puis envoi par e-mail
- Historique des demandes traitées

**Administrateur**
- Gestion des agents, des citoyens, des communes et des arrondissements
- Statistiques et tableau de bord (demandes par jour, par type, par statut)
- Consultation des archives

## Algorithmes implémentés

| Algorithme | Utilisation | Fichier |
|---|---|---|
| **Dijkstra** | Trouver l'arrondissement disponible le plus proche | [`Dijkstra.py`](e_EtatCivile/apps/dashboard_app/services/Dijkstra.py) |
| **Tas min (min-heap)** | File d'attente des demandes par priorité | [`heapqm.py`](e_EtatCivile/apps/dashboard_app/services/heapqm.py) |
| **Trie** | Recherche d'actes par préfixe de nom / prénom | [`Trie.py`](e_EtatCivile/apps/dashboard_app/services/Trie.py) |
| **KMP** et **Rabin-Karp** | Recherche plein texte dans les noms et numéros d'actes, avec score de pertinence (KMP pour un mot, Rabin-Karp pour plusieurs) | [`Kmp.py`](e_EtatCivile/apps/dashboard_app/services/Kmp.py), [`Rabin_Karp.py`](e_EtatCivile/apps/dashboard_app/services/Rabin_Karp.py) |

Ces structures sont implémentées à la main, sans bibliothèque.

## Technologies

| Partie | Stack |
|---|---|
| Backend | Python 3.13, Django 6, Django REST Framework, MySQL |
| Web | React 19, TypeScript, Vite, Tailwind CSS, DaisyUI, i18next |
| Mobile | React Native, Expo 54, Expo Router |
| Services | MVola API (paiement), ReportLab / fpdf2 (PDF), qrcode, SMTP Gmail |

## Structure

```
├── e_EtatCivile/          Backend Django (API REST)
│   ├── apps/accounts_app  Authentification, inscription, profils
│   ├── apps/dashboard_app Demandes, actes, paiements, statistiques, algorithmes
│   └── e_EC_project       Configuration Django
├── Frontend/
│   ├── webfront           Application web (React + Vite)
│   └── eEtatCivilMobile   Application mobile (Expo)
└── docs/                  Cahier des charges et diagrammes UML
```

## Installation

### Prérequis
Python 3.13, Node.js 20+, MySQL 8+ (ou XAMPP / WAMP).

### 1. Base de données
```bash
mysql -u root -e "CREATE DATABASE etat_civil CHARACTER SET utf8mb4;"
```
Le script SQL de création des tables n'est pas inclus dans ce dépôt ; il est disponible sur demande.

### 2. Backend
```bash
cd e_EtatCivile
python -m venv env
env\Scripts\activate          # Linux / macOS : source env/bin/activate
pip install -r requirements.txt
copy .env.example .env        # puis remplir les valeurs
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 3. Application web
```bash
cd Frontend/webfront
npm install
npm run dev                   # http://localhost:5173
```
L'URL de l'API se configure dans `Frontend/webfront/.env` (`VITE_API_URL`).

### 4. Application mobile
```bash
cd Frontend/eEtatCivilMobile
npm install
npm start                     # scanner le QR code avec Expo Go
```
Renseigner l'adresse IP du PC qui fait tourner le backend dans `src/config/api.js`.

## Conception

| Cas d'utilisation | Diagramme de classes |
|---|---|
| ![Cas d'utilisation](docs/diagramme_uml/Model1!UseCaseDiagram1_1.png) | ![Diagramme de classes](docs/diagramme_uml/Model1!eEtat-Civil!ClassDiagram1_2.png) |

Les diagrammes de séquence et de déploiement ainsi que le cahier des charges sont dans [`docs/`](docs/).

## Licence

Voir [LICENSE](LICENSE).
