import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar `useNavigate`
import api from '../utils/api'; // Configuración de Axios
import '../styles/Dashboard.css'; // Estilos CSS

const Dashboard = () => {
  const [mesas, setMesas] = useState([]);
  const navigate = useNavigate(); // Hook para la navegación

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const { data } = await api.get('/mesas'); // Llamada al endpoint
        setMesas(data);
      } catch (error) {
        console.error('Error al obtener las mesas:', error);
      }
    };

    fetchMesas();
  }, []);

  const handleMesaClick = (mesaId) => {
    navigate(`/mesas/${mesaId}`); // Redirigir a la página de detalles
  };

  return (
    <div>
      <nav className="navbar">
        <button>Platos</button>
        <button>Bebidas</button>
        <button>Reservas</button>
      </nav>
      <div className="dashboard">
        {mesas.map((mesa) => (
          <div
            key={mesa._id}
            className={`mesa ${mesa.estado}`}
            onClick={() => handleMesaClick(mesa._id)} // Manejar el clic
          >
            <p>Mesa {mesa.numero}</p>
            <p>{mesa.estado}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
