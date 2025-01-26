import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const RecuperarMesaModal = ({ onClose }) => {
  const [mesasCerradas, setMesasCerradas] = useState([]);
  const [recuperando, setRecuperando] = useState(false);

  useEffect(() => {
    // Obtener mesas cerradas
    const fetchMesasCerradas = async () => {
      try {
        const response = await api.get("/mesas/mesas-cerradas/mesas-cerradas");
        // Filtrar para obtener solo la última mesa cerrada por número
        const mesasUnicas = response.data.reduce((acc, mesa) => {
          acc[mesa.numero] = mesa; // Reemplaza duplicados con la última entrada
          return acc;
        }, {});
        setMesasCerradas(Object.values(mesasUnicas));
      } catch (error) {
        console.error("Error al obtener mesas cerradas:", error);
      }
    };

    fetchMesasCerradas();
  }, []);

  const recuperarMesa = async (mesaId) => {
    setRecuperando(true);
    try {
      await api.post(`/mesas/recuperar-mesa/${mesaId}`);
      alert("Mesa recuperada con éxito.");
      setMesasCerradas((prev) => prev.filter((mesa) => mesa._id !== mesaId));
      onClose();
    } catch (error) {
      console.error("Error al recuperar la mesa:", error);
      alert("Hubo un problema al recuperar la mesa.");
    } finally {
      setRecuperando(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Recuperar Mesa</h2>
        {mesasCerradas.length === 0 ? (
          <p>No hay mesas cerradas disponibles.</p>
        ) : (
          <ul>
            {mesasCerradas.map((mesa) => (
              <li key={mesa._id}>
                Mesa {mesa.numero}
                <button
                  onClick={() => recuperarMesa(mesa._id)}
                  disabled={recuperando}
                >
                  Recuperar
                </button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default RecuperarMesaModal;
