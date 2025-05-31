import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SubNavbar from "../components/Subnavbar/Subnavbar";
import ModalConfirmacion from "../components/Modal/ModalConfirmacion";
import { SocketContext } from "../utils/socket";
import TPVVoice from "../components/TPVVoiceAssistant/TPVVoice";
import "../styles/Dashboard.css";

import { fetchMesas, abrirMesaConModal } from "../utils/mesaHandlers";

const Dashboard = () => {
  const [mesas, setMesas] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [accionModal, setAccionModal] = useState(null);

  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    fetchMesas(setMesas);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const actualizarMesas = () => fetchMesas(setMesas);
    socket.on("mesaAbierta", actualizarMesas);
    return () => socket.off("mesaAbierta", actualizarMesas);
  }, [socket]);

  const handleMesaClick = (mesa) => {
    mesa.estado === "cerrada"
      ? abrirMesaConModal(mesa, setAccionModal, setMesaSeleccionada, setMostrarModalConfirmacion, () => fetchMesas(setMesas), navigate)
      : navigate(`/mesas/${mesa._id}`);
  };

  return (
    <>
      <div className="subnavbar--dashboard"><SubNavbar /></div>

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
          onConfirm={(valor) => accionModal?.onConfirm(valor)}
          onClose={() => setMostrarModalConfirmacion(false)}
        />
      )}

      <TPVVoice />
    </>
  );
};

export default Dashboard;
