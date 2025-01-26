import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/Dashboard.css";
import SubNavbar from "../components/Subnavbar/Subnavbar";
import io from "socket.io-client";

const Dashboard = () => {
  const [mesas, setMesas] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Detecta si la pantalla es pequeña
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const socketRef = useRef(null); // Referencia al socket

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const { data } = await api.get("/mesas");
        setMesas(data);
      } catch (error) {
        console.error("Error al obtener las mesas:", error);
      }
    };

    fetchMesas();

    // Inicializar el socket si no está creado
    if (!socketRef.current) {
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL, {
        transports: ["websocket"],
      });

      // Escuchar eventos de Socket.IO
      socketRef.current.on("mesa-abierta", (mesaActualizada) => {
        setMesas((prevMesas) =>
          prevMesas.map((mesa) =>
            mesa._id === mesaActualizada._id
              ? { ...mesa, estado: mesaActualizada.estado }
              : mesa
          )
        );
      });
    }

    // Actualiza el estado si la ventana cambia de tamaño
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);

    // Limpiar la conexión cuando el componente se desmonte
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
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
