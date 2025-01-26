import React, { useEffect, useState } from "react";
import api from "../../utils/api"; // Importa la configuración de axios

const MesasCerradas = () => {
  const [mesas, setMesas] = useState([]);
  const [error, setError] = useState(null);

  // Función para obtener las mesas cerradas desde el backend
  useEffect(() => {
    const fetchMesasCerradas = async () => {
      try {
        // Llamada a la API usando api.get
        const response = await api.get("/mesas/mesas-cerradas/mesas-cerradas");
        setMesas(response.data); // Establece las mesas cerradas en el estado
      } catch (error) {
        console.error("Error al obtener las mesas cerradas:", error);
        setError("Error al obtener las mesas cerradas.");
      }
    };

    fetchMesasCerradas();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Mesas Cerradas</h1>
      {mesas.length === 0 ? (
        <p>No hay mesas cerradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Hora de Apertura</th>
              <th>Hora de Cierre</th>
              <th>Total (€)</th>
              <th>Método de Pago</th>
              <th>Productos</th>
            </tr>
          </thead>
          <tbody>
            {mesas.map((mesa) => (
              <tr key={mesa._id}>
                <td>{mesa.numero}</td>
                <td>{new Date(mesa.inicio).toLocaleTimeString()}</td>
                <td>{new Date(mesa.cierre).toLocaleTimeString()}</td>
                <td>{mesa.total.toFixed(2)} €</td>
                <td>
                  {mesa.metodoPago.efectivo > 0 && `Efectivo: ${mesa.metodoPago.efectivo} €`}
                  {mesa.metodoPago.tarjeta > 0 && ` | Tarjeta: ${mesa.metodoPago.tarjeta} €`}
                </td>
                <td>
                  {mesa.pedidos.map((pedido) => (
                    <div key={pedido._id}>
                      <strong>Pedido:</strong>
                      {pedido.productos.map((producto, index) => (
                        <div key={producto._id || index}>
                          - {producto.producto.nombre}: x{producto.cantidad}, {producto.total.toFixed(2)} €
                        </div>
                      ))}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MesasCerradas;
