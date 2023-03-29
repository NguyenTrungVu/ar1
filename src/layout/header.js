import { useContext, useState } from "react";
import {
  Container,
  Form,
  FormControl,
  Nav,
  Navbar,
  Button,
  Image,
} from "react-bootstrap";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

const Header = () => {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand>WebAR</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav>
              <Link to="/" className="nav-link">
                Trang Chu
              </Link>
            </Nav>
            <Nav>
              <Link to="/feature" className="nav-link">
                Ve Chung Toi
              </Link>
            </Nav>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default Header;
