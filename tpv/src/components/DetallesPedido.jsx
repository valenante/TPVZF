import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const DetallePedido = () => {
  const { id } = useParams(); // Obtener el ID del pedido desde la URL
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const { data } = await api.get(`/pedidos/${id}`); // Obtener detalles del pedido
        setPedido(data);
      } catch (error) {
        console.error('Error al obtener los detalles del pedido:', error);
      }
    };

    fetchPedido();
  }, [id]);

  if (!pedido) {
    return <p>Cargando detalles del pedido...</p>;
  }

  return (
    <div className="detalle-pedido">
      <h2>Detalles del Pedido</h2>
      <p>ID del Pedido: {pedido._id}</p>
      <p>Total: {pedido.total} €</p>
      <p>Estado: {pedido.estado}</p>
      <p>Productos:</p>
      <ul>
        {pedido.productos.map((producto, index) => (
            console.log(producto),
          <li key={index}>
            {producto.producto.nombre} - Cantidad: {producto.cantidad} - Total: {producto.total} €
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DetallePedido;
