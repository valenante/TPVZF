import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import "./CerrarCajaModal.css";

const CerrarCajaModal = ({ onClose }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [totalCaja, setTotalCaja] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener el total de la caja al cargar el modal
  useEffect(() => {
    const fetchTotalCaja = async () => {
      try {
        const response = await api.get("/caja/total");
        setTotalCaja(response.data.total);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener el total de caja:", error);
        setIsLoading(false);
        setError("No se pudo obtener el total de caja.");
      }
    };
    fetchTotalCaja();
  }, []);

  const cerrarCajaBackend = async () => {
    try {
      await api.post("/caja/cerrar", { password });
      alert("Caja cerrada correctamente");
      onClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al cerrar la caja:", error);
      setError("Error al cerrar la caja. Verifica la contraseña.");
    }
  };

  const handleCerrarCaja = async () => {
    if (!password) {
      setError("Por favor, introduce la contraseña");
      return;
    }

    setError(""); // Resetear errores

    // Llamar al backend para cerrar la caja
    await cerrarCajaBackend();
  };

  return (
    <div className="modal-overlay--cerrar-caja">
      <div className="modal-content--cerrar-caja">
        <h2 className="titulo--cerrar-caja">Cerrar Caja</h2>
        {isLoading ? (
          <p className="mensaje-carga--cerrar-caja">Cargando total de caja...</p>
        ) : error ? (
          <p className="error--cerrar-caja">{error}</p>
        ) : (
          <>
            <p className="total-caja--cerrar-caja">Total de caja: {totalCaja.toFixed(2)} €</p>
            <input
              type="password"
              className="input--cerrar-caja"
              placeholder="Introduce la contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="error--cerrar-caja">{error}</p>}
            <div className="modal-actions--cerrar-caja">
              <button
                onClick={handleCerrarCaja}
                className="boton--cerrar-caja"
                disabled={isLoading}
              >
                {isLoading ? "Cerrando..." : "Cerrar Caja"}
              </button>
              <button onClick={onClose} className="boton-cancelar--cerrar-caja">
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );  
};

export default CerrarCajaModal;
