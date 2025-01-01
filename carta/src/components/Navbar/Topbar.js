import React from "react";
import logo from "../../assets/images/logoZf.webp"; // Logo de la aplicación
import "../../styles/TopBar.css"; // Estilos de TopBar

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="container d-flex justify-content-center align-items-center">
        <img src={logo} alt="Logo ZF" className="top-bar-logo" />
      </div>
    </div>
  );
};

export default TopBar;
