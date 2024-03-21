import { Navbar, Container } from "react-bootstrap";

export function Footer() {
  return (
    <footer>
      <Navbar className="bg-primary" fixed="bottom">
        <Container>
          <Navbar.Brand
            style={{ fontSize: "0.8em" }}
            className="d-flex justify-content-between w-100 text-white text-center"
          >
            <div>
              <i>
                Authors: Nikolaï Amossé, Martin Ithurbide, Adrien Le Corre,
                Valentin Leroy, Yusuf Senel, Simon Talbi
              </i>
            </div>
            <div>
              <i>viscell ©2024</i>
            </div>
          </Navbar.Brand>
        </Container>
      </Navbar>
    </footer>
  );
}