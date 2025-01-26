import React, { useState, useEffect } from "react";
import api from "../../utils/api";

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
    <div className="modal">
      <h2>Cerrar Caja</h2>
      {isLoading ? (
        <p>Cargando total de caja...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <p>Total de caja: {totalCaja.toFixed(2)} €</p>
          <input
            type="password"
            placeholder="Introduce la contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button onClick={handleCerrarCaja}>Cerrar Caja</button>
          <button onClick={onClose}>Cancelar</button>
        </>
      )}
    </div>
  );
};

export default CerrarCajaModal;
