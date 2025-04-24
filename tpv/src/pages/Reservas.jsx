import React, { useState } from "react";
import ConfiguracionReservas from "../components/Reservas/ConfiguracionReservas";
import ReservasInfo from "../components/Reservas/ReservasInfo";
import FormularioReservaModal from "../components/Reservas/ReservasModal";
import "../styles/ReservasPage.css"; // 👈 Importamos los estilos que crearemos

const ReservasPage = () => {
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div className="reservas-page-wrapper">
      <div className="reservas-contenido">
        <h1>Gestión de Reservas</h1>
        <button className="nueva-reserva-btn" onClick={() => setMostrarModal(true)}>➕ Nueva reserva</button>

        <ConfiguracionReservas />
        <ReservasInfo />
      </div>

      <FormularioReservaModal
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onSuccess={() => ("Reserva creada desde TPV")}
      />
    </div>
  );
};

export default ReservasPage;
