# Plugin Grist data.gouv.fr

[Grist](https://www.getgrist.com/) est outil permettant de travailler sur des données et de construire des outils métiers avancés.

Les équipes [data.gouv.fr](https://data.gouv.fr/) et [Validata](https://validata.fr/) ont développé un plugin Grist (« widget personnalisé ») permettant :

* de publier des données sur data.gouv.fr directement depuis Grist (onglet DataGouv)
* de récupérer des données de data.gouv.fr pour les utiliser dans Grist  (onglet DataGouv)
* de créer un template métier dans Grist à partir d’un schéma sur [schema.data.gouv.fr](https://schema.data.gouv.fr/)  (onglet DataGouv)
* de vérifier directement dans Grist la validité de données par rapport à un schéma (onglet Validata)

ℹ️ Grist est à disposition des agents publics via [la Suite numérique](https://lasuite.numerique.gouv.fr/) et [la Suite territoriale](https://suiteterritoriale.anct.gouv.fr/) :

⚠️ Ce plugin à destination des agents publics est en version _beta_.

Toutes suggestion d'amélioration ou signalements de problèmes sont bienvenus sur [le forum data.gouv.fr](https://forum.data.gouv.fr/) ou au moyen de [tickets sur ce dépôt](https://github.com/datagouv/grist-plugin-opendata/issues).

## Onglet DataGouv

L'onglet DataGouv permet d'interagir avec data.gouv.fr directement depuis Grist.

[Guide d'utilisation](./docs/datagouv.md)

## Onglet Validata

L'onglet validata permet de valider une table Grist avec un schéma au format Table Schema. 

[Guide d'utilisation](./docs/validata.md).

## Documentation technique

### Démarrage rapide avec Docker (Recommandé) 🐳

La manière la plus simple de développer avec ce plugin est d'utiliser Docker :

```bash
# 1. Copier le fichier de configuration (première fois uniquement)
cp .env.dev .env
# Puis éditez le fichier .env pour configurer VUE_APP_DATAGOUV_CLIENT_ID si nécessaire

# 2. Lancer Grist + Plugin avec hot-reload
docker-compose up -d

# 3. Voir les logs
docker-compose logs -f

# 4. Arrêter
docker-compose down
```

Le plugin sera accessible sur http://localhost:8080 et Grist sur http://localhost:8484

**Hot-reload activé** : Les modifications dans `src/` sont automatiquement rechargées !


### Installation locale (Alternative)

Il faut au préalable lancer grist en local (par exemple avec docker)

```
docker run -p 8484:8484 -it gristlabs/grist
```

```
npm install
```

### Configuration du plugin

Dans un environnement de développement, récupérez la liste des variables d'environnement :
```bash
cp .env.dev .env
```

Et procédez aux adaptations `.env` comme décrit dans les commentaires.

Enfin sourcez le fichier pour charger les variables :
```bash
source .env
```

### Compilation et _hot reload_ pour le développement

Après avoir chargé les variables d'environnement:

```
npm run serve
```

### Compilation et minification pour la production

```
npm run build
```

### Analyse avec [ESLint](https://eslint.org/)
```
npm run lint
```

### Configuration personnalisée

Voir [la documentation Vue CLI](https://cli.vuejs.org/config/).
