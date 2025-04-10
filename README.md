# Plugin Grist data.gouv.fr

[Grist](https://www.getgrist.com/) est outil permettant de travailler sur des données et de construire des outils métiers avancés.

Les équipes [data.gouv.fr](https://data.gouv.fr/) et [Validata](https://validata.fr/) ont développé un plugin Grist (« widget personnalisé ») permettant :

* de publier des données sur data.gouv.fr directement depuis Grist (onglet DataGouv)
* de récupérer des données de data.gouv.fr pour les utiliser dans Grist  (onglet DataGouv)
* de créer un template métier dans Grist à partir d’un schéma sur [schema.data.gouv.fr](https://schema.data.gouv.fr/)  (onglet DataGouv)
* de vérifier directement dans Grist la validité de données par rapport à un schéma (onglet Validata)

ℹ️ Grist est à disposition des agents publics via [la Suite numérique](https://lasuite.numerique.gouv.fr/) et [la Suite territoriale](https://suiteterritoriale.anct.gouv.fr/) :

⚠️ Ce plugin à destination des agents publics est en version _beta_.

## Onglet DataGouv

L'onglet DataGouv permet d'interagir avec data.gouv.fr directement depuis Grist.

[Guide d'utilisation](./docs/datagouv.md)

## Onglet Validata

L'onglet validata permet de valider une table Grist avec un schéma au format Table Schema. 

[Guide d'utilisation](./docs/validata.md).

## Documentation technique

### Installation

```
npm install
```

### Compilation et _hot reload_ pour le développement

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
