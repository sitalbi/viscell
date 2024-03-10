import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function MenuBar() {
    /**
     * Reload the page when the home button is clicked.
     * 
     * Function is needed to encapsulate the window.location.reload() call
     * otherwise it will be called on every render, triggering an infinite loop.
     */
    const handleHomeClick = () => {
        window.location.reload();
    };

    return (
        <Navbar bg="primary" variant="dark" expand="lg" className="shadow">
            <Container>
                <Navbar.Brand as={Link} to="/" onClick={handleHomeClick}>Home</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/example">Example</Nav.Link>
                        <Nav.Link as={Link} to="/about">About</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}