import { Navbar, Container } from "react-bootstrap";

export function Footer() {
  const footerStyle = {
    fontSize: "14px",
    color: "white",
    textAlign: "center",
  };

  return (
    <footer>
      <Navbar className="bg-primary" fixed="bottom">
        <Container>
          <Navbar.Brand
            style={footerStyle}
            className="d-flex justify-content-between w-100"
          >
            <div>
              <i>
                Authors : Nikolaï Amossé, Martin Ithurbide, Adrien Le Corre,
                Valentin Leroy, Yusuf Senel, Simon Talbi
              </i>
            </div>
            <div>
              <i>Property of the University of Bordeaux ©2024</i>
            </div>
          </Navbar.Brand>
        </Container>
      </Navbar>
    </footer>
  );
}
