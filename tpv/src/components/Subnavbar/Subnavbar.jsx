import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordModal from "../Password/PasswordModal";
import CerrarCajaModal from "../Caja/CerrarCajaModal";
import RecuperarMesaModal from "../MesasCerradas/ModalMesasCerradas";
import { useAuth } from "../../context/AuthContext";
import "./Subnavbar.css";

const SubNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Obtiene la función logout del contexto
  const [mostrarModal, setMostrarModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mostrarRecuperarModal, setMostrarRecuperarModal] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false); // Estado para el menú hamburguesa

  const abrirRecuperarModal = () => setMostrarRecuperarModal(true);
  const cerrarRecuperarModal = () => setMostrarRecuperarModal(false);

  const toggleMenu = () => {
    setMenuAbierto((prevState) => !prevState);
  };

  return (
    <div className="subnavbar--subnavbar">
      <div className="subnavbar-header--subnavbar">
        <button
          className="hamburger-button--subnavbar"
          onClick={toggleMenu}
        >
          ☰
        </button>
      </div>

      <div
        className={`subnavbar-menu--subnavbar ${menuAbierto ? "open--subnavbar" : "closed--subnavbar"
          }`}
      >
        <button onClick={abrirRecuperarModal} className="subnavbar-button--subnavbar">Recuperar Mesa</button>
        {mostrarRecuperarModal && (
          <RecuperarMesaModal onClose={cerrarRecuperarModal} />
        )}
        <button
          onClick={() => navigate("/mesas-cerradas")}
          className="subnavbar-button--subnavbar"
        >
          Mesas
        </button>
        <button
          onClick={() => navigate("/estadisticas")}
          className="subnavbar-button--subnavbar"
        >
          Estadísticas
        </button>
        <button
          onClick={() => navigate("/registro")}
          className="subnavbar-button--subnavbar"
        >
          Usuarios
        </button>
        <button
          onClick={() => navigate("/eliminaciones")}
          className="subnavbar-button--subnavbar"
        >
          Eliminaciones
        </button>
        <button
          onClick={() => setMostrarModal(true)}
          className="subnavbar-button--subnavbar"
        >
          Contraseña
        </button>
        <button
          onClick={() => navigate("/cajaDiaria")}
          className="subnavbar-button--subnavbar"
        >
          Caja Diaria
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="subnavbar-button--subnavbar btn-cerrar-caja--subnavbar"
        >
          Cerrar Caja
        </button>
        <button onClick={logout} className="subnavbar-button--subnavbar">
          Cerrar Sesión
        </button>
      </div>

      {showModal && <CerrarCajaModal onClose={() => setShowModal(false)} />}
      {mostrarModal && <PasswordModal onClose={() => setMostrarModal(false)} />}
    </div>
  );
};

export default SubNavbar;
