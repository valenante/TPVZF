import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const DetalleMesa = () => {
  const { id } = useParams(); // Obtener el `id` de la mesa desde la URL
  const [mesa, setMesa] = useState(null);
  const [productosDetalles, setProductosDetalles] = useState({}); // Para guardar los detalles de productos
  useEffect(() => {
    const fetchMesa = async () => {
      try {
        const { data } = await api.get(`/mesas/${id}`); // Obtener detalles de la mesa
        setMesa(data);

        // Extraer IDs de productos únicos
        const productIds = data.pedidos
          .flatMap((pedido) => pedido.productos.map((producto) => producto.productoId))
          .filter((value, index, self) => self.indexOf(value) === index); // IDs únicos

        // Obtener detalles de los productos
        if (productIds.length > 0) {
          const { data: productosData } = await api.get(`/productos`, {
            params: { ids: productIds.join(',') },
          });

          // Crear un mapa para acceder fácilmente a los productos
          const productosMap = productosData.reduce((acc, producto) => {
            acc[producto._id] = producto;
            return acc;
          }, {});

          setProductosDetalles(productosMap);
        }
      } catch (error) {
        console.error('Error al obtener los detalles de la mesa:', error);
      }
    };

    fetchMesa();
  }, [id]);

  if (!mesa) {
    return <p>Cargando detalles de la mesa...</p>;
  }

  return (
    <div className="detalle-mesa">
      <h1>Mesa {mesa.numero}</h1>
      <p>Estado: {mesa.estado}</p>
      <p>Total Actual: {mesa.total} €</p>
      <p>Pedidos:</p>
      <ul>
        {mesa.pedidos.map((pedido) => (
          <li key={pedido._id}>
            <h3>Pedido </h3>
            <p>Comensales: {pedido.comensales}</p>
            <p>Alergias: {pedido.alergias || 'Sin especificar'}</p>
            <p>Productos:</p>
            <ul>
              {pedido.productos.map((producto) => {
                const detalle = productosDetalles[producto.producto];
                return (
                  <li key={producto.productoId}>
                    {detalle
                      ? `${detalle.nombre} - ${producto.cantidad} unidad(es)`
                      : 'Cargando producto...'}
                  </li>
                );
              })}
            </ul>
            <p>Total Pedido: {pedido.total.toFixed(2)} €</p>
          </li>
        ))}
      </ul>
      <button onClick={() => alert('Cerrar mesa en desarrollo')}>Cerrar Mesa</button>
    </div>
  );
};

export default DetalleMesa;
