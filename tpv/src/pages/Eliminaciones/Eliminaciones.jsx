import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { format } from 'date-fns';
import './Eliminaciones.css';

const MostrarEliminaciones = () => {
  const [eliminaciones, setEliminaciones] = useState([]);
  const [error, setError] = useState(null);

  console.log(eliminaciones);

  useEffect(() => {
    const fetchEliminaciones = async () => {
      try {
        const response = await api.get('/eliminaciones', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setEliminaciones(response.data);
      }
      catch (error) {
        setError(error.message);
      }
    }

    fetchEliminaciones();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="eliminaciones--eliminaciones">
      <h1 className="titulo--eliminaciones">Registros de Eliminaciones</h1>
      <table className="tabla--eliminaciones">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Comensales</th>
            <th>Mesa</th>
            <th>Eliminado por</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {eliminaciones.map((eliminacion) => (
            <tr key={eliminacion._id} className="fila--eliminaciones">
              <td>{eliminacion.producto?.nombre || "N/A"}</td>
              <td>{eliminacion.pedido?.comensales || "N/A"}</td>
              <td>{eliminacion.mesa?.numero || "N/A"}</td>
              <td>{eliminacion.user?.name || "N/A"}</td>
              <td>{format(new Date(eliminacion.fecha), "HH:mm")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MostrarEliminaciones;
