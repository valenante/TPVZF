import React, { useState } from 'react';
import api from '../../utils/api';

const PedidosFinalizados = ({ onClose }) => {
  const [pedidosFinalizados, setPedidosFinalizados] = useState([]);
  console.log(pedidosFinalizados);

  const cargarPedidosFinalizados = async () => {
    try {
      const response = await api.get('/pedidos/finalizados/finalizados');
      console.log('Pedidos finalizados:', response.data);
      setPedidosFinalizados(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos finalizados:', error);
    }
  };

  // Cargar pedidos finalizados al montar el componente
  React.useEffect(() => {
    cargarPedidosFinalizados();
  }, []);

  return (
    <div className="pedidos-finalizados">
      <h2>Pedidos Finalizados (últimos 20m)</h2>
      <button onClick={onClose}>Cerrar</button>
      {pedidosFinalizados.length === 0 ? (
        <p>No hay pedidos finalizados en los últimos 20 minutos</p>
      ) : (
        pedidosFinalizados.map((pedido) => (
          <div key={pedido._id} className="pedido-finalizado">
            <h3>Mesa: {pedido.mesa.numero}</h3>
            <p>Comensales: {pedido.comensales}</p>
            <h4>Productos:</h4>
            <ul>
              {pedido.productos.map((producto) => (
                <li key={producto._id}>
                  {producto.cantidad}x {producto.producto?.nombre || "Producto no disponible"}
                </li>
              ))}
            </ul>
            <p><strong>Total:</strong> {pedido.total.toFixed(2)} €</p>
          </div>
        ))
      )}
    </div>
  );
};

export default PedidosFinalizados;
