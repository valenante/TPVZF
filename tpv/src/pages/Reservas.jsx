import React from "react";
import ConfiguracionReservas from "../components/Reservas/ConfiguracionReservas";
import ReservasInfo from "../components/Reservas/ReservasInfo";

const ReservasPage = () => {
  return (
    <div className="reservas-container">
      <h1>Gestión de Reservas</h1>
        <ConfiguracionReservas />
        <ReservasInfo />
    </div>
  );
};

export default ReservasPage;
