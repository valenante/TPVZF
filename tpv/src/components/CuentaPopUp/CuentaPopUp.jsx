import React, { useContext
 } from "react";
import { SocketContext } from '../../utils/socket';
import "./CuentaPopUp.css";

const CuentaPopup = () => {
  const { cuentaSolicitada, setCuentaSolicitada } = useContext(SocketContext);

  if (!cuentaSolicitada) return null; // Si no hay solicitud, no mostrar nada

  return (
    <div className="popup">
      <div className="popup-content">
        <h3>Mesa {cuentaSolicitada.numeroMesa} quiere la cuenta</h3>
        <button onClick={() => setCuentaSolicitada(null)}>Cerrar</button>
      </div>
    </div>
  );
};


export default CuentaPopup;
