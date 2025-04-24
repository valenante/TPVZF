import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/Dashboard.css";
import SubNavbar from "../components/Subnavbar/Subnavbar";
import { SocketContext } from "../utils/socket";

const Dashboard = () => {
  const [mesas, setMesas] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Detecta si la pantalla es pequeña
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext); // Obtener el socket del contexto

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
      console.log("Evento 'mesaAbierta' recibido");
      fetchMesas();
    };

    socket.on('mesaAbierta', manejarMesaAbierta);

    return () => {
      socket.off('mesaAbierta', manejarMesaAbierta);
    };
  }, [socket]);

  const handleMesaClick = (mesaId) => {
    navigate(`/mesas/${mesaId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const mesaEncontrada = mesas.find(
      (mesa) => mesa.numero.toString() === searchInput.trim()
    );

    if (mesaEncontrada) {
      handleMesaClick(mesaEncontrada._id);
    } else {
      alert("Mesa no encontrada");
    }
  };

  return (
    <>
      <div className="subnavbar--dashboard">
        <SubNavbar />
      </div>

      <div className="container--dashboard">
        {isMobile ? (
          <div className="search-container--dashboard">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="search-input--dashboard"
                placeholder="Número de mesa"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="search-button--dashboard">
                Buscar Mesa
              </button>
            </form>
          </div>
        ) : (
          <div className="dashboard--dashboard">
            {mesas.map((mesa) => (
              <div
                key={mesa._id}
                className={`mesa--dashboard ${mesa.estado}--dashboard`}
                onClick={() => handleMesaClick(mesa._id)}
              >
                <p className="mesa-number--dashboard">{mesa.numero}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
