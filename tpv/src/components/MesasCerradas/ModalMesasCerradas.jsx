import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import "./ModalMesasCerradas.css";

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
    <div className="modal--recuperar">
      <div className="modal-content--recuperar">
        <h2 className="titulo--recuperar">Recuperar Mesa</h2>
        {mesasCerradas.length === 0 ? (
          <p className="mensaje-vacio--recuperar">No hay mesas cerradas disponibles.</p>
        ) : (
          <ul className="lista-mesas--recuperar">
            {mesasCerradas.map((mesa) => (
              <li key={mesa._id} className="mesa-item--recuperar">
                Mesa {mesa.numero}
                <button
                  onClick={() => recuperarMesa(mesa._id)}
                  disabled={recuperando}
                  className="boton-recuperar--recuperar"
                >
                  Recuperar
                </button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} className="boton-cerrar--recuperar">Cerrar</button>
      </div>
    </div>
  );  
};

export default RecuperarMesaModal;
