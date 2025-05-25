import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/Dashboard.css";
import SubNavbar from "../components/Subnavbar/Subnavbar";
import ModalConfirmacion from "../components/Modal/ModalConfirmacion";
import { SocketContext } from "../utils/socket";

const Dashboard = () => {
  const [mesas, setMesas] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Detecta si la pantalla es pequeña
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext); // Obtener el socket del contexto
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [accionModal, setAccionModal] = useState(null);

  const fetchMesas = async () => {
    try {
      const { data } = await api.get("/mesas");
      setMesas(data);
    } catch (error) {
      console.error("Error al obtener las mesas:", error);
    }
  };

  useEffect(() => {
    fetchMesas();
    // Actualiza el estado si la ventana cambia de tamaño
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const manejarMesaAbierta = () => {
      fetchMesas();
    };

    socket.on('mesaAbierta', manejarMesaAbierta);

    return () => {
      socket.off('mesaAbierta', manejarMesaAbierta);
    };
  }, [socket]);

  const handleMesaClick = (mesa) => {
    if (mesa.estado === "cerrada") {
      setMesaSeleccionada(mesa);
      setAccionModal({
        titulo: "Abrir Mesa",
        mensaje: `¿Cuántos comensales hay en la mesa ${mesa.numero}?`,
        placeholder: "Número de comensales",
        onConfirm: async (comensalesInput) => {
          if (!comensalesInput || isNaN(comensalesInput) || Number(comensalesInput) <= 0) {
            alert("Número de comensales inválido."); // O tu sistema de alerta
            return;
          }

          try {
            await api.put(`/mesas/mesas/${mesa._id}/abrir`, {
              comensales: Number(comensalesInput),
            });
            fetchMesas();
            setMostrarModalConfirmacion(false);
            navigate(`/mesas/${mesa._id}`);
          } catch (error) {
            console.error("Error al abrir la mesa:", error);
          }
        },
      });
      setMostrarModalConfirmacion(true);
    } else {
      navigate(`/mesas/${mesa._id}`);
    }
  };

  return (
    <>
      <div className="subnavbar--dashboard">
        <SubNavbar />
      </div>

      <div className="container--dashboard">

        <div className="dashboard--dashboard">
          {mesas.map((mesa) => (
            <div
              key={mesa._id}
              className={`mesa--dashboard ${mesa.estado}--dashboard`}
              onClick={() => handleMesaClick(mesa)}
            >
              <p className="mesa-number--dashboard">{mesa.numero}</p>
            </div>
          ))}
        </div>
      </div>
      {mostrarModalConfirmacion && (
        <ModalConfirmacion
          titulo={accionModal?.titulo}
          mensaje={accionModal?.mensaje}
          placeholder={accionModal?.placeholder}
          onConfirm={(valor) => {
            accionModal?.onConfirm(valor);
          }}
          onClose={() => setMostrarModalConfirmacion(false)}
        />
      )}
    </>
  );
};

export default Dashboard;
