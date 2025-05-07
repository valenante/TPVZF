import React, {useState} from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../images/logo.avif";


const Navbar = () => {
  const [selectValue, setSelectValue] = useState("");

  const handleSelectChange = (e) => {
    const path = e.target.value;
    if (path) {
      window.location.href = path;
      setSelectValue(""); // Reinicia el valor después de redirigir
    }
  };
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
        <li className="navbar-item--navbar only-desktop">
          <Link className="navbar-link--navbar" to="/barra">Barra</Link>
        </li>
        <li className="navbar-item--navbar only-desktop">
          <Link className="navbar-link--navbar" to="/cocina">Cocina</Link>
        </li>
        <li className="navbar-item--navbar only-mobile">
          <select
            className="navbar-select--navbar"
            onChange={handleSelectChange}
            value={selectValue}
          >
            <option value="" disabled>Ir a...</option>
            <option value="/tpv/cocina">Cocina</option>
            <option value="/tpv/barra">Barra</option>
          </select>
        </li>
        <li className="navbar-item--navbar">
          <Link className="navbar-link--navbar" to="/reservas">Reservas</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
