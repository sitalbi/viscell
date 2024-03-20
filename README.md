# viscell

**Superviseur :** Yanis ASLOUDJ (yasloudj@u-bordeaux.fr)

**Développeurs :** Nikolaï AMOSSÉ, Martin ITHURBIDE, Yusuf SENEL, Simon TALBI, Valentin LEROY, Adrien LE CORRE

## 🔬 Contexte

La bio-informatique est un champ de recherche à l'interface entre la biologie, l'informatique et les
statistiques. Elle vise à proposer de nouvelles méthodes pour analyser les données en biologie.

Les cellules sont les blocs élémentaires du monde vivant. Chez les organismes pluricellulaires
comme l'être humain, les cellules se spécialisent en *type cellulaire* afin d'accomplir des tâches
essentielles (e.g. les neurones diffusent les signaux électriques ; les globules blancs éliminent les
pathogènes). Un *type cellulaire* peut être associé à un ensembles de gènes, qui lui sont plus ou
moins spécifiques.

La technologie single-cell est révolutionnaire, dans le sens où elle permet de mesurer l'activité des
gènes à l'intérieur de chaque cellule d'un échantillon (e.g. tumeur). À l'aide d'algorithmes de
clustering, ces cellules peuvent être rassemblées en population homogènes, et elles peuvent être
caractérisées d'après les gènes qu'elles expriment spécifiquement.

L'interprétation des résultats d'une analyse single-cell demande donc le développement de
métaphores visuelles intégrant toutes les informations pertinentes à l'étude des populations de
cellules, i.e. leur taille, leurs gènes et leur fiabilité.

## 🦠 Objectifs

Pour explorer les résultats d'une analyse single-cell, Y. Asloudj a conceptualisé une métaphore visuelle
simple, axée autour de plusieurs barplots, représentant une population de cellules chacun. Le
contenu d'un barplot (également appelé *histogramme*) représente les gènes caractéristiques d'une population, tandis que son
positionnement sur l’écran représente les liens de parenté avec les autres populations.

L'objectif de ce projet est de développer une application web permettant de visualiser les résultats d'une analyse single-cell, en utilisant la métaphore visuelle inovante proposée par Y. Asloudj.

## 👋🏼 À la main

### Prérequis

Tout d'abord, il est nécessaire de cloner le dépôt ou de télécharger l'archive de l'application. Ensuite, assurez-vous d'avoir le gestionnaire de paquets `npm` installé sur votre machine.

```bash
# Vous devriez voir la version de npm s'afficher si npm est installé
npm --version
```

Si ce n'est pas le cas, vous pouvez l'installer en suivant les instructions sur le site officiel de [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

### Installation

Pour installer les dépendances du projet, exécutez les commandes suivantes à l'intérieur du répertoire de l'application.

```bash
# Vérifiez que vous êtes dans le bon répertoire de l'application 'viscell' et passez dans le répertoire 'client'
cd client

# Installez les dépendances du client
npm install # ou bien 'npm i'
```

### Exécution

Toujours dans le répertoire `client`, exécutez la commande suivante pour lancer l'application.

```bash
# Exécutez l'application
npm run start
```

L'application devrait s'ouvrir automatiquement dans votre navigateur par défaut. Si ce n'est pas le cas, ouvrez votre navigateur et rendez-vous à l'adresse `http://localhost:3000`. Vous devriez voir l'interface de l'application.

## 📁 En utilisant `viscell.sh`

Le script `viscell.sh` permet d'automatiser les étapes d'installation et d'exécution de l'application. Pour l'utiliser, exécutez les commandes suivantes à la racine du répertoire de l'application.

```bash
# Rendez le script exécutable si vous ne pouvez pas l'exécuter
chmod +x viscell.sh

# Exécutez le script
./viscell.sh
```

> **Note :**
> Il se peut même que vous puissiez double-cliquer sur le script pour l'exécuter.

Ce script est pour l'instant destiné à des systèmes Unix (Linux, macOS). Pour les utilisateurs de Windows, vous pouvez exécuter les commandes du script une par une dans votre terminal ou utiliser un émulateur de terminal Unix.

## 🧪 Lancer les tests

Avant de lancer les tests unitaires, il faut s'assurer que la version de production de l'application compile sans aucune erreur ni **avertissement**. Autrement, les pipelines de tests échoueront. Pour compiler l'application en mode production, exécutez la commande suivante dans le répertoire `client`.

```bash
# Compilez l'application
npm run build
```

Ensuite, pour lancer les tests unitaires, exécutez la commande suivante dans le répertoire `client`.

```bash
# 'ci' pour Continuous Integration, ce job lance les tests
# unitaires et génère un rapport de couverture de code
npm run ci
```