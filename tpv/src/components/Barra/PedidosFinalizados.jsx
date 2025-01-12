import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import io from 'socket.io-client';

// Conectar al servidor de Socket.io
const socket = io('http://172.20.10.7:3000');

const PedidosFinalizados = ({ onClose }) => {
  const [pedidosFinalizados, setPedidosFinalizados] = useState([]);

  // Función para cargar pedidos finalizados de bebidas en los últimos 10 minutos
  const cargarPedidosFinalizados = async () => {
    try {
      const response = await api.get('/pedidos/finalizados/finalizados', {
        params: { tipo: 'bebida' }, // Solo bebidas
      });
      console.log('Pedidos finalizados (bebidas):', response.data);
      setPedidosFinalizados(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos finalizados:', error);
    }
  };

  useEffect(() => {
    cargarPedidosFinalizados();
  }, []);

  return (
    <div className="pedidos-finalizados-modal">
      <h2>Pedidos Finalizados - Últimos 10m</h2>
      <button onClick={onClose}>Cerrar</button>
      {pedidosFinalizados.length === 0 ? (
        <p>No hay pedidos finalizados en los últimos 10 minutos</p>
      ) : (
        pedidosFinalizados.map((pedido) => (
          <div key={pedido._id} className="pedido">
            <h3>Mesa: {pedido.mesa.numero}</h3>
            <p>Comensales: {pedido.comensales}</p>
            {pedido.alergias && <p><strong>Alergias:</strong> {pedido.alergias}</p>}
            <h4>Bebidas:</h4>
            <ul>
              {pedido.productos
                .filter((producto) => producto.tipo === 'bebida')
                .map((producto) => (
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