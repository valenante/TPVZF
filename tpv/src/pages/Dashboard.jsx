import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/Dashboard.css";
import SubNavbar from "../components/Subnavbar/Subnavbar";
import io from "socket.io-client";

// Conectar al servidor de Socket.io
const socket = io(process.env.REACT_APP_SOCKET_URL);

const Dashboard = () => {
  const [mesas, setMesas] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Detecta si la pantalla es pequeña
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const socketRef = useRef(null); // Referencia al socket

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

  // Escuchar evento nuevoPedido y recargar pedidos de platos
  useEffect(() => {
    socket.on('mesaAbierta', () => {
      fetchMesas(); // Recargar las mesas
    });

    // Cleanup del evento para evitar duplicados
    return () => {
      socket.off('mesaAbierta');
    };
  }, []);

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
