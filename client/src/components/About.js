import { React } from "react";
import { Container, Row, Col } from 'react-bootstrap';


export const About = () => {
  return (
    <Container className="d-flex justify-content-center">
            <Row>
                <Col>
          <div  className="justify-content-center">
                <h1 id="viscell">viscell</h1>
                <p>
                  <strong>Superviseur :</strong> Asloudj Yanis
                  (yasloudj@u-bordeaux.fr)
                </p>
                <h2 id="contexte">Contexte</h2>
                <p>
                  Dans le cadre de l'UE Projet de Fin d&#39;Études du Master 2 Informatique de l'Université de Bordeaux, cette application a été réalisée par la demande de Yanis Asloudj, doctorant en Bio-Informatique.
                  Cette dernière est un champ de recherche à
                  l&#39;interface entre la biologie, l&#39;informatique et les
                  statistiques. Elle vise à proposer de nouvelles méthodes pour
                  analyser les données en biologie.
                </p>
                <p>
                  Les cellules sont les blocs élémentaires du monde vivant. Chez
                  les organismes pluricellulaires comme l&#39;être humain, les
                  cellules se spécialisent en <em>type cellulaire</em> afin
                  d&#39;accomplir des tâches essentielles (e.g. les neurones
                  diffusent les signaux électriques ; les globules blancs
                  éliminent les pathogènes). Un <em>type cellulaire</em> peut
                  être associé à un ensembles de gènes, qui lui sont plus ou
                  moins spécifiques.
                </p>
                <p>
                  La technologie single-cell est révolutionnaire, dans le sens
                  où elle permet de mesurer l&#39;activité des gènes à
                  l&#39;intérieur de chaque cellule d&#39;un échantillon (e.g.
                  tumeur). À l&#39;aide d&#39;algorithmes de clustering, ces
                  cellules peuvent être rassemblées en population homogènes, et
                  elles peuvent être caractérisées d&#39;après les gènes
                  qu&#39;elles expriment spécifiquement.
                </p>
                <p>
                  L&#39;interprétation des résultats d&#39;une analyse
                  single-cell demande donc le développement de métaphores
                  visuelles intégrant toutes les informations pertinentes à
                  l&#39;étude des populations de cellules, i.e. leur taille,
                  leurs gènes et leur fiabilité.
                </p>
                <h2 id="objectifs">Objectifs</h2>
                <p>
                  Pour explorer les résultats d&#39;une analyse single-cell,
                  Yanis Asloudj a conceptualisé une métaphore visuelle simple, axée
                  autour de plusieurs barplots, représentant une population de
                  cellules chacun. Le contenu d&#39;un barplot représente les
                  gènes caractéristiques d&#39;une population, tandis que son
                  positionnement sur l’écran représente les liens de parenté
                  avec les autres populations.
                </p>
                <p>
                  Cette métaphore visuelle a été implémentée par notre équipe de développement dans un outil client basé sur
                  les nouvelles technologiques de développement du Web.
                </p>
                <h2 id="description-rapide-du-projet">
                  Description rapide du projet
                </h2>
                <p>
                  <code>TODO</code>
                </p>
                <h2 id="technologies">Technologies</h2>
                <p>
                  <code>TODO</code>                
                </p>
                <h2 id="equipe">Équipe</h2>
                <p>
                <strong>Développeurs :</strong>
                <ul>
                    <li>Nikolaï Amossé</li>
                    <li>Martin Ithurbide</li>
                    <li>Adrien Le Corre</li>
                    <li>Valentin Leroy</li>
                    <li>Yusuf Senel</li>
                    <li>Simon Talbi</li>
                </ul>
                
                </p>
          </div>
          </Col>
            </Row>
        </Container>
  );
};
