import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../images/logo.avif";


const Navbar = () => {
  return (
    <nav className="navbar--navbar">
      <ul className="navbar-list--navbar">
        <li className="navbar-item--navbar">
          <Link className="navbar-link--navbar" to="/">
          <img src={logo} alt="ZF" className="navbar-logo--navbar" />
          </Link>
        </li>
        <li className="navbar-item--navbar">
          <Link className="navbar-link--navbar" to="/">Inicio</Link>
        </li>
        <li className="navbar-item--navbar">
          <Link className="navbar-link--navbar" to="/products">Productos</Link>
        </li>
        <li className="navbar-item--navbar">
          <Link className="navbar-link--navbar" to="/barra">Barra</Link>
        </li>
        <li className="navbar-item--navbar">
          <Link className="navbar-link--navbar" to="/cocina">Cocina</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
