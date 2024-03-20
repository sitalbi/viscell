import React, { useState } from "react";
import { Container, Row, Col, Accordion, Form } from "react-bootstrap";

export const About = () => {
  const [formActivated, setFormActivated] = useState(false);

  const toggleForm = () => {
    setFormActivated(!formActivated);
  };

  return (
    <Container className="d-flex justify-content-center mt-2 mb-1">
      <Row>
        <Col>
          <div
            id="header"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <h1 id="viscell">viscell</h1>
            <Form>
              <Form.Check
                onClick={toggleForm}
                type="switch"
                id="custom-switch"
                style={{ marginTop: "15px" }}
                label={
                  <>
                    <img
                      src="https://purecatamphetamine.github.io/country-flag-icons/3x2/GB.svg"
                      alt="English Flag"
                      style={{ width: "40px", borderRadius: "10px" }}
                    />
                  </>
                }
              />
            </Form>
          </div>
          {formActivated ? (
            <>
              {/* English Version */}
              <strong>Imagined by :</strong> Asloudj Yanis
              (yasloudj@u-bordeaux.fr)
              <br />
              <h2 id="context" className="mt-2">Context</h2>
              In the context of the End of Studies Project UE of the Master 2
              Computer Science at the University of Bordeaux, this application
              was developed at the request of Yanis Asloudj, a PhD student in
              Bioinformatics. This field is a research area at the interface
              between biology, computer science, and statistics. Its aim is to
              propose new methods for analyzing data in biology.
              <br />
              <br />
              Cells are the elementary blocks of the living world. In
              multicellular organisms such as humans, cells specialize in{" "}
              <em>cell type</em> in order to perform essential tasks (e.g.
              neurons transmit electrical signals; white blood cells eliminate
              pathogens). A <em>cell type</em> can be associated with a set of
              genes, which are more or less specific to it.
              <br />
              <br />
              Single-cell technology is revolutionary in the sense that it
              allows the measurement of gene activity inside each cell of a
              sample (e.g. tumor). Using clustering algorithms, these cells can
              be grouped into homogeneous populations, and they can be
              characterized according to the genes they specifically express.
              <br />
              <br />
              The interpretation of the results of a single-cell analysis
              therefore requires the development of visual metaphors integrating
              all the relevant information for the study of cell populations,
              i.e. their size, their genes, and their reliability.
              <br />
              <Accordion defaultActiveKey="0" alwaysOpen className="mt-4">
                <Accordion.Item eventKey="1">
                  <Accordion.Header>
                    <h2>Objectives</h2>
                  </Accordion.Header>
                  <Accordion.Body>
                    <p>
                      To explore the results of a single-cell analysis, Yanis
                      Asloudj has conceptualized a simple visual metaphor,
                      focused around several barplots, each representing a
                      population of cells. The content of a barplot represents
                      the characteristic genes of a population, while its
                      position on the screen represents the relationships with
                      the other populations.
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>
                    <h2>Features</h2>
                  </Accordion.Header>
                  <Accordion.Body>
                    <p>
                      <code>TODO</code>
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                  <Accordion.Header>
                    <h2>Mandatory information & Intellectual property</h2>
                  </Accordion.Header>
                  <Accordion.Body>
                    <h3>Mandatory information</h3>
                    <ul>
                      <li>
                        This application is the property of the University of
                        Bordeaux.
                      </li>
                      <li>
                        The hypertext links present on this site and directing
                        users to other websites cannot engage the responsibility
                        of the University of Bordeaux as to the content of these
                        sites.
                      </li>
                    </ul>

                    <h3>Intellectual property</h3>
                    <ul>
                      <li>
                        Flag Logo:{" "}
                        <a href="https://purecatamphetamine.github.io/country-flag-icons/3x2/index.html">
                          purecatamphetamine.github.io
                        </a>
                      </li>
                      <li>Favicon: Property of the University of Bordeaux</li>
                      <li>
                        University Logo: Property of the University of Bordeaux.
                      </li>
                    </ul>
                    <ul>
                      <li>
                        JavaScript Libraries: Property of their respective
                        authors.
                      </li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </>
          ) : (
            <>
              {" "}
              {/* French Version */}
              <strong>Superviseur :</strong> Asloudj Yanis
              (yasloudj@u-bordeaux.fr) <br />
              <h2 id="contexte" className="mt-2">Contexte</h2>
              Dans le cadre de l'UE Projet de Fin d'Études du Master 2
              Informatique de l'Université de Bordeaux, cette application a été
              réalisée par la demande de Yanis Asloudj, doctorant en
              Bio-Informatique. Cette dernière est un champ de recherche à
              l'interface entre la biologie, l'informatique et les statistiques.
              Elle vise à proposer de nouvelles méthodes pour analyser les
              données en biologie.
              <br />
              <br />
              Les cellules sont les blocs élémentaires du monde vivant. Chez les
              organismes pluricellulaires comme l'être humain, les cellules se
              spécialisent en <em>type cellulaire</em> afin d'accomplir des
              tâches essentielles (e.g. les neurones diffusent les signaux
              électriques ; les globules blancs éliminent les pathogènes). Un{" "}
              <em>type cellulaire</em> peut être associé à un ensembles de
              gènes, qui lui sont plus ou moins spécifiques.
              <br />
              <br />
              La technologie single-cell est révolutionnaire, dans le sens où
              elle permet de mesurer l'activité des gènes à l'intérieur de
              chaque cellule d'un échantillon (e.g. tumeur). À l'aide
              d'algorithmes de clustering, ces cellules peuvent être rassemblées
              en population homogènes, et elles peuvent être caractérisées
              d'après les gènes qu'elles expriment spécifiquement.
              <br />
              <br />
              L'interprétation des résultats d'une analyse single-cell demande
              donc le développement de métaphores visuelles intégrant toutes les
              informations pertinentes à l'étude des populations de cellules,
              i.e. leur taille, leurs gènes et leur fiabilité.
              <br />
              <Accordion defaultActiveKey="0" alwaysOpen className="mt-4">
                <Accordion.Item eventKey="1">
                  <Accordion.Header id="objectifs">
                    <h2>Objectifs</h2>
                  </Accordion.Header>
                  <Accordion.Body>
                    <p>
                      Pour explorer les résultats d'une analyse single-cell,
                      Yanis Asloudj a conceptualisé une métaphore visuelle
                      simple, axée autour de plusieurs barplots, représentant
                      une population de cellules chacun. Le contenu d'un barplot
                      représente les gènes caractéristiques d'une population,
                      tandis que son positionnement sur l’écran représente les
                      liens de parenté avec les autres populations.
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header id="fonctionnalites">
                    <h2>Fonctionnalités</h2>
                  </Accordion.Header>
                  <Accordion.Body>
                    <p>
                      <ul>
                        <li>Soumettre un fichier
                        <div>
                        Via le bouton Upload a file, l'utilisateur peut soumettre un fichier xls ou xlsx contenant les résultats d'une analyse single-cell au format adapté.
                        <img src="/about/Import.png" alt="Submit" />

                        Si le fichier n'est pas au bon format, l'application détaillera la ou les erreurs sur le contenu du fichier. 
                        <img src="/about/Errors.png" alt="Error" />
                        </div>
                        </li>
                         
                        
                        <li>Visualiser les résultats</li>
                        <li>Exporter les résultats</li>
                        <li>Afficher un chiffre défini de gênes</li>
                        <li>Accéder aux informations détaillées d'un gêne</li>
                      </ul>
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                  <Accordion.Header id="technologies">
                    <h2>Mentions obligatoires & Propriété Intellectuelle</h2>
                  </Accordion.Header>
                  <Accordion.Body>
                    <h3>Mentions obligatoires</h3>
                    <ul>
                      <li>
                        Cette application est la propriété de l'Université de
                        Bordeaux.
                      </li>
                      <li>
                        Les liens hypertextes présents sur ce site et dirigeant
                        les utilisateurs vers d'autres sites internet ne
                        sauraient engager la responsabilité de l'Université de
                        Bordeaux quant au contenu de ces sites.
                      </li>
                    </ul>

                    <h3>Propriété Intellectuelle</h3>
                    <ul>
                      <li>
                        Logo Drapeau :{" "}
                        <a href="https://purecatamphetamine.github.io/country-flag-icons/3x2/index.html">
                          purecatamphetamine.github.io
                        </a>
                      </li>
                      <li>Favicon : Propriété de l'Université de Bordeaux</li>
                      <li>
                        Logo Université : Propriété de l'Université de Bordeaux.
                      </li>
                    </ul>
                    <ul>
                      <li>
                        Bibliothèques JavaScript : Propriété de leurs auteurs
                        respectifs.
                      </li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};