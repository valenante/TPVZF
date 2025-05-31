import React, { useEffect } from "react";
import "./AlertaMensaje.css";

const AlertaMensaje = ({ tipo = "info", mensaje, onClose, autoCerrar = true, duracion = 3000 }) => {
  useEffect(() => {
    if (autoCerrar) {
      const timer = setTimeout(onClose, duracion);
      return () => clearTimeout(timer);
    }
  }, [autoCerrar, duracion, onClose]);

  return (
    <div className={`alerta-mensaje alerta-${tipo}`}>
      <span>{mensaje}</span>
      <button onClick={onClose} className="alerta-cerrar">×</button>
    </div>
  );
};

export default AlertaMensaje;
