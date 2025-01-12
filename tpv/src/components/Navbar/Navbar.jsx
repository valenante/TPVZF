import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li><Link to="/dashboard">Inicio</Link></li>
        <li><Link to="/products">Productos</Link></li>
        <li><Link to="/barra">Barra</Link></li>
        <li><Link to="/cocina">Cocina</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
